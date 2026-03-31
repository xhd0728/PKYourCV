const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const normalizedBasePath =
  configuredBasePath && configuredBasePath !== "/"
    ? configuredBasePath.replace(/\/+$/g, "")
    : "";

export function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!normalizedBasePath) {
    return normalizedPath;
  }

  return `${normalizedBasePath}${normalizedPath}`;
}
