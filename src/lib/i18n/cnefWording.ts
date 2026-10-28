/**
 * Wording of the CNEF entry (/cnef), French only.
 *
 * Requested by the CNEF on 28 October 2026 (review file « Sondage IA -
 * Protestants.xlsx »). Only label changes that keep the stored values and the
 * meaning of the item are applied here: answers given through /cnef stay
 * poolable with the general survey without recoding. Changes that would alter
 * a preregistered variable, the CRS-5 wording, the routing or the scoring are
 * not applied (see METHODOLOGY.md, changelog).
 *
 * Every response given through /cnef is stamped with CNEF_WORDING_VERSION in
 * `metadata.wordingVariant`, so the exact text each respondent read can be
 * reconstructed.
 */

export const CNEF_WORDING_VERSION = "cnef-2026-10";

export const cnefQuestionText: Record<string, string> = {
  profil_age: "Quelle est votre tranche d'âge ?",
  profil_genre: "Quel est votre genre ?",
  profil_education: "Quel est votre niveau d'études ?",
  profil_taille_communaute: "Quelle est la taille approximative de votre Église ?",
};

export const cnefOptionLabels: Record<string, Record<string, string>> = {
  profil_confession_evangelique: {
    non_charismatique: "Non-charismatique (Églises baptistes, libristes, mennonites, réseau FEF, ou apparentées)",
    charismatique: "Charismatique ou pentecôtiste (Églises des Assemblées de Dieu, FEPEF, baptistes charismatiques, ou apparentées)",
  },
  min_pred_usage: {
    rare: "Rarement (pour débloquer une idée ou en relecture)",
    regulier: "Régulièrement (comme assistant de recherche ou en relecture)",
  },
  laic_conseil_spirituel: {
    jamais: "Non, je préfère un conseil humain",
  },
  theo_activites_sacrees: {
    discernement: "Le discernement des vocations",
  },
};
