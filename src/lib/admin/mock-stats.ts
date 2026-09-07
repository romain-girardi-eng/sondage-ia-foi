/**
 * Mock Statistics Generator
 *
 * Demo data for the admin dashboard when Supabase is not configured. It follows
 * the v2 contract exactly, nulls included (SCORING_V2_SPEC §1.4 and §1.8): a
 * segment below MIN_SEGMENT_N publishes no mean, a dimension carries its n, and
 * the correlation matrix is null as soon as one pair misses n >= 20. The point
 * of the fixture is that the dashboard meets those absences in development.
 */

import type { CorrelationFact } from './stats-helpers';

interface MockProfileCluster {
  profile: string;
  count: number;
  avgReligiosity: number | null;
  avgAiOpenness: number | null;
}

interface MockKeyFinding {
  type: 'correlation' | 'segment' | 'pattern';
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

interface MockDimensionStat {
  n: number;
  mean: number | null;
  stdDev: number | null;
  median: number | null;
  distribution: number[];
}

interface MockSegmentStats {
  count: number;
  avgReligiosity: number | null;
  avgAiAdoption: number | null;
  sdReligiosity: number | null;
  sdAiAdoption: number | null;
  profileDistribution: Record<string, number>;
  usageGapDistribution: Record<string, number>;
  dimensionAverages: Record<string, number | null>;
  dimensionSds: Record<string, number | null>;
}

export interface MockStats {
  overview: {
    totalResponses: number;
    completedResponses: number;
    partialResponses: number;
    completionRate: number;
    avgCompletionTime: number | null;
    todayResponses: number;
    weekResponses: number;
    monthResponses: number;
  };
  demographics: {
    byLanguage: Record<string, number>;
    byRole: Record<string, number>;
    byDenomination: Record<string, number>;
    byAge: Record<string, number>;
    byGender: Record<string, number>;
    byCountry: Record<string, number>;
  };
  profiles: Record<string, number>;
  scores: {
    avgReligiosity: number | null;
    avgAIAdoption: number | null;
    usageGapDistribution: Record<string, number>;
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
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  conversionFunnel: {
    started: number;
    section1Complete: number;
    section2Complete: number;
    section3Complete: number;
    completed: number;
    isEstimated: boolean;
  };
  segmentedAnalysis: {
    byRole: Record<string, MockSegmentStats>;
    byDenomination: Record<string, MockSegmentStats>;
    byAge: Record<string, MockSegmentStats>;
  };
  dimensionStats: Record<string, MockDimensionStat>;
  correlations: CorrelationFact[];
  correlationMatrix: Record<string, Record<string, number>> | null;
  profileClusters: MockProfileCluster[];
  keyFindings: MockKeyFinding[];
  feedbacks: Array<{
    id: string;
    createdAt: string;
    language: string;
    profile: string;
    text: string;
  }>;
  populationAverages: Record<string, number | null>;
  insufficientSampleSize: boolean;
  sampleSizeWarning: string | null;
  demo: true;
}

const DIMENSION_KEYS = [
  'religiosity',
  'aiOpenness',
  'sacredBoundary',
  'ethicalConcern',
  'psychologicalPerception',
  'communityContext',
  'futureOrientation',
] as const;

function suppressedDimensions(): Record<string, null> {
  return Object.fromEntries(DIMENSION_KEYS.map((key) => [key, null]));
}

/**
 * Generate mock statistics for demo mode when Supabase is not configured.
 */
export function generateMockStats(): MockStats {
  const today = new Date();
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split('T')[0],
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
      byRole: { clerge: 312, laic_engagé: 1089, religieux: 87, curieux: 55 },
      byDenomination: {
        catholique: 689,
        protestant: 599,
        orthodoxe: 98,
        anglican: 72,
        autre_chretien: 85,
      },
      byAge: {
        '18-35': 545,
        '36-50': 412,
        '51-65': 298,
        '66+': 288,
      },
      byGender: { femme: 701, homme: 803, autre: 21, sans_reponse: 18 },
      byCountry: { france: 902, belgique: 143, suisse: 121, canada: 98, monaco: 44 },
    },
    // 1 241 profils attribués sur 1 287 réponses : le résidu alimente le
    // panier « Non attribuable » côté admin.
    profiles: {
      gardien_tradition: 234,
      prudent_eclaire: 312,
      innovateur_ancre: 45,
      equilibriste: 361,
      pragmatique_moderne: 287,
      pionnier_spirituel: 156,
      progressiste_critique: 89,
      explorateur: 31,
    },
    scores: {
      avgReligiosity: 3.7,
      avgAIAdoption: 2.9,
      usageGapDistribution: {
        no_use: 214,
        uses_general_not_spiritual: 587,
        uses_both: 402,
        none: 84,
      },
      religiosityDistribution: { '1-2': 187, '2-3': 345, '3-4': 567, '4-5': 444 },
      aiAdoptionDistribution: { '1-2': 423, '2-3': 512, '3-4': 398, '4-5': 210 },
    },
    timeline: last30Days,
    recentResponses: Array.from({ length: 10 }, (_, i) => ({
      id: `resp-${1000 - i}`,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
      language: i % 3 === 0 ? 'en' : 'fr',
      completed: i !== 4,
      profile: ['gardien_tradition', 'equilibriste', 'pragmatique_moderne', 'pionnier_spirituel'][i % 4],
      religiosityScore: i === 4 ? 'N/A' : (2 + (i % 4) * 0.6).toFixed(1),
      aiScore: i === 4 ? 'N/A' : (1.8 + (i % 5) * 0.5).toFixed(1),
    })),
    pagination: { page: 1, limit: 20, total: 1543, totalPages: 78 },
    conversionFunnel: {
      started: 2100,
      section1Complete: 1890,
      section2Complete: 1650,
      section3Complete: 1450,
      completed: 1287,
      isEstimated: true,
    },
    segmentedAnalysis: {
      byRole: {
        clergy: {
          count: 312,
          avgReligiosity: 4.2,
          avgAiAdoption: 2.4,
          sdReligiosity: 0.71,
          sdAiAdoption: 0.94,
          profileDistribution: { gardien_tradition: 89, prudent_eclaire: 112, equilibriste: 78, pragmatique_moderne: 33 },
          usageGapDistribution: { no_use: 74, uses_general_not_spiritual: 158, uses_both: 62, none: 18 },
          dimensionAverages: { religiosity: 4.2, aiOpenness: 2.4, sacredBoundary: 3.8, ethicalConcern: 3.6, psychologicalPerception: 3.1, communityContext: 3.4, futureOrientation: 2.8 },
          dimensionSds: { religiosity: 0.71, aiOpenness: 0.94, sacredBoundary: 0.82, ethicalConcern: 0.77, psychologicalPerception: 0.86, communityContext: 0.9, futureOrientation: 0.95 },
        },
        laity: {
          count: 1089,
          avgReligiosity: 3.5,
          avgAiAdoption: 3.1,
          sdReligiosity: 0.88,
          sdAiAdoption: 0.97,
          profileDistribution: { gardien_tradition: 145, prudent_eclaire: 200, equilibriste: 283, pragmatique_moderne: 254, pionnier_spirituel: 89, progressiste_critique: 56, explorateur: 34 },
          usageGapDistribution: { no_use: 140, uses_general_not_spiritual: 429, uses_both: 340, none: 66 },
          dimensionAverages: { religiosity: 3.5, aiOpenness: 3.1, sacredBoundary: 2.9, ethicalConcern: 3.3, psychologicalPerception: 3.0, communityContext: 2.6, futureOrientation: 3.3 },
          dimensionSds: { religiosity: 0.88, aiOpenness: 0.97, sacredBoundary: 0.91, ethicalConcern: 0.8, psychologicalPerception: 0.84, communityContext: 0.93, futureOrientation: 0.89 },
        },
        // Segment sous le seuil de publication : effectif seul.
        other: {
          count: 3,
          avgReligiosity: null,
          avgAiAdoption: null,
          sdReligiosity: null,
          sdAiAdoption: null,
          profileDistribution: { explorateur: 2, equilibriste: 1 },
          usageGapDistribution: { uses_general_not_spiritual: 2, no_use: 1 },
          dimensionAverages: suppressedDimensions(),
          dimensionSds: suppressedDimensions(),
        },
      },
      byDenomination: {
        catholique: {
          count: 689,
          avgReligiosity: 3.8,
          avgAiAdoption: 2.7,
          sdReligiosity: 0.83,
          sdAiAdoption: 0.92,
          profileDistribution: { equilibriste: 234, prudent_eclaire: 189, gardien_tradition: 156, pragmatique_moderne: 110 },
          usageGapDistribution: { no_use: 120, uses_general_not_spiritual: 331, uses_both: 196, none: 42 },
          dimensionAverages: { religiosity: 3.8, aiOpenness: 2.7, sacredBoundary: 3.4, ethicalConcern: 3.5, psychologicalPerception: 3.0, communityContext: 3.0, futureOrientation: 2.9 },
          dimensionSds: { religiosity: 0.83, aiOpenness: 0.92, sacredBoundary: 0.87, ethicalConcern: 0.79, psychologicalPerception: 0.85, communityContext: 0.88, futureOrientation: 0.93 },
        },
        protestant: {
          count: 599,
          avgReligiosity: 3.6,
          avgAiAdoption: 3.2,
          sdReligiosity: 0.86,
          sdAiAdoption: 0.95,
          profileDistribution: { pragmatique_moderne: 178, equilibriste: 155, pionnier_spirituel: 156, prudent_eclaire: 110 },
          usageGapDistribution: { no_use: 82, uses_general_not_spiritual: 241, uses_both: 245, none: 31 },
          dimensionAverages: { religiosity: 3.6, aiOpenness: 3.2, sacredBoundary: 2.8, ethicalConcern: 3.2, psychologicalPerception: 3.1, communityContext: 2.8, futureOrientation: 3.4 },
          dimensionSds: { religiosity: 0.86, aiOpenness: 0.95, sacredBoundary: 0.9, ethicalConcern: 0.81, psychologicalPerception: 0.83, communityContext: 0.91, futureOrientation: 0.87 },
        },
        orthodoxe: {
          count: 98,
          avgReligiosity: 4.1,
          avgAiAdoption: 2.3,
          sdReligiosity: 0.68,
          sdAiAdoption: 0.9,
          profileDistribution: { gardien_tradition: 45, prudent_eclaire: 32, equilibriste: 21 },
          usageGapDistribution: { no_use: 34, uses_general_not_spiritual: 48, uses_both: 12, none: 4 },
          dimensionAverages: { religiosity: 4.1, aiOpenness: 2.3, sacredBoundary: 3.7, ethicalConcern: 3.6, psychologicalPerception: 2.9, communityContext: 3.4, futureOrientation: 2.5 },
          dimensionSds: { religiosity: 0.68, aiOpenness: 0.9, sacredBoundary: 0.79, ethicalConcern: 0.75, psychologicalPerception: 0.88, communityContext: 0.86, futureOrientation: 0.94 },
        },
      },
      byAge: {
        '18-35': {
          count: 545,
          avgReligiosity: 3.3,
          avgAiAdoption: 3.5,
          sdReligiosity: 0.91,
          sdAiAdoption: 0.89,
          profileDistribution: { pragmatique_moderne: 189, pionnier_spirituel: 134, equilibriste: 122 },
          usageGapDistribution: { no_use: 51, uses_general_not_spiritual: 224, uses_both: 245, none: 25 },
          dimensionAverages: { religiosity: 3.3, aiOpenness: 3.5, sacredBoundary: 2.5, ethicalConcern: 3.1, psychologicalPerception: 3.2, communityContext: 2.5, futureOrientation: 3.8 },
          dimensionSds: { religiosity: 0.91, aiOpenness: 0.89, sacredBoundary: 0.93, ethicalConcern: 0.82, psychologicalPerception: 0.8, communityContext: 0.94, futureOrientation: 0.85 },
        },
        '36-50': {
          count: 412,
          avgReligiosity: 3.7,
          avgAiAdoption: 3.0,
          sdReligiosity: 0.84,
          sdAiAdoption: 0.93,
          profileDistribution: { equilibriste: 178, prudent_eclaire: 134, pragmatique_moderne: 100 },
          usageGapDistribution: { no_use: 62, uses_general_not_spiritual: 198, uses_both: 128, none: 24 },
          dimensionAverages: { religiosity: 3.7, aiOpenness: 3.0, sacredBoundary: 3.1, ethicalConcern: 3.4, psychologicalPerception: 3.0, communityContext: 2.9, futureOrientation: 3.2 },
          dimensionSds: { religiosity: 0.84, aiOpenness: 0.93, sacredBoundary: 0.88, ethicalConcern: 0.78, psychologicalPerception: 0.86, communityContext: 0.9, futureOrientation: 0.88 },
        },
        '51-65': {
          count: 298,
          avgReligiosity: 4.0,
          avgAiAdoption: 2.5,
          sdReligiosity: 0.76,
          sdAiAdoption: 0.96,
          profileDistribution: { gardien_tradition: 112, prudent_eclaire: 98, equilibriste: 88 },
          usageGapDistribution: { no_use: 55, uses_general_not_spiritual: 168, uses_both: 58, none: 17 },
          dimensionAverages: { religiosity: 4.0, aiOpenness: 2.5, sacredBoundary: 3.6, ethicalConcern: 3.6, psychologicalPerception: 2.9, communityContext: 3.2, futureOrientation: 2.6 },
          dimensionSds: { religiosity: 0.76, aiOpenness: 0.96, sacredBoundary: 0.83, ethicalConcern: 0.77, psychologicalPerception: 0.87, communityContext: 0.89, futureOrientation: 0.92 },
        },
        '66+': {
          count: 4,
          avgReligiosity: null,
          avgAiAdoption: null,
          sdReligiosity: null,
          sdAiAdoption: null,
          profileDistribution: { gardien_tradition: 3, prudent_eclaire: 1 },
          usageGapDistribution: { no_use: 3, uses_general_not_spiritual: 1 },
          dimensionAverages: suppressedDimensions(),
          dimensionSds: suppressedDimensions(),
        },
      },
    },
    dimensionStats: {
      religiosity: { n: 1240, mean: 3.7, stdDev: 0.85, median: 3.8, distribution: [87, 245, 367, 444, 144] },
      aiOpenness: { n: 1231, mean: 2.9, stdDev: 0.95, median: 2.9, distribution: [223, 312, 398, 254, 100] },
      sacredBoundary: { n: 1198, mean: 3.2, stdDev: 0.88, median: 3.2, distribution: [112, 267, 445, 312, 151] },
      ethicalConcern: { n: 1174, mean: 3.4, stdDev: 0.78, median: 3.5, distribution: [89, 212, 423, 378, 185] },
      psychologicalPerception: { n: 1142, mean: 3.0, stdDev: 0.82, median: 3.0, distribution: [134, 289, 456, 278, 130] },
      communityContext: { n: 908, mean: 2.8, stdDev: 0.85, median: 2.8, distribution: [189, 334, 412, 234, 118] },
      // Dimension conditionnelle peu répondue : n sous le seuil, rien à publier.
      futureOrientation: { n: 3, mean: null, stdDev: null, median: null, distribution: [] },
    },
    // Paires effectivement calculables (n >= 20), avec IC de Fisher et p ajusté
    // BH. La paire sacredBoundary × sacredBoundaryCore partage ses items : c'est
    // l'artefact de méthode que l'admin doit signaler.
    correlations: [
      {
        x: 'religiosity',
        y: 'sacredBoundary',
        r: 0.612,
        n: 1198,
        ci95: [0.577, 0.645],
        pRaw: 0.00001,
        pAdjusted: 0.00006,
        sharedItems: [],
      },
      {
        x: 'aiOpenness',
        y: 'sacredBoundary',
        r: -0.548,
        n: 1181,
        ci95: [-0.586, -0.507],
        pRaw: 0.00001,
        pAdjusted: 0.00006,
        sharedItems: [],
      },
      {
        x: 'religiosity',
        y: 'aiOpenness',
        r: -0.214,
        n: 1224,
        ci95: [-0.267, -0.159],
        pRaw: 0.0002,
        pAdjusted: 0.0008,
        sharedItems: [],
      },
      {
        x: 'sacredBoundary',
        y: 'sacredBoundaryCore',
        r: 0.874,
        n: 1198,
        ci95: [0.861, 0.886],
        pRaw: 0.00001,
        pAdjusted: 0.00006,
        sharedItems: [
          'theo_inspiration',
          'theo_liturgie_ia',
          'theo_activites_sacrees',
          'theo_mediation_humaine',
        ],
      },
      {
        x: 'ethicalConcern',
        y: 'communityContext',
        r: 0.108,
        n: 891,
        ci95: [0.042, 0.173],
        pRaw: 0.0013,
        pAdjusted: 0.0042,
        sharedItems: [],
      },
      {
        x: 'psychologicalPerception',
        y: 'communityContext',
        r: 0.041,
        n: 884,
        ci95: [-0.025, 0.107],
        pRaw: 0.223,
        pAdjusted: 0.223,
        sharedItems: [],
      },
    ],
    // Toutes les paires n'atteignent pas n >= 20 (futureOrientation) : pas de matrice.
    correlationMatrix: null,
    profileClusters: [
      { profile: 'gardien_tradition', count: 234, avgReligiosity: 4.5, avgAiOpenness: 1.8 },
      { profile: 'prudent_eclaire', count: 312, avgReligiosity: 4.0, avgAiOpenness: 2.4 },
      { profile: 'innovateur_ancre', count: 45, avgReligiosity: 4.2, avgAiOpenness: 3.8 },
      { profile: 'equilibriste', count: 361, avgReligiosity: 3.5, avgAiOpenness: 3.0 },
      { profile: 'pragmatique_moderne', count: 287, avgReligiosity: 3.0, avgAiOpenness: 3.6 },
      { profile: 'pionnier_spirituel', count: 156, avgReligiosity: 3.8, avgAiOpenness: 4.2 },
      { profile: 'progressiste_critique', count: 89, avgReligiosity: 2.8, avgAiOpenness: 2.2 },
      { profile: 'explorateur', count: 4, avgReligiosity: null, avgAiOpenness: null },
    ],
    keyFindings: [
      {
        type: 'correlation',
        title: 'Corrélation positive',
        description: '« religiosity » et « sacredBoundary » : r = 0.612 (IC 95 % [0.577 ; 0.645], n = 1198, p ajusté = 0.00006).',
        significance: 'high',
      },
      {
        type: 'correlation',
        title: 'Corrélation négative',
        description: '« aiOpenness » et « sacredBoundary » : r = -0.548 (IC 95 % [-0.586 ; -0.507], n = 1181, p ajusté = 0.00006).',
        significance: 'high',
      },
      {
        type: 'segment',
        title: 'Écart clergé/laïcs sur la religiosité',
        description: 'Religiosité moyenne : clergé 4.2 (n = 312), laïcs 3.5 (n = 1089), écart de 0.7 point.',
        significance: 'medium',
      },
      {
        type: 'pattern',
        title: 'Taille d’échantillon',
        description: '1287 réponses complètes collectées.',
        significance: 'high',
      },
    ],
    feedbacks: [
      {
        id: 'resp-1000',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        language: 'fr',
        profile: 'prudent_eclaire',
        text: 'Questionnaire clair, mais j’aurais aimé pouvoir nuancer sur la prédication.',
      },
      {
        id: 'resp-0998',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        language: 'en',
        profile: 'equilibriste',
        text: 'Some questions assume a parish structure that does not match my church.',
      },
    ],
    populationAverages: {
      religiosity: 3.7,
      aiOpenness: 2.9,
      sacredBoundary: 3.2,
      ethicalConcern: 3.4,
      psychologicalPerception: 3.0,
      communityContext: 2.8,
      futureOrientation: null,
    },
    insufficientSampleSize: false,
    sampleSizeWarning: null,
    demo: true,
  };
}
