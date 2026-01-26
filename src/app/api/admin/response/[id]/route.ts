import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase";
import {
  calculateProfileSpectrum,
  calculateCRS5Score,
  calculateAIAdoptionScore,
  calculateSpiritualResistanceIndex,
  calculateAllDimensions,
  PROFILE_DATA,
} from "@/lib/scoring";
import type { Answers } from "@/data";

// Verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
}

// Generate interpretation based on profile spectrum
function generateInterpretation(
  spectrum: ReturnType<typeof calculateProfileSpectrum>
) {
  const headline = spectrum.interpretation.headline;
  const narrative = spectrum.interpretation.narrative;
  const uniqueAspects = spectrum.interpretation.uniqueAspects;
  const blindSpots = spectrum.interpretation.blindSpots;

  return {
    headline,
    narrative,
    uniqueAspects,
    blindSpots,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Response ID is required" }, { status: 400 });
  }

  try {
    // Check if Supabase is configured
    if (!isServiceRoleConfigured) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    // Use type assertion for untyped table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Get the specific response
    const { data: responseData, error } = await db
      .from("responses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !responseData) {
      return NextResponse.json(
        { error: "Response not found" },
        { status: 404 }
      );
    }

    const response = responseData as {
      id: string;
      created_at: string;
      metadata: { language?: string; completionTime?: number } | null;
      consent_given: boolean | null;
      answers: Record<string, unknown> | null;
    };

    if (!response.answers) {
      return NextResponse.json(
        { error: "Response has no answers" },
        { status: 400 }
      );
    }

    const answers = response.answers as Answers;

    // Calculate all scores and profiles
    const spectrum = calculateProfileSpectrum(answers);
    const dimensions = calculateAllDimensions(answers);
    const crs5Score = calculateCRS5Score(answers);
    const aiAdoptionScore = calculateAIAdoptionScore(answers);
    const resistanceIndex = calculateSpiritualResistanceIndex(answers);

    // CRS-5 score mapping
    const CRS_SCORE_MAP: Record<string, number> = {
      'jamais': 1, 'pas_du_tout': 1,
      'rarement': 2, 'peu': 2,
      'occasionnellement': 3, 'moderement': 3,
      'souvent': 4, 'beaucoup': 4,
      'tres_souvent': 5, 'totalement': 5,
      'quelques_fois_an': 2,
      'mensuel': 3,
      'hebdo': 4,
      'pluri_hebdo': 5,
      'quotidien': 4,
      'pluri_quotidien': 5,
    };

    // Calculate real CRS-5 breakdown
    const getScore = (key: string): number => {
      const val = answers[key];
      if (typeof val === 'string' && CRS_SCORE_MAP[val] !== undefined) {
        return CRS_SCORE_MAP[val];
      }
      return 3; // Default middle score
    };

    const crsBreakdown = {
      intellect: getScore('crs_intellect'),
      ideology: getScore('crs_ideology'),
      public: getScore('crs_public_practice'),
      private: getScore('crs_private_practice'),
      experience: getScore('crs_experience'),
    };

    // AI adoption scoring
    const AI_FREQ_SCORES: Record<string, number> = {
      'jamais': 1, 'essaye': 2, 'occasionnel': 3, 'regulier': 4, 'quotidien': 5,
    };

    // Calculate real AI adoption breakdown
    const freq = answers.ctrl_ia_frequence;
    const comfort = answers.ctrl_ia_confort;
    const contextes = answers.ctrl_ia_contextes;

    const aiBreakdown = {
      frequency: typeof freq === 'string' && AI_FREQ_SCORES[freq] ? AI_FREQ_SCORES[freq] : 2.5,
      comfort: typeof comfort === 'number' ? comfort : 2.5,
      contexts: Array.isArray(contextes) ? Math.min(5, 1 + contextes.length * 0.7) : 2.5,
    };

    // Build 7 dimensions with percentiles
    const dimensionsResult = {
      religiosity: {
        value: dimensions.religiosity.value,
        percentile: dimensions.religiosity.percentile,
      },
      aiOpenness: {
        value: dimensions.aiOpenness.value,
        percentile: dimensions.aiOpenness.percentile,
      },
      sacredBoundary: {
        value: dimensions.sacredBoundary.value,
        percentile: dimensions.sacredBoundary.percentile,
      },
      ethicalConcern: {
        value: dimensions.ethicalConcern.value,
        percentile: dimensions.ethicalConcern.percentile,
      },
      psychologicalPerception: {
        value: dimensions.psychologicalPerception.value,
        percentile: dimensions.psychologicalPerception.percentile,
      },
      communityInfluence: {
        value: dimensions.communityInfluence.value,
        percentile: dimensions.communityInfluence.percentile,
      },
      futureOrientation: {
        value: dimensions.futureOrientation.value,
        percentile: dimensions.futureOrientation.percentile,
      },
    };

    // Generate interpretation
    const interpretation = generateInterpretation(spectrum);

    // Build complete profile data
    const profileData = {
      primary: {
        name: spectrum.primary.profile,
        score: spectrum.primary.matchScore,
        title: PROFILE_DATA[spectrum.primary.profile]?.title || spectrum.primary.profile,
        emoji: PROFILE_DATA[spectrum.primary.profile]?.emoji || "",
      },
      secondary: spectrum.secondary
        ? {
            name: spectrum.secondary.profile,
            score: spectrum.secondary.matchScore,
            title: PROFILE_DATA[spectrum.secondary.profile]?.title || spectrum.secondary.profile,
          }
        : null,
      subProfile: spectrum.subProfile.subProfile,
      allMatches: spectrum.allMatches.map((m) => ({
        name: m.profile,
        score: m.matchScore,
      })),
    };

    return NextResponse.json({
      // Metadata
      id: response.id,
      createdAt: response.created_at,
      language: response.metadata?.language || "unknown",
      completionTime: response.metadata?.completionTime || null,

      // All raw answers
      answers,

      // Calculated scores
      scores: {
        crs5: {
          value: crs5Score,
          breakdown: crsBreakdown,
        },
        aiAdoption: {
          value: aiAdoptionScore,
          breakdown: aiBreakdown,
        },
        resistanceIndex,
      },

      // Profile typologique complet
      profile: profileData,

      // 7 dimensions
      dimensions: dimensionsResult,

      // Insights
      interpretation,

      // Growth areas and tensions from spectrum
      growthAreas: spectrum.growthAreas,
      tensions: spectrum.tensions,
      insights: spectrum.insights,
    });
  } catch (error) {
    console.error("Admin response detail error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
