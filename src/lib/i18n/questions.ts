/**
 * Canonical source of every string a respondent sees.
 *
 * Instrument v2.0.0 makes this file the single source of truth: the survey
 * schema (src/data/surveySchema.ts) reads its question texts, option order
 * and option labels from here, so the codebook / data dictionary generated
 * from the schema is guaranteed to quote exactly what respondents read.
 *
 * Option labels are keyed per question id (`optionLabels[questionId][value]`)
 * because the same value (e.g. `jamais`) carries a different wording in
 * different questions.
 */

type OptionLabelMap = Record<string, Record<string, string>>;

// Question texts ------------------------------------------------------------

const frQuestions = {
  // === PROFIL & DÉMOGRAPHIE ===
  profil_confession: "Quelle est votre branche chrétienne principale ?",
  profil_confession_catholique: "Précisez votre sensibilité catholique :",
  profil_confession_protestante: "Quelle est votre sensibilité protestante ?",
  profil_confession_evangelique: "Au sein du protestantisme évangélique, vous situez-vous plutôt comme :",
  profil_confession_orthodoxe: "Précisez votre tradition orthodoxe :",
  profil_confession_autre: "Précisez votre tradition chrétienne :",
  profil_statut: "Quelle est votre situation au sein de votre communauté religieuse ?",
  profil_age: "Votre tranche d'âge",
  profil_genre: "Votre genre",
  profil_education: "Quel est votre niveau d'études le plus élevé ?",
  profil_formation_theologique: "Avez-vous suivi une formation théologique formelle ?",
  profil_pays: "Dans quel pays résidez-vous principalement ?",
  profil_milieu: "Dans quel type de milieu vivez-vous ?",
  profil_secteur: "Quel est votre secteur d'activité principal ?",
  profil_anciennete_foi: "Depuis combien de temps vous considérez-vous comme croyant(e) / pratiquant(e) ?",
  profil_annees_ministere: "Depuis combien d'années exercez-vous votre ministère ?",
  profil_taille_communaute: "Quelle est la taille approximative de votre communauté / paroisse ?",

  // === CRS-5 RELIGIOSITÉ (Huber & Huber, 2012) ===
  crs_intellect: "À quelle fréquence réfléchissez-vous à des questions religieuses ?",
  crs_ideology: "Dans quelle mesure croyez-vous en l'existence de Dieu ou d'une réalité divine ?",
  crs_public_practice: "À quelle fréquence participez-vous à des offices religieux (messe, culte, liturgie) ?",
  crs_private_practice: "À quelle fréquence priez-vous en dehors des offices ?",
  crs_experience: "À quelle fréquence vivez-vous des situations où vous avez le sentiment que Dieu ou quelque chose de divin intervient dans votre vie ?",

  // === THÉOLOGIE ===
  theo_orientation: "Comment situeriez-vous votre sensibilité théologique ?",
  theo_inspiration: "Selon vous, un texte généré par une IA (par exemple une prière ou une méditation) peut-il avoir une dimension spirituelle authentique ?",
  theo_liturgie_ia: "L'utilisation de contenus générés par IA vous semble-t-elle acceptable dans un contexte liturgique (messe, culte, célébrations) ?",
  theo_activites_sacrees: "Y a-t-il des activités spirituelles qui, selon vous, ne devraient jamais faire intervenir l'IA ? (plusieurs réponses possibles)",
  theo_mediation_humaine: "Pour vous, certains aspects de la vie spirituelle nécessitent-ils exclusivement une présence humaine ?",
  theo_risque_futur: "Concernant l'utilisation de l'IA dans l'Église, qu'est-ce qui vous préoccupe le plus ?",
  theo_utilite_percue: "Dans l'ensemble, pensez-vous que l'IA peut être un outil bénéfique pour la vie de l'Église ?",

  // === USAGE IA GÉNÉRAL ===
  ctrl_ia_frequence: "En général, à quelle fréquence utilisez-vous des outils d'IA (ChatGPT, Gemini, Claude, Copilot...) ?",
  ctrl_ia_contextes: "Dans quels contextes utilisez-vous l'IA ? (plusieurs réponses possibles)",
  ctrl_ia_confort: "Comment évaluez-vous votre maîtrise technique des outils d'IA ?",

  // === OUTILS NUMÉRIQUES SPIRITUELS ===
  digital_outils_existants: "Quels outils numériques utilisez-vous déjà dans votre vie spirituelle ? (plusieurs réponses possibles)",
  digital_attitude_generale: "De manière générale, comment percevez-vous l'utilisation du numérique dans votre vie spirituelle personnelle ?",

  // === MINISTÈRE (CLERGÉ) ===
  min_pred_usage: "Pour la préparation de vos prédications (homélies, sermons), utilisez-vous l'IA ?",
  min_pred_nature: "Pour quoi faites-vous appel à l'IA, et à quel point ?",
  min_pred_sentiment: "Comment vous sentez-vous lorsque vous utilisez l'IA pour préparer une prédication ?",
  min_care_email: "Si vous recevez un email complexe demandant un conseil spirituel, utiliseriez-vous l'IA pour rédiger la réponse ?",
  min_admin_burden: "Diriez-vous que l'IA vous libère du temps administratif pour vous consacrer davantage aux relations humaines ?",

  // === SPIRITUALITÉ (LAÏCS) ===
  laic_substitution_priere: "Avez-vous déjà utilisé une IA pour générer une prière ou une méditation que vous avez ensuite utilisée ?",
  laic_conseil_spirituel: "Pourriez-vous envisager de demander un conseil spirituel à une IA ?",

  // === PSYCHOLOGIE ===
  psych_godspeed_nature: "Sur une échelle de 1 à 5, comment percevez-vous la nature de l'IA actuelle ?",
  psych_godspeed_conscience: "Pensez-vous qu'une IA puisse un jour développer une forme de conscience réelle ?",
  psych_aias_opacity: "Le fait de ne pas comprendre comment l'IA prend ses décisions (effet « boîte noire ») vous inquiète-t-il ?",
  psych_imago_dei: "Selon vous, l'IA remet-elle en question ce qui fait la spécificité de l'être humain (créé à l'image de Dieu) ?",
  psych_anxiete_remplacement: "Pensez-vous que l'IA pourrait un jour remplacer certaines fonctions spirituelles humaines (prédication, accompagnement) ?",

  // === COMMUNAUTÉ ===
  communaute_position_officielle: "Votre Église / dénomination a-t-elle pris position officiellement sur l'utilisation de l'IA ?",
  communaute_discussions: "Avez-vous déjà discuté de l'IA avec d'autres membres de votre communauté religieuse ?",
  communaute_perception_pairs: "Comment percevez-vous l'attitude générale des membres de votre communauté envers l'IA ?",

  // === INTENTIONS FUTURES ===
  futur_intention_usage: "Dans les 12 prochains mois, pensez-vous utiliser davantage l'IA dans votre vie spirituelle ou ministère ?",
  futur_formation_souhait: "Souhaiteriez-vous bénéficier d'une formation sur l'IA adaptée au contexte religieux ?",
  futur_domaines_interet: "Dans quels aspects de votre vie spirituelle ou ministère seriez-vous susceptible d'utiliser l'IA ?",

  // === QUESTION OUVERTE ===
  commentaires_libres: "Avez-vous des commentaires, réflexions ou expériences à partager concernant l'IA et la vie spirituelle ?",

  // === DÉSIRABILITÉ SOCIALE (Crowne & Marlowe, 1960) ===
  ctrl_mc_1: "Vrai ou faux : « Il m'est parfois difficile de continuer mon travail si je ne suis pas encouragé(e). »",
  ctrl_mc_2: "Vrai ou faux : « Je n'ai jamais intensément détesté quelqu'un. »",
  ctrl_mc_3: "Vrai ou faux : « J'ai parfois eu envie de me rebeller contre des personnes en position d'autorité même si je savais qu'elles avaient raison. »",
  ctrl_mc_4: "Vrai ou faux : « Je suis toujours courtois(e), même avec des personnes désagréables. »",
  ctrl_mc_5: "Vrai ou faux : « Il m'est arrivé de profiter de quelqu'un. »",
};

const enQuestions: Record<keyof typeof frQuestions, string> = {
  // === PROFILE & DEMOGRAPHICS ===
  profil_confession: "What is your main Christian denomination?",
  profil_confession_catholique: "Please specify your Catholic background:",
  profil_confession_protestante: "What is your Protestant background?",
  profil_confession_evangelique: "Within evangelical Protestantism, do you identify more as:",
  profil_confession_orthodoxe: "Please specify your Orthodox tradition:",
  profil_confession_autre: "Please specify your Christian tradition:",
  profil_statut: "What is your role within your religious community?",
  profil_age: "Your age group",
  profil_genre: "Your gender",
  profil_education: "What is your highest level of education?",
  profil_formation_theologique: "Have you followed any formal theological training?",
  profil_pays: "In which country do you primarily reside?",
  profil_milieu: "What type of area do you live in?",
  profil_secteur: "What is your main professional sector?",
  profil_anciennete_foi: "How long have you considered yourself a believer / practicing Christian?",
  profil_annees_ministere: "How many years have you been in ministry?",
  profil_taille_communaute: "What is the approximate size of your community / parish?",

  // === CRS-5 RELIGIOSITY (Huber & Huber, 2012) ===
  crs_intellect: "How often do you think about religious issues?",
  crs_ideology: "To what extent do you believe in the existence of God or a divine reality?",
  crs_public_practice: "How often do you take part in religious services (mass, worship service, liturgy)?",
  crs_private_practice: "How often do you pray outside of services?",
  crs_experience: "How often do you experience situations in which you have the feeling that God or something divine intervenes in your life?",

  // === THEOLOGY ===
  theo_orientation: "How would you describe your theological orientation?",
  theo_inspiration: "In your opinion, can an AI-generated text (for example a prayer or a meditation) have an authentic spiritual dimension?",
  theo_liturgie_ia: "Do you find the use of AI-generated content acceptable in a liturgical context (mass, worship service, celebrations)?",
  theo_activites_sacrees: "Are there spiritual activities that, in your view, should never involve AI? (multiple answers possible)",
  theo_mediation_humaine: "In your view, do certain aspects of spiritual life require an exclusively human presence?",
  theo_risque_futur: "Regarding the use of AI in the Church, what concerns you the most?",
  theo_utilite_percue: "Overall, do you think AI can be a beneficial tool for the life of the Church?",

  // === GENERAL AI USAGE ===
  ctrl_ia_frequence: "In general, how often do you use AI tools (ChatGPT, Gemini, Claude, Copilot...)?",
  ctrl_ia_contextes: "In what contexts do you use AI? (multiple answers possible)",
  ctrl_ia_confort: "How would you rate your technical proficiency with AI tools?",

  // === DIGITAL SPIRITUAL TOOLS ===
  digital_outils_existants: "Which digital tools do you already use in your spiritual life? (multiple answers possible)",
  digital_attitude_generale: "In general, how do you perceive the use of digital technology in your personal spiritual life?",

  // === MINISTRY (CLERGY) ===
  min_pred_usage: "For preparing your sermons (homilies), do you use AI?",
  min_pred_nature: "What do you use AI for, and to what extent?",
  min_pred_sentiment: "How do you feel when using AI to prepare a sermon?",
  min_care_email: "If you receive a complex email requesting spiritual advice, would you use AI to draft a response?",
  min_admin_burden: "Would you say that AI frees up administrative time so you can focus more on human relationships?",

  // === SPIRITUALITY (LAITY) ===
  laic_substitution_priere: "Have you ever used AI to generate a prayer or meditation that you then used?",
  laic_conseil_spirituel: "Could you consider asking AI for spiritual advice?",

  // === PSYCHOLOGY ===
  psych_godspeed_nature: "On a scale of 1 to 5, how do you perceive the nature of current AI?",
  psych_godspeed_conscience: "Do you think AI could one day develop a form of real consciousness?",
  psych_aias_opacity: "Does the fact that you don't understand how AI makes decisions (the \"black box\" effect) worry you?",
  psych_imago_dei: "In your opinion, does AI challenge what makes human beings unique (created in the image of God)?",
  psych_anxiete_remplacement: "Do you think AI could one day replace certain human spiritual functions (preaching, pastoral care)?",

  // === COMMUNITY ===
  communaute_position_officielle: "Has your Church / denomination taken an official position on the use of AI?",
  communaute_discussions: "Have you ever discussed AI with other members of your religious community?",
  communaute_perception_pairs: "How do you perceive the general attitude of your community members towards AI?",

  // === FUTURE INTENTIONS ===
  futur_intention_usage: "In the next 12 months, do you plan to use AI more in your spiritual life or ministry?",
  futur_formation_souhait: "Would you like to receive training on AI adapted to the religious context?",
  futur_domaines_interet: "In which aspects of your spiritual life or ministry would you consider using AI?",

  // === OPEN QUESTION ===
  commentaires_libres: "Do you have any comments, reflections, or experiences to share regarding AI and spiritual life?",

  // === SOCIAL DESIRABILITY (Crowne & Marlowe, 1960) ===
  ctrl_mc_1: "True or false: \"I sometimes find it hard to keep working unless I am encouraged.\"",
  ctrl_mc_2: "True or false: \"I have never intensely disliked anyone.\"",
  ctrl_mc_3: "True or false: \"I have sometimes wanted to rebel against people in authority even though I knew they were right.\"",
  ctrl_mc_4: "True or false: \"I am always courteous, even with unpleasant people.\"",
  ctrl_mc_5: "True or false: \"I have sometimes taken advantage of someone.\"",
};

// Option labels -------------------------------------------------------------
// Declaration order IS the display order used by the survey schema.

const frOptionLabels = {
  profil_confession: {
    catholique: "Catholique",
    protestant: "Protestant",
    orthodoxe: "Orthodoxe",
    anglican: "Anglican",
    autre_chretien: "Autre chrétien",
    sans_religion: "Sans religion / Autre",
  },
  profil_confession_catholique: {
    catholique_paroissial: "Paroissial classique",
    catholique_charismatique: "Charismatique (Renouveau, Emmanuel, Chemin Neuf...)",
    catholique_traditionaliste: "Traditionaliste (forme extraordinaire, messe en latin)",
  },
  profil_confession_protestante: {
    protestant_historique: "Protestantisme historique / mainline (Luthérien, Réformé, Méthodiste, Presbytérien)",
    evangelique: "Protestant évangélique",
  },
  profil_confession_evangelique: {
    non_charismatique: "Non-charismatique (Baptiste, Mennonite, Frères, Églises libres...)",
    charismatique: "Charismatique / pentecôtiste (Assemblées de Dieu, Baptiste charismatique...)",
  },
  profil_confession_orthodoxe: {
    byzantin: "Orthodoxe byzantin (grec, russe, roumain, serbe...)",
    oriental: "Orthodoxe oriental (copte, arménien, syriaque, éthiopien...)",
  },
  profil_confession_autre: {
    adventiste: "Adventiste",
    quaker: "Quaker (Société des Amis)",
    vieux_catholique: "Vieux-catholique",
    non_denominationnel: "Non-dénominationnel / Interconfessionnel",
    autre: "Autre",
  },
  profil_statut: {
    clerge: "Ministre ordonné (prêtre, pasteur, diacre...)",
    responsable_non_ordonne: "Responsable ou prédicateur non ordonné",
    religieux: "Religieux / Religieuse (vie consacrée)",
    'laic_engagé': "Laïc engagé (catéchiste, animateur, responsable bénévole...)",
    laic_pratiquant: "Fidèle pratiquant régulier",
    curieux: "Pratiquant occasionnel ou sympathisant",
  },
  profil_age: {
    '18-35': "18-35 ans",
    '36-50': "36-50 ans",
    '51-65': "51-65 ans",
    '66+': "Plus de 66 ans",
  },
  profil_genre: {
    homme: "Homme",
    femme: "Femme",
    autre: "Autre",
    prefere_ne_pas_repondre: "Je préfère ne pas répondre",
  },
  profil_education: {
    sans_diplome: "Sans diplôme / Certificat d'études",
    brevet: "Brevet des collèges",
    bac: "Baccalauréat ou équivalent",
    bac_plus_2: "Bac+2 (BTS, DUT, DEUG...)",
    licence: "Bac+3 (Licence, Bachelor)",
    master: "Bac+5 (Master, DEA, DESS, Grande École)",
    doctorat: "Doctorat ou équivalent",
    ne_souhaite_pas: "Je préfère ne pas répondre",
  },
  profil_formation_theologique: {
    aucune: "Aucune",
    cours_ponctuels: "Des cours ou modules ponctuels",
    diplome_theologie: "Un diplôme de théologie (licence, master, doctorat)",
    formation_pastorale: "Une formation pastorale ou de séminaire",
  },
  profil_pays: {
    france: "France",
    belgique: "Belgique",
    suisse: "Suisse",
    canada: "Canada",
    luxembourg: "Luxembourg",
    afrique_francophone: "Afrique francophone",
    autre_europe: "Autre pays européen",
    autre: "Autre",
  },
  profil_milieu: {
    rural: "Rural (moins de 2 000 habitants)",
    periurbain: "Petite ville (2 000 à 20 000 habitants)",
    urbain_moyen: "Ville moyenne (20 000 à 100 000 habitants)",
    grande_ville: "Grande ville (100 000 à 500 000 habitants)",
    metropole: "Métropole (plus de 500 000 habitants)",
  },
  profil_secteur: {
    religieux: "Ministère religieux (à temps plein)",
    education: "Éducation / Enseignement / Recherche",
    sante: "Santé / Social",
    tech: "Informatique / Numérique / Tech",
    commerce: "Commerce / Services",
    industrie: "Industrie / BTP / Agriculture",
    administration: "Administration / Fonction publique",
    art_culture: "Art / Culture / Communication",
    retraite: "Retraité(e)",
    etudiant: "Étudiant(e)",
    autre: "Autre",
  },
  profil_anciennete_foi: {
    naissance: "Depuis l'enfance (éducation chrétienne)",
    plus_20_ans: "Plus de 20 ans",
    '10_20_ans': "De 10 à moins de 20 ans",
    '5_10_ans': "De 5 à moins de 10 ans",
    '1_5_ans': "De 1 à moins de 5 ans",
    moins_1_an: "Moins d'un an",
  },
  profil_annees_ministere: {
    moins_5: "Moins de 5 ans",
    '5_10': "De 5 à moins de 10 ans",
    '10_20': "De 10 à moins de 20 ans",
    '20_30': "De 20 à moins de 30 ans",
    plus_30: "30 ans ou plus",
  },
  profil_taille_communaute: {
    tres_petite: "Moins de 50 personnes",
    petite: "De 50 à moins de 150 personnes",
    moyenne: "De 150 à moins de 500 personnes",
    grande: "De 500 à moins de 1 000 personnes",
    tres_grande: "1 000 personnes ou plus",
    ne_sait_pas: "Je ne sais pas",
  },

  crs_intellect: {
    jamais: "Jamais",
    rarement: "Rarement",
    occasionnellement: "Occasionnellement",
    souvent: "Souvent",
    tres_souvent: "Très souvent",
  },
  crs_ideology: {
    pas_du_tout: "Pas du tout",
    peu: "Un peu",
    moderement: "Modérément",
    beaucoup: "Beaucoup",
    totalement: "Totalement",
  },
  crs_public_practice: {
    hebdomadaire_plus: "Une fois par semaine ou plus",
    mensuel: "Une à trois fois par mois",
    quelques_fois_an: "Quelques fois par an",
    rarement: "Moins souvent",
    jamais: "Jamais",
  },
  crs_private_practice: {
    pluri_quotidien: "Plusieurs fois par jour",
    quotidien: "Une fois par jour",
    hebdomadaire: "Une ou plusieurs fois par semaine",
    mensuel: "Une à trois fois par mois",
    rarement: "Quelques fois par an ou moins",
    jamais: "Jamais",
  },
  crs_experience: {
    jamais: "Jamais",
    rarement: "Rarement",
    occasionnellement: "Occasionnellement",
    souvent: "Souvent",
    tres_souvent: "Très souvent",
  },

  theo_orientation: {
    traditionaliste: "Conservateur (attaché aux formes traditionnelles)",
    modere: "Modéré (entre tradition et ouverture)",
    progressiste: "Progressiste (ouvert aux évolutions)",
    ne_sait_pas: "Je ne sais pas / Sans opinion",
    sans_reponse: "Je préfère ne pas répondre",
  },
  theo_inspiration: {
    impossible: "Non, ce n'est pas possible",
    peu_probable: "C'est peu probable",
    possible_indirect: "Possible, si une personne s'en saisit spirituellement",
    possible: "Oui, c'est possible",
    ne_sait_pas: "Je ne sais pas",
    sans_reponse: "Je préfère ne pas répondre",
  },
  theo_activites_sacrees: {
    sacrements: "Les sacrements (eucharistie/cène, confession/réconciliation, baptême...)",
    predication: "La prédication / homélie",
    priere_personnelle: "La prière personnelle",
    accompagnement: "L'accompagnement spirituel / direction de conscience",
    discernement: "Le discernement vocationnel",
    aucune: "Aucune de ces activités",
  },
  theo_mediation_humaine: {
    oui_absolument: "Oui, absolument - la vie spirituelle passe par l'humain",
    oui_pour_essentiel: "Oui, pour l'essentiel (sacrements, accompagnement)",
    partiellement: "Partiellement - cela dépend des domaines",
    non_pas_necessairement: "Non, pas nécessairement - l'IA peut compléter",
    ne_sait_pas: "Je ne sais pas",
    sans_reponse: "Je préfère ne pas répondre",
  },
  theo_risque_futur: {
    paresse: "Un risque de moindre effort intellectuel ou spirituel",
    deshumanisation: "Un risque de relations moins authentiques",
    heresie: "Un risque d'erreurs dans la transmission doctrinale",
    autre: "Autre préoccupation",
    aucune: "Je n'ai pas de préoccupation particulière",
    ne_sait_pas: "Je ne sais pas / Sans opinion",
    sans_reponse: "Je préfère ne pas répondre",
  },
  theo_utilite_percue: {
    tres_negatif: "Non, c'est plutôt un danger",
    negatif: "Plutôt non, les risques dépassent les bénéfices",
    neutre: "Cela dépend de son usage",
    positif: "Plutôt oui, si bien encadré",
    tres_positif: "Oui, c'est une opportunité à saisir",
    ne_sait_pas: "Je ne sais pas / Sans opinion",
    sans_reponse: "Je préfère ne pas répondre",
  },

  ctrl_ia_frequence: {
    jamais: "Jamais",
    essaye: "J'ai essayé une ou deux fois",
    occasionnel: "Occasionnellement (quelques fois par mois)",
    regulier: "Régulièrement (plusieurs fois par semaine)",
    quotidien: "Quotidiennement",
  },
  ctrl_ia_contextes: {
    travail_pro: "Travail professionnel (emails, rapports, présentations)",
    recherche_info: "Recherche d'informations / Apprentissage",
    creation: "Création de contenu (textes, images, vidéos)",
    programmation: "Programmation / Code",
    loisirs: "Loisirs / Divertissement",
    spirituel: "Vie spirituelle / Religieuse",
  },

  digital_outils_existants: {
    bible_app: "Application Bible (YouVersion, Bible Gateway, etc.)",
    priere_app: "Application de prière ou méditation (Hozana, Pray, Abide, etc.)",
    podcast: "Podcasts religieux / spirituels",
    video: "Vidéos en ligne (YouTube, cultes ou messes en streaming)",
    reseaux_sociaux: "Réseaux sociaux à contenu religieux",
    site_paroisse: "Site web de paroisse / église locale",
    aucun: "Aucun de ces outils",
  },
  digital_attitude_generale: {
    tres_positif: "Très positivement - cela enrichit ma foi",
    positif: "Plutôt positivement - utile en complément",
    neutre: "De manière neutre - ni bien ni mal",
    negatif: "Plutôt négativement - cela peut distraire",
    tres_negatif: "Très négativement - incompatible avec la foi",
  },

  min_pred_usage: {
    jamais: "Jamais",
    rare: "Rarement (pour débloquer une idée)",
    regulier: "Régulièrement (comme assistant de recherche)",
    systematique: "Systématiquement (partie intégrante de ma préparation)",
  },
  min_care_email: {
    non: "Non",
    oui_relu: "Oui, en relisant et modifiant",
    oui_tel_quel: "Oui, tel quel ou presque",
  },

  laic_substitution_priere: {
    non: "Non, jamais",
    oui_positif: "Oui, et j'ai trouvé cela spirituellement nourrissant",
    oui_neutre: "Oui, mais cela ne m'a pas particulièrement touché(e)",
    oui_negatif: "Oui, mais cela ne correspondait pas à mes attentes",
  },
  laic_conseil_spirituel: {
    jamais: "Non, je préfère un accompagnement humain",
    complement: "Oui, en complément d'un accompagnement humain",
    oui_possible: "Oui, pour certaines questions simples",
    deja_fait: "Oui, je l'ai déjà fait",
    ne_sait_pas: "Je ne sais pas",
  },

  psych_godspeed_nature: {
    '1_machine': "1 - Purement machinique et froide",
    '2_machine_plus': "2 - Machinique mais performante",
    '3_neutre': "3 - Neutre",
    '4_humain_moins': "4 - Simule bien les traits humains",
    '5_humain': "5 - Presque humaine / Vivante",
    sans_reponse: "Je préfère ne pas répondre",
  },
  psych_godspeed_conscience: {
    impossible: "Non, c'est ontologiquement impossible",
    imitation: "Non, ce ne sera toujours qu'une imitation complexe",
    incertain: "Je ne sais pas / C'est difficile à dire",
    possible_emergence: "C'est possible (émergence d'une conscience artificielle)",
    probable: "Oui, c'est probable ou déjà le cas",
    sans_reponse: "Je préfère ne pas répondre",
  },
  psych_aias_opacity: {
    non_confiance: "Non, je fais confiance à la technologie",
    non_indifferent: "Non, tant que ça fonctionne",
    peu: "Un peu, mais sans plus",
    oui_moderement: "Oui, c'est une préoccupation",
    oui_fortement: "Oui, cette opacité est dangereuse ou inacceptable",
    sans_reponse: "Je préfère ne pas répondre",
  },
  psych_imago_dei: {
    pas_du_tout: "Pas du tout, l'humain reste unique",
    peu: "Un peu",
    moderement: "Modérément",
    beaucoup: "Beaucoup",
    totalement: "Oui, cela questionne notre singularité",
    ne_sait_pas: "Je ne sais pas / Sans opinion",
    sans_reponse: "Je préfère ne pas répondre",
  },
  psych_anxiete_remplacement: {
    non_impossible: "Non, c'est impossible",
    non_peu_probable: "Non, c'est peu probable",
    possible_partiel: "Possible pour certaines fonctions limitées",
    oui_probable: "Oui, probablement",
    oui_certain: "Oui, c'est inévitable",
    ne_sait_pas: "Je ne sais pas",
    sans_reponse: "Je préfère ne pas répondre",
  },

  communaute_position_officielle: {
    oui_favorable: "Oui, plutôt favorable",
    oui_prudent: "Oui, avec prudence / encadrement",
    oui_defavorable: "Oui, plutôt défavorable",
    non: "Non, pas à ma connaissance",
    ne_sait_pas: "Je ne sais pas",
    sans_reponse: "Je préfère ne pas répondre",
  },
  communaute_discussions: {
    jamais: "Jamais",
    rarement: "Rarement, en passant",
    parfois: "Parfois, de manière informelle",
    souvent: "Souvent, c'est un sujet qui intéresse",
    organise: "Oui, dans un cadre organisé (réunion, formation)",
    sans_reponse: "Je préfère ne pas répondre",
  },
  communaute_perception_pairs: {
    tres_favorable: "Très favorable / enthousiaste",
    favorable: "Plutôt favorable / curieux",
    neutre: "Neutre / indifférent",
    mefiant: "Plutôt méfiant / réservé",
    hostile: "Hostile / opposé",
    opinions_variees: "Les opinions sont très variées",
    ne_sait_pas: "Je ne sais pas",
    sans_reponse: "Je préfère ne pas répondre",
  },

  futur_intention_usage: {
    oui_certain: "Oui, certainement",
    oui_probable: "Oui, probablement",
    peut_etre: "Peut-être",
    non_probable: "Probablement pas",
    non_certain: "Certainement pas",
    ne_sait_pas: "Je ne sais pas",
  },
  futur_formation_souhait: {
    oui_tres: "Oui, très intéressé(e)",
    oui_assez: "Oui, assez intéressé(e)",
    peut_etre: "Peut-être, selon le contenu",
    non_pas_vraiment: "Pas vraiment",
    non_pas_du_tout: "Non, pas du tout",
  },
  futur_domaines_interet: {
    etude_bible: "Étude biblique (commentaires, contexte historique)",
    preparation_predication: "Préparation de prédications",
    catechese: "Enseignement religieux (catéchèse, école du dimanche, etc.)",
    priere_meditation: "Prière / méditation guidée",
    accompagnement: "Accompagnement pastoral",
    communication: "Communication / réseaux sociaux",
    administration: "Administration / gestion de la communauté",
    musique_liturgie: "Musique / liturgie / louange",
    aucun_domaines: "Aucun",
  },

  ctrl_mc_1: { true: "Vrai", false: "Faux" },
  ctrl_mc_2: { true: "Vrai", false: "Faux" },
  ctrl_mc_3: { true: "Vrai", false: "Faux" },
  ctrl_mc_4: { true: "Vrai", false: "Faux" },
  ctrl_mc_5: { true: "Vrai", false: "Faux" },
};

const enOptionLabels: OptionLabelMap = {
  profil_confession: {
    catholique: "Catholic",
    protestant: "Protestant",
    orthodoxe: "Orthodox",
    anglican: "Anglican",
    autre_chretien: "Other Christian",
    sans_religion: "No religion / Other",
  },
  profil_confession_catholique: {
    catholique_paroissial: "Mainstream parish",
    catholique_charismatique: "Charismatic (Renewal, Emmanuel, Chemin Neuf...)",
    catholique_traditionaliste: "Traditionalist (extraordinary form, Latin mass)",
  },
  profil_confession_protestante: {
    protestant_historique: "Historic / Mainline Protestant (Lutheran, Reformed, Methodist, Presbyterian)",
    evangelique: "Evangelical Protestant",
  },
  profil_confession_evangelique: {
    non_charismatique: "Non-charismatic (Baptist, Mennonite, Brethren, Free Churches...)",
    charismatique: "Charismatic / Pentecostal (Assemblies of God, charismatic Baptist...)",
  },
  profil_confession_orthodoxe: {
    byzantin: "Eastern Orthodox (Greek, Russian, Romanian, Serbian...)",
    oriental: "Oriental Orthodox (Coptic, Armenian, Syriac, Ethiopian...)",
  },
  profil_confession_autre: {
    adventiste: "Adventist",
    quaker: "Quaker (Society of Friends)",
    vieux_catholique: "Old Catholic",
    non_denominationnel: "Non-denominational / Interdenominational",
    autre: "Other",
  },
  profil_statut: {
    clerge: "Ordained minister (priest, pastor, deacon...)",
    responsable_non_ordonne: "Non-ordained leader or preacher",
    religieux: "Religious (consecrated life)",
    'laic_engagé': "Engaged layperson (catechist, volunteer leader...)",
    laic_pratiquant: "Regular practicing faithful",
    curieux: "Occasional practitioner or sympathizer",
  },
  profil_age: {
    '18-35': "18-35 years",
    '36-50': "36-50 years",
    '51-65': "51-65 years",
    '66+': "Over 66 years",
  },
  profil_genre: {
    homme: "Male",
    femme: "Female",
    autre: "Other",
    prefere_ne_pas_repondre: "Prefer not to say",
  },
  profil_education: {
    sans_diplome: "No diploma",
    brevet: "Middle school certificate",
    bac: "High school diploma or equivalent",
    bac_plus_2: "Associate degree (2 years post-high school)",
    licence: "Bachelor's degree",
    master: "Master's degree",
    doctorat: "Doctorate or equivalent",
    ne_souhaite_pas: "Prefer not to say",
  },
  profil_formation_theologique: {
    aucune: "None",
    cours_ponctuels: "Occasional courses or modules",
    diplome_theologie: "A theology degree (bachelor's, master's, doctorate)",
    formation_pastorale: "Pastoral or seminary training",
  },
  profil_pays: {
    france: "France",
    belgique: "Belgium",
    suisse: "Switzerland",
    canada: "Canada",
    luxembourg: "Luxembourg",
    afrique_francophone: "French-speaking Africa",
    autre_europe: "Other European country",
    autre: "Other",
  },
  profil_milieu: {
    rural: "Rural (fewer than 2,000 inhabitants)",
    periurbain: "Small town (2,000 to 20,000 inhabitants)",
    urbain_moyen: "Medium city (20,000 to 100,000 inhabitants)",
    grande_ville: "Large city (100,000 to 500,000 inhabitants)",
    metropole: "Metropolis (over 500,000 inhabitants)",
  },
  profil_secteur: {
    religieux: "Religious ministry (full-time)",
    education: "Education / Teaching / Research",
    sante: "Healthcare / Social work",
    tech: "IT / Digital / Tech",
    commerce: "Commerce / Services",
    industrie: "Industry / Construction / Agriculture",
    administration: "Public administration",
    art_culture: "Arts / Culture / Communication",
    retraite: "Retired",
    etudiant: "Student",
    autre: "Other",
  },
  profil_anciennete_foi: {
    naissance: "Since childhood (Christian upbringing)",
    plus_20_ans: "More than 20 years",
    '10_20_ans': "From 10 to under 20 years",
    '5_10_ans': "From 5 to under 10 years",
    '1_5_ans': "From 1 to under 5 years",
    moins_1_an: "Less than 1 year",
  },
  profil_annees_ministere: {
    moins_5: "Less than 5 years",
    '5_10': "From 5 to under 10 years",
    '10_20': "From 10 to under 20 years",
    '20_30': "From 20 to under 30 years",
    plus_30: "30 years or more",
  },
  profil_taille_communaute: {
    tres_petite: "Fewer than 50 people",
    petite: "From 50 to under 150 people",
    moyenne: "From 150 to under 500 people",
    grande: "From 500 to under 1,000 people",
    tres_grande: "1,000 people or more",
    ne_sait_pas: "I don't know",
  },

  crs_intellect: {
    jamais: "Never",
    rarement: "Rarely",
    occasionnellement: "Occasionally",
    souvent: "Often",
    tres_souvent: "Very often",
  },
  crs_ideology: {
    pas_du_tout: "Not at all",
    peu: "A little",
    moderement: "Moderately",
    beaucoup: "A lot",
    totalement: "Totally",
  },
  crs_public_practice: {
    hebdomadaire_plus: "Once a week or more",
    mensuel: "One to three times a month",
    quelques_fois_an: "A few times a year",
    rarement: "Less often",
    jamais: "Never",
  },
  crs_private_practice: {
    pluri_quotidien: "Several times a day",
    quotidien: "Once a day",
    hebdomadaire: "One or several times a week",
    mensuel: "One to three times a month",
    rarement: "A few times a year or less",
    jamais: "Never",
  },
  crs_experience: {
    jamais: "Never",
    rarement: "Rarely",
    occasionnellement: "Occasionally",
    souvent: "Often",
    tres_souvent: "Very often",
  },

  theo_orientation: {
    traditionaliste: "Conservative (attached to traditional forms)",
    modere: "Moderate (between tradition and openness)",
    progressiste: "Progressive (open to change)",
    ne_sait_pas: "I don't know / No opinion",
    sans_reponse: "Prefer not to answer",
  },
  theo_inspiration: {
    impossible: "No, that is not possible",
    peu_probable: "That is unlikely",
    possible_indirect: "Possible, if a person takes it up spiritually",
    possible: "Yes, that is possible",
    ne_sait_pas: "I don't know",
    sans_reponse: "Prefer not to answer",
  },
  theo_activites_sacrees: {
    sacrements: "The sacraments (eucharist/communion, confession/reconciliation, baptism...)",
    predication: "Preaching / homily",
    priere_personnelle: "Personal prayer",
    accompagnement: "Spiritual direction / accompaniment",
    discernement: "Vocational discernment",
    aucune: "None of these activities",
  },
  theo_mediation_humaine: {
    oui_absolument: "Yes, absolutely - spiritual life goes through human beings",
    oui_pour_essentiel: "Yes, for the essentials (sacraments, accompaniment)",
    partiellement: "Partially - it depends on the area",
    non_pas_necessairement: "No, not necessarily - AI can complement",
    ne_sait_pas: "I don't know",
    sans_reponse: "Prefer not to answer",
  },
  theo_risque_futur: {
    paresse: "A risk of less intellectual or spiritual effort",
    deshumanisation: "A risk of less authentic relationships",
    heresie: "A risk of errors in doctrinal transmission",
    autre: "Another concern",
    aucune: "I have no particular concern",
    ne_sait_pas: "I don't know / No opinion",
    sans_reponse: "Prefer not to answer",
  },
  theo_utilite_percue: {
    tres_negatif: "No, it is rather a danger",
    negatif: "Rather not, the risks outweigh the benefits",
    neutre: "It depends on how it is used",
    positif: "Rather yes, if properly framed",
    tres_positif: "Yes, it is an opportunity to seize",
    ne_sait_pas: "I don't know / No opinion",
    sans_reponse: "Prefer not to answer",
  },

  ctrl_ia_frequence: {
    jamais: "Never",
    essaye: "I tried once or twice",
    occasionnel: "Occasionally (a few times a month)",
    regulier: "Regularly (several times a week)",
    quotidien: "Daily",
  },
  ctrl_ia_contextes: {
    travail_pro: "Professional work (emails, reports, presentations)",
    recherche_info: "Information seeking / Learning",
    creation: "Content creation (text, images, video)",
    programmation: "Programming / Code",
    loisirs: "Leisure / Entertainment",
    spirituel: "Spiritual / Religious life",
  },

  digital_outils_existants: {
    bible_app: "Bible app (YouVersion, Bible Gateway, etc.)",
    priere_app: "Prayer or meditation app (Hozana, Pray, Abide, etc.)",
    podcast: "Religious / spiritual podcasts",
    video: "Online videos (YouTube, streamed services or masses)",
    reseaux_sociaux: "Social media with religious content",
    site_paroisse: "Parish / local church website",
    aucun: "None of these tools",
  },
  digital_attitude_generale: {
    tres_positif: "Very positively - it enriches my faith",
    positif: "Rather positively - useful as a complement",
    neutre: "Neutrally - neither good nor bad",
    negatif: "Rather negatively - it can distract",
    tres_negatif: "Very negatively - incompatible with faith",
  },

  min_pred_usage: {
    jamais: "Never",
    rare: "Rarely (to unblock an idea)",
    regulier: "Regularly (as a research assistant)",
    systematique: "Systematically (an integral part of my preparation)",
  },
  min_care_email: {
    non: "No",
    oui_relu: "Yes, rereading and editing it",
    oui_tel_quel: "Yes, as-is or nearly so",
  },

  laic_substitution_priere: {
    non: "No, never",
    oui_positif: "Yes, and I found it spiritually nourishing",
    oui_neutre: "Yes, but it did not particularly move me",
    oui_negatif: "Yes, but it did not match my expectations",
  },
  laic_conseil_spirituel: {
    jamais: "No, I prefer human accompaniment",
    complement: "Yes, alongside human accompaniment",
    oui_possible: "Yes, for some simple questions",
    deja_fait: "Yes, I have already done so",
    ne_sait_pas: "I don't know",
  },

  psych_godspeed_nature: {
    '1_machine': "1 - Purely mechanical and cold",
    '2_machine_plus': "2 - Mechanical but effective",
    '3_neutre': "3 - Neutral",
    '4_humain_moins': "4 - Simulates human traits well",
    '5_humain': "5 - Almost human / Alive",
    sans_reponse: "Prefer not to answer",
  },
  psych_godspeed_conscience: {
    impossible: "No, it is ontologically impossible",
    imitation: "No, it will always be a complex imitation",
    incertain: "I don't know / Hard to say",
    possible_emergence: "It is possible (emergence of an artificial consciousness)",
    probable: "Yes, it is likely or already the case",
    sans_reponse: "Prefer not to answer",
  },
  psych_aias_opacity: {
    non_confiance: "No, I trust the technology",
    non_indifferent: "No, as long as it works",
    peu: "A little, but no more than that",
    oui_moderement: "Yes, it is a concern",
    oui_fortement: "Yes, this opacity is dangerous or unacceptable",
    sans_reponse: "Prefer not to answer",
  },
  psych_imago_dei: {
    pas_du_tout: "Not at all, humans remain unique",
    peu: "A little",
    moderement: "Moderately",
    beaucoup: "A lot",
    totalement: "Yes, it questions our singularity",
    ne_sait_pas: "I don't know / No opinion",
    sans_reponse: "Prefer not to answer",
  },
  psych_anxiete_remplacement: {
    non_impossible: "No, it is impossible",
    non_peu_probable: "No, it is unlikely",
    possible_partiel: "Possible for some limited functions",
    oui_probable: "Yes, probably",
    oui_certain: "Yes, it is inevitable",
    ne_sait_pas: "I don't know",
    sans_reponse: "Prefer not to answer",
  },

  communaute_position_officielle: {
    oui_favorable: "Yes, rather favourable",
    oui_prudent: "Yes, with caution / guidelines",
    oui_defavorable: "Yes, rather unfavourable",
    non: "No, not to my knowledge",
    ne_sait_pas: "I don't know",
    sans_reponse: "Prefer not to answer",
  },
  communaute_discussions: {
    jamais: "Never",
    rarement: "Rarely, in passing",
    parfois: "Sometimes, informally",
    souvent: "Often, it is a topic of interest",
    organise: "Yes, in an organised setting (meeting, training)",
    sans_reponse: "Prefer not to answer",
  },
  communaute_perception_pairs: {
    tres_favorable: "Very favourable / enthusiastic",
    favorable: "Rather favourable / curious",
    neutre: "Neutral / indifferent",
    mefiant: "Rather wary / reserved",
    hostile: "Hostile / opposed",
    opinions_variees: "Opinions vary widely",
    ne_sait_pas: "I don't know",
    sans_reponse: "Prefer not to answer",
  },

  futur_intention_usage: {
    oui_certain: "Yes, certainly",
    oui_probable: "Yes, probably",
    peut_etre: "Maybe",
    non_probable: "Probably not",
    non_certain: "Certainly not",
    ne_sait_pas: "I don't know",
  },
  futur_formation_souhait: {
    oui_tres: "Yes, very interested",
    oui_assez: "Yes, fairly interested",
    peut_etre: "Maybe, depending on the content",
    non_pas_vraiment: "Not really",
    non_pas_du_tout: "No, not at all",
  },
  futur_domaines_interet: {
    etude_bible: "Bible study (commentaries, historical context)",
    preparation_predication: "Sermon preparation",
    catechese: "Religious teaching (catechesis, Sunday school, etc.)",
    priere_meditation: "Guided prayer / meditation",
    accompagnement: "Pastoral care",
    communication: "Communication / social media",
    administration: "Administration / community management",
    musique_liturgie: "Music / liturgy / worship",
    aucun_domaines: "None",
  },

  ctrl_mc_1: { true: "True", false: "False" },
  ctrl_mc_2: { true: "True", false: "False" },
  ctrl_mc_3: { true: "True", false: "False" },
  ctrl_mc_4: { true: "True", false: "False" },
  ctrl_mc_5: { true: "True", false: "False" },
};

// Generic option labels kept for the legacy `tOption(value)` lookup only.
// Displayed labels come from `optionLabels` above (per question id).
const frGenericOptions = {
  yes: "Oui",
  no: "Non",
  true: "Vrai",
  false: "Faux",
  other: "Autre",
  dont_know: "Je ne sais pas",
  no_opinion: "Sans opinion",
  prefer_not_say: "Je préfère ne pas répondre",
};

const enGenericOptions: Record<keyof typeof frGenericOptions, string> = {
  yes: "Yes",
  no: "No",
  true: "True",
  false: "False",
  other: "Other",
  dont_know: "I don't know",
  no_opinion: "No opinion",
  prefer_not_say: "Prefer not to say",
};

export const questionTranslations = {
  fr: {
    questions: frQuestions,
    optionLabels: frOptionLabels as OptionLabelMap,
    options: frGenericOptions,

    scales: {
      not_at_all: "Pas du tout",
      very_much: "Énormément",
      not_important: "Pas important",
      very_important: "Très important",
      never: "Jamais",
      very_often: "Très souvent",
      not_comfortable: "Novice",
      very_comfortable: "Expert",
      comfortable: "Tout à fait à l'aise",
      uncomfortable: "Mal à l'aise",
      no_complicates_all: "Non, ça complique tout",
      yes_liberator: "Oui, cela me libère du temps",
      absolutely_not: "Absolument pas",
      completely_acceptable: "Tout à fait acceptable",
    },

    placeholders: {
      commentaires_libres: "Votre réponse est facultative mais précieuse pour enrichir notre compréhension du sujet...",
    },

    matrixColumns: {
      0: "Non utilisé",
      1: "Inspiration",
      2: "Base à retravailler",
      3: "Tel quel",
    },

    matrixRows: {
      plan: "La structure / Le plan",
      exegese: "Recherche biblique (commentaires, contexte historique)",
      illustration: "Recherche d'illustrations / anecdotes",
      images: "Génération d'images pour les slides",
      redaction: "Rédaction de paragraphes entiers",
    },

    categories: {
      profile: "Profil",
      religiosity: "Religiosité",
      usage: "Usage de l'IA",
      digital_spiritual: "Outils numériques spirituels",
      ministry_preaching: "Prédication",
      ministry_pastoral: "Accompagnement pastoral",
      ministry_vision: "Vision du ministère",
      spirituality: "Vie spirituelle",
      theology: "Théologie",
      psychology: "Psychologie",
      community: "Communauté",
      future: "Perspectives futures",
      social_desirability: "Questions de contrôle",
      open: "Commentaires",
    },
  },

  en: {
    questions: enQuestions,
    optionLabels: enOptionLabels,
    options: enGenericOptions,

    scales: {
      not_at_all: "Not at all",
      very_much: "Very much",
      not_important: "Not important",
      very_important: "Very important",
      never: "Never",
      very_often: "Very often",
      not_comfortable: "Novice",
      very_comfortable: "Expert",
      comfortable: "Completely comfortable",
      uncomfortable: "Uncomfortable",
      no_complicates_all: "No, it complicates everything",
      yes_liberator: "Yes, it frees up time",
      absolutely_not: "Absolutely not",
      completely_acceptable: "Completely acceptable",
    },

    placeholders: {
      commentaires_libres: "Your response is optional but valuable to enrich our understanding of the topic...",
    },

    matrixColumns: {
      0: "Not used",
      1: "Inspiration",
      2: "Draft to rework",
      3: "As-is",
    },

    matrixRows: {
      plan: "Structure / Outline",
      exegese: "Biblical research (commentaries, historical context)",
      illustration: "Finding illustrations / anecdotes",
      images: "Generating images for slides",
      redaction: "Writing entire paragraphs",
    },

    categories: {
      profile: "Profile",
      religiosity: "Religiosity",
      usage: "AI Usage",
      digital_spiritual: "Digital spiritual tools",
      ministry_preaching: "Preaching",
      ministry_pastoral: "Pastoral care",
      ministry_vision: "Ministry vision",
      spirituality: "Spiritual life",
      theology: "Theology",
      psychology: "Psychology",
      community: "Community",
      future: "Future perspectives",
      social_desirability: "Control questions",
      open: "Comments",
    },
  },
};

export type QuestionLanguage = keyof typeof questionTranslations;

/** Ordered option values declared for a question (schema display order). */
export function getOptionValues(questionId: string): string[] {
  const labels = frOptionLabels as OptionLabelMap;
  const entry = labels[questionId];
  if (!entry) {
    throw new Error(`No option labels declared for question '${questionId}'`);
  }
  return Object.keys(entry);
}

/** Canonical French label for an option, used to build the survey schema. */
export function getFrenchOptionLabel(questionId: string, value: string): string {
  const label = (frOptionLabels as OptionLabelMap)[questionId]?.[value];
  if (!label) {
    throw new Error(`Missing French label for option '${value}' of '${questionId}'`);
  }
  return label;
}

/** Canonical French question text, used to build the survey schema. */
export function getFrenchQuestionText(questionId: string): string {
  const text = (frQuestions as Record<string, string>)[questionId];
  if (!text) {
    throw new Error(`Missing French text for question '${questionId}'`);
  }
  return text;
}

/** Localised option label, or undefined when the pair is unknown. */
export function getOptionLabel(
  language: QuestionLanguage,
  questionId: string,
  value: string
): string | undefined {
  return questionTranslations[language].optionLabels[questionId]?.[value];
}

/** Localised placeholder for free-text questions. */
export function getPlaceholder(
  language: QuestionLanguage,
  questionId: string
): string | undefined {
  const placeholders = questionTranslations[language].placeholders as Record<string, string>;
  return placeholders[questionId];
}

/** Canonical French matrix row label, used to build the survey schema. */
export function getFrenchMatrixRowLabel(rowValue: string): string {
  const rows = questionTranslations.fr.matrixRows as Record<string, string>;
  const label = rows[rowValue];
  if (!label) {
    throw new Error(`Missing French label for matrix row '${rowValue}'`);
  }
  return label;
}

/** Canonical French matrix column label, used to build the survey schema. */
export function getFrenchMatrixColumnLabel(columnValue: number): string {
  const columns = questionTranslations.fr.matrixColumns as Record<number, string>;
  const label = columns[columnValue];
  if (!label) {
    throw new Error(`Missing French label for matrix column '${columnValue}'`);
  }
  return label;
}
