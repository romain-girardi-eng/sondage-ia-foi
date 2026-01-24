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
  profileId: PrimaryProfile
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

  return totalWeight > 0 ? totalDistance / totalWeight : 10;
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
function calculateAllProfileMatches(dimensions: SevenDimensions): ProfileMatch[] {
  const profiles = Object.keys(PROFILE_DEFINITIONS) as PrimaryProfile[];

  const matches: ProfileMatch[] = profiles.map(profileId => {
    const distance = calculateProfileDistance(dimensions, profileId);
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
  dimensions: SevenDimensions,
  primary: ProfileMatch,
  answers: Answers
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
      description: 'Vous êtes ouvert à l\'IA en général mais maintenez une réserve pour le spirituel.',
      suggestion: 'Clarifiez ce qui distingue un usage spirituel d\'un usage pratique de l\'IA.',
    });
  }

  // High ethical concern + High future orientation = productive tension
  if (dimensions.ethicalConcern.value >= 4 && dimensions.futureOrientation.value >= 4) {
    tensions.push({
      dimension1: 'ethicalConcern',
      dimension2: 'futureOrientation',
      description: 'Vous voulez avancer mais avec prudence éthique.',
      suggestion: 'Cette tension est créative : elle peut vous conduire à une adoption responsable.',
    });
  }

  // Low community influence + High religiosity = independence
  if (dimensions.communityInfluence.value <= 2 && dimensions.religiosity.value >= 4) {
    tensions.push({
      dimension1: 'communityInfluence',
      dimension2: 'religiosity',
      description: 'Foi profonde mais peu influencée par la communauté.',
      suggestion: 'Enrichissez votre réflexion par le dialogue avec d\'autres croyants.',
    });
  }

  // High psychological perception + Low ethical concern = interesting
  if (dimensions.psychologicalPerception.value >= 4 && dimensions.ethicalConcern.value <= 2) {
    tensions.push({
      dimension1: 'psychologicalPerception',
      dimension2: 'ethicalConcern',
      description: 'Vous réfléchissez à la nature de l\'IA mais sans inquiétude particulière.',
      suggestion: 'Votre approche philosophique pourrait gagner à considérer les implications pratiques.',
    });
  }

  return tensions.slice(0, 3);
}

// ==========================================
// GROWTH AREAS
// ==========================================

function identifyGrowthAreas(
  dimensions: SevenDimensions,
  primary: ProfileMatch
): GrowthArea[] {
  const growthAreas: GrowthArea[] = [];

  // Based on dimensions that are either very low or could complement the profile

  if (dimensions.aiOpenness.value <= 2.5 && dimensions.futureOrientation.value >= 3) {
    growthAreas.push({
      area: 'Exploration technologique',
      currentState: 'Réserve face à l\'IA',
      potentialGrowth: 'Découvrir des usages qui correspondent à vos valeurs',
      actionableStep: 'Essayez un outil d\'IA simple dans un contexte non spirituel pour vous familiariser',
    });
  }

  if (dimensions.communityInfluence.value <= 2 && dimensions.religiosity.value >= 3) {
    growthAreas.push({
      area: 'Dialogue communautaire',
      currentState: 'Réflexion plutôt individuelle',
      potentialGrowth: 'Enrichir votre perspective par l\'échange',
      actionableStep: 'Initiez une conversation sur l\'IA avec un membre de votre communauté',
    });
  }

  if (dimensions.ethicalConcern.value <= 2 && dimensions.aiOpenness.value >= 4) {
    growthAreas.push({
      area: 'Réflexion éthique',
      currentState: 'Adoption sans réserves particulières',
      potentialGrowth: 'Développer un regard critique constructif',
      actionableStep: 'Lisez un article sur les enjeux éthiques de l\'IA dans un domaine qui vous concerne',
    });
  }

  if (dimensions.sacredBoundary.value >= 4.5 && dimensions.futureOrientation.value >= 3) {
    growthAreas.push({
      area: 'Expérimentation encadrée',
      currentState: 'Frontière sacrée très marquée',
      potentialGrowth: 'Tester prudemment certains usages sans compromettre l\'essentiel',
      actionableStep: 'Identifiez un usage administratif où l\'IA pourrait vous libérer du temps pour le relationnel',
    });
  }

  if (dimensions.futureOrientation.value <= 2) {
    growthAreas.push({
      area: 'Ouverture au changement',
      currentState: 'Satisfaction avec l\'approche actuelle',
      potentialGrowth: 'Rester informé des évolutions sans nécessairement les adopter',
      actionableStep: 'Suivez occasionnellement l\'actualité de l\'IA dans le domaine religieux',
    });
  }

  return growthAreas.slice(0, 3);
}

// ==========================================
// MAIN FUNCTION: Calculate Complete Profile Spectrum
// ==========================================

export function calculateProfileSpectrum(answers: Answers): ProfileSpectrum {
  // Step 1: Calculate all 7 dimensions
  const dimensions = calculateAllDimensions(answers);

  // Step 2: Calculate matches for all profiles
  const allMatches = calculateAllProfileMatches(dimensions);

  // Step 3: Extract top 3 profiles
  const primary = allMatches[0];
  const secondary = allMatches[1]?.matchScore >= 10 ? allMatches[1] : null;
  const tertiary = allMatches[2]?.matchScore >= 5 ? allMatches[2] : null;

  // Step 4: Determine sub-profile
  const subProfile = determineSubProfile(dimensions, primary.profile, answers);

  // Step 5: Generate interpretation
  const interpretation = generateInterpretation(dimensions, primary, secondary, subProfile);

  // Step 6: Generate advanced insights
  const insights = generateAdvancedInsights(dimensions, primary, answers);

  // Step 7: Identify tensions
  const tensions = identifyTensions(dimensions);

  // Step 8: Identify growth areas
  const growthAreas = identifyGrowthAreas(dimensions, primary);

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
