import {
  calculateChaosScore,
  calculateHireabilityScore,
  normalizeScoreBreakdown,
} from "@/lib/analysis";

describe("analysis scoring", () => {
  it("clamps breakdown scores into the expected range", () => {
    const normalized = normalizeScoreBreakdown({
      clarity: 123,
      impact: 68.4,
      focus: -10,
      craftsmanship: 81,
      signal: 47,
      chaos: 201,
    });

    expect(normalized).toEqual({
      clarity: 100,
      impact: 68,
      focus: 0,
      craftsmanship: 81,
      signal: 47,
      chaos: 100,
    });
  });

  it("derives overall scores from the normalized breakdown", () => {
    const breakdown = {
      clarity: 90,
      impact: 70,
      focus: 80,
      craftsmanship: 60,
      signal: 50,
      chaos: 35,
    };

    expect(calculateHireabilityScore(breakdown)).toBe(70);
    expect(calculateChaosScore(breakdown)).toBe(35);
  });
});
