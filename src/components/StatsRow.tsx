'use client';

import { computeSignificance } from '@/lib/statistics';

interface Variant {
  id: string;
  testId: string;
  name: string;
  sampleSize: number;
  conversions: number;
  screenshots?: string;
  sortOrder: number;
}

interface ABTest {
  id: string;
  title: string;
  month: number;
  year: number;
  status: string;
  hypothesis?: string | null;
  serviceCategory: string;
  channel: string;
  primaryMetric: string;
  notes?: string | null;
  winner?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  variants: Variant[];
}

interface StatsRowProps {
  tests: ABTest[];
}

export default function StatsRow({ tests }: StatsRowProps) {
  const completedTests = tests.filter((t) => t.status === 'completed');
  const totalTests = completedTests.length;

  // Calculate win rate: tests where a winner is declared (not null, not empty, not 'inconclusive')
  const testsWithWinner = completedTests.filter(
    (t) => t.winner && t.winner !== '' && t.winner !== 'inconclusive'
  );
  const winRate = totalTests > 0 ? (testsWithWinner.length / totalTests) * 100 : 0;

  // Calculate average lift and significance percentage
  let totalLift = 0;
  let liftCount = 0;
  let significantCount = 0;

  for (const test of completedTests) {
    if (test.variants.length >= 2) {
      const control = test.variants[0];
      const variant = test.variants[1];
      const result = computeSignificance(
        { sampleSize: control.sampleSize, conversions: control.conversions },
        { sampleSize: variant.sampleSize, conversions: variant.conversions }
      );
      if (result) {
        if (result.significant95) {
          significantCount++;
        }
        if (result.relativeLift !== 0) {
          totalLift += result.relativeLift;
          liftCount++;
        }
      }
    }
  }

  const avgLift = liftCount > 0 ? totalLift / liftCount : 0;
  const significantPct = totalTests > 0 ? (significantCount / totalTests) * 100 : 0;

  const stats = [
    { label: 'Total Tests', value: totalTests.toString() },
    { label: 'Win Rate', value: `${winRate.toFixed(1)}%` },
    { label: 'Avg Lift', value: `${avgLift.toFixed(1)}%` },
    { label: '% Significant', value: `${significantPct.toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-lg border border-gray-200 p-5 text-center"
        >
          <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
          <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
