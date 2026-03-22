'use client';

import { computeSignificance, formatRate, formatPValue } from '@/lib/statistics';

interface VariantInput {
  sampleSize: number;
  conversions: number;
  name: string;
}

interface SignificanceCalculatorProps {
  variants: VariantInput[];
}

export default function SignificanceCalculator({ variants }: SignificanceCalculatorProps) {
  if (variants.length < 2) {
    return (
      <p className="text-sm text-gray-500">
        At least two variants are needed for significance calculations.
      </p>
    );
  }

  const control = variants[0];
  const challengers = variants.slice(1);

  return (
    <div className="space-y-4">
      {challengers.map((variant, idx) => {
        const result = computeSignificance(
          { sampleSize: control.sampleSize, conversions: control.conversions },
          { sampleSize: variant.sampleSize, conversions: variant.conversions }
        );

        if (!result) {
          return (
            <div
              key={idx}
              className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500"
            >
              <p className="font-medium text-gray-700 mb-1">
                {control.name} vs {variant.name}
              </p>
              <p>Enter valid sample sizes and conversions to see results.</p>
            </div>
          );
        }

        const borderColor = result.significant95
          ? 'border-green-300 bg-green-50'
          : 'border-amber-300 bg-amber-50';

        return (
          <div key={idx} className={`rounded-lg border ${borderColor} p-4`}>
            <p className="font-semibold text-gray-800 mb-3">
              {control.name} vs {variant.name}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
              <div>
                <span className="text-gray-500 block text-xs">Control Rate</span>
                <span className="font-mono font-medium">{formatRate(result.controlRate)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Variant Rate</span>
                <span className="font-mono font-medium">{formatRate(result.variantRate)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Relative Lift</span>
                <span className="font-mono font-medium">
                  {result.relativeLift > 0 ? '+' : ''}
                  {result.relativeLift.toFixed(2)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">Z-Score</span>
                <span className="font-mono font-medium">{result.zScore.toFixed(4)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">P-Value</span>
                <span className="font-mono font-medium">{formatPValue(result.pValue)}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-xs">95% CI (diff)</span>
                <span className="font-mono font-medium text-xs">
                  [{(result.confidenceInterval.lower * 100).toFixed(2)}%,{' '}
                  {(result.confidenceInterval.upper * 100).toFixed(2)}%]
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge label="90%" active={result.significant90} />
              <Badge label="95%" active={result.significant95} />
              <Badge label="99%" active={result.significant99} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${
        active
          ? 'bg-green-200 text-green-800'
          : 'bg-gray-200 text-gray-500'
      }`}
    >
      {label} {active ? 'Significant' : 'Not Sig.'}
    </span>
  );
}
