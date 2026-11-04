import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase';
import { authorizeAdminRequest } from '@/lib/security/adminAuth';
import { roundCount, roundDistribution } from '@/lib/results/disclosure';

const PARTNER_ENTRIES = new Set(['cnef']);

interface AggregatedRow {
  question_id: string;
  distribution: unknown;
  total_responses: number | string;
  respondents: number | string;
}

/**
 * Results of one entry point, for its partner (addendum 1): the rules of the
 * public dashboard, computed by the same SQL function (migration 014), with no
 * comparison with the other respondents.
 */
export async function GET(request: NextRequest) {
  if (!authorizeAdminRequest(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entry = request.nextUrl.searchParams.get('entry') ?? '';
  if (!PARTNER_ENTRIES.has(entry)) {
    return NextResponse.json({ error: 'Unknown entry point' }, { status: 400 });
  }

  const supabase = isServiceRoleConfigured ? createServiceRoleClient() : null;
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data, error } = await supabase.rpc('get_aggregated_results', { p_entry: entry } as never);
  if (error) {
    console.error('Partner results error:', error);
    return NextResponse.json({ error: 'Partner results unavailable (migration 014 applied?)' }, { status: 503 });
  }

  const rows = (data ?? []) as unknown as AggregatedRow[];
  const results = rows.map((row) => ({
    questionId: row.question_id,
    distribution: roundDistribution(row.distribution),
    respondents: roundCount(Number(row.respondents)),
  }));

  return NextResponse.json(
    {
      entry,
      mode: results.length > 0 ? 'ok' : 'insufficient',
      rules: 'k >= 5 par cellule, 30 participants au moins, effectifs arrondis à 5, aucune comparaison',
      generatedAt: new Date().toISOString(),
      results,
    },
    { headers: { 'Content-Disposition': `attachment; filename="resultats-${entry}.json"` } }
  );
}
