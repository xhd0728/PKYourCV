import path from "node:path";

import { PrismaClient } from "@prisma/client";

function normalizeDatabaseUrl(rawUrl: string) {
  if (!rawUrl.startsWith("file:./")) {
    return rawUrl;
  }

  const relativePath = rawUrl.replace(/^file:\.\//, "");
  return `file:${path.join(/* turbopackIgnore: true */ process.cwd(), relativePath)}`;
}

process.env.DATABASE_URL = normalizeDatabaseUrl(
  process.env.DATABASE_URL ?? "file:./prisma/dev.db",
);

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
