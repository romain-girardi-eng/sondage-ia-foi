/**
 * Advanced Scoring System - Main Exports
 *
 * This module provides a sophisticated multi-dimensional profiling system
 * for analyzing spiritual-AI attitudes and behaviors.
 *
 * Key features:
 * - 7 dimensions of analysis (religiosity, AI openness, sacred boundary, etc.)
 * - 8 primary profiles with spectrum-based matching
 * - 24 sub-profiles for nuanced characterization
 * - Tension point identification
 * - Growth area recommendations
 * - Advanced personalized insights
 */

// Types
export * from './types';

// Constants (profile definitions, colors, etc.)
export * from './constants';

// Dimension calculations
export {
  calculateReligiosityDimension,
  calculateAIOpennessDimension,
  calculateSacredBoundaryDimension,
  calculateEthicalConcernDimension,
  calculatePsychologicalPerceptionDimension,
  calculateCommunityInfluenceDimension,
  calculateFutureOrientationDimension,
  calculateAllDimensions,
} from './dimensions';

// Bias calculations
export {
  calculateSocialDesirabilityScore,
  getBiasConfidenceMultiplier,
} from './bias';

// Profile matching and spectrum
export {
  calculateProfileSpectrum,
  getSimpleProfile,
  getEnhancedProfileData,
} from './profiles';

// ==========================================
// LEGACY COMPATIBILITY EXPORTS
// These maintain backward compatibility with the old scoring system
// ==========================================

import type { Answers } from '@/data';
import { calculateReligiosityDimension, calculateAIOpennessDimension } from './dimensions';
import { calculateProfileSpectrum, getSimpleProfile } from './profiles';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from './constants';
import type { PrimaryProfile } from './types';

// Legacy CRS-5 score (1-5)
export function calculateCRS5Score(answers: Answers): number {
  return calculateReligiosityDimension(answers).value;
}

// Legacy AI adoption score (1-5)
export function calculateAIAdoptionScore(answers: Answers): number {
  return calculateAIOpennessDimension(answers).value;
}

// Legacy religiosity levels
export type ReligiosityLevel = 'non_religieux' | 'peu_religieux' | 'religieux' | 'tres_religieux';

export function getReligiosityLevel(score: number): ReligiosityLevel {
  if (score < 2) return 'non_religieux';
  if (score < 3) return 'peu_religieux';
  if (score < 4) return 'religieux';
  return 'tres_religieux';
}

export const RELIGIOSITY_LABELS: Record<ReligiosityLevel, string> = {
  'non_religieux': 'Peu religieux',
  'peu_religieux': 'Modérément religieux',
  'religieux': 'Religieux',
  'tres_religieux': 'Hautement religieux'
};

// Legacy AI adoption levels
export type AIAdoptionLevel = 'resistant' | 'prudent' | 'ouvert' | 'enthousiaste';

export function getAIAdoptionLevel(score: number): AIAdoptionLevel {
  if (score < 2) return 'resistant';
  if (score < 3) return 'prudent';
  if (score < 4) return 'ouvert';
  return 'enthousiaste';
}

export const AI_ADOPTION_LABELS: Record<AIAdoptionLevel, string> = {
  'resistant': 'Résistant',
  'prudent': 'Prudent',
  'ouvert': 'Ouvert',
  'enthousiaste': 'Enthousiaste'
};

// Legacy theological orientation
export type TheologicalOrientation = 'traditionaliste' | 'modere' | 'progressiste' | 'ne_sait_pas';

export function getTheologicalOrientation(answers: Answers): TheologicalOrientation {
  const orientation = answers['theo_orientation'];
  if (typeof orientation === 'string') {
    return orientation as TheologicalOrientation;
  }
  return 'ne_sait_pas';
}

export const THEOLOGICAL_LABELS: Record<TheologicalOrientation, string> = {
  'traditionaliste': 'Traditionaliste',
  'modere': 'Modéré',
  'progressiste': 'Progressiste',
  'ne_sait_pas': 'Non défini'
};

// Legacy profile type (uses new system under the hood)
export type SpiritualAIProfile = PrimaryProfile;

export function getSpiritualAIProfile(answers: Answers): SpiritualAIProfile {
  return getSimpleProfile(answers);
}

// Legacy profile data (enhanced version)
export const PROFILE_DATA: Record<SpiritualAIProfile, {
  title: string;
  emoji: string;
  description: string;
  strength: string;
  challenge: string;
}> = {
  gardien_tradition: {
    title: PROFILE_DEFINITIONS.gardien_tradition.title,
    emoji: PROFILE_DEFINITIONS.gardien_tradition.emoji,
    description: PROFILE_DEFINITIONS.gardien_tradition.shortDescription,
    strength: PROFILE_DEFINITIONS.gardien_tradition.coreMotivation,
    challenge: 'Rester ouvert aux outils qui pourraient enrichir votre ministère'
  },
  prudent_eclaire: {
    title: PROFILE_DEFINITIONS.prudent_eclaire.title,
    emoji: PROFILE_DEFINITIONS.prudent_eclaire.emoji,
    description: PROFILE_DEFINITIONS.prudent_eclaire.shortDescription,
    strength: PROFILE_DEFINITIONS.prudent_eclaire.coreMotivation,
    challenge: 'Approfondir votre connaissance des possibilités de l\'IA'
  },
  innovateur_ancre: {
    title: PROFILE_DEFINITIONS.innovateur_ancre.title,
    emoji: PROFILE_DEFINITIONS.innovateur_ancre.emoji,
    description: PROFILE_DEFINITIONS.innovateur_ancre.shortDescription,
    strength: PROFILE_DEFINITIONS.innovateur_ancre.coreMotivation,
    challenge: 'Communiquer votre vision aux plus réticents'
  },
  equilibriste: {
    title: PROFILE_DEFINITIONS.equilibriste.title,
    emoji: PROFILE_DEFINITIONS.equilibriste.emoji,
    description: PROFILE_DEFINITIONS.equilibriste.shortDescription,
    strength: PROFILE_DEFINITIONS.equilibriste.coreMotivation,
    challenge: 'Éviter l\'indécision face aux opportunités'
  },
  pragmatique_moderne: {
    title: PROFILE_DEFINITIONS.pragmatique_moderne.title,
    emoji: PROFILE_DEFINITIONS.pragmatique_moderne.emoji,
    description: PROFILE_DEFINITIONS.pragmatique_moderne.shortDescription,
    strength: PROFILE_DEFINITIONS.pragmatique_moderne.coreMotivation,
    challenge: 'Maintenir la dimension contemplative dans un monde accéléré'
  },
  pionnier_spirituel: {
    title: PROFILE_DEFINITIONS.pionnier_spirituel.title,
    emoji: PROFILE_DEFINITIONS.pionnier_spirituel.emoji,
    description: PROFILE_DEFINITIONS.pionnier_spirituel.shortDescription,
    strength: PROFILE_DEFINITIONS.pionnier_spirituel.coreMotivation,
    challenge: 'Rester en communion avec ceux qui avancent plus lentement'
  },
  progressiste_critique: {
    title: PROFILE_DEFINITIONS.progressiste_critique.title,
    emoji: PROFILE_DEFINITIONS.progressiste_critique.emoji,
    description: PROFILE_DEFINITIONS.progressiste_critique.shortDescription,
    strength: PROFILE_DEFINITIONS.progressiste_critique.coreMotivation,
    challenge: 'Ne pas passer à côté d\'outils réellement utiles'
  },
  explorateur: {
    title: PROFILE_DEFINITIONS.explorateur.title,
    emoji: PROFILE_DEFINITIONS.explorateur.emoji,
    description: PROFILE_DEFINITIONS.explorateur.shortDescription,
    strength: PROFILE_DEFINITIONS.explorateur.coreMotivation,
    challenge: 'Clarifier vos convictions pour mieux orienter vos choix'
  }
};

// Legacy General AI Score (baseline usage)
export function calculateGeneralAIScore(answers: Answers): number {
  let score = 0;
  let items = 0;

  // Fréquence générale d'usage IA
  const freq = answers['ctrl_ia_frequence'];
  if (typeof freq === 'string') {
    const freqScores: Record<string, number> = {
      'jamais': 1, 'essaye': 2, 'occasionnel': 3, 'regulier': 4, 'quotidien': 5
    };
    if (freqScores[freq]) {
      score += freqScores[freq];
      items++;
    }
  }

  // Niveau de confort avec l'IA
  const confort = answers['ctrl_ia_confort'];
  if (typeof confort === 'number') {
    score += confort;
    items++;
  }

  // Nombre de contextes d'usage (0-6 → 1-5)
  const contextes = answers['ctrl_ia_contextes'];
  if (Array.isArray(contextes)) {
    const contextScore = Math.min(5, 1 + contextes.length);
    score += contextScore;
    items++;
  }

  return items > 0 ? Math.round((score / items) * 10) / 10 : 1;
}

// Legacy Spiritual AI Score (spiritual-specific usage)
export function calculateSpiritualAIScore(answers: Answers): number {
  let score = 0;
  let items = 0;

  // Clergy: prédication
  const predUsage = answers['min_pred_usage'];
  if (typeof predUsage === 'string') {
    const usageScores: Record<string, number> = {
      'jamais': 1, 'rare': 2, 'regulier': 4, 'systematique': 5
    };
    if (usageScores[predUsage]) {
      score += usageScores[predUsage];
      items++;
    }
  }

  // Clergy: soin pastoral
  const careEmail = answers['min_care_email'];
  if (typeof careEmail === 'string') {
    const careScores: Record<string, number> = {
      'non_jamais': 1, 'oui_brouillon': 3, 'oui_souvent': 5
    };
    if (careScores[careEmail]) {
      score += careScores[careEmail];
      items++;
    }
  }

  // Laïc: prière générée
  const laicPriere = answers['laic_substitution_priere'];
  if (typeof laicPriere === 'string') {
    const priereScores: Record<string, number> = {
      'non': 1, 'oui_bof': 3, 'oui': 5
    };
    if (priereScores[laicPriere]) {
      score += priereScores[laicPriere];
      items++;
    }
  }

  // Laïc: conseil spirituel
  const laicConseil = answers['laic_conseil_spirituel'];
  if (typeof laicConseil === 'string') {
    const conseilScores: Record<string, number> = {
      'jamais': 1, 'complement': 3, 'oui_possible': 4, 'deja_fait': 5
    };
    if (conseilScores[laicConseil]) {
      score += conseilScores[laicConseil];
      items++;
    }
  }

  // Contexte spirituel coché?
  const contextes = answers['ctrl_ia_contextes'];
  if (Array.isArray(contextes) && contextes.includes('spirituel')) {
    score += 5;
    items++;
  } else if (Array.isArray(contextes)) {
    score += 1;
    items++;
  }

  return items > 0 ? Math.round((score / items) * 10) / 10 : 1;
}

// Legacy resistance calculation
export function calculateSpiritualResistanceIndex(answers: Answers): number {
  const generalScore = calculateGeneralAIScore(answers);
  const spiritualScore = calculateSpiritualAIScore(answers);
  // Index: différence normalisée (-4 à +4)
  return Math.round((generalScore - spiritualScore) * 10) / 10;
}

export type ResistanceLevel = 'aucune' | 'faible' | 'moderee' | 'forte';

export function getResistanceLevel(index: number): ResistanceLevel {
  if (index <= 0) return 'aucune';
  if (index < 1) return 'faible';
  if (index < 2) return 'moderee';
  return 'forte';
}

export const RESISTANCE_LABELS: Record<ResistanceLevel, string> = {
  'aucune': 'Aucune résistance spécifique',
  'faible': 'Légère réserve',
  'moderee': 'Résistance modérée',
  'forte': 'Forte résistance au spirituel'
};

// Legacy percentile comparison
export function getPercentileComparison(score: number, type: 'religiosity' | 'ai_adoption'): number {
  const mean = type === 'religiosity' ? 3.5 : 2.8;
  const stdDev = 0.8;
  const zScore = (score - mean) / stdDev;
  const percentile = Math.round(50 * (1 + Math.tanh(zScore * 0.8)));
  return Math.max(1, Math.min(99, percentile));
}

// Legacy insights
export interface PersonalizedInsight {
  category: 'spirituality' | 'technology' | 'ethics' | 'community';
  icon: string;
  title: string;
  message: string;
}

export function generateInsights(answers: Answers): PersonalizedInsight[] {
  const spectrum = calculateProfileSpectrum(answers);

  // Convert advanced insights to legacy format
  return spectrum.insights.map(insight => ({
    category: (insight.category === 'spiritual' ? 'spirituality' :
              insight.category === 'technological' ? 'technology' :
              insight.category === 'ethical' ? 'ethics' : 'community') as PersonalizedInsight['category'],
    icon: insight.icon,
    title: insight.title,
    message: insight.message,
  })).slice(0, 3);
}

// New: Get sub-profile data
export function getSubProfileData(subProfileId: string) {
  return SUB_PROFILE_DEFINITIONS[subProfileId as keyof typeof SUB_PROFILE_DEFINITIONS];
}

// New: Get dimension scores with labels
export function getDimensionScores(answers: Answers) {
  const spectrum = calculateProfileSpectrum(answers);
  return spectrum.dimensions;
}
