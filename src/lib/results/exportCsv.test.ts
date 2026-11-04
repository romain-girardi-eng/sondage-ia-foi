import { describe, it, expect } from 'vitest';
import { toExportCsv, type ExportRow } from './exportCsv';
import { roundCount, roundDistribution } from './disclosure';

const rows: ExportRow[] = [
  {
    id: 'a',
    created_at: '2026-11-01T10:00:00Z',
    consent_given: true,
    answers: { profil_age: '36-50', ctrl_ia_contextes: ['general', 'etudes'] },
    metadata: { instrumentVersion: '2.0.0', entryVariant: 'cnef', wordingVariant: 'cnef-2026-10', language: 'fr' },
  },
  {
    id: 'b',
    created_at: '2026-11-01T11:00:00Z',
    consent_given: true,
    answers: { profil_age: '18-35', min_pred_nature: { plan: 2 }, commentaires_libres: 'Oui, "bien", merci' },
    metadata: { instrumentVersion: '2.0.0', screenedOut: true },
  },
];

describe('toExportCsv', () => {
  it('has the columns the analysis script requires', () => {
    const header = toExportCsv(rows).split('\n')[0].split(',');
    expect(header).toEqual(expect.arrayContaining([
      'submittedAt', 'instrumentVersion', 'entryVariant', 'wordingVariant', 'consentGiven', 'screenedOut',
    ]));
  });

  it('keeps the questions of every row, not only of the first one', () => {
    const header = toExportCsv(rows).split('\n')[0];
    expect(header).toContain('min_pred_nature');
    expect(header).toContain('ctrl_ia_contextes');
  });

  it('escapes commas and quotes, and writes lists and matrices as JSON', () => {
    const csv = toExportCsv(rows);
    expect(csv).toContain('"[""general"",""etudes""]"');
    expect(csv).toContain('"{""plan"":2}"');
    expect(csv).toContain('"Oui, ""bien"", merci"');
  });

  it('writes the flags as true or false', () => {
    const [, first, second] = toExportCsv(rows).split('\n');
    expect(first).toContain(',true,false,');
    expect(second).toContain(',true,true,');
  });
});

describe('rounding of public counts', () => {
  it('rounds to base 5', () => {
    expect([5, 7, 8, 42, 40].map(roundCount)).toEqual([5, 5, 10, 40, 40]);
  });

  it('hides the gap left by a suppressed cell', () => {
    expect(roundCount(42) - roundDistribution({ oui: 40 }).oui).toBe(0);
  });
});
