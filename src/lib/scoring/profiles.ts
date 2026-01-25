/**
 * Profile Matching and Spectrum Calculation
 * Sophisticated multi-dimensional profile assignment with sub-profiles
 */

import type { Answers } from '@/data';
import type {
  SevenDimensions,
  PrimaryProfile,
  SubProfileType,
  ProfileMatch,
  SubProfileMatch,
  ProfileSpectrum,
  ProfileInterpretation,
  AdvancedInsight,
  TensionPoint,
  GrowthArea,
} from './types';
import { calculateAllDimensions } from './dimensions';
import { calculateSocialDesirabilityScore, getBiasConfidenceMultiplier } from './bias';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from './constants';

// ========================================== 
// PROFILE MATCHING ALGORITHM
// ========================================== 

/**
 * Calculate the distance between actual dimension values and a profile's ideal range
 * Lower distance = better match
 */
function calculateProfileDistance(
  dimensions: SevenDimensions,
  profileId: PrimaryProfile,
  answers: Answers,
  biasScore: number
): number {
  const profile = PROFILE_DEFINITIONS[profileId];
  let totalDistance = 0;
  let totalWeight = 0;

  const dimensionKeys = Object.keys(dimensions) as (keyof SevenDimensions)[];

  for (const dimKey of dimensionKeys) {
    const dimValue = dimensions[dimKey].value;
    const [idealMin, idealMax] = profile.idealDimensions[dimKey];
    const weight = profile.weights[dimKey];

    let distance = 0;
    if (dimValue < idealMin) {
      distance = idealMin - dimValue;
    } else if (dimValue > idealMax) {
      distance = dimValue - idealMax;
    }
    // If within range, distance is 0

    // Weight the distance by dimension importance for this profile
    totalDistance += distance * weight;
    totalWeight += weight;
  }

  // Calculate bias confidence - high bias reduces the weight of self-reported identity bonuses
  const biasConfidence = getBiasConfidenceMultiplier(biasScore);

  // Apply theological orientation bonus/penalty (weighted by bias confidence)
  // If user has high social desirability bias, we trust their self-reported label less
  const theoBonus = getTheologicalOrientationBonus(profileId, answers) * biasConfidence;
  totalDistance -= theoBonus;

  // Apply special profile adjustments based on answer patterns (weighted by bias confidence)
  const specialBonus = getSpecialProfileBonus(profileId, dimensions, answers) * biasConfidence;
  totalDistance -= specialBonus;

  return Math.max(0, totalWeight > 0 ? totalDistance / totalWeight : 10);
}

/**
 * Bonus based on explicit theological orientation answer
 * This ensures self-identification has strong influence
 */
function getTheologicalOrientationBonus(profileId: PrimaryProfile, answers: Answers): number {
  const orientation = typeof answers['theo_orientation'] === 'string' ? answers['theo_orientation'] : '';

  // Strong bonuses for matching orientation
  if (orientation === 'traditionaliste') {
    if (profileId === 'gardien_tradition') return 1.5;
    if (profileId === 'prudent_eclaire') return 0.8;
    if (profileId === 'innovateur_ancre') return 0.5;
    if (profileId === 'progressiste_critique') return -0.5;
    if (profileId === 'pionnier_spirituel') return -0.3;
  }

  if (orientation === 'progressiste') {
    if (profileId === 'progressiste_critique') return 1.5;
    if (profileId === 'pionnier_spirituel') return 1.2;
    if (profileId === 'gardien_tradition') return -1.0;
    if (profileId === 'prudent_eclaire') return -0.3;
  }

  if (orientation === 'modere') {
    if (profileId === 'equilibriste') return 1.2;
    if (profileId === 'pragmatique_moderne') return 0.8;
    if (profileId === 'prudent_eclaire') return 0.3;
  }

  if (orientation === 'ne_sait_pas') {
    if (profileId === 'explorateur') return 1.5;
    if (profileId === 'equilibriste') return 0.3;
  }

  return 0;
}

/**
 * Special bonuses for specific profile patterns that the dimension-based
 * matching might miss
 */
function getSpecialProfileBonus(
  profileId: PrimaryProfile,
  dimensions: SevenDimensions,
  answers: Answers
): number {
  let bonus = 0;
  const orientation = typeof answers['theo_orientation'] === 'string' ? answers['theo_orientation'] : '';

  // Progressiste Critique: High ethical concern is THE key signal
  if (profileId === 'progressiste_critique') {
    if (dimensions.ethicalConcern.value >= 4) bonus += 1.2;
    if (dimensions.ethicalConcern.value >= 4.5) bonus += 0.8;
    // Progressiste theology + ethical concern = strong fit
    if (orientation === 'progressiste' && dimensions.ethicalConcern.value >= 3.5) bonus += 0.8;
    // High ethical concern + moderate AI openness (not enthusiast) = critical mindset
    if (dimensions.ethicalConcern.value >= 3.5 && dimensions.aiOpenness.value >= 2 && dimensions.aiOpenness.value <= 4) {
      bonus += 0.6;
    }
  }

  // Equilibriste: ONLY when dimensions are truly centered AND theology is moderate
  // Reduce bonus to avoid over-assignment
  if (profileId === 'equilibriste') {
    let centeredCount = 0;
    const dims = [dimensions.aiOpenness, dimensions.sacredBoundary, dimensions.ethicalConcern,
                  dimensions.psychologicalPerception, dimensions.futureOrientation];
    for (const dim of dims) {
      // Tighter range for "centered"
      if (dim.value >= 2.5 && dim.value <= 3.5) centeredCount++;
    }
    // Only bonus if MOST dimensions are truly centered
    if (centeredCount >= 4) bonus += 0.7;
    else if (centeredCount >= 3 && orientation === 'modere') bonus += 0.4;
    // Penalty if not really centered
    if (centeredCount <= 2) bonus -= 0.3;
  }

  // Pionnier Spirituel: Progressive + high AI + low sacred boundary + VISION
  if (profileId === 'pionnier_spirituel') {
    // Progressiste theology is a strong signal for pioneer (vs pragmatic)
    if (orientation === 'progressiste') {
      bonus += 1.5;
      if (dimensions.aiOpenness.value >= 4) bonus += 1.0;
    }
    // Key combination: very permeable boundary + high AI
    if (dimensions.sacredBoundary.value <= 2.5 && dimensions.aiOpenness.value >= 4) {
      bonus += 1.2;
    }
    // Very high future orientation = visionary
    if (dimensions.futureOrientation.value >= 4.5) bonus += 0.8;
    if (dimensions.aiOpenness.value >= 4.5) bonus += 0.5;
    // Very low sacred boundary = truly pioneering
    if (dimensions.sacredBoundary.value <= 2) bonus += 0.5;
    // Interested in spiritual domains with AI
    const domainesInteret = Array.isArray(answers['futur_domaines_interet']) ? answers['futur_domaines_interet'] : [];
    if (domainesInteret.includes('priere_meditation') && dimensions.aiOpenness.value >= 4) bonus += 0.5;
  }

  // Innovateur Ancré: MUST be traditionaliste + high religiosity + high AI
  if (profileId === 'innovateur_ancre') {
    if (orientation === 'traditionaliste') {
      if (dimensions.religiosity.value >= 4.5 && dimensions.aiOpenness.value >= 4) bonus += 1.5;
      if (dimensions.religiosity.value >= 4 && dimensions.aiOpenness.value >= 4.5) bonus += 1.2;
    } else {
      // Penalty if not traditionaliste
      bonus -= 0.5;
    }
  }

  // Pragmatique Moderne: Action-oriented, low ethical fuss, high AI adoption
  // BUT should NOT win over pionnier when theology is progressiste
  if (profileId === 'pragmatique_moderne') {
    // Penalty for progressiste or ne_sait_pas theology - these belong to pionnier/explorateur
    if (orientation === 'progressiste') bonus -= 0.8;
    if (orientation === 'ne_sait_pas') bonus -= 0.5;

    // Core: Low ethical concern + high AI = pragmatic approach
    if (dimensions.ethicalConcern.value <= 2 && dimensions.aiOpenness.value >= 4) bonus += 0.8;
    else if (dimensions.ethicalConcern.value <= 2.5 && dimensions.aiOpenness.value >= 3.5) bonus += 0.5;

    // Moderate theology is the sweet spot for pragmatique
    if (orientation === 'modere') {
      bonus += 0.8;
      if (dimensions.aiOpenness.value >= 3.5) bonus += 0.4;
    }

    // High future orientation + moderate on other things = pragmatic modern
    if (dimensions.futureOrientation.value >= 4 && dimensions.aiOpenness.value >= 3.5 && orientation === 'modere') {
      bonus += 0.3;
    }

    // Interested in administrative/communication domains = pragmatic
    const domainesInteret = Array.isArray(answers['futur_domaines_interet']) ? answers['futur_domaines_interet'] : [];
    if (domainesInteret.includes('administration') || domainesInteret.includes('communication')) {
      bonus += 0.3;
    }
  }

  // Explorateur: Uncertainty markers, recent faith, or seeking mode
  if (profileId === 'explorateur') {
    // Theological uncertainty is a STRONG signal for explorer
    if (orientation === 'ne_sait_pas') {
      bonus += 2.0; // Very strong bonus for explicit theological uncertainty
    }

    // Many "ne_sait_pas" answers indicate exploration
    let uncertaintyCount = 0;
    const uncertaintyAnswers = ['psych_godspeed_conscience', 'psych_imago_dei', 'psych_anxiete_remplacement',
                                'theo_inspiration', 'theo_risque_futur', 'theo_utilite_percue'];
    for (const key of uncertaintyAnswers) {
      if (answers[key] === 'ne_sait_pas') uncertaintyCount++;
    }
    if (uncertaintyCount >= 3) bonus += 1.5;
    else if (uncertaintyCount >= 2) bonus += 0.8;
    else if (uncertaintyCount >= 1) bonus += 0.3;

    // Lower religiosity + exploration mode
    if (dimensions.religiosity.value <= 3) bonus += 0.5;

    // Low community influence = more independent exploration
    if (dimensions.communityInfluence.value <= 2.5) bonus += 0.4;

    // Recent faith (shorter faith history) suggests exploration
    const anciennete = typeof answers['profil_anciennete_foi'] === 'string' ? answers['profil_anciennete_foi'] : '';
    if (anciennete === 'moins_1_an' || anciennete === '1_5_ans') bonus += 0.8;
    if (anciennete === '5_10_ans') bonus += 0.3;

    // "Curieux" status = explicit explorer
    const statut = typeof answers['profil_statut'] === 'string' ? answers['profil_statut'] : '';
    if (statut === 'curieux') bonus += 1.0;
  }

  // Prudent Éclairé: traditionalist-leaning but moderate AI approach
  if (profileId === 'prudent_eclaire') {
    // Penalty to avoid over-assignment
    if (orientation === 'progressiste') bonus -= 0.5;
    // Only strong fit if truly cautious approach
    if (dimensions.sacredBoundary.value >= 4 && dimensions.aiOpenness.value <= 3) bonus += 0.4;
  }

  return bonus;
}

/**
 * Convert distance to a match score (0-100)
 * Uses exponential decay for natural feel
 */
function distanceToMatchScore(distance: number): number {
  // A distance of 0 = 100% match
  // A distance of 2 ≈ 50% match
  // A distance of 4 ≈ 25% match
  const score = 100 * Math.exp(-distance * 0.5);
  return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Calculate match scores for all profiles
 */
function calculateAllProfileMatches(
  dimensions: SevenDimensions, 
  answers: Answers,
  biasScore: number
): ProfileMatch[] {
  const profiles = Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[];

  const matches: ProfileMatch[] = profiles.map(profileId => {
    const distance = calculateProfileDistance(dimensions, profileId, answers, biasScore);
    const matchScore = distanceToMatchScore(distance);
    return { profile: profileId, matchScore, distance };
  });

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  // Normalize so top 3-4 profiles sum to 100%
  const topMatches = matches.slice(0, 4);
  const totalScore = topMatches.reduce((sum, m) => sum + m.matchScore, 0);

  if (totalScore > 0) {
    topMatches.forEach(m => {
      m.matchScore = Math.round((m.matchScore / totalScore) * 100);
    });
  }

  return matches;
}

// ========================================== 
// SUB-PROFILE DETERMINATION
// ========================================== 

function determineSubProfile(
  dimensions: SevenDimensions,
  primaryProfile: PrimaryProfile,
  answers: Answers
): SubProfileMatch {
  const profileDef = PROFILE_DEFINITIONS[primaryProfile];
  const subProfileIds = profileDef.subProfiles;

  let bestMatch: SubProfileType = subProfileIds[0];
  let bestScore = 0;

  for (const subId of subProfileIds) {
    const subDef = SUB_PROFILE_DEFINITIONS[subId];
    let score = 0;

    for (const pattern of subDef.idealPattern) {
      const dimValue = dimensions[pattern.dimension].value;

      if (pattern.emphasis === 'high' && dimValue >= 4) {
        score += 2;
      } else if (pattern.emphasis === 'high' && dimValue >= 3.5) {
        score += 1;
      } else if (pattern.emphasis === 'low' && dimValue <= 2) {
        score += 2;
      } else if (pattern.emphasis === 'low' && dimValue <= 2.5) {
        score += 1;
      } else if (pattern.emphasis === 'moderate' && dimValue >= 2.5 && dimValue <= 3.5) {
        score += 1.5;
      }
    }

    // Add specific bonuses based on answers for more nuanced matching
    score += getSubProfileBonus(subId, answers, dimensions);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = subId;
    }
  }

  const subDef = SUB_PROFILE_DEFINITIONS[bestMatch];
  return {
    subProfile: bestMatch,
    matchScore: Math.round(Math.min(100, bestScore * 20)),
    description: subDef.description,
  };
}

/**
 * Additional scoring bonuses for sub-profiles based on specific answer patterns
 */
function getSubProfileBonus(
  subId: SubProfileType,
  answers: Answers,
  dimensions: SevenDimensions
): number {
  let bonus = 0;

  const statut = typeof answers['profil_statut'] === 'string' ? answers['profil_statut'] : '';
  const isClergy = ['clerge', 'religieux'].includes(statut);
  const formationSouhait = typeof answers['futur_formation_souhait'] === 'string' ? answers['futur_formation_souhait'] : '';
  const domainesInteret = Array.isArray(answers['futur_domaines_interet']) ? answers['futur_domaines_interet'] : [];
  const risqueFutur = typeof answers['theo_risque_futur'] === 'string' ? answers['theo_risque_futur'] : '';

  switch (subId) {
    case 'protecteur_sacre':
      // High sacred boundary + specific theological concerns
      if (dimensions.sacredBoundary.value >= 4.5) bonus += 1;
      break;

    case 'sage_prudent':
      // Moderate future orientation (not closed, but cautious)
      if (dimensions.futureOrientation.value >= 2 && dimensions.futureOrientation.value <= 3.5) bonus += 0.5;
      if (formationSouhait === 'peut_etre') bonus += 0.5;
      break;

    case 'berger_communautaire':
      if (isClergy) bonus += 1;
      if (dimensions.communityInfluence.value >= 4) bonus += 0.5;
      break;

    case 'analyste_spirituel':
      if (formationSouhait === 'oui_tres' || formationSouhait === 'oui_assez') bonus += 1;
      break;

    case 'discerneur_pastoral':
      if (isClergy) bonus += 0.8;
      if (risqueFutur === 'deshumanisation') bonus += 0.5;
      break;

    case 'evangeliste_digital':
      if (domainesInteret.includes('communication')) bonus += 1;
      if (domainesInteret.includes('catechese')) bonus += 0.5;
      break;

    case 'theologien_techno':
      if (dimensions.psychologicalPerception.value >= 3.5) bonus += 0.5;
      break;

    case 'pont_generationnel':
      if (dimensions.communityInfluence.value >= 3.5) bonus += 0.5;
      break;

    case 'efficace_engage':
      if (domainesInteret.includes('administration')) bonus += 1;
      break;

    case 'communicateur_digital':
      if (domainesInteret.includes('communication') || domainesInteret.includes('reseaux_sociaux')) bonus += 1;
      break;

    case 'optimisateur_pastoral':
      if (isClergy && domainesInteret.includes('accompagnement')) bonus += 1;
      break;

    case 'visionnaire':
      if (dimensions.futureOrientation.value >= 4.5) bonus += 1;
      break;

    case 'experimentateur':
      if (domainesInteret.length >= 4) bonus += 0.5;
      break;

    case 'ethicien':
      if (risqueFutur === 'deshumanisation' || risqueFutur === 'heresie') bonus += 1;
      break;

    case 'reformateur_social':
      if (risqueFutur === 'deshumanisation') bonus += 0.5;
      break;

    case 'novice_technologique':
      if (dimensions.religiosity.value >= 4 && dimensions.aiOpenness.value <= 2.5) bonus += 1;
      break;

    case 'chercheur_seculier':
      if (dimensions.religiosity.value <= 2.5 && dimensions.aiOpenness.value >= 3) bonus += 1;
      break;
  }

  return bonus;
}

// ========================================== 
// INTERPRETATION GENERATION
// ========================================== 

function generateInterpretation(
  dimensions: SevenDimensions,
  primary: ProfileMatch,
  secondary: ProfileMatch | null,
  subProfile: SubProfileMatch
): ProfileInterpretation {
  const primaryDef = PROFILE_DEFINITIONS[primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[subProfile.subProfile];

  // Generate headline based on profile and sub-profile
  let headline = `${primaryDef.title}`;
  if (secondary && secondary.matchScore >= 15) {
    headline += ` avec des tendances ${PROFILE_DEFINITIONS[secondary.profile].title.split(' ')[0]}`;
  }

  // Build narrative
  let narrative = primaryDef.fullDescription.split('.').slice(0, 2).join('.') + '.';
  if (subProfile.matchScore >= 60) {
    narrative += ` Plus spécifiquement, ${subDef.description.charAt(0).toLowerCase() + subDef.description.slice(1)}`;
  }

  // Identify unique aspects
  const uniqueAspects: string[] = [];

  // High religiosity + high AI openness is unique
  if (dimensions.religiosity.value >= 4 && dimensions.aiOpenness.value >= 4) {
    uniqueAspects.push('Rare combinaison de foi intense et d\'enthousiasme technologique');
  }

  // High ethical concern + high AI openness shows nuance
  if (dimensions.ethicalConcern.value >= 4 && dimensions.aiOpenness.value >= 3.5) {
    uniqueAspects.push('Capacité à adopter l\'IA tout en maintenant une vigilance éthique');
  }

  // High sacred boundary + high future orientation shows intentional discernment
  if (dimensions.sacredBoundary.value >= 4 && dimensions.futureOrientation.value >= 3.5) {
    uniqueAspects.push('Protection du sacré combinée à une ouverture au progrès');
  }

  // Low community influence + high religiosity shows independent faith
  if (dimensions.communityInfluence.value <= 2.5 && dimensions.religiosity.value >= 3.5) {
    uniqueAspects.push('Foi personnelle développée indépendamment des influences communautaires');
  }

  if (uniqueAspects.length === 0) {
    uniqueAspects.push('Profil équilibré reflétant une approche réfléchie');
  }

  // Identify blind spots based on profile
  const blindSpots: string[] = [];

  if (dimensions.aiOpenness.value <= 2) {
    blindSpots.push('Risque de passer à côté d\'outils réellement utiles par excès de prudence');
  }
  if (dimensions.aiOpenness.value >= 4.5 && dimensions.ethicalConcern.value <= 2) {
    blindSpots.push('Enthousiasme qui pourrait manquer de recul critique');
  }
  if (dimensions.communityInfluence.value >= 4.5) {
    blindSpots.push('Possible difficulté à développer une position personnelle indépendante');
  }
  if (dimensions.sacredBoundary.value <= 1.5) {
    blindSpots.push('Frontière poreuse qui pourrait diluer la spécificité du spirituel');
  }

  if (blindSpots.length === 0) {
    blindSpots.push('Aucun angle mort majeur identifié');
  }

  // Strengths from profile and sub-profile
  const strengths = [
    primaryDef.coreMotivation,
    ...subDef.distinguishingTraits.slice(0, 2),
  ];

  return {
    headline,
    narrative,
    uniqueAspects,
    blindSpots,
    strengths,
  };
}

// ========================================== 
// ADVANCED INSIGHTS
// ========================================== 

 
function generateAdvancedInsights(
  dimensions: SevenDimensions
): AdvancedInsight[] {
  const insights: AdvancedInsight[] = [];

  // Spiritual intensity insight
  if (dimensions.religiosity.value >= 4.5) {
    insights.push({
      category: 'spiritual',
      icon: '🙏',
      title: 'Foi vivante et centrale',
      message: 'Votre pratique religieuse est exceptionnellement riche. Cette profondeur spirituelle est un ancrage précieux pour discerner l\'usage de l\'IA.',
      priority: 5,
    });
  } else if (dimensions.religiosity.value <= 2) {
    insights.push({
      category: 'spiritual',
      icon: '🌱',
      title: 'Chemin spirituel en évolution',
      message: 'Votre foi est en phase d\'exploration. L\'IA pourrait être un compagnon de recherche, mais les rencontres humaines restent irremplaçables.',
      priority: 4,
    });
  }

  // Technology adoption insight
  if (dimensions.aiOpenness.value >= 4.5) {
    insights.push({
      category: 'technological',
      icon: '⚡',
      title: 'Pionnier technologique',
      message: 'Vous faites partie des 15% les plus ouverts à l\'IA. Votre expérience peut éclairer d\'autres croyants plus hésitants.',
      priority: 4,
    });
  } else if (dimensions.aiOpenness.value <= 1.8) {
    insights.push({
      category: 'technological',
      icon: '🛡️',
      title: 'Prudence technologique assumée',
      message: 'Votre réserve face à l\'IA témoigne d\'une sagesse face aux modes. Cette prudence peut protéger l\'essentiel.',
      priority: 3,
    });
  }

  // Sacred boundary insight
  if (dimensions.sacredBoundary.value >= 4.5) {
    insights.push({
      category: 'spiritual',
      icon: '⛪',
      title: 'Gardien du sacré',
      message: 'Vous maintenez une frontière claire entre le profane et le sacré. Cette distinction est théologiquement significative.',
      priority: 4,
    });
  } else if (dimensions.sacredBoundary.value <= 1.5 && dimensions.aiOpenness.value >= 3.5) {
    insights.push({
      category: 'spiritual',
      icon: '🌊',
      title: 'Spiritualité fluide',
      message: 'Vous voyez l\'IA comme potentiellement présente dans tous les aspects de la vie, y compris spirituels. Une approche audacieuse qui mérite discernement.',
      priority: 3,
    });
  }

  // Ethical concern insight
  if (dimensions.ethicalConcern.value >= 4.5) {
    insights.push({
      category: 'ethical',
      icon: '⚖️',
      title: 'Conscience éthique aiguë',
      message: 'Vos préoccupations éthiques sont profondes. Ce sens critique est précieux dans un monde qui adopte souvent les technologies sans recul.',
      priority: 4,
    });
  }

  // Psychological perception insight
  if (dimensions.psychologicalPerception.value >= 4.5) {
    insights.push({
      category: 'developmental',
      icon: '🤔',
      title: 'Questionnement anthropologique',
      message: 'Vous vous interrogez profondément sur la nature de l\'IA et son rapport à l\'humain. Ces questions théologiques méritent d\'être approfondies.',
      priority: 3,
    });
  }

  // Community insight
  if (dimensions.communityInfluence.value >= 4.5) {
    insights.push({
      category: 'relational',
      icon: '👥',
      title: 'Ancrage communautaire fort',
      message: 'Votre communauté joue un rôle important dans votre réflexion. Ce lien peut être une force pour un discernement collectif.',
      priority: 3,
    });
  }

  // Future orientation insight
  if (dimensions.futureOrientation.value >= 4.5) {
    insights.push({
      category: 'developmental',
      icon: '🚀',
      title: 'Tournée vers l\'avenir',
      message: 'Vous êtes très ouvert à faire évoluer votre rapport à l\'IA. Cette disposition à apprendre est un atout pour s\'adapter aux changements.',
      priority: 3,
    });
  } else if (dimensions.futureOrientation.value <= 1.5) {
    insights.push({
      category: 'developmental',
      icon: '⚓',
      title: 'Stabilité assumée',
      message: 'Vous n\'envisagez pas de changer significativement votre approche. Cette constance peut être sagesse ou résistance au changement.',
      priority: 2,
    });
  }

  // Sort by priority and take top 4
  insights.sort((a, b) => b.priority - a.priority);
  return insights.slice(0, 4);
}

// ========================================== 
// TENSION POINTS
// ========================================== 

function identifyTensions(dimensions: SevenDimensions): TensionPoint[] {
  const tensions: TensionPoint[] = [];

  // High AI openness + High sacred boundary = tension
  if (dimensions.aiOpenness.value >= 3.5 && dimensions.sacredBoundary.value >= 4) {
    tensions.push({
      dimension1: 'aiOpenness',
      dimension2: 'sacredBoundary',
      description: 'tension_ai_sacred',
      suggestion: 'tension_ai_sacred_suggestion',
    });
  }

  // High ethical concern + High future orientation = productive tension
  if (dimensions.ethicalConcern.value >= 4 && dimensions.futureOrientation.value >= 4) {
    tensions.push({
      dimension1: 'ethicalConcern',
      dimension2: 'futureOrientation',
      description: 'tension_ethical_future',
      suggestion: 'tension_ethical_future_suggestion',
    });
  }

  // Low community influence + High religiosity = independence
  if (dimensions.communityInfluence.value <= 2 && dimensions.religiosity.value >= 4) {
    tensions.push({
      dimension1: 'communityInfluence',
      dimension2: 'religiosity',
      description: 'tension_community_faith',
      suggestion: 'tension_community_faith_suggestion',
    });
  }

  // High psychological perception + Low ethical concern = interesting
  if (dimensions.psychologicalPerception.value >= 4 && dimensions.ethicalConcern.value <= 2) {
    tensions.push({
      dimension1: 'psychologicalPerception',
      dimension2: 'ethicalConcern',
      description: 'tension_perception_ethics',
      suggestion: 'tension_perception_ethics_suggestion',
    });
  }

  return tensions.slice(0, 3);
}

// ========================================== 
// GROWTH AREAS
// ========================================== 

 
function identifyGrowthAreas(
  dimensions: SevenDimensions
): GrowthArea[] {
  const growthAreas: GrowthArea[] = [];

  // Based on dimensions that are either very low or could complement the profile

  if (dimensions.aiOpenness.value <= 2.5 && dimensions.futureOrientation.value >= 3) {
    growthAreas.push({
      area: 'exploration_tech',
      currentState: 'exploration_tech_current',
      potentialGrowth: 'exploration_tech_potential',
      actionableStep: 'exploration_tech_action',
    });
  }

  if (dimensions.communityInfluence.value <= 2 && dimensions.religiosity.value >= 3) {
    growthAreas.push({
      area: 'community_dialogue',
      currentState: 'community_dialogue_current',
      potentialGrowth: 'community_dialogue_potential',
      actionableStep: 'community_dialogue_action',
    });
  }

  if (dimensions.ethicalConcern.value <= 2 && dimensions.aiOpenness.value >= 4) {
    growthAreas.push({
      area: 'ethical_reflection',
      currentState: 'ethical_reflection_current',
      potentialGrowth: 'ethical_reflection_potential',
      actionableStep: 'ethical_reflection_action',
    });
  }

  if (dimensions.sacredBoundary.value >= 4.5 && dimensions.futureOrientation.value >= 3) {
    growthAreas.push({
      area: 'guided_experimentation',
      currentState: 'guided_experimentation_current',
      potentialGrowth: 'guided_experimentation_potential',
      actionableStep: 'guided_experimentation_action',
    });
  }

  if (dimensions.futureOrientation.value <= 2) {
    growthAreas.push({
      area: 'openness_change',
      currentState: 'openness_change_current',
      potentialGrowth: 'openness_change_potential',
      actionableStep: 'openness_change_action',
    });
  }

  return growthAreas.slice(0, 3);
}

// ========================================== 
// MAIN FUNCTION: Calculate Complete Profile Spectrum
// ========================================== 

export function calculateProfileSpectrum(answers: Answers): ProfileSpectrum {
  // Step 1: Calculate all 7 dimensions
  // This already computes bias internally for adjustment
  // But we need the bias score specifically for profile matching adjustment too
  const biasScore = calculateSocialDesirabilityScore(answers);
  const dimensions = calculateAllDimensions(answers);

  // Step 2: Calculate matches for all profiles
  // Now passing biasScore to allow confidence weighting
  const allMatches = calculateAllProfileMatches(dimensions, answers, biasScore);

  // Step 3: Extract top 3 profiles
  const primary = allMatches[0];
  const secondary = allMatches[1]?.matchScore >= 10 ? allMatches[1] : null;
  const tertiary = allMatches[2]?.matchScore >= 5 ? allMatches[2] : null;

  // Step 4: Determine sub-profile
  const subProfile = determineSubProfile(dimensions, primary.profile, answers);

  // Step 5: Generate interpretation
  const interpretation = generateInterpretation(dimensions, primary, secondary, subProfile);

  // Step 6: Generate advanced insights
  const insights = generateAdvancedInsights(dimensions);

  // Step 7: Identify tensions
  const tensions = identifyTensions(dimensions);

  // Step 8: Identify growth areas
  const growthAreas = identifyGrowthAreas(dimensions);

  return {
    primary,
    secondary,
    tertiary,
    allMatches,
    subProfile,
    dimensions,
    interpretation,
    insights,
    tensions,
    growthAreas,
  };
}

// ========================================== 
// UTILITY FUNCTIONS FOR LEGACY COMPATIBILITY
// ========================================== 

/**
 * Get simple profile type (for backward compatibility)
 */
export function getSimpleProfile(answers: Answers): PrimaryProfile {
  const spectrum = calculateProfileSpectrum(answers);
  return spectrum.primary.profile;
}

/**
 * Get profile data for display (enhanced version)
 */
export function getEnhancedProfileData(answers: Answers) {
  const spectrum = calculateProfileSpectrum(answers);
  const primaryDef = PROFILE_DEFINITIONS[spectrum.primary.profile];
  const subDef = SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile];

  return {
    profile: spectrum.primary.profile,
    title: `${primaryDef.title} - ${subDef.title}`,
    emoji: `${primaryDef.emoji}${subDef.emoji}`,
    description: spectrum.interpretation.narrative,
    matchPercentage: spectrum.primary.matchScore,
    secondaryProfile: spectrum.secondary ? {
      profile: spectrum.secondary.profile,
      title: PROFILE_DEFINITIONS[spectrum.secondary.profile].title,
      matchPercentage: spectrum.secondary.matchScore,
    } : null,
    dimensions: spectrum.dimensions,
    strengths: spectrum.interpretation.strengths,
    blindSpots: spectrum.interpretation.blindSpots,
    insights: spectrum.insights,
    tensions: spectrum.tensions,
    growthAreas: spectrum.growthAreas,
  };
}