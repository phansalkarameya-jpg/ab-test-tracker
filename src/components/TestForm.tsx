'use client';

import { useState, useCallback } from 'react';
import SignificanceCalculator from '@/components/SignificanceCalculator';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Variant {
  id?: string;
  testId?: string;
  name: string;
  sampleSize: number;
  conversions: number;
  screenshots: string[];
  sortOrder: number;
}

interface ABTest {
  id?: string;
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
  variants: Variant[];
}

interface TestFormProps {
  initialData?: ABTest;
  onSubmit: (data: ABTest) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SERVICE_CATEGORIES = ['Home Cleaning', 'Salon At Home', 'Specialty', 'Healthcare'];

const CHANNELS = ['Email', 'Landing Page', 'Paid Ads', 'Social', 'Website', 'Other'];

const STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

const MAX_VARIANTS = 4;

function defaultVariants(): Variant[] {
  return [
    { name: 'Control', sampleSize: 0, conversions: 0, screenshots: [], sortOrder: 0 },
    { name: 'Variant B', sampleSize: 0, conversions: 0, screenshots: [], sortOrder: 1 },
  ];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TestForm({ initialData, onSubmit }: TestFormProps) {
  const now = new Date();
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [status, setStatus] = useState(initialData?.status ?? 'planned');
  const [month, setMonth] = useState(initialData?.month ?? now.getMonth() + 1);
  const [year, setYear] = useState(initialData?.year ?? now.getFullYear());
  const [hypothesis, setHypothesis] = useState(initialData?.hypothesis ?? '');
  const [serviceCategory, setServiceCategory] = useState(initialData?.serviceCategory ?? '');
  const [channel, setChannel] = useState(initialData?.channel ?? '');
  const [customChannel, setCustomChannel] = useState('');
  const [primaryMetric, setPrimaryMetric] = useState(initialData?.primaryMetric ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [winner, setWinner] = useState(initialData?.winner ?? '');
  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants?.length
      ? initialData.variants.map((v) => ({
          ...v,
          screenshots: parseScreenshots(v.screenshots),
        }))
      : defaultVariants()
  );
  const [uploading, setUploading] = useState<number | null>(null);

  // Determine if initial channel is custom
  const isCustomChannel = channel !== '' && !CHANNELS.includes(channel);
  const [useCustomChannel, setUseCustomChannel] = useState(isCustomChannel);

  /* ---- Variant helpers ---- */

  const updateVariant = useCallback(
    (index: number, field: keyof Variant, value: string | number | string[]) => {
      setVariants((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const addVariant = () => {
    if (variants.length >= MAX_VARIANTS) return;
    const letter = String.fromCharCode(65 + variants.length); // C, D, ...
    setVariants((prev) => [
      ...prev,
      { name: `Variant ${letter}`, sampleSize: 0, conversions: 0, screenshots: [], sortOrder: prev.length },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2 || index === 0) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  /* ---- Screenshot upload ---- */

  const handleScreenshotUpload = async (variantIndex: number, file: File) => {
    setUploading(variantIndex);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const current = variants[variantIndex].screenshots;
      updateVariant(variantIndex, 'screenshots', [...current, data.url]);
    } catch (err) {
      console.error('Screenshot upload error:', err);
    } finally {
      setUploading(null);
    }
  };

  const removeScreenshot = (variantIndex: number, screenshotIndex: number) => {
    const current = variants[variantIndex].screenshots;
    updateVariant(
      variantIndex,
      'screenshots',
      current.filter((_, i) => i !== screenshotIndex)
    );
  };

  /* ---- Submit ---- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedChannel = useCustomChannel ? customChannel : channel;

    onSubmit({
      ...(initialData?.id ? { id: initialData.id } : {}),
      title,
      status,
      month,
      year,
      hypothesis: hypothesis || null,
      serviceCategory,
      channel: resolvedChannel,
      primaryMetric,
      notes: notes || null,
      winner: winner || null,
      variants,
    });
  };

  /* ---- Conversion rate helper ---- */

  const conversionRate = (v: Variant) =>
    v.sampleSize > 0 ? ((v.conversions / v.sampleSize) * 100).toFixed(2) + '%' : '—';

  /* ---- Styles ---- */

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
  const sectionClass = 'space-y-4';

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {/* ---- Basic Info ---- */}
      <fieldset className={sectionClass}>
        <legend className="text-base font-semibold text-gray-900 mb-2">Test Details</legend>

        <div>
          <label htmlFor="title" className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Homepage hero CTA color test"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="month" className={labelClass}>Month</label>
            <select
              id="month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className={inputClass}
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={labelClass}>Year</label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className={inputClass}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="hypothesis" className={labelClass}>Hypothesis</label>
          <textarea
            id="hypothesis"
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            rows={3}
            placeholder="We believe that... will result in..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="serviceCategory" className={labelClass}>Service Category</label>
          <select
            id="serviceCategory"
            value={serviceCategory}
            onChange={(e) => setServiceCategory(e.target.value)}
            className={inputClass}
          >
            <option value="">Select category</option>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="channel" className={labelClass}>Channel</label>
          {useCustomChannel ? (
            <div className="flex gap-2">
              <input
                id="channel"
                type="text"
                value={customChannel}
                onChange={(e) => setCustomChannel(e.target.value)}
                placeholder="Enter custom channel"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  setUseCustomChannel(false);
                  setCustomChannel('');
                }}
                className="text-sm text-blue-600 hover:underline whitespace-nowrap"
              >
                Use preset
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <select
                id="channel"
                value={channel}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setUseCustomChannel(true);
                    setChannel('');
                  } else {
                    setChannel(e.target.value);
                  }
                }}
                className={inputClass}
              >
                <option value="">Select channel</option>
                {CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="primaryMetric" className={labelClass}>
            Primary Metric <span className="text-red-500">*</span>
          </label>
          <input
            id="primaryMetric"
            type="text"
            required
            value={primaryMetric}
            onChange={(e) => setPrimaryMetric(e.target.value)}
            placeholder="e.g. Click-through rate"
            className={inputClass}
          />
        </div>
      </fieldset>

      {/* ---- Variants ---- */}
      <fieldset className={sectionClass}>
        <legend className="text-base font-semibold text-gray-900 mb-2">Variants</legend>

        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">
                  {idx === 0 ? 'Control' : `Variant ${String.fromCharCode(65 + idx)}`}
                </span>
                {idx > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sample Size</label>
                  <input
                    type="number"
                    min={0}
                    value={v.sampleSize || ''}
                    onChange={(e) =>
                      updateVariant(idx, 'sampleSize', parseInt(e.target.value) || 0)
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Conversions</label>
                  <input
                    type="number"
                    min={0}
                    value={v.conversions || ''}
                    onChange={(e) =>
                      updateVariant(idx, 'conversions', parseInt(e.target.value) || 0)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Conversion rate:{' '}
                  <span className="font-mono font-medium text-gray-700">
                    {conversionRate(v)}
                  </span>
                </span>

                <label className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                  {uploading === idx ? (
                    <span className="text-gray-400">Uploading...</span>
                  ) : (
                    '+ Add screenshot'
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleScreenshotUpload(idx, file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {/* Screenshot thumbnails */}
              {v.screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {v.screenshots.map((url, sIdx) => (
                    <div
                      key={sIdx}
                      className="relative group w-20 h-20 rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`${v.name} screenshot ${sIdx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(idx, sIdx)}
                        className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove screenshot"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {variants.length < MAX_VARIANTS && (
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + Add Variant
          </button>
        )}
      </fieldset>

      {/* ---- Live Significance Calculator ---- */}
      <fieldset className={sectionClass}>
        <legend className="text-base font-semibold text-gray-900 mb-2">
          Significance Analysis
        </legend>
        <SignificanceCalculator
          variants={variants.map((v) => ({
            name: v.name,
            sampleSize: v.sampleSize,
            conversions: v.conversions,
          }))}
        />
      </fieldset>

      {/* ---- Notes & Winner ---- */}
      <fieldset className={sectionClass}>
        <legend className="text-base font-semibold text-gray-900 mb-2">
          Results & Notes
        </legend>

        <div>
          <label htmlFor="notes" className={labelClass}>Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Key observations, learnings, next steps..."
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="winner" className={labelClass}>Winner</label>
          <select
            id="winner"
            value={winner}
            onChange={(e) => setWinner(e.target.value)}
            className={inputClass}
          >
            <option value="">Not set</option>
            {variants.map((v, idx) => (
              <option key={idx} value={idx === 0 ? 'control' : `variant-${idx}`}>
                {v.name}
              </option>
            ))}
            <option value="inconclusive">Inconclusive</option>
          </select>
        </div>
      </fieldset>

      {/* ---- Submit ---- */}
      <div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {initialData ? 'Save Changes' : 'Create Test'}
        </button>
      </div>
    </form>
  );
}
