export const translations = {
  fr: {
    // Survey Intro
    intro: {
      badge: "Grande enquête 2026",
      badgeText: "IA & Foi Chrétienne",
      title: "Intelligence Artificielle & Vie Spirituelle",
      title1: "Intelligence Artificielle",
      title2: "Vie Spirituelle",
      subtitle: "Comment l'IA transforme-t-elle les pratiques religieuses ?",
      description:
        "De la rédaction de sermons à la prière assistée, l'IA transforme silencieusement les pratiques religieuses. Cette grande enquête vise à cartographier ces usages et à comprendre les enjeux éthiques qu'ils soulèvent.",
      privacyTitle: "Protocole de Confidentialité",
      privacyDescription:
        "Votre participation est essentielle pour la recherche. Nous garantissons la protection de vos droits :",
      anonymity: "Anonymat total :",
      anonymityDesc:
        "Ni nom, ni email, ni adresse IP en clair : seules des empreintes cryptographiques anti-doublons sont conservées.",
      academic: "Usage des données :",
      academicDesc:
        "Les réponses sont agrégées uniquement à des fins statistiques.",
      cta: "J'accepte et je commence",
      startButton: "Commencer le sondage",
      learnMore: "En savoir plus",
      time: "Temps estimé : 8 à 12 minutes",
      consent:
        "En cliquant sur \"J'accepte\", vous consentez à participer à cette étude dans le respect du RGPD.",
      faqLink: "Consulter la FAQ",
      skipVideo: "Passer",
      videoNotSupported: "Votre navigateur ne prend pas en charge la vidéo.",
      featureScientific: "Méthodologie scientifique",
      featureAnonymous: "100 % anonyme",
      featureDuration: "8 à 12 minutes",
      anonymousHighlight: "100% anonyme",
      anonymousHighlightDesc: "Ni nom, ni email, ni adresse IP en clair : seules des empreintes cryptographiques anti-doublons sont conservées.",
    },

    // CNEF co-branded landing
    cnef: {
      partnership: "Enquête proposée par Romain Girardi en partenariat avec le CNEF",
      badge: "Partenariat CNEF",
      logoAlt: "Logo du CNEF",
      title: "IA et foi : la parole aux évangéliques",
      subtitle: "Quel est votre usage réel de l'intelligence artificielle dans la vie d'Église ?",
      description:
        "Le CNEF prépare une déclaration sur l'intelligence artificielle. Pour l'appuyer sur des chiffres réels, cette enquête recueille la pratique des évangéliques de France. Vos réponses, 100% anonymes, nourriront directement cette réflexion.",
      startButton: "Commencer l'enquête",
    },

    // Survey Questions
    survey: {
      questionOf: "Question {current} sur {total}",
      previous: "Précédent",
      continue: "Continuer",
      selections: "{count} sélection",
      selectionsPlural: "{count} sélections",
      selectValue: "Sélectionnez une valeur",
      scaleFrom: "Échelle de 1 ({min}) à 5 ({max})",
      textPlaceholder: "Écrivez votre réponse ici...",
      optionalQuestion: "Cette question est facultative",
      submitting: "Enregistrement de vos réponses...",
      exclusiveConflictNotice:
        "Une réponse « aucun » ne peut pas être combinée à d'autres choix. Corrigez votre sélection pour continuer.",
    },

    // Screen-out confirmation (outside the studied population)
    screenedOut: {
      confirmTitle: "Confirmer votre réponse",
      confirmDescription:
        "Vous avez indiqué ne pas vous reconnaître dans une confession chrétienne. Ce questionnaire s'adresse aux personnes chrétiennes ; confirmez pour terminer, ou revenez en arrière pour corriger.",
      back: "Revenir",
      confirm: "Confirmer et terminer",
    },

    // Feedback Screen
    feedback: {
      badge: "Votre profil personnalisé",
      title: "Découvrez vos résultats",
      yourStrength: "Votre force",
      yourChallenge: "Votre défi",
      religiosity: "Religiosité (CRS-5)",
      huberScale: "Échelle de Huber",
      aiAdoption: "Adoption IA",
      usageLevel: "Niveau d'usage",
      insightsTitle: "Éclairages personnalisés",
      viewGlobalResults: "Voir les résultats globaux",
      disclaimer:
        "Ce profil est généré à partir de vos réponses à des fins illustratives. Il ne constitue pas une évaluation psychologique ou spirituelle.",
      match: "Correspondance",
      matchScore: "correspondance {score} / 100",
      profileSpectrum: "Spectre de votre profil",
      sevenDimensions: "Vos 7 dimensions",
      reflectionAreas: "Pistes de réflexion, si vous le souhaitez",
      tensionPoint: "Tension observée",
      notMeasured: "Non mesuré (trop peu de réponses)",
      notMeasuredDetail:
        "Trop peu d'items de cette dimension ont été renseignés pour calculer un score.",
      heuristicAttribution:
        "Attribution heuristique, non validée : le profil ci-dessous est une lecture indicative de vos réponses, pas un diagnostic.",
      noProfileTitle: "Profil non attribuable : trop peu de dimensions mesurées",
      noProfileDescription:
        "Au moins quatre dimensions doivent être mesurées pour rapprocher vos réponses d'un profil. Vos scores bruts par dimension restent affichés ci-dessous.",
      measuredDimensions: "Dimensions mesurées : {count} sur 7",
      closeProfilesTitle: "Deux profils proches",
      closeProfilesDescription:
        "Vos réponses se situent à distance comparable de deux profils. Aucun des deux ne l'emporte ; ils sont présentés ensemble.",
      normsComparison: "Votre score est supérieur à {percent} % des {count} participants",
      normsUnavailable: "Comparaison disponible à partir de 30 participants",
      usageGap: "Écart d'usage",
      usageGapNote:
        "Comparaison entre l'usage de l'IA que vous déclarez en général et celui que vous déclarez dans le domaine spirituel ou ministériel.",
      usageGapNoUse: "Aucun usage de l'IA déclaré",
      usageGapGeneralOnly: "Usage général déclaré, aucun usage spirituel déclaré",
      usageGapBoth: "Usage déclaré dans les deux domaines",
      usageGapUnknown: "Écart non calculable : la question sur l'usage général est sans réponse",
      socialDesirabilityNote:
        "Vos réponses aux cinq énoncés vrai/faux suggèrent une tendance à répondre de façon socialement attendue ; votre profil est calculé sans correction, à lire avec cette réserve.",
    },

    // Profile names
    profiles: {
      gardien_tradition: "Gardien de la Tradition",
      prudent_eclaire: "Prudent Éclairé",
      innovateur_ancre: "Innovateur Ancré",
      equilibriste: "Équilibriste Spirituel",
      pragmatique_moderne: "Pragmatique Moderne",
      pionnier_spirituel: "Pionnier Spirituel",
      progressiste_critique: "Progressiste Critique",
      explorateur: "Explorateur",
      // Sub-profiles
      protecteur_sacre: "Le Protecteur du Sacré",
      sage_prudent: "Le Sage Prudent",
      berger_communautaire: "Le Berger Communautaire",
      analyste_spirituel: "L'Analyste Spirituel",
      discerneur_pastoral: "Le Discerneur Pastoral",
      observateur_engage: "L'Observateur Engagé",
      pont_generationnel: "Le Pont Générationnel",
      evangeliste_digital: "L'Évangéliste Digital",
      theologien_techno: "Le Théologien Techno",
      mediateur: "Le Médiateur",
      chercheur_sens: "Le Chercheur de Sens",
      adaptateur_prudent: "L'Adaptateur Prudent",
      efficace_engage: "L'Efficace Engagé",
      communicateur_digital: "Le Communicateur Digital",
      optimisateur_pastoral: "L'Optimisateur Pastoral",
      visionnaire: "Le Visionnaire",
      experimentateur: "L'Expérimentateur",
      prophete_digital: "Le Prophète Digital",
      ethicien: "L'Éthicien",
      reformateur_social: "Le Réformateur Social",
      philosophe_spirituel: "Le Philosophe Spirituel",
      curieux_spirituel: "Le Curieux Spirituel",
      novice_technologique: "Le Novice Technologique",
      chercheur_seculier: "Le Chercheur Séculier",
    },

    // Reflection areas: observed gaps, described without prescription
    growthAreas: {
      exploration_tech: "Usage déclaré et intention d'usage",
      exploration_tech_action: "Vos réponses indiquent un usage actuel bas et une intention d'usage plus haute.",
      community_dialogue: "Place du sujet dans votre communauté",
      community_dialogue_action: "Vos réponses indiquent une centralité religieuse haute et un contexte communautaire où le sujet est peu présent.",
      ethical_reflection: "Usage déclaré et préoccupation éthique",
      ethical_reflection_action: "Vos réponses indiquent un usage fréquent de l'IA et une préoccupation éthique basse.",
      guided_experimentation: "Frontière sacrée et usage déclaré",
      guided_experimentation_action: "Vos réponses indiquent une frontière sacrée haute et un usage fréquent de l'IA hors du champ spirituel.",
      openness_change: "Suivi du sujet",
      openness_change_action: "Vos réponses indiquent peu d'exposition déclarée aux discussions sur l'IA dans le champ religieux.",
    },

    // Tensions: two dimensions read together, no value judgement
    tensions: {
      tension_ai_sacred: "Vos réponses combinent un usage déclaré de l'IA et une frontière haute sur les actes spirituels.",
      tension_ethical_future: "Vos réponses combinent une préoccupation éthique haute et une intention d'usage haute.",
      tension_community_faith: "Vos réponses combinent une centralité religieuse haute et un contexte communautaire peu porteur sur ce sujet.",
      tension_perception_ethics: "Vos réponses combinent une perception anthropomorphe de l'IA et une préoccupation éthique basse.",
    },

    // Thank You Screen
    thanks: {
      title: "Merci pour votre participation",
      description:
        "Votre contribution est précieuse pour faire avancer la recherche sur les transformations numériques de la vie spirituelle.",
      community: "Rejoignez notre communauté de participants",
      contributed: "personnes ont contribué à cette étude",
      viewResults: "Voir les résultats",
      share: "Partager",
      profileAvailable: "Votre profil personnalisé est disponible",
      resultsNote:
        "Les résultats présentés sont des tendances anonymisées et agrégées. Aucune donnée individuelle n'est accessible.",
      shareText:
        "J'ai participé à cette étude sur l'IA dans les pratiques religieuses. Participez aussi !",
      linkCopied: "Lien copié dans le presse-papier !",
      shareTitle: "Sondage IA & Vie Spirituelle",
      anonymousIdTitle: "Votre identifiant anonyme",
      anonymousIdNote: "Conservez cet identifiant en lieu sûr et ne le partagez pas : il permet à lui seul d'accéder à vos données ou de les supprimer.",
      manageData: "Gérer mes données →",
      debrief: "Les cinq affirmations « vrai ou faux » du questionnaire mesuraient la désirabilité sociale, c'est-à-dire la tendance à se présenter sous un jour favorable. Elles servent uniquement à contrôler ce biais dans l'analyse et n'entrent pas dans votre profil.",
      screenedOutTitle: "Merci de votre intérêt",
      screenedOutDescription: "Cette enquête porte sur les pratiques des personnes rattachées à une tradition chrétienne. Votre réponse a été enregistrée et le questionnaire s'arrête ici. Merci du temps que vous y avez consacré.",
    },

    // FAQ
    faq: {
      title: "Questions Fréquentes",
      backToSurvey: "Retour au sondage",
      subtitle: "Tout ce que vous devez savoir sur cette étude",
      searchPlaceholder: "Rechercher...",
      noResults: "Aucune question ne correspond à votre recherche.",
    },

    // Footer
    footer: {
      tagline: "Grande enquête sur l'IA et la vie spirituelle",
      createdBy: "Créée par",
    },

    // Dashboard
    dashboard: {
      title: "Résultats de l'étude",
      subtitle: "Données agrégées et anonymisées",
      participants: "participants",
      religiousProfile: "Profil religieux",
      aiUsage: "Usage de l'IA",
      spiritualAI: "IA & Spiritualité",
      demographics: "Démographie",
      loading: "Analyse des données en cours...",
      loadErrorTitle: "Impossible de charger les résultats",
      loadErrorDesc: "Une erreur est survenue lors du chargement des résultats. Veuillez réessayer.",
      visualization: "Visualisation des Données",
      exploreInsights: "Explorez les tendances et insights de notre communauté de participants",
      questionsAnalyzed: "Questions analysées",
      simulated: "Simulées",
      demoData: "Données de démo",
      responses: "réponses",
      majority: "majoritaire",
      restartSurvey: "Recommencer le sondage",
      thankYouFooter: "Merci pour votre contribution à cette étude.",
      all: "Tous",
      profile: "Profil",
      religiosity: "Religiosité",
      usage: "Usage IA",
      theology: "Théologie",
      psychology: "Psychologie",
      analyzingData: "Analyse des données",
      preparingViz: "Préparation des visualisations...",
      realTimeResults: "Résultats en temps réel",
      dashboardTitle: "Tableau de Bord",
      exploreDescription: "Explorez les tendances et découvrez les insights de notre communauté",
      responsesCollected: "réponses collectées",
      catholics: "Catholiques",
      majorityDenomination: "confession majoritaire",
      aiUsers: "Utilisateurs IA",
      useAIRegularly: "utilisent l'IA régulièrement",
      averageScore: "Score moyen",
      crs5Religiosity: "religiosité CRS-5",
      keyInsight: "Insight principal",
      insightTitle: "42% des chrétiens pratiquants utilisent déjà l'IA dans leur quotidien",
      insightTitleDynamic: "{percent}% des participants utilisent déjà l'IA dans leur quotidien",
      insightDescription: "Mais seulement 12% l'ont utilisée dans un contexte spirituel. Cette tension révèle une résistance spécifique au domaine religieux.",
      insightDescriptionDynamic: "Seuls {percent}% déclarent l'avoir utilisée dans un cadre spirituel, révélant une tension propre aux usages religieux.",
      exploreData: "Explorer les données",
      studyConductedBy: "Étude menée par Romain Girardi",
      lastUpdated: "Mise à jour {date}",
    },

    // Sharing
    sharing: {
      title: "Partagez ce sondage",
      scanQR: "Scannez ce QR code",
      orCopyLink: "Ou copiez le lien",
      copyLink: "Copier le lien",
      copied: "Copié !",
      download: "Télécharger",
      share: "Partager",
      shareTitle: "Sondage IA & Foi",
      shareDescription: "Participez à cette étude sur l'IA et la vie spirituelle",
    },

    profileShare: {
      title: "Partager mon profil",
      subtitle: "Vos amis vont adorer découvrir le leur",
      whatsapp: "Partager sur WhatsApp",
      copyLink: "Copier le lien",
      copied: "Copié !",
      shareOnX: "Partager sur X",
      shareOnFacebook: "Partager sur Facebook",
    },

    // PDF
    pdf: {
      download: "Télécharger mon rapport PDF",
      generating: "Génération...",
      preparing: "Préparation...",
    },

    // Session
    session: {
      resumeTitle: "Reprendre où vous en étiez ?",
      resumeDescription: "Nous avons trouvé une session incomplète. Voulez-vous la reprendre ?",
      resumeButton: "Reprendre",
      restartButton: "Recommencer",
      saving: "Sauvegarde en cours...",
      saved: "Progression sauvegardée",
      leaveWarning: "Votre progression sera perdue si vous quittez maintenant.",
    },

    // Errors
    errors: {
      generic: "Une erreur est survenue",
      network: "Erreur de connexion. Vérifiez votre connexion internet.",
      validation: "Données invalides",
      notFound: "Page introuvable",
      retry: "Réessayer",
      goHome: "Retour à l'accueil",
      title: "Oups ! Une erreur est survenue",
      description: "Nous rencontrons un problème technique. Notre équipe a été notifiée.",
      errorCode: "Code erreur",
      // Duplicate submission errors
      alreadySubmitted: "Vous avez déjà participé",
      alreadySubmittedDesc: "Nos enregistrements indiquent que vous avez déjà complété ce sondage.",
      alreadySubmittedHelp: "Si vous pensez qu'il s'agit d'une erreur (par exemple, ordinateur partagé), veuillez nous contacter.",
      ipLimitExceeded: "Limite de participations atteinte",
      ipLimitExceededDesc: "Trop de participations ont été enregistrées depuis ce réseau.",
      contactUs: "Nous contacter",
      contactEmail: "contact@ia-foi.fr",
      legitimateUser: "Je suis un utilisateur légitime",
      legitimateUserDesc: "Si vous partagez un ordinateur ou un réseau avec d'autres participants, contactez-nous avec votre situation et nous pourrons vous aider.",
      // Solutions for blocked users
      solutionsTitle: "Solutions possibles",
      solution1Title: "Utilisez un autre appareil",
      solution1Desc: "Essayez depuis votre téléphone, tablette ou un autre ordinateur.",
      solution2Title: "Utilisez un autre navigateur",
      solution2Desc: "Essayez avec Chrome, Firefox, Safari ou Edge si vous n'avez pas déjà participé.",
      cookieBlockTitle: "Blocage local du navigateur",
      cookieBlockDesc: "Ce navigateur contient déjà un marqueur de participation (cookie de sécurité).",
      cookieSolution1Title: "Utilisez une fenêtre privée",
      cookieSolution1Desc: "Ouvrez le sondage en navigation privée/incognito.",
      cookieSolution2Title: "Supprimez les données du site",
      cookieSolution2Desc: "Effacez les cookies et le stockage local pour ia-foi.fr puis rechargez la page.",
      solution3Title: "Ordinateur partagé ?",
      solution3Desc: "Si quelqu'un d'autre a déjà participé depuis cet appareil, contactez-nous pour obtenir un accès.",
      stillNeedHelp: "Toujours bloqué ? Nous pouvons vous aider.",
      emailSubject: "Demande d'accès au sondage",
      emailBody: "Bonjour,\n\nJ'essaie d'accéder au sondage mais je reçois une erreur ({errorCode}).\n\nMa situation :\n\nMerci.",
      // Network failure during final submission (data must not be silently lost)
      submissionFailedTitle: "Échec de l'envoi",
      submissionFailedDesc: "Vos réponses n'ont pas pu être enregistrées à cause d'un problème de connexion. Elles restent disponibles sur cet appareil : réessayez dès que possible.",
    },

    // Not Found (404)
    notFound: {
      title: "Page introuvable",
      description: "La page que vous recherchez n'existe pas ou a été déplacée.",
      home: "Accueil",
      back: "Retour",
    },

    // Email Hash Verification
    emailHash: {
      title: "Vérification unique",
      subtitle: "Pour garantir l'intégrité scientifique, nous vérifions que chaque participant ne répond qu'une seule fois.",
      emailLabel: "Votre adresse email",
      emailPlaceholder: "exemple@email.com",
      yourHash: "Votre code unique (empreinte cryptographique)",
      hashExplanation: "Ce code est généré à partir de votre email. Votre email réel n'est jamais stocké ni transmis.",
      privacyTitle: "Protection de vos données",
      privacy1: "Seule l'empreinte cryptographique est conservée (pas votre email)",
      privacy2: "Impossible de retrouver votre email à partir du code",
      privacy3: "Aucun démarchage commercial possible",
      sendPdfLabel: "Recevoir mes résultats personnalisés par email",
      sendPdfNote: "Votre email sera utilisé uniquement pour envoyer le PDF, puis immédiatement effacé (non stocké).",
      continueButton: "Vérifier et continuer",
      verifying: "Vérification...",
      footerNote: "Cette vérification garantit l'unicité des réponses tout en préservant votre anonymat.",
      invalidEmail: "Veuillez entrer une adresse email valide",
      verificationFailed: "La vérification a échoué. Veuillez réessayer.",
      networkError: "Erreur de connexion. Vérifiez votre connexion internet.",
      alreadyUsed: "Cette adresse email a déjà été utilisée pour répondre au sondage.",
    },

    // Consent
    consent: {
      checkbox: "J'ai 18 ans ou plus, j'accepte les conditions de participation et la politique de confidentialité, et je consens explicitement au traitement de mes réponses relatives à mes convictions religieuses dans le cadre de cette recherche académique (art. 9§2.a du RGPD).",
      checkboxCnef: "J'ai 18 ans ou plus, j'accepte les conditions de participation et la politique de confidentialité, et je consens explicitement au traitement de mes réponses relatives à mes convictions religieuses dans le cadre de cette recherche académique (art. 9§2.a du RGPD), ainsi qu'à leur exploitation sous forme agrégée et anonyme par le CNEF, partenaire de cette enquête.",
      details: "Les réponses anonymisées seront publiées sous forme de jeu de données ouvert à des fins de recherche et de réplication. Vous pouvez retirer votre participation et faire supprimer vos données à tout moment depuis la page « Mes données ».",
      minimumAge: "La participation est réservée aux personnes majeures (18 ans ou plus).",
      required: "Votre consentement est requis pour participer",
      privacyLink: "Politique de confidentialité",
      termsLink: "Conditions d'utilisation",
    },

    // Profiles Modal
    profilesModal: {
      title: "Les 8 profils",
      subtitle: "Découvrez les différentes postures face à l'IA et la foi",
      viewAll: "Voir tous les profils",
      close: "Fermer",
      yourProfile: "Votre profil",
      coreMotivation: "Motivation principale",
      primaryFear: "Préoccupation principale",
      subProfiles: "Sous-profils",
      // Profile explanations
      gardien_tradition: {
        title: "Gardien de la Tradition",
        short: "Protecteur des pratiques spirituelles authentiques",
        description: "Vous êtes un pilier de la tradition, convaincu que les pratiques spirituelles ont traversé les siècles pour de bonnes raisons. L'IA représente pour vous une technologie qui, mal utilisée, pourrait éroder l'authenticité de la vie spirituelle.",
      },
      prudent_eclaire: {
        title: "Prudent Éclairé",
        short: "Discernement équilibré entre tradition et innovation",
        description: "Vous représentez la voie du discernement. Attaché aux valeurs traditionnelles, vous n'êtes pas fermé au progrès mais vous exigez que chaque nouveauté prouve sa valeur avant de l'adopter.",
      },
      innovateur_ancre: {
        title: "Innovateur Ancré",
        short: "Alliance rare entre tradition profonde et adoption technologique",
        description: "Vous êtes un profil rare : profondément ancré dans la tradition, vous voyez dans la technologie non pas une menace mais un outil au service de la mission spirituelle.",
      },
      equilibriste: {
        title: "Équilibriste Spirituel",
        short: "Recherche constante du juste milieu",
        description: "Vous incarnez la voie du milieu, cherchant toujours l'équilibre entre les extrêmes. Ni enthousiaste inconditionnel ni opposant farouche, vous pesez chaque décision.",
      },
      pragmatique_moderne: {
        title: "Pragmatique Moderne",
        short: "L'efficacité au service de la mission",
        description: "Vous êtes orienté vers les résultats. Pour vous, l'IA est avant tout un outil pratique qui peut libérer du temps pour ce qui compte vraiment : les relations humaines.",
      },
      pionnier_spirituel: {
        title: "Pionnier Spirituel",
        short: "Explorateur des nouvelles frontières foi-technologie",
        description: "Vous êtes à l'avant-garde, explorant avec enthousiasme les territoires inconnus où se rencontrent spiritualité et intelligence artificielle.",
      },
      progressiste_critique: {
        title: "Progressiste Critique",
        short: "Ouverture au changement avec vigilance éthique",
        description: "Vous êtes ouvert au progrès et au changement, mais votre esprit critique reste en éveil permanent. L'enthousiasme technologique doit être tempéré par une réflexion éthique.",
      },
      explorateur: {
        title: "Explorateur",
        short: "En chemin, formant ses convictions",
        description: "Vous êtes en phase d'exploration, aussi bien dans votre foi que dans votre rapport à la technologie. Cette position n'est pas une faiblesse mais une ouverture.",
      },
    },

    // Results Explanation
    resultsExplain: {
      title: "Comprendre vos résultats",
      intro: "Vos résultats sont basés sur l'analyse de vos réponses selon 7 dimensions clés qui définissent votre rapport à l'IA dans un contexte spirituel. Chaque dimension est mesurée sur une échelle de 1 à 5.",
      dimensionsTitle: "Les 7 dimensions",
      religiosity: "Centralité de la foi (CRS-5) : pratique spirituelle quotidienne",
      aiOpenness: "Disposition générale à intégrer l'IA dans différentes sphères de vie",
      sacredBoundary: "Conviction sur la nécessité d'une présence humaine pour certains actes spirituels",
      ethicalConcern: "Vigilance face aux risques de déshumanisation et d'erreurs doctrinales",
      psychologicalPerception: "Questions sur la nature de l'IA et la spécificité humaine (Imago Dei)",
      communityContext: "Position de votre communauté face à l'IA, telle que vous la percevez",
      futureOrientation: "Intention d'approfondir votre engagement avec l'IA",
      matchExplain: "Le score sur 100 mesure la proximité entre vos réponses et les plages du profil type. L'attribution est heuristique : les plages ont été fixées par jugement, pas dérivées de données.",
      disclaimer: "Ces profils sont des outils de réflexion, pas des catégories rigides. Vous pouvez évoluer et présenter des caractéristiques de plusieurs profils.",
      balancedPosition: "Position équilibrée (ni haute ni basse) sur cette dimension",
    },

    // Methodology
    methodology: {
      title: "Note méthodologique",
      description: "Cette enquête utilise une version adaptée du CRS-5 et, pour le reste, des items originaux inspirés d'instruments publiés qui ne sont pas administrés ici. Elle est destinée à la réflexion personnelle et à une analyse exploratoire, jamais à une catégorisation définitive.",
      learnMore: "En savoir plus sur la méthodologie",
    },

    // Scientific disclaimer for FAIR compliance
    scientificDisclaimer: {
      title: "Avertissement scientifique",
      exploratoryStudy: "Étude exploratoire",
      exploratoryNote: "Cette étude est exploratoire. Le profil est une attribution heuristique : ses plages et ses poids ont été fixés par jugement, jamais dérivés d'une analyse sur des données réelles.",

      // Profile interpretation warning
      profileWarning: "Ce profil reflète vos réponses, non votre identité",
      profileNote: "Les résultats sont indicatifs et invitent à la réflexion. Ils ne constituent pas un diagnostic ni une catégorisation définitive de votre spiritualité.",

      // Scale validation notice
      scaleNotice: "Construits exploratoires",
      scaleNote: "6 des 7 dimensions reposent sur des construits exploratoires, non validés par analyse factorielle. La religiosité utilise le CRS-5 dans une version adaptée, dont la traduction française n'est pas validée.",

      // Comparison caveat
      comparisonCaveat: "Comparaisons empiriques",
      comparisonNote: "Votre score est situé sur la distribution des participants réels, à partir de 30 participants. Il n'existe pas de population de référence.",

      // Social desirability
      desirabilityNote: "Désirabilité sociale",
      desirabilityExplanation: "Les cinq affirmations en vrai ou faux servent de covariable pour l'analyse. Aucun de vos scores n'est ajusté à partir d'elles.",

      // FAIR compliance
      fairCompliance: "Conformité FAIR",
      fairNote: "Cette étude vise la conformité aux principes FAIR (Findable, Accessible, Interoperable, Reusable). Documentation complète disponible sur la page méthodologie.",

      // Footer
      footerNote: "Pour usage réflexif uniquement. Non destiné à la prise de décision clinique ou pastorale.",
    },

    // Dimensions
    dimensions: {
      religiosity: {
        label: "Intensité Spirituelle",
        description: "Centralité de la foi dans votre vie quotidienne (basée sur l'échelle CRS-5)",
        low: "Foi en questionnement ou pratique occasionnelle",
        high: "Foi structurante : prière quotidienne, réflexion théologique régulière, participation active aux offices",
        lowDetail: "Votre pratique spirituelle est peut-être en évolution ou plus intérieure. La centralité de la foi dans vos choix quotidiens reste modérée.",
        highDetail: "Votre foi occupe une place centrale dans votre vie. Prière, réflexion théologique et participation communautaire structurent votre quotidien.",
      },
      aiOpenness: {
        label: "Ouverture à l'IA",
        description: "Disposition à intégrer l'IA dans différentes sphères de vie, y compris spirituelle",
        low: "Réserve face à l'IA : usage limité ou résistance",
        high: "Intégration active de l'IA dans plusieurs domaines de vie",
        lowDetail: "Vous maintenez une distance prudente avec l'IA, que ce soit par choix réfléchi, méfiance technologique, ou simple désintérêt.",
        highDetail: "Vous avez intégré l'IA dans votre quotidien et êtes ouvert à explorer ses applications, y compris dans des contextes inattendus.",
      },
      sacredBoundary: {
        label: "Frontière Sacrée",
        description: "Conviction sur la nécessité d'une présence humaine incarnée pour la validité spirituelle",
        low: "Frontière perméable : l'IA peut accompagner tous les aspects de la vie spirituelle",
        high: "Frontière stricte : certains actes spirituels requièrent exclusivement une présence humaine",
        lowDetail: "Vous considérez que l'IA peut être un outil au service de la vie spirituelle dans tous ses aspects, sans que cela diminue l'authenticité de l'expérience.",
        highDetail: "Vous êtes convaincu(e) que la présence humaine incarnée est essentielle pour la validité de certains actes spirituels (sacrements, accompagnement, prédication). L'IA ne peut se substituer à cette dimension relationnelle et incarnée de la foi.",
      },
      ethicalConcern: {
        label: "Préoccupation Éthique",
        description: "Vigilance face aux risques de déshumanisation, paresse spirituelle et erreurs doctrinales",
        low: "Confiance dans la capacité humaine à bien utiliser l'IA",
        high: "Vigilance élevée face aux risques d'aliénation et de dérive",
        lowDetail: "Vous faites confiance à la capacité de discernement des croyants et des institutions pour intégrer l'IA de manière responsable.",
        highDetail: "Vous identifiez des risques sérieux : relations moins authentiques, moindre effort spirituel personnel, ou transmission d'erreurs doctrinales par des systèmes non supervisés.",
      },
      psychologicalPerception: {
        label: "Perception de l'IA",
        description: "Vision de la nature de l'IA et de son rapport à la spécificité humaine (Imago Dei)",
        low: "L'IA est un outil technique sans dimension existentielle",
        high: "L'IA soulève des questions profondes sur la conscience et la singularité humaine",
        lowDetail: "Pour vous, l'IA reste fondamentalement un outil : sophistiqué, utile, mais sans rapport avec les questions de conscience ou de dignité humaine.",
        highDetail: "L'IA vous interpelle sur ce qui fait la spécificité de l'être humain créé à l'image de Dieu. Peut-elle avoir une forme de conscience ? Menace-t-elle notre singularité ?",
      },
      communityContext: {
        label: "Contexte communautaire",
        description: "Position de votre communauté face à l'IA, telle que vous la percevez, et place du sujet dans vos échanges",
        low: "Communauté perçue comme réservée face à l'IA, sujet peu discuté",
        high: "Communauté perçue comme favorable à l'IA, sujet discuté",
        lowDetail: "Vous décrivez une communauté plutôt réservée face à l'IA, ou dans laquelle le sujet est peu abordé. Cette dimension décrit votre contexte, pas votre position personnelle.",
        highDetail: "Vous décrivez une communauté plutôt favorable à l'IA, dans laquelle le sujet est discuté. Cette dimension décrit votre contexte, pas votre position personnelle.",
      },
      futureOrientation: {
        label: "Orientation Future",
        description: "Intention d'approfondir votre engagement avec l'IA dans un contexte spirituel",
        low: "Stabilité : l'approche actuelle vous convient",
        high: "Curiosité active : désir d'explorer et de se former",
        lowDetail: "Votre rapport actuel à l'IA vous satisfait. Vous n'éprouvez pas le besoin particulier d'en savoir plus ou d'expérimenter davantage.",
        highDetail: "Vous êtes curieux(se) d'explorer les possibilités de l'IA dans un contexte religieux et souhaitez vous former pour mieux comprendre les enjeux.",
      },
    },

    // Email Collection
    // Methodology Page
    methodologyPage: {
      // Hero
      title: "Notre Méthodologie",
      subtitle: "Comprendre la science derrière vos résultats",
      heroDescription: "Cette étude indépendante combine des échelles adaptées et des construits exploratoires pour décrire les attitudes déclarées face à l'IA dans les contextes spirituels. Elle n'est adossée à aucune institution universitaire.",
      scrollToExplore: "Défiler pour explorer",

      // Badge
      badge: "Outil d'engagement • Recherche exploratoire",

      // Scientific Context
      scientificContextTitle: "Positionnement Scientifique",
      whatItIs: "Ce que cette étude est",
      whatItIsNot: "Ce qu'elle n'est pas",
      whatItIsPoints: [
        "Un outil d'engagement pour la réflexion personnelle",
        "Une recherche exploratoire sur des attitudes déclarées",
        "Une description des postures face à l'IA dans le champ spirituel",
        "Un point de départ pour le dialogue communautaire",
      ],
      whatItIsNotPoints: [
        "Un diagnostic psychologique ou spirituel",
        "Une échelle psychométrique validée",
        "Une enquête représentative d'une population",
        "Une catégorisation stable des personnes",
      ],

      // Échelles et items
      scalesTitle: "Échelles et items",
      scalesNote: "Aucun de ces instruments n'est administré dans une version validée. Les statuts ci-dessous indiquent précisément ce qui est repris et ce qui ne l'est pas.",
      statusAdapted: "adapté",
      statusAdHoc: "sélection ad hoc",
      statusInspired: "inspiré de",

      crs5Title: "CRS-5 : centralité de la religiosité",
      crs5Description: "Cinq items, un par sous-dimension de Huber & Huber (2012) : intellect, idéologie, pratique publique, pratique privée, expérience. Le score est la moyenne brute des cinq items, sans aucune correction. La traduction française employée ici n'est pas une version validée du CRS et le recodage des fréquences de prière suit celui des auteurs.",
      crs5Citation: "Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724.",
      crs5Items: [
        { name: "Intellect", desc: "Fréquence de réflexion sur des questions religieuses" },
        { name: "Idéologie", desc: "Croyance en l'existence de Dieu ou d'une réalité divine" },
        { name: "Pratique publique", desc: "Fréquence de participation aux offices" },
        { name: "Pratique privée", desc: "Fréquence de prière en dehors des offices" },
        { name: "Expérience", desc: "Fréquence du sentiment d'une intervention divine dans sa vie" },
      ],

      marloweCrowneTitle: "Marlowe-Crowne : désirabilité sociale",
      marloweCrowneDescription: "Cinq affirmations en vrai ou faux, choisies pour leur brièveté parmi celles de Crowne & Marlowe (1960). Ce n'est pas une forme courte validée : les formes validées sont celles de Reynolds (1982) et de Strahan & Gerbasi (1972), qui ne sont pas utilisées ici. Le résultat sert de covariable et n'ajuste aucun score.",
      marloweCrowneCitation: "Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.",
      marloweCrowneItems: [
        { name: "Item 1", desc: "Difficulté à continuer son travail sans encouragement" },
        { name: "Item 2", desc: "N'avoir jamais intensément détesté quelqu'un" },
        { name: "Item 3", desc: "Avoir parfois eu envie de se rebeller contre une autorité que l'on savait pourtant dans son droit" },
        { name: "Item 4", desc: "Être toujours courtois, même avec des personnes désagréables" },
        { name: "Item 5", desc: "Avoir déjà profité de quelqu'un" },
      ],

      godspeedTitle: "Godspeed : anthropomorphisme",
      godspeedDescription: "Deux items originaux, écrits pour cette enquête, dont la formulation s'appuie sur la dimension d'anthropomorphisme du questionnaire Godspeed (Bartneck et al., 2009). Le différenciateur sémantique original n'est pas administré et ces items n'héritent d'aucune de ses propriétés.",
      godspeedCitation: "Bartneck, C., Kulić, D., Croft, E., & Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. International Journal of Social Robotics, 1(1), 71-81.",
      godspeedItems: [
        { name: "Nature", desc: "Situer l'IA sur un continuum de la machine vers l'humain" },
        { name: "Conscience", desc: "Possibilité d'une forme de conscience artificielle" },
      ],

      aiasTitle: "AIAS : opacité algorithmique",
      aiasDescription: "Un item original sur la gêne face à un système dont on ne comprend pas le fonctionnement. Il reprend la thématique d'opacité de l'AI Anxiety Scale (Wang & Wang, 2022), qui n'est pas administrée. Cet item ne mesure pas l'anxiété face à l'IA au sens de cette échelle.",
      aiasCitation: "Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.",
      aiasItems: [
        { name: "Opacité", desc: "Gêne face à un système dont le fonctionnement échappe" },
      ],

      // 7 Dimensions
      dimensionsTitle: "Les 7 Dimensions",
      dimensionsDescription: "7 dimensions, un item par dimension : chaque question n'alimente qu'un seul score, aucune variable démographique n'entre dans un calcul, et les réponses « je ne sais pas » sont traitées comme manquantes. Échelle de 1 à 5.",
      clickToExplore: "Cliquez sur une dimension pour en savoir plus",

      dimensionReligiosity: "Centralité de la religiosité",
      dimensionReligiosityDesc: "Moyenne brute des 5 items du CRS-5 (adapté), sans correction",
      dimensionAiOpenness: "Ouverture à l'IA",
      dimensionAiOpennessDesc: "Fréquence, confort et contextes d'usage déclarés",
      dimensionSacredBoundary: "Frontière sacrée",
      dimensionSacredBoundaryDesc: "Actes spirituels que le répondant exclut d'une médiation par un outil génératif",
      dimensionEthicalConcern: "Préoccupation éthique",
      dimensionEthicalConcernDesc: "Utilité perçue, opacité des systèmes et rapport à l'image de Dieu",
      dimensionPsychPerception: "Perception de l'IA",
      dimensionPsychPerceptionDesc: "Nature attribuée à l'IA, conscience et anticipation de remplacement",
      dimensionCommunity: "Contexte communautaire",
      dimensionCommunityDesc: "Position officielle perçue, discussions et attitude des pairs, telles que déclarées",
      dimensionFuture: "Orientation future",
      dimensionFutureDesc: "Intention d'usage, souhait de formation et domaines d'intérêt déclarés",
      dimensionScaleNote: "Échelle de 1 (bas) à 5 (haut). Non calculée si trop peu d'items sont renseignés.",

      // 8 Profiles
      profilesTitle: "Les 8 profils",
      profilesDescription: "L'attribution du profil est heuristique : les plages idéales et les poids ont été fixés par jugement, puis ajustés contre une simulation, jamais dérivés d'une analyse de classification sur des données réelles. Les profils ne sont pas des construits validés.",
      profileHeuristicBadge: "Attribution heuristique",
      profileMotivationLabel: "Ce que décrivent les réponses",
      profileWatchpointLabel: "Point de vigilance",
      profileSubProfilesLabel: "Sous-profils",

      // Statistical Methods
      statsTitle: "Méthodes de calcul",
      weightedAverageTitle: "Moyenne pondérée",
      weightedAverageDesc: "Chaque dimension est la moyenne pondérée des items effectivement répondus. Les réponses « je ne sais pas » et « je préfère ne pas répondre » sont exclues et jamais remplacées par le milieu de l'échelle. En dessous du nombre minimal d'items, la dimension n'est pas calculée.",
      weightedAverageFormula: "value = Σ(score × poids) / Σ(poids), sinon null",

      empiricalRankTitle: "Rang empirique",
      empiricalRankDesc: "Votre score est situé sur la distribution réellement observée chez les participants, jamais sur une population de référence hypothétique. La comparaison n'apparaît qu'à partir de 30 participants et évolue au fil de la collecte.",
      empiricalRankFormula: "rang = min { i : score ≤ quantile_i },  affiché si N ≥ 30",

      profileMatchingTitle: "Attribution du profil",
      profileMatchingDesc: "Pour chaque dimension renseignée, on mesure l'écart absolu à la plage idéale du profil, on pondère et on renormalise sur les seules dimensions disponibles. Cette distance est convertie en score, puis des bonus liés à certains patrons de réponses sont ajoutés dans l'espace des scores. Il ne s'agit pas d'une distance euclidienne. En dessous de 4 dimensions renseignées, aucun profil n'est attribué.",
      profileMatchingFormula: "d = Σ(écart à la plage × poids) / Σ(poids)   puis   score = 100 × exp(−0,5 × d)",

      desirabilityTitle: "Désirabilité sociale",
      desirabilityDesc: "Les cinq affirmations en vrai ou faux servent uniquement de covariable. Aucun score n'est ajusté, aucun répondant n'est exclu : le drapeau sert à vérifier, après coup, que les résultats ne changent pas quand on écarte les réponses très consensuelles.",
      desirabilityFormula: "drapeau = (items répondus ≥ 4) et (part endossée ≥ 0,8)",

      distributionTitle: "Distribution observée",
      distributionCaption: "Le rang est lu sur la distribution des participants réels, recalculée à chaque nouvelle réponse.",

      // Transparency
      transparencyTitle: "Transparence Méthodologique",
      tradeoffsTitle: "Compromis Engagement vs Rigueur",
      tradeoffs: [
        { aspect: "Longueur du questionnaire", engagement: "Court (8 à 12 min)", rigor: "Long (30 min et plus)" },
        { aspect: "Instruments", engagement: "Échelles adaptées et items originaux", rigor: "Échelles administrées intégralement" },
        { aspect: "Objectif", engagement: "Réflexion personnelle", rigor: "Mesure psychométrique" },
        { aspect: "Échantillon", engagement: "Convenance et boule de neige", rigor: "Tirage aléatoire" },
      ],

      limitationsTitle: "Limites connues",
      limitations: [
        "Échantillon auto-sélectionné : le sujet est annoncé, les personnes indifférentes répondent moins",
        "Recrutement par partage : les répondants recrutent leur propre réseau, les observations ne sont pas indépendantes",
        "6 des 7 dimensions reposent sur des construits exploratoires, sans analyse factorielle",
        "5 items de désirabilité sociale : signal grossier, fidélité faible",
        "Traductions non validées pour le CRS-5 et les items inspirés du Godspeed et de l'AIAS",
        "Clergé et laïcs ne répondent pas aux mêmes items : les comparaisons portent sur un noyau commun",
        "Enquête transversale : aucun sens de causalité n'est identifiable",
        "Les résultats agrégés sont visibles pendant la collecte et peuvent influencer les répondants suivants",
      ],

      suitableFor: "Cette enquête convient pour...",
      suitableForPoints: [
        "La réflexion personnelle et le dialogue communautaire",
        "L'exploration des attitudes et tendances",
        "Le point de départ d'une recherche plus approfondie",
      ],

      notSuitableFor: "Nécessiterait des améliorations pour...",
      notSuitableForPoints: [
        "Publication académique peer-reviewed",
        "Prise de décision clinique ou pastorale",
        "Comparaisons interculturelles rigoureuses",
      ],

      // Confessional Structure
      confessionalTitle: "Structure confessionnelle",
      confessionalDesc: "Le questionnaire distingue les grandes traditions chrétiennes, puis un courant à l'intérieur de chacune, pour permettre des comparaisons entre groupes tout en préservant l'anonymat.",
      catholic: "Catholique",
      catholicSub: ["Paroissial classique", "Charismatique", "Traditionaliste"],
      protestant: "Protestant",
      protestantSub: [
        "Protestantisme historique",
        "Évangélique non charismatique",
        "Évangélique charismatique ou pentecôtiste",
      ],
      orthodox: "Orthodoxe",
      orthodoxSub: ["Byzantin (grec, russe, roumain, serbe...)", "Oriental (copte, arménien, syriaque, éthiopien...)"],
      anglican: "Anglican",
      anglicanSub: [],
      otherChristian: "Autre chrétien",
      otherChristianSub: ["Adventiste", "Quaker", "Vieux-catholique", "Non-dénominationnel", "Autre"],
      confessionalNote: "Aucune part de population n'est associée à ces branches : les effectifs observés décrivent les répondants, pas la démographie confessionnelle francophone. Répondre « Sans religion / Autre » met fin au questionnaire.",

      // Research Hypotheses
      hypothesesTitle: "Hypothèses de recherche",
      hypothesesDesc: "Huit hypothèses directionnelles, formulées avant la collecte. Seuil α = 0,05, correction de Holm à l'intérieur de chaque famille de tests. Aucune n'est testée tant que l'effectif reste insuffisant.",
      hypotheses: [
        { id: "H1", text: "Une centralité religieuse plus élevée irait de pair avec une frontière sacrée plus stricte" },
        { id: "H2", text: "Les répondants charismatiques et évangéliques présenteraient une ouverture à l'IA distincte de celle de leurs coreligionnaires non charismatiques" },
        { id: "H3", text: "Les répondants plus jeunes présenteraient une ouverture à l'IA plus grande, indépendamment de leur niveau de religiosité" },
        { id: "H4", text: "Une orientation théologique conservatrice irait de pair avec une frontière sacrée plus stricte" },
        { id: "H5", text: "Le clergé présenterait une frontière sacrée de noyau commun plus stricte que les laïcs" },
        { id: "H6", text: "La position officielle perçue de la communauté irait de pair avec l'ouverture individuelle à l'IA" },
        { id: "H7", text: "Une formation théologique formelle irait de pair avec une préoccupation éthique plus articulée, et moins extrême" },
        { id: "H8", text: "Un usage quotidien de l'IA irait de pair avec une préoccupation éthique plus faible" },
      ],
      statusToVerify: "À tester après la collecte",

      // Comment lire une corrélation
      correlationTitle: "Comment lire une corrélation",
      correlationDesc: "Une corrélation est un fait, son explication est une hypothèse. Chaque association est donc accompagnée d'au moins une explication concurrente et d'une note de certitude, qui croise la solidité statistique (effectif, taille d'effet, précision de l'intervalle, seuil franchi après correction) et la plausibilité du mécanisme invoqué.",
      correlationGrades: [
        { grade: "A", label: "Association nette, mécanisme plausible", desc: "Reste une hypothèse : l'enquête est transversale." },
        { grade: "B", label: "Association crédible", desc: "Mécanisme discutable, ou variables de confusion non contrôlées." },
        { grade: "C", label: "Signal faible", desc: "Effectif limité ou interprétation fragile." },
        { grade: "D", label: "Non concluant", desc: "Rien ne peut être conclu de cette association." },
      ],
      correlationNote: "Si deux mesures partagent un item, l'explication la mieux notée est le recouvrement des mesures, pas un lien entre deux phénomènes. Le mot « prouve » n'est employé nulle part.",

      // Citations
      citationsTitle: "Références",
      citations: [
        "Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724.",
        "Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.",
        "Reynolds, W. M. (1982). Development of reliable and valid short forms of the Marlowe-Crowne Social Desirability Scale. Journal of Clinical Psychology, 38(1), 119-125.",
        "Strahan, R., & Gerbasi, K. C. (1972). Short, homogeneous versions of the Marlowe-Crowne Social Desirability Scale. Journal of Clinical Psychology, 28(2), 191-193.",
        "Bartneck, C., Kulić, D., Croft, E., & Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. International Journal of Social Robotics, 1(1), 71-81.",
        "Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.",
        "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2e éd.). Lawrence Erlbaum Associates.",
      ],

      // Navigation
      backToSurvey: "Retour au sondage",
      backToResults: "Retour aux résultats",
    },
  },

  en: {
    // Survey Intro
    intro: {
      badge: "Major Survey 2026",
      badgeText: "AI & Christian Faith",
      title: "Artificial Intelligence & Spiritual Life",
      title1: "Artificial Intelligence",
      title2: "Spiritual Life",
      subtitle: "How is AI transforming religious practices?",
      description:
        "From sermon writing to AI-assisted prayer, AI is silently transforming religious practices. This major survey aims to map these uses and understand the ethical issues they raise.",
      privacyTitle: "Privacy Protocol",
      privacyDescription:
        "Your participation is essential for research. We guarantee the protection of your rights:",
      anonymity: "Complete anonymity:",
      anonymityDesc:
        "No name, email or IP address is stored in the clear: only keyed cryptographic hashes used to prevent duplicate submissions.",
      academic: "Data usage:",
      academicDesc:
        "Responses are aggregated solely for statistical purposes.",
      cta: "I agree and start",
      startButton: "Start the survey",
      learnMore: "Learn more",
      time: "Estimated time: 8 to 12 minutes",
      consent:
        "By clicking \"I agree\", you consent to participate in this study in compliance with GDPR.",
      faqLink: "View FAQ",
      skipVideo: "Skip",
      videoNotSupported: "Your browser does not support video.",
      featureScientific: "Scientific methodology",
      featureAnonymous: "100% anonymous",
      featureDuration: "8 to 12 minutes",
      anonymousHighlight: "100% anonymous",
      anonymousHighlightDesc: "No name, email, or IP address is stored in the clear: only cryptographic anti-duplicate fingerprints are kept.",
    },

    // CNEF co-branded landing
    cnef: {
      partnership: "Survey offered by Romain Girardi in partnership with the CNEF",
      badge: "CNEF partnership",
      logoAlt: "CNEF logo",
      title: "AI and faith: the evangelical voice",
      subtitle: "What is your actual use of artificial intelligence in church life?",
      description:
        "The CNEF is preparing a statement on artificial intelligence. To ground it in real figures, this survey gathers the practices of French evangelicals. Your answers, 100% anonymous, will directly inform this reflection.",
      startButton: "Start the survey",
    },

    // Survey Questions
    survey: {
      questionOf: "Question {current} of {total}",
      previous: "Previous",
      continue: "Continue",
      selections: "{count} selection",
      selectionsPlural: "{count} selections",
      selectValue: "Select a value",
      scaleFrom: "Scale from 1 ({min}) to 5 ({max})",
      textPlaceholder: "Write your answer here...",
      optionalQuestion: "This question is optional",
      submitting: "Saving your responses...",
      exclusiveConflictNotice:
        "A \"none\" answer cannot be combined with other choices. Please fix your selection to continue.",
    },

    // Screen-out confirmation (outside the studied population)
    screenedOut: {
      confirmTitle: "Confirm your answer",
      confirmDescription:
        "You indicated that you do not identify with a Christian denomination. This questionnaire is addressed to Christians; confirm to finish, or go back to correct your answer.",
      back: "Go back",
      confirm: "Confirm and finish",
    },

    // Feedback Screen
    feedback: {
      badge: "Your personalized profile",
      title: "Discover your results",
      yourStrength: "Your strength",
      yourChallenge: "Your challenge",
      religiosity: "Religiosity (CRS-5)",
      huberScale: "Huber Scale",
      aiAdoption: "AI Adoption",
      usageLevel: "Usage level",
      insightsTitle: "Personalized insights",
      viewGlobalResults: "View global results",
      disclaimer:
        "This profile is generated from your responses for illustrative purposes. It does not constitute a psychological or spiritual assessment.",
      match: "Match",
      matchScore: "match {score} / 100",
      profileSpectrum: "Your Profile Spectrum",
      sevenDimensions: "Your 7 Dimensions",
      reflectionAreas: "Points to reflect on, if you wish",
      tensionPoint: "Observed tension",
      notMeasured: "Not measured (too few answers)",
      notMeasuredDetail:
        "Too few items of this dimension were answered to compute a score.",
      heuristicAttribution:
        "Heuristic attribution, not validated: the profile below is an indicative reading of your answers, not a diagnosis.",
      noProfileTitle: "No profile can be attributed: too few dimensions measured",
      noProfileDescription:
        "At least four dimensions must be measured before your answers can be matched to a profile. Your raw dimension scores are still shown below.",
      measuredDimensions: "Dimensions measured: {count} out of 7",
      closeProfilesTitle: "Two close profiles",
      closeProfilesDescription:
        "Your answers sit at a comparable distance from two profiles. Neither one wins; both are shown together.",
      normsComparison: "Your score is higher than {percent}% of the {count} participants",
      normsUnavailable: "Comparison available from 30 participants onwards",
      usageGap: "Usage gap",
      usageGapNote:
        "Comparison between the AI use you report in general and the use you report in the spiritual or ministry domain.",
      usageGapNoUse: "No AI use reported",
      usageGapGeneralOnly: "General use reported, no spiritual use reported",
      usageGapBoth: "Use reported in both domains",
      usageGapUnknown: "Gap cannot be computed: the general-use question was left unanswered",
      socialDesirabilityNote:
        "Your answers to the five true/false statements suggest a tendency to answer in a socially expected way; your profile is computed without correction and should be read with that reservation in mind.",
    },

    // Profile names
    profiles: {
      gardien_tradition: "Tradition Guardian",
      prudent_eclaire: "Enlightened Cautious",
      innovateur_ancre: "Anchored Innovator",
      equilibriste: "Spiritual Balancer",
      pragmatique_moderne: "Modern Pragmatist",
      pionnier_spirituel: "Spiritual Pioneer",
      progressiste_critique: "Critical Progressive",
      explorateur: "Explorer",
      // Sub-profiles
      protecteur_sacre: "The Sacred Protector",
      sage_prudent: "The Prudent Sage",
      berger_communautaire: "The Community Shepherd",
      analyste_spirituel: "The Spiritual Analyst",
      discerneur_pastoral: "The Pastoral Discerner",
      observateur_engage: "The Engaged Observer",
      pont_generationnel: "The Generational Bridge",
      evangeliste_digital: "The Digital Evangelist",
      theologien_techno: "The Techno Theologian",
      mediateur: "The Mediator",
      chercheur_sens: "The Meaning Seeker",
      adaptateur_prudent: "The Prudent Adapter",
      efficace_engage: "The Engaged Efficient",
      communicateur_digital: "The Digital Communicator",
      optimisateur_pastoral: "The Pastoral Optimizer",
      visionnaire: "The Visionary",
      experimentateur: "The Experimenter",
      prophete_digital: "The Digital Prophet",
      ethicien: "The Ethicist",
      reformateur_social: "The Social Reformer",
      philosophe_spirituel: "The Spiritual Philosopher",
      curieux_spirituel: "The Spiritual Curious",
      novice_technologique: "The Tech Novice",
      chercheur_seculier: "The Secular Seeker",
    },

    // Reflection areas: observed gaps, described without prescription
    growthAreas: {
      exploration_tech: "Reported use and intended use",
      exploration_tech_action: "Your answers indicate a low current use and a higher intended use.",
      community_dialogue: "How present the topic is in your community",
      community_dialogue_action: "Your answers indicate a high religious centrality and a community context where the topic is rarely present.",
      ethical_reflection: "Reported use and ethical concern",
      ethical_reflection_action: "Your answers indicate a frequent use of AI and a low ethical concern.",
      guided_experimentation: "Sacred boundary and reported use",
      guided_experimentation_action: "Your answers indicate a high sacred boundary and a frequent use of AI outside the spiritual domain.",
      openness_change: "Following the topic",
      openness_change_action: "Your answers indicate little reported exposure to discussions about AI in the religious field.",
    },

    // Tensions: two dimensions read together, no value judgement
    tensions: {
      tension_ai_sacred: "Your answers combine a reported use of AI and a high boundary around spiritual acts.",
      tension_ethical_future: "Your answers combine a high ethical concern and a high intended use.",
      tension_community_faith: "Your answers combine a high religious centrality and a community context with little traction on this topic.",
      tension_perception_ethics: "Your answers combine an anthropomorphic perception of AI and a low ethical concern.",
    },

    // Thank You Screen
    thanks: {
      title: "Thank you for your participation",
      description:
        "Your contribution is valuable in advancing research on digital transformations of spiritual life.",
      community: "Join our community of participants",
      contributed: "people have contributed to this study",
      viewResults: "View results",
      share: "Share",
      profileAvailable: "Your personalized profile is available",
      resultsNote:
        "The results presented are anonymized and aggregated trends. No individual data is accessible.",
      shareText:
        "I participated in this study on AI in religious practices. Join in!",
      linkCopied: "Link copied to clipboard!",
      shareTitle: "AI & Spiritual Life Survey",
      anonymousIdTitle: "Your anonymous ID",
      anonymousIdNote: "Keep this ID safe and don't share it: on its own, it grants access to your data and lets anyone delete it.",
      manageData: "Manage my data →",
      debrief: "The five true-or-false statements in the questionnaire measured social desirability, that is, the tendency to present oneself favourably. They are only used to control for that bias in the analysis and are not part of your profile.",
      screenedOutTitle: "Thank you for your interest",
      screenedOutDescription: "This survey looks at the practices of people who belong to a Christian tradition. Your answer has been recorded and the questionnaire ends here. Thank you for the time you gave it.",
    },

    // FAQ
    faq: {
      title: "Frequently Asked Questions",
      backToSurvey: "Back to survey",
      subtitle: "Everything you need to know about this study",
      searchPlaceholder: "Search...",
      noResults: "No questions match your search.",
    },

    // Footer
    footer: {
      tagline: "Major survey on AI and spiritual life",
      createdBy: "Created by",
    },

    // Dashboard
    dashboard: {
      title: "Study Results",
      subtitle: "Aggregated and anonymized data",
      participants: "participants",
      religiousProfile: "Religious Profile",
      aiUsage: "AI Usage",
      spiritualAI: "AI & Spirituality",
      demographics: "Demographics",
      loading: "Analyzing data...",
      loadErrorTitle: "Unable to load results",
      loadErrorDesc: "An error occurred while loading the results. Please try again.",
      visualization: "Data Visualization",
      exploreInsights: "Explore trends and insights from our participant community",
      questionsAnalyzed: "Questions analyzed",
      simulated: "Simulated",
      demoData: "Demo data",
      responses: "responses",
      majority: "majority",
      restartSurvey: "Restart survey",
      thankYouFooter: "Thank you for your contribution to this study.",
      all: "All",
      profile: "Profile",
      religiosity: "Religiosity",
      usage: "AI Usage",
      theology: "Theology",
      psychology: "Psychology",
      analyzingData: "Analyzing data",
      preparingViz: "Preparing visualizations...",
      realTimeResults: "Real-time results",
      dashboardTitle: "Dashboard",
      exploreDescription: "Explore trends and discover insights from our community",
      responsesCollected: "responses collected",
      catholics: "Catholics",
      majorityDenomination: "majority denomination",
      aiUsers: "AI Users",
      useAIRegularly: "use AI regularly",
      averageScore: "Average score",
      crs5Religiosity: "CRS-5 religiosity",
      keyInsight: "Key insight",
      insightTitle: "42% of practicing Christians already use AI in their daily lives",
      insightTitleDynamic: "{percent}% of participants already use AI in their daily lives",
      insightDescription: "But only 12% have used it in a spiritual context. This tension reveals a specific resistance in the religious domain.",
      insightDescriptionDynamic: "Only {percent}% say they use it in a spiritual context, highlighting a unique tension in religious settings.",
      exploreData: "Explore data",
      studyConductedBy: "Study conducted by Romain Girardi",
      lastUpdated: "Last updated {date}",
    },

    // Sharing
    sharing: {
      title: "Share this survey",
      scanQR: "Scan this QR code",
      orCopyLink: "Or copy the link",
      copyLink: "Copy link",
      copied: "Copied!",
      download: "Download",
      share: "Share",
      shareTitle: "AI & Faith Survey",
      shareDescription: "Participate in this study on AI and spiritual life",
    },

    profileShare: {
      title: "Share my profile",
      subtitle: "Your friends will love discovering theirs",
      whatsapp: "Share on WhatsApp",
      copyLink: "Copy link",
      copied: "Copied!",
      shareOnX: "Share on X",
      shareOnFacebook: "Share on Facebook",
    },

    // PDF
    pdf: {
      download: "Download my PDF report",
      generating: "Generating...",
      preparing: "Preparing...",
    },

    // Session
    session: {
      resumeTitle: "Resume where you left off?",
      resumeDescription: "We found an incomplete session. Would you like to resume?",
      resumeButton: "Resume",
      restartButton: "Start over",
      saving: "Saving...",
      saved: "Progress saved",
      leaveWarning: "Your progress will be lost if you leave now.",
    },

    // Errors
    errors: {
      generic: "An error occurred",
      network: "Connection error. Please check your internet connection.",
      validation: "Invalid data",
      notFound: "Page not found",
      retry: "Retry",
      goHome: "Go home",
      title: "Oops! An error occurred",
      description: "We're experiencing a technical issue. Our team has been notified.",
      errorCode: "Error code",
      // Duplicate submission errors
      alreadySubmitted: "You have already participated",
      alreadySubmittedDesc: "Our records indicate that you have already completed this survey.",
      alreadySubmittedHelp: "If you believe this is an error (e.g., shared computer), please contact us.",
      ipLimitExceeded: "Participation limit reached",
      ipLimitExceededDesc: "Too many submissions have been recorded from this network.",
      contactUs: "Contact us",
      contactEmail: "contact@ia-foi.fr",
      legitimateUser: "I am a legitimate user",
      legitimateUserDesc: "If you share a computer or network with other participants, contact us with your situation and we can help.",
      // Solutions for blocked users
      solutionsTitle: "Possible solutions",
      solution1Title: "Use a different device",
      solution1Desc: "Try from your phone, tablet, or another computer.",
      solution2Title: "Use a different browser",
      solution2Desc: "Try with Chrome, Firefox, Safari, or Edge if you haven't already participated.",
      cookieBlockTitle: "Local browser block",
      cookieBlockDesc: "This browser already contains a prior participation marker (security cookie).",
      cookieSolution1Title: "Use a private window",
      cookieSolution1Desc: "Open the survey in private/incognito mode.",
      cookieSolution2Title: "Clear site data",
      cookieSolution2Desc: "Delete cookies and local storage for ia-foi.fr, then reload the page.",
      solution3Title: "Shared computer?",
      solution3Desc: "If someone else already participated from this device, contact us to get access.",
      stillNeedHelp: "Still blocked? We can help.",
      emailSubject: "Survey Access Request",
      emailBody: "Hello,\n\nI am trying to access the survey but received an error ({errorCode}).\n\nMy situation:\n\nThank you.",
      // Network failure during final submission (data must not be silently lost)
      submissionFailedTitle: "Submission failed",
      submissionFailedDesc: "Your answers could not be saved because of a connection problem. They're still available on this device: please retry as soon as possible.",
    },

    // Not Found (404)
    notFound: {
      title: "Page not found",
      description: "The page you are looking for does not exist or has been moved.",
      home: "Home",
      back: "Back",
    },

    // Email Hash Verification
    emailHash: {
      title: "Unique Verification",
      subtitle: "To ensure scientific integrity, we verify that each participant responds only once.",
      emailLabel: "Your email address",
      emailPlaceholder: "example@email.com",
      yourHash: "Your unique code (cryptographic fingerprint)",
      hashExplanation: "This code is generated from your email. Your actual email is never stored or transmitted.",
      privacyTitle: "Data Protection",
      privacy1: "Only the cryptographic fingerprint is stored (not your email)",
      privacy2: "Impossible to recover your email from the code",
      privacy3: "No commercial solicitation possible",
      sendPdfLabel: "Receive my personalized results by email",
      sendPdfNote: "Your email will be used only to send the PDF, then immediately deleted (not stored).",
      continueButton: "Verify and continue",
      verifying: "Verifying...",
      footerNote: "This verification ensures unique responses while preserving your anonymity.",
      invalidEmail: "Please enter a valid email address",
      verificationFailed: "Verification failed. Please try again.",
      networkError: "Connection error. Check your internet connection.",
      alreadyUsed: "This email address has already been used to complete the survey.",
    },

    // Consent
    consent: {
      checkbox: "I am 18 or older, I accept the participation conditions and privacy policy, and I explicitly consent to the processing of my answers revealing my religious beliefs for the purposes of this academic research (GDPR Art. 9(2)(a)).",
      checkboxCnef: "I am 18 or older, I accept the participation conditions and privacy policy, and I explicitly consent to the processing of my answers revealing my religious beliefs for the purposes of this academic research (GDPR Art. 9(2)(a)), as well as to their use in aggregated, anonymous form by the CNEF, partner of this survey.",
      details: "Anonymised answers will be published as an open dataset for research and replication purposes. You can withdraw your participation and have your data deleted at any time from the \"My data\" page.",
      minimumAge: "Participation is restricted to adults (18 or older).",
      required: "Your consent is required to participate",
      privacyLink: "Privacy policy",
      termsLink: "Terms of use",
    },

    // Profiles Modal
    profilesModal: {
      title: "The 8 Profiles",
      subtitle: "Discover the different stances towards AI and faith",
      viewAll: "View all profiles",
      close: "Close",
      yourProfile: "Your profile",
      coreMotivation: "Core motivation",
      primaryFear: "Primary concern",
      subProfiles: "Sub-profiles",
      // Profile explanations
      gardien_tradition: {
        title: "Tradition Guardian",
        short: "Protector of authentic spiritual practices",
        description: "You are a pillar of tradition, convinced that spiritual practices have endured through the ages for good reasons. AI represents a technology that, if misused, could erode the authenticity of spiritual life.",
      },
      prudent_eclaire: {
        title: "Enlightened Prudent",
        short: "Balanced discernment between tradition and innovation",
        description: "You represent the path of discernment. Attached to traditional values, you are not closed to progress but require that each novelty prove its value before adopting it.",
      },
      innovateur_ancre: {
        title: "Anchored Innovator",
        short: "Rare alliance between deep tradition and technological adoption",
        description: "You are a rare profile: deeply rooted in tradition, you see technology not as a threat but as a tool in service of the spiritual mission.",
      },
      equilibriste: {
        title: "Spiritual Balancer",
        short: "Constant search for the middle ground",
        description: "You embody the middle way, always seeking balance between extremes. Neither unconditional enthusiast nor fierce opponent, you weigh each decision.",
      },
      pragmatique_moderne: {
        title: "Modern Pragmatist",
        short: "Efficiency in service of the mission",
        description: "You are results-oriented. For you, AI is primarily a practical tool that can free up time for what really matters: human relationships.",
      },
      pionnier_spirituel: {
        title: "Spiritual Pioneer",
        short: "Explorer of new faith-technology frontiers",
        description: "You are at the forefront, enthusiastically exploring unknown territories where spirituality and artificial intelligence meet.",
      },
      progressiste_critique: {
        title: "Critical Progressive",
        short: "Openness to change with ethical vigilance",
        description: "You are open to progress and change, but your critical mind remains constantly alert. Technological enthusiasm must be tempered by ethical reflection.",
      },
      explorateur: {
        title: "Explorer",
        short: "On the path, forming convictions",
        description: "You are in an exploration phase, both in your faith and in your relationship with technology. This position is not a weakness but an openness.",
      },
    },

    // Results Explanation
    resultsExplain: {
      title: "Understanding your results",
      intro: "Your results are based on the analysis of your responses across 7 key dimensions that define your relationship with AI in a spiritual context. Each dimension is measured on a scale of 1 to 5.",
      dimensionsTitle: "The 7 dimensions",
      religiosity: "Faith centrality (CRS-5): daily spiritual practice",
      aiOpenness: "General willingness to integrate AI into different spheres of life",
      sacredBoundary: "Conviction about the necessity of human presence for certain spiritual acts",
      ethicalConcern: "Vigilance towards risks of dehumanization and doctrinal errors",
      psychologicalPerception: "Questions about AI's nature and human uniqueness (Imago Dei)",
      communityContext: "Your community's stance toward AI, as you perceive it",
      futureOrientation: "Intention to deepen your engagement with AI",
      matchExplain: "The score out of 100 measures how close your answers are to the typical profile ranges. Attribution is heuristic: ranges were set by judgement, not derived from data.",
      disclaimer: "These profiles are reflection tools, not rigid categories. You can evolve and exhibit characteristics of multiple profiles.",
      balancedPosition: "Balanced position (neither high nor low) on this dimension",
    },

    // Methodology
    methodology: {
      title: "Methodological note",
      description: "This survey uses an adapted version of the CRS-5 and, for everything else, original items inspired by published instruments that are not themselves administered here. It is intended for self-reflection and exploratory analysis, never for definitive categorization.",
      learnMore: "Learn more about methodology",
    },

    // Scientific disclaimer for FAIR compliance
    scientificDisclaimer: {
      title: "Scientific Disclaimer",
      exploratoryStudy: "Exploratory Study",
      exploratoryNote: "This study is exploratory. The profile is a heuristic attribution: its ranges and weights were expert-set, never derived from an analysis of real data.",

      // Profile interpretation warning
      profileWarning: "This profile reflects your responses, not your identity",
      profileNote: "The results are indicative and invite reflection. They do not constitute a diagnosis or definitive categorization of your spirituality.",

      // Scale validation notice
      scaleNotice: "Exploratory constructs",
      scaleNote: "6 of the 7 dimensions rest on exploratory constructs, not validated by factor analysis. Religiosity uses the CRS-5 in an adapted form, whose French translation is not a validated version.",

      // Comparison caveat
      comparisonCaveat: "Empirical comparisons",
      comparisonNote: "Your score is placed on the distribution of actual participants, from 30 participants onwards. There is no reference population.",

      // Social desirability
      desirabilityNote: "Social desirability",
      desirabilityExplanation: "The five true-or-false statements serve as a covariate for analysis. None of your scores is adjusted from them.",

      // FAIR compliance
      fairCompliance: "FAIR Compliance",
      fairNote: "This study aims for FAIR (Findable, Accessible, Interoperable, Reusable) compliance. Full documentation available on the methodology page.",

      // Footer
      footerNote: "For reflective use only. Not intended for clinical or pastoral decision-making.",
    },

    // Dimensions
    dimensions: {
      religiosity: {
        label: "Spiritual Intensity",
        description: "Centrality of faith in your daily life (based on the CRS-5 scale)",
        low: "Faith in questioning or occasional practice",
        high: "Structuring faith: daily prayer, regular theological reflection, active participation in services",
        lowDetail: "Your spiritual practice may be evolving or more interior. The centrality of faith in your daily choices remains moderate.",
        highDetail: "Your faith holds a central place in your life. Prayer, theological reflection, and community participation structure your daily life.",
      },
      aiOpenness: {
        label: "AI Openness",
        description: "Willingness to integrate AI into different spheres of life, including spiritual",
        low: "Reserve towards AI: limited use or resistance",
        high: "Active integration of AI across multiple life domains",
        lowDetail: "You maintain a cautious distance from AI, whether by deliberate choice, technological distrust, or simple disinterest.",
        highDetail: "You have integrated AI into your daily life and are open to exploring its applications, including in unexpected contexts.",
      },
      sacredBoundary: {
        label: "Sacred Boundary",
        description: "Conviction about the necessity of embodied human presence for spiritual validity",
        low: "Permeable boundary: AI can accompany all aspects of spiritual life",
        high: "Strict boundary: certain spiritual acts exclusively require human presence",
        lowDetail: "You consider that AI can be a tool serving spiritual life in all its aspects, without diminishing the authenticity of the experience.",
        highDetail: "You are convinced that embodied human presence is essential for the validity of certain spiritual acts (sacraments, spiritual direction, preaching). AI cannot substitute for this relational and incarnate dimension of faith.",
      },
      ethicalConcern: {
        label: "Ethical Concern",
        description: "Vigilance towards risks of dehumanization, spiritual laziness, and doctrinal errors",
        low: "Trust in human capacity to use AI well",
        high: "High vigilance towards risks of alienation and drift",
        lowDetail: "You trust the discernment capacity of believers and institutions to integrate AI responsibly.",
        highDetail: "You identify serious risks: less authentic relationships, reduced personal spiritual effort, or transmission of doctrinal errors by unsupervised systems.",
      },
      psychologicalPerception: {
        label: "AI Perception",
        description: "View of AI's nature and its relation to human uniqueness (Imago Dei)",
        low: "AI is a technical tool without existential dimension",
        high: "AI raises deep questions about consciousness and human singularity",
        lowDetail: "For you, AI remains fundamentally a tool: sophisticated, useful, but unrelated to questions of consciousness or human dignity.",
        highDetail: "AI challenges you on what makes human beings unique as created in God's image. Can it have a form of consciousness? Does it threaten our singularity?",
      },
      communityContext: {
        label: "Community context",
        description: "Your community's stance toward AI as you perceive it, and how present the topic is in your exchanges",
        low: "Community perceived as reserved toward AI, topic rarely discussed",
        high: "Community perceived as favourable to AI, topic discussed",
        lowDetail: "You describe a community that is rather reserved toward AI, or where the topic is rarely raised. This dimension describes your context, not your personal position.",
        highDetail: "You describe a community that is rather favourable to AI, where the topic is discussed. This dimension describes your context, not your personal position.",
      },
      futureOrientation: {
        label: "Future Orientation",
        description: "Intention to deepen your engagement with AI in a spiritual context",
        low: "Stability: current approach suits you",
        high: "Active curiosity: desire to explore and train",
        lowDetail: "Your current relationship with AI satisfies you. You don't feel a particular need to learn more or experiment further.",
        highDetail: "You are curious to explore the possibilities of AI in a religious context and wish to train yourself to better understand the issues at stake.",
      },
    },

    // Email Collection
    // Methodology Page
    methodologyPage: {
      // Hero
      title: "Our Methodology",
      subtitle: "Understanding the science behind your results",
      heroDescription: "This independent study combines adapted scales and exploratory constructs to describe self-reported attitudes toward AI in spiritual contexts. It is not affiliated with any university.",
      scrollToExplore: "Scroll to explore",

      // Badge
      badge: "Engagement Tool • Exploratory Research",

      // Scientific Context
      scientificContextTitle: "Scientific Positioning",
      whatItIs: "What this study is",
      whatItIsNot: "What it is not",
      whatItIsPoints: [
        "An engagement tool for personal reflection",
        "Exploratory research on self-reported attitudes",
        "A description of stances toward AI in the spiritual domain",
        "A starting point for community dialogue",
      ],
      whatItIsNotPoints: [
        "A psychological or spiritual diagnosis",
        "A validated psychometric scale",
        "A survey representative of any population",
        "A stable categorization of people",
      ],

      // Scales and items
      scalesTitle: "Scales and items",
      scalesNote: "None of these instruments is administered in a validated version. The statuses below state precisely what is reused and what is not.",
      statusAdapted: "adapted",
      statusAdHoc: "ad hoc selection",
      statusInspired: "inspired by",

      crs5Title: "CRS-5: centrality of religiosity",
      crs5Description: "Five items, one per Huber & Huber (2012) sub-dimension: intellect, ideology, public practice, private practice, experience. The score is the raw mean of the five items, with no correction. The French translation used here is not a validated version of the CRS, and the prayer-frequency recoding follows the authors'.",
      crs5Citation: "Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724.",
      crs5Items: [
        { name: "Intellect", desc: "How often the respondent thinks about religious issues" },
        { name: "Ideology", desc: "Belief in the existence of God or a divine reality" },
        { name: "Public practice", desc: "How often the respondent takes part in religious services" },
        { name: "Private practice", desc: "How often the respondent prays outside services" },
        { name: "Experience", desc: "How often the respondent feels a divine intervention in their life" },
      ],

      marloweCrowneTitle: "Marlowe-Crowne: social desirability",
      marloweCrowneDescription: "Five true-or-false statements, picked for brevity from Crowne & Marlowe (1960). This is not a validated short form: the validated short forms are those of Reynolds (1982) and Strahan & Gerbasi (1972), neither of which is used here. The result is a covariate and adjusts no score.",
      marloweCrowneCitation: "Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.",
      marloweCrowneItems: [
        { name: "Item 1", desc: "Finding it hard to keep working without encouragement" },
        { name: "Item 2", desc: "Having never intensely disliked anyone" },
        { name: "Item 3", desc: "Having sometimes wanted to rebel against people in authority even when they were right" },
        { name: "Item 4", desc: "Always being courteous, even with unpleasant people" },
        { name: "Item 5", desc: "Having taken advantage of someone" },
      ],

      godspeedTitle: "Godspeed: anthropomorphism",
      godspeedDescription: "Two original items, written for this survey, whose wording draws on the anthropomorphism dimension of the Godspeed questionnaire (Bartneck et al., 2009). The original semantic differential is not administered and these items inherit none of its properties.",
      godspeedCitation: "Bartneck, C., Kulić, D., Croft, E., & Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. International Journal of Social Robotics, 1(1), 71-81.",
      godspeedItems: [
        { name: "Nature", desc: "Placing AI on a machine-to-human continuum" },
        { name: "Consciousness", desc: "Possibility of some form of artificial consciousness" },
      ],

      aiasTitle: "AIAS: algorithmic opacity",
      aiasDescription: "One original item on unease with a system whose workings cannot be understood. It picks up the opacity theme of the AI Anxiety Scale (Wang & Wang, 2022), which is not administered. This item does not measure AI anxiety in the sense of that scale.",
      aiasCitation: "Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.",
      aiasItems: [
        { name: "Opacity", desc: "Unease with a system whose workings escape the user" },
      ],

      // 7 Dimensions
      dimensionsTitle: "The 7 Dimensions",
      dimensionsDescription: "7 dimensions, one item per dimension: every question feeds exactly one score, no demographic variable enters a calculation, and \"don't know\" answers are treated as missing. Scale of 1 to 5.",
      clickToExplore: "Click on a dimension to learn more",

      dimensionReligiosity: "Centrality of religiosity",
      dimensionReligiosityDesc: "Raw mean of the 5 CRS-5 items (adapted), with no correction",
      dimensionAiOpenness: "AI openness",
      dimensionAiOpennessDesc: "Self-reported frequency, comfort and contexts of use",
      dimensionSacredBoundary: "Sacred boundary",
      dimensionSacredBoundaryDesc: "Spiritual acts the respondent excludes from any mediation by a generative tool",
      dimensionEthicalConcern: "Ethical concern",
      dimensionEthicalConcernDesc: "Perceived usefulness, opacity of systems and relation to the image of God",
      dimensionPsychPerception: "AI perception",
      dimensionPsychPerceptionDesc: "Nature attributed to AI, consciousness and anticipation of replacement",
      dimensionCommunity: "Community context",
      dimensionCommunityDesc: "Perceived official position, discussions and peer attitudes, as reported",
      dimensionFuture: "Future orientation",
      dimensionFutureDesc: "Self-reported intention to use, training wishes and areas of interest",
      dimensionScaleNote: "Scale from 1 (low) to 5 (high). Not computed when too few items are answered.",

      // 8 Profiles
      profilesTitle: "The 8 profiles",
      profilesDescription: "Profile attribution is heuristic: ideal ranges and weights were expert-set, then tuned against a simulation, never derived from a cluster analysis of real data. Profiles are not validated constructs.",
      profileHeuristicBadge: "Heuristic attribution",
      profileMotivationLabel: "What the answers describe",
      profileWatchpointLabel: "Watch point",
      profileSubProfilesLabel: "Sub-profiles",

      // Statistical Methods
      statsTitle: "How the scores are computed",
      weightedAverageTitle: "Weighted mean",
      weightedAverageDesc: "Each dimension is the weighted mean of the items actually answered. \"Don't know\" and \"prefer not to answer\" are excluded and never replaced by the midpoint of the scale. Below the minimum number of items, the dimension is not computed.",
      weightedAverageFormula: "value = Σ(score × weight) / Σ(weights), otherwise null",

      empiricalRankTitle: "Empirical rank",
      empiricalRankDesc: "Your score is placed on the distribution actually observed among participants, never on a hypothetical reference population. The comparison only appears from 30 participants onwards and shifts as collection continues.",
      empiricalRankFormula: "rank = min { i : score ≤ quantile_i }, shown if N ≥ 30",

      profileMatchingTitle: "Profile attribution",
      profileMatchingDesc: "For each dimension with a value, the absolute gap to the profile's ideal range is measured, weighted, and renormalised over the available dimensions only. That distance is converted into a score, then bonuses tied to specific answer patterns are added in score space. This is not a Euclidean distance. Below 4 valued dimensions, no profile is attributed.",
      profileMatchingFormula: "d = Σ(gap to range × weight) / Σ(weights)   then   score = 100 × exp(−0.5 × d)",

      desirabilityTitle: "Social desirability",
      desirabilityDesc: "The five true-or-false statements serve only as a covariate. No score is adjusted and no respondent is excluded: the flag is used afterwards, to check that results do not change once highly consensual response sets are set aside.",
      desirabilityFormula: "flag = (answered items ≥ 4) and (endorsed share ≥ 0.8)",

      distributionTitle: "Observed distribution",
      distributionCaption: "The rank is read off the distribution of actual participants, recomputed with every new response.",

      // Transparency
      transparencyTitle: "Methodological Transparency",
      tradeoffsTitle: "Engagement vs Rigor Trade-offs",
      tradeoffs: [
        { aspect: "Questionnaire length", engagement: "Short (8 to 12 min)", rigor: "Long (30 min and more)" },
        { aspect: "Instruments", engagement: "Adapted scales and original items", rigor: "Instruments administered in full" },
        { aspect: "Objective", engagement: "Personal reflection", rigor: "Psychometric measurement" },
        { aspect: "Sample", engagement: "Convenience and snowball", rigor: "Random sampling" },
      ],

      limitationsTitle: "Known limitations",
      limitations: [
        "Self-selected sample: the topic is announced, so indifferent people respond less",
        "Recruitment by sharing: respondents recruit their own network, so observations are not independent",
        "6 of the 7 dimensions rest on exploratory constructs, with no factor analysis",
        "5 social-desirability items: a coarse signal with low reliability",
        "Unvalidated translations for the CRS-5 and for the items inspired by Godspeed and AIAS",
        "Clergy and laypeople do not answer the same items: comparisons use a common core",
        "Cross-sectional survey: no direction of causality is identifiable",
        "Aggregated results are visible during collection and may influence later respondents",
      ],

      suitableFor: "This survey is suitable for...",
      suitableForPoints: [
        "Personal reflection and community dialogue",
        "Exploring attitudes and trends",
        "A starting point for deeper research",
      ],

      notSuitableFor: "Would need enhancement for...",
      notSuitableForPoints: [
        "Peer-reviewed academic publication",
        "Clinical or pastoral decision-making",
        "Rigorous cross-cultural comparisons",
      ],

      // Confessional Structure
      confessionalTitle: "Confessional structure",
      confessionalDesc: "The questionnaire distinguishes the major Christian traditions, then one stream within each, to allow comparisons between groups while preserving anonymity.",
      catholic: "Catholic",
      catholicSub: ["Regular parish", "Charismatic", "Traditionalist"],
      protestant: "Protestant",
      protestantSub: [
        "Historic Protestantism",
        "Non-charismatic Evangelical",
        "Charismatic or Pentecostal Evangelical",
      ],
      orthodox: "Orthodox",
      orthodoxSub: ["Byzantine (Greek, Russian, Romanian, Serbian...)", "Oriental (Coptic, Armenian, Syriac, Ethiopian...)"],
      anglican: "Anglican",
      anglicanSub: [],
      otherChristian: "Other Christian",
      otherChristianSub: ["Adventist", "Quaker", "Old Catholic", "Non-denominational", "Other"],
      confessionalNote: "No population share is attached to these branches: the counts observed describe the respondents, not the confessional demographics of the French-speaking world. Answering \"No religion / Other\" ends the questionnaire.",

      // Research Hypotheses
      hypothesesTitle: "Research hypotheses",
      hypothesesDesc: "Eight directional hypotheses, stated before collection. Threshold α = 0.05, Holm correction within each family of tests. None is tested while the sample remains too small.",
      hypotheses: [
        { id: "H1", text: "Higher centrality of religiosity would go with a stricter sacred boundary" },
        { id: "H2", text: "Charismatic and evangelical respondents would show an AI openness distinct from that of their non-charismatic co-religionists" },
        { id: "H3", text: "Younger respondents would show greater AI openness, independently of their level of religiosity" },
        { id: "H4", text: "A conservative theological orientation would go with a stricter sacred boundary" },
        { id: "H5", text: "Clergy would show a stricter common-core sacred boundary than laypeople" },
        { id: "H6", text: "The perceived official position of the community would go with individual openness to AI" },
        { id: "H7", text: "Formal theological training would go with a more articulated, less extreme ethical concern" },
        { id: "H8", text: "Daily use of AI would go with a weaker ethical concern" },
      ],
      statusToVerify: "To be tested after collection",

      // How to read a correlation
      correlationTitle: "How to read a correlation",
      correlationDesc: "A correlation is a fact; its explanation is a hypothesis. Every association therefore comes with at least one competing explanation and a certainty grade, crossing statistical strength (sample size, effect size, interval precision, threshold crossed after correction) with the plausibility of the mechanism invoked.",
      correlationGrades: [
        { grade: "A", label: "Clear association, plausible mechanism", desc: "Still a hypothesis: the survey is cross-sectional." },
        { grade: "B", label: "Credible association", desc: "Debatable mechanism, or uncontrolled confounders." },
        { grade: "C", label: "Weak signal", desc: "Limited sample or fragile interpretation." },
        { grade: "D", label: "Inconclusive", desc: "Nothing can be concluded from this association." },
      ],
      correlationNote: "If two measures share an item, the best-graded explanation is the overlap between the measures, not a link between two phenomena. The word \"proves\" is used nowhere.",

      // Citations
      citationsTitle: "References",
      citations: [
        "Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). Religions, 3(3), 710-724.",
        "Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. Journal of Consulting Psychology, 24(4), 349-354.",
        "Reynolds, W. M. (1982). Development of reliable and valid short forms of the Marlowe-Crowne Social Desirability Scale. Journal of Clinical Psychology, 38(1), 119-125.",
        "Strahan, R., & Gerbasi, K. C. (1972). Short, homogeneous versions of the Marlowe-Crowne Social Desirability Scale. Journal of Clinical Psychology, 28(2), 191-193.",
        "Bartneck, C., Kulić, D., Croft, E., & Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. International Journal of Social Robotics, 1(1), 71-81.",
        "Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale. Interactive Learning Environments, 30(4), 619-634.",
        "Cohen, J. (1988). Statistical power analysis for the behavioral sciences (2nd ed.). Lawrence Erlbaum Associates.",
      ],

      // Navigation
      backToSurvey: "Back to survey",
      backToResults: "Back to results",
    },
  },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.fr;
