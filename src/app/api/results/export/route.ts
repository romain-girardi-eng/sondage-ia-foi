import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { exportRequestSchema } from '@/lib/validation';

// Admin-only endpoint for exporting data
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const authHeader = request.headers.get('authorization');
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword || authHeader !== `Bearer ${adminPassword}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const format = request.nextUrl.searchParams.get('format') || 'json';
    const dateFrom = request.nextUrl.searchParams.get('dateFrom');
    const dateTo = request.nextUrl.searchParams.get('dateTo');

    const validationResult = exportRequestSchema.safeParse({
      format,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

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

    // Build query
    let query = supabase
      .from('responses')
      .select('id, created_at, answers, metadata')
      .eq('consent_given', true)
      .order('created_at', { ascending: false });

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Export error:', error);
      return NextResponse.json(
        { error: 'Failed to export data' },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }

    if (format === 'csv') {
      // Convert to CSV
      type ResponseRow = { id: string; created_at: string; answers: Record<string, unknown>; metadata: unknown };
      const typedData = data as ResponseRow[];
      const firstAnswers = typedData[0]?.answers || {};
      const headers = ['id', 'created_at', ...Object.keys(firstAnswers)];
      const rows = typedData.map((row) => {
        const answers = row.answers as Record<string, unknown>;
        return [
          row.id,
          row.created_at,
          ...Object.keys(firstAnswers).map(key =>
            JSON.stringify(answers[key] || '')
          ),
        ].join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');

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
