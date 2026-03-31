import * as cheerio from "cheerio";

import type { IngestedSource } from "@/lib/types";
import { AppError, createContentHash, normalizeWhitespace, truncate } from "@/lib/utils";

import { assertPublicUrl } from "./security";

const MAX_REDIRECTS = 3;
const MAX_PAGE_BYTES = 300_000;
const MAX_FOLLOW_PAGES = 2;
const MIN_EXTRACTED_CHARS = 280;
const MAX_EXTRACTED_CHARS = 12_000;

const FOLLOW_KEYWORDS =
  /\b(about|resume|cv|project|projects|work|experience|portfolio|bio|case-study)\b/i;

type Fetcher = typeof fetch;

async function readResponseText(response: Response, limit: number): Promise<string> {
  if (!response.body) {
    const text = await response.text();

    if (Buffer.byteLength(text) > limit) {
      throw new AppError("网页太胖了，MVP 先不伺候这种重量级选手。", 413);
    }

    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    total += value.byteLength;

    if (total > limit) {
      throw new AppError("网页内容超限，建议改传 PDF 简历。", 413);
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  return text;
}

async function fetchPublicPage(
  url: URL,
  fetcher: Fetcher,
  redirectsLeft = MAX_REDIRECTS,
): Promise<{ final_url: URL; body: string; content_type: string }> {
  const response = await fetcher(url, {
    headers: {
      "user-agent":
        "PKYourCVBot/1.0 (+https://github.com/meisen/PKYourCV) text-extraction-only",
      accept: "text/html, text/plain;q=0.9, application/xhtml+xml;q=0.8",
    },
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });

  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (redirectsLeft <= 0) {
      throw new AppError("这个主页跳转得比候选人转行还勤，先不分析了。", 400);
    }

    const location = response.headers.get("location");

    if (!location) {
      throw new AppError("目标站点给了个坏掉的跳转。", 400);
    }

    const nextUrl = await assertPublicUrl(new URL(location, url).toString());
    return fetchPublicPage(nextUrl, fetcher, redirectsLeft - 1);
  }

  if (!response.ok) {
    throw new AppError(`网页抓取失败，站点回了 ${response.status}。`, 400);
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new AppError("这个 URL 不是正常网页，建议直接上传 PDF。", 400);
  }

  const contentLength = Number(response.headers.get("content-length") || "0");

  if (contentLength > MAX_PAGE_BYTES) {
    throw new AppError("网页内容太大，建议改传 PDF。", 413);
  }

  const body = await readResponseText(response, MAX_PAGE_BYTES);

  return {
    final_url: url,
    body,
    content_type: contentType,
  };
}

function extractCandidateLinks($: cheerio.CheerioAPI, baseUrl: URL): string[] {
  const links = new Set<string>();

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href || href.startsWith("#")) {
      return;
    }

    const label = normalizeWhitespace($(element).text());

    if (!FOLLOW_KEYWORDS.test(`${href} ${label}`)) {
      return;
    }

    const resolved = new URL(href, baseUrl);

    if (resolved.origin !== baseUrl.origin) {
      return;
    }

    if (!["http:", "https:"].includes(resolved.protocol)) {
      return;
    }

    links.add(resolved.toString());
  });

  return Array.from(links).slice(0, MAX_FOLLOW_PAGES);
}

function extractTextFromHtml(html: string, url: URL) {
  const $ = cheerio.load(html);
  const candidateLinks = extractCandidateLinks($, url);
  const title = normalizeWhitespace($("title").first().text());
  const description = normalizeWhitespace(
    $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "",
  );

  $("script, style, noscript, svg, footer, form, button").remove();

  const roots = ["main", "article", "[role='main']", ".content", ".container", "body"];
  let bestText = "";

  for (const selector of roots) {
    const candidate = normalizeWhitespace($(selector).first().text());

    if (candidate.length > bestText.length) {
      bestText = candidate;
    }
  }

  const chunks = [
    title ? `Title: ${title}` : "",
    description ? `Description: ${description}` : "",
    bestText,
  ].filter(Boolean);

  return {
    text: chunks.join("\n"),
    candidate_links: candidateLinks,
  };
}

export async function extractWebsiteSource(
  rawUrl: string,
  fetcher: Fetcher = fetch,
): Promise<IngestedSource> {
  const initialUrl = await assertPublicUrl(rawUrl);
  const visited = new Set<string>();
  const collected: string[] = [];
  const queue: string[] = [initialUrl.toString()];

  while (queue.length && collected.length <= MAX_FOLLOW_PAGES) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const publicUrl = await assertPublicUrl(current);
    const page = await fetchPublicPage(publicUrl, fetcher);

    if (page.content_type.includes("text/plain")) {
      const text = normalizeWhitespace(page.body);

      if (text) {
        collected.push(text);
      }

      continue;
    }

    const extracted = extractTextFromHtml(page.body, publicUrl);

    if (extracted.text) {
      collected.push(extracted.text);
    }

    for (const link of extracted.candidate_links) {
      if (!visited.has(link)) {
        queue.push(link);
      }
    }
  }

  const extractedText = truncate(
    normalizeWhitespace(collected.join("\n\n")),
    MAX_EXTRACTED_CHARS,
  );

  if (extractedText.length < MIN_EXTRACTED_CHARS) {
    throw new AppError("网页文字太少，火力不足。建议改传 PDF 简历。", 400);
  }

  return {
    source_type: "url",
    source_label: initialUrl.hostname,
    source_hash: createContentHash(extractedText),
    extracted_text: extractedText,
    preview_text: truncate(extractedText, 280),
  };
}
