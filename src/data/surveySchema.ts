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
  category: 'profile' | 'religiosity' | 'usage' | 'ministry_preaching' | 'ministry_pastoral' | 'ministry_vision' | 'spirituality' | 'theology' | 'social_desirability';
  text: string;
  type: QuestionType;
  options?: Option[];
  minLabel?: string;
  maxLabel?: string;
  condition?: (answers: Answers) => boolean;
}

// Helper function to safely get string value from answers
function getStringAnswer(answers: Answers, key: string): string {
  const value = answers[key];
  if (typeof value === 'string') return value;
  return '';
}

// --- CONTENU DU SONDAGE COMPLET ---

export const SURVEY_QUESTIONS: Question[] = [
  // ==========================================
  // 1. PROFIL & DÉMOGRAPHIE RELIGIEUSE
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
      { value: 'clerge', label: 'Clergé / Pasteur / Prêtre / Leader rémunéré (Producteur)' },
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

  // ==========================================
  // 2. RELIGIOSITÉ INTRINSÈQUE (Huber Scale)
  // ==========================================
  {
    id: 'relig_frequence_perso',
    category: 'religiosity',
    text: "En dehors des cultes/messes, à quelle fréquence priez-vous ou méditez-vous ?",
    type: 'choice',
    options: [
      { value: 'quotidien', label: 'Tous les jours' },
      { value: 'hebdo', label: 'Plusieurs fois par semaine' },
      { value: 'occasionnel', label: 'Occasionnellement' },
      { value: 'jamais', label: 'Jamais' }
    ]
  },

  // ==========================================
  // 3. MINISTÈRE & LEADERSHIP (SECTION DÉDIÉE CLERCS)
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
    condition: (answers) => {
      const statut = getStringAnswer(answers, 'profil_statut');
      return ['clerge', 'religieux'].includes(statut);
    }
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
    condition: (answers) => {
      const statut = getStringAnswer(answers, 'profil_statut');
      const usage = getStringAnswer(answers, 'min_pred_usage');
      return ['clerge', 'religieux'].includes(statut) && usage !== 'jamais';
    }
  },
  {
    id: 'min_pred_sentiment',
    category: 'ministry_preaching',
    text: "Ressentez-vous une forme de 'culpabilité' ou de gêne à utiliser l'IA pour une tâche spirituelle ?",
    type: 'scale',
    minLabel: "Aucune gêne (C'est un outil)",
    maxLabel: "Forte culpabilité (Sentiment de triche)"
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
    condition: (answers) => {
      const statut = getStringAnswer(answers, 'profil_statut');
      return ['clerge', 'religieux'].includes(statut);
    }
  },
  {
    id: 'min_admin_burden',
    category: 'ministry_vision',
    text: "Diriez-vous que l'IA vous libère du temps administratif pour vous consacrer davantage aux relations humaines ?",
    type: 'scale',
    minLabel: "Non, ça complique tout",
    maxLabel: "Oui, c'est un libérateur"
  },

  // ==========================================
  // 4. USAGE LAÏC & SPIRITUALITÉ
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
    condition: (answers) => {
      const statut = getStringAnswer(answers, 'profil_statut');
      return !['clerge', 'religieux'].includes(statut);
    }
  },

  // ==========================================
  // 5. THÉOLOGIE & ÉTHIQUE (POUR TOUS)
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

  // ==========================================
  // 6. CONTRÔLE (Marlowe-Crowne)
  // ==========================================
  {
    id: 'ctrl_sdb_resentment',
    category: 'social_desirability',
    text: "Vrai ou Faux : 'Je n'ai jamais éprouvé de ressentiment envers quelqu'un dont le comportement m'a déplu.'",
    type: 'choice',
    options: [
      { value: 'true', label: 'Vrai' },
      { value: 'false', label: 'Faux' }
    ]
  }
];

export const ResponseSchema = z.record(z.string(), z.union([z.string(), z.number(), z.array(z.string())]));
