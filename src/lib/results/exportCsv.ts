/**
 * The dedicated export read by analysis/confirmatory.py (analysis/README.md):
 * one row per response, one column per question across ALL rows, and the
 * metadata the exclusions and the CNEF rule depend on.
 */
export interface ExportRow {
  id: string;
  created_at: string;
  consent_given?: boolean | null;
  answers: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

const META_COLUMNS = [
  'id',
  'submittedAt',
  'instrumentVersion',
  'entryVariant',
  'wordingVariant',
  'language',
  'consentGiven',
  'screenedOut',
] as const;

function text(value: unknown): string {
  if (value === null || value === undefined) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function csvCell(value: unknown): string {
  const cell = text(value);
  return /[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
}

export function toExportCsv(rows: ExportRow[]): string {
  const questionIds = [...new Set(rows.flatMap((row) => Object.keys(row.answers ?? {})))].sort();
  const lines = [[...META_COLUMNS, ...questionIds].map(csvCell).join(',')];

  for (const row of rows) {
    const metadata = row.metadata ?? {};
    const answers = row.answers ?? {};
    const cells: unknown[] = [
      row.id,
      row.created_at,
      metadata.instrumentVersion,
      metadata.entryVariant,
      metadata.wordingVariant,
      metadata.language,
      row.consent_given === true,
      metadata.screenedOut === true || metadata.screenedOut === 'true',
      ...questionIds.map((id) => answers[id]),
    ];
    lines.push(cells.map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}
