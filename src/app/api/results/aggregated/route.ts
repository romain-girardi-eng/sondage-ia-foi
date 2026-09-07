import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { SURVEY_QUESTIONS } from '@/data';

// Results are published only once the sample is large enough to be read as a
// distribution rather than as a handful of identifiable individuals.
const MIN_PARTICIPANTS_FOR_PUBLICATION = 30;

// Free-text questions hold verbatim responses that could re-identify a
// participant. They must never be exposed through the public aggregate
// endpoint. The list is derived from the schema so future text questions
// are excluded automatically.
const FREE_TEXT_QUESTION_IDS = new Set(
  SURVEY_QUESTIONS.filter((q) => q.type === 'text').map((q) => q.id)
);

interface AggregatedRow {
  question_id: string;
  distribution: Record<string, number>;
  total_responses: number;
  /** Distinct respondents behind the question (migration 011). */
  respondents?: number | string | null;
}

export interface AggregatedApiResult {
  questionId: string;
  distribution: Record<string, number>;
  /**
   * Sum of the published cells. For a multi-select or a matrix this counts
   * selections, not people, and it drops whatever k-anonymity withheld: it is
   * never a percentage denominator.
   */
  totalResponses: number;
  /**
   * Distinct people who answered the question, the only sound denominator for
   * a share. Null when the database predates migration 011.
   */
  respondents: number | null;
}

export type AggregatedApiResponse =
  | { mode: 'insufficient'; participantCount: number; lastUpdated: string }
  | {
      mode: 'ok';
      participantCount: number;
      results: AggregatedApiResult[];
      lastUpdated: string;
    };

function stripFreeText(rows: AggregatedApiResult[]): AggregatedApiResult[] {
  // Exclude free-text questions and internal/meta keys (prefixed with "_",
  // e.g. _legacy_protestante) from the public aggregates. Defense in depth:
  // the SQL function already excludes both.
  return rows.filter(
    (row) => !row.questionId.startsWith('_') && !FREE_TEXT_QUESTION_IDS.has(row.questionId)
  );
}

const CACHE_HEADER = 'public, s-maxage=300, stale-while-revalidate=600';

function insufficient(
  participantCount: number,
  headers: Record<string, string>
): NextResponse {
  return NextResponse.json(
    {
      mode: 'insufficient' as const,
      participantCount,
      lastUpdated: new Date().toISOString(),
    },
    { status: 200, headers: { ...headers, 'Cache-Control': CACHE_HEADER } }
  );
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`results:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const headers = getRateLimitHeaders(rateLimitResult);

    // No database configured (local dev, preview without secrets): there is no
    // real data to publish, and we never fabricate any.
    if (!isSupabaseConfigured) {
      return insufficient(0, headers);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return insufficient(0, headers);
    }

    const { data: countData, error: countError } = await supabase.rpc('get_participant_count');

    if (countError) {
      console.error('Count error:', countError);
      return insufficient(0, headers);
    }

    const participantCount = Number(countData) || 0;

    if (participantCount < MIN_PARTICIPANTS_FOR_PUBLICATION) {
      return insufficient(participantCount, headers);
    }

    const { data: resultsData, error: resultsError } = await supabase.rpc('get_aggregated_results');

    if (resultsError) {
      console.error('Results error:', resultsError);
      return insufficient(participantCount, headers);
    }

    const aggregatedResults = ((resultsData as AggregatedRow[] | null) ?? []).map((row) => {
      const raw = row.respondents;
      const respondents = raw === null || raw === undefined ? Number.NaN : Number(raw);
      return {
        questionId: row.question_id,
        distribution: row.distribution,
        totalResponses: Number(row.total_responses),
        respondents: Number.isFinite(respondents) ? respondents : null,
      };
    });

    return NextResponse.json(
      {
        mode: 'ok' as const,
        participantCount,
        results: stripFreeText(aggregatedResults),
        lastUpdated: new Date().toISOString(),
      },
      { status: 200, headers: { ...headers, 'Cache-Control': CACHE_HEADER } }
    );
  } catch (error) {
    console.error('Aggregated results error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
