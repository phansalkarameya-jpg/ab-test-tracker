'use client';

import { useRouter } from 'next/navigation';
import TestForm from '@/components/TestForm';

export default function NewTestPage() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSubmit(data: any) {
    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const test = await res.json();
      router.push(`/tests/${test.id}`);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New AB Test</h1>
      <TestForm onSubmit={handleSubmit} />
    </div>
  );
}
