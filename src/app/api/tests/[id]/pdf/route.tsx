import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer } from '@react-pdf/renderer';
import TestReportPDF from '@/components/TestReportPDF';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: { variants: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    const buffer = await renderToBuffer(<TestReportPDF test={test} />);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${test.title.replace(/[^a-zA-Z0-9 ]/g, '')}-report.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
