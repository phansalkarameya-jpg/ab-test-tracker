import TestCard from '@/components/TestCard';

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

interface MonthGroupProps {
  month: number;
  year: number;
  tests: ABTest[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthGroup({ month, year, tests }: MonthGroupProps) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        {MONTH_NAMES[month - 1]} {year}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tests.map((test) => (
          <TestCard key={test.id} test={test} />
        ))}
      </div>
    </section>
  );
}
