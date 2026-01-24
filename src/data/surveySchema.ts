import { z } from 'zod';

// --- DEFINITIONS ---

export type QuestionType = 'choice' | 'multiple' | 'scale' | 'text' | 'info';

export type AnswerValue = string | number | string[];
export type Answers = Record<string, AnswerValue>;

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  category:
    | 'profile'
    | 'religiosity'
    | 'usage'
    | 'ministry_preaching'
    | 'ministry_pastoral'
    | 'ministry_vision'
    | 'spirituality'
    | 'theology'
    | 'psychology'
    | 'social_desirability';
  text: string;
  type: QuestionType;
  options?: Option[];
  minLabel?: string;
  maxLabel?: string;
  minLabelKey?: string;
  maxLabelKey?: string;
  condition?: (answers: Answers) => boolean;
}

// Helper function to safely get string value from answers
function getStringAnswer(answers: Answers, key: string): string {
  const value = answers[key];
  if (typeof value === 'string') return value;
  return '';
}

// Helper to check if respondent is clergy
function isClergy(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return ['clerge', 'religieux'].includes(statut);
}

// Helper to check if respondent is layperson
function isLayperson(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return ['laic_engagé', 'laic_pratiquant', 'curieux'].includes(statut);
}

// Helper to check if clergy uses AI for preaching
function clergyUsesAI(answers: Answers): boolean {
  const usage = getStringAnswer(answers, 'min_pred_usage');
  return isClergy(answers) && usage !== '' && usage !== 'jamais';
}

// --- CONTENU DU SONDAGE COMPLET ---
// Structure: ~15-18 questions selon le parcours (clergé vs laïc)
// Hypothèses de corrélation testables: H1-H6 (voir méthodologie)

export const SURVEY_QUESTIONS: Question[] = [
  // ==========================================
  // BLOC 1: PROFIL & DÉMOGRAPHIE
  // ==========================================
  {
    id: 'profil_confession',
    category: 'profile',
    text: "Quelle est votre branche chrétienne principale ?",
    type: 'choice',
    options: [
      { value: 'catholique', label: 'Catholique' },
      { value: 'protestant', label: 'Protestant' },
      { value: 'orthodoxe', label: 'Orthodoxe' },
      { value: 'autre', label: 'Autre sensibilité chrétienne' },
      { value: 'sans_religion', label: 'Sans religion / Autre (Fin du sondage)' }
    ]
  },
  {
    id: 'profil_confession_protestante',
    category: 'profile',
    text: "Précisez votre sensibilité protestante :",
    type: 'choice',
    options: [
      { value: 'protestant_reforme', label: 'Protestantisme historique (Luthéro-réformé)' },
      { value: 'evangelique', label: 'Évangélique / Pentecôtiste' }
    ],
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'protestant'
  },
  {
    id: 'profil_statut',
    category: 'profile',
    text: "Quelle fonction occupez-vous principalement au sein de votre communauté ?",
    type: 'choice',
    options: [
      { value: 'clerge', label: 'Clergé / Pasteur / Prêtre / Leader rémunéré' },
      { value: 'religieux', label: 'Religieux / Consacré(e)' },
      { value: 'laic_engagé', label: 'Laïc engagé / Responsable bénévole' },
      { value: 'laic_pratiquant', label: 'Fidèle / Pratiquant régulier' },
      { value: 'curieux', label: 'Croyant non pratiquant / Curieux' }
    ]
  },
  {
    id: 'profil_age',
    category: 'profile',
    text: "Votre tranche d'âge",
    type: 'choice',
    options: [
      { value: '18-35', label: '18-35 ans' },
      { value: '36-50', label: '36-50 ans' },
      { value: '51-65', label: '51-65 ans' },
      { value: '66+', label: 'Plus de 66 ans' }
    ]
  },
  {
    id: 'profil_genre',
    category: 'profile',
    text: "Votre genre",
    type: 'choice',
    options: [
      { value: 'homme', label: 'Homme' },
      { value: 'femme', label: 'Femme' },
      { value: 'autre', label: 'Autre / Ne souhaite pas répondre' }
    ]
  },

  // ==========================================
  // BLOC 2: CRS-5 (Centrality of Religiosity Scale - Short Form)
  // Huber & Huber (2012) - 5 dimensions clés
  // ==========================================
  {
    id: 'crs_intellect',
    category: 'religiosity',
    text: "À quelle fréquence réfléchissez-vous à des questions religieuses ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'rarement', label: 'Rarement' },
      { value: 'occasionnellement', label: 'Occasionnellement' },
      { value: 'souvent', label: 'Souvent' },
      { value: 'tres_souvent', label: 'Très souvent' }
    ]
  },
  {
    id: 'crs_ideology',
    category: 'religiosity',
    text: "Dans quelle mesure croyez-vous en l'existence de Dieu ou d'une réalité divine ?",
    type: 'choice',
    options: [
      { value: 'pas_du_tout', label: 'Pas du tout' },
      { value: 'peu', label: 'Un peu' },
      { value: 'moderement', label: 'Modérément' },
      { value: 'beaucoup', label: 'Beaucoup' },
      { value: 'totalement', label: 'Totalement' }
    ]
  },
  {
    id: 'crs_public_practice',
    category: 'religiosity',
    text: "À quelle fréquence participez-vous à des offices religieux ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'quelques_fois_an', label: 'Quelques fois par an' },
      { value: 'mensuel', label: 'Une à trois fois par mois' },
      { value: 'hebdo', label: 'Une fois par semaine' },
      { value: 'pluri_hebdo', label: 'Plus d\'une fois par semaine' }
    ]
  },
  {
    id: 'crs_private_practice',
    category: 'religiosity',
    text: "À quelle fréquence priez-vous en dehors des offices ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'rarement', label: 'Rarement' },
      { value: 'occasionnellement', label: 'Occasionnellement' },
      { value: 'quotidien', label: 'Quotidiennement' },
      { value: 'pluri_quotidien', label: 'Plusieurs fois par jour' }
    ]
  },
  {
    id: 'crs_experience',
    category: 'religiosity',
    text: "À quelle fréquence vivez-vous des expériences où vous sentez la présence de Dieu ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'rarement', label: 'Rarement' },
      { value: 'occasionnellement', label: 'Occasionnellement' },
      { value: 'souvent', label: 'Souvent' },
      { value: 'tres_souvent', label: 'Très souvent' }
    ]
  },

  // ==========================================
  // BLOC 3: ORIENTATION THÉOLOGIQUE
  // ==========================================
  {
    id: 'theo_orientation',
    category: 'theology',
    text: "Comment situeriez-vous votre sensibilité théologique ?",
    type: 'choice',
    options: [
      { value: 'traditionaliste', label: 'Traditionaliste / Conservateur' },
      { value: 'modere', label: 'Modéré / Centriste' },
      { value: 'progressiste', label: 'Progressiste / Libéral' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Sans opinion' }
    ]
  },

  // ==========================================
  // BLOC 3b: CONTRÔLE USAGE IA GÉNÉRAL (POUR TOUS)
  // Établit une baseline avant les questions spirituelles
  // ==========================================
  {
    id: 'ctrl_ia_frequence',
    category: 'usage',
    text: "En général, à quelle fréquence utilisez-vous des outils d'IA (ChatGPT, Gemini, Claude, Copilot...) ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'essaye', label: 'J\'ai essayé une ou deux fois' },
      { value: 'occasionnel', label: 'Occasionnellement (quelques fois par mois)' },
      { value: 'regulier', label: 'Régulièrement (plusieurs fois par semaine)' },
      { value: 'quotidien', label: 'Quotidiennement' }
    ]
  },
  {
    id: 'ctrl_ia_contextes',
    category: 'usage',
    text: "Dans quels contextes utilisez-vous l'IA ? (plusieurs réponses possibles)",
    type: 'multiple',
    options: [
      { value: 'travail_pro', label: 'Travail professionnel (emails, rapports, présentations)' },
      { value: 'recherche_info', label: 'Recherche d\'informations / Apprentissage' },
      { value: 'creation', label: 'Création de contenu (textes, images, vidéos)' },
      { value: 'programmation', label: 'Programmation / Code' },
      { value: 'loisirs', label: 'Loisirs / Divertissement' },
      { value: 'spirituel', label: 'Vie spirituelle / Religieuse' }
    ],
    condition: (answers) => {
      const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
      return freq !== '' && freq !== 'jamais';
    }
  },
  {
    id: 'ctrl_ia_confort',
    category: 'usage',
    text: "Globalement, quel est votre niveau de confort avec les outils d'IA ?",
    type: 'scale',
    minLabel: "Très inconfortable",
    maxLabel: "Très à l'aise"
  },

  // ==========================================
  // BLOC 4: MINISTÈRE & LEADERSHIP (CLERGÉ UNIQUEMENT)
  // ==========================================

  // A. PRÉDICATION (HOMILÉTIQUE)
  {
    id: 'min_pred_usage',
    category: 'ministry_preaching',
    text: "Pour la préparation de vos prédications (homélies, sermons), utilisez-vous l'IA ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais (Par principe ou désintérêt)' },
      { value: 'rare', label: 'Rarement (Pour débloquer une idée)' },
      { value: 'regulier', label: 'Régulièrement (Comme assistant de recherche)' },
      { value: 'systematique', label: 'Systématiquement (Partie intégrante du workflow)' }
    ],
    condition: isClergy
  },
  {
    id: 'min_pred_nature',
    category: 'ministry_preaching',
    text: "Concrètement, que déléguez-vous à l'IA ?",
    type: 'multiple',
    options: [
      { value: 'plan', label: 'La structure / Le plan' },
      { value: 'exegese', label: "L'exégèse et le contexte historique" },
      { value: 'illustration', label: "La recherche d'illustrations / anecdotes" },
      { value: 'redaction', label: 'La rédaction de paragraphes entiers' }
    ],
    condition: clergyUsesAI
  },
  {
    id: 'min_pred_sentiment',
    category: 'ministry_preaching',
    text: "Ressentez-vous une forme de 'culpabilité' ou de gêne à utiliser l'IA pour une tâche spirituelle ?",
    type: 'scale',
    minLabel: "Aucune gêne (C'est un outil)",
    maxLabel: "Forte culpabilité (Sentiment de triche)",
    condition: clergyUsesAI
  },

  // B. SOIN PASTORAL (CARE)
  {
    id: 'min_care_email',
    category: 'ministry_pastoral',
    text: "Si vous recevez un email complexe demandant un conseil spirituel, utiliseriez-vous l'IA pour rédiger la réponse ?",
    type: 'choice',
    options: [
      { value: 'non_jamais', label: "Non, jamais (Manque d'empathie réelle)" },
      { value: 'oui_brouillon', label: 'Oui, pour un premier brouillon que je retravaille' },
      { value: 'oui_souvent', label: "Oui, cela me permet d'être plus réactif" }
    ],
    condition: isClergy
  },

  // C. VISION & CHARGE ADMINISTRATIVE
  {
    id: 'min_admin_burden',
    category: 'ministry_vision',
    text: "Diriez-vous que l'IA vous libère du temps administratif pour vous consacrer davantage aux relations humaines ?",
    type: 'scale',
    minLabel: "Non, ça complique tout",
    maxLabel: "Oui, c'est un libérateur",
    condition: isClergy
  },

  // ==========================================
  // BLOC 5: USAGE SPIRITUEL LAÏC (LAÏCS UNIQUEMENT)
  // ==========================================
  {
    id: 'laic_substitution_priere',
    category: 'spirituality',
    text: "Avez-vous déjà utilisé une IA pour générer une prière ou une méditation que vous avez ensuite utilisée ?",
    type: 'choice',
    options: [
      { value: 'non', label: 'Non, jamais' },
      { value: 'oui', label: "Oui, et c'était spirituellement porteur" },
      { value: 'oui_bof', label: "Oui, mais c'était creux / vide" }
    ],
    condition: isLayperson
  },
  {
    id: 'laic_conseil_spirituel',
    category: 'spirituality',
    text: "Pourriez-vous imaginer demander un conseil spirituel à une IA plutôt qu'à un prêtre/pasteur ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais, cela me semble inapproprié' },
      { value: 'complement', label: 'En complément, mais pas en remplacement' },
      { value: 'oui_possible', label: 'Oui, pour certaines questions' },
      { value: 'deja_fait', label: "Oui, je l'ai déjà fait" }
    ],
    condition: isLayperson
  },

  // ==========================================
  // BLOC 6: PSYCHOLOGIE - ANTHROPOMORPHISME & ANXIÉTÉ IA
  // ==========================================
  {
    id: 'psych_anthropomorphisme',
    category: 'psychology',
    text: "Considérez-vous qu'une IA puisse avoir une forme de 'conscience' ou de 'personnalité' ?",
    type: 'scale',
    minLabel: "Impossible (Pure mécanique)",
    maxLabel: "Possible (Forme d'intelligence)"
  },
  {
    id: 'psych_imago_dei',
    category: 'psychology',
    text: "Selon vous, l'IA remet-elle en question ce qui fait la spécificité de l'être humain (créé à l'image de Dieu) ?",
    type: 'scale',
    minLabel: "Non, l'humain reste unique",
    maxLabel: "Oui, cela questionne notre singularité"
  },
  {
    id: 'psych_anxiete_remplacement',
    category: 'psychology',
    text: "Craignez-vous que l'IA puisse un jour remplacer certaines fonctions spirituelles humaines (prédication, accompagnement) ?",
    type: 'scale',
    minLabel: "Aucune crainte",
    maxLabel: "Forte inquiétude"
  },

  // ==========================================
  // BLOC 7: THÉOLOGIE & ÉTHIQUE (POUR TOUS)
  // ==========================================
  {
    id: 'theo_inspiration',
    category: 'theology',
    text: "Un texte généré par un algorithme peut-il, selon vous, transmettre la grâce ou être 'inspiré' ?",
    type: 'scale',
    minLabel: "Impossible (Matérialisme)",
    maxLabel: "Possible (L'Esprit souffle où il veut)"
  },
  {
    id: 'theo_risque_futur',
    category: 'theology',
    text: "Quelle est votre plus grande crainte concernant l'IA dans l'Église ?",
    type: 'choice',
    options: [
      { value: 'paresse', label: 'La paresse intellectuelle/spirituelle des fidèles' },
      { value: 'deshumanisation', label: 'La déshumanisation des relations' },
      { value: 'heresie', label: "La diffusion d'erreurs doctrinales" },
      { value: 'aucune', label: "Je n'ai pas de crainte majeure" }
    ]
  },
  {
    id: 'theo_utilite_percue',
    category: 'theology',
    text: "Dans l'ensemble, pensez-vous que l'IA peut être un outil bénéfique pour la vie de l'Église ?",
    type: 'scale',
    minLabel: "Non, c'est un danger",
    maxLabel: "Oui, c'est une opportunité"
  },

  // ==========================================
  // BLOC 8: CONTRÔLE DÉSIRABILITÉ SOCIALE (Marlowe-Crowne Short Form)
  // 5 items sélectionnés pour cohérence interne
  // ==========================================
  {
    id: 'ctrl_mc_1',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'Il m'est parfois difficile de continuer mon travail si je ne suis pas encouragé(e).'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  },
  {
    id: 'ctrl_mc_2',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'Je n'ai jamais intensément détesté quelqu'un.'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  },
  {
    id: 'ctrl_mc_3',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'J'ai parfois eu envie de me rebeller contre des personnes en position d'autorité même si je savais qu'elles avaient raison.'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  },
  {
    id: 'ctrl_mc_4',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'Je suis toujours courtois(e), même avec des personnes désagréables.'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  },
  {
    id: 'ctrl_mc_5',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'Il m'est arrivé de profiter de quelqu'un.'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  }
];

export const ResponseSchema = z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())]));
