import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, isServiceRoleConfigured } from "@/lib/supabase";
import {
  calculateProfileSpectrum,
  calculateCRS5Score,
  calculateAIAdoptionScore,
  computeUsageGap,
  calculateAllDimensions,
  scoreItem,
  DIMENSION_KEYS,
  PROFILE_DATA,
} from "@/lib/scoring";
import type { ProfileInterpretation, ProfileSpectrum } from "@/lib/scoring";
import type { Answers } from "@/data";
import { authorizeAdminRequest } from "@/lib/security/adminAuth";

/**
 * The interpretation is null whenever no primary profile could be attributed
 * (SCORING_V2_SPEC §1.5). The admin renders that absence, it never invents one.
 */
function generateInterpretation(
  spectrum: ProfileSpectrum
): Pick<ProfileInterpretation, "headline" | "narrative" | "uniqueAspects" | "blindSpots"> | null {
  const interpretation = spectrum.interpretation;
  if (!interpretation) return null;

  return {
    headline: interpretation.headline,
    narrative: interpretation.narrative,
    uniqueAspects: interpretation.uniqueAspects,
    blindSpots: interpretation.blindSpots,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin access
  if (!authorizeAdminRequest(request.headers.get("Authorization"))) {
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

    // Get the specific response
    const { data: responseData, error } = await supabase
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
      metadata: {
        language?: string;
        completionTime?: number;
        timeSpent?: number;
        startedAt?: string;
        completedAt?: string;
        instrumentVersion?: string;
        entryVariant?: string;
        screenedOut?: boolean;
      } | null;
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
    const usageGap = computeUsageGap(answers);

    // Item-level breakdowns come from the scoring module: an unanswered item is
    // null, never an imputed midpoint (SCORING_V2_SPEC §1.3).
    const crsBreakdown: Record<string, number | null> = {
      intellect: scoreItem("crs_intellect", answers),
      ideology: scoreItem("crs_ideology", answers),
      public: scoreItem("crs_public_practice", answers),
      private: scoreItem("crs_private_practice", answers),
      experience: scoreItem("crs_experience", answers),
    };

    const aiBreakdown: Record<string, number | null> = {
      frequency: scoreItem("ctrl_ia_frequence", answers),
      comfort: scoreItem("ctrl_ia_confort", answers),
      contexts: scoreItem("ctrl_ia_contextes", answers),
    };

    // Seven dimensions, each with its coverage (nItems / maxItems)
    const dimensionsResult: Record<
      string,
      {
        value: number | null;
        percentile: number | null;
        nItems: number;
        maxItems: number;
        confidence: number;
      }
    > = {};
    for (const key of DIMENSION_KEYS) {
      const dimension = dimensions[key];
      dimensionsResult[key] = {
        value: dimension.value,
        percentile: dimension.percentile,
        nItems: dimension.nItems,
        maxItems: dimension.maxItems,
        confidence: dimension.confidence,
      };
    }

    // Generate interpretation
    const interpretation = generateInterpretation(spectrum);

    // Build complete profile data. Every field is null when fewer than four
    // dimensions could be valued, rather than a fabricated best guess.
    const primary = spectrum.primary;
    const secondary = spectrum.secondary;
    const profileData = {
      primary: primary
        ? {
            name: primary.profile,
            score: primary.matchScore,
            title: PROFILE_DATA[primary.profile]?.title || primary.profile,
            emoji: PROFILE_DATA[primary.profile]?.emoji || "",
          }
        : null,
      secondary: secondary
        ? {
            name: secondary.profile,
            score: secondary.matchScore,
            title: PROFILE_DATA[secondary.profile]?.title || secondary.profile,
          }
        : null,
      subProfile: spectrum.subProfile ? spectrum.subProfile.subProfile : null,
      allMatches: spectrum.allMatches.map((m) => ({
        name: m.profile,
        score: m.matchScore,
      })),
      attribution: spectrum.attribution,
      confidence: spectrum.profileConfidence,
    };

    const completionMinutes = computeCompletionMinutes(response.metadata, response.created_at, response.created_at);

    return NextResponse.json({
      // Metadata
      id: response.id,
      createdAt: response.created_at,
      language: response.metadata?.language || "unknown",
      completionTime: completionMinutes,
      instrument: {
        version: response.metadata?.instrumentVersion ?? null,
        entryVariant: response.metadata?.entryVariant ?? null,
        screenedOut: response.metadata?.screenedOut === true,
      },

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
        usageGap,
      },

      // Social desirability is a covariate flag, never a score correction (§1.2)
      socialDesirability: spectrum.socialDesirability,

      // Profil typologique complet
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
function computeCompletionMinutes(
  metadata: { completionTime?: number; timeSpent?: number; startedAt?: string; completedAt?: string } | null,
  createdAt?: string,
  updatedAt?: string
): number | null {
  if (metadata?.completionTime && metadata.completionTime > 0) {
    return metadata.completionTime;
  }

  if (typeof metadata?.timeSpent === "number" && metadata.timeSpent > 0) {
    return Math.round((metadata.timeSpent / 60000) * 10) / 10;
  }

  if (metadata?.startedAt && metadata?.completedAt) {
    const start = Date.parse(metadata.startedAt);
    const end = Date.parse(metadata.completedAt);
    if (!Number.isNaN(start) && !Number.isNaN(end) && end > start) {
      return Math.round(((end - start) / 60000) * 10) / 10;
    }
  }

  if (createdAt && updatedAt) {
    const created = Date.parse(createdAt);
    const updated = Date.parse(updatedAt);
    if (!Number.isNaN(created) && !Number.isNaN(updated) && updated > created) {
      return Math.round(((updated - created) / 60000) * 10) / 10;
    }
  }

  return null;
}
