import 'server-only';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { calculateProfileSpectrum } from '@/lib/scoring/profiles';
import type { Answers } from '@/data';
import { ReportDocument, type ReportData } from './reportDocument';

export type { ReportData, ReportVariant } from './reportDocument';

/** Generate the PDF report as a Buffer. */
export async function generatePDFReportBuffer(data: ReportData): Promise<Buffer> {
  const spectrum = calculateProfileSpectrum(data.answers as Answers);
  const buffer = await renderToBuffer(<ReportDocument data={data} spectrum={spectrum} />);
  return Buffer.from(buffer);
}
