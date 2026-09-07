import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase";
import {
  calculateProfileSpectrum,
  calculateAllDimensions,
  computeUsageGap,
  DIMENSION_ITEMS,
} from "@/lib/scoring";
import type { Answers } from "@/data";
import { authorizeAdminRequest } from "@/lib/security/adminAuth";
import {
  generateMockStats,
  getRoleCategory,
  emptySegmentDataItem,
  buildSegmentStats,
  calculateDimensionStats,
  computeCorrelations,
  buildCorrelationMatrix,
  generateKeyFindings,
  getCompletionMinutes,
  calculateScoreDistributions,
  calculateAverage,
  MIN_SEGMENT_N,
  type SegmentDataItem,
  type DimensionRecord,
} from "@/lib/admin";

const DIMENSION_KEYS = [
  "religiosity",
  "aiOpenness",
  "sacredBoundary",
  "ethicalConcern",
  "psychologicalPerception",
  "communityContext",
  "futureOrientation",
] as const;

type DimensionKey = (typeof DIMENSION_KEYS)[number];

const MIN_PARTICIPANTS_FOR_STABLE_STATS = 30;

/** PostgREST filters are strings: only let an id-shaped search reach them. */
function sanitizeSearch(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
}

function present(values: Array<number | null>): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

export async function GET(request: NextRequest) {
  // Verify admin access
  if (!authorizeAdminRequest(request.headers.get("Authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get pagination and search params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = sanitizeSearch(searchParams.get("search") || "");
  const offset = (page - 1) * limit;

  try {
    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      return NextResponse.json(generateMockStats());
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(generateMockStats());
    }

    // Get total responses
    const { count: totalResponses } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true });

    // Get completed responses (consent_given = true means completed)
    const { count: completedResponses } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("consent_given", true);

    // Get today's responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayResponses } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get this week's responses
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekResponses } = await supabase
      .from("responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // Get responses by language (language is in metadata JSON)
    const { data: languageData } = await supabase
      .from("responses")
      .select("metadata");

    const byLanguage: Record<string, number> = {};
    (languageData as Array<{ metadata: { language?: string } | null }> | null)?.forEach((r) => {
      const lang = r.metadata?.language || "unknown";
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    });

    // Get timeline data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: timelineData } = await supabase
      .from("responses")
      .select("created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    const timeline: { date: string; count: number }[] = [];
    const dateCountMap: Record<string, number> = {};

    (timelineData as Array<{ created_at: string }> | null)?.forEach((r) => {
      const date = new Date(r.created_at).toISOString().split("T")[0];
      dateCountMap[date] = (dateCountMap[date] || 0) + 1;
    });

    // Fill in all dates
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split("T")[0];
      timeline.push({
        date: dateStr,
        count: dateCountMap[dateStr] || 0,
      });
    }

    // Get paginated responses for the responses tab
    let responsesQuery = supabase
      .from("responses")
      .select("id, created_at, metadata, consent_given, answers", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      responsesQuery = responsesQuery.or(`id.ilike.%${search}%`);
    }

    const { data: recentData, count: totalResponsesForPagination } = await responsesQuery
      .range(offset, offset + limit - 1);

    interface RecentResponse {
      id: string;
      created_at: string;
      metadata: { language?: string } | null;
      consent_given: boolean | null;
      answers: Record<string, unknown> | null;
    }

    // Get ALL responses for computing full statistics
    const { data: allResponsesData } = await supabase
      .from("responses")
      .select("*")
      .eq("consent_given", true);

    // Initialize counters for demographics and profiles
    const demographics = {
      byLanguage,
      byRole: {} as Record<string, number>,
      byDenomination: {} as Record<string, number>,
      byAge: {} as Record<string, number>,
      byGender: {} as Record<string, number>,
      byCountry: {} as Record<string, number>,
    };

    const profiles: Record<string, number> = {
      gardien_tradition: 0,
      prudent_eclaire: 0,
      innovateur_ancre: 0,
      equilibriste: 0,
      pragmatique_moderne: 0,
      pionnier_spirituel: 0,
      progressiste_critique: 0,
      explorateur: 0,
    };

    const religiosityScores: Array<number | null> = [];
    const aiAdoptionScores: Array<number | null> = [];
    // The spiritual resistance index is gone (SCORING_V2_SPEC §1.7): the usage
    // gap is ordinal and descriptive, so it is counted, never averaged.
    const usageGapCounts: Record<string, number> = {};

    const dimensionData: Record<DimensionKey, Array<number | null>> = {
      religiosity: [],
      aiOpenness: [],
      sacredBoundary: [],
      ethicalConcern: [],
      psychologicalPerception: [],
      communityContext: [],
      futureOrientation: [],
    };

    // One record per respondent, so correlations run on pairwise-complete data
    // instead of on arrays desynchronised by dropped nulls.
    const dimensionRecords: DimensionRecord[] = [];

    // Segment data collectors
    const segmentData: {
      byRole: Record<string, SegmentDataItem>;
      byDenomination: Record<string, SegmentDataItem>;
      byAge: Record<string, SegmentDataItem>;
    } = {
      byRole: {},
      byDenomination: {},
      byAge: {},
    };

    // Profile cluster data
    const profileClusterData: Record<
      string,
      { count: number; religiosity: Array<number | null>; aiOpenness: Array<number | null> }
    > = {};

    // Process all responses for statistics
    interface AllResponseItem {
      id: string;
      answers: Record<string, unknown> | null;
      metadata: {
        language?: string;
        completionTime?: number;
        timeSpent?: number;
        startedAt?: string;
        completedAt?: string;
        screenedOut?: boolean;
      } | null;
      created_at: string;
      updated_at: string;
    }

    const completionTimes: number[] = [];
    const dimensionKeys = [...DIMENSION_KEYS] as string[];

    (allResponsesData as AllResponseItem[] | null)?.forEach((r) => {
      if (!r.answers) return;
      const answers = r.answers as Answers;

      // Calculate completion time
      const completionMinutes = getCompletionMinutes(r.metadata, r.created_at, r.updated_at);
      if (completionMinutes && completionMinutes >= 1 && completionMinutes <= 120) {
        completionTimes.push(completionMinutes);
      }

      // Demographics from answers
      const confession = answers.profil_confession;
      if (typeof confession === "string" && confession) {
        demographics.byDenomination[confession] = (demographics.byDenomination[confession] || 0) + 1;
      }

      const role = answers.profil_statut;
      if (typeof role === "string" && role) {
        demographics.byRole[role] = (demographics.byRole[role] || 0) + 1;
      }

      const age = answers.profil_age;
      if (typeof age === "string" && age) {
        demographics.byAge[age] = (demographics.byAge[age] || 0) + 1;
      }

      const gender = answers.profil_genre;
      if (typeof gender === "string" && gender) {
        demographics.byGender[gender] = (demographics.byGender[gender] || 0) + 1;
      }

      const country = answers.profil_pays;
      if (typeof country === "string" && country) {
        demographics.byCountry[country] = (demographics.byCountry[country] || 0) + 1;
      }

      // Screened-out respondents answered no scored item.
      if (r.metadata?.screenedOut === true) return;

      try {
        const spectrum = calculateProfileSpectrum(answers);
        const profileName = spectrum.primary ? spectrum.primary.profile : null;
        if (profileName) {
          profiles[profileName] = (profiles[profileName] || 0) + 1;
        }

        const d = calculateAllDimensions(answers);
        const values: Array<[DimensionKey, number | null]> = [
          ["religiosity", d.religiosity.value],
          ["aiOpenness", d.aiOpenness.value],
          ["sacredBoundary", d.sacredBoundary.value],
          ["ethicalConcern", d.ethicalConcern.value],
          ["psychologicalPerception", d.psychologicalPerception.value],
          ["communityContext", d.communityContext.value],
          ["futureOrientation", d.futureOrientation.value],
        ];

        const record: DimensionRecord = {};
        for (const [key, value] of values) {
          dimensionData[key].push(value);
          record[key] = value;
        }
        dimensionRecords.push(record);

        const religiosityScore = record.religiosity;
        const aiScore = record.aiOpenness;
        const usageGap = computeUsageGap(answers);

        religiosityScores.push(religiosityScore);
        aiAdoptionScores.push(aiScore);
        usageGapCounts[usageGap] = (usageGapCounts[usageGap] || 0) + 1;

        if (profileName) {
          if (!profileClusterData[profileName]) {
            profileClusterData[profileName] = { count: 0, religiosity: [], aiOpenness: [] };
          }
          profileClusterData[profileName].count++;
          profileClusterData[profileName].religiosity.push(religiosityScore);
          profileClusterData[profileName].aiOpenness.push(aiScore);
        }

        const pushSegment = (bucket: Record<string, SegmentDataItem>, key: string) => {
          if (!bucket[key]) bucket[key] = emptySegmentDataItem(dimensionKeys);
          bucket[key].religiosity.push(religiosityScore);
          bucket[key].aiAdoption.push(aiScore);
          bucket[key].usageGap[usageGap] = (bucket[key].usageGap[usageGap] || 0) + 1;
          if (profileName) {
            bucket[key].profiles[profileName] = (bucket[key].profiles[profileName] || 0) + 1;
          }
          for (const [dimensionKey, value] of values) {
            bucket[key].dimensions[dimensionKey]?.push(value);
          }
        };

        pushSegment(segmentData.byRole, getRoleCategory(typeof role === "string" ? role : ""));
        if (typeof confession === "string" && confession) {
          pushSegment(segmentData.byDenomination, confession);
        }
        if (typeof age === "string" && age) {
          pushSegment(segmentData.byAge, age);
        }
      } catch (e) {
        console.error("Error calculating scores for response:", r.id, e);
      }
    });

    // Extract feedbacks from commentaires_libres
    const feedbacks: Array<{ id: string; createdAt: string; language: string; profile: string; text: string }> = [];
    (allResponsesData as AllResponseItem[] | null)?.forEach((r) => {
      if (!r.answers) return;
      const answers = r.answers as Answers;
      const text = answers.commentaires_libres;
      if (typeof text !== "string" || !text.trim()) return;

      let profile = "unknown";
      try {
        const spectrum = calculateProfileSpectrum(answers);
        if (spectrum.primary) profile = spectrum.primary.profile;
      } catch { /* ignore */ }

      feedbacks.push({
        id: r.id,
        createdAt: r.created_at,
        language: r.metadata?.language || "unknown",
        profile,
        text: text.trim(),
      });
    });

    // Sort feedbacks by date descending
    feedbacks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate averages (null when nothing measurable, never 0)
    const avgReligiosity = calculateAverage(present(religiosityScores));
    const avgAIAdoption = calculateAverage(present(aiAdoptionScores));
    const avgCompletionTime = calculateAverage(completionTimes);

    // Calculate distributions
    const { religiosityDistribution, aiAdoptionDistribution } = calculateScoreDistributions(
      present(religiosityScores),
      present(aiAdoptionScores)
    );

    // Process recent responses with calculated scores
    const recentResponses = (recentData as RecentResponse[] | null)?.map((r) => {
      let profile = "unknown";
      let religiosityScore = "N/A";
      let aiScore = "N/A";

      if (r.answers) {
        try {
          const answers = r.answers as Answers;
          const spectrum = calculateProfileSpectrum(answers);
          if (spectrum.primary) profile = spectrum.primary.profile;
          const d = calculateAllDimensions(answers);
          religiosityScore = d.religiosity.value === null ? "N/A" : d.religiosity.value.toFixed(1);
          aiScore = d.aiOpenness.value === null ? "N/A" : d.aiOpenness.value.toFixed(1);
        } catch (e) {
          console.error("Error calculating scores for recent response:", r.id, e);
        }
      }

      return {
        id: r.id,
        createdAt: r.created_at,
        language: r.metadata?.language || "unknown",
        completed: r.consent_given || false,
        profile,
        religiosityScore,
        aiScore,
      };
    });

    const partialResponses = (totalResponses || 0) - (completedResponses || 0);
    const completionRate =
      totalResponses && totalResponses > 0
        ? Math.round(((completedResponses || 0) / totalResponses) * 1000) / 10
        : 0;

    // Calculate dimension statistics
    const dimensionStats = calculateDimensionStats(dimensionData);

    // Correlations: pairwise-complete, n >= 20, Fisher CI, BH over this family
    const correlations = computeCorrelations(dimensionRecords, dimensionKeys, DIMENSION_ITEMS);
    const correlationMatrix = buildCorrelationMatrix(correlations, dimensionKeys);

    // Build segmented analysis
    const segmentedAnalysis = {
      byRole: {} as Record<string, ReturnType<typeof buildSegmentStats>>,
      byDenomination: {} as Record<string, ReturnType<typeof buildSegmentStats>>,
      byAge: {} as Record<string, ReturnType<typeof buildSegmentStats>>,
    };

    for (const [key, data] of Object.entries(segmentData.byRole)) {
      segmentedAnalysis.byRole[key] = buildSegmentStats(data);
    }
    for (const [key, data] of Object.entries(segmentData.byDenomination)) {
      segmentedAnalysis.byDenomination[key] = buildSegmentStats(data);
    }
    for (const [key, data] of Object.entries(segmentData.byAge)) {
      segmentedAnalysis.byAge[key] = buildSegmentStats(data);
    }

    // Build profile clusters for bubble chart. Clusters below MIN_SEGMENT_N
    // publish their size only.
    const profileClusters = Object.entries(profileClusterData).map(([profile, data]) => ({
      profile,
      count: data.count,
      avgReligiosity: data.count >= MIN_SEGMENT_N ? calculateAverage(present(data.religiosity)) : null,
      avgAiOpenness: data.count >= MIN_SEGMENT_N ? calculateAverage(present(data.aiOpenness)) : null,
    }));

    // Generate key findings
    const keyFindings = generateKeyFindings(
      segmentedAnalysis,
      correlations,
      dimensionStats,
      completedResponses || 0
    );

    // Population averages for the response modal comparison
    const populationAverages: Record<string, number | null> = {};
    for (const key of DIMENSION_KEYS) {
      populationAverages[key] = dimensionStats[key]?.mean ?? null;
    }

    return NextResponse.json({
      overview: {
        totalResponses: totalResponses || 0,
        completedResponses: completedResponses || 0,
        partialResponses,
        completionRate,
        avgCompletionTime,
        todayResponses: todayResponses || 0,
        weekResponses: weekResponses || 0,
        monthResponses: totalResponses || 0,
      },
      demographics,
      profiles,
      scores: {
        avgReligiosity,
        avgAIAdoption,
        usageGapDistribution: usageGapCounts,
        religiosityDistribution,
        aiAdoptionDistribution,
      },
      timeline,
      recentResponses: recentResponses || [],
      pagination: {
        page,
        limit,
        total: totalResponsesForPagination || 0,
        totalPages: Math.ceil((totalResponsesForPagination || 0) / limit),
      },
      conversionFunnel: {
        started: totalResponses || 0,
        section1Complete: completedResponses || 0,
        section2Complete: completedResponses || 0,
        section3Complete: completedResponses || 0,
        completed: completedResponses || 0,
        isEstimated: true,
      },
      segmentedAnalysis,
      dimensionStats,
      correlations,
      correlationMatrix,
      profileClusters,
      keyFindings,
      feedbacks,
      populationAverages,
      insufficientSampleSize: (completedResponses || 0) < MIN_PARTICIPANTS_FOR_STABLE_STATS,
      sampleSizeWarning: (completedResponses || 0) < MIN_PARTICIPANTS_FOR_STABLE_STATS
        ? 'Sample size is below 30. Correlations are withheld and segment means are suppressed below n = 5.'
        : (completedResponses || 0) < 100
        ? 'Moderate sample size. Statistical estimates will stabilize as more responses are collected.'
        : null,
      demo: false,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
