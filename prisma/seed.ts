import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.variant.deleteMany();
  await prisma.aBTest.deleteMany();

  // Test 1: Homepage Hero CTA
  await prisma.aBTest.create({
    data: {
      title: 'Homepage Hero CTA - June 2025',
      month: 6,
      year: 2025,
      hypothesis:
        'Changing the CTA button from "Learn More" to "Start Free Trial" will increase click-through rate because it creates a stronger call to action with a clear value proposition.',
      channel: 'Website',
      primaryMetric: 'Click-through rate',
      notes:
        'The variant with "Start Free Trial" significantly outperformed the control. We\'ve rolled this out to 100% of traffic. Consider testing button color next.',
      winner: 'variant-1',
      variants: {
        create: [
          {
            name: 'Control',
            sampleSize: 12500,
            conversions: 375,
            screenshots: '[]',
            sortOrder: 0,
          },
          {
            name: 'Variant B',
            sampleSize: 12500,
            conversions: 512,
            screenshots: '[]',
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Test 2: Email Subject Line
  await prisma.aBTest.create({
    data: {
      title: 'Welcome Email Subject Line Test',
      month: 5,
      year: 2025,
      hypothesis:
        'Using personalization (first name) in the subject line will increase open rates compared to a generic greeting.',
      channel: 'Email',
      primaryMetric: 'Open rate',
      notes:
        'Personalized subject lines showed a modest improvement but did not reach statistical significance with our sample size. We need a larger send to confirm this trend.',
      winner: 'inconclusive',
      variants: {
        create: [
          {
            name: 'Control',
            sampleSize: 5000,
            conversions: 1100,
            sortOrder: 0,
          },
          {
            name: 'Personalized',
            sampleSize: 5000,
            conversions: 1175,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Test 3: Paid Ads Landing Page
  await prisma.aBTest.create({
    data: {
      title: 'Google Ads Landing Page - Pricing Comparison',
      month: 6,
      year: 2025,
      hypothesis:
        'Showing a pricing comparison table on the landing page will increase conversion rate by helping visitors quickly understand our value vs competitors.',
      channel: 'Paid Ads',
      primaryMetric: 'Conversion rate',
      notes:
        'Strong result! The pricing comparison table increased conversions significantly. Rolling out to all paid landing pages. Next step: test different table layouts.',
      winner: 'variant-1',
      variants: {
        create: [
          {
            name: 'Control (No Table)',
            sampleSize: 8200,
            conversions: 246,
            sortOrder: 0,
          },
          {
            name: 'With Comparison Table',
            sampleSize: 8350,
            conversions: 351,
            sortOrder: 1,
          },
          {
            name: 'Minimal Table',
            sampleSize: 8100,
            conversions: 308,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  // Test 4: Planned test
  await prisma.aBTest.create({
    data: {
      title: 'Checkout Flow Simplification',
      month: 4,
      year: 2026,
      status: 'planned',
      hypothesis:
        'Reducing the checkout from 3 steps to 1 page will decrease cart abandonment by removing friction points.',
      channel: 'Website',
      primaryMetric: 'Checkout completion rate',
      notes: null,
      winner: null,
      variants: {
        create: [
          {
            name: 'Control (3-step)',
            sampleSize: 0,
            conversions: 0,
            sortOrder: 0,
          },
          {
            name: 'Single Page Checkout',
            sampleSize: 0,
            conversions: 0,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // Test 5: Running test
  await prisma.aBTest.create({
    data: {
      title: 'Newsletter Signup Placement',
      month: 3,
      year: 2026,
      status: 'running',
      hypothesis:
        'Moving the newsletter signup from the footer to a slide-in modal after 30s will increase signups.',
      channel: 'Website',
      primaryMetric: 'Signup rate',
      notes: 'Test launched on March 10. Collecting data for 2 weeks.',
      winner: null,
      variants: {
        create: [
          {
            name: 'Control (Footer)',
            sampleSize: 3200,
            conversions: 96,
            sortOrder: 0,
          },
          {
            name: 'Slide-in Modal',
            sampleSize: 3150,
            conversions: 142,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Seed data created: 5 tests with variants');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
