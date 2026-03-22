import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AB Test Tracker',
  description: 'Log, analyze, and browse marketing AB test results',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased min-h-screen">
        <header className="bg-white border-b border-gray-200 no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-gray-900 tracking-tight">
              AB Test Tracker
            </a>
            <a
              href="/tests/new"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + New Test
            </a>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
