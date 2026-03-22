'use client';

import { computeSignificance, formatRate } from '@/lib/statistics';

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
  channel: string;
  primaryMetric: string;
  notes?: string | null;
  winner?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  variants: Variant[];
}

interface TestCardProps {
  test: ABTest;
}

const CHANNEL_COLORS: Record<string, string> = {
  Email: 'bg-purple-100 text-purple-700',
  'Landing Page': 'bg-blue-100 text-blue-700',
  'Paid Ads': 'bg-orange-100 text-orange-700',
  Social: 'bg-pink-100 text-pink-700',
  Website: 'bg-green-100 text-green-700',
  Other: 'bg-gray-100 text-gray-700',
};

const STATUS_STYLES: Record<string, string> = {
  planned: 'bg-yellow-100 text-yellow-800',
  running: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<string, string> = {
  planned: 'Planned',
  running: 'Running',
  completed: 'Completed',
};

export default function TestCard({ test }: TestCardProps) {
  const control = test.variants[0];
  const variant = test.variants[1];

  let significant = false;
  let controlRate = '—';
  let variantRate = '—';

  if (control && variant) {
    const result = computeSignificance(
      { sampleSize: control.sampleSize, conversions: control.conversions },
      { sampleSize: variant.sampleSize, conversions: variant.conversions }
    );
    if (result) {
      significant = result.significant95;
      controlRate = formatRate(result.controlRate);
      variantRate = formatRate(result.variantRate);
    }
  }

  const channelColor = CHANNEL_COLORS[test.channel] || CHANNEL_COLORS.Other;
  const statusStyle = STATUS_STYLES[test.status] || STATUS_STYLES.completed;
  const statusLabel = STATUS_LABELS[test.status] || 'Completed';

  const winnerLabel = (() => {
    if (!test.winner || test.winner === 'inconclusive' || test.winner === '') return null;
    if (test.winner === 'control') return test.variants[0]?.name || 'Control';
    const match = test.winner.match(/variant-(\d+)/);
    if (match) {
      const idx = parseInt(match[1]);
      return test.variants[idx]?.name || test.winner;
    }
    return test.winner;
  })();

  return (
    <a
      href={`/tests/${test.id}`}
      className="block bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all p-5"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
          {test.title}
        </h3>
        <div className="flex gap-1.5 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyle}`}>
            {statusLabel}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${channelColor}`}>
            {test.channel}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">{test.primaryMetric}</p>

      {test.status === 'planned' ? (
        <p className="text-sm text-gray-400 italic mb-3">Not started yet</p>
      ) : control && variant ? (
        <div className="text-sm text-gray-700 mb-3">
          <span className="font-mono">{controlRate}</span>
          <span className="text-gray-400 mx-1">vs</span>
          <span className="font-mono">{variantRate}</span>
        </div>
      ) : null}

      <div className="flex items-center gap-2 text-xs">
        {test.status === 'completed' && (
          <span title={significant ? 'Statistically significant' : 'Not significant'}>
            {significant ? '\u2705' : '\u26A0\uFE0F'}
          </span>
        )}
        {winnerLabel && (
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Winner: {winnerLabel}
          </span>
        )}
        {test.winner === 'inconclusive' && (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            Inconclusive
          </span>
        )}
      </div>
    </a>
  );
}
