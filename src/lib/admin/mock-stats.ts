/**
 * Mock Statistics Generator
 * Generates realistic demo data for the admin dashboard
 */

interface MockProfileClusters {
  profile: string;
  count: number;
  avgReligiosity: number;
  avgAiOpenness: number;
}

interface MockKeyFinding {
  type: 'correlation' | 'segment' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

interface MockDimensionStat {
  mean: number;
  stdDev: number;
  median: number;
  distribution: number[];
}

interface MockSegmentStats {
  count: number;
  avgReligiosity: number;
  avgAiAdoption: number;
  avgResistance: number;
  profileDistribution: Record<string, number>;
  dimensionAverages: Record<string, number>;
}

export interface MockStats {
  overview: {
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    completionRate: number;
    avgCompletionTime: number;
    todayResponses: number;
    weekResponses: number;
    monthResponses: number;
  };
  demographics: {
    byLanguage: Record<string, number>;
    byRole: Record<string, number>;
    byDenomination: Record<string, number>;
    byAge: Record<string, number>;
  };
  profiles: Record<string, number>;
  scores: {
    avgReligiosity: number;
    avgAIAdoption: number;
    avgResistance: number;
    religiosityDistribution: Record<string, number>;
    aiAdoptionDistribution: Record<string, number>;
  };
  timeline: { date: string; count: number }[];
  recentResponses: Array<{
    id: string;
    createdAt: string;
    language: string;
    completed: boolean;
    profile: string;
    religiosityScore: string;
    aiScore: string;
  }>;
  conversionFunnel: {
    started: number;
    section1Complete: number;
    section2Complete: number;
    section3Complete: number;
    completed: number;
  };
  segmentedAnalysis: {
    byRole: Record<string, MockSegmentStats>;
    byDenomination: Record<string, MockSegmentStats>;
    byAge: Record<string, MockSegmentStats>;
  };
  dimensionStats: Record<string, MockDimensionStat>;
  correlationMatrix: Record<string, Record<string, number>>;
  profileClusters: MockProfileClusters[];
  keyFindings: MockKeyFinding[];
  populationAverages: Record<string, number>;
  demo: true;
}

/**
 * Generate mock statistics for demo mode when Supabase is not configured
 */
export function generateMockStats(): MockStats {
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
      avgCompletionTime: 8.5,
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
        protestant: 599,
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
