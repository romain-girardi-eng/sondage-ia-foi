import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase";
import {
  calculateProfileSpectrum,
  calculateCRS5Score,
  calculateAIAdoptionScore,
  calculateSpiritualResistanceIndex,
  calculateAllDimensions,
} from "@/lib/scoring";
import type { Answers } from "@/data";
import { authorizeAdminRequest } from "@/lib/security/adminAuth";
import {
  generateMockStats,
  getRoleCategory,
  buildSegmentStats,
  calculateDimensionStats,
  calculateCorrelationMatrix,
  generateKeyFindings,
  getCompletionMinutes,
  calculateScoreDistributions,
  calculateAverage,
  type SegmentDataItem,
} from "@/lib/admin";

export async function GET(request: NextRequest) {
  // Verify admin access
  if (!authorizeAdminRequest(request.headers.get("Authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get pagination and search params
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";
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

    // Use type assertion for untyped table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Get total responses
    const { count: totalResponses } = await db
      .from("responses")
      .select("*", { count: "exact", head: true });

    // Get completed responses (consent_given = true means completed)
    const { count: completedResponses } = await db
      .from("responses")
      .select("*", { count: "exact", head: true })
      .eq("consent_given", true);

    // Get today's responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayResponses } = await db
      .from("responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get this week's responses
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekResponses } = await db
      .from("responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // Get responses by language (language is in metadata JSON)
    const { data: languageData } = await db
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

    const { data: timelineData } = await db
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
    let responsesQuery = db
      .from("responses")
      .select("id, created_at, metadata, consent_given, answers", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply search filter if provided
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
    const { data: allResponsesData } = await db
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

    const religiosityScores: number[] = [];
    const aiAdoptionScores: number[] = [];
    const resistanceScores: number[] = [];

    // Enhanced data collection for new analytics
    const dimensionData: Record<string, number[]> = {
      religiosity: [],
      aiOpenness: [],
      sacredBoundary: [],
      ethicalConcern: [],
      psychologicalPerception: [],
      communityInfluence: [],
      futureOrientation: [],
    };

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
    const profileClusterData: Record<string, { count: number; religiositySum: number; aiOpennessSum: number }> = {};

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
      } | null;
      created_at: string;
      updated_at: string;
    }

    const completionTimes: number[] = [];

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

      // Calculate scores
      try {
        const spectrum = calculateProfileSpectrum(answers);
        const profileName = spectrum.primary.profile;
        profiles[profileName] = (profiles[profileName] || 0) + 1;

        const religiosityScore = calculateCRS5Score(answers);
        const aiScore = calculateAIAdoptionScore(answers);
        const resistanceScore = calculateSpiritualResistanceIndex(answers);

        religiosityScores.push(religiosityScore);
        aiAdoptionScores.push(aiScore);
        resistanceScores.push(resistanceScore);

        // Calculate all 7 dimensions for this response
        const dimensions = calculateAllDimensions(answers);
        dimensionData.religiosity.push(dimensions.religiosity.value);
        dimensionData.aiOpenness.push(dimensions.aiOpenness.value);
        dimensionData.sacredBoundary.push(dimensions.sacredBoundary.value);
        dimensionData.ethicalConcern.push(dimensions.ethicalConcern.value);
        dimensionData.psychologicalPerception.push(dimensions.psychologicalPerception.value);
        dimensionData.communityInfluence.push(dimensions.communityInfluence.value);
        dimensionData.futureOrientation.push(dimensions.futureOrientation.value);

        // Profile cluster data
        if (!profileClusterData[profileName]) {
          profileClusterData[profileName] = { count: 0, religiositySum: 0, aiOpennessSum: 0 };
        }
        profileClusterData[profileName].count++;
        profileClusterData[profileName].religiositySum += dimensions.religiosity.value;
        profileClusterData[profileName].aiOpennessSum += dimensions.aiOpenness.value;

        // Segment data by role
        const roleCategory = getRoleCategory(typeof role === "string" ? role : "");
        if (!segmentData.byRole[roleCategory]) {
          segmentData.byRole[roleCategory] = { religiosity: [], aiAdoption: [], resistance: [], profiles: {}, dimensions: {} };
          Object.keys(dimensionData).forEach(k => { segmentData.byRole[roleCategory].dimensions[k] = []; });
        }
        segmentData.byRole[roleCategory].religiosity.push(religiosityScore);
        segmentData.byRole[roleCategory].aiAdoption.push(aiScore);
        segmentData.byRole[roleCategory].resistance.push(resistanceScore);
        segmentData.byRole[roleCategory].profiles[profileName] = (segmentData.byRole[roleCategory].profiles[profileName] || 0) + 1;
        Object.keys(dimensions).forEach(k => {
          const key = k as keyof typeof dimensions;
          segmentData.byRole[roleCategory].dimensions[k]?.push(dimensions[key].value);
        });

        // Segment data by denomination
        if (typeof confession === "string" && confession) {
          if (!segmentData.byDenomination[confession]) {
            segmentData.byDenomination[confession] = { religiosity: [], aiAdoption: [], resistance: [], profiles: {}, dimensions: {} };
            Object.keys(dimensionData).forEach(k => { segmentData.byDenomination[confession].dimensions[k] = []; });
          }
          segmentData.byDenomination[confession].religiosity.push(religiosityScore);
          segmentData.byDenomination[confession].aiAdoption.push(aiScore);
          segmentData.byDenomination[confession].resistance.push(resistanceScore);
          segmentData.byDenomination[confession].profiles[profileName] = (segmentData.byDenomination[confession].profiles[profileName] || 0) + 1;
          Object.keys(dimensions).forEach(k => {
            const key = k as keyof typeof dimensions;
            segmentData.byDenomination[confession].dimensions[k]?.push(dimensions[key].value);
          });
        }

        // Segment data by age
        if (typeof age === "string" && age) {
          if (!segmentData.byAge[age]) {
            segmentData.byAge[age] = { religiosity: [], aiAdoption: [], resistance: [], profiles: {}, dimensions: {} };
            Object.keys(dimensionData).forEach(k => { segmentData.byAge[age].dimensions[k] = []; });
          }
          segmentData.byAge[age].religiosity.push(religiosityScore);
          segmentData.byAge[age].aiAdoption.push(aiScore);
          segmentData.byAge[age].resistance.push(resistanceScore);
          segmentData.byAge[age].profiles[profileName] = (segmentData.byAge[age].profiles[profileName] || 0) + 1;
          Object.keys(dimensions).forEach(k => {
            const key = k as keyof typeof dimensions;
            segmentData.byAge[age].dimensions[k]?.push(dimensions[key].value);
          });
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
        profile = spectrum.primary.profile;
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

    // Calculate averages
    const avgReligiosity = calculateAverage(religiosityScores);
    const avgAIAdoption = calculateAverage(aiAdoptionScores);
    const avgResistance = calculateAverage(resistanceScores);
    const avgCompletionTime = calculateAverage(completionTimes);

    // Calculate distributions
    const { religiosityDistribution, aiAdoptionDistribution } = calculateScoreDistributions(
      religiosityScores,
      aiAdoptionScores
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
          profile = spectrum.primary.profile;
          religiosityScore = calculateCRS5Score(answers).toFixed(1);
          aiScore = calculateAIAdoptionScore(answers).toFixed(1);
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

    // Calculate correlation matrix
    const correlationMatrix = calculateCorrelationMatrix(dimensionData);

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

    // Build profile clusters for bubble chart
    const profileClusters = Object.entries(profileClusterData).map(([profile, data]) => ({
      profile,
      count: data.count,
      avgReligiosity: data.count > 0 ? Math.round((data.religiositySum / data.count) * 100) / 100 : 0,
      avgAiOpenness: data.count > 0 ? Math.round((data.aiOpennessSum / data.count) * 100) / 100 : 0,
    }));

    // Generate key findings
    const keyFindings = generateKeyFindings(
      segmentedAnalysis,
      correlationMatrix,
      dimensionStats,
      completedResponses || 0
    );

    // Calculate population averages for comparison in response modal
    const populationAverages = {
      religiosity: dimensionStats.religiosity?.mean || 3.5,
      aiOpenness: dimensionStats.aiOpenness?.mean || 2.6,
      sacredBoundary: dimensionStats.sacredBoundary?.mean || 3.2,
      ethicalConcern: dimensionStats.ethicalConcern?.mean || 3.4,
      psychologicalPerception: dimensionStats.psychologicalPerception?.mean || 3.0,
      communityInfluence: dimensionStats.communityInfluence?.mean || 2.8,
      futureOrientation: dimensionStats.futureOrientation?.mean || 3.0,
    };

    return NextResponse.json({
      overview: {
        totalResponses: totalResponses || 0,
        completedResponses: completedResponses || 0,
        partialResponses,
        completionRate,
        avgCompletionTime: Number.isFinite(avgCompletionTime) ? avgCompletionTime : null,
        todayResponses: todayResponses || 0,
        weekResponses: weekResponses || 0,
        monthResponses: totalResponses || 0,
      },
      demographics,
      profiles,
      scores: {
        avgReligiosity,
        avgAIAdoption,
        avgResistance,
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
      correlationMatrix,
      profileClusters,
      keyFindings,
      feedbacks,
      populationAverages,
      insufficientSampleSize: (completedResponses || 0) < 30,
      sampleSizeWarning: (completedResponses || 0) < 30
        ? 'Sample size is below 30. Statistical calculations (correlations, percentiles) should be interpreted with caution.'
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
