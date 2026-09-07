/**
 * Profile definitions and constants - scoring core v2
 *
 * Profile assignment is a HEURISTIC over 7 dimensions, never a diagnosis.
 * Ideal ranges and weights are expert-set and tuned against the persona
 * simulation in __tests__/profiles.simulation.test.ts; they are not derived
 * from a cluster analysis of real respondents.
 *
 * Descriptions state what the answers show. They contain no Barnum formula,
 * no value judgement, and never encourage adopting or rejecting AI.
 */

import type {
  PrimaryProfile,
  ProfileDefinition,
  SubProfileDefinition,
  SubProfileType,
  DimensionLabel,
  DimensionKey,
} from './types';

// ==========================================
// DIMENSION LABELS
// ==========================================

export const DIMENSION_LABELS: Record<DimensionKey, DimensionLabel> = {
  religiosity: {
    dimension: 'religiosity',
    label: 'Centralité religieuse',
    labelEn: 'Centrality of religiosity',
    description: 'Place de la religion dans la vie quotidienne (CRS-5, adapté)',
    lowDescription: 'Religion peu centrale',
    highDescription: 'Religion très centrale',
  },
  aiOpenness: {
    dimension: 'aiOpenness',
    label: "Ouverture à l'IA",
    labelEn: 'AI openness',
    description: "Fréquence d'usage et attitude déclarée envers l'IA",
    lowDescription: "Usage rare, attitude réservée",
    highDescription: "Usage fréquent, attitude favorable",
  },
  sacredBoundary: {
    dimension: 'sacredBoundary',
    label: 'Frontière sacrée',
    labelEn: 'Sacred boundary',
    description: "Étendue des actes spirituels que vous excluez d'une médiation par l'IA",
    lowDescription: "Peu d'actes exclus",
    highDescription: "Beaucoup d'actes exclus",
  },
  ethicalConcern: {
    dimension: 'ethicalConcern',
    label: 'Préoccupation éthique',
    labelEn: 'Ethical concern',
    description: "Niveau d'inquiétude exprimé sur les effets de l'IA",
    lowDescription: 'Inquiétude faible',
    highDescription: 'Inquiétude élevée',
  },
  psychologicalPerception: {
    dimension: 'psychologicalPerception',
    label: "Perception de l'IA",
    labelEn: 'AI perception',
    description: "Attribution de traits humains ou de conscience à l'IA",
    lowDescription: "L'IA est décrite comme une machine",
    highDescription: "L'IA est décrite comme proche de l'humain",
  },
  communityContext: {
    dimension: 'communityContext',
    label: 'Contexte communautaire',
    labelEn: 'Community context',
    description: "Position déclarée de votre communauté et fréquence des échanges sur l'IA",
    lowDescription: 'Communauté réservée ou silencieuse sur le sujet',
    highDescription: 'Communauté favorable et active sur le sujet',
  },
  futureOrientation: {
    dimension: 'futureOrientation',
    label: 'Orientation future',
    labelEn: 'Future orientation',
    description: "Intentions déclarées d'usage et de formation",
    lowDescription: 'Aucune intention déclarée',
    highDescription: "Intentions d'usage et de formation déclarées",
  },
};

// ==========================================
// PRIMARY PROFILE DEFINITIONS
// ==========================================

export const PROFILE_DEFINITIONS: Record<PrimaryProfile, ProfileDefinition> = {
  gardien_tradition: {
    id: 'gardien_tradition',
    title: 'Gardien de la Tradition',
    emoji: '🏛️',
    shortDescription: 'Frontière sacrée haute, ouverture à l\'IA basse',
    fullDescription: 'Vos réponses placent la frontière sacrée dans le haut de l\'échelle et l\'ouverture à l\'IA dans le bas, avec une centralité religieuse élevée. Vous désignez plusieurs activités spirituelles qui, selon vous, ne devraient pas passer par un outil génératif.',
    idealDimensions: {
      religiosity: [4, 5],
      aiOpenness: [1, 2.5],
      sacredBoundary: [4, 5],
      ethicalConcern: [3.5, 5],
      psychologicalPerception: [1, 3],
      communityContext: [2, 4],
      futureOrientation: [1, 2.5],
    },
    weights: {
      religiosity: 1.2,
      aiOpenness: 1.5,
      sacredBoundary: 1.5,
      ethicalConcern: 1,
      psychologicalPerception: 0.6,
      communityContext: 0.6,
      futureOrientation: 1,
    },
    coreMotivation: 'Distinction nette entre ce qui relève de l\'outil et ce qui relève de la vie spirituelle',
    primaryFear: 'Point de vigilance le plus cité dans ce profil : la médiation technique des actes spirituels',
    communicationStyle: 'Argumentation appuyée sur la tradition et l\'expérience',
    subProfiles: ['protecteur_sacre', 'sage_prudent', 'berger_communautaire'],
  },

  prudent_eclaire: {
    id: 'prudent_eclaire',
    title: 'Prudent Éclairé',
    emoji: '🔍',
    shortDescription: 'Ouverture modérée à l\'IA, frontière sacrée élevée',
    fullDescription: 'Votre ouverture à l\'IA se situe dans la zone médiane de l\'échelle alors que la frontière sacrée et la préoccupation éthique restent hautes. L\'usage déclaré porte plutôt sur des tâches périphériques que sur les actes spirituels eux-mêmes.',
    idealDimensions: {
      religiosity: [3.5, 5],
      aiOpenness: [2, 3.5],
      sacredBoundary: [3.5, 4.75],
      ethicalConcern: [3, 4.5],
      psychologicalPerception: [1.5, 3.5],
      communityContext: [2, 4],
      futureOrientation: [2.25, 3.75],
    },
    weights: {
      religiosity: 1.1,
      aiOpenness: 1.4,
      sacredBoundary: 1.3,
      ethicalConcern: 1,
      psychologicalPerception: 0.6,
      communityContext: 0.6,
      futureOrientation: 1.1,
    },
    coreMotivation: 'Évaluation au cas par cas avant tout usage',
    primaryFear: 'Point de vigilance : adopter un outil avant d\'en avoir évalué les effets',
    communicationStyle: 'Analytique, attentif aux nuances',
    subProfiles: ['analyste_spirituel', 'discerneur_pastoral', 'observateur_engage'],
  },

  innovateur_ancre: {
    id: 'innovateur_ancre',
    title: 'Innovateur Ancré',
    emoji: '⚓',
    shortDescription: 'Centralité religieuse haute et usage fréquent de l\'IA',
    fullDescription: 'Vos réponses associent une centralité religieuse haute à un usage fréquent de l\'IA, avec une frontière sacrée intermédiaire. L\'orientation théologique déclarée reste plutôt traditionnelle malgré cet usage soutenu.',
    idealDimensions: {
      religiosity: [4, 5],
      aiOpenness: [3.75, 5],
      sacredBoundary: [2, 3.5],
      ethicalConcern: [2, 3.5],
      psychologicalPerception: [1.5, 3.5],
      communityContext: [2, 4],
      futureOrientation: [3.75, 5],
    },
    weights: {
      religiosity: 1.4,
      aiOpenness: 1.4,
      sacredBoundary: 1.1,
      ethicalConcern: 0.9,
      psychologicalPerception: 0.6,
      communityContext: 0.6,
      futureOrientation: 1.2,
    },
    coreMotivation: 'Usage soutenu des outils dans un cadre théologique traditionnel',
    primaryFear: 'Point de vigilance : l\'écart avec les positions dominantes de la communauté',
    communicationStyle: 'Explicatif, orienté vers l\'usage concret',
    subProfiles: ['pont_generationnel', 'evangeliste_digital', 'theologien_techno'],
  },

  equilibriste: {
    id: 'equilibriste',
    title: 'Équilibriste Spirituel',
    emoji: '⚖️',
    shortDescription: 'Scores centraux sur les principales dimensions',
    fullDescription: 'Vos réponses se situent près du milieu de l\'échelle sur l\'ouverture à l\'IA, la frontière sacrée, la préoccupation éthique et l\'orientation future. Aucune de ces dimensions ne se détache nettement des autres.',
    idealDimensions: {
      religiosity: [2.5, 4],
      aiOpenness: [2.75, 3.25],
      sacredBoundary: [2.75, 3.25],
      ethicalConcern: [2.75, 3.25],
      psychologicalPerception: [2.5, 3.5],
      communityContext: [2.5, 4],
      futureOrientation: [2.75, 3.25],
    },
    weights: {
      religiosity: 0.8,
      aiOpenness: 1.2,
      sacredBoundary: 1.2,
      ethicalConcern: 1.2,
      psychologicalPerception: 0.8,
      communityContext: 0.6,
      futureOrientation: 1.2,
    },
    coreMotivation: 'Positions intermédiaires sur la plupart des dimensions',
    primaryFear: 'Point de vigilance : la difficulté à trancher quand un choix est demandé',
    communicationStyle: 'Nuancé, attentif aux points de vue divergents',
    subProfiles: ['mediateur', 'chercheur_sens', 'adaptateur_prudent'],
  },

  pragmatique_moderne: {
    id: 'pragmatique_moderne',
    title: 'Pragmatique Moderne',
    emoji: '🚀',
    shortDescription: 'Usage fréquent de l\'IA, préoccupation éthique basse',
    fullDescription: 'Vos réponses combinent un usage fréquent de l\'IA et une préoccupation éthique située dans le bas de l\'échelle. Les domaines d\'intérêt déclarés sont surtout administratifs et communicationnels.',
    idealDimensions: {
      religiosity: [2.5, 4],
      aiOpenness: [3.5, 5],
      sacredBoundary: [1.5, 3],
      ethicalConcern: [1, 2.75],
      psychologicalPerception: [1.5, 3.5],
      communityContext: [2, 4],
      futureOrientation: [3.5, 5],
    },
    weights: {
      religiosity: 0.8,
      aiOpenness: 1.4,
      sacredBoundary: 1.2,
      ethicalConcern: 1.3,
      psychologicalPerception: 0.6,
      communityContext: 0.6,
      futureOrientation: 1.2,
    },
    coreMotivation: 'Usage orienté vers les tâches concrètes du quotidien',
    primaryFear: 'Point de vigilance : les effets non anticipés d\'un usage étendu',
    communicationStyle: 'Direct, centré sur les usages',
    subProfiles: ['efficace_engage', 'communicateur_digital', 'optimisateur_pastoral'],
  },

  pionnier_spirituel: {
    id: 'pionnier_spirituel',
    title: 'Pionnier Spirituel',
    emoji: '🌟',
    shortDescription: 'Ouverture à l\'IA haute, frontière sacrée basse',
    fullDescription: 'Vos réponses situent l\'ouverture à l\'IA et l\'orientation future dans le haut de l\'échelle, avec une frontière sacrée basse. Vous n\'excluez pas l\'usage d\'outils génératifs dans le champ spirituel lui-même.',
    idealDimensions: {
      religiosity: [2, 4.5],
      aiOpenness: [4, 5],
      sacredBoundary: [1, 2.25],
      ethicalConcern: [1, 3],
      psychologicalPerception: [2, 4.5],
      communityContext: [1.5, 3.5],
      futureOrientation: [4, 5],
    },
    weights: {
      religiosity: 0.6,
      aiOpenness: 1.5,
      sacredBoundary: 1.5,
      ethicalConcern: 0.9,
      psychologicalPerception: 0.7,
      communityContext: 0.6,
      futureOrientation: 1.4,
    },
    coreMotivation: 'Extension de l\'usage de l\'IA au champ spirituel',
    primaryFear: 'Point de vigilance : l\'écart avec la position de votre communauté',
    communicationStyle: 'Prospectif, tourné vers les usages émergents',
    subProfiles: ['visionnaire', 'experimentateur', 'prophete_digital'],
  },

  progressiste_critique: {
    id: 'progressiste_critique',
    title: 'Progressiste Critique',
    emoji: '🤔',
    shortDescription: 'Préoccupation éthique haute, ouverture modérée',
    fullDescription: 'Votre préoccupation éthique se situe dans le haut de l\'échelle alors que l\'ouverture à l\'IA reste moyenne. Les questions sur la nature de l\'IA et sur ses effets occupent une place importante dans vos réponses.',
    idealDimensions: {
      religiosity: [2, 4],
      aiOpenness: [2, 3.5],
      sacredBoundary: [2.5, 4],
      ethicalConcern: [4, 5],
      psychologicalPerception: [3, 5],
      communityContext: [2, 4],
      futureOrientation: [3, 4.5],
    },
    weights: {
      religiosity: 0.6,
      aiOpenness: 1.1,
      sacredBoundary: 1,
      ethicalConcern: 1.6,
      psychologicalPerception: 1.2,
      communityContext: 0.6,
      futureOrientation: 1,
    },
    coreMotivation: 'Examen des implications éthiques avant l\'usage',
    primaryFear: 'Point de vigilance : les effets sociaux des systèmes automatisés',
    communicationStyle: 'Interrogatif, argumenté',
    subProfiles: ['ethicien', 'reformateur_social', 'philosophe_spirituel'],
  },

  explorateur: {
    id: 'explorateur',
    title: 'Explorateur',
    emoji: '🧭',
    shortDescription: 'Beaucoup de réponses « je ne sais pas », centralité religieuse plus basse',
    fullDescription: 'Vos réponses comportent une proportion élevée de « je ne sais pas » et une centralité religieuse située dans le bas de l\'échelle. L\'orientation théologique reste indéterminée dans vos réponses.',
    idealDimensions: {
      religiosity: [1, 3],
      aiOpenness: [2, 4],
      sacredBoundary: [2, 4],
      ethicalConcern: [2, 4],
      psychologicalPerception: [2, 4],
      communityContext: [1, 3],
      futureOrientation: [2.5, 4.5],
    },
    weights: {
      religiosity: 1.4,
      aiOpenness: 0.7,
      sacredBoundary: 0.7,
      ethicalConcern: 0.7,
      psychologicalPerception: 0.7,
      communityContext: 0.9,
      futureOrientation: 0.9,
    },
    coreMotivation: 'Positions encore ouvertes sur la plupart des questions',
    primaryFear: 'Point de vigilance : le manque de repères stables pour décider',
    communicationStyle: 'Interrogatif, en recherche d\'information',
    subProfiles: ['curieux_spirituel', 'novice_technologique', 'chercheur_seculier'],
  },

};

// ==========================================
// SUB-PROFILE DEFINITIONS
// ==========================================

export const SUB_PROFILE_DEFINITIONS: Record<SubProfileType, SubProfileDefinition> = {
  protecteur_sacre: {
    id: 'protecteur_sacre',
    parentProfile: 'gardien_tradition',
    title: 'Le Protecteur du Sacré',
    emoji: '🛡️',
    description: 'Votre score de frontière sacrée est le plus marqué de votre profil. Vous excluez explicitement les sacrements, la prédication ou la prière personnelle de toute médiation par l\'IA.',
    distinguishingTraits: [
      'Forte distinction sacré/profane',
      'Attachement aux rituels traditionnels',
      'Sensibilité à l\'authenticité spirituelle',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'high' },
      { dimension: 'psychologicalPerception', emphasis: 'high' },
    ],
  },
  sage_prudent: {
    id: 'sage_prudent',
    parentProfile: 'gardien_tradition',
    title: 'Le Sage Prudent',
    emoji: '🦉',
    description: 'Votre préoccupation éthique est haute et votre orientation future reste médiane. Vos réponses indiquent une attente d\'éléments concrets avant tout changement d\'usage.',
    distinguishingTraits: [
      'Approche fondée sur l\'expérience',
      'Distance vis-à-vis des effets de mode',
      'Position révisable si les éléments changent',
    ],
    idealPattern: [
      { dimension: 'ethicalConcern', emphasis: 'high' },
      { dimension: 'futureOrientation', emphasis: 'moderate' },
    ],
  },
  berger_communautaire: {
    id: 'berger_communautaire',
    parentProfile: 'gardien_tradition',
    title: 'Le Berger Communautaire',
    emoji: '🐑',
    description: 'Votre centralité religieuse et votre contexte communautaire sont tous deux élevés. Les échanges dans votre communauté occupent une place notable dans vos réponses.',
    distinguishingTraits: [
      'Forte conscience communautaire',
      'Attention portée à l\'accompagnement',
      'Prise en compte des personnes fragiles',
    ],
    idealPattern: [
      { dimension: 'communityContext', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'high' },
    ],
  },
  analyste_spirituel: {
    id: 'analyste_spirituel',
    parentProfile: 'prudent_eclaire',
    title: 'L\'Analyste Spirituel',
    emoji: '📊',
    description: 'Votre préoccupation éthique est haute et votre orientation future médiane. Vous déclarez un intérêt pour la formation avant l\'usage.',
    distinguishingTraits: [
      'Approche méthodique',
      'Intérêt déclaré pour la formation',
      'Recherche d\'information avant décision',
    ],
    idealPattern: [
      { dimension: 'ethicalConcern', emphasis: 'high' },
      { dimension: 'futureOrientation', emphasis: 'moderate' },
    ],
  },
  discerneur_pastoral: {
    id: 'discerneur_pastoral',
    parentProfile: 'prudent_eclaire',
    title: 'Le Discerneur Pastoral',
    emoji: '💫',
    description: 'Votre frontière sacrée est haute et votre contexte communautaire médian. Vos réponses portent surtout sur les effets de l\'IA dans l\'accompagnement des personnes.',
    distinguishingTraits: [
      'Attention aux effets sur les personnes',
      'Évaluation cas par cas',
      'Priorité donnée au lien humain',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'high' },
      { dimension: 'communityContext', emphasis: 'moderate' },
    ],
  },
  observateur_engage: {
    id: 'observateur_engage',
    parentProfile: 'prudent_eclaire',
    title: 'L\'Observateur Engagé',
    emoji: '👁️',
    description: 'Votre ouverture à l\'IA et votre orientation future se situent toutes deux dans la zone médiane. Vous déclarez suivre le sujet sans usage étendu.',
    distinguishingTraits: [
      'Veille sur le sujet',
      'Usage limité à quelques contextes',
      'Engagement progressif',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'moderate' },
      { dimension: 'futureOrientation', emphasis: 'moderate' },
    ],
  },
  pont_generationnel: {
    id: 'pont_generationnel',
    parentProfile: 'innovateur_ancre',
    title: 'Le Pont Générationnel',
    emoji: '🌉',
    description: 'Votre centralité religieuse et votre contexte communautaire sont élevés, avec un usage de l\'IA fréquent. Cette combinaison associe une pratique religieuse dense et un usage régulier des outils.',
    distinguishingTraits: [
      'Position de médiation entre générations',
      'Familiarité avec deux registres',
      'Traduction d\'un langage à l\'autre',
    ],
    idealPattern: [
      { dimension: 'communityContext', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'high' },
    ],
  },
  evangeliste_digital: {
    id: 'evangeliste_digital',
    parentProfile: 'innovateur_ancre',
    title: 'L\'Évangéliste Digital',
    emoji: '📱',
    description: 'Votre ouverture à l\'IA et votre orientation future sont hautes. Les domaines d\'intérêt déclarés portent sur la communication et la catéchèse.',
    distinguishingTraits: [
      'Intérêt pour la diffusion',
      'Créativité dans les moyens',
      'Usage orienté vers le collectif',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'high' },
      { dimension: 'futureOrientation', emphasis: 'high' },
    ],
  },
  theologien_techno: {
    id: 'theologien_techno',
    parentProfile: 'innovateur_ancre',
    title: 'Le Théologien Techno',
    emoji: '📚',
    description: 'Votre perception de l\'IA est haute et votre préoccupation éthique médiane. Vos réponses attribuent à l\'IA des propriétés qui font l\'objet de discussions théologiques.',
    distinguishingTraits: [
      'Réflexion théologique explicite',
      'Dialogue foi et sciences',
      'Intérêt pour les questions de nature',
    ],
    idealPattern: [
      { dimension: 'psychologicalPerception', emphasis: 'high' },
      { dimension: 'ethicalConcern', emphasis: 'moderate' },
    ],
  },
  mediateur: {
    id: 'mediateur',
    parentProfile: 'equilibriste',
    title: 'Le Médiateur',
    emoji: '🤝',
    description: 'Votre contexte communautaire est élevé et votre préoccupation éthique médiane. Vos positions restent proches du centre de l\'échelle sur les autres dimensions.',
    distinguishingTraits: [
      'Attention aux positions divergentes',
      'Recherche de terrain commun',
      'Faible polarisation des réponses',
    ],
    idealPattern: [
      { dimension: 'communityContext', emphasis: 'high' },
      { dimension: 'ethicalConcern', emphasis: 'moderate' },
    ],
  },
  chercheur_sens: {
    id: 'chercheur_sens',
    parentProfile: 'equilibriste',
    title: 'Le Chercheur de Sens',
    emoji: '🔎',
    description: 'Votre perception de l\'IA et votre centralité religieuse se situent dans la zone médiane. Vos réponses ne tranchent pas sur la nature de l\'IA.',
    distinguishingTraits: [
      'Questions de fond laissées ouvertes',
      'Refus des réponses tranchées',
      'Réflexion en cours',
    ],
    idealPattern: [
      { dimension: 'psychologicalPerception', emphasis: 'moderate' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },
  adaptateur_prudent: {
    id: 'adaptateur_prudent',
    parentProfile: 'equilibriste',
    title: 'L\'Adaptateur Prudent',
    emoji: '🔄',
    description: 'Votre frontière sacrée et votre ouverture à l\'IA sont toutes deux médianes. L\'usage déclaré varie selon les tâches plutôt que selon un principe général.',
    distinguishingTraits: [
      'Usage variable selon le contexte',
      'Pragmatisme modéré',
      'Position ajustable',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'moderate' },
      { dimension: 'aiOpenness', emphasis: 'moderate' },
    ],
  },
  efficace_engage: {
    id: 'efficace_engage',
    parentProfile: 'pragmatique_moderne',
    title: 'L\'Efficace Engagé',
    emoji: '⚡',
    description: 'Votre ouverture à l\'IA et votre orientation future sont hautes. Les domaines déclarés relèvent surtout de l\'administration.',
    distinguishingTraits: [
      'Usage orienté tâches',
      'Délégation des tâches répétitives',
      'Temps redirigé vers les relations',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'high' },
      { dimension: 'futureOrientation', emphasis: 'high' },
    ],
  },
  communicateur_digital: {
    id: 'communicateur_digital',
    parentProfile: 'pragmatique_moderne',
    title: 'Le Communicateur Digital',
    emoji: '📢',
    description: 'Votre frontière sacrée est basse et votre contexte communautaire médian. Les domaines déclarés relèvent de la communication et des réseaux sociaux.',
    distinguishingTraits: [
      'Usage centré sur la diffusion',
      'Maîtrise des outils numériques',
      'Attention portée au message',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'low' },
      { dimension: 'communityContext', emphasis: 'moderate' },
    ],
  },
  optimisateur_pastoral: {
    id: 'optimisateur_pastoral',
    parentProfile: 'pragmatique_moderne',
    title: 'L\'Optimisateur Pastoral',
    emoji: '🎯',
    description: 'Votre préoccupation éthique est basse et votre centralité religieuse médiane. L\'usage déclaré porte sur des tâches pastorales concrètes.',
    distinguishingTraits: [
      'Usage ciblé sur quelques tâches',
      'Peu de réserves exprimées',
      'Priorité aux tâches récurrentes',
    ],
    idealPattern: [
      { dimension: 'ethicalConcern', emphasis: 'low' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },
  visionnaire: {
    id: 'visionnaire',
    parentProfile: 'pionnier_spirituel',
    title: 'Le Visionnaire',
    emoji: '🔭',
    description: 'Votre orientation future est haute et votre frontière sacrée basse. Vos réponses envisagent des usages qui dépassent l\'outillage administratif.',
    distinguishingTraits: [
      'Projection à long terme',
      'Anticipation des évolutions',
      'Peu de limites posées a priori',
    ],
    idealPattern: [
      { dimension: 'futureOrientation', emphasis: 'high' },
      { dimension: 'sacredBoundary', emphasis: 'low' },
    ],
  },
  experimentateur: {
    id: 'experimentateur',
    parentProfile: 'pionnier_spirituel',
    title: 'L\'Expérimentateur',
    emoji: '🧪',
    description: 'Votre ouverture à l\'IA est haute et votre préoccupation éthique basse. Vous déclarez plusieurs contextes d\'usage différents.',
    distinguishingTraits: [
      'Multiplicité des contextes d\'usage',
      'Apprentissage par essai',
      'Partage des résultats',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'high' },
      { dimension: 'ethicalConcern', emphasis: 'low' },
    ],
  },
  prophete_digital: {
    id: 'prophete_digital',
    parentProfile: 'pionnier_spirituel',
    title: 'Le Prophète Digital',
    emoji: '📣',
    description: 'Votre contexte communautaire et votre centralité religieuse sont médians, avec une ouverture à l\'IA haute. Vos réponses associent un usage soutenu à des échanges fréquents sur le sujet.',
    distinguishingTraits: [
      'Usage soutenu et assumé',
      'Échanges fréquents sur le sujet',
      'Position exprimée publiquement',
    ],
    idealPattern: [
      { dimension: 'communityContext', emphasis: 'moderate' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },
  ethicien: {
    id: 'ethicien',
    parentProfile: 'progressiste_critique',
    title: 'L\'Éthicien',
    emoji: '⚖️',
    description: 'Votre préoccupation éthique et votre perception de l\'IA sont toutes deux hautes. L\'opacité des systèmes est explicitement citée dans vos réponses.',
    distinguishingTraits: [
      'Attention aux implications',
      'Vigilance sur l\'opacité des systèmes',
      'Analyse avant usage',
    ],
    idealPattern: [
      { dimension: 'ethicalConcern', emphasis: 'high' },
      { dimension: 'psychologicalPerception', emphasis: 'high' },
    ],
  },
  reformateur_social: {
    id: 'reformateur_social',
    parentProfile: 'progressiste_critique',
    title: 'Le Réformateur Social',
    emoji: '✊',
    description: 'Votre préoccupation éthique est haute et votre contexte communautaire médian. Vos réponses portent davantage sur les effets collectifs que sur l\'usage individuel.',
    distinguishingTraits: [
      'Lecture collective des effets',
      'Attention aux personnes fragiles',
      'Question de l\'équité d\'accès',
    ],
    idealPattern: [
      { dimension: 'communityContext', emphasis: 'moderate' },
      { dimension: 'ethicalConcern', emphasis: 'high' },
    ],
  },
  philosophe_spirituel: {
    id: 'philosophe_spirituel',
    parentProfile: 'progressiste_critique',
    title: 'Le Philosophe Spirituel',
    emoji: '💭',
    description: 'Votre perception de l\'IA est haute et votre frontière sacrée médiane. Les questions sur la conscience et sur l\'image de Dieu occupent une place centrale dans vos réponses.',
    distinguishingTraits: [
      'Intérêt pour les questions fondamentales',
      'Croisement des disciplines',
      'Réponses argumentées',
    ],
    idealPattern: [
      { dimension: 'psychologicalPerception', emphasis: 'high' },
      { dimension: 'sacredBoundary', emphasis: 'moderate' },
    ],
  },
  curieux_spirituel: {
    id: 'curieux_spirituel',
    parentProfile: 'explorateur',
    title: 'Le Curieux Spirituel',
    emoji: '🌱',
    description: 'Votre orientation future est haute et votre centralité religieuse médiane. Vos réponses comportent plusieurs « je ne sais pas » sur les items théologiques.',
    distinguishingTraits: [
      'Exploration parallèle de la foi et des outils',
      'Positions non figées',
      'Intérêt pour la formation',
    ],
    idealPattern: [
      { dimension: 'futureOrientation', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },
  novice_technologique: {
    id: 'novice_technologique',
    parentProfile: 'explorateur',
    title: 'Le Novice Technologique',
    emoji: '🔰',
    description: 'Votre centralité religieuse est haute et votre ouverture à l\'IA basse ou médiane. L\'usage déclaré des outils reste limité.',
    distinguishingTraits: [
      'Pratique religieuse établie',
      'Usage des outils encore limité',
      'Apprentissage en cours',
    ],
    idealPattern: [
      { dimension: 'religiosity', emphasis: 'high' },
      { dimension: 'aiOpenness', emphasis: 'moderate' },
    ],
  },
  chercheur_seculier: {
    id: 'chercheur_seculier',
    parentProfile: 'explorateur',
    title: 'Le Chercheur Séculier',
    emoji: '🔍',
    description: 'Votre ouverture à l\'IA est haute et votre centralité religieuse basse. Le rapport à la foi est décrit comme en construction dans vos réponses.',
    distinguishingTraits: [
      'Entrée par la technologie',
      'Questionnement spirituel actif',
      'Usage des ressources numériques',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'low' },
    ],
  },
};

// ==========================================
// COLORS
// ==========================================

export const PROFILE_COLORS: Record<PrimaryProfile, string> = {
  gardien_tradition: '#8B4513',
  prudent_eclaire: '#4682B4',
  innovateur_ancre: '#2E8B57',
  equilibriste: '#DAA520',
  pragmatique_moderne: '#FF6347',
  pionnier_spirituel: '#FFD700',
  progressiste_critique: '#20B2AA',
  explorateur: '#87CEEB',
};

export const DIMENSION_COLORS: Record<DimensionKey, string> = {
  religiosity: '#6366F1',
  aiOpenness: '#10B981',
  sacredBoundary: '#F59E0B',
  ethicalConcern: '#EF4444',
  psychologicalPerception: '#8B5CF6',
  communityContext: '#3B82F6',
  futureOrientation: '#EC4899',
};
