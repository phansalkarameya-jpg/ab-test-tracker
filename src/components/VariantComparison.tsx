'use client';

import { useState, useEffect, useCallback } from 'react';
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

/* ------------------------------------------------------------------ */
/*  Lightbox                                                           */
/* ------------------------------------------------------------------ */

function Lightbox({
  src,
  label,
  onClose,
}: {
  src: string;
  label: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm font-medium flex items-center gap-1"
        >
          ✕ Close
        </button>
        {/* Label */}
        <p className="text-white text-sm font-medium mb-2 text-center">{label}</p>
        {/* Image */}
        <img
          src={src}
          alt={label}
          className="w-full max-h-[80vh] object-contain rounded-lg"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function VariantComparison({ variants }: VariantComparisonProps) {
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null);
  const closeLightbox = useCallback(() => setLightbox(null), []);

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
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Screenshots{' '}
            <span className="text-xs font-normal text-gray-400">(click to enlarge)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {allScreenshots.map((s, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs font-medium text-gray-600 mb-2">{s.name}</p>
                <button
                  type="button"
                  onClick={() => setLightbox({ src: s.url, label: s.name })}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg group"
                >
                  <img
                    src={s.url}
                    alt={`${s.name} screenshot`}
                    className="rounded-lg border border-gray-200 w-full object-contain max-h-64 group-hover:opacity-90 group-hover:shadow-lg transition-all cursor-zoom-in"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <Lightbox src={lightbox.src} label={lightbox.label} onClose={closeLightbox} />
      )}
    </div>
  );
}
