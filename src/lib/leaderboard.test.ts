import { sortLeaderboardEntries } from "@/lib/leaderboard";
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
