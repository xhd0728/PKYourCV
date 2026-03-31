export type SourceType = "url" | "pdf";

export type BoardType = "hireable" | "chaos";

export type ScoreBreakdown = {
  clarity: number;
  impact: number;
  focus: number;
  craftsmanship: number;
  signal: number;
  chaos: number;
};

export type CandidateAnalysis = {
  nickname: string;
  source_type: SourceType;
  hireability_score: number;
  chaos_score: number;
  summary: string;
  fatal_flaw: string;
  fixes: [string, string, string];
  roast_copy: string;
  share_line: string;
  score_breakdown: ScoreBreakdown;
};

export type LeaderboardEntry = CandidateAnalysis & {
  id: number;
  created_at: string;
};

export type DuelSide = "left" | "right";

export type DuelResult = {
  left: CandidateAnalysis;
  right: CandidateAnalysis;
  winner: DuelSide;
  disaster: DuelSide;
  commentary: string;
  decision_summary: string;
};

export type IngestedSource = {
  source_type: SourceType;
  source_label: string;
  source_hash: string;
  extracted_text: string;
  preview_text: string;
};

export type LeaderboardResponse = {
  board: BoardType;
  source_type: SourceType | "all";
  page: number;
  page_size: number;
  total: number;
  entries: LeaderboardEntry[];
};
