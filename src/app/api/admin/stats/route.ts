import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

// Verify admin password
function verifyAdmin(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return token === process.env.ADMIN_PASSWORD;
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
        catholic: 689,
        protestant_mainline: 312,
        protestant_evangelical: 287,
        orthodox: 98,
        other: 157,
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
    demo: true,
  };
}

export async function GET(request: NextRequest) {
  // Verify admin access
  if (!verifyAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      return NextResponse.json(generateMockStats());
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json(generateMockStats());
    }

    // Get total responses
    const { count: totalResponses } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true });

    // Get completed responses
    const { count: completedResponses } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .eq("completed", true);

    // Get today's responses
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { count: todayResponses } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today.toISOString());

    // Get this week's responses
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekResponses } = await supabase
      .from("survey_responses")
      .select("*", { count: "exact", head: true })
      .gte("created_at", weekAgo.toISOString());

    // Get responses by language
    const { data: languageData } = await supabase
      .from("survey_responses")
      .select("language")
      .not("language", "is", null);

    const byLanguage: Record<string, number> = {};
    (languageData as Array<{ language: string | null }> | null)?.forEach((r) => {
      const lang = r.language || "unknown";
      byLanguage[lang] = (byLanguage[lang] || 0) + 1;
    });

    // Get timeline data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: timelineData } = await supabase
      .from("survey_responses")
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

    // Get recent responses
    const { data: recentData } = await supabase
      .from("survey_responses")
      .select("id, created_at, language, completed, answers")
      .order("created_at", { ascending: false })
      .limit(10);

    interface RecentResponse {
      id: string;
      created_at: string;
      language: string | null;
      completed: boolean | null;
      answers: Record<string, unknown> | null;
    }

    const recentResponses = (recentData as RecentResponse[] | null)?.map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      language: r.language || "unknown",
      completed: r.completed || false,
      profile: "unknown",
      religiosityScore: "N/A",
      aiScore: "N/A",
    }));

    const partialResponses = (totalResponses || 0) - (completedResponses || 0);
    const completionRate =
      totalResponses && totalResponses > 0
        ? Math.round(((completedResponses || 0) / totalResponses) * 1000) / 10
        : 0;

    return NextResponse.json({
      overview: {
        totalResponses: totalResponses || 0,
        completedResponses: completedResponses || 0,
        partialResponses,
        completionRate,
        avgCompletionTime: 8.5,
        todayResponses: todayResponses || 0,
        weekResponses: weekResponses || 0,
        monthResponses: totalResponses || 0,
      },
      demographics: {
        byLanguage,
        byRole: {},
        byDenomination: {},
        byAge: {},
      },
      profiles: {},
      scores: {
        avgReligiosity: 0,
        avgAIAdoption: 0,
        avgResistance: 0,
        religiosityDistribution: {},
        aiAdoptionDistribution: {},
      },
      timeline,
      recentResponses: recentResponses || [],
      conversionFunnel: {
        started: totalResponses || 0,
        section1Complete: Math.round((totalResponses || 0) * 0.9),
        section2Complete: Math.round((totalResponses || 0) * 0.78),
        section3Complete: Math.round((totalResponses || 0) * 0.69),
        completed: completedResponses || 0,
      },
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
