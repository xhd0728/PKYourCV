import { prisma } from "@/lib/prisma";

const bootstrapStatements = [
  `CREATE TABLE IF NOT EXISTS "LeaderboardEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nickname" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "hireabilityScore" INTEGER NOT NULL,
    "chaosScore" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "fatalFlaw" TEXT NOT NULL,
    "roastCopy" TEXT NOT NULL,
    "shareLine" TEXT NOT NULL,
    "fixesJson" TEXT NOT NULL,
    "scoreBreakdownJson" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `DELETE FROM "LeaderboardEntry" AS "stale"
    WHERE "stale"."id" <> (
      SELECT "fresh"."id"
      FROM "LeaderboardEntry" AS "fresh"
      WHERE "fresh"."nickname" = "stale"."nickname"
      ORDER BY "fresh"."createdAt" DESC, "fresh"."id" DESC
      LIMIT 1
    )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "LeaderboardEntry_nickname_key"
    ON "LeaderboardEntry"("nickname")`,
  `CREATE INDEX IF NOT EXISTS "LeaderboardEntry_hireabilityScore_chaosScore_createdAt_idx"
    ON "LeaderboardEntry"("hireabilityScore" DESC, "chaosScore", "createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "LeaderboardEntry_chaosScore_hireabilityScore_createdAt_idx"
    ON "LeaderboardEntry"("chaosScore" DESC, "hireabilityScore", "createdAt" DESC)`,
  `CREATE INDEX IF NOT EXISTS "LeaderboardEntry_sourceType_createdAt_idx"
    ON "LeaderboardEntry"("sourceType", "createdAt" DESC)`,
];

let databaseReadyPromise: Promise<void> | null = null;

export async function ensureDatabaseSchema() {
  if (!databaseReadyPromise) {
    databaseReadyPromise = (async () => {
      for (const statement of bootstrapStatements) {
        await prisma.$executeRawUnsafe(statement);
      }
    })();
  }

  return databaseReadyPromise;
}
