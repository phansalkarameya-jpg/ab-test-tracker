/**
 * Database migration script: Neon → Google Cloud PostgreSQL
 * Exports all data from Neon and imports into GCP using raw SQL.
 */
import pg from 'pg';
const { Client } = pg;

const NEON_URL = 'postgresql://neondb_owner:npg_AzYQ0hZRM1mP@ep-steep-wildflower-agjcs1wa-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  // ── Connect to both databases ──────────────────────────────────────────────
  console.log('Connecting to Neon...');
  const neon = new Client({ connectionString: NEON_URL });
  await neon.connect();
  console.log('✓ Connected to Neon');

  console.log('Connecting to Google Cloud PostgreSQL...');
  const gcp = new Client({
    host: '35.242.253.118',
    port: 5432,
    user: 'ameya',
    password: 'Il7pnpFeNShwgnz71Tt8',
    database: 'marketing',
    ssl: { rejectUnauthorized: false },
  });
  await gcp.connect();
  console.log('✓ Connected to GCP');

  try {
    // ── Export from Neon ────────────────────────────────────────────────────
    console.log('\nExporting data from Neon...');
    const tests = await neon.query('SELECT * FROM "ABTest" ORDER BY "createdAt" ASC');
    const variants = await neon.query('SELECT * FROM "Variant" ORDER BY "sortOrder" ASC');
    console.log(`  Found ${tests.rows.length} tests, ${variants.rows.length} variants`);

    // ── Prepare GCP tables (Prisma will have created them via db:push) ──────
    console.log('\nClearing existing GCP data...');
    await gcp.query('DELETE FROM "Variant"');
    await gcp.query('DELETE FROM "ABTest"');
    console.log('  ✓ Cleared');

    // ── Insert ABTests ──────────────────────────────────────────────────────
    console.log('\nInserting tests into GCP...');
    for (const t of tests.rows) {
      await gcp.query(
        `INSERT INTO "ABTest"
          (id, title, month, year, status, hypothesis, "serviceCategory", channel,
           "primaryMetric", "secondaryMetrics", notes, winner, "createdAt", "updatedAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT (id) DO NOTHING`,
        [
          t.id, t.title, t.month, t.year, t.status, t.hypothesis,
          t.serviceCategory, t.channel, t.primaryMetric,
          t.secondaryMetrics ?? '[]', t.notes, t.winner,
          t.createdAt, t.updatedAt,
        ]
      );
    }
    console.log(`  ✓ Inserted ${tests.rows.length} tests`);

    // ── Insert Variants ─────────────────────────────────────────────────────
    console.log('\nInserting variants into GCP...');
    for (const v of variants.rows) {
      await gcp.query(
        `INSERT INTO "Variant"
          (id, "testId", name, "sampleSize", conversions, screenshots, "sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO NOTHING`,
        [
          v.id, v.testId, v.name, v.sampleSize,
          v.conversions, v.screenshots ?? '[]', v.sortOrder,
        ]
      );
    }
    console.log(`  ✓ Inserted ${variants.rows.length} variants`);

    // ── Verify ──────────────────────────────────────────────────────────────
    console.log('\nVerifying GCP data...');
    const gcpTests = await gcp.query('SELECT COUNT(*) FROM "ABTest"');
    const gcpVariants = await gcp.query('SELECT COUNT(*) FROM "Variant"');
    console.log(`  ABTests in GCP: ${gcpTests.rows[0].count}`);
    console.log(`  Variants in GCP: ${gcpVariants.rows[0].count}`);

    console.log('\n✅ Migration complete!');
  } finally {
    await neon.end();
    await gcp.end();
  }
}

main().catch((err) => {
  console.error('\n❌ Migration failed:', err.message);
  process.exit(1);
});
