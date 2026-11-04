/**
 * Statistical disclosure control of the public outputs. The SQL functions apply
 * k >= 5 per cell; rounding to base 5 then stops a suppressed cell from being
 * read off a difference (respondents minus published cells), and stops the
 * answers of one new respondent from being read off two successive readings.
 */
export const ROUNDING_BASE = 5;

export const roundCount = (count: number): number =>
  Math.round(count / ROUNDING_BASE) * ROUNDING_BASE;

export function roundDistribution(distribution: unknown): Record<string, number> {
  const rounded: Record<string, number> = {};
  if (typeof distribution !== 'object' || distribution === null) return rounded;
  for (const [cell, count] of Object.entries(distribution)) {
    const value = Number(count);
    if (Number.isFinite(value)) rounded[cell] = roundCount(value);
  }
  return rounded;
}
