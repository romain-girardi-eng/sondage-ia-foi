import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { rateLimit, getRateLimitHeaders } from '@/lib/rateLimit';
import { getMockResults } from '@/lib';
import { SURVEY_QUESTIONS } from '@/data';

// Free-text questions hold verbatim responses that could re-identify a
// participant. They must never be exposed through the public aggregate
// endpoint. The list is derived from the schema so future text questions
// are excluded automatically.
const FREE_TEXT_QUESTION_IDS = new Set(
  SURVEY_QUESTIONS.filter((q) => q.type === 'text').map((q) => q.id)
);

function stripFreeText<T extends { questionId: string }>(rows: T[]): T[] {
  // Exclude free-text questions and internal/meta keys (prefixed with "_",
  // e.g. _legacy_protestante) from the public aggregates.
  return rows.filter(
    (row) => !row.questionId.startsWith('_') && !FREE_TEXT_QUESTION_IDS.has(row.questionId)
  );
}

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const rateLimitResult = rateLimit(`results:${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      // Return mock data in demo mode
      const mockResults = getMockResults();
      return NextResponse.json(
        {
          participantCount: 1543,
          results: stripFreeText(mockResults),
          lastUpdated: new Date().toISOString(),
          demo: true,
        },
        {
          status: 200,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      const mockResults = getMockResults();
      return NextResponse.json(
        {
          participantCount: 1543,
          results: stripFreeText(mockResults),
          lastUpdated: new Date().toISOString(),
          demo: true,
        },
        {
          status: 200,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Get participant count
    const { data: countData, error: countError } = await supabase
      .rpc('get_participant_count');

    if (countError) {
      console.error('Count error:', countError);
    }

    // Get aggregated results
    const { data: resultsData, error: resultsError } = await supabase
      .rpc('get_aggregated_results');

    if (resultsError) {
      console.error('Results error:', resultsError);
      // Fall back to mock data
      const mockResults = getMockResults();
      return NextResponse.json(
        {
          participantCount: Number(countData) || 1543,
          results: stripFreeText(mockResults),
          lastUpdated: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            ...getRateLimitHeaders(rateLimitResult),
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    // Transform results into expected format
    interface AggregatedRow {
      question_id: string;
      distribution: Record<string, number>;
      total_responses: number;
    }

    const aggregatedResults = ((resultsData as AggregatedRow[]) || []).map((row) => ({
      questionId: row.question_id,
      distribution: row.distribution,
      totalResponses: Number(row.total_responses),
    }));

    return NextResponse.json(
      {
        participantCount: Number(countData) || 0,
        results: stripFreeText(aggregatedResults),
        lastUpdated: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          ...getRateLimitHeaders(rateLimitResult),
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Aggregated results error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
