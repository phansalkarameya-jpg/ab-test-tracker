import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const tests = await prisma.aBTest.findMany({
      include: { variants: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return NextResponse.json(tests);
  } catch (error) {
    console.error('Failed to fetch tests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variants, ...testData } = body;

    const test = await prisma.aBTest.create({
      data: {
        ...testData,
        variants: {
          create: variants.map((variant: { name: string; sampleSize: number; conversions: number; screenshots?: string[] | string; sortOrder: number }, index: number) => ({
            name: variant.name,
            sampleSize: variant.sampleSize,
            conversions: variant.conversions,
            screenshots: JSON.stringify(
              Array.isArray(variant.screenshots) ? variant.screenshots : []
            ),
            sortOrder: variant.sortOrder ?? index,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Failed to create test:', error);
    return NextResponse.json(
      { error: 'Failed to create test' },
      { status: 500 }
    );
  }
}
