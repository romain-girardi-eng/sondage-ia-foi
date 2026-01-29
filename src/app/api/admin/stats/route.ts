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

// Types for enhanced stats
interface SegmentStats {
  count: number;
  avgReligiosity: number;
  avgAiAdoption: number;
  avgResistance: number;
  profileDistribution: Record<string, number>;
  dimensionAverages: Record<string, number>;
}

interface DimensionStat {
  mean: number;
  stdDev: number;
  median: number;
  distribution: number[];
}

interface KeyFinding {
  type: 'correlation' | 'segment' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

interface ProfileCluster {
  profile: string;
  count: number;
  avgReligiosity: number;
  avgAiOpenness: number;
}

// Verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
}

// Calculate standard deviation
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(Math.sqrt(avgSquaredDiff) * 100) / 100;
}

// Calculate median
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  const sumY2 = y.reduce((acc, yi) => acc + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

// Calculate histogram distribution (5 bins: 1-2, 2-3, 3-4, 4-5)
function calculateDistribution(values: number[]): number[] {
  const bins = [0, 0, 0, 0, 0];
  for (const v of values) {
    if (v < 1.5) bins[0]++;
    else if (v < 2.5) bins[1]++;
    else if (v < 3.5) bins[2]++;
    else if (v < 4.5) bins[3]++;
    else bins[4]++;
  }
  return bins;
}

// Get role category (clergy vs laity)
function getRoleCategory(role: string): 'clergy' | 'laity' | 'other' {
  if (['clerge', 'religieux'].includes(role)) return 'clergy';
  if (['laic_engagé', 'laic_pratiquant', 'curieux'].includes(role)) return 'laity';
  return 'other';
}

// Generate key findings from data
function generateKeyFindings(
  segmentedAnalysis: Record<string, Record<string, SegmentStats>>,
  correlationMatrix: Record<string, Record<string, number>>,
  dimensionStats: Record<string, DimensionStat>,
  totalResponses: number
): KeyFinding[] {
  const findings: KeyFinding[] = [];

  // Find strongest correlations
  const dimensions = Object.keys(correlationMatrix);
  let strongestPositive = { dims: ['', ''], value: 0 };
  let strongestNegative = { dims: ['', ''], value: 0 };

  for (let i = 0; i < dimensions.length; i++) {
    for (let j = i + 1; j < dimensions.length; j++) {
      const corr = correlationMatrix[dimensions[i]][dimensions[j]];
      if (corr > strongestPositive.value) {
        strongestPositive = { dims: [dimensions[i], dimensions[j]], value: corr };
      }
      if (corr < strongestNegative.value) {
        strongestNegative = { dims: [dimensions[i], dimensions[j]], value: corr };
      }
    }
  }

  if (strongestPositive.value > 0.3) {
    findings.push({
      type: 'correlation',
      title: 'Corrélation positive forte',
      description: `Les dimensions "${strongestPositive.dims[0]}" et "${strongestPositive.dims[1]}" montrent une corrélation positive significative (r=${strongestPositive.value}).`,
      significance: strongestPositive.value > 0.5 ? 'high' : 'medium'
    });
  }

  if (strongestNegative.value < -0.3) {
    findings.push({
      type: 'correlation',
      title: 'Corrélation négative notable',
      description: `Les dimensions "${strongestNegative.dims[0]}" et "${strongestNegative.dims[1]}" montrent une corrélation négative (r=${strongestNegative.value}).`,
      significance: strongestNegative.value < -0.5 ? 'high' : 'medium'
    });
  }

  // Segment differences
  if (segmentedAnalysis.byRole?.clergy && segmentedAnalysis.byRole?.laity) {
    const clergyRel = segmentedAnalysis.byRole.clergy.avgReligiosity;
    const laityRel = segmentedAnalysis.byRole.laity.avgReligiosity;
    const diff = Math.abs(clergyRel - laityRel);

    if (diff > 0.5) {
      findings.push({
        type: 'segment',
        title: 'Différence clergé/laïcs notable',
        description: `La religiosité moyenne diffère de ${diff.toFixed(1)} points entre le clergé (${clergyRel.toFixed(1)}) et les laïcs (${laityRel.toFixed(1)}).`,
        significance: diff > 1 ? 'high' : 'medium'
      });
    }

    const clergyAi = segmentedAnalysis.byRole.clergy.avgAiAdoption;
    const laityAi = segmentedAnalysis.byRole.laity.avgAiAdoption;
    const aiDiff = Math.abs(clergyAi - laityAi);

    if (aiDiff > 0.3) {
      findings.push({
        type: 'segment',
        title: 'Adoption IA différenciée',
        description: `L'adoption de l'IA varie entre le clergé (${clergyAi.toFixed(1)}) et les laïcs (${laityAi.toFixed(1)}).`,
        significance: aiDiff > 0.6 ? 'high' : 'medium'
      });
    }
  }

  // Pattern findings
  if (dimensionStats.sacredBoundary?.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Frontière sacrée élevée',
      description: `La population maintient une frontière sacrée moyenne de ${dimensionStats.sacredBoundary.mean.toFixed(1)}/5, indiquant une réticence à utiliser l'IA dans les contextes spirituels.`,
      significance: 'high'
    });
  }

  if (dimensionStats.futureOrientation?.mean > 3.5) {
    findings.push({
      type: 'pattern',
      title: 'Orientation future positive',
      description: `${Math.round(dimensionStats.futureOrientation.mean / 5 * 100)}% de la population envisage d'augmenter leur usage de l'IA.`,
      significance: 'medium'
    });
  }

  // Sample size indicator
  if (totalResponses >= 100) {
    findings.push({
      type: 'pattern',
      title: 'Échantillon significatif',
      description: `Avec ${totalResponses} réponses, l'échantillon permet des analyses statistiques fiables.`,
      significance: totalResponses >= 500 ? 'high' : 'medium'
    });
  }

  return findings.slice(0, 6); // Return top 6 findings
}

// Generate mock stats for demo mode
function generateMockStats() {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      count: Math.floor(Math.random() * 50) + 10,
    };
  });

  return {
    overview: {
      totalResponses: 1543,
      completedResponses: 1287,
      partialResponses: 256,
      completionRate: 83.4,
      avgCompletionTime: 8.5, // minutes
      todayResponses: 47,
      weekResponses: 312,
      monthResponses: 1543,
    },
    demographics: {
      byLanguage: { fr: 1120, en: 423 },
      byRole: {
        clergy: 312,
        laity: 1089,
        religious: 87,
        other: 55,
      },
      byDenomination: {
        catholique: 689,
        protestant: 599,  // Includes all Protestant sub-types
        orthodoxe: 98,
        anglican: 72,
        autre_chretien: 85,
      },
      byAge: {
        "18-25": 156,
        "26-35": 389,
        "36-45": 412,
        "46-55": 298,
        "56-65": 187,
        "65+": 101,
      },
    },
    profiles: {
      gardien_tradition: 234,
      prudent_eclaire: 312,
      innovateur_ancre: 45,
      equilibriste: 389,
      pragmatique_moderne: 287,
      pionnier_spirituel: 156,
      progressiste_critique: 89,
      explorateur: 31,
    },
    scores: {
      avgReligiosity: 3.7,
      avgAIAdoption: 2.9,
      avgResistance: 0.8,
      religiosityDistribution: {
        "1-2": 187,
        "2-3": 345,
        "3-4": 567,
        "4-5": 444,
      },
      aiAdoptionDistribution: {
        "1-2": 423,
        "2-3": 512,
        "3-4": 398,
        "4-5": 210,
      },
    },
    timeline: last30Days,
    recentResponses: Array.from({ length: 10 }, (_, i) => ({
      id: `resp-${1000 - i}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      language: Math.random() > 0.3 ? "fr" : "en",
      completed: Math.random() > 0.15,
      profile: ["gardien_tradition", "equilibriste", "pragmatique_moderne", "pionnier_spirituel"][
        Math.floor(Math.random() * 4)
      ],
      religiosityScore: (Math.random() * 4 + 1).toFixed(1),
      aiScore: (Math.random() * 4 + 1).toFixed(1),
    })),
    conversionFunnel: {
      started: 2100,
      section1Complete: 1890,
      section2Complete: 1650,
      section3Complete: 1450,
      completed: 1287,
    },
    // Enhanced analytics mock data
    segmentedAnalysis: {
      byRole: {
        clergy: {
          count: 312,
          avgReligiosity: 4.2,
          avgAiAdoption: 2.4,
          avgResistance: 1.1,
          profileDistribution: { gardien_tradition: 89, prudent_eclaire: 112, equilibriste: 78, pragmatique_moderne: 33 },
          dimensionAverages: { religiosity: 4.2, aiOpenness: 2.4, sacredBoundary: 3.8, ethicalConcern: 3.6, psychologicalPerception: 3.1, communityInfluence: 3.4, futureOrientation: 2.8 },
        },
        laity: {
          count: 1089,
          avgReligiosity: 3.5,
          avgAiAdoption: 3.1,
          avgResistance: 0.6,
          profileDistribution: { gardien_tradition: 145, prudent_eclaire: 200, equilibriste: 311, pragmatique_moderne: 254, pionnier_spirituel: 89, progressiste_critique: 56, explorateur: 34 },
          dimensionAverages: { religiosity: 3.5, aiOpenness: 3.1, sacredBoundary: 2.9, ethicalConcern: 3.3, psychologicalPerception: 3.0, communityInfluence: 2.6, futureOrientation: 3.3 },
        },
      },
      byDenomination: {
        catholique: { count: 689, avgReligiosity: 3.8, avgAiAdoption: 2.7, avgResistance: 0.9, profileDistribution: { equilibriste: 234, prudent_eclaire: 189, gardien_tradition: 156, pragmatique_moderne: 110 }, dimensionAverages: { religiosity: 3.8, aiOpenness: 2.7, sacredBoundary: 3.4, ethicalConcern: 3.5, psychologicalPerception: 3.0, communityInfluence: 3.0, futureOrientation: 2.9 } },
        protestant: { count: 599, avgReligiosity: 3.6, avgAiAdoption: 3.2, avgResistance: 0.6, profileDistribution: { pragmatique_moderne: 178, equilibriste: 155, pionnier_spirituel: 156, prudent_eclaire: 110 }, dimensionAverages: { religiosity: 3.6, aiOpenness: 3.2, sacredBoundary: 2.8, ethicalConcern: 3.2, psychologicalPerception: 3.1, communityInfluence: 2.8, futureOrientation: 3.4 } },
        orthodoxe: { count: 98, avgReligiosity: 4.1, avgAiAdoption: 2.3, avgResistance: 1.0, profileDistribution: { gardien_tradition: 45, prudent_eclaire: 32, equilibriste: 21 }, dimensionAverages: { religiosity: 4.1, aiOpenness: 2.3, sacredBoundary: 3.7, ethicalConcern: 3.6, psychologicalPerception: 2.9, communityInfluence: 3.4, futureOrientation: 2.5 } },
        anglican: { count: 72, avgReligiosity: 3.5, avgAiAdoption: 3.0, avgResistance: 0.7, profileDistribution: { equilibriste: 28, prudent_eclaire: 24, pragmatique_moderne: 20 }, dimensionAverages: { religiosity: 3.5, aiOpenness: 3.0, sacredBoundary: 3.0, ethicalConcern: 3.3, psychologicalPerception: 3.1, communityInfluence: 2.7, futureOrientation: 3.1 } },
        autre_chretien: { count: 85, avgReligiosity: 3.4, avgAiAdoption: 3.1, avgResistance: 0.6, profileDistribution: { pragmatique_moderne: 32, equilibriste: 28, explorateur: 15, pionnier_spirituel: 10 }, dimensionAverages: { religiosity: 3.4, aiOpenness: 3.1, sacredBoundary: 2.7, ethicalConcern: 3.1, psychologicalPerception: 3.2, communityInfluence: 2.5, futureOrientation: 3.3 } },
      },
      byAge: {
        "18-35": { count: 545, avgReligiosity: 3.3, avgAiAdoption: 3.5, avgResistance: 0.4, profileDistribution: { pragmatique_moderne: 189, pionnier_spirituel: 134, equilibriste: 122 }, dimensionAverages: { religiosity: 3.3, aiOpenness: 3.5, sacredBoundary: 2.5, ethicalConcern: 3.1, psychologicalPerception: 3.2, communityInfluence: 2.5, futureOrientation: 3.8 } },
        "36-50": { count: 412, avgReligiosity: 3.7, avgAiAdoption: 3.0, avgResistance: 0.7, profileDistribution: { equilibriste: 178, prudent_eclaire: 134, pragmatique_moderne: 100 }, dimensionAverages: { religiosity: 3.7, aiOpenness: 3.0, sacredBoundary: 3.1, ethicalConcern: 3.4, psychologicalPerception: 3.0, communityInfluence: 2.9, futureOrientation: 3.2 } },
        "51-65": { count: 298, avgReligiosity: 4.0, avgAiAdoption: 2.5, avgResistance: 1.0, profileDistribution: { gardien_tradition: 112, prudent_eclaire: 98, equilibriste: 88 }, dimensionAverages: { religiosity: 4.0, aiOpenness: 2.5, sacredBoundary: 3.6, ethicalConcern: 3.6, psychologicalPerception: 2.9, communityInfluence: 3.2, futureOrientation: 2.6 } },
        "66+": { count: 288, avgReligiosity: 4.2, avgAiAdoption: 2.1, avgResistance: 1.3, profileDistribution: { gardien_tradition: 122, prudent_eclaire: 100, equilibriste: 66 }, dimensionAverages: { religiosity: 4.2, aiOpenness: 2.1, sacredBoundary: 4.0, ethicalConcern: 3.5, psychologicalPerception: 2.7, communityInfluence: 3.3, futureOrientation: 2.2 } },
      },
    },
    dimensionStats: {
      religiosity: { mean: 3.7, stdDev: 0.85, median: 3.8, distribution: [87, 245, 367, 444, 144] },
      aiOpenness: { mean: 2.9, stdDev: 0.95, median: 2.9, distribution: [223, 312, 398, 254, 100] },
      sacredBoundary: { mean: 3.2, stdDev: 0.88, median: 3.2, distribution: [112, 267, 445, 312, 151] },
      ethicalConcern: { mean: 3.4, stdDev: 0.78, median: 3.5, distribution: [89, 212, 423, 378, 185] },
      psychologicalPerception: { mean: 3.0, stdDev: 0.82, median: 3.0, distribution: [134, 289, 456, 278, 130] },
      communityInfluence: { mean: 2.8, stdDev: 0.85, median: 2.8, distribution: [189, 334, 412, 234, 118] },
      futureOrientation: { mean: 3.1, stdDev: 0.92, median: 3.1, distribution: [156, 278, 398, 312, 143] },
    },
    correlationMatrix: {
      religiosity: { religiosity: 1, aiOpenness: -0.42, sacredBoundary: 0.65, ethicalConcern: 0.48, psychologicalPerception: 0.12, communityInfluence: 0.55, futureOrientation: -0.28 },
      aiOpenness: { religiosity: -0.42, aiOpenness: 1, sacredBoundary: -0.58, ethicalConcern: -0.22, psychologicalPerception: 0.35, communityInfluence: -0.15, futureOrientation: 0.62 },
      sacredBoundary: { religiosity: 0.65, aiOpenness: -0.58, sacredBoundary: 1, ethicalConcern: 0.42, psychologicalPerception: -0.08, communityInfluence: 0.38, futureOrientation: -0.45 },
      ethicalConcern: { religiosity: 0.48, aiOpenness: -0.22, sacredBoundary: 0.42, ethicalConcern: 1, psychologicalPerception: 0.28, communityInfluence: 0.32, futureOrientation: -0.15 },
      psychologicalPerception: { religiosity: 0.12, aiOpenness: 0.35, sacredBoundary: -0.08, ethicalConcern: 0.28, psychologicalPerception: 1, communityInfluence: 0.18, futureOrientation: 0.25 },
      communityInfluence: { religiosity: 0.55, aiOpenness: -0.15, sacredBoundary: 0.38, ethicalConcern: 0.32, psychologicalPerception: 0.18, communityInfluence: 1, futureOrientation: -0.05 },
      futureOrientation: { religiosity: -0.28, aiOpenness: 0.62, sacredBoundary: -0.45, ethicalConcern: -0.15, psychologicalPerception: 0.25, communityInfluence: -0.05, futureOrientation: 1 },
    },
    profileClusters: [
      { profile: "gardien_tradition", count: 234, avgReligiosity: 4.5, avgAiOpenness: 1.8 },
      { profile: "prudent_eclaire", count: 312, avgReligiosity: 4.0, avgAiOpenness: 2.4 },
      { profile: "innovateur_ancre", count: 45, avgReligiosity: 4.2, avgAiOpenness: 3.8 },
      { profile: "equilibriste", count: 389, avgReligiosity: 3.5, avgAiOpenness: 3.0 },
      { profile: "pragmatique_moderne", count: 287, avgReligiosity: 3.0, avgAiOpenness: 3.6 },
      { profile: "pionnier_spirituel", count: 156, avgReligiosity: 3.8, avgAiOpenness: 4.2 },
      { profile: "progressiste_critique", count: 89, avgReligiosity: 2.8, avgAiOpenness: 2.2 },
      { profile: "explorateur", count: 31, avgReligiosity: 2.5, avgAiOpenness: 3.5 },
    ],
    keyFindings: [
      { type: "correlation", title: "Corrélation négative IA-Sacré", description: "L'ouverture à l'IA et la frontière sacrée montrent une corrélation négative significative (r=-0.58).", significance: "high" },
      { type: "correlation", title: "Corrélation positive forte", description: "Les dimensions 'religiosity' et 'sacredBoundary' montrent une corrélation positive significative (r=0.65).", significance: "high" },
      { type: "segment", title: "Différence clergé/laïcs notable", description: "La religiosité moyenne diffère de 0.7 points entre le clergé (4.2) et les laïcs (3.5).", significance: "medium" },
      { type: "segment", title: "Adoption IA différenciée", description: "L'adoption de l'IA varie entre le clergé (2.4) et les laïcs (3.1).", significance: "medium" },
      { type: "pattern", title: "Orientation future positive", description: "62% de la population envisage d'augmenter leur usage de l'IA.", significance: "medium" },
      { type: "pattern", title: "Échantillon significatif", description: "Avec 1287 réponses, l'échantillon permet des analyses statistiques fiables.", significance: "high" },
    ],
    populationAverages: {
      religiosity: 3.7,
      aiOpenness: 2.9,
      sacredBoundary: 3.2,
      ethicalConcern: 3.4,
      psychologicalPerception: 3.0,
      communityInfluence: 2.8,
      futureOrientation: 3.1,
    },
    demo: true,
  };
}

export async function GET(request: NextRequest) {
  // Verify admin access
  if (!verifyAdmin(request)) {
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

    const profiles = {
      gardien_tradition: 0,
      prudent_eclaire: 0,
      innovateur_ancre: 0,
      equilibriste: 0,
      pragmatique_moderne: 0,
      pionnier_spirituel: 0,
      progressiste_critique: 0,
      explorateur: 0,
    } as Record<string, number>;

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
      byRole: Record<string, { religiosity: number[]; aiAdoption: number[]; resistance: number[]; profiles: Record<string, number>; dimensions: Record<string, number[]> }>;
      byDenomination: Record<string, { religiosity: number[]; aiAdoption: number[]; resistance: number[]; profiles: Record<string, number>; dimensions: Record<string, number[]> }>;
      byAge: Record<string, { religiosity: number[]; aiAdoption: number[]; resistance: number[]; profiles: Record<string, number>; dimensions: Record<string, number[]> }>;
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
      metadata: { language?: string; completionTime?: number } | null;
      created_at: string;
      updated_at: string;
    }

    const completionTimes: number[] = [];

    (allResponsesData as AllResponseItem[] | null)?.forEach((r) => {
      if (!r.answers) return;
      const answers = r.answers as Answers;

      // Calculate completion time (from metadata or from created_at to updated_at)
      if (r.metadata?.completionTime) {
        completionTimes.push(r.metadata.completionTime);
      } else if (r.created_at && r.updated_at) {
        const created = new Date(r.created_at).getTime();
        const updated = new Date(r.updated_at).getTime();
        const diffMinutes = (updated - created) / (1000 * 60);
        // Only count reasonable completion times (1-60 minutes)
        if (diffMinutes >= 1 && diffMinutes <= 60) {
          completionTimes.push(diffMinutes);
        }
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

    // Calculate averages and distributions
    const avgReligiosity = religiosityScores.length > 0
      ? Math.round((religiosityScores.reduce((a, b) => a + b, 0) / religiosityScores.length) * 10) / 10
      : 0;
    const avgAIAdoption = aiAdoptionScores.length > 0
      ? Math.round((aiAdoptionScores.reduce((a, b) => a + b, 0) / aiAdoptionScores.length) * 10) / 10
      : 0;
    const avgResistance = resistanceScores.length > 0
      ? Math.round((resistanceScores.reduce((a, b) => a + b, 0) / resistanceScores.length) * 10) / 10
      : 0;
    const avgCompletionTime = completionTimes.length > 0
      ? Math.round((completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length) * 10) / 10
      : 0;

    // Calculate distributions
    const religiosityDistribution = { "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 } as Record<string, number>;
    religiosityScores.forEach((s) => {
      if (s < 2) religiosityDistribution["1-2"]++;
      else if (s < 3) religiosityDistribution["2-3"]++;
      else if (s < 4) religiosityDistribution["3-4"]++;
      else religiosityDistribution["4-5"]++;
    });

    const aiAdoptionDistribution = { "1-2": 0, "2-3": 0, "3-4": 0, "4-5": 0 } as Record<string, number>;
    aiAdoptionScores.forEach((s) => {
      if (s < 2) aiAdoptionDistribution["1-2"]++;
      else if (s < 3) aiAdoptionDistribution["2-3"]++;
      else if (s < 4) aiAdoptionDistribution["3-4"]++;
      else aiAdoptionDistribution["4-5"]++;
    });

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
    const dimensionStats: Record<string, DimensionStat> = {};
    const dimensionKeys = Object.keys(dimensionData);
    for (const key of dimensionKeys) {
      const values = dimensionData[key];
      if (values.length > 0) {
        const mean = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
        dimensionStats[key] = {
          mean,
          stdDev: calculateStdDev(values, mean),
          median: Math.round(calculateMedian(values) * 100) / 100,
          distribution: calculateDistribution(values),
        };
      }
    }

    // Calculate correlation matrix
    const correlationMatrix: Record<string, Record<string, number>> = {};
    for (const dim1 of dimensionKeys) {
      correlationMatrix[dim1] = {};
      for (const dim2 of dimensionKeys) {
        if (dim1 === dim2) {
          correlationMatrix[dim1][dim2] = 1;
        } else {
          correlationMatrix[dim1][dim2] = calculateCorrelation(dimensionData[dim1], dimensionData[dim2]);
        }
      }
    }

    // Build segmented analysis
    const buildSegmentStats = (data: typeof segmentData.byRole[string]): SegmentStats => {
      const count = data.religiosity.length;
      if (count === 0) {
        return { count: 0, avgReligiosity: 0, avgAiAdoption: 0, avgResistance: 0, profileDistribution: {}, dimensionAverages: {} };
      }
      const dimensionAverages: Record<string, number> = {};
      for (const k of Object.keys(data.dimensions)) {
        const vals = data.dimensions[k];
        dimensionAverages[k] = vals.length > 0 ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
      }
      return {
        count,
        avgReligiosity: Math.round((data.religiosity.reduce((a, b) => a + b, 0) / count) * 100) / 100,
        avgAiAdoption: Math.round((data.aiAdoption.reduce((a, b) => a + b, 0) / count) * 100) / 100,
        avgResistance: Math.round((data.resistance.reduce((a, b) => a + b, 0) / count) * 100) / 100,
        profileDistribution: data.profiles,
        dimensionAverages,
      };
    };

    const segmentedAnalysis = {
      byRole: {} as Record<string, SegmentStats>,
      byDenomination: {} as Record<string, SegmentStats>,
      byAge: {} as Record<string, SegmentStats>,
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
    const profileClusters: ProfileCluster[] = Object.entries(profileClusterData).map(([profile, data]) => ({
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
        avgCompletionTime: avgCompletionTime || 8.5, // Fallback to estimate if no data
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
      // Note: Conversion funnel stages are estimated based on the final completion rate.
      // A more accurate funnel would require tracking partial progress in the database.
      // These estimates assume roughly linear dropout through the survey sections.
      conversionFunnel: {
        started: totalResponses || 0,
        // Estimate intermediate stages based on completed/total ratio
        section1Complete: completedResponses || 0,  // Section 1 = completed (conservative)
        section2Complete: completedResponses || 0,  // Section 2 = completed (conservative)
        section3Complete: completedResponses || 0,  // Section 3 = completed (conservative)
        completed: completedResponses || 0,
        // Flag indicating these are estimates, not tracked data
        isEstimated: true,
      },
      // Enhanced analytics data
      segmentedAnalysis,
      dimensionStats,
      correlationMatrix,
      profileClusters,
      keyFindings,
      populationAverages,
      // Statistical reliability indicator
      // n < 30 is typically considered insufficient for reliable parametric statistics
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
