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
  minLabel?: string;
  maxLabel?: string;
  minLabelKey?: string;
  maxLabelKey?: string;
  condition?: (answers: Answers) => boolean;
  placeholder?: string;
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
    id: 'profil_confession_catholique',
    category: 'profile',
    text: "Précisez votre sensibilité catholique :",
    type: 'choice',
    options: [
      { value: 'catholique_paroissial', label: 'Paroissial classique' },
      { value: 'catholique_charismatique', label: 'Charismatique (Renouveau, Emmanuel, Chemin Neuf...)' },
      { value: 'catholique_traditionaliste', label: 'Traditionaliste (forme extraordinaire, messe en latin)' }
    ],
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'catholique'
  },
  {
    id: 'profil_confession_protestante',
    category: 'profile',
    text: "Précisez votre sensibilité protestante :",
    type: 'choice',
    options: [
      { value: 'protestant_reforme', label: 'Protestantisme historique (Luthérien, Réformé, Anglican)' },
      { value: 'evangelique', label: 'Évangélique' }
    ],
    condition: (answers) => getStringAnswer(answers, 'profil_confession') === 'protestant'
  },
  {
    id: 'profil_confession_evangelique',
    category: 'profile',
    text: "Précisez votre sensibilité évangélique :",
    type: 'choice',
    options: [
      { value: 'evangelique_classique', label: 'Évangélique classique (Baptiste, Mennonite, Frères, etc.)' },
      { value: 'pentecotiste', label: 'Pentecôtiste / Charismatique' }
    ],
    condition: (answers) => getStringAnswer(answers, 'profil_confession_protestante') === 'evangelique'
  },
  {
    id: 'profil_statut',
    category: 'profile',
    text: "Quelle est votre situation au sein de votre communauté religieuse ?",
    type: 'choice',
    options: [
      { value: 'clerge', label: 'Ministre ordonné (prêtre, pasteur, diacre...)' },
      { value: 'religieux', label: 'Religieux/Religieuse (vie consacrée - catholiques/orthodoxes)' },
      { value: 'laic_engagé', label: 'Laïc engagé (catéchiste, animateur, responsable bénévole...)' },
      { value: 'laic_pratiquant', label: 'Fidèle pratiquant régulier' },
      { value: 'curieux', label: 'Pratiquant occasionnel ou sympathisant' }
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
  {
    id: 'profil_education',
    category: 'profile',
    text: "Quel est votre niveau d'études le plus élevé ?",
    type: 'choice',
    options: [
      { value: 'sans_diplome', label: 'Sans diplôme / Certificat d\'études' },
      { value: 'brevet', label: 'Brevet des collèges' },
      { value: 'bac', label: 'Baccalauréat ou équivalent' },
      { value: 'bac_plus_2', label: 'Bac+2 (BTS, DUT, DEUG...)' },
      { value: 'licence', label: 'Bac+3 (Licence, Bachelor)' },
      { value: 'master', label: 'Bac+5 (Master, DEA, DESS, Grande École)' },
      { value: 'doctorat', label: 'Doctorat ou équivalent' },
      { value: 'ne_souhaite_pas', label: 'Ne souhaite pas répondre' }
    ]
  },
  {
    id: 'profil_pays',
    category: 'profile',
    text: "Dans quel pays résidez-vous principalement ?",
    type: 'choice',
    options: [
      { value: 'france', label: 'France' },
      { value: 'belgique', label: 'Belgique' },
      { value: 'suisse', label: 'Suisse' },
      { value: 'canada', label: 'Canada' },
      { value: 'luxembourg', label: 'Luxembourg' },
      { value: 'afrique_francophone', label: 'Afrique francophone' },
      { value: 'autre_europe', label: 'Autre pays européen' },
      { value: 'autre', label: 'Autre' }
    ]
  },
  {
    id: 'profil_milieu',
    category: 'profile',
    text: "Dans quel type de milieu vivez-vous ?",
    type: 'choice',
    options: [
      { value: 'rural', label: 'Rural (commune de moins de 2 000 habitants)' },
      { value: 'periurbain', label: 'Périurbain (petite ville, banlieue)' },
      { value: 'urbain_moyen', label: 'Ville moyenne (20 000 à 100 000 habitants)' },
      { value: 'grande_ville', label: 'Grande ville (plus de 100 000 habitants)' },
      { value: 'metropole', label: 'Métropole / Grande agglomération' }
    ]
  },
  {
    id: 'profil_secteur',
    category: 'profile',
    text: "Quel est votre secteur d'activité principal ?",
    type: 'choice',
    options: [
      { value: 'religieux', label: 'Ministère religieux (à temps plein)' },
      { value: 'education', label: 'Éducation / Enseignement / Recherche' },
      { value: 'sante', label: 'Santé / Social' },
      { value: 'tech', label: 'Informatique / Numérique / Tech' },
      { value: 'commerce', label: 'Commerce / Services' },
      { value: 'industrie', label: 'Industrie / BTP / Agriculture' },
      { value: 'administration', label: 'Administration / Fonction publique' },
      { value: 'art_culture', label: 'Art / Culture / Communication' },
      { value: 'retraite', label: 'Retraité(e)' },
      { value: 'etudiant', label: 'Étudiant(e)' },
      { value: 'autre', label: 'Autre' }
    ]
  },
  {
    id: 'profil_anciennete_foi',
    category: 'profile',
    text: "Depuis combien de temps êtes-vous engagé(e) dans la foi chrétienne ?",
    type: 'choice',
    options: [
      { value: 'naissance', label: 'Depuis toujours (éducation chrétienne)' },
      { value: 'plus_20_ans', label: 'Plus de 20 ans' },
      { value: '10_20_ans', label: 'Entre 10 et 20 ans' },
      { value: '5_10_ans', label: 'Entre 5 et 10 ans' },
      { value: '1_5_ans', label: 'Entre 1 et 5 ans' },
      { value: 'moins_1_an', label: 'Moins d\'un an' }
    ]
  },
  {
    id: 'profil_annees_ministere',
    category: 'profile',
    text: "Depuis combien d'années exercez-vous votre ministère ?",
    type: 'choice',
    options: [
      { value: 'moins_5', label: 'Moins de 5 ans' },
      { value: '5_10', label: '5 à 10 ans' },
      { value: '10_20', label: '10 à 20 ans' },
      { value: '20_30', label: '20 à 30 ans' },
      { value: 'plus_30', label: 'Plus de 30 ans' }
    ],
    condition: isClergy
  },
  {
    id: 'profil_taille_communaute',
    category: 'profile',
    text: "Combien de personnes assistent régulièrement aux offices dans votre communauté ?",
    type: 'choice',
    options: [
      { value: 'tres_petite', label: 'Moins de 50 personnes' },
      { value: 'petite', label: '50 à 150 personnes' },
      { value: 'moyenne', label: '150 à 500 personnes' },
      { value: 'grande', label: '500 à 1000 personnes' },
      { value: 'tres_grande', label: 'Plus de 1000 personnes' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
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
    text: "À quelle fréquence participez-vous à des offices religieux (messe, culte, liturgie) ?",
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
    text: "À quelle fréquence vivez-vous des moments de spiritualité profonde ?",
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
      { value: 'traditionaliste', label: 'Conservateur (attaché aux formes traditionnelles)' },
      { value: 'modere', label: 'Modéré (entre tradition et ouverture)' },
      { value: 'progressiste', label: 'Progressiste (ouvert aux évolutions)' },
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
  // BLOC 3c: OUTILS NUMÉRIQUES SPIRITUELS EXISTANTS
  // Établit si la résistance est spécifique à l'IA ou générale au numérique
  // ==========================================
  {
    id: 'digital_outils_existants',
    category: 'digital_spiritual',
    text: "Quels outils numériques utilisez-vous déjà dans votre vie spirituelle ? (plusieurs réponses possibles)",
    type: 'multiple',
    options: [
      { value: 'bible_app', label: 'Application Bible (YouVersion, Bible Gateway, etc.)' },
      { value: 'priere_app', label: 'Application de prière ou méditation (Hozana, Pray, Abide, etc.)' },
      { value: 'podcast', label: 'Podcasts religieux / spirituels' },
      { value: 'video', label: 'Vidéos en ligne (YouTube, cultes/messes en streaming)' },
      { value: 'reseaux_sociaux', label: 'Réseaux sociaux à contenu religieux' },
      { value: 'site_paroisse', label: 'Site web de paroisse / église locale' },
      { value: 'aucun', label: 'Aucun de ces outils' }
    ]
  },
  {
    id: 'digital_attitude_generale',
    category: 'digital_spiritual',
    text: "De manière générale, comment percevez-vous l'utilisation du numérique dans la vie spirituelle ?",
    type: 'choice',
    options: [
      { value: 'tres_positif', label: 'Très positivement - cela enrichit ma foi' },
      { value: 'positif', label: 'Plutôt positivement - utile en complément' },
      { value: 'neutre', label: 'De manière neutre - ni bien ni mal' },
      { value: 'negatif', label: 'Plutôt négativement - cela peut distraire' },
      { value: 'tres_negatif', label: 'Très négativement - incompatible avec la foi' }
    ]
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
      { value: 'exegese', label: "La recherche biblique (commentaires, contexte historique)" },
      { value: 'illustration', label: "La recherche d'illustrations / anecdotes" },
      { value: 'redaction', label: 'La rédaction de paragraphes entiers' }
    ],
    condition: clergyUsesAI
  },
  {
    id: 'min_pred_sentiment',
    category: 'ministry_preaching',
    text: "Comment vous sentez-vous lorsque vous utilisez l'IA pour préparer une prédication ?",
    type: 'scale',
    minLabel: "Tout à fait à l'aise",
    maxLabel: "Mal à l'aise",
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
      { value: 'oui_positif', label: "Oui, et j'ai trouvé cela spirituellement nourrissant" },
      { value: 'oui_neutre', label: "Oui, mais cela ne m'a pas particulièrement touché(e)" },
      { value: 'oui_negatif', label: "Oui, mais cela ne correspondait pas à mes attentes" }
    ],
    condition: isLayperson
  },
  {
    id: 'laic_conseil_spirituel',
    category: 'spirituality',
    text: "Pourriez-vous envisager de demander un conseil spirituel à une IA ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Non, je préfère un accompagnement humain' },
      { value: 'complement', label: 'Oui, en complément d\'un accompagnement humain' },
      { value: 'oui_possible', label: 'Oui, pour certaines questions simples' },
      { value: 'deja_fait', label: "Oui, je l'ai déjà fait" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
    ],
    condition: isLayperson
  },

  // ==========================================
  // BLOC 6: PSYCHOLOGIE - ANTHROPOMORPHISME & ANXIÉTÉ IA
  // ==========================================
  {
    id: 'psych_anthropomorphisme',
    category: 'psychology',
    text: "Selon vous, une IA peut-elle avoir une forme de 'conscience' ou de 'personnalité' ?",
    type: 'choice',
    options: [
      { value: 'impossible', label: "Non, c'est impossible" },
      { value: 'peu_probable', label: "C'est peu probable" },
      { value: 'incertain', label: "Je suis incertain(e)" },
      { value: 'possible', label: "C'est possible" },
      { value: 'probable', label: "Oui, probablement" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
    ]
  },
  {
    id: 'psych_imago_dei',
    category: 'psychology',
    text: "Selon vous, l'IA remet-elle en question ce qui fait la spécificité de l'être humain (créé à l'image de Dieu) ?",
    type: 'choice',
    options: [
      { value: 'pas_du_tout', label: "Pas du tout, l'humain reste unique" },
      { value: 'peu', label: 'Un peu' },
      { value: 'moderement', label: 'Modérément' },
      { value: 'beaucoup', label: 'Beaucoup' },
      { value: 'totalement', label: 'Oui, cela questionne notre singularité' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Sans opinion' }
    ]
  },
  {
    id: 'psych_anxiete_remplacement',
    category: 'psychology',
    text: "Pensez-vous que l'IA pourrait un jour remplacer certaines fonctions spirituelles humaines (prédication, accompagnement) ?",
    type: 'choice',
    options: [
      { value: 'non_impossible', label: "Non, c'est impossible" },
      { value: 'non_peu_probable', label: "Non, c'est peu probable" },
      { value: 'possible_partiel', label: 'Possible pour certaines fonctions limitées' },
      { value: 'oui_probable', label: 'Oui, probablement' },
      { value: 'oui_certain', label: "Oui, c'est inévitable" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
    ]
  },

  // ==========================================
  // BLOC 7: THÉOLOGIE & ÉTHIQUE (POUR TOUS)
  // ==========================================
  {
    id: 'theo_inspiration',
    category: 'theology',
    text: "Un texte généré par une IA peut-il, selon vous, être porteur d'un message spirituel authentique ?",
    type: 'choice',
    options: [
      { value: 'impossible', label: "Non, c'est impossible - l'IA ne fait que reproduire" },
      { value: 'peu_probable', label: "C'est peu probable" },
      { value: 'possible_indirect', label: "Possible, si un humain s'en saisit spirituellement" },
      { value: 'possible', label: "Oui, Dieu peut agir par tous les moyens" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Question trop complexe' }
    ]
  },
  {
    id: 'theo_liturgie_ia',
    category: 'theology',
    text: "L'utilisation de contenus générés par IA vous semble-t-elle acceptable dans un contexte liturgique (messe, culte, célébrations) ?",
    type: 'scale',
    minLabel: "Absolument pas",
    maxLabel: "Tout à fait acceptable"
  },
  {
    id: 'theo_activites_sacrees',
    category: 'theology',
    text: "Y a-t-il des activités spirituelles qui, selon vous, ne devraient JAMAIS faire intervenir l'IA ? (plusieurs réponses possibles)",
    type: 'multiple',
    options: [
      { value: 'sacrements', label: 'Les sacrements (eucharistie/cène, confession/réconciliation, baptême...)' },
      { value: 'predication', label: 'La prédication / homélie' },
      { value: 'priere_personnelle', label: 'La prière personnelle' },
      { value: 'accompagnement', label: "L'accompagnement spirituel / direction de conscience" },
      { value: 'discernement', label: 'Le discernement vocationnel' },
      { value: 'aucune', label: "Aucune - l'IA peut intervenir partout avec discernement" }
    ]
  },
  {
    id: 'theo_mediation_humaine',
    category: 'theology',
    text: "Pour vous, certains aspects de la vie spirituelle nécessitent-ils exclusivement une présence humaine ?",
    type: 'choice',
    options: [
      { value: 'oui_absolument', label: "Oui, absolument - la vie spirituelle passe par l'humain" },
      { value: 'oui_pour_essentiel', label: "Oui, pour l'essentiel (sacrements, accompagnement)" },
      { value: 'partiellement', label: "Partiellement - cela dépend des domaines" },
      { value: 'non_pas_necessairement', label: "Non, pas nécessairement - l'IA peut compléter" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Question complexe' }
    ]
  },
  {
    id: 'theo_risque_futur',
    category: 'theology',
    text: "Concernant l'utilisation de l'IA dans l'Église, qu'est-ce qui vous préoccupe le plus ?",
    type: 'choice',
    options: [
      { value: 'paresse', label: 'Un risque de moindre effort intellectuel ou spirituel' },
      { value: 'deshumanisation', label: 'Un risque de relations moins authentiques' },
      { value: 'heresie', label: "Un risque d'erreurs dans la transmission doctrinale" },
      { value: 'autre', label: 'Autre préoccupation' },
      { value: 'aucune', label: "Je n'ai pas de préoccupation particulière" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Sans opinion' }
    ]
  },
  {
    id: 'theo_utilite_percue',
    category: 'theology',
    text: "Dans l'ensemble, pensez-vous que l'IA peut être un outil bénéfique pour la vie de l'Église ?",
    type: 'choice',
    options: [
      { value: 'tres_negatif', label: "Non, c'est plutôt un danger" },
      { value: 'negatif', label: 'Plutôt non, les risques dépassent les bénéfices' },
      { value: 'neutre', label: 'Cela dépend de son usage' },
      { value: 'positif', label: 'Plutôt oui, si bien encadré' },
      { value: 'tres_positif', label: "Oui, c'est une opportunité à saisir" },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / Sans opinion' }
    ]
  },

  // ==========================================
  // BLOC 8: DIMENSION COMMUNAUTAIRE
  // Position sociale et influence du groupe
  // ==========================================
  {
    id: 'communaute_position_officielle',
    category: 'community',
    text: "Votre Église / dénomination a-t-elle pris position officiellement sur l'utilisation de l'IA ?",
    type: 'choice',
    options: [
      { value: 'oui_favorable', label: 'Oui, plutôt favorable' },
      { value: 'oui_prudent', label: 'Oui, avec prudence / encadrement' },
      { value: 'oui_defavorable', label: 'Oui, plutôt défavorable' },
      { value: 'non', label: 'Non, pas à ma connaissance' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
    ]
  },
  {
    id: 'communaute_discussions',
    category: 'community',
    text: "Avez-vous déjà discuté de l'IA avec d'autres membres de votre communauté religieuse ?",
    type: 'choice',
    options: [
      { value: 'jamais', label: 'Jamais' },
      { value: 'rarement', label: 'Rarement, en passant' },
      { value: 'parfois', label: 'Parfois, de manière informelle' },
      { value: 'souvent', label: 'Souvent, c\'est un sujet qui intéresse' },
      { value: 'organise', label: 'Oui, dans un cadre organisé (réunion, formation)' }
    ]
  },
  {
    id: 'communaute_perception_pairs',
    category: 'community',
    text: "Comment percevez-vous l'attitude générale des membres de votre communauté envers l'IA ?",
    type: 'choice',
    options: [
      { value: 'tres_favorable', label: 'Très favorable / enthousiaste' },
      { value: 'favorable', label: 'Plutôt favorable / curieux' },
      { value: 'neutre', label: 'Neutre / indifférent' },
      { value: 'mefiant', label: 'Plutôt méfiant / réservé' },
      { value: 'hostile', label: 'Hostile / opposé' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas / opinions variées' }
    ]
  },

  // ==========================================
  // BLOC 9: INTENTIONS FUTURES
  // Dimension prospective et besoins
  // ==========================================
  {
    id: 'futur_intention_usage',
    category: 'future',
    text: "Dans les 12 prochains mois, pensez-vous utiliser davantage l'IA dans votre vie spirituelle ou ministère ?",
    type: 'choice',
    options: [
      { value: 'oui_certain', label: 'Oui, certainement' },
      { value: 'oui_probable', label: 'Oui, probablement' },
      { value: 'peut_etre', label: 'Peut-être' },
      { value: 'non_probable', label: 'Probablement pas' },
      { value: 'non_certain', label: 'Certainement pas' },
      { value: 'ne_sait_pas', label: 'Je ne sais pas' }
    ]
  },
  {
    id: 'futur_formation_souhait',
    category: 'future',
    text: "Souhaiteriez-vous bénéficier d'une formation sur l'IA adaptée au contexte religieux ?",
    type: 'choice',
    options: [
      { value: 'oui_tres', label: 'Oui, très intéressé(e)' },
      { value: 'oui_assez', label: 'Oui, assez intéressé(e)' },
      { value: 'peut_etre', label: 'Peut-être, selon le contenu' },
      { value: 'non_pas_vraiment', label: 'Pas vraiment' },
      { value: 'non_pas_du_tout', label: 'Non, pas du tout' }
    ]
  },
  {
    id: 'futur_domaines_interet',
    category: 'future',
    text: "Quels domaines d'application de l'IA vous intéresseraient le plus dans un contexte religieux ? (plusieurs réponses possibles)",
    type: 'multiple',
    options: [
      { value: 'etude_bible', label: 'Étude biblique (commentaires, contexte historique)' },
      { value: 'preparation_predication', label: 'Préparation de prédications' },
      { value: 'catechese', label: 'Enseignement religieux (catéchèse, école du dimanche, etc.)' },
      { value: 'priere_meditation', label: 'Prière / méditation guidée' },
      { value: 'accompagnement', label: 'Accompagnement pastoral' },
      { value: 'communication', label: 'Communication / réseaux sociaux' },
      { value: 'administration', label: 'Administration / gestion de la communauté' },
      { value: 'musique_liturgie', label: 'Musique / liturgie / louange' },
      { value: 'aucun', label: 'Aucun de ces domaines' }
    ]
  },

  // ==========================================
  // BLOC 10: QUESTION OUVERTE FINALE
  // Recueil de nuances et commentaires libres
  // ==========================================
  {
    id: 'commentaires_libres',
    category: 'open',
    text: "Avez-vous des commentaires, réflexions ou expériences à partager concernant l'IA et la vie spirituelle ?",
    type: 'text',
    placeholder: "Votre réponse est facultative mais précieuse pour enrichir notre compréhension du sujet..."
  },

  // ==========================================
  // BLOC 11: CONTRÔLE DÉSIRABILITÉ SOCIALE (Marlowe-Crowne Short Form)
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
