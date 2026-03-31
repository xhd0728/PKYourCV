import { SourceType as PrismaSourceType, type LeaderboardEntry as PrismaLeaderboardEntry } from "@prisma/client";

import { ensureDatabaseSchema } from "@/lib/database";
import { prisma } from "@/lib/prisma";
import type { BoardType, CandidateAnalysis, LeaderboardEntry, LeaderboardResponse, SourceType } from "@/lib/types";
import { safeJsonParse } from "@/lib/utils";

const SOURCE_MAP: Record<SourceType, PrismaSourceType> = {
  pdf: PrismaSourceType.PDF,
  url: PrismaSourceType.URL,
};

function toPublicSourceType(value: PrismaSourceType): SourceType {
  return value === PrismaSourceType.URL ? "url" : "pdf";
}

function serializeEntry(row: PrismaLeaderboardEntry): LeaderboardEntry {
  return {
    id: row.id,
    nickname: row.nickname,
    source_type: toPublicSourceType(row.sourceType),
    hireability_score: row.hireabilityScore,
    chaos_score: row.chaosScore,
    summary: row.summary,
    fatal_flaw: row.fatalFlaw,
    fixes: safeJsonParse<[string, string, string]>(row.fixesJson),
    roast_copy: row.roastCopy,
    share_line: row.shareLine,
    score_breakdown: safeJsonParse(row.scoreBreakdownJson),
    created_at: row.createdAt.toISOString(),
  };
}

export function sortLeaderboardEntries(
  entries: LeaderboardEntry[],
  board: BoardType,
): LeaderboardEntry[] {
  return [...entries].sort((left, right) => {
    if (board === "hireable") {
      return (
        right.hireability_score - left.hireability_score ||
        left.chaos_score - right.chaos_score ||
        right.id - left.id
      );
    }

    return (
      right.chaos_score - left.chaos_score ||
      left.hireability_score - right.hireability_score ||
      right.id - left.id
    );
  });
}

export async function saveLeaderboardEntry(input: {
  analysis: CandidateAnalysis;
  source_hash: string;
}): Promise<LeaderboardEntry> {
  await ensureDatabaseSchema();

  const row = await prisma.leaderboardEntry.create({
    data: {
      nickname: input.analysis.nickname,
      sourceType: SOURCE_MAP[input.analysis.source_type],
      sourceHash: input.source_hash,
      hireabilityScore: input.analysis.hireability_score,
      chaosScore: input.analysis.chaos_score,
      summary: input.analysis.summary,
      fatalFlaw: input.analysis.fatal_flaw,
      roastCopy: input.analysis.roast_copy,
      shareLine: input.analysis.share_line,
      fixesJson: JSON.stringify(input.analysis.fixes),
      scoreBreakdownJson: JSON.stringify(input.analysis.score_breakdown),
    },
  });

  return serializeEntry(row);
}

export async function getLeaderboard(input: {
  board: BoardType;
  source_type: SourceType | "all";
  page: number;
  page_size: number;
}): Promise<LeaderboardResponse> {
  await ensureDatabaseSchema();

  const where =
    input.source_type === "all"
      ? undefined
      : {
          sourceType: SOURCE_MAP[input.source_type],
        };

  const [rows, total] = await Promise.all([
    prisma.leaderboardEntry.findMany({
      where,
      orderBy:
        input.board === "hireable"
          ? [
              { hireabilityScore: "desc" },
              { chaosScore: "asc" },
              { createdAt: "desc" },
            ]
          : [
              { chaosScore: "desc" },
              { hireabilityScore: "asc" },
              { createdAt: "desc" },
            ],
      skip: (input.page - 1) * input.page_size,
      take: input.page_size,
    }),
    prisma.leaderboardEntry.count({ where }),
  ]);

  return {
    board: input.board,
    source_type: input.source_type,
    page: input.page,
    page_size: input.page_size,
    total,
    entries: rows.map(serializeEntry),
  };
}
