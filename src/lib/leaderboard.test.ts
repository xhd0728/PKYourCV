import { SourceType as PrismaSourceType } from "@prisma/client";

vi.mock("@/lib/database", () => ({
  ensureDatabaseSchema: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    leaderboardEntry: {
      upsert: vi.fn(),
    },
  },
}));

import { saveLeaderboardEntry, sortLeaderboardEntries } from "@/lib/leaderboard";
import { prisma } from "@/lib/prisma";
import type { LeaderboardEntry } from "@/lib/types";

const sampleEntries: LeaderboardEntry[] = [
  {
    id: 1,
    nickname: "A",
    source_type: "url",
    hireability_score: 88,
    chaos_score: 30,
    summary: "A",
    fatal_flaw: "A",
    fixes: ["1", "2", "3"],
    roast_copy: "A",
    share_line: "A",
    score_breakdown: {
      clarity: 88,
      impact: 88,
      focus: 88,
      craftsmanship: 88,
      signal: 88,
      chaos: 30,
    },
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 2,
    nickname: "B",
    source_type: "pdf",
    hireability_score: 91,
    chaos_score: 44,
    summary: "B",
    fatal_flaw: "B",
    fixes: ["1", "2", "3"],
    roast_copy: "B",
    share_line: "B",
    score_breakdown: {
      clarity: 91,
      impact: 91,
      focus: 91,
      craftsmanship: 91,
      signal: 91,
      chaos: 44,
    },
    created_at: "2026-01-01T00:00:00.000Z",
  },
  {
    id: 3,
    nickname: "C",
    source_type: "url",
    hireability_score: 55,
    chaos_score: 92,
    summary: "C",
    fatal_flaw: "C",
    fixes: ["1", "2", "3"],
    roast_copy: "C",
    share_line: "C",
    score_breakdown: {
      clarity: 55,
      impact: 55,
      focus: 55,
      craftsmanship: 55,
      signal: 55,
      chaos: 92,
    },
    created_at: "2026-01-01T00:00:00.000Z",
  },
];

describe("sortLeaderboardEntries", () => {
  it("sorts the hireable board by score descending then chaos ascending", () => {
    expect(sortLeaderboardEntries(sampleEntries, "hireable").map((entry) => entry.id)).toEqual([
      2, 1, 3,
    ]);
  });

  it("sorts the chaos board by chaos descending then hireability ascending", () => {
    expect(sortLeaderboardEntries(sampleEntries, "chaos").map((entry) => entry.id)).toEqual([
      3, 2, 1,
    ]);
  });
});

describe("saveLeaderboardEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-31T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("upserts by nickname and refreshes the stored timestamp", async () => {
    vi.mocked(prisma.leaderboardEntry.upsert).mockResolvedValue({
      id: 7,
      nickname: "海东",
      sourceType: PrismaSourceType.URL,
      sourceHash: "next-hash",
      hireabilityScore: 93,
      chaosScore: 18,
      summary: "强信号很硬。",
      fatalFlaw: "没有致命硬伤，主要问题是项目归因还能更直给。",
      roastCopy: "这不是简历，是有点嚣张的战绩墙。",
      shareLine: "信号很硬，废话还能更少。",
      fixesJson: JSON.stringify(["改排序", "补归因", "压废话"]),
      scoreBreakdownJson: JSON.stringify({
        clarity: 85,
        impact: 95,
        focus: 88,
        craftsmanship: 80,
        signal: 94,
        chaos: 18,
      }),
      createdAt: new Date("2026-03-31T12:00:00.000Z"),
    });

    const result = await saveLeaderboardEntry({
      source_hash: "next-hash",
      analysis: {
        nickname: "海东",
        source_type: "url",
        hireability_score: 93,
        chaos_score: 18,
        summary: "强信号很硬。",
        fatal_flaw: "没有致命硬伤，主要问题是项目归因还能更直给。",
        fixes: ["改排序", "补归因", "压废话"],
        roast_copy: "这不是简历，是有点嚣张的战绩墙。",
        share_line: "信号很硬，废话还能更少。",
        score_breakdown: {
          clarity: 85,
          impact: 95,
          focus: 88,
          craftsmanship: 80,
          signal: 94,
          chaos: 18,
        },
      },
    });

    expect(prisma.leaderboardEntry.upsert).toHaveBeenCalledWith({
      where: {
        nickname: "海东",
      },
      update: expect.objectContaining({
        sourceType: PrismaSourceType.URL,
        sourceHash: "next-hash",
        createdAt: new Date("2026-03-31T12:00:00.000Z"),
      }),
      create: expect.objectContaining({
        nickname: "海东",
        sourceType: PrismaSourceType.URL,
        sourceHash: "next-hash",
        createdAt: new Date("2026-03-31T12:00:00.000Z"),
      }),
    });

    expect(result).toMatchObject({
      id: 7,
      nickname: "海东",
      source_type: "url",
      hireability_score: 93,
      chaos_score: 18,
    });
  });
});
