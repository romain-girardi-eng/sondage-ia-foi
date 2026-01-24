import type { Answers } from "@/data";

// ==========================================
// CRS-5 SCORING (Centrality of Religiosity Scale)
// Huber & Huber (2012) - Score 1-5
// ==========================================

const CRS_SCORE_MAP: Record<string, number> = {
  // Intellect & Ideology
  'jamais': 1, 'pas_du_tout': 1,
  'rarement': 2, 'peu': 2,
  'occasionnellement': 3, 'moderement': 3,
  'souvent': 4, 'beaucoup': 4,
  'tres_souvent': 5, 'totalement': 5,
  // Public & Private practice
  'quelques_fois_an': 2,
  'mensuel': 3,
  'hebdo': 4,
  'pluri_hebdo': 5,
  'quotidien': 4,
  'pluri_quotidien': 5,
};

export function calculateCRS5Score(answers: Answers): number {
  const crsQuestions = [
    'crs_intellect',
    'crs_ideology',
    'crs_public_practice',
    'crs_private_practice',
    'crs_experience'
  ];

  let total = 0;
  let count = 0;

  for (const qId of crsQuestions) {
    const answer = answers[qId];
    if (typeof answer === 'string' && CRS_SCORE_MAP[answer] !== undefined) {
      total += CRS_SCORE_MAP[answer];
      count++;
    }
  }

  return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

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

// ==========================================
// AI ADOPTION SCORING
// ==========================================

export type AIAdoptionLevel = 'resistant' | 'prudent' | 'ouvert' | 'enthousiaste';

// ==========================================
// GENERAL AI USAGE SCORE (Baseline - tous répondants)
// ==========================================

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

// ==========================================
// SPIRITUAL AI USAGE SCORE (Usage spirituel spécifique)
// ==========================================

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

// ==========================================
// SPIRITUAL RESISTANCE INDEX
// Différence entre usage général et usage spirituel
// Valeur positive = résistance spécifique au spirituel
// ==========================================

export function calculateSpiritualResistanceIndex(answers: Answers): number {
  const generalScore = calculateGeneralAIScore(answers);
  const spiritualScore = calculateSpiritualAIScore(answers);

  // Index: différence normalisée (-4 à +4)
  // Positif = utilise l'IA en général mais résiste pour le spirituel
  // Négatif = utilise plus l'IA pour le spirituel que pour le reste (rare)
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

// ==========================================
// AI ADOPTION SCORE (Combined - pour rétrocompatibilité)
// ==========================================

export function calculateAIAdoptionScore(answers: Answers): number {
  const generalScore = calculateGeneralAIScore(answers);
  const spiritualScore = calculateSpiritualAIScore(answers);

  // Moyenne pondérée (général 40%, spirituel 60%)
  return Math.round((generalScore * 0.4 + spiritualScore * 0.6) * 10) / 10;
}

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

// ==========================================
// THEOLOGICAL ORIENTATION
// ==========================================

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

// ==========================================
// SPIRITUAL-AI TYPOLOGY (Cross analysis)
// ==========================================

export type SpiritualAIProfile =
  | 'gardien_tradition'      // Traditionalist + Resistant
  | 'prudent_eclaire'        // Traditionalist + Prudent/Open
  | 'innovateur_ancre'       // Traditionalist + Enthusiast (rare)
  | 'equilibriste'           // Moderate + Prudent
  | 'pragmatique_moderne'    // Moderate + Open/Enthusiast
  | 'pionnier_spirituel'     // Progressive + Open/Enthusiast
  | 'progressiste_critique'  // Progressive + Resistant/Prudent
  | 'explorateur';           // Default

export function getSpiritualAIProfile(answers: Answers): SpiritualAIProfile {
  const theo = getTheologicalOrientation(answers);
  const aiScore = calculateAIAdoptionScore(answers);
  const aiLevel = getAIAdoptionLevel(aiScore);

  if (theo === 'traditionaliste') {
    if (aiLevel === 'resistant') return 'gardien_tradition';
    if (aiLevel === 'prudent' || aiLevel === 'ouvert') return 'prudent_eclaire';
    return 'innovateur_ancre';
  }

  if (theo === 'modere') {
    if (aiLevel === 'resistant' || aiLevel === 'prudent') return 'equilibriste';
    return 'pragmatique_moderne';
  }

  if (theo === 'progressiste') {
    if (aiLevel === 'resistant' || aiLevel === 'prudent') return 'progressiste_critique';
    return 'pionnier_spirituel';
  }

  return 'explorateur';
}

export const PROFILE_DATA: Record<SpiritualAIProfile, {
  title: string;
  emoji: string;
  description: string;
  strength: string;
  challenge: string;
}> = {
  'gardien_tradition': {
    title: 'Gardien de la Tradition',
    emoji: '🏛️',
    description: 'Vous privilégiez les méthodes éprouvées et voyez dans la technologie un risque pour l\'authenticité spirituelle.',
    strength: 'Ancrage dans la tradition, discernement face aux nouveautés',
    challenge: 'Rester ouvert aux outils qui pourraient enrichir votre ministère'
  },
  'prudent_eclaire': {
    title: 'Prudent Éclairé',
    emoji: '🔍',
    description: 'Attaché aux valeurs traditionnelles, vous explorez prudemment les outils modernes avec discernement.',
    strength: 'Équilibre entre tradition et adaptation',
    challenge: 'Approfondir votre connaissance des possibilités de l\'IA'
  },
  'innovateur_ancre': {
    title: 'Innovateur Ancré',
    emoji: '⚓',
    description: 'Profil rare : vous combinez attachement à la tradition et adoption enthousiaste des nouvelles technologies.',
    strength: 'Capacité à innover sans perdre vos racines',
    challenge: 'Communiquer votre vision aux plus réticents'
  },
  'equilibriste': {
    title: 'Équilibriste Spirituel',
    emoji: '⚖️',
    description: 'Vous cherchez un juste milieu, adoptant l\'IA de façon mesurée et réfléchie.',
    strength: 'Approche nuancée et pragmatique',
    challenge: 'Éviter l\'indécision face aux opportunités'
  },
  'pragmatique_moderne': {
    title: 'Pragmatique Moderne',
    emoji: '🚀',
    description: 'Vous voyez l\'IA comme un outil au service de la mission, à utiliser intelligemment.',
    strength: 'Efficacité et adaptation rapide',
    challenge: 'Maintenir la dimension contemplative dans un monde accéléré'
  },
  'pionnier_spirituel': {
    title: 'Pionnier Spirituel',
    emoji: '🌟',
    description: 'Vous explorez avec enthousiasme les frontières entre technologie et spiritualité.',
    strength: 'Vision d\'avenir, créativité',
    challenge: 'Rester en communion avec ceux qui avancent plus lentement'
  },
  'progressiste_critique': {
    title: 'Progressiste Critique',
    emoji: '🤔',
    description: 'Ouvert au changement en général, vous restez vigilant quant à l\'impact de l\'IA sur la vie spirituelle.',
    strength: 'Esprit critique constructif',
    challenge: 'Ne pas passer à côté d\'outils réellement utiles'
  },
  'explorateur': {
    title: 'Explorateur',
    emoji: '🧭',
    description: 'Vous êtes en chemin, explorant à la fois votre foi et votre rapport à la technologie.',
    strength: 'Ouverture d\'esprit, curiosité',
    challenge: 'Clarifier vos convictions pour mieux orienter vos choix'
  }
};

// ==========================================
// PERCENTILE COMPARISON (Mock data)
// ==========================================

export function getPercentileComparison(score: number, type: 'religiosity' | 'ai_adoption'): number {
  // Simulated percentile based on normal distribution
  // In production, this would compare to actual aggregate data
  const mean = type === 'religiosity' ? 3.5 : 2.8;
  const stdDev = 0.8;

  // Approximate percentile using z-score
  const zScore = (score - mean) / stdDev;

  // Convert to percentile (simplified normal CDF approximation)
  const percentile = Math.round(50 * (1 + Math.tanh(zScore * 0.8)));

  return Math.max(1, Math.min(99, percentile));
}

// ==========================================
// PERSONALIZED INSIGHTS
// ==========================================

export interface PersonalizedInsight {
  category: 'spirituality' | 'technology' | 'ethics' | 'community';
  icon: string;
  title: string;
  message: string;
}

export function generateInsights(answers: Answers): PersonalizedInsight[] {
  const insights: PersonalizedInsight[] = [];
  const crsScore = calculateCRS5Score(answers);
  const aiScore = calculateAIAdoptionScore(answers);

  // Spirituality insight
  if (crsScore >= 4) {
    insights.push({
      category: 'spirituality',
      icon: '🙏',
      title: 'Vie spirituelle intense',
      message: 'Votre pratique religieuse est au cœur de votre quotidien. Cette profondeur peut éclairer votre discernement sur l\'usage de l\'IA.'
    });
  } else if (crsScore < 2.5) {
    insights.push({
      category: 'spirituality',
      icon: '🌱',
      title: 'Foi en questionnement',
      message: 'Votre rapport à la foi semble en évolution. L\'IA pourrait être un outil d\'exploration, mais ne remplacera jamais l\'expérience directe.'
    });
  }

  // AI adoption insight
  if (aiScore >= 4) {
    insights.push({
      category: 'technology',
      icon: '💡',
      title: 'Adopteur précoce',
      message: 'Vous faites partie des premiers à intégrer l\'IA dans votre vie spirituelle. Votre expérience peut éclairer d\'autres croyants.'
    });
  } else if (aiScore < 2) {
    insights.push({
      category: 'technology',
      icon: '🛡️',
      title: 'Prudence assumée',
      message: 'Vous préférez les approches traditionnelles. Cette prudence est une forme de sagesse face aux changements rapides.'
    });
  }

  // AI adoption insight
  const guilt = answers['min_pred_sentiment'];
  if (typeof guilt === 'number' && guilt >= 4) {
    insights.push({
      category: 'ethics',
      icon: '💭',
      title: 'Tension éthique ressentie',
      message: 'Vous ressentez une gêne à utiliser l\'IA pour des tâches spirituelles. Cette sensibilité est précieuse : elle vous pousse à rester vigilant sur l\'authenticité de votre ministère.'
    });
  }

  // Anthropomorphism insight
  const anthropo = answers['psych_anthropomorphisme'];
  if (typeof anthropo === 'number' && anthropo >= 4) {
    insights.push({
      category: 'technology',
      icon: '🤖',
      title: 'Vision nuancée de l\'IA',
      message: 'Vous êtes ouvert à l\'idée que l\'IA puisse avoir une forme d\'intelligence. Cette perspective peut enrichir votre réflexion théologique sur la conscience et la création.'
    });
  }

  // Imago Dei concern
  const imagoDei = answers['psych_imago_dei'];
  if (typeof imagoDei === 'number' && imagoDei >= 4) {
    insights.push({
      category: 'ethics',
      icon: '✨',
      title: 'Questionnement anthropologique',
      message: 'L\'IA vous amène à réfléchir sur ce qui fait l\'unicité de l\'être humain. C\'est une question théologique fondamentale qui mérite d\'être approfondie.'
    });
  }

  // Fear of replacement
  const anxiety = answers['psych_anxiete_remplacement'];
  if (typeof anxiety === 'number' && anxiety >= 4) {
    insights.push({
      category: 'community',
      icon: '🤝',
      title: 'Attachement à l\'humain',
      message: 'Votre inquiétude face au remplacement témoigne de votre attachement aux relations humaines authentiques. C\'est un rappel précieux de ce qui ne peut être délégué.'
    });
  }

  // If no specific insights, add a default
  if (insights.length === 0) {
    insights.push({
      category: 'spirituality',
      icon: '🧭',
      title: 'En chemin',
      message: 'Votre profil montre une approche équilibrée. Continuez à explorer avec discernement comment la technologie peut servir votre vie spirituelle.'
    });
  }

  return insights.slice(0, 3); // Max 3 insights
}
