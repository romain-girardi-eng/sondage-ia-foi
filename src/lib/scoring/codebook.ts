/**
 * CODEBOOK - Survey "IA & Foi" Scoring Documentation
 *
 * This file provides comprehensive documentation of the scoring methodology
 * for FAIR (Findable, Accessible, Interoperable, Reusable) compliance.
 *
 * VERSION: 1.0.0
 * LAST UPDATED: 2026-02-03
 *
 * IMPORTANT NOTICES:
 * - Population parameters are PROVISIONAL estimates, not empirically validated
 * - 5 of 7 dimensions use exploratory constructs awaiting factor analysis validation
 * - Thresholds and weights are expert-chosen, not derived from empirical data
 * - Percentiles will be recalibrated after N≥500 responses collected
 *
 * VALIDATED INSTRUMENTS USED:
 * - CRS-5 (Huber & Huber, 2012) - Religiosity dimension
 * - Marlowe-Crowne Short Form C (Crowne & Marlowe, 1960) - Bias detection
 * - AIAS proxies (Wang & Wang, 2022) - AI anxiety indicators
 */

// ==========================================
// DIMENSION DEFINITIONS
// ==========================================

export interface DimensionCodebook {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  description: {
    fr: string;
    en: string;
  };
  scale: {
    min: number;
    max: number;
  };
  validationStatus: 'validated' | 'exploratory';
  sourceInstrument: string | null;
  biasSensitivity: number; // 0-1, higher = more susceptible to social desirability bias
  populationParams: {
    mean: number;
    stdDev: number;
    note: string;
  };
  questions: QuestionContribution[];
}

export interface QuestionContribution {
  questionId: string;
  weight: number;
  scoringLogic: string;
  conditionalOn?: string;
}

export const DIMENSION_CODEBOOK: Record<string, DimensionCodebook> = {
  religiosity: {
    id: 'religiosity',
    name: {
      fr: 'Intensité Spirituelle',
      en: 'Spiritual Intensity',
    },
    description: {
      fr: 'Centralité de la foi dans la vie quotidienne, basée sur l\'échelle CRS-5 validée',
      en: 'Centrality of faith in daily life, based on the validated CRS-5 scale',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'validated',
    sourceInstrument: 'CRS-5 (Huber & Huber, 2012)',
    biasSensitivity: 0.8,
    populationParams: {
      mean: 3.8,
      stdDev: 0.9,
      note: 'PROVISIONAL - Estimated for religious survey population, skewed high',
    },
    questions: [
      { questionId: 'crs_intellect', weight: 1.0, scoringLogic: 'jamais=1, rarement=2, occasionnellement=3, souvent=4, tres_souvent=5' },
      { questionId: 'crs_ideology', weight: 1.0, scoringLogic: 'pas_du_tout=1, peu=2, moderement=3, beaucoup=4, totalement=5' },
      { questionId: 'crs_public_practice', weight: 1.0, scoringLogic: 'jamais=1, quelques_fois_an=2, mensuel=3, hebdo=4, pluri_hebdo=5' },
      { questionId: 'crs_private_practice', weight: 1.0, scoringLogic: 'jamais=1, rarement=2, occasionnellement=3, quotidien=4, pluri_quotidien=5' },
      { questionId: 'crs_experience', weight: 1.0, scoringLogic: 'jamais=1, rarement=2, occasionnellement=3, souvent=4, tres_souvent=5' },
    ],
  },

  aiOpenness: {
    id: 'aiOpenness',
    name: {
      fr: 'Ouverture à l\'IA',
      en: 'AI Openness',
    },
    description: {
      fr: 'Disposition à adopter et utiliser l\'intelligence artificielle',
      en: 'Disposition to adopt and use artificial intelligence',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: null,
    biasSensitivity: 0.2,
    populationParams: {
      mean: 2.4,
      stdDev: 1.1,
      note: 'PROVISIONAL - Generally lower openness expected in religious context, high variance',
    },
    questions: [
      { questionId: 'ctrl_ia_frequence', weight: 2.0, scoringLogic: 'jamais=1, essaye=2, occasionnel=3, regulier=4, quotidien=5' },
      { questionId: 'ctrl_ia_confort', weight: 2.0, scoringLogic: 'Direct 1-5 scale' },
      { questionId: 'ctrl_ia_contextes', weight: 1.5, scoringLogic: '1 + (count * 0.7), max 5' },
      { questionId: 'digital_attitude_generale', weight: 0.8, scoringLogic: 'tres_negatif=1, negatif=2, neutre=3, positif=4, tres_positif=5' },
      { questionId: 'min_pred_usage', weight: 1.5, scoringLogic: 'jamais=1, rare=2, regulier=4, systematique=5', conditionalOn: 'isClergy' },
      { questionId: 'min_care_email', weight: 1.0, scoringLogic: 'non_jamais=1, oui_brouillon=3.5, oui_souvent=5', conditionalOn: 'isClergy' },
      { questionId: 'min_admin_burden', weight: 0.8, scoringLogic: 'Direct 1-5 scale', conditionalOn: 'isClergy' },
      { questionId: 'laic_substitution_priere', weight: 1.2, scoringLogic: 'non=1, oui_negatif=2.5, oui_neutre=3.5, oui_positif=5', conditionalOn: 'isLayperson' },
      { questionId: 'laic_conseil_spirituel', weight: 1.2, scoringLogic: 'jamais=1, ne_sait_pas=2.5, complement=3, oui_possible=4, deja_fait=5', conditionalOn: 'isLayperson' },
    ],
  },

  sacredBoundary: {
    id: 'sacredBoundary',
    name: {
      fr: 'Frontière Sacrée',
      en: 'Sacred Boundary',
    },
    description: {
      fr: 'Distinction entre ce qui peut être confié à l\'IA et ce qui doit rester humain/spirituel',
      en: 'Distinction between what can be entrusted to AI and what must remain human/spiritual',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: null,
    biasSensitivity: 0.5,
    populationParams: {
      mean: 3.5,
      stdDev: 1.0,
      note: 'PROVISIONAL - Tendency to protect the sacred expected in religious population',
    },
    questions: [
      { questionId: 'theo_inspiration', weight: 1.5, scoringLogic: 'possible=1.5, possible_indirect=3, ne_sait_pas=3, peu_probable=4, impossible=5' },
      { questionId: 'theo_liturgie_ia', weight: 2.0, scoringLogic: 'Inverted 1-5 scale (6 - value)' },
      { questionId: 'theo_activites_sacrees', weight: 2.0, scoringLogic: 'aucune=1, otherwise 1 + (count * 0.9), max 5' },
      { questionId: 'theo_mediation_humaine', weight: 1.8, scoringLogic: 'non_pas_necessairement=1.5, ne_sait_pas=3, partiellement=3, oui_pour_essentiel=4, oui_absolument=5' },
      { questionId: 'ctrl_ia_contextes', weight: 1.5, scoringLogic: 'Uses AI but NOT for spiritual = 4.5; uses for spiritual = 2; no AI = 3' },
      { questionId: 'min_pred_sentiment', weight: 1.2, scoringLogic: 'Direct scale (high = uncomfortable = high boundary)', conditionalOn: 'isClergy' },
      { questionId: 'min_pred_usage', weight: 1.0, scoringLogic: 'jamais=5, systematique=1.5', conditionalOn: 'isClergy' },
      { questionId: 'min_care_email', weight: 0.8, scoringLogic: 'non_jamais=5', conditionalOn: 'isClergy' },
      { questionId: 'laic_substitution_priere', weight: 1.0, scoringLogic: 'non=4.5, other=2', conditionalOn: 'isLayperson' },
      { questionId: 'laic_conseil_spirituel', weight: 1.0, scoringLogic: 'jamais=5, deja_fait=1', conditionalOn: 'isLayperson' },
    ],
  },

  ethicalConcern: {
    id: 'ethicalConcern',
    name: {
      fr: 'Préoccupation Éthique',
      en: 'Ethical Concern',
    },
    description: {
      fr: 'Niveau d\'inquiétude face aux implications éthiques de l\'IA',
      en: 'Level of concern about the ethical implications of AI',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: null,
    biasSensitivity: 0.7,
    populationParams: {
      mean: 3.8,
      stdDev: 0.8,
      note: 'PROVISIONAL - High concern is normative in religious contexts',
    },
    questions: [
      { questionId: 'theo_risque_futur', weight: 2.0, scoringLogic: 'aucune=1, ne_sait_pas=2.5, autre=3.5, paresse=4, deshumanisation=4.5, heresie=4.5' },
      { questionId: 'theo_utilite_percue', weight: 1.5, scoringLogic: 'Inverted: tres_positif=1, positif=2, ne_sait_pas=3, neutre=3, negatif=4, tres_negatif=5' },
      { questionId: 'psych_anxiete_remplacement', weight: 1.5, scoringLogic: 'non_impossible=1.5, non_peu_probable=2, ne_sait_pas=3, possible_partiel=3.5, oui_probable=4.5, oui_certain=5' },
      { questionId: 'psych_aias_opacity', weight: 1.5, scoringLogic: 'non_confiance=1, non_indifferent=1.5, peu=2.5, oui_moderement=4, oui_fortement=5' },
      { questionId: 'psych_imago_dei', weight: 1.3, scoringLogic: 'pas_du_tout=1, peu=2, ne_sait_pas=2.5, moderement=3, beaucoup=4, totalement=5' },
      { questionId: 'min_pred_sentiment', weight: 1.2, scoringLogic: 'Direct scale', conditionalOn: 'isClergy' },
    ],
  },

  psychologicalPerception: {
    id: 'psychologicalPerception',
    name: {
      fr: 'Perception de l\'IA',
      en: 'AI Perception',
    },
    description: {
      fr: 'Comment on perçoit la nature de l\'IA et son rapport à l\'humain',
      en: 'How one perceives the nature of AI and its relationship to humanity',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: 'Partial Godspeed Scale (Bartneck et al., 2009)',
    biasSensitivity: 0.2,
    populationParams: {
      mean: 3.0,
      stdDev: 0.9,
      note: 'PROVISIONAL - Neutral/Uncertain expected',
    },
    questions: [
      { questionId: 'psych_godspeed_nature', weight: 2.0, scoringLogic: '1_machine=1, 2_machine_plus=2, 3_neutre=3, 4_humain_moins=4, 5_humain=5' },
      { questionId: 'psych_godspeed_conscience', weight: 2.5, scoringLogic: 'impossible=1, imitation=2, incertain=3, possible_emergence=4, probable=5' },
      { questionId: 'psych_imago_dei', weight: 1.8, scoringLogic: 'pas_du_tout=1, peu=2, ne_sait_pas=3, moderement=3, beaucoup=4, totalement=5' },
      { questionId: 'psych_anxiete_remplacement', weight: 1.5, scoringLogic: 'non_impossible=1, non_peu_probable=2, ne_sait_pas=3, possible_partiel=3, oui_probable=4, oui_certain=5' },
      { questionId: 'theo_inspiration', weight: 1.3, scoringLogic: 'impossible=1, peu_probable=2, ne_sait_pas=3, possible_indirect=3.5, possible=4.5' },
    ],
  },

  communityInfluence: {
    id: 'communityInfluence',
    name: {
      fr: 'Ancrage Communautaire',
      en: 'Community Anchoring',
    },
    description: {
      fr: 'Importance de la communauté dans les choix concernant l\'IA',
      en: 'Importance of community in choices concerning AI',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: null,
    biasSensitivity: 0.3,
    populationParams: {
      mean: 2.8,
      stdDev: 0.9,
      note: 'PROVISIONAL - Moderate community influence expected',
    },
    questions: [
      { questionId: 'communaute_position_officielle', weight: 1.5, scoringLogic: 'Awareness: oui_*=4, non=2, ne_sait_pas=2' },
      { questionId: 'communaute_discussions', weight: 2.0, scoringLogic: 'jamais=1, rarement=2, parfois=3, souvent=4, organise=5' },
      { questionId: 'communaute_perception_pairs', weight: 1.5, scoringLogic: 'Engagement: ne_sait_pas=1.5, neutre=3, others=3.5-4' },
      { questionId: 'theo_orientation', weight: 0.8, scoringLogic: 'traditionaliste/progressiste=3.5, ne_sait_pas=2' },
      { questionId: 'profil_statut', weight: 1.0, scoringLogic: 'laic_engagé/clerge/religieux=4, curieux=2' },
      { questionId: 'profil_taille_communaute', weight: 0.7, scoringLogic: 'tres_petite=2.5, petite=3, moyenne=3.5, grande/tres_grande=4, ne_sait_pas=2.5' },
    ],
  },

  futureOrientation: {
    id: 'futureOrientation',
    name: {
      fr: 'Orientation Future',
      en: 'Future Orientation',
    },
    description: {
      fr: 'Volonté d\'évoluer dans son rapport à l\'IA',
      en: 'Willingness to evolve one\'s relationship with AI',
    },
    scale: { min: 1, max: 5 },
    validationStatus: 'exploratory',
    sourceInstrument: null,
    biasSensitivity: 0.4,
    populationParams: {
      mean: 3.2,
      stdDev: 1.0,
      note: 'PROVISIONAL - Slightly positive skew expected',
    },
    questions: [
      { questionId: 'futur_intention_usage', weight: 2.0, scoringLogic: 'non_certain=1, non_probable=2, ne_sait_pas=2.5, peut_etre=3, oui_probable=4, oui_certain=5' },
      { questionId: 'futur_formation_souhait', weight: 2.0, scoringLogic: 'non_pas_du_tout=1, non_pas_vraiment=2, peut_etre=3, oui_assez=4, oui_tres=5' },
      { questionId: 'futur_domaines_interet', weight: 1.5, scoringLogic: 'aucun_domaines=1, otherwise 1 + (count * 0.6), max 5' },
      { questionId: 'ctrl_ia_frequence', weight: 1.0, scoringLogic: 'jamais=2, essaye=3, occasionnel=3.5, regulier=4, quotidien=4.5' },
      { questionId: 'profil_age', weight: 0.6, scoringLogic: '18-35=3.8, 36-50=3.5, 51-65=3, 66+=2.5' },
      { questionId: 'digital_attitude_generale', weight: 0.8, scoringLogic: 'tres_negatif=1, negatif=2, neutre=3, positif=4, tres_positif=4.5' },
    ],
  },
};

// ==========================================
// PROFILE DEFINITIONS
// ==========================================

export interface ProfileCodebook {
  id: string;
  name: {
    fr: string;
    en: string;
  };
  emoji: string;
  idealDimensions: {
    religiosity: [number, number];
    aiOpenness: [number, number];
    sacredBoundary: [number, number];
    ethicalConcern: [number, number];
    psychologicalPerception: [number, number];
    communityInfluence: [number, number];
    futureOrientation: [number, number];
  };
  weights: {
    religiosity: number;
    aiOpenness: number;
    sacredBoundary: number;
    ethicalConcern: number;
    psychologicalPerception: number;
    communityInfluence: number;
    futureOrientation: number;
  };
  subProfiles: string[];
}

export const PROFILE_CODEBOOK: Record<string, ProfileCodebook> = {
  gardien_tradition: {
    id: 'gardien_tradition',
    name: { fr: 'Gardien de la Tradition', en: 'Tradition Guardian' },
    emoji: '🏛️',
    idealDimensions: {
      religiosity: [4, 5],
      aiOpenness: [1, 2.5],
      sacredBoundary: [4, 5],
      ethicalConcern: [3.5, 5],
      psychologicalPerception: [3, 5],
      communityInfluence: [3.5, 5],
      futureOrientation: [1, 2.5],
    },
    weights: {
      religiosity: 1.2,
      aiOpenness: 1.5,
      sacredBoundary: 1.5,
      ethicalConcern: 1.0,
      psychologicalPerception: 0.8,
      communityInfluence: 1.0,
      futureOrientation: 0.8,
    },
    subProfiles: ['protecteur_sacre', 'sage_prudent', 'berger_communautaire'],
  },
  prudent_eclaire: {
    id: 'prudent_eclaire',
    name: { fr: 'Prudent Éclairé', en: 'Enlightened Cautious' },
    emoji: '🔍',
    idealDimensions: {
      religiosity: [3.5, 5],
      aiOpenness: [2, 3.5],
      sacredBoundary: [3, 4.5],
      ethicalConcern: [3, 4.5],
      psychologicalPerception: [2.5, 4],
      communityInfluence: [3, 4.5],
      futureOrientation: [2, 3.5],
    },
    weights: {
      religiosity: 1.2,
      aiOpenness: 1.3,
      sacredBoundary: 1.2,
      ethicalConcern: 1.1,
      psychologicalPerception: 0.9,
      communityInfluence: 1.0,
      futureOrientation: 1.0,
    },
    subProfiles: ['analyste_spirituel', 'discerneur_pastoral', 'observateur_engage'],
  },
  innovateur_ancre: {
    id: 'innovateur_ancre',
    name: { fr: 'Innovateur Ancré', en: 'Anchored Innovator' },
    emoji: '⚓',
    idealDimensions: {
      religiosity: [4, 5],
      aiOpenness: [4, 5],
      sacredBoundary: [2, 3.5],
      ethicalConcern: [2, 3.5],
      psychologicalPerception: [2, 4],
      communityInfluence: [2.5, 4],
      futureOrientation: [4, 5],
    },
    weights: {
      religiosity: 1.4,
      aiOpenness: 1.4,
      sacredBoundary: 1.1,
      ethicalConcern: 0.9,
      psychologicalPerception: 0.8,
      communityInfluence: 0.9,
      futureOrientation: 1.2,
    },
    subProfiles: ['pont_generationnel', 'evangeliste_digital', 'theologien_techno'],
  },
  equilibriste: {
    id: 'equilibriste',
    name: { fr: 'Équilibriste Spirituel', en: 'Spiritual Balancer' },
    emoji: '⚖️',
    idealDimensions: {
      religiosity: [2.5, 4],
      aiOpenness: [2.5, 3.5],
      sacredBoundary: [2.5, 3.5],
      ethicalConcern: [2.5, 3.5],
      psychologicalPerception: [2.5, 3.5],
      communityInfluence: [2.5, 4],
      futureOrientation: [2.5, 3.5],
    },
    weights: {
      religiosity: 1.0,
      aiOpenness: 1.0,
      sacredBoundary: 1.0,
      ethicalConcern: 1.0,
      psychologicalPerception: 1.0,
      communityInfluence: 1.1,
      futureOrientation: 1.0,
    },
    subProfiles: ['mediateur', 'chercheur_sens', 'adaptateur_prudent'],
  },
  pragmatique_moderne: {
    id: 'pragmatique_moderne',
    name: { fr: 'Pragmatique Moderne', en: 'Modern Pragmatist' },
    emoji: '🚀',
    idealDimensions: {
      religiosity: [2.5, 4],
      aiOpenness: [3.5, 5],
      sacredBoundary: [1.5, 3],
      ethicalConcern: [1.5, 3],
      psychologicalPerception: [1.5, 3],
      communityInfluence: [2, 3.5],
      futureOrientation: [3.5, 5],
    },
    weights: {
      religiosity: 0.9,
      aiOpenness: 1.4,
      sacredBoundary: 1.2,
      ethicalConcern: 1.1,
      psychologicalPerception: 0.9,
      communityInfluence: 0.8,
      futureOrientation: 1.3,
    },
    subProfiles: ['efficace_engage', 'communicateur_digital', 'optimisateur_pastoral'],
  },
  pionnier_spirituel: {
    id: 'pionnier_spirituel',
    name: { fr: 'Pionnier Spirituel', en: 'Spiritual Pioneer' },
    emoji: '🌟',
    idealDimensions: {
      religiosity: [2, 4.5],
      aiOpenness: [4, 5],
      sacredBoundary: [1, 2.5],
      ethicalConcern: [1, 3],
      psychologicalPerception: [2, 4],
      communityInfluence: [1.5, 3],
      futureOrientation: [4, 5],
    },
    weights: {
      religiosity: 0.8,
      aiOpenness: 1.5,
      sacredBoundary: 1.4,
      ethicalConcern: 1.0,
      psychologicalPerception: 1.0,
      communityInfluence: 0.8,
      futureOrientation: 1.4,
    },
    subProfiles: ['visionnaire', 'experimentateur', 'prophete_digital'],
  },
  progressiste_critique: {
    id: 'progressiste_critique',
    name: { fr: 'Progressiste Critique', en: 'Critical Progressive' },
    emoji: '🤔',
    idealDimensions: {
      religiosity: [2, 4],
      aiOpenness: [2, 3.5],
      sacredBoundary: [2.5, 4],
      ethicalConcern: [4, 5],
      psychologicalPerception: [3, 4.5],
      communityInfluence: [2, 3.5],
      futureOrientation: [3, 4.5],
    },
    weights: {
      religiosity: 0.9,
      aiOpenness: 1.1,
      sacredBoundary: 1.1,
      ethicalConcern: 1.5,
      psychologicalPerception: 1.2,
      communityInfluence: 0.8,
      futureOrientation: 1.1,
    },
    subProfiles: ['ethicien', 'reformateur_social', 'philosophe_spirituel'],
  },
  explorateur: {
    id: 'explorateur',
    name: { fr: 'Explorateur', en: 'Explorer' },
    emoji: '🧭',
    idealDimensions: {
      religiosity: [1.5, 3.5],
      aiOpenness: [2, 4],
      sacredBoundary: [2, 4],
      ethicalConcern: [2, 4],
      psychologicalPerception: [2, 4],
      communityInfluence: [1.5, 3],
      futureOrientation: [3, 4.5],
    },
    weights: {
      religiosity: 0.9,
      aiOpenness: 0.8,
      sacredBoundary: 0.8,
      ethicalConcern: 0.8,
      psychologicalPerception: 0.8,
      communityInfluence: 0.9,
      futureOrientation: 1.2,
    },
    subProfiles: ['curieux_spirituel', 'novice_technologique', 'chercheur_seculier'],
  },
};

// ==========================================
// BIAS DETECTION (Marlowe-Crowne)
// ==========================================

export interface BiasDetectionCodebook {
  instrument: string;
  citation: string;
  items: {
    questionId: string;
    highBiasAnswer: 'true' | 'false';
    description: string;
  }[];
  scoring: {
    formula: string;
    ranges: {
      low: { range: [number, number]; confidence: number };
      moderate: { range: [number, number]; confidence: number };
      high: { range: [number, number]; confidence: number };
      veryHigh: { range: [number, number]; confidence: number };
    };
  };
  dimensionSensitivities: {
    [dimensionId: string]: number;
  };
}

export const BIAS_DETECTION_CODEBOOK: BiasDetectionCodebook = {
  instrument: 'Marlowe-Crowne Social Desirability Scale - Short Form C',
  citation: 'Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.',
  items: [
    { questionId: 'ctrl_mc_1', highBiasAnswer: 'false', description: 'Claims to not need encouragement (false claim of independence)' },
    { questionId: 'ctrl_mc_2', highBiasAnswer: 'true', description: 'Claims to never intensely dislike anyone (saintly claim)' },
    { questionId: 'ctrl_mc_3', highBiasAnswer: 'false', description: 'Claims to never rebel against authority (perfect rationality)' },
    { questionId: 'ctrl_mc_4', highBiasAnswer: 'true', description: 'Claims to always be courteous (perfect manners)' },
    { questionId: 'ctrl_mc_5', highBiasAnswer: 'false', description: 'Claims to never take advantage of anyone (moral perfection)' },
  ],
  scoring: {
    formula: '(biasPoints / answeredCount) * 10 → normalized 0-10 scale',
    ranges: {
      low: { range: [0, 3], confidence: 1.0 },
      moderate: { range: [4, 6], confidence: 0.9 },
      high: { range: [7, 8], confidence: 0.8 },
      veryHigh: { range: [9, 10], confidence: 0.7 },
    },
  },
  dimensionSensitivities: {
    religiosity: 0.8,
    aiOpenness: 0.2,
    sacredBoundary: 0.5,
    ethicalConcern: 0.7,
    psychologicalPerception: 0.2,
    communityInfluence: 0.3,
    futureOrientation: 0.4,
  },
};

// ==========================================
// PROFILE MATCHING ALGORITHM PARAMETERS
// ==========================================

export interface AlgorithmParameters {
  name: string;
  description: string;
  value: number;
  empiricallyValidated: boolean;
  justification: string;
}

export const ALGORITHM_PARAMETERS: AlgorithmParameters[] = [
  {
    name: 'EXPONENTIAL_DECAY',
    description: 'Controls distance to match score conversion (score = 100 * exp(-distance * DECAY))',
    value: 0.5,
    empiricallyValidated: false,
    justification: 'Expert choice: distance of 2 ≈ 50% match, distance of 4 ≈ 25% match',
  },
  {
    name: 'SECONDARY_PROFILE_THRESHOLD',
    description: 'Minimum match score (%) to display as secondary profile',
    value: 10,
    empiricallyValidated: false,
    justification: 'Expert choice: avoid showing very weak secondary matches',
  },
  {
    name: 'TERTIARY_PROFILE_THRESHOLD',
    description: 'Minimum match score (%) to display as tertiary profile',
    value: 5,
    empiricallyValidated: false,
    justification: 'Expert choice: only show relevant tertiary matches',
  },
  {
    name: 'BIAS_ADJUSTMENT_THRESHOLD',
    description: 'Minimum bias score to trigger score adjustment',
    value: 4,
    empiricallyValidated: false,
    justification: 'Based on Marlowe-Crowne interpretation guidelines',
  },
  {
    name: 'MAX_BIAS_DEFLATION',
    description: 'Maximum points deducted from dimension score due to bias',
    value: 1.0,
    empiricallyValidated: false,
    justification: 'Conservative adjustment to avoid over-correction',
  },
];

// ==========================================
// FAIR COMPLIANCE METADATA
// ==========================================

export interface FAIRMetadata {
  identifier: string | null;
  version: string;
  license: string;
  creator: string;
  dateCreated: string;
  dateModified: string;
  description: {
    fr: string;
    en: string;
  };
  keywords: string[];
  validatedInstruments: string[];
  exploratoryConstructs: string[];
  limitationsAcknowledged: string[];
  recommendedCitations: string[];
}

export const FAIR_METADATA: FAIRMetadata = {
  identifier: null, // TODO: Assign DOI via Zenodo or OSF
  version: '1.0.0',
  license: 'CC-BY-4.0',
  creator: 'Romain Girardi',
  dateCreated: '2025-01-01',
  dateModified: '2026-02-03',
  description: {
    fr: 'Système de profilage pour l\'étude "IA & Foi Chrétienne" - Outil exploratoire mesurant les attitudes des chrétiens face à l\'IA dans les pratiques spirituelles.',
    en: 'Profiling system for the "AI & Christian Faith" study - Exploratory tool measuring Christian attitudes toward AI in spiritual practices.',
  },
  keywords: [
    'artificial intelligence',
    'religion',
    'Christianity',
    'psychometrics',
    'CRS-5',
    'social desirability',
    'spirituality',
    'digital transformation',
  ],
  validatedInstruments: [
    'CRS-5 (Centrality of Religiosity Scale - Huber & Huber, 2012)',
    'Marlowe-Crowne Social Desirability Scale - Short Form C (1960)',
    'Godspeed Scale (partial - Bartneck et al., 2009)',
  ],
  exploratoryConstructs: [
    'AI Openness',
    'Sacred Boundary',
    'Ethical Concern',
    'Community Influence',
    'Future Orientation',
  ],
  limitationsAcknowledged: [
    'Population parameters are provisional estimates requiring empirical validation (N≥500)',
    '5 of 7 dimensions use exploratory constructs without factor analysis validation',
    'Profile matching thresholds are expert-chosen, not empirically derived',
    'Question weights are based on face validity, not confirmatory factor analysis',
    'Sample is self-selected (not representative of general Christian population)',
    'Cross-cultural validity not established (French-English only)',
  ],
  recommendedCitations: [
    'Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724. https://doi.org/10.3390/rel3030710',
    'Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.',
    'Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.',
    'Bartneck, C., et al. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. IJSR, 1(1), 71-81.',
  ],
};

// ==========================================
// EXPORT CODEBOOK AS JSON
// ==========================================

export function exportCodebookAsJSON(): string {
  return JSON.stringify({
    _metadata: {
      exportDate: new Date().toISOString(),
      version: FAIR_METADATA.version,
      description: 'Complete scoring methodology codebook for IA & Foi survey',
    },
    fairMetadata: FAIR_METADATA,
    dimensions: DIMENSION_CODEBOOK,
    profiles: PROFILE_CODEBOOK,
    biasDetection: BIAS_DETECTION_CODEBOOK,
    algorithmParameters: ALGORITHM_PARAMETERS,
  }, null, 2);
}
