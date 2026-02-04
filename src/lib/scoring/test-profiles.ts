/**
 * Profile Testing - 20 Mock Scenarios
 *
 * This file tests the profiling system with diverse, realistic scenarios
 * to validate that profiles are assigned intelligently.
 *
 * Run with: npx tsx src/lib/scoring/test-profiles.ts
 */

import type { Answers } from '@/data';
import { calculateProfileSpectrum } from './profiles';
import { PROFILE_DEFINITIONS, SUB_PROFILE_DEFINITIONS } from './constants';

// ==========================================
// 20 MOCK SCENARIOS
// ==========================================

interface MockScenario {
  name: string;
  description: string;
  expectedProfile: string;
  answers: Answers;
}

const MOCK_SCENARIOS: MockScenario[] = [
  // ==========================================
  // SCENARIO 1: Traditional Priest, Anti-AI
  // ==========================================
  {
    name: "Père Maurice - Prêtre traditionnel",
    description: "Prêtre de 65 ans, très pieux, refuse toute technologie dans son ministère",
    expectedProfile: "gardien_tradition",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'clerge',
      profil_age: '66+',
      profil_anciennete_foi: 'naissance',
      profil_annees_ministere: 'plus_30',
      profil_taille_communaute: 'moyenne',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'pluri_quotidien',
      crs_experience: 'tres_souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'jamais',
      ctrl_ia_confort: 1,
      digital_outils_existants: ['aucun'],
      digital_attitude_generale: 'negatif',
      min_pred_usage: 'jamais',
      min_care_email: 'non_jamais',
      psych_godspeed_nature: '1_machine',
      psych_godspeed_conscience: 'impossible',
      psych_aias_opacity: 'oui_fortement',
      psych_imago_dei: 'beaucoup',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'impossible',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'negatif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'jamais',
      communaute_perception_pairs: 'mefiant',
      futur_intention_usage: 'non_certain',
      futur_formation_souhait: 'non_pas_du_tout',
      futur_domaines_interet: ['aucun'],
    }
  },

  // ==========================================
  // SCENARIO 2: Young Tech-Savvy Pastor
  // ==========================================
  {
    name: "Pasteur Thomas - Jeune pasteur digital",
    description: "Pasteur évangélique de 32 ans, utilise l'IA quotidiennement pour son ministère",
    expectedProfile: "pionnier_spirituel",
    answers: {
      profil_confession: 'protestant',
      profil_confession_protestante: 'evangelique',
      profil_statut: 'clerge',
      profil_age: '18-35',
      profil_anciennete_foi: 'naissance',
      profil_annees_ministere: 'moins_5',
      profil_taille_communaute: 'grande',
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'progressiste',
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_contextes: ['travail_pro', 'creation', 'spirituel', 'recherche_info'],
      ctrl_ia_confort: 5,
      digital_outils_existants: ['bible_app', 'podcast', 'video', 'reseaux_sociaux'],
      digital_attitude_generale: 'tres_positif',
      min_pred_usage: 'systematique',
      min_pred_nature: { plan: 2, exegese: 1, illustration: 1, images: 1, redaction: 0 },
      min_pred_sentiment: 2,
      min_care_email: 'oui_souvent',
      min_admin_burden: 5,
      psych_godspeed_nature: '4_humain_moins',
      psych_godspeed_conscience: 'possible_emergence',
      psych_aias_opacity: 'non_confiance',
      psych_imago_dei: 'peu',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'possible',
      theo_risque_futur: 'aucune',
      theo_utilite_percue: 'tres_positif',
      communaute_position_officielle: 'oui_favorable',
      communaute_discussions: 'souvent',
      communaute_perception_pairs: 'favorable',
      futur_intention_usage: 'oui_certain',
      futur_formation_souhait: 'oui_tres',
      futur_domaines_interet: ['preparation_predication', 'communication', 'catechese', 'priere_meditation'],
    }
  },

  // ==========================================
  // SCENARIO 3: Cautious Catholic Laywoman
  // ==========================================
  {
    name: "Marie-Claire - Laïque engagée prudente",
    description: "Catéchiste de 52 ans, prudente mais curieuse face à l'IA",
    expectedProfile: "prudent_eclaire",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_engagé',
      profil_age: '51-65',
      profil_anciennete_foi: 'plus_20_ans',
      profil_taille_communaute: 'moyenne',
      crs_intellect: 'souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'occasionnel',
      ctrl_ia_contextes: ['recherche_info'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['bible_app', 'site_paroisse'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'complement',
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'oui_moderement',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'paresse',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'oui_prudent',
      communaute_discussions: 'parfois',
      communaute_perception_pairs: 'neutre',
      futur_intention_usage: 'peut_etre',
      futur_formation_souhait: 'oui_assez',
      futur_domaines_interet: ['catechese', 'etude_bible'],
    }
  },

  // ==========================================
  // SCENARIO 4: Progressive Theologian
  // ==========================================
  {
    name: "Dr. Sophie Martin - Théologienne progressiste",
    description: "Professeure de théologie, questionnements éthiques sur l'IA",
    expectedProfile: "progressiste_critique",
    answers: {
      profil_confession: 'protestant',
      profil_confession_protestante: 'protestant_historique',
      profil_statut: 'laic_engagé',
      profil_age: '36-50',
      profil_education: 'doctorat',
      profil_secteur: 'education',
      profil_anciennete_foi: 'plus_20_ans',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'souvent',
      crs_experience: 'occasionnellement',
      theo_orientation: 'progressiste',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['bible_app', 'podcast'],
      digital_attitude_generale: 'neutre',
      laic_substitution_priere: 'oui_neutre',
      laic_conseil_spirituel: 'jamais',
      psych_godspeed_nature: '3_neutre',
      psych_godspeed_conscience: 'incertain',
      psych_aias_opacity: 'oui_fortement',
      psych_imago_dei: 'beaucoup',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'ne_sait_pas',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'non',
      communaute_discussions: 'organise',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'peut_etre',
      futur_formation_souhait: 'peut_etre',
      futur_domaines_interet: ['etude_bible', 'accompagnement'],
    }
  },

  // ==========================================
  // SCENARIO 5: Pragmatic Parish Administrator
  // ==========================================
  {
    name: "Jean-Pierre Durand - Administrateur paroissial",
    description: "Diacre permanent, utilise l'IA pour l'efficacité administrative",
    expectedProfile: "pragmatique_moderne",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'clerge',
      profil_age: '51-65',
      profil_secteur: 'religieux',
      profil_annees_ministere: '10_20',
      profil_taille_communaute: 'grande',
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'occasionnellement',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail_pro', 'creation', 'recherche_info'],
      ctrl_ia_confort: 4,
      digital_outils_existants: ['site_paroisse', 'bible_app'],
      digital_attitude_generale: 'positif',
      min_pred_usage: 'regulier',
      min_pred_nature: { plan: 2, exegese: 0, illustration: 2, images: 1, redaction: 0 },
      min_pred_sentiment: 2,
      min_care_email: 'oui_brouillon',
      min_admin_burden: 4,
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'peu',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'aucune',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'parfois',
      communaute_perception_pairs: 'neutre',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'oui_assez',
      futur_domaines_interet: ['administration', 'communication'],
    }
  },

  // ==========================================
  // SCENARIO 6: Balanced Moderate
  // ==========================================
  {
    name: "François Leblanc - Paroissien équilibré",
    description: "Fidèle pratiquant, approche mesurée de tout",
    expectedProfile: "equilibriste",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '36-50',
      profil_anciennete_foi: '10_20_ans',
      crs_intellect: 'occasionnellement',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'occasionnellement',
      crs_experience: 'occasionnellement',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'occasionnel',
      ctrl_ia_contextes: ['travail_pro'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['bible_app', 'video'],
      digital_attitude_generale: 'neutre',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'complement',
      psych_godspeed_nature: '3_neutre',
      psych_godspeed_conscience: 'incertain',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'paresse',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'ne_sait_pas',
      communaute_discussions: 'rarement',
      communaute_perception_pairs: 'neutre',
      futur_intention_usage: 'peut_etre',
      futur_formation_souhait: 'peut_etre',
      futur_domaines_interet: ['etude_bible'],
    }
  },

  // ==========================================
  // SCENARIO 7: Traditional but Tech-Enthusiast
  // ==========================================
  {
    name: "Abbé Michel - Traditionaliste innovant",
    description: "Prêtre traditionaliste qui utilise l'IA pour préparer la messe en latin",
    expectedProfile: "innovateur_ancre",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'clerge',
      profil_age: '36-50',
      profil_annees_ministere: '10_20',
      profil_taille_communaute: 'moyenne',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'pluri_quotidien',
      crs_experience: 'tres_souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_contextes: ['travail_pro', 'recherche_info', 'creation'],
      ctrl_ia_confort: 5,
      digital_outils_existants: ['bible_app', 'video', 'podcast'],
      digital_attitude_generale: 'positif',
      min_pred_usage: 'regulier',
      min_pred_nature: { plan: 0, exegese: 2, illustration: 1, images: 0, redaction: 0 },
      min_pred_sentiment: 2,
      min_care_email: 'oui_brouillon',
      min_admin_burden: 4,
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'non_confiance',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'aucune',
      theo_utilite_percue: 'tres_positif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'souvent',
      communaute_perception_pairs: 'mefiant',
      futur_intention_usage: 'oui_certain',
      futur_formation_souhait: 'oui_tres',
      futur_domaines_interet: ['preparation_predication', 'etude_bible', 'musique_liturgie'],
    }
  },

  // ==========================================
  // SCENARIO 8: Spiritual Seeker
  // ==========================================
  {
    name: "Antoine - Chercheur spirituel",
    description: "Jeune agnostique curieux qui explore la foi via les outils numériques",
    expectedProfile: "explorateur",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'curieux',
      profil_age: '18-35',
      profil_anciennete_foi: 'moins_1_an',
      crs_intellect: 'occasionnellement',
      crs_ideology: 'moderement',
      crs_public_practice: 'quelques_fois_an',
      crs_private_practice: 'rarement',
      crs_experience: 'rarement',
      theo_orientation: 'ne_sait_pas',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['recherche_info', 'loisirs', 'spirituel'],
      ctrl_ia_confort: 4,
      digital_outils_existants: ['podcast', 'video'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'oui_neutre',
      laic_conseil_spirituel: 'deja_fait',
      psych_godspeed_nature: '4_humain_moins',
      psych_godspeed_conscience: 'possible_emergence',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'peu',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'ne_sait_pas',
      theo_risque_futur: 'ne_sait_pas',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'ne_sait_pas',
      communaute_discussions: 'jamais',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'peut_etre',
      futur_domaines_interet: ['priere_meditation', 'etude_bible'],
    }
  },

  // ==========================================
  // SCENARIO 9: Orthodox Monk
  // ==========================================
  {
    name: "Père Séraphin - Moine orthodoxe",
    description: "Moine dans un monastère, vie contemplative, méfiant du numérique",
    expectedProfile: "gardien_tradition",
    answers: {
      profil_confession: 'orthodoxe',
      profil_confession_orthodoxe: 'orthodoxe_oriental',
      profil_statut: 'religieux',
      profil_age: '51-65',
      profil_anciennete_foi: 'naissance',
      profil_annees_ministere: 'plus_30',
      profil_milieu: 'rural',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'pluri_quotidien',
      crs_experience: 'tres_souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'jamais',
      ctrl_ia_confort: 1,
      digital_outils_existants: ['aucun'],
      digital_attitude_generale: 'tres_negatif',
      min_pred_usage: 'jamais',
      min_care_email: 'non_jamais',
      psych_godspeed_nature: '1_machine',
      psych_godspeed_conscience: 'impossible',
      psych_aias_opacity: 'oui_fortement',
      psych_imago_dei: 'totalement',
      psych_anxiete_remplacement: 'non_impossible',
      theo_inspiration: 'impossible',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'tres_negatif',
      communaute_position_officielle: 'oui_defavorable',
      communaute_discussions: 'jamais',
      communaute_perception_pairs: 'hostile',
      futur_intention_usage: 'non_certain',
      futur_formation_souhait: 'non_pas_du_tout',
      futur_domaines_interet: ['aucun'],
    }
  },

  // ==========================================
  // SCENARIO 10: Retired Teacher Opening Up
  // ==========================================
  {
    name: "Marguerite - Retraitée curieuse",
    description: "Ancienne enseignante, pratiquante, découvre l'IA avec intérêt",
    expectedProfile: "prudent_eclaire",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '66+',
      profil_secteur: 'retraite',
      profil_anciennete_foi: 'naissance',
      crs_intellect: 'souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'essaye',
      ctrl_ia_contextes: ['recherche_info'],
      ctrl_ia_confort: 2,
      digital_outils_existants: ['bible_app', 'video'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'jamais',
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'oui_moderement',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'peu_probable',
      theo_risque_futur: 'paresse',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'non',
      communaute_discussions: 'parfois',
      communaute_perception_pairs: 'mefiant',
      futur_intention_usage: 'peut_etre',
      futur_formation_souhait: 'oui_assez',
      futur_domaines_interet: ['etude_bible', 'priere_meditation'],
    }
  },

  // ==========================================
  // SCENARIO 11: Tech Professional with Deep Faith
  // ==========================================
  {
    name: "David Chen - Ingénieur croyant",
    description: "Développeur IA qui maintient une foi profonde et des limites claires",
    expectedProfile: "prudent_eclaire",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '36-50',
      profil_secteur: 'tech',
      profil_education: 'master',
      profil_anciennete_foi: '10_20_ans',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_contextes: ['travail_pro', 'programmation', 'recherche_info'],
      ctrl_ia_confort: 5,
      digital_outils_existants: ['bible_app', 'priere_app', 'podcast'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'jamais',
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'non_confiance',
      psych_imago_dei: 'beaucoup',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'peu_probable',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'souvent',
      communaute_perception_pairs: 'favorable',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'non_pas_vraiment',
      futur_domaines_interet: ['etude_bible'],
    }
  },

  // ==========================================
  // SCENARIO 12: Youth Minister
  // ==========================================
  {
    name: "Léa Martin - Animatrice pastorale jeunes",
    description: "Jeune animatrice qui veut rejoindre les jeunes via leurs outils",
    expectedProfile: "pragmatique_moderne",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_engagé',
      profil_age: '18-35',
      profil_secteur: 'education',
      profil_anciennete_foi: 'naissance',
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail_pro', 'creation', 'recherche_info'],
      ctrl_ia_confort: 4,
      digital_outils_existants: ['bible_app', 'priere_app', 'reseaux_sociaux', 'video'],
      digital_attitude_generale: 'tres_positif',
      laic_substitution_priere: 'oui_neutre',
      laic_conseil_spirituel: 'complement',
      psych_godspeed_nature: '3_neutre',
      psych_godspeed_conscience: 'incertain',
      psych_aias_opacity: 'non_indifferent',
      psych_imago_dei: 'peu',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'aucune',
      theo_utilite_percue: 'tres_positif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'souvent',
      communaute_perception_pairs: 'favorable',
      futur_intention_usage: 'oui_certain',
      futur_formation_souhait: 'oui_tres',
      futur_domaines_interet: ['catechese', 'communication', 'priere_meditation'],
    }
  },

  // ==========================================
  // SCENARIO 13: Concerned Social Activist
  // ==========================================
  {
    name: "Paul Nguyen - Militant social chrétien",
    description: "Engagé dans les causes sociales, préoccupé par les inégalités liées à l'IA",
    expectedProfile: "progressiste_critique",
    answers: {
      profil_confession: 'protestant',
      profil_confession_protestante: 'protestant_historique',
      profil_statut: 'laic_engagé',
      profil_age: '36-50',
      profil_secteur: 'sante',
      profil_anciennete_foi: '10_20_ans',
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'souvent',
      crs_experience: 'occasionnellement',
      theo_orientation: 'progressiste',
      ctrl_ia_frequence: 'occasionnel',
      ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['podcast', 'reseaux_sociaux'],
      digital_attitude_generale: 'neutre',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'jamais',
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'oui_fortement',
      psych_imago_dei: 'beaucoup',
      psych_anxiete_remplacement: 'oui_probable',
      theo_inspiration: 'peu_probable',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'negatif',
      communaute_position_officielle: 'non',
      communaute_discussions: 'parfois',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'non_probable',
      futur_formation_souhait: 'peut_etre',
      futur_domaines_interet: ['accompagnement'],
    }
  },

  // ==========================================
  // SCENARIO 14: Enthusiastic New Convert
  // ==========================================
  {
    name: "Sarah El-Khoury - Nouvelle convertie enthousiaste",
    description: "Convertie récente, explore tout avec enthousiasme",
    expectedProfile: "explorateur",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '18-35',
      profil_anciennete_foi: '1_5_ans',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'ne_sait_pas',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['recherche_info', 'spirituel'],
      ctrl_ia_confort: 4,
      digital_outils_existants: ['bible_app', 'priere_app', 'podcast', 'video'],
      digital_attitude_generale: 'tres_positif',
      laic_substitution_priere: 'oui_positif',
      laic_conseil_spirituel: 'oui_possible',
      psych_godspeed_nature: '4_humain_moins',
      psych_godspeed_conscience: 'possible_emergence',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'ne_sait_pas',
      theo_risque_futur: 'ne_sait_pas',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'ne_sait_pas',
      communaute_discussions: 'parfois',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'oui_certain',
      futur_formation_souhait: 'oui_tres',
      futur_domaines_interet: ['priere_meditation', 'etude_bible', 'catechese'],
    }
  },

  // ==========================================
  // SCENARIO 15: Rural Parish Priest
  // ==========================================
  {
    name: "Père Jacques - Curé de campagne",
    description: "Prêtre en milieu rural, communauté vieillissante, pragmatique",
    expectedProfile: "equilibriste",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'clerge',
      profil_age: '51-65',
      profil_milieu: 'rural',
      profil_annees_ministere: '20_30',
      profil_taille_communaute: 'petite',
      crs_intellect: 'souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'occasionnel',
      ctrl_ia_contextes: ['travail_pro'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['site_paroisse'],
      digital_attitude_generale: 'neutre',
      min_pred_usage: 'rare',
      min_pred_nature: { plan: 0, exegese: 0, illustration: 1, images: 0, redaction: 0 },
      min_pred_sentiment: 3,
      min_care_email: 'non_jamais',
      min_admin_burden: 3,
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'imitation',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'paresse',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'non',
      communaute_discussions: 'rarement',
      communaute_perception_pairs: 'mefiant',
      futur_intention_usage: 'peut_etre',
      futur_formation_souhait: 'peut_etre',
      futur_domaines_interet: ['administration'],
    }
  },

  // ==========================================
  // SCENARIO 16: Academic Philosopher
  // ==========================================
  {
    name: "Dr. Émile Fontaine - Philosophe catholique",
    description: "Universitaire qui réfléchit philosophiquement à l'IA et l'âme",
    expectedProfile: "progressiste_critique",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '51-65',
      profil_education: 'doctorat',
      profil_secteur: 'education',
      profil_anciennete_foi: 'naissance',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'mensuel',
      crs_private_practice: 'occasionnellement',
      crs_experience: 'rarement',
      theo_orientation: 'progressiste',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['podcast'],
      digital_attitude_generale: 'neutre',
      laic_substitution_priere: 'oui_neutre',
      laic_conseil_spirituel: 'oui_possible',
      psych_godspeed_nature: '4_humain_moins',
      psych_godspeed_conscience: 'possible_emergence',
      psych_aias_opacity: 'oui_moderement',
      psych_imago_dei: 'totalement',
      psych_anxiete_remplacement: 'oui_probable',
      theo_inspiration: 'ne_sait_pas',
      theo_risque_futur: 'heresie',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'non',
      communaute_discussions: 'organise',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'non_pas_vraiment',
      futur_domaines_interet: ['etude_bible'],
    }
  },

  // ==========================================
  // SCENARIO 17: Megachurch Media Director
  // ==========================================
  {
    name: "Marc Thompson - Directeur médias église",
    description: "Responsable communication d'une megachurch, exploite pleinement l'IA",
    expectedProfile: "pionnier_spirituel",
    answers: {
      profil_confession: 'protestant',
      profil_confession_protestante: 'evangelique',
      profil_statut: 'laic_engagé',
      profil_age: '36-50',
      profil_secteur: 'art_culture',
      profil_taille_communaute: 'tres_grande',
      profil_anciennete_foi: 'plus_20_ans',
      crs_intellect: 'souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'quotidien',
      crs_experience: 'souvent',
      theo_orientation: 'modere',
      ctrl_ia_frequence: 'quotidien',
      ctrl_ia_contextes: ['travail_pro', 'creation', 'programmation', 'spirituel'],
      ctrl_ia_confort: 5,
      digital_outils_existants: ['bible_app', 'podcast', 'video', 'reseaux_sociaux', 'site_paroisse'],
      digital_attitude_generale: 'tres_positif',
      laic_substitution_priere: 'oui_positif',
      laic_conseil_spirituel: 'complement',
      psych_godspeed_nature: '5_humain',
      psych_godspeed_conscience: 'possible_emergence',
      psych_aias_opacity: 'non_confiance',
      psych_imago_dei: 'peu',
      psych_anxiete_remplacement: 'non_peu_probable',
      theo_inspiration: 'possible',
      theo_risque_futur: 'aucune',
      theo_utilite_percue: 'tres_positif',
      communaute_position_officielle: 'oui_favorable',
      communaute_discussions: 'organise',
      communaute_perception_pairs: 'tres_favorable',
      futur_intention_usage: 'oui_certain',
      futur_formation_souhait: 'oui_tres',
      futur_domaines_interet: ['communication', 'musique_liturgie', 'creation', 'priere_meditation'],
    }
  },

  // ==========================================
  // SCENARIO 18: Contemplative Religious Sister
  // ==========================================
  {
    name: "Sœur Thérèse - Carmélite contemplative",
    description: "Religieuse contemplative, vie de prière intense, distance avec la technologie",
    expectedProfile: "gardien_tradition",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'religieux',
      profil_age: '36-50',
      profil_annees_ministere: '10_20',
      profil_milieu: 'rural',
      profil_anciennete_foi: 'naissance',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'pluri_hebdo',
      crs_private_practice: 'pluri_quotidien',
      crs_experience: 'tres_souvent',
      theo_orientation: 'traditionaliste',
      ctrl_ia_frequence: 'essaye',
      ctrl_ia_contextes: [],
      ctrl_ia_confort: 2,
      digital_outils_existants: ['bible_app'],
      digital_attitude_generale: 'negatif',
      min_pred_usage: 'jamais',
      min_care_email: 'non_jamais',
      psych_godspeed_nature: '1_machine',
      psych_godspeed_conscience: 'impossible',
      psych_aias_opacity: 'oui_fortement',
      psych_imago_dei: 'beaucoup',
      psych_anxiete_remplacement: 'non_impossible',
      theo_inspiration: 'impossible',
      theo_risque_futur: 'deshumanisation',
      theo_utilite_percue: 'negatif',
      communaute_position_officielle: 'oui_defavorable',
      communaute_discussions: 'jamais',
      communaute_perception_pairs: 'hostile',
      futur_intention_usage: 'non_certain',
      futur_formation_souhait: 'non_pas_du_tout',
      futur_domaines_interet: ['aucun'],
    }
  },

  // ==========================================
  // SCENARIO 19: Skeptical but Open Student
  // ==========================================
  {
    name: "Julie Bernard - Étudiante en théologie",
    description: "Étudiante questionnant tout, utilise l'IA pour ses études mais reste critique",
    expectedProfile: "progressiste_critique",
    answers: {
      profil_confession: 'protestant',
      profil_confession_protestante: 'protestant_historique',
      profil_statut: 'laic_pratiquant',
      profil_age: '18-35',
      profil_secteur: 'etudiant',
      profil_education: 'master',
      profil_anciennete_foi: '5_10_ans',
      crs_intellect: 'tres_souvent',
      crs_ideology: 'beaucoup',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'souvent',
      crs_experience: 'occasionnellement',
      theo_orientation: 'progressiste',
      ctrl_ia_frequence: 'regulier',
      ctrl_ia_contextes: ['travail_pro', 'recherche_info'],
      ctrl_ia_confort: 4,
      digital_outils_existants: ['bible_app', 'podcast'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'oui_negatif',
      laic_conseil_spirituel: 'complement',
      psych_godspeed_nature: '3_neutre',
      psych_godspeed_conscience: 'incertain',
      psych_aias_opacity: 'oui_moderement',
      psych_imago_dei: 'moderement',
      psych_anxiete_remplacement: 'possible_partiel',
      theo_inspiration: 'possible_indirect',
      theo_risque_futur: 'heresie',
      theo_utilite_percue: 'neutre',
      communaute_position_officielle: 'non',
      communaute_discussions: 'souvent',
      communaute_perception_pairs: 'favorable',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'oui_assez',
      futur_domaines_interet: ['etude_bible', 'accompagnement'],
    }
  },

  // ==========================================
  // SCENARIO 20: Elderly Enthusiastic Grandmother
  // ==========================================
  {
    name: "Mamie Josette - Grand-mère connectée",
    description: "Grand-mère de 72 ans, très pieuse, découvre l'IA avec émerveillement via ses petits-enfants",
    expectedProfile: "explorateur",
    answers: {
      profil_confession: 'catholique',
      profil_statut: 'laic_pratiquant',
      profil_age: '66+',
      profil_secteur: 'retraite',
      profil_anciennete_foi: 'naissance',
      crs_intellect: 'souvent',
      crs_ideology: 'totalement',
      crs_public_practice: 'hebdo',
      crs_private_practice: 'pluri_quotidien',
      crs_experience: 'tres_souvent',
      theo_orientation: 'ne_sait_pas',
      ctrl_ia_frequence: 'essaye',
      ctrl_ia_contextes: ['recherche_info'],
      ctrl_ia_confort: 3,
      digital_outils_existants: ['bible_app', 'video'],
      digital_attitude_generale: 'positif',
      laic_substitution_priere: 'non',
      laic_conseil_spirituel: 'ne_sait_pas',
      psych_godspeed_nature: '2_machine_plus',
      psych_godspeed_conscience: 'incertain',
      psych_aias_opacity: 'peu',
      psych_imago_dei: 'ne_sait_pas',
      psych_anxiete_remplacement: 'ne_sait_pas',
      theo_inspiration: 'ne_sait_pas',
      theo_risque_futur: 'ne_sait_pas',
      theo_utilite_percue: 'positif',
      communaute_position_officielle: 'ne_sait_pas',
      communaute_discussions: 'rarement',
      communaute_perception_pairs: 'ne_sait_pas',
      futur_intention_usage: 'oui_probable',
      futur_formation_souhait: 'oui_assez',
      futur_domaines_interet: ['priere_meditation', 'etude_bible'],
    }
  },
];

// ==========================================
// TEST EXECUTION
// ==========================================

function runTests() {
  console.log('=' .repeat(80));
  console.log('ADVANCED PROFILE TESTING - 20 SCENARIOS');
  console.log('=' .repeat(80));
  console.log('');

  let correct = 0;
  const total = MOCK_SCENARIOS.length;

  const results: {
    name: string;
    expected: string;
    actual: string;
    match: boolean;
    matchScore: number;
    subProfile: string;
    dimensions: Record<string, number>;
  }[] = [];

  for (const scenario of MOCK_SCENARIOS) {
    const spectrum = calculateProfileSpectrum(scenario.answers);

    const actualProfile = spectrum.primary.profile;
    const isMatch = actualProfile === scenario.expectedProfile;

    if (isMatch) correct++;

    results.push({
      name: scenario.name,
      expected: scenario.expectedProfile,
      actual: actualProfile,
      match: isMatch,
      matchScore: spectrum.primary.matchScore,
      subProfile: spectrum.subProfile.subProfile,
      dimensions: {
        religiosity: spectrum.dimensions.religiosity.value,
        aiOpenness: spectrum.dimensions.aiOpenness.value,
        sacredBoundary: spectrum.dimensions.sacredBoundary.value,
        ethicalConcern: spectrum.dimensions.ethicalConcern.value,
        psychPerception: spectrum.dimensions.psychologicalPerception.value,
        communityInfluence: spectrum.dimensions.communityInfluence.value,
        futureOrientation: spectrum.dimensions.futureOrientation.value,
      },
    });

    // Print result
    const statusEmoji = isMatch ? '✅' : '❌';
    console.log(`${statusEmoji} ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    console.log(`   Expected: ${scenario.expectedProfile}`);
    console.log(`   Actual: ${actualProfile} (${spectrum.primary.matchScore}%)`);

    if (spectrum.secondary) {
      console.log(`   Secondary: ${spectrum.secondary.profile} (${spectrum.secondary.matchScore}%)`);
    }

    console.log(`   Sub-profile: ${SUB_PROFILE_DEFINITIONS[spectrum.subProfile.subProfile].title}`);
    console.log(`   Dimensions: Rel=${spectrum.dimensions.religiosity.value.toFixed(1)}, ` +
                `AI=${spectrum.dimensions.aiOpenness.value.toFixed(1)}, ` +
                `Bound=${spectrum.dimensions.sacredBoundary.value.toFixed(1)}, ` +
                `Eth=${spectrum.dimensions.ethicalConcern.value.toFixed(1)}`);

    if (!isMatch) {
      console.log(`   ⚠️  MISMATCH - Expected ${scenario.expectedProfile}, got ${actualProfile}`);
      // Show why the other profile might have won
      const expectedMatch = spectrum.allMatches.find(m => m.profile === scenario.expectedProfile);
      if (expectedMatch) {
        console.log(`      Expected profile score: ${expectedMatch.matchScore}% (ranked #${spectrum.allMatches.indexOf(expectedMatch) + 1})`);
      }
    }
    console.log('');
  }

  // Summary
  console.log('=' .repeat(80));
  console.log('SUMMARY');
  console.log('=' .repeat(80));
  console.log(`Accuracy: ${correct}/${total} (${((correct/total)*100).toFixed(1)}%)`);
  console.log('');

  // Profile distribution
  console.log('Profile Distribution:');
  const profileCounts: Record<string, number> = {};
  for (const r of results) {
    profileCounts[r.actual] = (profileCounts[r.actual] || 0) + 1;
  }
  for (const [profile, count] of Object.entries(profileCounts).sort((a, b) => b[1] - a[1])) {
    const def = PROFILE_DEFINITIONS[profile as keyof typeof PROFILE_DEFINITIONS];
    console.log(`  ${def.emoji} ${def.title}: ${count} (${((count/total)*100).toFixed(0)}%)`);
  }
  console.log('');

  // Mismatches analysis
  const mismatches = results.filter(r => !r.match);
  if (mismatches.length > 0) {
    console.log('Mismatches Analysis:');
    for (const m of mismatches) {
      console.log(`  ${m.name}:`);
      console.log(`    Expected: ${m.expected}, Got: ${m.actual}`);
      console.log(`    This suggests the algorithm may need tuning for this case.`);
    }
  }

  return { correct, total, results };
}

// Run tests
runTests();