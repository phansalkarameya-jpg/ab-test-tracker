'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { computeSignificance, formatRate, formatPValue } from '@/lib/statistics';
import VariantComparison from '@/components/VariantComparison';

interface Variant {
  id: string;
  testId: string;
  name: string;
  sampleSize: number;
  conversions: number;
  screenshots: string;
  sortOrder: number;
}

interface ABTest {
  id: string;
  title: string;
  month: number;
  year: number;
  status: string;
  hypothesis: string | null;
  channel: string;
  primaryMetric: string;
  notes: string | null;
  winner: string | null;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
}

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function winnerLabel(winner: string | null, variants: Variant[]): string {
  if (!winner || winner === 'inconclusive') return 'Inconclusive';
  if (winner === 'control') return variants[0]?.name || 'Control';
  const match = winner.match(/variant-(\d+)/);
  if (match) {
    const idx = parseInt(match[1]);
    return variants[idx]?.name || winner;
  }
  return winner;
}

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<ABTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`/api/tests/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setTest)
      .catch(() => setTest(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this test? This cannot be undone.')) return;
    setDeleting(true);
    const res = await fetch(`/api/tests/${params.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/');
    } else {
      setDeleting(false);
      alert('Failed to delete test');
    }
  }

  if (loading) {
    return <div className="py-20 text-center text-gray-500">Loading...</div>;
  }

  if (!test) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500 text-lg">Test not found</p>
        <a href="/" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← Back to dashboard
        </a>
      </div>
    );
  }

  const control = test.variants[0];
  const otherVariants = test.variants.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 no-print">
            ← Back to dashboard
          </a>
          <h1 className="text-2xl font-bold mt-2">{test.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm text-gray-500">
              {MONTH_NAMES[test.month]} {test.year}
            </span>
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                test.status === 'planned'
                  ? 'bg-yellow-100 text-yellow-800'
                  : test.status === 'running'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {test.status === 'planned' ? 'Planned' : test.status === 'running' ? 'Running' : 'Completed'}
            </span>
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {test.channel}
            </span>
            {test.winner && (
              <span
                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                  test.winner === 'inconclusive'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                Winner: {winnerLabel(test.winner, test.variants)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <a
            href={`/tests/${test.id}/edit`}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit
          </a>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Hypothesis */}
      {test.hypothesis && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Hypothesis
          </h2>
          <p className="text-gray-800">{test.hypothesis}</p>
        </section>
      )}

      {/* Variant Data Table */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Variant Data — {test.primaryMetric}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-500">Variant</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Sample Size</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Conversions</th>
                <th className="pb-3 text-sm font-medium text-gray-500 text-right">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {test.variants.map((v) => (
                <tr key={v.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 font-medium">{v.name}</td>
                  <td className="py-3 text-right text-gray-700">
                    {v.sampleSize.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-gray-700">
                    {v.conversions.toLocaleString()}
                  </td>
                  <td className="py-3 text-right font-medium">
                    {v.sampleSize > 0
                      ? formatRate(v.conversions / v.sampleSize)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Statistical Results */}
      {control && otherVariants.length > 0 && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Statistical Analysis
          </h2>
          <div className="space-y-6">
            {otherVariants.map((variant) => {
              const result = computeSignificance(
                { sampleSize: control.sampleSize, conversions: control.conversions },
                { sampleSize: variant.sampleSize, conversions: variant.conversions }
              );
              if (!result) return null;
              return (
                <div
                  key={variant.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <h3 className="font-medium mb-3">
                    {control.name} vs {variant.name}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Relative Lift</p>
                      <p
                        className={`text-lg font-bold ${
                          result.relativeLift > 0
                            ? 'text-green-600'
                            : result.relativeLift < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {result.relativeLift > 0 ? '+' : ''}
                        {result.relativeLift.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">P-Value</p>
                      <p className="text-lg font-bold">{formatPValue(result.pValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Z-Score</p>
                      <p className="text-lg font-bold">{result.zScore.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">95% CI</p>
                      <p className="text-lg font-bold">
                        [{(result.confidenceInterval.lower * 100).toFixed(2)}%,{' '}
                        {(result.confidenceInterval.upper * 100).toFixed(2)}%]
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        result.significant90
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {result.significant90 ? '✅' : '⚠️'} 90% Confidence
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        result.significant95
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {result.significant95 ? '✅' : '⚠️'} 95% Confidence
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        result.significant99
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {result.significant99 ? '✅' : '⚠️'} 99% Confidence
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Chart */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Visual Comparison
        </h2>
        <VariantComparison variants={test.variants} />
      </section>

      {/* Notes */}
      {test.notes && (
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Notes & Takeaways
          </h2>
          <div className="text-gray-800 whitespace-pre-wrap">{test.notes}</div>
        </section>
      )}
    </div>
  );
}
