import { PDFParse } from "pdf-parse";

import { getAppConfig } from "@/lib/env";
import type { IngestedSource } from "@/lib/types";
import { AppError, createContentHash, normalizeWhitespace, truncate } from "@/lib/utils";

const MIN_EXTRACTED_CHARS = 280;
const MAX_EXTRACTED_CHARS = 12_000;

export async function extractPdfSource(file: File): Promise<IngestedSource> {
  const config = getAppConfig();
  const sizeLimit = config.MAX_UPLOAD_MB * 1024 * 1024;

  if (file.size > sizeLimit) {
    throw new AppError(`PDF 太大了，MVP 只接 ${config.MAX_UPLOAD_MB}MB 以内。`, 413);
  }

  if (
    file.type &&
    file.type !== "application/pdf" &&
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    throw new AppError("只支持 PDF，别拿 Word 假装简历。", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    const extractedText = truncate(normalizeWhitespace(result.text || ""), MAX_EXTRACTED_CHARS);

    if (extractedText.length < MIN_EXTRACTED_CHARS) {
      throw new AppError("PDF 抽出来的文字太少，像是把履历藏起来了。", 400);
    }

    return {
      source_type: "pdf",
      source_label: file.name || "resume.pdf",
      source_hash: createContentHash(extractedText),
      extracted_text: extractedText,
      preview_text: truncate(extractedText, 280),
    };
  } finally {
    await parser.destroy();
  }
}
