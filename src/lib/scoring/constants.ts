/**
 * Profile Definitions and Constants
 * Comprehensive data for the 8 primary profiles and their sub-profiles
 */

import type {
  PrimaryProfile,
  ProfileDefinition,
  SubProfileDefinition,
  SubProfileType,
  DimensionLabel,
  SevenDimensions,
} from './types';

// ==========================================
// DIMENSION LABELS
// ==========================================

export const DIMENSION_LABELS: Record<keyof SevenDimensions, DimensionLabel> = {
  religiosity: {
    dimension: 'religiosity',
    label: 'Intensité Spirituelle',
    labelEn: 'Spiritual Intensity',
    description: 'Centralité de la foi dans votre vie quotidienne',
    lowDescription: 'Foi questionnée ou en exploration',
    highDescription: 'Foi au cœur de chaque aspect de la vie',
  },
  aiOpenness: {
    dimension: 'aiOpenness',
    label: 'Ouverture à l\'IA',
    labelEn: 'AI Openness',
    description: 'Disposition à adopter et utiliser l\'intelligence artificielle',
    lowDescription: 'Prudence ou résistance face à l\'IA',
    highDescription: 'Adoption enthousiaste de l\'IA',
  },
  sacredBoundary: {
    dimension: 'sacredBoundary',
    label: 'Frontière Sacrée',
    labelEn: 'Sacred Boundary',
    description: 'Distinction entre ce qui peut être confié à l\'IA et ce qui doit rester humain/spirituel',
    lowDescription: 'Frontière perméable, l\'IA peut aider partout',
    highDescription: 'Frontière stricte, le sacré est protégé',
  },
  ethicalConcern: {
    dimension: 'ethicalConcern',
    label: 'Préoccupation Éthique',
    labelEn: 'Ethical Concern',
    description: 'Niveau d\'inquiétude face aux implications éthiques de l\'IA',
    lowDescription: 'Confiance dans le progrès technologique',
    highDescription: 'Vigilance face aux risques éthiques',
  },
  psychologicalPerception: {
    dimension: 'psychologicalPerception',
    label: 'Perception de l\'IA',
    labelEn: 'AI Perception',
    description: 'Comment vous percevez la nature de l\'IA et son rapport à l\'humain',
    lowDescription: 'L\'IA est un simple outil',
    highDescription: 'Questions profondes sur la conscience et l\'humanité',
  },
  communityInfluence: {
    dimension: 'communityInfluence',
    label: 'Ancrage Communautaire',
    labelEn: 'Community Influence',
    description: 'Importance de la communauté dans vos choix concernant l\'IA',
    lowDescription: 'Décisions individuelles indépendantes',
    highDescription: 'Fort alignement avec la communauté',
  },
  futureOrientation: {
    dimension: 'futureOrientation',
    label: 'Orientation Future',
    labelEn: 'Future Orientation',
    description: 'Volonté d\'évoluer dans votre rapport à l\'IA',
    lowDescription: 'Satisfaction avec l\'approche actuelle',
    highDescription: 'Désir d\'explorer et d\'apprendre davantage',
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
    shortDescription: 'Protecteur des pratiques spirituelles authentiques',
    fullDescription: 'Vous êtes un pilier de la tradition, convaincu que les pratiques spirituelles ont traversé les siècles pour de bonnes raisons. L\'IA représente pour vous une technologie qui, mal utilisée, pourrait éroder l\'authenticité et la profondeur de la vie spirituelle. Votre prudence n\'est pas du conservatisme aveugle, mais un discernement ancré dans une compréhension profonde de ce qui fait la valeur irremplaçable de l\'humain dans la relation à Dieu.',
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
    coreMotivation: 'Préserver l\'authenticité de la rencontre avec Dieu',
    primaryFear: 'Que la technologie déshumanise la vie spirituelle',
    communicationStyle: 'Réfléchi, citant volontiers la tradition et l\'expérience',
    subProfiles: ['protecteur_sacre', 'sage_prudent', 'berger_communautaire'],
  },

  prudent_eclaire: {
    id: 'prudent_eclaire',
    title: 'Prudent Éclairé',
    emoji: '🔍',
    shortDescription: 'Discernement équilibré entre tradition et innovation',
    fullDescription: 'Vous représentez la voie du discernement. Attaché aux valeurs traditionnelles, vous n\'êtes pas fermé au progrès mais vous exigez que chaque nouveauté prouve sa valeur avant de l\'adopter. Vous testez, évaluez, et n\'intégrez que ce qui enrichit véritablement sans compromettre l\'essentiel. Votre approche méthodique fait de vous un conseiller précieux pour ceux qui cherchent à naviguer entre tradition et modernité.',
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
    coreMotivation: 'Adopter ce qui est bon après un discernement rigoureux',
    primaryFear: 'Accepter trop vite quelque chose de nuisible',
    communicationStyle: 'Analytique, posé, cherche les nuances',
    subProfiles: ['analyste_spirituel', 'discerneur_pastoral', 'observateur_engage'],
  },

  innovateur_ancre: {
    id: 'innovateur_ancre',
    title: 'Innovateur Ancré',
    emoji: '⚓',
    shortDescription: 'Alliance rare entre tradition profonde et adoption technologique',
    fullDescription: 'Vous êtes un profil rare et précieux : profondément ancré dans la tradition, vous voyez dans la technologie non pas une menace mais un outil au service de la mission. Vous innovez avec audace tout en restant solidement enraciné dans votre foi. Cette capacité à tenir ensemble deux mondes apparemment opposés fait de vous un pont naturel entre générations et sensibilités.',
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
    coreMotivation: 'Mettre la technologie au service de la mission spirituelle',
    primaryFear: 'Être incompris par les deux camps',
    communicationStyle: 'Enthousiaste, persuasif, cherche à rallier',
    subProfiles: ['pont_generationnel', 'evangeliste_digital', 'theologien_techno'],
  },

  equilibriste: {
    id: 'equilibriste',
    title: 'Équilibriste Spirituel',
    emoji: '⚖️',
    shortDescription: 'Recherche constante du juste milieu',
    fullDescription: 'Vous incarnez la voie du milieu, cherchant toujours l\'équilibre entre les extrêmes. Ni enthousiaste inconditionnel ni opposant farouche, vous pesez chaque décision, considérez les différents points de vue, et adoptez une approche mesurée. Cette position peut parfois être perçue comme de l\'indécision, mais elle reflète en réalité une sagesse qui reconnaît la complexité des enjeux.',
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
    coreMotivation: 'Trouver le juste équilibre dans un monde complexe',
    primaryFear: 'Tomber dans un extrême qui causerait des dommages',
    communicationStyle: 'Nuancé, diplomate, cherche le consensus',
    subProfiles: ['mediateur', 'chercheur_sens', 'adaptateur_prudent'],
  },

  pragmatique_moderne: {
    id: 'pragmatique_moderne',
    title: 'Pragmatique Moderne',
    emoji: '🚀',
    shortDescription: 'L\'efficacité au service de la mission',
    fullDescription: 'Vous êtes orienté vers les résultats. Pour vous, l\'IA est avant tout un outil pratique qui peut libérer du temps et de l\'énergie pour ce qui compte vraiment : les relations humaines et la mission. Vous n\'êtes pas préoccupé par les débats théologiques abstraits sur l\'IA ; ce qui vous intéresse, c\'est comment elle peut concrètement améliorer votre ministère ou votre vie spirituelle.',
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
    coreMotivation: 'Maximiser l\'impact positif avec les outils disponibles',
    primaryFear: 'Perdre du temps avec des débats improductifs',
    communicationStyle: 'Direct, orienté solutions, concret',
    subProfiles: ['efficace_engage', 'communicateur_digital', 'optimisateur_pastoral'],
  },

  pionnier_spirituel: {
    id: 'pionnier_spirituel',
    title: 'Pionnier Spirituel',
    emoji: '🌟',
    shortDescription: 'Explorateur des nouvelles frontières foi-technologie',
    fullDescription: 'Vous êtes à l\'avant-garde, explorant avec enthousiasme les territoires inconnus où se rencontrent spiritualité et intelligence artificielle. Vous voyez dans l\'IA non seulement un outil mais potentiellement une nouvelle dimension de la réflexion spirituelle. Visionnaire, vous anticipez les possibilités que d\'autres n\'imaginent pas encore, même si cela vous place parfois en décalage avec votre communauté.',
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
    coreMotivation: 'Découvrir de nouvelles façons de vivre et partager la foi',
    primaryFear: 'Rester bloqué dans des pratiques dépassées',
    communicationStyle: 'Visionnaire, enthousiaste, parfois disruptif',
    subProfiles: ['visionnaire', 'experimentateur', 'prophete_digital'],
  },

  progressiste_critique: {
    id: 'progressiste_critique',
    title: 'Progressiste Critique',
    emoji: '🤔',
    shortDescription: 'Ouverture au changement avec vigilance éthique',
    fullDescription: 'Vous êtes ouvert au progrès et au changement, mais votre esprit critique reste en éveil permanent. Vous questionnez non seulement les traditions mais aussi les nouvelles technologies. Pour vous, l\'enthousiasme technologique doit être tempéré par une réflexion éthique rigoureuse. Vous refusez les réponses faciles, qu\'elles viennent des conservateurs ou des technophiles.',
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
    coreMotivation: 'Avancer de manière responsable et éthique',
    primaryFear: 'Participer à des dérives technologiques nuisibles',
    communicationStyle: 'Questionneur, intellectuel, parfois provocateur',
    subProfiles: ['ethicien', 'reformateur_social', 'philosophe_spirituel'],
  },

  explorateur: {
    id: 'explorateur',
    title: 'Explorateur',
    emoji: '🧭',
    shortDescription: 'En chemin, formant ses convictions',
    fullDescription: 'Vous êtes en phase d\'exploration, aussi bien dans votre foi que dans votre rapport à la technologie. Cette position n\'est pas une faiblesse mais une ouverture : vous êtes curieux, réceptif, prêt à apprendre de différentes perspectives. Votre parcours est encore en train de se dessiner, ce qui vous donne la liberté de forger vos propres convictions plutôt que d\'hériter de positions toutes faites.',
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
    coreMotivation: 'Comprendre et former ses propres convictions',
    primaryFear: 'S\'engager prématurément dans une voie inadaptée',
    communicationStyle: 'Curieux, questionneur, réceptif',
    subProfiles: ['curieux_spirituel', 'novice_technologique', 'chercheur_seculier'],
  },
};

// ==========================================
// SUB-PROFILE DEFINITIONS
// ==========================================

export const SUB_PROFILE_DEFINITIONS: Record<SubProfileType, SubProfileDefinition> = {
  // --- Gardien de la Tradition ---
  protecteur_sacre: {
    id: 'protecteur_sacre',
    parentProfile: 'gardien_tradition',
    title: 'Le Protecteur du Sacré',
    emoji: '🛡️',
    description: 'Vous êtes particulièrement vigilant quant à la protection des espaces et moments sacrés. Pour vous, certaines dimensions de la vie spirituelle doivent absolument rester à l\'abri de toute médiation technologique.',
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
    description: 'Votre résistance à l\'IA vient moins d\'un rejet de principe que d\'une sagesse acquise par l\'expérience. Vous avez vu des modes passer et vous préférez attendre que les choses fassent leurs preuves.',
    distinguishingTraits: [
      'Approche fondée sur l\'expérience',
      'Capacité à voir au-delà des modes',
      'Ouverture à reconsidérer si preuves suffisantes',
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
    description: 'Votre préoccupation principale est le bien de votre communauté. Vous protégez vos fidèles de ce qui pourrait les déstabiliser, tout en restant attentif à leurs besoins.',
    distinguishingTraits: [
      'Forte conscience communautaire',
      'Sens pastoral développé',
      'Protection des plus vulnérables',
    ],
    idealPattern: [
      { dimension: 'communityInfluence', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'high' },
    ],
  },

  // --- Prudent Éclairé ---
  analyste_spirituel: {
    id: 'analyste_spirituel',
    parentProfile: 'prudent_eclaire',
    title: 'L\'Analyste Spirituel',
    emoji: '📊',
    description: 'Vous approchez l\'IA avec une rigueur méthodique. Vous voulez comprendre avant d\'adopter, tester avant de recommander, et former les autres à une utilisation éclairée.',
    distinguishingTraits: [
      'Approche méthodique et structurée',
      'Intérêt pour la formation',
      'Goût pour la compréhension en profondeur',
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
    description: 'Votre prudence est particulièrement orientée vers les implications pastorales de l\'IA. Ce qui vous préoccupe, c\'est l\'impact sur les personnes, les relations, l\'accompagnement.',
    distinguishingTraits: [
      'Sensibilité pastorale développée',
      'Attention aux relations humaines',
      'Discernement cas par cas',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'high' },
      { dimension: 'communityInfluence', emphasis: 'moderate' },
    ],
  },
  observateur_engage: {
    id: 'observateur_engage',
    parentProfile: 'prudent_eclaire',
    title: 'L\'Observateur Engagé',
    emoji: '👁️',
    description: 'Vous suivez attentivement l\'évolution de l\'IA et ses applications dans le domaine religieux. Vous êtes informé, vous observez, et vous vous engagez progressivement là où cela a du sens.',
    distinguishingTraits: [
      'Curiosité intellectuelle',
      'Veille technologique active',
      'Engagement progressif et réfléchi',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'moderate' },
      { dimension: 'futureOrientation', emphasis: 'moderate' },
    ],
  },

  // --- Innovateur Ancré ---
  pont_generationnel: {
    id: 'pont_generationnel',
    parentProfile: 'innovateur_ancre',
    title: 'Le Pont Générationnel',
    emoji: '🌉',
    description: 'Vous avez le don de parler aux deux générations : vous comprenez les réticences des anciens et l\'enthousiasme des jeunes, et vous créez des ponts entre ces mondes.',
    distinguishingTraits: [
      'Capacité de médiation intergénérationnelle',
      'Bilinguisme tradition-innovation',
      'Rôle de traducteur culturel',
    ],
    idealPattern: [
      { dimension: 'communityInfluence', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'high' },
    ],
  },
  evangeliste_digital: {
    id: 'evangeliste_digital',
    parentProfile: 'innovateur_ancre',
    title: 'L\'Évangéliste Digital',
    emoji: '📱',
    description: 'Vous voyez dans l\'IA un formidable outil d\'évangélisation et de mission. Votre tradition vous donne le message, la technologie vous donne les moyens de le partager.',
    distinguishingTraits: [
      'Passion pour la mission',
      'Créativité dans les moyens',
      'Vision stratégique du numérique',
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
    description: 'Vous réfléchissez théologiquement aux questions soulevées par l\'IA. Pour vous, la tradition offre des ressources pour penser cette nouveauté, et l\'IA pose des questions fécondes à la théologie.',
    distinguishingTraits: [
      'Réflexion théologique approfondie',
      'Dialogue foi-science',
      'Production intellectuelle',
    ],
    idealPattern: [
      { dimension: 'psychologicalPerception', emphasis: 'high' },
      { dimension: 'ethicalConcern', emphasis: 'moderate' },
    ],
  },

  // --- Équilibriste ---
  mediateur: {
    id: 'mediateur',
    parentProfile: 'equilibriste',
    title: 'Le Médiateur',
    emoji: '🤝',
    description: 'Vous excellez dans l\'art de la médiation, aidant les différentes sensibilités à se comprendre. Vous créez des espaces de dialogue où chacun peut s\'exprimer.',
    distinguishingTraits: [
      'Talent de médiation',
      'Écoute active de tous les camps',
      'Création de consensus',
    ],
    idealPattern: [
      { dimension: 'communityInfluence', emphasis: 'high' },
      { dimension: 'ethicalConcern', emphasis: 'moderate' },
    ],
  },
  chercheur_sens: {
    id: 'chercheur_sens',
    parentProfile: 'equilibriste',
    title: 'Le Chercheur de Sens',
    emoji: '🔎',
    description: 'Votre équilibre vient d\'une quête de sens profonde. Vous ne vous contentez pas de positions superficielles mais cherchez à comprendre les enjeux en profondeur.',
    distinguishingTraits: [
      'Quête de sens approfondie',
      'Refus des positions superficielles',
      'Réflexion personnelle continue',
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
    description: 'Vous vous adaptez aux situations avec prudence. Selon le contexte, vous pouvez utiliser l\'IA ou vous en passer, toujours en fonction de ce qui sert le mieux le moment présent.',
    distinguishingTraits: [
      'Adaptabilité contextuelle',
      'Pragmatisme modéré',
      'Flexibilité raisonnée',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'moderate' },
      { dimension: 'aiOpenness', emphasis: 'moderate' },
    ],
  },

  // --- Pragmatique Moderne ---
  efficace_engage: {
    id: 'efficace_engage',
    parentProfile: 'pragmatique_moderne',
    title: 'L\'Efficace Engagé',
    emoji: '⚡',
    description: 'L\'efficacité est votre maître-mot, mais au service d\'un engagement profond. Vous optimisez vos processus pour consacrer plus de temps à ce qui compte : les personnes.',
    distinguishingTraits: [
      'Optimisation des processus',
      'Focus sur les relations humaines',
      'Délégation stratégique à l\'IA',
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
    description: 'Vous utilisez l\'IA principalement pour la communication : réseaux sociaux, newsletters, création de contenu. Vous voulez que le message soit entendu le plus largement possible.',
    distinguishingTraits: [
      'Compétences en communication',
      'Maîtrise des outils digitaux',
      'Souci de l\'impact du message',
    ],
    idealPattern: [
      { dimension: 'sacredBoundary', emphasis: 'low' },
      { dimension: 'communityInfluence', emphasis: 'moderate' },
    ],
  },
  optimisateur_pastoral: {
    id: 'optimisateur_pastoral',
    parentProfile: 'pragmatique_moderne',
    title: 'L\'Optimisateur Pastoral',
    emoji: '🎯',
    description: 'Vous utilisez l\'IA pour optimiser votre accompagnement pastoral : meilleure préparation, réponses plus rapides, suivi facilité. L\'objectif reste toujours la qualité de la relation.',
    distinguishingTraits: [
      'Efficacité pastorale',
      'Utilisation ciblée de l\'IA',
      'Focus sur la qualité relationnelle',
    ],
    idealPattern: [
      { dimension: 'ethicalConcern', emphasis: 'low' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },

  // --- Pionnier Spirituel ---
  visionnaire: {
    id: 'visionnaire',
    parentProfile: 'pionnier_spirituel',
    title: 'Le Visionnaire',
    emoji: '🔭',
    description: 'Vous voyez loin, imaginant des applications de l\'IA que d\'autres ne perçoivent pas encore. Vous anticipez les évolutions et préparez l\'Église de demain.',
    distinguishingTraits: [
      'Vision à long terme',
      'Anticipation des évolutions',
      'Pensée prospective',
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
    description: 'Vous testez toutes les nouvelles applications, explorez les limites, et partagez vos découvertes. Votre curiosité insatiable vous pousse à essayer ce que d\'autres n\'osent pas.',
    distinguishingTraits: [
      'Curiosité exploratoire',
      'Apprentissage par l\'expérimentation',
      'Partage des découvertes',
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
    description: 'Vous n\'êtes pas seulement utilisateur mais aussi prédicateur de cette nouvelle ère. Vous appelez l\'Église à embrasser ces technologies avec audace et discernement.',
    distinguishingTraits: [
      'Engagement prophétique',
      'Influence sur la communauté',
      'Appel au renouveau',
    ],
    idealPattern: [
      { dimension: 'communityInfluence', emphasis: 'moderate' },
      { dimension: 'religiosity', emphasis: 'moderate' },
    ],
  },

  // --- Progressiste Critique ---
  ethicien: {
    id: 'ethicien',
    parentProfile: 'progressiste_critique',
    title: 'L\'Éthicien',
    emoji: '⚖️',
    description: 'Les questions éthiques sont au cœur de votre approche. Vous analysez chaque usage de l\'IA à travers le prisme de la justice, de la dignité humaine et de la responsabilité.',
    distinguishingTraits: [
      'Sensibilité éthique aiguë',
      'Réflexion sur les implications',
      'Vigilance face aux dérives',
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
    description: 'Vous vous préoccupez des impacts sociaux de l\'IA : qui est exclu ? Qui en profite ? Vous portez une attention particulière aux plus vulnérables et aux inégalités.',
    distinguishingTraits: [
      'Conscience sociale développée',
      'Attention aux plus fragiles',
      'Combat pour l\'équité',
    ],
    idealPattern: [
      { dimension: 'communityInfluence', emphasis: 'moderate' },
      { dimension: 'ethicalConcern', emphasis: 'high' },
    ],
  },
  philosophe_spirituel: {
    id: 'philosophe_spirituel',
    parentProfile: 'progressiste_critique',
    title: 'Le Philosophe Spirituel',
    emoji: '💭',
    description: 'Vous aimez les questions profondes sur la nature de l\'IA, de la conscience, de l\'âme. Ces réflexions nourrissent votre prudence et votre discernement.',
    distinguishingTraits: [
      'Goût pour les questions fondamentales',
      'Réflexion philosophique approfondie',
      'Dialogue entre disciplines',
    ],
    idealPattern: [
      { dimension: 'psychologicalPerception', emphasis: 'high' },
      { dimension: 'sacredBoundary', emphasis: 'moderate' },
    ],
  },

  // --- Explorateur ---
  curieux_spirituel: {
    id: 'curieux_spirituel',
    parentProfile: 'explorateur',
    title: 'Le Curieux Spirituel',
    emoji: '🌱',
    description: 'Vous explorez simultanément votre foi et le monde de l\'IA. Cette double exploration vous enrichit et vous permet de construire votre propre chemin.',
    distinguishingTraits: [
      'Double exploration foi-technologie',
      'Ouverture d\'esprit',
      'Construction personnelle',
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
    description: 'Votre foi est peut-être bien établie, mais vous découvrez encore le monde de l\'IA. Vous apprenez, vous testez, vous vous formez progressivement.',
    distinguishingTraits: [
      'Foi établie, IA en découverte',
      'Apprentissage progressif',
      'Humilité face à la technologie',
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
    description: 'Votre exploration de la foi passe peut-être par les outils modernes. L\'IA vous aide à questionner, à rechercher, à comprendre les traditions spirituelles.',
    distinguishingTraits: [
      'Approche de la foi via la technologie',
      'Questionnement spirituel actif',
      'Ouverture aux ressources numériques',
    ],
    idealPattern: [
      { dimension: 'aiOpenness', emphasis: 'high' },
      { dimension: 'religiosity', emphasis: 'low' },
    ],
  },
};

// ==========================================
// PROFILE COLORS (for visualizations)
// ==========================================

export const PROFILE_COLORS: Record<PrimaryProfile, string> = {
  gardien_tradition: '#8B4513',    // Saddle Brown - traditional, earthy
  prudent_eclaire: '#4169E1',       // Royal Blue - thoughtful, balanced
  innovateur_ancre: '#228B22',      // Forest Green - rooted but growing
  equilibriste: '#9370DB',          // Medium Purple - balanced, centered
  pragmatique_moderne: '#FF6347',   // Tomato - energetic, action-oriented
  pionnier_spirituel: '#FFD700',    // Gold - bright, forward-looking
  progressiste_critique: '#20B2AA', // Light Sea Green - fresh perspective
  explorateur: '#87CEEB',           // Sky Blue - open, searching
};

export const DIMENSION_COLORS: Record<keyof SevenDimensions, string> = {
  religiosity: '#6366F1',           // Indigo
  aiOpenness: '#10B981',            // Emerald
  sacredBoundary: '#F59E0B',        // Amber
  ethicalConcern: '#EF4444',        // Red
  psychologicalPerception: '#8B5CF6', // Violet
  communityInfluence: '#3B82F6',    // Blue
  futureOrientation: '#EC4899',     // Pink
};
