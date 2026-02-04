// Question translations - maps question IDs to their translations
export const questionTranslations = {
  fr: {
    // Question texts
    questions: {
      // === PROFIL & DÉMOGRAPHIE ===
      profil_confession: "Quelle est votre branche chrétienne principale ?",
      profil_confession_protestante: "Précisez votre sensibilité protestante :",
      profil_statut: "Quelle est votre situation au sein de votre communauté religieuse ?",
      profil_age: "Votre tranche d'âge",
      profil_genre: "Votre genre",
      profil_education: "Quel est votre niveau d'études le plus élevé ?",
      profil_pays: "Dans quel pays résidez-vous principalement ?",
      profil_milieu: "Dans quel type de milieu vivez-vous ?",
      profil_secteur: "Quel est votre secteur d'activité principal ?",
      profil_anciennete_foi: "Depuis combien de temps vous considérez-vous comme croyant(e) / pratiquant(e) ?",
      profil_annees_ministere: "Depuis combien d'années exercez-vous votre ministère ?",
      profil_taille_communaute: "Quelle est la taille approximative de votre communauté / paroisse ?",

      // === CRS-5 RELIGIOSITÉ ===
      crs_intellect: "À quelle fréquence réfléchissez-vous à des questions religieuses ?",
      crs_ideology: "Dans quelle mesure croyez-vous en l'existence de Dieu ou d'une réalité divine ?",
      crs_public_practice: "À quelle fréquence participez-vous à des offices religieux ?",
      crs_private_practice: "À quelle fréquence priez-vous en dehors des offices ?",
      crs_experience: "À quelle fréquence vivez-vous des moments de spiritualité profonde ?",

      // === THÉOLOGIE ===
      theo_orientation: "Comment situeriez-vous votre sensibilité théologique ?",
      theo_inspiration: "Selon vous, un texte généré par une IA (par exemple une prière ou une méditation) peut-il avoir une dimension spirituelle authentique ?",
      theo_risque_futur: "Concernant l'utilisation de l'IA dans l'Église, qu'est-ce qui vous préoccupe le plus ?",
      theo_utilite_percue: "Dans l'ensemble, pensez-vous que l'IA peut être un outil bénéfique pour la vie de l'Église ?",

      // === USAGE IA GÉNÉRAL ===
      ctrl_ia_frequence: "En général, à quelle fréquence utilisez-vous des outils d'IA (ChatGPT, Gemini, Claude, Copilot...) ?",
      ctrl_ia_contextes: "Dans quels contextes utilisez-vous l'IA ? (plusieurs réponses possibles)",
      ctrl_ia_confort: "Globalement, quel est votre niveau de confort avec les outils d'IA ?",

      // === OUTILS NUMÉRIQUES SPIRITUELS ===
      digital_outils_existants: "Quels outils numériques utilisez-vous déjà dans votre vie spirituelle ? (plusieurs réponses possibles)",
      digital_attitude_generale: "De manière générale, comment percevez-vous l'utilisation du numérique dans votre vie spirituelle personnelle ?",

      // === MINISTÈRE (CLERGÉ) ===
      min_pred_usage: "Pour la préparation de vos prédications (homélies, sermons), utilisez-vous l'IA ?",
      min_pred_nature: "Pour quoi faites-vous appel à l'IA, et à quel point ?",
      min_pred_sentiment: "Comment vous sentez-vous lorsque vous utilisez l'IA pour préparer une prédication ?",
      min_care_email: "Si vous recevez un email complexe demandant un conseil spirituel, utiliseriez-vous l'IA pour rédiger la réponse ?",
      min_admin_burden: "Diriez-vous que l'IA vous libère du temps administratif pour vous consacrer davantage aux relations humaines ?",

      // === SPIRITUALITÉ (LAÏCS) ===
      laic_substitution_priere: "Avez-vous déjà utilisé une IA pour générer une prière ou une méditation que vous avez ensuite utilisée ?",
      laic_conseil_spirituel: "Pourriez-vous envisager de demander un conseil spirituel à une IA ?",

      // === PSYCHOLOGIE ===
      psych_godspeed_nature: "Sur une échelle de 1 à 5, comment percevez-vous la nature de l'IA actuelle ?",
      psych_godspeed_conscience: "Pensez-vous qu'une IA puisse un jour développer une forme de conscience réelle ?",
      psych_aias_opacity: "Le fait de ne pas comprendre comment l'IA prend ses décisions (effet 'boîte noire') vous inquiète-t-il ?",
      psych_imago_dei: "Selon vous, l'IA remet-elle en question ce qui fait la spécificité de l'être humain (créé à l'image de Dieu) ?",
      psych_anxiete_remplacement: "Pensez-vous que l'IA pourrait un jour remplacer certaines fonctions spirituelles humaines (prédication, accompagnement) ?",

      // === COMMUNAUTÉ ===
      communaute_position_officielle: "Votre Église / dénomination a-t-elle pris position officiellement sur l'utilisation de l'IA ?",
      communaute_discussions: "Avez-vous déjà discuté de l'IA avec d'autres membres de votre communauté religieuse ?",
      communaute_perception_pairs: "Comment percevez-vous l'attitude générale des membres de votre communauté envers l'IA ?",

      // === INTENTIONS FUTURES ===
      futur_intention_usage: "Dans les 12 prochains mois, pensez-vous utiliser davantage l'IA dans votre vie spirituelle ou ministère ?",
      futur_formation_souhait: "Souhaiteriez-vous bénéficier d'une formation sur l'IA adaptée au contexte religieux ?",
      futur_domaines_interet: "Dans quels aspects de votre vie spirituelle ou ministère seriez-vous susceptible d'utiliser l'IA ?",

      // === QUESTION OUVERTE ===
      commentaires_libres: "Avez-vous des commentaires, réflexions ou expériences à partager concernant l'IA et la vie spirituelle ?",

      // === DÉSIRABILITÉ SOCIALE ===
      ctrl_mc_1: "Vrai ou Faux : 'Il m'est parfois difficile de continuer mon travail si je ne suis pas encouragé(e).'",
      ctrl_mc_2: "Vrai ou Faux : 'Je n'ai jamais intensément détesté quelqu'un.'",
      ctrl_mc_3: "Vrai ou Faux : 'J'ai parfois eu envie de me rebeller contre des personnes en position d'autorité même si je savais qu'elles avaient raison.'",
      ctrl_mc_4: "Vrai ou Faux : 'Je suis toujours courtois(e), même avec des personnes désagréables.'",
      ctrl_mc_5: "Vrai ou Faux : 'Il m'est arrivé de profiter de quelqu'un.'",
    },

    // Option labels
    options: {
      // Yes/No / True/False
      yes: "Oui",
      no: "Non",
      true: "Vrai",
      false: "Faux",

      // Frequency
      never: "Jamais",
      rarely: "Rarement",
      sometimes: "Parfois",
      occasionally: "Occasionnellement",
      often: "Souvent",
      very_often: "Très souvent",
      daily: "Quotidiennement",
      weekly: "Hebdomadaire",
      monthly: "Mensuel",

      // Agreement scale
      strongly_disagree: "Pas du tout d'accord",
      disagree: "Pas d'accord",
      neutral: "Neutre",
      agree: "D'accord",
      strongly_agree: "Tout à fait d'accord",

      // Comfort level
      very_uncomfortable: "Très inconfortable",
      uncomfortable: "Inconfortable",
      comfortable: "Confortable",
      very_comfortable: "Très confortable",

      // Degree
      not_at_all: "Pas du tout",
      a_little: "Un peu",
      moderately: "Modérément",
      a_lot: "Beaucoup",
      totally: "Totalement",

      // Generic
      other: "Autre",
      dont_know: "Je ne sais pas",
      no_opinion: "Sans opinion",
      prefer_not_say: "Préfère ne pas répondre",

      // Confessions
      catholique: "Catholique",
      protestant: "Protestant",
      orthodoxe: "Orthodoxe",
      anglican: "Anglican",
      autre_chretien: "Autre chrétien",
      sans_religion: "Sans religion / Autre",
      // Protestant sub-categories
      protestant_historique: "Protestantisme historique / mainline (Luthérien, Réformé, Méthodiste, Presbytérien)",
      evangelique: "Évangélique non-charismatique (Baptiste, Mennonite, Frères, Églises libres...)",
      pentecotiste: "Évangélique pentecôtiste / charismatique",
      // Orthodox sub-categories
      orthodoxe_oriental: "Orthodoxe oriental (Grec, Russe, Serbe, Roumain, Bulgare, Géorgien...)",
      orthodoxe_ancien: "Orthodoxe oriental ancien (Copte, Éthiopien, Arménien, Syriaque)",
      // Other Christian sub-categories
      adventiste: "Adventiste",
      quaker: "Quaker (Société des Amis)",
      vieux_catholique: "Vieux-catholique",
      non_denominationnel: "Non-dénominationnel / Interconfessionnel",

      // Statut
      clerge: "Ministre ordonné (prêtre, pasteur, diacre...)",
      religieux: "Religieux/Religieuse (vie consacrée)",
      laic_engage: "Laïc engagé (catéchiste, animateur, responsable bénévole...)",
      laic_pratiquant: "Fidèle pratiquant régulier",
      curieux: "Pratiquant occasionnel ou sympathisant",

      // Age
      age_18_35: "18-35 ans",
      age_36_50: "36-50 ans",
      age_51_65: "51-65 ans",
      age_66_plus: "Plus de 66 ans",

      // Gender
      homme: "Homme",
      femme: "Femme",
      autre_genre: "Autre / Ne souhaite pas répondre",

      // Education
      sans_diplome: "Sans diplôme / Certificat d'études",
      brevet: "Brevet des collèges",
      bac: "Baccalauréat ou équivalent",
      bac_plus_2: "Bac+2 (BTS, DUT, DEUG...)",
      licence: "Bac+3 (Licence, Bachelor)",
      master: "Bac+5 (Master, DEA, DESS, Grande École)",
      doctorat: "Doctorat ou équivalent",

      // Countries
      france: "France",
      belgique: "Belgique",
      suisse: "Suisse",
      canada: "Canada",
      luxembourg: "Luxembourg",
      afrique_francophone: "Afrique francophone",
      autre_europe: "Autre pays européen",
      autre_pays: "Autre",

      // Milieu
      rural: "Rural (commune de moins de 2 000 habitants)",
      periurbain: "Périurbain (petite ville, banlieue)",
      urbain_moyen: "Ville moyenne (20 000 à 100 000 habitants)",
      grande_ville: "Grande ville (plus de 100 000 habitants)",
      metropole: "Métropole / Grande agglomération",

      // Secteur
      secteur_religieux: "Ministère religieux (à temps plein)",
      education: "Éducation / Enseignement / Recherche",
      sante: "Santé / Social",
      tech: "Informatique / Numérique / Tech",
      commerce: "Commerce / Services",
      industrie: "Industrie / BTP / Agriculture",
      administration: "Administration / Fonction publique",
      art_culture: "Art / Culture / Communication",
      retraite: "Retraité(e)",
      etudiant: "Étudiant(e)",

      // Ancienneté foi
      depuis_toujours: "Depuis toujours (éducation chrétienne)",
      plus_20_ans: "Plus de 20 ans",
      entre_10_20: "Entre 10 et 20 ans",
      entre_5_10: "Entre 5 et 10 ans",
      entre_1_5: "Entre 1 et 5 ans",
      moins_1_an: "Moins d'un an",

      // Taille communauté
      tres_petite: "Moins de 50 personnes",
      petite: "50 à 150 personnes",
      moyenne: "150 à 500 personnes",
      grande: "500 à 1000 personnes",
      tres_grande: "Plus de 1000 personnes",

      // Outils numériques
      bible_app: "Application Bible (YouVersion, Bible.is, etc.)",
      priere_app: "Application de prière (Hozana, Pray, etc.)",
      podcast: "Podcasts religieux / spirituels",
      video: "Vidéos en ligne (YouTube, messes en streaming)",
      reseaux_sociaux: "Réseaux sociaux à contenu religieux",
      site_paroisse: "Site web de paroisse / communauté",
      aucun: "Aucun de ces outils",

      // Domaines IA
      etude_bible: "Étude biblique / exégèse",
      preparation_predication: "Préparation de prédications",
      catechese: "Catéchèse / éducation religieuse",
      priere_meditation: "Prière / méditation guidée",
      accompagnement: "Accompagnement pastoral",
      communication: "Communication / réseaux sociaux",
      administration_paroisse: "Administration / gestion paroissiale",
      musique_liturgie: "Musique / liturgie",
      aucun_domaines: "Aucun",
    },

    // Scale labels
    scales: {
      not_at_all: "Pas du tout",
      very_much: "Énormément",
      not_important: "Pas important",
      very_important: "Très important",
      never: "Jamais",
      very_often: "Très souvent",
      not_comfortable: "Très inconfortable",
      very_comfortable: "Très à l'aise",
      comfortable: "Tout à fait à l'aise",
      uncomfortable: "Mal à l'aise",
      no_complicates_all: "Non, ça complique tout",
      yes_liberator: "Oui, c'est un libérateur",
      absolutely_not: "Absolument pas",
      completely_acceptable: "Tout à fait acceptable",
    },

    // Placeholders
    placeholders: {
      commentaires_libres: "Votre réponse est facultative mais précieuse pour enrichir notre compréhension du sujet...",
    },

    // Matrix columns (delegation levels for min_pred_nature)
    matrixColumns: {
      0: "Non utilisé",
      1: "Inspiration",
      2: "Base à retravailler",
      3: "Tel quel",
    },

    // Matrix rows (domains for min_pred_nature)
    matrixRows: {
      plan: "La structure / Le plan",
      exegese: "Recherche biblique (commentaires, contexte historique)",
      illustration: "Recherche d'illustrations / anecdotes",
      images: "Génération d'images pour les slides",
      redaction: "Rédaction de paragraphes entiers",
    },

    // Category labels
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
    // Question texts
    questions: {
      // === PROFILE & DEMOGRAPHICS ===
      profil_confession: "What is your main Christian denomination?",
      profil_confession_protestante: "Please specify your Protestant tradition:",
      profil_statut: "What is your role within your religious community?",
      profil_age: "Your age group",
      profil_genre: "Your gender",
      profil_education: "What is your highest level of education?",
      profil_pays: "In which country do you primarily reside?",
      profil_milieu: "What type of area do you live in?",
      profil_secteur: "What is your main professional sector?",
      profil_anciennete_foi: "How long have you considered yourself a believer / practicing Christian?",
      profil_annees_ministere: "How many years have you been in ministry?",
      profil_taille_communaute: "What is the approximate size of your community / parish?",

      // === CRS-5 RELIGIOSITY ===
      crs_intellect: "How often do you think about religious issues?",
      crs_ideology: "To what extent do you believe in the existence of God or a divine reality?",
      crs_public_practice: "How often do you participate in religious services?",
      crs_private_practice: "How often do you pray outside of services?",
      crs_experience: "How often do you experience moments of deep spirituality?",

      // === THEOLOGY ===
      theo_orientation: "How would you describe your theological orientation?",
      theo_inspiration: "In your opinion, can an AI-generated text (for example, a prayer or meditation) have an authentic spiritual dimension?",
      theo_risque_futur: "Regarding the use of AI in the Church, what concerns you the most?",
      theo_utilite_percue: "Overall, do you think AI can be a beneficial tool for the life of the Church?",

      // === GENERAL AI USAGE ===
      ctrl_ia_frequence: "In general, how often do you use AI tools (ChatGPT, Gemini, Claude, Copilot...)?",
      ctrl_ia_contextes: "In what contexts do you use AI? (multiple answers possible)",
      ctrl_ia_confort: "Overall, what is your comfort level with AI tools?",

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
      psych_aias_opacity: "Does the fact that you don't understand how AI makes decisions ('black box' effect) worry you?",
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

      // === SOCIAL DESIRABILITY ===
      ctrl_mc_1: "True or False: 'I sometimes find it hard to keep working unless I am encouraged.'",
      ctrl_mc_2: "True or False: 'I have never intensely disliked anyone.'",
      ctrl_mc_3: "True or False: 'I have sometimes wanted to rebel against people in authority even though I knew they were right.'",
      ctrl_mc_4: "True or False: 'I am always courteous, even with unpleasant people.'",
      ctrl_mc_5: "True or False: 'I have sometimes taken advantage of someone.'",
    },

    // Option labels
    options: {
      // Yes/No / True/False
      yes: "Yes",
      no: "No",
      true: "True",
      false: "False",

      // Frequency
      never: "Never",
      rarely: "Rarely",
      sometimes: "Sometimes",
      occasionally: "Occasionally",
      often: "Often",
      very_often: "Very often",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",

      // Agreement scale
      strongly_disagree: "Strongly disagree",
      disagree: "Disagree",
      neutral: "Neutral",
      agree: "Agree",
      strongly_agree: "Strongly agree",

      // Comfort level
      very_uncomfortable: "Very uncomfortable",
      uncomfortable: "Uncomfortable",
      comfortable: "Comfortable",
      very_comfortable: "Very comfortable",

      // Degree
      not_at_all: "Not at all",
      a_little: "A little",
      moderately: "Moderately",
      a_lot: "A lot",
      totally: "Totally",

      // Generic
      other: "Other",
      dont_know: "I don't know",
      no_opinion: "No opinion",
      prefer_not_say: "Prefer not to say",

      // Confessions
      catholique: "Catholic",
      protestant: "Protestant",
      orthodoxe: "Orthodox",
      anglican: "Anglican",
      autre_chretien: "Other Christian",
      sans_religion: "No religion / Other",
      // Protestant sub-categories
      protestant_historique: "Historic / Mainline Protestant (Lutheran, Reformed, Methodist, Presbyterian)",
      evangelique: "Non-charismatic Evangelical (Baptist, Mennonite, Brethren, Free Churches...)",
      pentecotiste: "Pentecostal / Charismatic Evangelical",
      // Orthodox sub-categories
      orthodoxe_oriental: "Eastern Orthodox (Greek, Russian, Serbian, Romanian, Bulgarian, Georgian...)",
      orthodoxe_ancien: "Oriental Orthodox (Coptic, Ethiopian, Armenian, Syriac)",
      // Other Christian sub-categories
      adventiste: "Adventist",
      quaker: "Quaker (Society of Friends)",
      vieux_catholique: "Old Catholic",
      non_denominationnel: "Non-denominational / Interdenominational",

      // Status
      clerge: "Ordained minister (priest, pastor, deacon...)",
      religieux: "Religious (consecrated life)",
      laic_engage: "Engaged layperson (catechist, volunteer leader...)",
      laic_pratiquant: "Regular practicing faithful",
      curieux: "Occasional practitioner or sympathizer",

      // Age
      age_18_35: "18-35 years",
      age_36_50: "36-50 years",
      age_51_65: "51-65 years",
      age_66_plus: "Over 66 years",

      // Gender
      homme: "Male",
      femme: "Female",
      autre_genre: "Other / Prefer not to say",

      // Education
      sans_diplome: "No diploma",
      brevet: "Middle school certificate",
      bac: "High school diploma or equivalent",
      bac_plus_2: "Associate degree (2 years post-high school)",
      licence: "Bachelor's degree",
      master: "Master's degree",
      doctorat: "Doctorate or equivalent",

      // Countries
      france: "France",
      belgique: "Belgium",
      suisse: "Switzerland",
      canada: "Canada",
      luxembourg: "Luxembourg",
      afrique_francophone: "French-speaking Africa",
      autre_europe: "Other European country",
      autre_pays: "Other",

      // Environment
      rural: "Rural (fewer than 2,000 inhabitants)",
      periurbain: "Suburban (small town, suburbs)",
      urbain_moyen: "Medium city (20,000 to 100,000 inhabitants)",
      grande_ville: "Large city (over 100,000 inhabitants)",
      metropole: "Metropolis / Large urban area",

      // Sector
      secteur_religieux: "Religious ministry (full-time)",
      education: "Education / Teaching / Research",
      sante: "Healthcare / Social work",
      tech: "IT / Digital / Tech",
      commerce: "Commerce / Services",
      industrie: "Industry / Construction / Agriculture",
      administration: "Public administration",
      art_culture: "Arts / Culture / Communication",
      retraite: "Retired",
      etudiant: "Student",

      // Faith seniority
      depuis_toujours: "Since birth (Christian upbringing)",
      plus_20_ans: "More than 20 years",
      entre_10_20: "Between 10 and 20 years",
      entre_5_10: "Between 5 and 10 years",
      entre_1_5: "Between 1 and 5 years",
      moins_1_an: "Less than 1 year",

      // Community size
      tres_petite: "Fewer than 50 people",
      petite: "50 to 150 people",
      moyenne: "150 to 500 people",
      grande: "500 to 1000 people",
      tres_grande: "More than 1000 people",

      // Digital tools
      bible_app: "Bible app (YouVersion, Bible.is, etc.)",
      priere_app: "Prayer app (Hozana, Pray, etc.)",
      podcast: "Religious / spiritual podcasts",
      video: "Online videos (YouTube, streaming services)",
      reseaux_sociaux: "Social media with religious content",
      site_paroisse: "Parish / community website",
      aucun: "None of these tools",

      // AI domains
      etude_bible: "Bible study / exegesis",
      preparation_predication: "Sermon preparation",
      catechese: "Catechesis / religious education",
      priere_meditation: "Guided prayer / meditation",
      accompagnement: "Pastoral care",
      communication: "Communication / social media",
      administration_paroisse: "Parish administration / management",
      musique_liturgie: "Music / liturgy",
      aucun_domaines: "None",
    },

    // Scale labels
    scales: {
      not_at_all: "Not at all",
      very_much: "Very much",
      not_important: "Not important",
      very_important: "Very important",
      never: "Never",
      very_often: "Very often",
      not_comfortable: "Very uncomfortable",
      very_comfortable: "Very comfortable",
      comfortable: "Completely comfortable",
      uncomfortable: "Uncomfortable",
      no_complicates_all: "No, it complicates everything",
      yes_liberator: "Yes, it's a liberator",
      absolutely_not: "Absolutely not",
      completely_acceptable: "Completely acceptable",
    },

    // Placeholders
    placeholders: {
      commentaires_libres: "Your response is optional but valuable to enrich our understanding of the topic...",
    },

    // Matrix columns (delegation levels for min_pred_nature)
    matrixColumns: {
      0: "Not used",
      1: "Inspiration",
      2: "Draft to rework",
      3: "As-is",
    },

    // Matrix rows (domains for min_pred_nature)
    matrixRows: {
      plan: "Structure / Outline",
      exegese: "Biblical research (commentaries, historical context)",
      illustration: "Finding illustrations / anecdotes",
      images: "Generating images for slides",
      redaction: "Writing entire paragraphs",
    },

    // Category labels
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
} as const;
