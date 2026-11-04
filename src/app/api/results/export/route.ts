import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { exportRequestSchema } from '@/lib/validation';
import { authorizeAdminRequest } from '@/lib/security/adminAuth';
import { toExportCsv, type ExportRow } from '@/lib/results/exportCsv';

const EXPORT_PAGE_SIZE = 1000;

// Admin-only endpoint for exporting data
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    if (!authorizeAdminRequest(request.headers.get('authorization'))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const rawFormat = request.nextUrl.searchParams.get('format') || 'json';
    const rawDateFrom = request.nextUrl.searchParams.get('dateFrom');
    const rawDateTo = request.nextUrl.searchParams.get('dateTo');
    const rawLanguage = request.nextUrl.searchParams.get('language');
    const rawEntry = request.nextUrl.searchParams.get('entry');

    const validationResult = exportRequestSchema.safeParse({
      format: rawFormat,
      dateFrom: rawDateFrom || undefined,
      dateTo: rawDateTo || undefined,
      language: rawLanguage || undefined,
      entry: rawEntry || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    const { format, dateFrom, dateTo, language, entry } = validationResult.data;

    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      return NextResponse.json(
        { error: 'Database not configured. Please set up Supabase.' },
        { status: 503 }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Supabase returns at most 1000 rows per call: page through all of them.
    const data: ExportRow[] = [];
    for (let from = 0; ; from += EXPORT_PAGE_SIZE) {
      let query = supabase
        .from('responses')
        .select('id, created_at, consent_given, answers, metadata')
        .eq('consent_given', true)
        .order('created_at', { ascending: true })
        .range(from, from + EXPORT_PAGE_SIZE - 1);

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo);
      }
      if (language) {
        query = query.filter('metadata->>language', 'eq', language);
      }
      if (entry === 'cnef') {
        query = query.filter('metadata->>entryVariant', 'eq', 'cnef');
      } else if (entry === 'general') {
        query = query.or('metadata->>entryVariant.is.null,metadata->>entryVariant.neq.cnef');
      }

      const { data: page, error } = await query;

      if (error) {
        console.error('Export error:', error);
        return NextResponse.json(
          { error: 'Failed to export data' },
          { status: 500 }
        );
      }
      data.push(...((page ?? []) as ExportRow[]));
      if (!page || page.length < EXPORT_PAGE_SIZE) break;
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      const csv = toExportCsv(data);

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="survey-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON format
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="survey-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
