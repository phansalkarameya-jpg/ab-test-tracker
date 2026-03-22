import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = await prisma.aBTest.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Failed to fetch test:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { variants, ...testData } = body;

    // Delete all existing variants for this test
    await prisma.variant.deleteMany({
      where: { testId: id },
    });

    // Update the test and create new variants
    const test = await prisma.aBTest.update({
      where: { id },
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
      include: {
        variants: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(test);
  } catch (error) {
    console.error('Failed to update test:', error);
    return NextResponse.json(
      { error: 'Failed to update test' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.aBTest.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Failed to delete test:', error);
    return NextResponse.json(
      { error: 'Failed to delete test' },
      { status: 500 }
    );
  }
}
