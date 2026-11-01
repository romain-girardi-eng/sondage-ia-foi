import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import { calculateProfileSpectrum } from '@/lib/scoring/profiles';
import { PERSONAS, generateCohort } from '@/lib/scoring/__tests__/personas';
import { ReportDocument, type ReportData, type ReportVariant } from './reportDocument';

async function render(answers: Record<string, unknown>, variant: ReportVariant, language: 'fr' | 'en' = 'fr') {
  const data: ReportData = { language, variant, anonymousId: '8cc888be-d9cd-41ed-862e-cf217472933f', completedAt: '2026-11-01T11:00:00Z', answers };
  const spectrum = calculateProfileSpectrum(answers as never);
  const buffer = await renderToBuffer(<ReportDocument data={data} spectrum={spectrum} />);
  return { head: buffer.subarray(0, 5).toString(), pages: (buffer.toString('latin1').match(/\/Type \/Page\b/g) ?? []).length };
}

describe('PDF report', () => {
  it.each(['cnef', 'general'] as const)('renders every persona in a compact document, %s variant', async (variant) => {
    for (const persona of PERSONAS) {
      const report = await render(generateCohort(persona, 1, 7)[0] as Record<string, unknown>, variant);
      expect(report.head).toBe('%PDF-');
      expect(report.pages).toBeGreaterThanOrEqual(3);
      expect(report.pages).toBeLessThanOrEqual(6);
    }
  }, 120_000);

  it('renders a response with no measured dimension', async () => {
    const report = await render({}, 'cnef', 'en');
    expect(report.head).toBe('%PDF-');
  }, 60_000);
});
