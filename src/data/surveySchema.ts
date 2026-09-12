import { z } from 'zod';
import {
  getStringAnswer,
  isClergy,
  isLayperson,
  clergyUsesAI,
} from '@/lib/utils/answers';
import {
  getFrenchOptionLabel,
  getFrenchQuestionText,
  getOptionValues,
  getPlaceholder,
  getFrenchMatrixRowLabel,
  getFrenchMatrixColumnLabel,
} from '@/lib/i18n/questions';

// --- DEFINITIONS ---

export type QuestionType = 'choice' | 'multiple' | 'scale' | 'matrix' | 'text' | 'info';

export type AnswerValue = string | number | string[] | Record<string, number>;
export type Answers = Record<string, AnswerValue>;

export interface Option {
  value: string;
  label: string;
}

export interface MatrixRow {
  value: string;
  label: string;
}

export interface MatrixColumn {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  category:
    | 'profile'
    | 'religiosity'
    | 'usage'
    | 'digital_spiritual'
    | 'ministry_preaching'
    | 'ministry_pastoral'
    | 'ministry_vision'
    | 'spirituality'
    | 'theology'
    | 'psychology'
    | 'community'
    | 'future'
    | 'social_desirability'
    | 'open';
  text: string;
  type: QuestionType;
  options?: Option[];
  // Matrix question specific
  rows?: MatrixRow[];
  columns?: MatrixColumn[];
  minLabel?: string;
  maxLabel?: string;
  minLabelKey?: string;
  maxLabelKey?: string;
  condition?: (answers: Answers) => boolean;
  placeholder?: string;
}

/**
 * Survey instrument version, stamped on every response for schema lineage.
 * v2.0.0: CRS-5 realignment, screen-out, "sans réponse" options, exclusive
 * `aucun*` multiple choices, single source of truth for displayed text.
 */
export const INSTRUMENT_VERSION = '2.0.0';

/** Consent wording version, stamped on every response. */
export const CONSENT_VERSION = '2.0';

// --- HELPERS ---
// Displayed text always comes from src/lib/i18n/questions.ts (the canonical
// source), so the codebook generated from this schema quotes exactly what the
// respondent read. Both helpers throw at module load on a missing key.

const text = getFrenchQuestionText;

function options(questionId: string): Option[] {
  return getOptionValues(questionId).map((value) => ({
    value,
    label: getFrenchOptionLabel(questionId, value),
  }));
}

function rows(values: readonly string[]): MatrixRow[] {
  return values.map((value) => ({ value, label: getFrenchMatrixRowLabel(value) }));
}

function columns(values: readonly number[]): MatrixColumn[] {
  return values.map((value) => ({ value, label: getFrenchMatrixColumnLabel(value) }));
}

// --- CONTENU DU SONDAGE COMPLET ---
// Structure: 58 questions totales, 46 à 53 affichées selon le parcours
// (sous-questions de confession, clergé vs laïc, usage de l'IA en général et
// en prédication). La borne est vérifiée par surveySchema.test.ts.
// Hypothèses de corrélation testables: H1-H8 (voir méthodologie)

export const SURVEY_QUESTIONS: Question[] = [
  // ==========================================
  // BLOC 1: PROFIL & DÉMOGRAPHIE
  // ==========================================
  {
    id: 'profil_confession',
    category: 'profile',
    text: text('profil_confession'),
    type: 'choice',
    options: options('profil_confession'),
  },
  {
    id: 'profil_confession_catholique',
    category: 'profile',
    text: text('profil_confession_catholique'),
    type: 'choice',
    options: options('profil_confession_catholique'),
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'catholique',
  },
  {
    id: 'profil_confession_protestante',
    category: 'profile',
    text: text('profil_confession_protestante'),
    type: 'choice',
    options: options('profil_confession_protestante'),
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'protestant',
  },
  {
    id: 'profil_confession_evangelique',
    category: 'profile',
    text: text('profil_confession_evangelique'),
    type: 'choice',
    options: options('profil_confession_evangelique'),
    condition: (answers) => getStringAnswer(answers, 'profil_confession_protestante') === 'evangelique',
  },
  {
    id: 'profil_confession_orthodoxe',
    category: 'profile',
    text: text('profil_confession_orthodoxe'),
    type: 'choice',
    options: options('profil_confession_orthodoxe'),
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'orthodoxe',
  },
  {
    id: 'profil_confession_autre',
    category: 'profile',
    text: text('profil_confession_autre'),
    type: 'choice',
    options: options('profil_confession_autre'),
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'autre_chretien',
  },
  {
    id: 'profil_statut',
    category: 'profile',
    text: text('profil_statut'),
    type: 'choice',
    options: options('profil_statut'),
  },
  {
    id: 'profil_age',
    category: 'profile',
    text: text('profil_age'),
    type: 'choice',
    options: options('profil_age'),
  },
  {
    id: 'profil_genre',
    category: 'profile',
    text: text('profil_genre'),
    type: 'choice',
    options: options('profil_genre'),
  },
  {
    id: 'profil_education',
    category: 'profile',
    text: text('profil_education'),
    type: 'choice',
    options: options('profil_education'),
  },
  {
    id: 'profil_formation_theologique',
    category: 'profile',
    text: text('profil_formation_theologique'),
    type: 'choice',
    options: options('profil_formation_theologique'),
  },
  {
    id: 'profil_pays',
    category: 'profile',
    text: text('profil_pays'),
    type: 'choice',
    options: options('profil_pays'),
  },
  {
    id: 'profil_milieu',
    category: 'profile',
    text: text('profil_milieu'),
    type: 'choice',
    options: options('profil_milieu'),
  },
  {
    id: 'profil_secteur',
    category: 'profile',
    text: text('profil_secteur'),
    type: 'choice',
    options: options('profil_secteur'),
  },
  {
    id: 'profil_anciennete_foi',
    category: 'profile',
    text: text('profil_anciennete_foi'),
    type: 'choice',
    options: options('profil_anciennete_foi'),
  },
  {
    id: 'profil_annees_ministere',
    category: 'profile',
    text: text('profil_annees_ministere'),
    type: 'choice',
    options: options('profil_annees_ministere'),
    condition: isClergy,
  },
  {
    id: 'profil_taille_communaute',
    category: 'profile',
    text: text('profil_taille_communaute'),
    type: 'choice',
    options: options('profil_taille_communaute'),
  },

  // ==========================================
  // BLOC 2: CRS-5 (Centrality of Religiosity Scale - Short Form)
  // Huber & Huber (2012), adapté
  // ==========================================
  {
    id: 'crs_intellect',
    category: 'religiosity',
    text: text('crs_intellect'),
    type: 'choice',
    options: options('crs_intellect'),
  },
  {
    id: 'crs_ideology',
    category: 'religiosity',
    text: text('crs_ideology'),
    type: 'choice',
    options: options('crs_ideology'),
  },
  {
    id: 'crs_public_practice',
    category: 'religiosity',
    text: text('crs_public_practice'),
    type: 'choice',
    options: options('crs_public_practice'),
  },
  {
    id: 'crs_private_practice',
    category: 'religiosity',
    text: text('crs_private_practice'),
    type: 'choice',
    options: options('crs_private_practice'),
  },
  {
    id: 'crs_experience',
    category: 'religiosity',
    text: text('crs_experience'),
    type: 'choice',
    options: options('crs_experience'),
  },

  // ==========================================
  // BLOC 3: ORIENTATION THÉOLOGIQUE
  // ==========================================
  {
    id: 'theo_orientation',
    category: 'theology',
    text: text('theo_orientation'),
    type: 'choice',
    options: options('theo_orientation'),
  },

  // ==========================================
  // BLOC 3b: CONTRÔLE USAGE IA GÉNÉRAL (POUR TOUS)
  // Établit une baseline avant les questions spirituelles
  // ==========================================
  {
    id: 'ctrl_ia_frequence',
    category: 'usage',
    text: text('ctrl_ia_frequence'),
    type: 'choice',
    options: options('ctrl_ia_frequence'),
  },
  {
    id: 'ctrl_ia_contextes',
    category: 'usage',
    text: text('ctrl_ia_contextes'),
    type: 'multiple',
    options: options('ctrl_ia_contextes'),
    condition: (answers) => {
      const freq = getStringAnswer(answers, 'ctrl_ia_frequence');
      return freq !== '' && freq !== 'jamais';
    },
  },
  {
    id: 'ctrl_ia_confort',
    category: 'usage',
    text: text('ctrl_ia_confort'),
    type: 'scale',
    minLabelKey: 'not_comfortable',
    maxLabelKey: 'very_comfortable',
  },

  // ==========================================
  // BLOC 3c: OUTILS NUMÉRIQUES SPIRITUELS EXISTANTS
  // Établit si la résistance est spécifique à l'IA ou générale au numérique
  // ==========================================
  {
    id: 'digital_outils_existants',
    category: 'digital_spiritual',
    text: text('digital_outils_existants'),
    type: 'multiple',
    options: options('digital_outils_existants'),
  },
  {
    id: 'digital_attitude_generale',
    category: 'digital_spiritual',
    text: text('digital_attitude_generale'),
    type: 'choice',
    options: options('digital_attitude_generale'),
  },

  // ==========================================
  // BLOC 4: MINISTÈRE & LEADERSHIP (CLERGÉ UNIQUEMENT)
  // ==========================================

  // A. PRÉDICATION (HOMILÉTIQUE)
  {
    id: 'min_pred_usage',
    category: 'ministry_preaching',
    text: text('min_pred_usage'),
    type: 'choice',
    options: options('min_pred_usage'),
    condition: isClergy,
  },
  {
    id: 'min_pred_nature',
    category: 'ministry_preaching',
    text: text('min_pred_nature'),
    type: 'matrix',
    rows: rows(['plan', 'exegese', 'illustration', 'images', 'redaction']),
    columns: columns([0, 1, 2, 3]),
    condition: clergyUsesAI,
  },
  {
    id: 'min_pred_sentiment',
    category: 'ministry_preaching',
    text: text('min_pred_sentiment'),
    type: 'scale',
    minLabelKey: 'comfortable',
    maxLabelKey: 'uncomfortable',
    condition: clergyUsesAI,
  },

  // B. SOIN PASTORAL (CARE)
  {
    id: 'min_care_email',
    category: 'ministry_pastoral',
    text: text('min_care_email'),
    type: 'choice',
    options: options('min_care_email'),
    condition: isClergy,
  },

  // C. VISION & CHARGE ADMINISTRATIVE
  // Posée uniquement au clergé qui utilise réellement l'IA : sinon la
  // question demande d'évaluer un gain de temps jamais expérimenté.
  {
    id: 'min_admin_burden',
    category: 'ministry_vision',
    text: text('min_admin_burden'),
    type: 'scale',
    minLabelKey: 'no_complicates_all',
    maxLabelKey: 'yes_liberator',
    condition: clergyUsesAI,
  },

  // ==========================================
  // BLOC 5: USAGE SPIRITUEL LAÏC (LAÏCS UNIQUEMENT)
  // ==========================================
  {
    id: 'laic_substitution_priere',
    category: 'spirituality',
    text: text('laic_substitution_priere'),
    type: 'choice',
    options: options('laic_substitution_priere'),
    condition: isLayperson,
  },
  {
    id: 'laic_conseil_spirituel',
    category: 'spirituality',
    text: text('laic_conseil_spirituel'),
    type: 'choice',
    options: options('laic_conseil_spirituel'),
    condition: isLayperson,
  },

  // ==========================================
  // BLOC 6: PSYCHOLOGIE - ANTHROPOMORPHISME & ANXIÉTÉ IA
  // ==========================================
  {
    id: 'psych_godspeed_nature',
    category: 'psychology',
    text: text('psych_godspeed_nature'),
    type: 'choice',
    options: options('psych_godspeed_nature'),
  },
  {
    id: 'psych_godspeed_conscience',
    category: 'psychology',
    text: text('psych_godspeed_conscience'),
    type: 'choice',
    options: options('psych_godspeed_conscience'),
  },
  {
    id: 'psych_aias_opacity',
    category: 'psychology',
    text: text('psych_aias_opacity'),
    type: 'choice',
    options: options('psych_aias_opacity'),
  },
  {
    id: 'psych_imago_dei',
    category: 'psychology',
    text: text('psych_imago_dei'),
    type: 'choice',
    options: options('psych_imago_dei'),
  },
  {
    id: 'psych_anxiete_remplacement',
    category: 'psychology',
    text: text('psych_anxiete_remplacement'),
    type: 'choice',
    options: options('psych_anxiete_remplacement'),
  },

  // ==========================================
  // BLOC 7: THÉOLOGIE & ÉTHIQUE (POUR TOUS)
  // ==========================================
  {
    id: 'theo_inspiration',
    category: 'theology',
    text: text('theo_inspiration'),
    type: 'choice',
    options: options('theo_inspiration'),
  },
  {
    id: 'theo_liturgie_ia',
    category: 'theology',
    text: text('theo_liturgie_ia'),
    type: 'scale',
    minLabelKey: 'absolutely_not',
    maxLabelKey: 'completely_acceptable',
  },
  {
    id: 'theo_activites_sacrees',
    category: 'theology',
    text: text('theo_activites_sacrees'),
    type: 'multiple',
    options: options('theo_activites_sacrees'),
  },
  {
    id: 'theo_mediation_humaine',
    category: 'theology',
    text: text('theo_mediation_humaine'),
    type: 'choice',
    options: options('theo_mediation_humaine'),
  },
  {
    id: 'theo_risque_futur',
    category: 'theology',
    text: text('theo_risque_futur'),
    type: 'choice',
    options: options('theo_risque_futur'),
  },
  {
    id: 'theo_utilite_percue',
    category: 'theology',
    text: text('theo_utilite_percue'),
    type: 'choice',
    options: options('theo_utilite_percue'),
  },

  // ==========================================
  // BLOC 8: DIMENSION COMMUNAUTAIRE
  // Position sociale et influence du groupe
  // ==========================================
  {
    id: 'communaute_position_officielle',
    category: 'community',
    text: text('communaute_position_officielle'),
    type: 'choice',
    options: options('communaute_position_officielle'),
  },
  {
    id: 'communaute_discussions',
    category: 'community',
    text: text('communaute_discussions'),
    type: 'choice',
    options: options('communaute_discussions'),
  },
  {
    id: 'communaute_perception_pairs',
    category: 'community',
    text: text('communaute_perception_pairs'),
    type: 'choice',
    options: options('communaute_perception_pairs'),
  },

  // ==========================================
  // BLOC 9: INTENTIONS FUTURES
  // Dimension prospective et besoins
  // ==========================================
  {
    id: 'futur_intention_usage',
    category: 'future',
    text: text('futur_intention_usage'),
    type: 'choice',
    options: options('futur_intention_usage'),
  },
  {
    id: 'futur_formation_souhait',
    category: 'future',
    text: text('futur_formation_souhait'),
    type: 'choice',
    options: options('futur_formation_souhait'),
  },
  {
    id: 'futur_domaines_interet',
    category: 'future',
    text: text('futur_domaines_interet'),
    type: 'multiple',
    options: options('futur_domaines_interet'),
  },

  // ==========================================
  // BLOC 10: QUESTION OUVERTE FINALE
  // Recueil de nuances et commentaires libres
  // ==========================================
  {
    id: 'commentaires_libres',
    category: 'open',
    text: text('commentaires_libres'),
    type: 'text',
    placeholder: getPlaceholder('fr', 'commentaires_libres'),
  },

  // ==========================================
  // BLOC 11: CONTRÔLE DÉSIRABILITÉ SOCIALE
  // Sélection ad hoc de 5 items de la MCSDS (Crowne & Marlowe, 1960)
  // ==========================================
  {
    id: 'ctrl_mc_1',
    category: 'social_desirability',
    text: text('ctrl_mc_1'),
    type: 'choice',
    options: options('ctrl_mc_1'),
  },
  {
    id: 'ctrl_mc_2',
    category: 'social_desirability',
    text: text('ctrl_mc_2'),
    type: 'choice',
    options: options('ctrl_mc_2'),
  },
  {
    id: 'ctrl_mc_3',
    category: 'social_desirability',
    text: text('ctrl_mc_3'),
    type: 'choice',
    options: options('ctrl_mc_3'),
  },
  {
    id: 'ctrl_mc_4',
    category: 'social_desirability',
    text: text('ctrl_mc_4'),
    type: 'choice',
    options: options('ctrl_mc_4'),
  },
  {
    id: 'ctrl_mc_5',
    category: 'social_desirability',
    text: text('ctrl_mc_5'),
    type: 'choice',
    options: options('ctrl_mc_5'),
  },
];

// --- SCREEN-OUT & VISIBILITY ---

/** Value that ends the questionnaire right after the first question. */
export const SCREEN_OUT_CONFESSION = 'sans_religion';

/**
 * A respondent outside the studied population (no religion / other) is
 * screened out: the questionnaire stops after the confession question and the
 * response is stored with `metadata.screenedOut = true`, without scoring.
 */
export function isScreenedOut(answers: Answers): boolean {
  return getStringAnswer(answers, 'profil_confession') === SCREEN_OUT_CONFESSION;
}

/**
 * Questions to display for a given set of answers. Single source of truth for
 * the survey flow (SurveyContainer) and for the schema tests.
 */
export function getVisibleQuestions(answers: Answers): Question[] {
  if (isScreenedOut(answers)) {
    return SURVEY_QUESTIONS.filter((q) => q.id === 'profil_confession');
  }
  return SURVEY_QUESTIONS.filter((q) => !q.condition || q.condition(answers));
}

// --- ANSWER VALIDATION HELPERS ---

/**
 * Multiple-choice options whose value starts with `aucun` ("none of these")
 * are exclusive: they cannot be combined with any other selection.
 */
export function isExclusiveOptionValue(value: string): boolean {
  return value.startsWith('aucun');
}

// Matrix answer schema: Record<string, number> where keys are row values and values are column values (0-3)
const MatrixAnswerSchema = z.record(z.string(), z.number().min(0).max(3));

export const ResponseSchema = z.record(z.string(), z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  MatrixAnswerSchema
]));
