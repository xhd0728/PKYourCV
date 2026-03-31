import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { AppError } from "@/lib/utils";

type DnsLookup = typeof lookup;

function isDisallowedHostname(hostname: string): boolean {
  const lowered = hostname.toLowerCase();

  return (
    lowered === "localhost" ||
    lowered.endsWith(".localhost") ||
    lowered.endsWith(".internal") ||
    lowered.endsWith(".local")
  );
}

export function isPrivateIpAddress(address: string): boolean {
  const version = isIP(address);

  if (version === 4) {
    const [first, second] = address.split(".").map(Number);

    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }

  if (version === 6) {
    const lowered = address.toLowerCase();

    return (
      lowered === "::1" ||
      lowered.startsWith("fc") ||
      lowered.startsWith("fd") ||
      lowered.startsWith("fe80") ||
      lowered.startsWith("::ffff:127.")
    );
  }

  return false;
}

export async function assertPublicUrl(
  rawUrl: string,
  dnsLookup: DnsLookup = lookup,
): Promise<URL> {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new AppError("URL 格式不对，连嘲笑都找不到入口。", 400);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new AppError("只允许 http/https，别拿奇怪协议来整活。", 400);
  }

  if (parsed.username || parsed.password) {
    throw new AppError("URL 里别塞鉴权信息，这里不是你的内网跳板。", 400);
  }

  if (isDisallowedHostname(parsed.hostname)) {
    throw new AppError("不允许访问 localhost 或内网域名。", 400);
  }

  if (isIP(parsed.hostname) && isPrivateIpAddress(parsed.hostname)) {
    throw new AppError("不允许访问私网 IP。", 400);
  }

  const addresses = await dnsLookup(parsed.hostname, { all: true, verbatim: true }).catch(() => {
    throw new AppError("这个域名解析失败，像是简历一样站不住脚。", 400);
  });

  if (!addresses.length) {
    throw new AppError("域名没有解析到公网地址。", 400);
  }

  for (const record of addresses) {
    if (isPrivateIpAddress(record.address)) {
      throw new AppError("目标地址落到了私网，已经拦下。", 400);
    }
  }

  return parsed;
}
