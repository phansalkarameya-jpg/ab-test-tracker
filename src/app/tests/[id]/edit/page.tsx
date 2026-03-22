'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TestForm from '@/components/TestForm';

export default function EditTestPage() {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleSubmit(data: any) {
    const res = await fetch(`/api/tests/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      router.push(`/tests/${params.id}`);
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

  return (
    <div>
      <a href={`/tests/${params.id}`} className="text-sm text-gray-500 hover:text-gray-700">
        ← Back to test
      </a>
      <h1 className="text-2xl font-bold mt-2 mb-6">Edit Test</h1>
      <TestForm initialData={test} onSubmit={handleSubmit} />
    </div>
  );
}
