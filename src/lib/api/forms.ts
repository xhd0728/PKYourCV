import { AppError, sanitizeNickname } from "@/lib/utils";

function readString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalPdf(formData: FormData, key: string): File | null {
  const value = formData.get(key);

  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  return value;
}

function assertExclusiveSource(url: string, pdf: File | null, label: string) {
  if (!url && !pdf) {
    throw new AppError(`${label} needs either a URL or a PDF.`, 400);
  }

  if (url && pdf) {
    throw new AppError(`${label} accepts either a URL or a PDF, not both.`, 400);
  }
}

export function parseAnalyzeFormData(formData: FormData) {
  const nickname = sanitizeNickname(readString(formData, "nickname"));
  const url = readString(formData, "url");
  const pdf = readOptionalPdf(formData, "pdf");

  assertExclusiveSource(url, pdf, "Analyze");

  return {
    nickname,
    url: url || null,
    pdf,
  };
}

export function parseDuelFormData(formData: FormData) {
  const leftNickname = sanitizeNickname(readString(formData, "left_nickname"));
  const rightNickname = sanitizeNickname(readString(formData, "right_nickname"));
  const leftUrl = readString(formData, "left_url");
  const rightUrl = readString(formData, "right_url");
  const leftPdf = readOptionalPdf(formData, "left_pdf");
  const rightPdf = readOptionalPdf(formData, "right_pdf");

  assertExclusiveSource(leftUrl, leftPdf, "Left contender");
  assertExclusiveSource(rightUrl, rightPdf, "Right contender");

  return {
    left: {
      nickname: leftNickname,
      url: leftUrl || null,
      pdf: leftPdf,
    },
    right: {
      nickname: rightNickname,
      url: rightUrl || null,
      pdf: rightPdf,
    },
  };
}
