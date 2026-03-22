'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface Variant {
  id?: string;
  testId?: string;
  name: string;
  sampleSize: number;
  conversions: number;
  screenshots?: string | string[];
  sortOrder?: number;
}

interface VariantComparisonProps {
  variants: Variant[];
}

function parseScreenshots(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return val ? [val] : [];
    }
  }
  return [];
}

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'];

export default function VariantComparison({ variants }: VariantComparisonProps) {
  const chartData = variants.map((v) => ({
    name: v.name,
    rate:
      v.sampleSize > 0
        ? Number(((v.conversions / v.sampleSize) * 100).toFixed(2))
        : 0,
  }));

  const allScreenshots = variants.flatMap((v) => {
    const urls = parseScreenshots(v.screenshots);
    return urls.map((url) => ({ name: v.name, url }));
  });

  return (
    <div className="space-y-6">
      {/* Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Conversion Rate Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 13 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, 'Conversion Rate']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="rate" radius={[4, 4, 0, 0]} maxBarSize={80}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screenshots */}
      {allScreenshots.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Screenshots</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allScreenshots.map((s, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">{s.name}</p>
                <img
                  src={s.url}
                  alt={`${s.name} screenshot`}
                  className="rounded-lg border border-gray-200 w-full object-contain max-h-64"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
