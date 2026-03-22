'use client';

import { useState, useEffect, useMemo } from 'react';
import StatsRow from '@/components/StatsRow';
import FilterBar from '@/components/FilterBar';
import MonthGroup from '@/components/MonthGroup';
import { computeSignificance } from '@/lib/statistics';

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
  serviceCategory: string;
  channel: string;
  primaryMetric: string;
  notes: string | null;
  winner: string | null;
  createdAt: string;
  updatedAt: string;
  variants: Variant[];
}

interface Filters {
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

export default function DashboardPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    channels: [],
    serviceCategories: [],
    statuses: [],
    significance: '',
    dateRange: { fromMonth: null, fromYear: null, toMonth: null, toYear: null },
  });

  useEffect(() => {
    fetch('/api/tests')
      .then((res) => res.json())
      .then((data) => {
        setTests(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const channels = useMemo(
    () => [...new Set(tests.map((t) => t.channel))],
    [tests]
  );

  const serviceCategories = useMemo(
    () => [...new Set(tests.map((t) => t.serviceCategory).filter(Boolean))],
    [tests]
  );

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      // Search
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matchTitle = test.title.toLowerCase().includes(q);
        const matchNotes = test.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchNotes) return false;
      }
      // Channel (multi-select)
      if (filters.channels.length > 0 && !filters.channels.includes(test.channel)) return false;
      // Service Category (multi-select)
      if (filters.serviceCategories.length > 0 && !filters.serviceCategories.includes(test.serviceCategory)) return false;
      // Status (multi-select)
      if (filters.statuses.length > 0 && !filters.statuses.includes(test.status)) return false;
      // Date range
      const { fromMonth, fromYear, toMonth, toYear } = filters.dateRange;
      if (fromYear) {
        const fm = fromMonth || 1;
        if (test.year < fromYear || (test.year === fromYear && test.month < fm))
          return false;
      }
      if (toYear) {
        const tm = toMonth || 12;
        if (test.year > toYear || (test.year === toYear && test.month > tm))
          return false;
      }
      // Significance
      if (filters.significance && test.variants.length >= 2) {
        const control = test.variants[0];
        const variant = test.variants[1];
        const result = computeSignificance(
          { sampleSize: control.sampleSize, conversions: control.conversions },
          { sampleSize: variant.sampleSize, conversions: variant.conversions }
        );
        if (result) {
          const isSig = result.significant95;
          if (filters.significance === 'significant' && !isSig) return false;
          if (filters.significance === 'not_significant' && isSig) return false;
        }
      }
      return true;
    });
  }, [tests, filters]);

  const monthGroups = useMemo(() => {
    const groups: Record<string, ABTest[]> = {};
    filteredTests.forEach((test) => {
      const key = `${test.year}-${String(test.month).padStart(2, '0')}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(test);
    });
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, groupTests]) => {
        const [year, month] = key.split('-').map(Number);
        return { month, year, tests: groupTests };
      });
  }, [filteredTests]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsRow tests={filteredTests} />
      <FilterBar channels={channels} serviceCategories={serviceCategories} onFilterChange={setFilters} />

      {monthGroups.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No tests found</p>
          <a
            href="/tests/new"
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first test →
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {monthGroups.map((group) => (
            <MonthGroup
              key={`${group.year}-${group.month}`}
              month={group.month}
              year={group.year}
              tests={group.tests}
            />
          ))}
        </div>
      )}
    </div>
  );
}
