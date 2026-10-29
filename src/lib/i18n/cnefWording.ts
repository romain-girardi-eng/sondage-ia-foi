/**
 * CNEF version of the questionnaire (/cnef).
 *
 * Requested by the CNEF on 28 October 2026 (review file « Sondage IA -
 * Protestants.xlsx »). The general survey is unchanged. On /cnef:
 * - some questions are reworded (French), some options relabelled or hidden,
 *   and some questions are not asked (CNEF_HIDDEN_QUESTIONS);
 * - two questions use the CNEF option set (cnefDetailedQuestions): the answer
 *   given is stored under `_cnef_<id>` and the canonical value the instrument
 *   expects is derived from it, so routing, scoring and the preregistered
 *   recodes keep working on `<id>`.
 *
 * Every response given through /cnef is stamped with CNEF_WORDING_VERSION in
 * `metadata.wordingVariant`, so the exact text each respondent read can be
 * reconstructed.
 */

import type { AnswerValue, Answers } from "@/data/surveySchema";

export const CNEF_WORDING_VERSION = "cnef-2026-10";

/** Not asked on /cnef. */
export const CNEF_HIDDEN_QUESTIONS: readonly string[] = [
  "theo_orientation",
  "ctrl_mc_1",
  "ctrl_mc_2",
  "ctrl_mc_3",
  "ctrl_mc_4",
  "ctrl_mc_5",
];

export const cnefQuestionText: Record<string, string> = {
  profil_statut: "Quelle est votre place au sein de votre Église ? (plusieurs réponses possibles)",
  profil_age: "Quelle est votre tranche d'âge ?",
  profil_genre: "Quel est votre genre ?",
  profil_education: "Quel est votre niveau d'études ?",
  profil_formation_theologique: "Avez-vous suivi une formation biblique ou théologique ?",
  profil_anciennete_foi: "Depuis combien de temps êtes-vous converti(e) ?",
  profil_taille_communaute: "Quelle est la taille approximative de votre Église ?",
  crs_intellect: "À quelle fréquence prenez-vous un temps spirituel personnel ?",
  crs_ideology: "Dans quelle mesure croyez-vous en l'existence de Dieu ?",
  crs_public_practice: "À quelle fréquence participez-vous à des cultes ou réunions d'Église ?",
  crs_private_practice: "À quelle fréquence priez-vous en dehors des réunions d'Église ?",
  crs_experience: "À quelle fréquence vivez-vous des situations où vous avez le sentiment que Dieu intervient dans votre vie ?",
  psych_anxiete_remplacement: "Pensez-vous que l'IA pourrait un jour remplacer complètement certaines fonctions spirituelles humaines (prédication, accompagnement) ?",
};

export const cnefOptionLabels: Record<string, Record<string, string>> = {
  profil_confession_evangelique: {
    non_charismatique: "Non-charismatique (Églises baptistes, libristes, mennonites, réseau FEF, ou apparentées)",
    charismatique: "Charismatique ou pentecôtiste (Églises des Assemblées de Dieu, FEPEF, baptistes charismatiques, ou apparentées)",
  },
  profil_formation_theologique: {
    formation_pastorale: "Une formation pastorale",
  },
  profil_anciennete_foi: {
    naissance: "Depuis l'enfance",
  },
  min_pred_usage: {
    rare: "Rarement (pour débloquer une idée ou en relecture)",
    regulier: "Régulièrement (comme assistant de recherche ou en relecture)",
  },
  laic_conseil_spirituel: {
    jamais: "Non, je préfère un conseil humain",
  },
  theo_inspiration: {
    possible_indirect: "Possible, si une personne le reçoit ainsi",
  },
  theo_activites_sacrees: {
    discernement: "Le discernement des vocations",
  },
};

/** Options not offered on /cnef (the stored value set shrinks, nothing is recoded). */
export const cnefHiddenOptions: Record<string, readonly string[]> = {
  profil_genre: ["autre"],
};

interface CnefLabel {
  value: string;
  label: string;
  labelEn: string;
}

/** Matrix rows added on /cnef. MATRIX_TASK_WEIGHTS does not list them: stored, never scored. */
export const cnefExtraMatrixRows: Record<string, readonly CnefLabel[]> = {
  min_pred_nature: [{ value: "relecture", label: "Relecture ou reformulation", labelEn: "Proofreading or rewording" }],
};

interface CnefDetailedQuestion {
  type: "choice" | "multiple";
  options: readonly CnefLabel[];
  /** Canonical value of the original question, or null when nothing is selected. */
  derive: (value: AnswerValue) => string | null;
}

// CNEF status options, from the most to the least involved. A multiple answer
// is recoded to the canonical status of its highest option.
const STATUS_RANKS: ReadonlyArray<readonly [string, string, string, string]> = [
  ["pasteur_temps_plein", "Pasteur (à temps plein)", "Pastor (full-time)", "clerge"],
  ["pasteur_benevole", "Pasteur (bénévole)", "Pastor (volunteer)", "clerge"],
  ["autre_temps_plein", "Autre responsabilité à temps plein", "Other full-time responsibility", "responsable_non_ordonne"],
  ["ancien", "Ancien", "Elder", "responsable_non_ordonne"],
  ["responsable_service", "Responsable d'un service", "Leader of a ministry team", "laic_engagé"],
  ["membre_association", "Membre de l'association", "Member of the church association", "laic_pratiquant"],
  ["frequente_regulier", "Fréquentant régulièrement le culte", "Attending services regularly", "laic_pratiquant"],
  ["frequente_occasionnel", "Fréquentant occasionnellement le culte", "Attending services occasionally", "curieux"],
];

export const cnefDetailedQuestions: Record<string, CnefDetailedQuestion> = {
  profil_statut: {
    type: "multiple",
    options: STATUS_RANKS.map(([value, label, labelEn]) => ({ value, label, labelEn })),
    derive: (value) => {
      const selected = Array.isArray(value) ? value : [];
      const best = STATUS_RANKS.find(([option]) => selected.includes(option));
      return best ? best[3] : null;
    },
  },
  ctrl_ia_frequence: {
    type: "choice",
    options: [
      { value: "jamais", label: "Jamais", labelEn: "Never" },
      { value: "essaye", label: "J'ai essayé une ou deux fois", labelEn: "I tried it once or twice" },
      { value: "occasionnel", label: "Occasionnellement (quelques fois par mois)", labelEn: "Occasionally (a few times a month)" },
      { value: "regulier", label: "Régulièrement (plusieurs fois par semaine)", labelEn: "Regularly (several times a week)" },
      { value: "quotidien", label: "Quotidiennement", labelEn: "Daily" },
      { value: "plusieurs_par_jour", label: "Plusieurs fois par jour", labelEn: "Several times a day" },
    ],
    // The preregistered scale has five levels: « several times a day » is daily.
    derive: (value) => (value === "plusieurs_par_jour" ? "quotidien" : typeof value === "string" && value ? value : null),
  },
};

export const cnefDetailKey = (questionId: string): string => `_cnef_${questionId}`;

/** Records an answer given on /cnef: the CNEF answer, plus its canonical value. */
export function applyCnefAnswer(answers: Answers, questionId: string, value: AnswerValue): Answers {
  const detailed = cnefDetailedQuestions[questionId];
  if (!detailed) return { ...answers, [questionId]: value };
  const next: Answers = { ...answers, [cnefDetailKey(questionId)]: value };
  const canonical = detailed.derive(value);
  if (canonical === null) delete next[questionId];
  else next[questionId] = canonical;
  return next;
}
