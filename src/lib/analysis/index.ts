import {
  analysisDraftSchema,
  analysisDraftShape,
  buildAnalysisMessages,
  buildDuelMessages,
  buildRoastMessages,
  duelCopyShape,
  duelCopySchema,
  roastShape,
  roastSchema,
} from "@/lib/model/prompts";
import { requestStructuredCompletion, type ChatResponder } from "@/lib/model/client";
import type {
  CandidateAnalysis,
  DuelResult,
  DuelSide,
  IngestedSource,
  ScoreBreakdown,
} from "@/lib/types";
import { average, clampScore, normalizeWhitespace, sanitizeNickname, truncate } from "@/lib/utils";

export function normalizeScoreBreakdown(breakdown: ScoreBreakdown): ScoreBreakdown {
  return {
    clarity: clampScore(breakdown.clarity),
    impact: clampScore(breakdown.impact),
    focus: clampScore(breakdown.focus),
    craftsmanship: clampScore(breakdown.craftsmanship),
    signal: clampScore(breakdown.signal),
    chaos: clampScore(breakdown.chaos),
  };
}

export function calculateHireabilityScore(breakdown: ScoreBreakdown): number {
  return clampScore(
    average([
      breakdown.clarity,
      breakdown.impact,
      breakdown.focus,
      breakdown.craftsmanship,
      breakdown.signal,
    ]),
  );
}

export function calculateChaosScore(breakdown: ScoreBreakdown): number {
  return clampScore(breakdown.chaos);
}

export function calculateDisasterIndex(analysis: CandidateAnalysis): number {
  return clampScore(analysis.chaos_score * 0.65 + (100 - analysis.hireability_score) * 0.35);
}

function compareWinner(left: CandidateAnalysis, right: CandidateAnalysis): DuelSide {
  if (left.hireability_score !== right.hireability_score) {
    return left.hireability_score > right.hireability_score ? "left" : "right";
  }

  if (left.chaos_score !== right.chaos_score) {
    return left.chaos_score < right.chaos_score ? "left" : "right";
  }

  if (left.score_breakdown.signal !== right.score_breakdown.signal) {
    return left.score_breakdown.signal > right.score_breakdown.signal ? "left" : "right";
  }

  return "left";
}

export async function runCandidateAnalysis(input: {
  nickname: string;
  source: IngestedSource;
  responder?: ChatResponder;
}): Promise<CandidateAnalysis> {
  const draft = await requestStructuredCompletion({
    schema: analysisDraftSchema,
    schema_label: "候选人分析",
    messages: buildAnalysisMessages(input),
    responder: input.responder,
    repair_hint: analysisDraftShape,
    temperature: 0.2,
    max_tokens: 800,
    retries: 1,
  });

  const scoreBreakdown = normalizeScoreBreakdown(draft.score_breakdown);
  const baseAnalysis = {
    nickname: sanitizeNickname(input.nickname),
    source_type: input.source.source_type,
    hireability_score: calculateHireabilityScore(scoreBreakdown),
    chaos_score: calculateChaosScore(scoreBreakdown),
    summary: truncate(normalizeWhitespace(draft.summary), 180),
    fatal_flaw: truncate(normalizeWhitespace(draft.fatal_flaw), 180),
    fixes: draft.fixes
      .map((item) => truncate(normalizeWhitespace(item), 160)) as [string, string, string],
    score_breakdown: scoreBreakdown,
  };

  const roast = await requestStructuredCompletion({
    schema: roastSchema,
    schema_label: "毒舌文案",
    messages: buildRoastMessages({
      nickname: baseAnalysis.nickname,
      analysis: baseAnalysis,
    }),
    responder: input.responder,
    repair_hint: roastShape,
    temperature: 0.7,
    max_tokens: 700,
    retries: 1,
  });

  return {
    ...baseAnalysis,
    roast_copy: truncate(normalizeWhitespace(roast.roast_copy), 700),
    share_line: truncate(normalizeWhitespace(roast.share_line), 180),
  };
}

export async function runDuel(input: {
  left: CandidateAnalysis;
  right: CandidateAnalysis;
  responder?: ChatResponder;
}): Promise<DuelResult> {
  const winner = compareWinner(input.left, input.right);
  const disaster = winner === "left" ? "right" : "left";
  const leftDisasterIndex = calculateDisasterIndex(input.left);
  const rightDisasterIndex = calculateDisasterIndex(input.right);

  const duelCopy = await requestStructuredCompletion({
    schema: duelCopySchema,
    schema_label: "对战解说",
    messages: buildDuelMessages({
      left: input.left,
      right: input.right,
      winner,
      disaster,
      left_disaster_index: leftDisasterIndex,
      right_disaster_index: rightDisasterIndex,
    }),
    responder: input.responder,
    repair_hint: duelCopyShape,
    temperature: 0.8,
    max_tokens: 800,
    retries: 1,
  });

  return {
    left: input.left,
    right: input.right,
    winner,
    disaster,
    commentary: truncate(normalizeWhitespace(duelCopy.commentary), 900),
    decision_summary: truncate(normalizeWhitespace(duelCopy.decision_summary), 220),
  };
}
