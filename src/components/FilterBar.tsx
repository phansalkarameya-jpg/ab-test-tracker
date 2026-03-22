'use client';

import { useState } from 'react';

interface FilterValues {
  search: string;
  channels: string[];
  serviceCategories: string[];
  statuses: string[];
  significance: string;
  dateRange: {
    fromMonth: number | null;
    fromYear: number | null;
    toMonth: number | null;
    toYear: number | null;
  };
}

interface FilterBarProps {
  channels: string[];
  serviceCategories: string[];
  onFilterChange: (filters: FilterValues) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i);

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
];

function toggleValue(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
}

export default function FilterBar({ channels, serviceCategories, onFilterChange }: FilterBarProps) {
  const [search, setSearch] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedServiceCategories, setSelectedServiceCategories] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [significance, setSignificance] = useState('');
  const [fromMonth, setFromMonth] = useState<number | null>(null);
  const [fromYear, setFromYear] = useState<number | null>(null);
  const [toMonth, setToMonth] = useState<number | null>(null);
  const [toYear, setToYear] = useState<number | null>(null);

  function emitChange(overrides: Partial<{
    search: string;
    channels: string[];
    serviceCategories: string[];
    statuses: string[];
    significance: string;
    fromMonth: number | null;
    fromYear: number | null;
    toMonth: number | null;
    toYear: number | null;
  }>) {
    const s = overrides.search ?? search;
    const ch = overrides.channels ?? selectedChannels;
    const sc = overrides.serviceCategories ?? selectedServiceCategories;
    const st = overrides.statuses ?? selectedStatuses;
    const sig = overrides.significance ?? significance;
    const fm = overrides.fromMonth !== undefined ? overrides.fromMonth : fromMonth;
    const fy = overrides.fromYear !== undefined ? overrides.fromYear : fromYear;
    const tm = overrides.toMonth !== undefined ? overrides.toMonth : toMonth;
    const ty = overrides.toYear !== undefined ? overrides.toYear : toYear;

    onFilterChange({
      search: s,
      channels: ch,
      serviceCategories: sc,
      statuses: st,
      significance: sig,
      dateRange: { fromMonth: fm, fromYear: fy, toMonth: tm, toYear: ty },
    });
  }

  const selectClass =
    'border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const pillBase =
    'px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors border';
  const pillActive = 'bg-blue-100 text-blue-800 border-blue-300';
  const pillInactive = 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              emitChange({ search: e.target.value });
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Significance */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Significance</label>
          <select
            value={significance}
            onChange={(e) => {
              setSignificance(e.target.value);
              emitChange({ significance: e.target.value });
            }}
            className={selectClass}
          >
            <option value="">All</option>
            <option value="significant">Significant</option>
            <option value="not_significant">Not Significant</option>
          </select>
        </div>

        {/* Date Range: From */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <div className="flex gap-1">
            <select
              value={fromMonth ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setFromMonth(val);
                emitChange({ fromMonth: val });
              }}
              className={selectClass}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={fromYear ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setFromYear(val);
                emitChange({ fromYear: val });
              }}
              className={selectClass}
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range: To */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <div className="flex gap-1">
            <select
              value={toMonth ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setToMonth(val);
                emitChange({ toMonth: val });
              }}
              className={selectClass}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={toYear ?? ''}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : null;
                setToYear(val);
                emitChange({ toYear: val });
              }}
              className={selectClass}
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Multi-select pills row */}
      <div className="flex flex-wrap gap-4 items-start">
        {/* Status pills */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_OPTIONS.map((opt) => {
              const active = selectedStatuses.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    const next = toggleValue(selectedStatuses, opt.value);
                    setSelectedStatuses(next);
                    emitChange({ statuses: next });
                  }}
                  className={`${pillBase} ${active ? pillActive : pillInactive}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Service Category pills */}
        {serviceCategories.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Service Category</label>
            <div className="flex flex-wrap gap-1.5">
              {serviceCategories.map((cat) => {
                const active = selectedServiceCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const next = toggleValue(selectedServiceCategories, cat);
                      setSelectedServiceCategories(next);
                      emitChange({ serviceCategories: next });
                    }}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Channel pills */}
        {channels.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Channel</label>
            <div className="flex flex-wrap gap-1.5">
              {channels.map((ch) => {
                const active = selectedChannels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => {
                      const next = toggleValue(selectedChannels, ch);
                      setSelectedChannels(next);
                      emitChange({ channels: next });
                    }}
                    className={`${pillBase} ${active ? pillActive : pillInactive}`}
                  >
                    {ch}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
