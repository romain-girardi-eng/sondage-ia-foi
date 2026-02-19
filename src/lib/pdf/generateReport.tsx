import 'server-only';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { calculateProfileSpectrum } from '@/lib/scoring/profiles';
import type { Answers } from '@/data';
import { ReportDocument, type ReportData } from './reportDocument';

export type { ReportData } from './reportDocument';
export { ReportDocument } from './reportDocument';

/**
 * Generate PDF report as a Buffer (for server-side use)
 */
export async function generatePDFReportBuffer(data: ReportData): Promise<Buffer> {
  const spectrum = calculateProfileSpectrum(data.answers as Answers);
  const buffer = await renderToBuffer(<ReportDocument data={data} spectrum={spectrum} />);
  return Buffer.from(buffer);
}

/**
 * Legacy export for backward compatibility
 * Note: This now returns a simple object with an output method
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Legacy compatibility function
export function generatePDFReport(_data: ReportData): { output: (type: 'arraybuffer') => ArrayBuffer } {
  // This is a synchronous wrapper that doesn't actually work with @react-pdf/renderer
  // The actual generation should use generatePDFReportBuffer
  console.warn('generatePDFReport is deprecated, use generatePDFReportBuffer instead');

  return {
    output: () => {
      throw new Error('Use generatePDFReportBuffer for async PDF generation');
    },
  };
}
