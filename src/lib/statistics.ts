/**
 * Statistical functions for AB test analysis.
 * Two-proportion z-test for comparing conversion rates.
 */

export interface VariantData {
  sampleSize: number;
  conversions: number;
}

export interface StatResult {
  controlRate: number;
  variantRate: number;
  relativeLift: number;
  zScore: number;
  pValue: number;
  significant90: boolean;
  significant95: boolean;
  significant99: boolean;
  confidenceInterval: { lower: number; upper: number };
}

/** Standard normal CDF approximation (Abramowitz & Stegun) */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

/** Compute a two-proportion z-test between control and a variant */
export function computeSignificance(
  control: VariantData,
  variant: VariantData
): StatResult | null {
  if (
    control.sampleSize <= 0 ||
    variant.sampleSize <= 0 ||
    control.conversions < 0 ||
    variant.conversions < 0
  ) {
    return null;
  }

  const p1 = control.conversions / control.sampleSize;
  const p2 = variant.conversions / variant.sampleSize;

  // Pooled proportion
  const pPool =
    (control.conversions + variant.conversions) /
    (control.sampleSize + variant.sampleSize);

  // Standard error
  const se = Math.sqrt(
    pPool * (1 - pPool) * (1 / control.sampleSize + 1 / variant.sampleSize)
  );

  if (se === 0) {
    return {
      controlRate: p1,
      variantRate: p2,
      relativeLift: 0,
      zScore: 0,
      pValue: 1,
      significant90: false,
      significant95: false,
      significant99: false,
      confidenceInterval: { lower: 0, upper: 0 },
    };
  }

  const zScore = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Confidence interval for the difference (p2 - p1) at 95%
  const seDiff = Math.sqrt(
    (p1 * (1 - p1)) / control.sampleSize +
      (p2 * (1 - p2)) / variant.sampleSize
  );
  const z95 = 1.96;
  const diff = p2 - p1;
  const ciLower = diff - z95 * seDiff;
  const ciUpper = diff + z95 * seDiff;

  const relativeLift = p1 === 0 ? 0 : ((p2 - p1) / p1) * 100;

  return {
    controlRate: p1,
    variantRate: p2,
    relativeLift,
    zScore,
    pValue,
    significant90: pValue < 0.1,
    significant95: pValue < 0.05,
    significant99: pValue < 0.01,
    confidenceInterval: { lower: ciLower, upper: ciUpper },
  };
}

/** Format a rate as a percentage string */
export function formatRate(rate: number): string {
  return (rate * 100).toFixed(2) + '%';
}

/** Format p-value for display */
export function formatPValue(pValue: number): string {
  if (pValue < 0.001) return '< 0.001';
  return pValue.toFixed(4);
}
