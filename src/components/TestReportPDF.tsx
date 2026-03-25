import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { computeSignificance, formatRate, formatPValue } from '@/lib/statistics';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Variant {
  id: string;
  name: string;
  sampleSize: number;
  conversions: number;
}

interface TestData {
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
  variants: Variant[];
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const colors = {
  primary: '#1e293b',
  secondary: '#64748b',
  accent: '#3b82f6',
  success: '#16a34a',
  danger: '#dc2626',
  border: '#e2e8f0',
  lightBg: '#f8fafc',
  white: '#ffffff',
  amber: '#d97706',
};

const s = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.primary,
  },
  // Header
  header: {
    marginBottom: 24,
    borderBottom: `2px solid ${colors.accent}`,
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  badge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    textTransform: 'uppercase' as const,
  },
  badgePlanned: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeRunning: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgeCompleted: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeChannel: { backgroundColor: '#e0e7ff', color: '#3730a3' },
  badgeCategory: { backgroundColor: '#fce7f3', color: '#9d174d' },
  dateMeta: { fontSize: 10, color: colors.secondary },

  // Sections
  section: {
    marginBottom: 18,
    backgroundColor: colors.white,
    border: `1px solid ${colors.border}`,
    borderRadius: 6,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: colors.primary,
  },

  // Table
  table: { width: '100%' },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: `2px solid ${colors.border}`,
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: `1px solid ${colors.border}`,
    paddingVertical: 8,
  },
  tableRowAlt: {
    backgroundColor: colors.lightBg,
  },
  thCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    textTransform: 'uppercase' as const,
  },
  tdCell: {
    fontSize: 10,
  },
  colName: { width: '35%' },
  colNum: { width: '21.6%', textAlign: 'right' as const },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.lightBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    padding: 10,
  },
  statLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.secondary,
    textTransform: 'uppercase' as const,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },

  // Significance badges
  sigRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  sigBadge: {
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  sigPass: { backgroundColor: '#dcfce7', color: '#166534' },
  sigFail: { backgroundColor: '#f1f5f9', color: '#64748b' },

  // Comparison header
  compHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: colors.primary,
  },

  // Winner
  winnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    border: `1px solid #86efac`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 18,
  },
  winnerBoxInconclusive: {
    backgroundColor: '#fef3c7',
    border: `1px solid #fcd34d`,
  },
  winnerText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#166534',
  },
  winnerTextInconclusive: {
    color: '#92400e',
  },

  // Footer
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: colors.secondary,
    borderTop: `1px solid ${colors.border}`,
    paddingTop: 8,
  },
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function winnerLabel(winner: string | null, variants: Variant[]): string {
  if (!winner || winner === 'inconclusive') return 'Inconclusive';
  if (winner === 'control') return variants[0]?.name || 'Control';
  const match = winner.match(/variant-(\d+)/);
  if (match) {
    const idx = parseInt(match[1]);
    return variants[idx]?.name || winner;
  }
  return winner;
}

function statusBadgeStyle(status: string) {
  if (status === 'planned') return s.badgePlanned;
  if (status === 'running') return s.badgeRunning;
  return s.badgeCompleted;
}

function statusLabel(status: string) {
  if (status === 'planned') return 'Planned';
  if (status === 'running') return 'Running';
  return 'Completed';
}

/* ------------------------------------------------------------------ */
/*  PDF Document                                                       */
/* ------------------------------------------------------------------ */

export default function TestReportPDF({ test }: { test: TestData }) {
  const control = test.variants[0];
  const otherVariants = test.variants.slice(1);
  const now = new Date();

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ---- Header ---- */}
        <View style={s.header}>
          <Text style={s.title}>{test.title}</Text>
          <View style={s.metaRow}>
            <Text style={s.dateMeta}>
              {MONTHS[test.month]} {test.year}
            </Text>
            <Text style={[s.badge, statusBadgeStyle(test.status)]}>
              {statusLabel(test.status)}
            </Text>
            {test.channel ? (
              <Text style={[s.badge, s.badgeChannel]}>{test.channel}</Text>
            ) : null}
            {test.serviceCategory ? (
              <Text style={[s.badge, s.badgeCategory]}>{test.serviceCategory}</Text>
            ) : null}
          </View>
        </View>

        {/* ---- Winner ---- */}
        {test.winner && (
          <View
            style={[
              s.winnerBox,
              test.winner === 'inconclusive' ? s.winnerBoxInconclusive : {},
            ]}
          >
            <Text
              style={[
                s.winnerText,
                test.winner === 'inconclusive' ? s.winnerTextInconclusive : {},
              ]}
            >
              {test.winner === 'inconclusive' ? '⚠ ' : '✓ '}
              Winner: {winnerLabel(test.winner, test.variants)}
            </Text>
          </View>
        )}

        {/* ---- Hypothesis ---- */}
        {test.hypothesis && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Hypothesis</Text>
            <Text style={s.bodyText}>{test.hypothesis}</Text>
          </View>
        )}

        {/* ---- Variant Data Table ---- */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>
            Variant Data — {test.primaryMetric}
          </Text>
          <View style={s.table}>
            <View style={s.tableHeader}>
              <Text style={[s.thCell, s.colName]}>Variant</Text>
              <Text style={[s.thCell, s.colNum]}>Sample Size</Text>
              <Text style={[s.thCell, s.colNum]}>Conversions</Text>
              <Text style={[s.thCell, s.colNum]}>Conv. Rate</Text>
            </View>
            {test.variants.map((v, i) => (
              <View
                key={v.id}
                style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}
              >
                <Text style={[s.tdCell, s.colName, { fontFamily: 'Helvetica-Bold' }]}>
                  {v.name}
                </Text>
                <Text style={[s.tdCell, s.colNum]}>
                  {v.sampleSize.toLocaleString()}
                </Text>
                <Text style={[s.tdCell, s.colNum]}>
                  {v.conversions.toLocaleString()}
                </Text>
                <Text style={[s.tdCell, s.colNum, { fontFamily: 'Helvetica-Bold' }]}>
                  {v.sampleSize > 0 ? formatRate(v.conversions / v.sampleSize) : '—'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ---- Statistical Analysis ---- */}
        {control &&
          otherVariants.map((variant) => {
            const result = computeSignificance(
              { sampleSize: control.sampleSize, conversions: control.conversions },
              { sampleSize: variant.sampleSize, conversions: variant.conversions }
            );
            if (!result) return null;
            return (
              <View key={variant.id} style={s.section} wrap={false}>
                <Text style={s.sectionTitle}>Statistical Analysis</Text>
                <Text style={s.compHeader}>
                  {control.name} vs {variant.name}
                </Text>
                <View style={s.statsGrid}>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Relative Lift</Text>
                    <Text
                      style={[
                        s.statValue,
                        {
                          color:
                            result.relativeLift > 0
                              ? colors.success
                              : result.relativeLift < 0
                              ? colors.danger
                              : colors.secondary,
                        },
                      ]}
                    >
                      {result.relativeLift > 0 ? '+' : ''}
                      {result.relativeLift.toFixed(2)}%
                    </Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>P-Value</Text>
                    <Text style={s.statValue}>{formatPValue(result.pValue)}</Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>Z-Score</Text>
                    <Text style={s.statValue}>{result.zScore.toFixed(3)}</Text>
                  </View>
                  <View style={s.statBox}>
                    <Text style={s.statLabel}>95% CI</Text>
                    <Text style={s.statValue}>
                      [{(result.confidenceInterval.lower * 100).toFixed(2)}%,{' '}
                      {(result.confidenceInterval.upper * 100).toFixed(2)}%]
                    </Text>
                  </View>
                </View>
                <View style={s.sigRow}>
                  <Text style={[s.sigBadge, result.significant90 ? s.sigPass : s.sigFail]}>
                    {result.significant90 ? '✓' : '✗'} 90% Confidence
                  </Text>
                  <Text style={[s.sigBadge, result.significant95 ? s.sigPass : s.sigFail]}>
                    {result.significant95 ? '✓' : '✗'} 95% Confidence
                  </Text>
                  <Text style={[s.sigBadge, result.significant99 ? s.sigPass : s.sigFail]}>
                    {result.significant99 ? '✓' : '✗'} 99% Confidence
                  </Text>
                </View>
              </View>
            );
          })}

        {/* ---- Notes ---- */}
        {test.notes && (
          <View style={s.section} wrap={false}>
            <Text style={s.sectionTitle}>Notes & Takeaways</Text>
            <Text style={s.bodyText}>{test.notes}</Text>
          </View>
        )}

        {/* ---- Footer ---- */}
        <View style={s.footer} fixed>
          <Text>AB Test Tracker — {test.title}</Text>
          <Text>
            Generated {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
