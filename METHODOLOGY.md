# Méthodologie de l'enquête « IA et foi chrétienne »

**Version de l'instrument :** 2.0.0
**Version du consentement :** 2.0
**Dernière révision :** 7 septembre 2026
**Responsable de l'étude :** Romain Girardi

Cette étude est un projet indépendant. Elle n'est adossée à aucune institution universitaire ni à aucun laboratoire, et aucune institution n'en garantit ni n'en cautionne les résultats.

## Table des matières

1. [Objectif et positionnement](#1-objectif-et-positionnement)
2. [Instrument v2.0.0](#2-instrument-v200)
3. [Échelles et items](#3-échelles-et-items)
4. [Les sept dimensions](#4-les-sept-dimensions)
5. [Les huit profils](#5-les-huit-profils)
6. [Écart d'usage](#6-écart-dusage)
7. [Comparaisons entre répondants](#7-comparaisons-entre-répondants)
8. [Agrégats publics et anonymat](#8-agrégats-publics-et-anonymat)
9. [Hypothèses H1 à H8](#9-hypothèses-h1-à-h8)
10. [Plan d'analyse et interprétation des corrélations](#10-plan-danalyse-et-interprétation-des-corrélations)
11. [Limites](#11-limites)
12. [Éthique et protection des données](#12-éthique-et-protection-des-données)
13. [Références](#13-références)
14. [Changelog](#14-changelog)

---

## 1. Objectif et positionnement

### 1.1 Question de recherche

L'enquête cherche à décrire comment des chrétiens francophones déclarent utiliser, refuser ou délimiter l'usage des outils d'intelligence artificielle générative dans leurs pratiques spirituelles et ministérielles, et à repérer les variables individuelles et communautaires associées à ces déclarations. Il s'agit d'une description de déclarations, non d'une mesure de comportements observés.

### 1.2 Double statut de l'objet

L'application remplit simultanément deux fonctions qu'il faut distinguer, sous peine de surinterpréter ce qu'elle produit.

**Un outil d'engagement.** Le répondant reçoit à la fin du questionnaire un profil, des scores dimensionnels et des lectures descriptives de ses réponses. Cette restitution existe pour rendre la participation intéressante et pour nourrir une réflexion personnelle. Elle ne constitue ni un diagnostic, ni une évaluation spirituelle, ni un classement.

**Une recherche exploratoire.** Les réponses agrégées servent à décrire des distributions, à estimer des associations et à tester les huit hypothèses énoncées en section 9. Le devis est transversal, l'échantillon est de convenance, et les construits sont pour l'essentiel exploratoires. Les résultats ont valeur d'exploration et de génération d'hypothèses, jamais de confirmation.

### 1.3 Échantillonnage

Le recrutement combine trois canaux, tous non probabilistes.

1. **Convenance.** Diffusion publique du lien par les canaux personnels du responsable de l'étude.
2. **Boule de neige.** Les répondants sont invités à partager le lien et le partage est facilité par l'application (partage du profil, code QR, rapport PDF). Les chaînes de diffusion ne sont pas tracées.
3. **Partenariat CNEF.** Une porte d'entrée dédiée (`/cnef`) est diffusée par le Conseil national des évangéliques de France, partenaire de diffusion de l'enquête. Le CNEF n'est pas coauteur de l'étude, n'a pas participé à la conception de l'instrument, et reçoit uniquement des résultats agrégés et anonymes. Le canal d'entrée est enregistré dans `metadata.entryVariant` (`general` ou `cnef`) et doit être traité comme une strate d'analyse.

**Aucune représentativité n'est revendiquée.** Il n'existe pas de base de sondage du christianisme francophone, aucun tirage aléatoire n'est réalisé, aucune pondération de redressement n'est appliquée. Les proportions observées décrivent les répondants et personne d'autre. Toute phrase de la forme « X pour cent des chrétiens francophones » est hors du domaine de validité de ces données.

### 1.4 Ce que l'étude ne prétend pas être

- Un instrument clinique ou diagnostique.
- Une échelle psychométrique validée. Six des sept dimensions attendent une analyse factorielle.
- Une enquête représentative d'une population de référence.
- Une typologie stable des personnes. Les huit profils sont des étiquettes heuristiques attachées à un patron de réponses, à un instant donné.

---

## 2. Instrument v2.0.0

### 2.1 Structure

L'instrument comporte **58 questions**, réparties en blocs thématiques : profil sociodémographique et confessionnel, religiosité (CRS-5), orientation théologique, usage déclaré de l'IA, bloc ministère (clergé), bloc usage spirituel laïc, perception psychologique de l'IA, positions théologiques, contexte communautaire, orientation future, commentaire libre, et cinq items de désirabilité sociale.

Le nombre de questions réellement affichées dépend du routage :

| Parcours | Questions affichées |
|---|---|
| Répondant écarté (`profil_confession = sans_religion`) | 1 |
| Laïc n'utilisant pas l'IA | 47 |
| Laïc utilisant l'IA | 48 |
| Clergé n'utilisant pas l'IA | 48 |
| Clergé utilisant l'IA hors prédication | 49 |
| Clergé utilisant l'IA pour la prédication | 52 |

Le routage clergé s'applique aux statuts `clerge`, `religieux` et `responsable_non_ordonne` ; le routage laïc aux statuts `laic_engagé`, `laic_pratiquant` et `curieux`. Les items de prédication conditionnels (`min_pred_nature`, `min_pred_sentiment`, `min_admin_burden`) ne sont posés qu'au clergé déclarant un usage effectif de l'IA pour la prédication, afin de ne pas demander d'évaluer un gain de temps jamais expérimenté.

### 2.2 Screen-out

La réponse `sans_religion` à la première question termine le questionnaire immédiatement. La réponse est enregistrée avec `metadata.screenedOut = true`, sans scoring, sans étape de restitution, et un écran de remerciement court est affiché. Ces réponses sont exclues du scoring, des normes empiriques et de toutes les analyses.

### 2.3 Canal d'entrée

Deux portes d'entrée alimentent le même questionnaire et le même stockage. La porte CNEF préremplit `profil_confession = protestant` et `profil_confession_protestante = evangelique`, puis le répondant choisit lui-même entre `charismatique` et `non_charismatique`. Le clivage charismatique contre non charismatique vit donc dans un champ canonique unique (`profil_confession_evangelique`), identique dans les deux portes, ce qui garantit la jointabilité des deux sous-échantillons. Le champ `metadata.entryVariant` conserve la trace du canal.

### 2.4 Structure confessionnelle

```
profil_confession
├── catholique
│   └── profil_confession_catholique
│       ├── catholique_paroissial
│       ├── catholique_charismatique
│       └── catholique_traditionaliste
├── protestant
│   └── profil_confession_protestante
│       ├── protestant_historique
│       └── evangelique
│           └── profil_confession_evangelique
│               ├── non_charismatique
│               └── charismatique
├── orthodoxe
│   └── profil_confession_orthodoxe
│       ├── byzantin  (grec, russe, roumain, serbe...)
│       └── oriental  (copte, arménien, syriaque, éthiopien...)
├── anglican
│   (pas de sous-question)
├── autre_chretien
│   └── profil_confession_autre
│       ├── adventiste
│       ├── quaker
│       ├── vieux_catholique
│       ├── non_denominationnel
│       └── autre
└── sans_religion  →  fin du questionnaire (screen-out)
```

Aucune part de population n'est associée à ces branches. Les effectifs par branche sont une propriété de l'échantillon obtenu, pas une estimation de la démographie confessionnelle francophone.

### 2.5 Changements v1.4.0 vers v2.0.0 et traitement des réponses v1

Vingt-trois réponses ont été collectées sous les versions v1.x de l'instrument. Elles sont conservées en base et restent utilisables, sous réserve du remappage ci-dessous et d'un contrôle systématique de la variable de strate `metadata.instrumentVersion`. Le détail complet figure dans `docs/INSTRUMENT_V2_CHANGES.md` ; le tableau ci-dessous en donne la synthèse opérationnelle.

Conventions de remappage :

- **conservé** : identifiant, modalités et formulation inchangés. Les réponses v1 sont utilisables telles quelles.
- **conservé\*** : modalités inchangées, libellé reformulé. Comparabilité v1 contre v2 à traiter en strate.
- **recodé** : correspondance explicite entre valeurs v1 et v2.
- **null** : non comparable. La réponse v1 est mise à `null` pour toute analyse v2.
- **nouveau** : item absent en v1, donc `null` pour les 23 réponses v1.

| Item | Nature du changement | Remappage v1 → v2 |
|---|---|---|
| `profil_formation_theologique` | item ajouté (4 modalités) | nouveau → `null` |
| `profil_confession` | mention « (Fin du sondage) » retirée, screen-out désormais effectif | conservé |
| `profil_confession_orthodoxe` | nomenclature corrigée | recodé : `orthodoxe_oriental` → `byzantin` ; `orthodoxe_ancien` → `oriental` |
| `profil_statut` | ajout de `responsable_non_ordonne` | conservé, avec réserve : en v1 ces répondants se répartissaient entre `clerge` et `laic_engagé` |
| `profil_genre` | « Autre / Ne souhaite pas répondre » scindé en deux modalités | recodé : v1 `autre` → catégorie distincte `autre_ou_nsp`, jamais fusionnée avec `autre` v2 |
| `profil_education` | libellé de la modalité de refus harmonisé | conservé |
| `profil_milieu` | tranches rendues contiguës | `rural` et `urbain_moyen` conservés ; `periurbain`, `grande_ville`, `metropole` → **null** |
| `profil_anciennete_foi` | bornes désambiguïsées, « Depuis toujours » → « Depuis l'enfance » | conservé |
| `profil_annees_ministere`, `profil_taille_communaute` | bornes désambiguïsées | conservé |
| `crs_intellect`, `crs_ideology` | inchangés | conservé |
| `crs_public_practice` | modalités et cotation alignées sur le recodage de Huber et Huber | **conservé** : les cinq modalités v1 (`pluri_hebdo`, `hebdo`, `mensuel`, `quelques_fois_an`, `jamais`) sont reprises telles quelles et cotées avec la même table ; la v2 ajoute `rarement` (« moins souvent »), sans équivalent v1 |
| `crs_private_practice` | ajout d'une modalité hebdomadaire, ancres explicitées | recodé : `pluri_quotidien`, `quotidien`, `rarement` et `jamais` conservés et cotés avec la même table qu'en v2 (`quotidien` = 5, `rarement` = 2) ; `occasionnellement` v1 → **null** (aucune ancre Huber correspondante) |
| `crs_experience` | énoncé remplacé par la formulation de Huber et Huber (intervention divine) | **null** (construit différent de la v1, qui mesurait des « moments de spiritualité profonde ») |
| `min_care_email` | modalités rééquilibrées (non / oui relu / oui tel quel) | recodé : `non_jamais` → `non` ; `oui_brouillon` → `oui_relu` ; `oui_souvent` → **null** |
| `min_pred_usage` | parenthèse ambiguë retirée | conservé |
| `min_admin_burden` | conditionnée à l'usage effectif de l'IA | conservé, à traiter en covariable pour les réponses v1 de clergé non utilisateur |
| `theo_inspiration` | libellés neutralisés | conservé\* |
| `theo_activites_sacrees` | capitales retirées, modalité « aucune » neutralisée | conservé\* |
| `communaute_perception_pairs` | « Je ne sais pas / opinions variées » scindé en deux modalités | recodé : v1 `ne_sait_pas` → catégorie distincte `ne_sait_pas_ou_variees` |
| 13 items attitudinaux | ajout d'une modalité `sans_reponse` en dernière position | conservé ; `sans_reponse` est une donnée manquante, jamais imputée |
| Multi-choix `aucun*` | exclusivité imposée dans l'interface et à la validation serveur | les réponses v1 combinant `aucun*` et d'autres modalités doivent être nettoyées avant analyse |

**Conséquence pratique.** Sur les 23 réponses v1, `crs_experience` est perdue, ce qui met la dimension religiosité à quatre items utilisables, soit exactement le seuil minimal ; une réponse v1 `occasionnellement` en pratique privée fait tomber ce total à trois et annule alors le score de religiosité. Trois modalités de `profil_milieu` et une modalité de `min_care_email` sont également perdues. Toute analyse poolant v1 et v2 doit soit exclure les items marqués **null**, soit inclure `instrumentVersion` comme facteur.

---

## 3. Échelles et items

Trois statuts sont distingués et employés de façon stricte dans toute la documentation et dans l'application.

| Statut | Signification |
|---|---|
| **adapté** | Instrument publié, repris avec des modifications documentées (traduction, recodage de modalités). La validation d'origine ne se transporte pas automatiquement à la version adaptée. |
| **sélection ad hoc** | Sous-ensemble d'items d'un instrument publié, choisi par le concepteur de l'enquête, sans propriété psychométrique établie pour ce sous-ensemble. |
| **inspiré de** | Items originaux, écrits pour cette enquête, dont la formulation s'appuie sur un instrument publié qui n'est lui-même pas administré. |

Aucun instrument n'est ici administré dans une version validée. Le mot « validée » n'est employé nulle part pour qualifier une échelle de cette enquête.

### 3.1 Centralité de la religiosité, CRS-5 (adapté)

**Source :** Huber, S., et Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). *Religions*, 3(3), 710-724.

Cinq items, un par dimension de Huber, dans leur formulation française réellement affichée :

| Dimension de Huber | Identifiant | Énoncé affiché |
|---|---|---|
| Intellect | `crs_intellect` | « À quelle fréquence réfléchissez-vous à des questions religieuses ? » |
| Idéologie | `crs_ideology` | « Dans quelle mesure croyez-vous en l'existence de Dieu ou d'une réalité divine ? » |
| Pratique publique | `crs_public_practice` | « À quelle fréquence participez-vous à des offices religieux (messe, culte, liturgie) ? » |
| Pratique privée | `crs_private_practice` | « À quelle fréquence priez-vous en dehors des offices ? » |
| Expérience | `crs_experience` | « À quelle fréquence vivez-vous des situations où vous avez le sentiment que Dieu ou quelque chose de divin intervient dans votre vie ? » |

**Recodage Huber.** Les deux items de pratique sont cotés selon la table de recodage de Huber et Huber (2012), et non selon un simple rang des modalités affichées. Cette table fait référence pour les deux versions de l'instrument.

| Item | Modalité affichée | Valeur | Score |
|---|---|---|---|
| Pratique publique | « Plus d'une fois par semaine » | `pluri_hebdo` | 5 |
| | « Une fois par semaine » | `hebdo` | 4 |
| | « Une à trois fois par mois » | `mensuel` | 3 |
| | « Quelques fois par an » | `quelques_fois_an` | 2 |
| | « Moins souvent » | `rarement` | 2 |
| | « Jamais » | `jamais` | 1 |
| Pratique privée | « Plusieurs fois par jour » | `pluri_quotidien` | 5 |
| | « Une fois par jour » | `quotidien` | 5 |
| | « Une ou plusieurs fois par semaine » | `hebdomadaire` | 4 |
| | « Une à trois fois par mois » | `mensuel` | 3 |
| | « Quelques fois par an ou moins » | `rarement` | 2 |
| | « Jamais » | `jamais` | 1 |

Deux points de cette table ne se déduisent pas de l'ordre des modalités. En pratique publique, « quelques fois par an » et « moins souvent » reçoivent le même score 2, Huber et Huber regroupant ces deux fréquences. En pratique privée, la prière quotidienne est le sommet de l'échelle : `quotidien` et `pluri_quotidien` sont tous deux cotés 5.

**Compatibilité v1 → v2.** La même table est appliquée aux réponses des deux versions de l'instrument, de sorte que les scores de pratique sont directement comparables. Pour la pratique publique, la v2 reprend les identifiants de modalité de la v1 (`pluri_hebdo`, `hebdo`, `mensuel`, `quelques_fois_an`, `jamais`) : aucune réponse v1 n'est perdue ni recodée, la v2 se contente d'ajouter la modalité « moins souvent » (`rarement`). Pour la pratique privée, les réponses v1 `pluri_quotidien`, `quotidien`, `rarement` et `jamais` sont cotées exactement comme leurs équivalents v2, `quotidien` valant 5 comme `pluri_quotidien` ; seule la modalité v1 `occasionnellement` reste sans ancre correspondante chez Huber et Huber et est traitée comme donnée manquante. La religiosité se calcule alors sur les quatre autres items, ce que le seuil minimal de quatre items autorise.

**Calcul.** Moyenne arithmétique non pondérée des cinq items cotés de 1 à 5. Aucune correction par la désirabilité sociale n'est appliquée. Le score est `null` si moins de quatre items sont renseignés.

**Classification.** Trois classes, conformes à Huber et Huber : non religieux (1,0 à 2,0), religieux (2,1 à 3,9), hautement religieux (4,0 à 5,0).

**Réserves.**

1. La traduction française employée ici n'est pas une version validée du CRS. Elle n'a fait l'objet ni d'une procédure de traduction et rétrotraduction documentée, ni d'une étude d'invariance de mesure. Le statut est donc « adapté ».
2. Avec un item par sous-dimension, aucun alpha de Cronbach n'est calculable pour les sous-dimensions. La cohérence interne de l'échelle globale à cinq items pourra être estimée, mais un alpha sur cinq items hétérogènes par construction reste d'interprétation délicate.
3. Le CRS-5 est la version courte proposée par les auteurs eux-mêmes ; c'est la traduction et le recodage, non la réduction à cinq items, qui motivent le statut « adapté ».

### 3.2 Désirabilité sociale, sélection ad hoc de 5 items Marlowe-Crowne

**Source de l'instrument d'origine :** Crowne, D. P., et Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. *Journal of Consulting Psychology*, 24(4), 349-354.

Cinq items en vrai ou faux, sélectionnés pour leur brièveté et leur intelligibilité, sans procédure de sélection psychométrique :

| Identifiant | Énoncé affiché | Réponse cotée « désirable » |
|---|---|---|
| `ctrl_mc_1` | « Il m'est parfois difficile de continuer mon travail si je ne suis pas encouragé(e). » | Faux |
| `ctrl_mc_2` | « Je n'ai jamais intensément détesté quelqu'un. » | Vrai |
| `ctrl_mc_3` | « J'ai parfois eu envie de me rebeller contre des personnes en position d'autorité même si je savais qu'elles avaient raison. » | Faux |
| `ctrl_mc_4` | « Je suis toujours courtois(e), même avec des personnes désagréables. » | Vrai |
| `ctrl_mc_5` | « Il m'est arrivé de profiter de quelqu'un. » | Faux |

**Calcul.** Proportion d'items endossés dans le sens désirable parmi les items répondus, normalisée entre 0 et 1. En dessous de quatre items répondus, le score est `null`. Un drapeau `flag` est levé lorsque quatre items au moins sont répondus et que la proportion atteint 0,8, c'est-à-dire quatre ou cinq items sur cinq endossés dans le sens désirable.

**Usage.** Le drapeau est une covariable et rien d'autre. Aucun score de dimension n'est dégonflé, aucun multiplicateur de confiance n'est appliqué. L'usage prévu est une analyse de sensibilité : réestimer les associations principales en excluant les répondants drapeautés et vérifier que les conclusions ne changent pas.

**Réserves.** Cette sélection de cinq items **n'est pas une forme courte validée**. Les formes courtes réellement validées de la Marlowe-Crowne Social Desirability Scale sont celles de Reynolds (1982), qui propose les formes A, B et C, et celle de Strahan et Gerbasi (1972), qui propose des formes à 10 et 20 items. Aucune de ces formes n'est utilisée ici et aucun de leurs seuils ni de leurs normes ne s'applique aux données de cette enquête. La mention « Form C » qui figurait dans les versions antérieures de cette documentation était erronée et a été retirée. Avec cinq items dichotomiques, la fidélité attendue est faible : le score doit être lu comme un signal grossier, non comme une mesure.

### 3.3 Perception de l'IA, items inspirés de Godspeed

**Source d'inspiration :** Bartneck, C., Kulić, D., Croft, E., et Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. *International Journal of Social Robotics*, 1(1), 71-81.

Deux items originaux, `psych_godspeed_nature` (situer l'IA sur un continuum machine vers humain) et `psych_godspeed_conscience` (possibilité d'une conscience artificielle), reprennent l'intuition de la dimension d'anthropomorphisme du Godspeed. Le différenciateur sémantique du Godspeed n'est pas administré. **Ces items ne constituent pas la série Godspeed et n'héritent d'aucune de ses propriétés psychométriques.**

### 3.4 Opacité algorithmique, item inspiré de l'AIAS

**Source d'inspiration :** Wang, Y. Y., et Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale: An initial application in predicting motivated learning behavior. *Interactive Learning Environments*, 30(4), 619-634.

Un item original, `psych_aias_opacity`, porte sur la gêne face à l'impossibilité de comprendre le fonctionnement d'un système. Il s'inspire de la thématique de l'opacité présente dans l'AIAS. L'AIAS complète n'est pas administrée. **Cet item ne mesure pas l'anxiété face à l'IA au sens de l'échelle de Wang et Wang.**

### 3.5 Items originaux sans source

Les items de frontière sacrée (`theo_*`), de contexte communautaire (`communaute_*`), d'orientation future (`futur_*`) et d'usage déclaré (`ctrl_ia_*`, `digital_*`, `min_*`, `laic_*`) ont été écrits pour cette enquête. Leur validité apparente a été discutée, leur validité de construit n'a pas été établie.

---

## 4. Les sept dimensions

### 4.1 Règles communes

Quatre règles gouvernent le calcul de toutes les dimensions.

1. **Un item alimente exactement une dimension.** Aucun item n'est compté deux fois. Cette règle a été introduite en v2 précisément pour que les corrélations entre dimensions ne soient pas mécaniquement gonflées par des items partagés. Le module d'analyse vérifie cette propriété et signale tout item partagé comme artefact de méthode.
2. **Aucune variable démographique n'entre dans une dimension.** L'âge, le statut et la taille de la communauté sont des covariables, jamais des composantes d'un score. Sans cette règle, une hypothèse comme H3 (âge et ouverture à l'IA) serait partiellement tautologique.
3. **Les non-réponses sont des données manquantes.** « Je ne sais pas », « Je préfère ne pas répondre » et l'absence de réponse sont exclus de la moyenne et ne sont jamais imputés au milieu de l'échelle.
4. **Un seuil minimal d'items est requis.** `MIN_ITEMS = 2` pour six dimensions, `MIN_ITEMS_RELIGIOSITY = 4` pour la religiosité. En dessous du seuil, la dimension vaut `null` et n'est ni affichée, ni utilisée dans le calcul de profil, ni versée aux normes empiriques.

Chaque dimension expose quatre grandeurs : `value` (moyenne pondérée sur 1 à 5, ou `null`), `nItems` (items effectivement répondus), `maxItems` (items posables à ce répondant compte tenu du routage) et `confidence` (`nItems / maxItems`).

**Formule.** Pour une dimension d dont les items applicables et répondus sont indexés par i :

```
value(d) = Σ (score_i × poids_i) / Σ poids_i     si nItems ≥ minItems
value(d) = null                                  sinon
```

### 4.2 Table item vers dimension

Les poids sont ceux du code (`src/lib/scoring/dimensions.ts`). La colonne « noyau » indique les items posés à tous les répondants, utilisés pour les sous-scores comparables.

**Religiosité (`religiosity`), seuil 4 items, statut adapté**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `crs_intellect` | 1 | non | oui |
| `crs_ideology` | 1 | non | oui |
| `crs_public_practice` | 1 | non | oui |
| `crs_private_practice` | 1 | non | oui |
| `crs_experience` | 1 | non | oui |

**Ouverture à l'IA (`aiOpenness`), seuil 2 items, statut exploratoire**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `ctrl_ia_frequence` | 1 | non | oui |
| `ctrl_ia_confort` | 1 | non | oui |
| `digital_attitude_generale` | 1 | non | oui |
| `ctrl_ia_contextes` | 1 | usage déclaré de l'IA | non |
| `min_pred_usage` | 1 | clergé | non |
| `min_pred_nature` | 1 | clergé utilisant l'IA | non |
| `min_admin_burden` | 0,5 | clergé utilisant l'IA | non |

**Frontière sacrée (`sacredBoundary`), seuil 2 items, statut exploratoire**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `theo_inspiration` | 1 | non | oui |
| `theo_liturgie_ia` | 1 | non | oui |
| `theo_activites_sacrees` | 1 | non | oui |
| `theo_mediation_humaine` | 1 | non | oui |
| `min_pred_sentiment` | 1 | clergé utilisant l'IA | non |
| `min_care_email` | 1 | clergé | non |
| `laic_substitution_priere` | 1 | laïc | non |
| `laic_conseil_spirituel` | 1 | laïc | non |

**Préoccupation éthique (`ethicalConcern`), seuil 2 items, statut exploratoire**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `theo_utilite_percue` | 1 | non | oui |
| `psych_aias_opacity` | 1 | non | oui |
| `psych_imago_dei` | 1 | non | oui |

**Perception psychologique (`psychologicalPerception`), seuil 2 items, statut inspiré de**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `psych_godspeed_nature` | 1 | non | oui |
| `psych_godspeed_conscience` | 1 | non | oui |
| `psych_anxiete_remplacement` | 1 | non | oui |

**Contexte communautaire (`communityContext`), seuil 2 items, statut exploratoire**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `communaute_position_officielle` | 1 | non | oui |
| `communaute_perception_pairs` | 1 | non | oui |
| `communaute_discussions` | 1 | non | oui |

**Orientation future (`futureOrientation`), seuil 2 items, statut exploratoire**

| Item | Poids | Conditionnel | Noyau |
|---|---|---|---|
| `futur_intention_usage` | 1 | non | oui |
| `futur_formation_souhait` | 1 | non | oui |
| `futur_domaines_interet` | 1 | non | oui |

**Notes de codage.**

- `communityContext` remplace l'ancienne « influence communautaire ». Elle est cotée sur des valences dont l'ordre est défendable : la position officielle perçue est cotée de 1 (défavorable) à 5 (favorable), les modalités « aucune position » et « je ne sais pas » étant traitées comme manquantes ; la perception des pairs va de 1 (hostile) à 5 (très favorable) ; les discussions communautaires vont de 1 (jamais) à 5 (organisées). Le nom a changé parce que le score décrit un contexte déclaré, pas une influence causale mesurée.
- `theo_risque_futur` est une variable nominale, sans ordre défendable. Elle est collectée et décrite en fréquences, mais n'entre dans aucune dimension.
- `theo_orientation` est une covariable et un facteur d'hypothèse (H4). Elle n'entre dans aucune dimension, mais intervient comme bonus dans l'attribution de profil (section 5.3).

### 4.3 Sous-scores de noyau commun

Le routage expose des items différents au clergé et aux laïcs. Comparer directement les scores complets de ces deux groupes revient à comparer des mesures composées d'items différents, ce qui est un défaut d'invariance de mesure par construction.

Deux sous-scores sont donc calculés sur les seuls items universels, avec le même seuil de deux items :

- `sacredBoundaryCore` : `theo_inspiration`, `theo_liturgie_ia`, `theo_activites_sacrees`, `theo_mediation_humaine`.
- `aiOpennessCore` : `ctrl_ia_frequence`, `ctrl_ia_confort`, `digital_attitude_generale`.

**Toute comparaison entre clergé et laïcs porte sur les sous-scores de noyau, jamais sur les scores complets.** C'est ce que fait l'hypothèse H5.

### 4.4 Statut de validation des dimensions

| Dimension | Statut | Fondement |
|---|---|---|
| Religiosité | adapté | CRS-5 (Huber et Huber, 2012), traduit et recodé |
| Perception psychologique | inspiré de | items originaux inspirés du Godspeed |
| Ouverture à l'IA | exploratoire | construit ad hoc |
| Frontière sacrée | exploratoire | construit ad hoc |
| Préoccupation éthique | exploratoire | construit ad hoc, dont un item inspiré de l'AIAS |
| Contexte communautaire | exploratoire | construit ad hoc |
| Orientation future | exploratoire | construit ad hoc |

**Six dimensions sur sept sont exploratoires ou seulement inspirées d'un instrument publié.** Aucune analyse factorielle exploratoire ou confirmatoire n'a été conduite. La structure en sept dimensions est une hypothèse de travail issue du jugement du concepteur, pas un résultat empirique. Elle sera testée en analyse exploratoire (section 10.4) dès que l'effectif le permettra.

---

## 5. Les huit profils

### 5.1 Statut

**L'attribution de profil est heuristique.** Les plages idéales, les poids dimensionnels et les bonus ont été fixés par jugement d'expert puis ajustés contre une simulation de personas. Ils ne proviennent d'aucune analyse de classification sur des données réelles. Le champ `attribution` du spectre porte explicitement la valeur `heuristic`, et l'interface affiche la mention « attribution heuristique » à côté du nom du profil.

Les huit profils ne sont pas des construits validés. Ce ne sont ni des types psychologiques, ni des classes latentes, ni des catégories dont l'existence aurait été démontrée. Ce sont des étiquettes lisibles apposées sur des régions d'un espace à sept dimensions.

### 5.2 Distance et score

Pour chaque profil p, une distance L1 pondérée est calculée entre le vecteur des dimensions du répondant et les plages idéales du profil.

```
Pour chaque dimension k dont value(k) n'est pas null :
    d_k = max(0, min_pk − value(k)) + max(0, value(k) − max_pk)
distance(p) = Σ (d_k × w_pk) / Σ w_pk
```

La distance est donc **nulle à l'intérieur de la plage** et croît linéairement en dehors. Il ne s'agit pas d'une distance euclidienne : aucun carré n'est pris, aucune racine n'est extraite. Les dimensions valant `null` sont retirées du calcul et leur poids retiré du dénominateur, ce qui renormalise automatiquement la distance sur les dimensions disponibles.

Si moins de **quatre** dimensions ont une valeur, aucun profil n'est attribué (`primary = null`).

La distance est convertie en score de correspondance :

```
score(p) = 100 × exp(−0,5 × distance(p))
```

Le facteur 0,5 est un paramètre de lisibilité, choisi pour qu'une distance de 2 corresponde à un score voisin de 37. Il n'est calibré sur aucune donnée. Les scores ne sont pas normalisés entre eux : ils ne somment pas à 100 et ne s'interprètent pas comme des probabilités d'appartenance.

### 5.3 Bonus

Deux familles de bonus sont ajoutées **dans l'espace des scores**, à raison de 6 points par unité de bonus, le résultat étant borné à l'intervalle 0 à 100. Ce choix corrige un défaut de la v1, où les bonus étaient soustraits de la distance avant conversion, ce qui rendait leur effet dépendant de la distance elle-même.

1. **Auto-étiquetage théologique.** L'orientation déclarée (`theo_orientation`) rapproche ou éloigne certains profils. Son poids est divisé par deux par rapport aux bonus comportementaux, pour qu'une étiquette déclarée ne l'emporte pas sur le patron de réponses.
2. **Patrons de réponses.** Des combinaisons que la distance seule ne capture pas, par exemple une frontière sacrée basse conjuguée à une ouverture haute pour le Pionnier spirituel, ou une proportion élevée de « je ne sais pas » pour l'Explorateur.

### 5.4 Tri, égalités et confiance

Les profils sont triés sur le score brut non arrondi. En cas d'égalité stricte, deux départages déterministes s'appliquent dans l'ordre : d'abord la confiance de la dimension la plus pondérée par le profil (les égalités de poids étant tranchées par l'ordre alphabétique de la clé de dimension), puis l'ordre alphabétique de l'identifiant du profil. L'arrondi n'intervient qu'à l'affichage.

La confiance de l'attribution est calculée uniquement à partir de l'écart entre le score primaire et le score secondaire, car le score primaire seul reste élevé (au moins 58 sur toutes les personas simulées) et ne discrimine pas :

| Confiance | Condition |
|---|---|
| `high` | écart avec le secondaire ≥ 15 points |
| `medium` | écart ≥ 6 points |
| `low` | écart < 6 points |

Quand la confiance est `low`, l'interface présente deux profils à égalité proche plutôt qu'un seul.

### 5.5 Plages idéales

Chaque cellule donne la plage idéale (bornes incluses) puis le poids entre parenthèses.

| Profil | Religiosité | Ouverture IA | Frontière sacrée | Préoc. éthique | Perception psy. | Contexte comm. | Orient. future |
|---|---|---|---|---|---|---|---|
| Gardien de la Tradition | 4 à 5 (1,2) | 1 à 2,5 (1,5) | 4 à 5 (1,5) | 3,5 à 5 (1) | 1 à 3 (0,6) | 2 à 4 (0,6) | 1 à 2,5 (1) |
| Prudent Éclairé | 3,5 à 5 (1,1) | 2 à 3,5 (1,4) | 3,5 à 4,75 (1,3) | 3 à 4,5 (1) | 1,5 à 3,5 (0,6) | 2 à 4 (0,6) | 2,25 à 3,75 (1,1) |
| Innovateur Ancré | 4 à 5 (1,4) | 3,75 à 5 (1,4) | 2 à 3,5 (1,1) | 2 à 3,5 (0,9) | 1,5 à 3,5 (0,6) | 2 à 4 (0,6) | 3,75 à 5 (1,2) |
| Équilibriste Spirituel | 2,5 à 4 (0,8) | 2,75 à 3,25 (1,2) | 2,75 à 3,25 (1,2) | 2,75 à 3,25 (1,2) | 2,5 à 3,5 (0,8) | 2,5 à 4 (0,6) | 2,75 à 3,25 (1,2) |
| Pragmatique Moderne | 2,5 à 4 (0,8) | 3,5 à 5 (1,4) | 1,5 à 3 (1,2) | 1 à 2,75 (1,3) | 1,5 à 3,5 (0,6) | 2 à 4 (0,6) | 3,5 à 5 (1,2) |
| Pionnier Spirituel | 2 à 4,5 (0,6) | 4 à 5 (1,5) | 1 à 2,25 (1,5) | 1 à 3 (0,9) | 2 à 4,5 (0,7) | 1,5 à 3,5 (0,6) | 4 à 5 (1,4) |
| Progressiste Critique | 2 à 4 (0,6) | 2 à 3,5 (1,1) | 2,5 à 4 (1) | 4 à 5 (1,6) | 3 à 5 (1,2) | 2 à 4 (0,6) | 3 à 4,5 (1) |
| Explorateur | 1 à 3 (1,4) | 2 à 4 (0,7) | 2 à 4 (0,7) | 2 à 4 (0,7) | 2 à 4 (0,7) | 1 à 3 (0,9) | 2,5 à 4,5 (0,9) |

Chaque profil primaire se décline en trois sous-profils, soit vingt-quatre au total, attribués par un score de correspondance à des patrons dimensionnels et à quelques réponses spécifiques. Le sous-profil est un raffinement descriptif ; il ne fait l'objet d'aucune validation et n'est utilisé dans aucune analyse.

### 5.6 Simulation de récupération

L'attribution a été évaluée par une simulation. Quatre personas ont été définis par un niveau cible sur chaque dimension ; 250 répondants ont été tirés autour de chaque cible avec un bruit gaussien d'écart type 0,7 sur l'échelle 1 à 5, soit environ une modalité de dérive par item. Le critère de réussite est que le profil cible arrive en première position.

| Persona | Profil cible | Taux de récupération |
|---|---|---|
| Traditionaliste | Gardien de la Tradition | 100 % |
| Innovateur | Innovateur Ancré | 91,6 % |
| Prudent | Prudent Éclairé | 86,4 % |
| Équilibré | Équilibriste Spirituel | 52 % (modal) |

Les trois premiers personas dépassent le seuil de 80 % fixé a priori et le test automatisé (`src/lib/scoring/__tests__/profiles.simulation.test.ts`, graine 20260907) échoue si ce n'est plus le cas. Le persona équilibré n'est pas soumis à ce seuil : ses plages ont été délibérément resserrées à 2,75 à 3,25 sur les quatre dimensions centrales pour qu'il cesse d'absorber tous les répondants modérés, ce qui rend sa récupération volontairement difficile. Il n'est vérifié que comme profil modal.

**Ce que la simulation démontre et ce qu'elle ne démontre pas.** Elle démontre que l'algorithme est cohérent avec ses propres définitions et robuste à un bruit modéré. Elle ne démontre rien sur l'existence des profils dans une population réelle, puisque les données simulées sont engendrées à partir des définitions elles-mêmes.

---

## 6. Écart d'usage

La v1 comportait un « indice de résistance spirituelle ». Ce nom postulait une motivation (une résistance) à partir d'une différence d'usage, ce qui n'est pas déductible des données. L'indicateur a été renommé et redéfini.

`usageGap` est une variable catégorielle à quatre modalités, construite sur la comparaison entre usage général déclaré de l'IA (`ctrl_ia_frequence`) et usage déclaré dans le champ spirituel ou ministériel (contexte `spirituel` de `ctrl_ia_contextes`, ou l'un des items `min_pred_usage`, `min_care_email`, `laic_substitution_priere`, `laic_conseil_spirituel`) :

| Modalité | Signification |
|---|---|
| `uses_both` | usage déclaré en général et dans le champ spirituel |
| `uses_general_not_spiritual` | usage général déclaré, aucun usage spirituel déclaré |
| `no_use` | aucun usage déclaré |
| `none` | indéterminé : l'item d'usage général est manquant |

Aucune inférence motivationnelle n'est attachée à ces modalités. Un écart est une observation, pas une résistance. L'interprétation motivationnelle, si elle est proposée, relève du module d'interprétation (section 10) et se voit attribuer un grade de certitude comme toute autre interprétation.

---

## 7. Comparaisons entre répondants

### 7.1 Suppression des percentiles modélisés

La v1 situait le répondant au moyen de percentiles calculés par la fonction de répartition d'une loi normale dont les paramètres, moyenne et écart type par dimension, avaient été **postulés** par le concepteur. Ces paramètres n'étaient étayés par aucune donnée. Une phrase comme « vous faites partie des 15 % les plus ouverts » ne décrivait donc rien d'observé.

Ces paramètres, la fonction de répartition qui les exploitait et les formulations correspondantes ont été supprimés. Il n'existe plus de population de référence dans cette application.

### 7.2 Rangs empiriques

La comparaison repose désormais sur la distribution effectivement observée. L'endpoint `GET /api/results/norms` calcule, pour chaque dimension, les 99 quantiles des scores des réponses consenties, complètes et non écartées, par interpolation linéaire entre statistiques d'ordre (définition dite de type 7, celle de R et de NumPy). Le client détermine le rang du répondant comme le plus petit indice i tel que son score soit inférieur ou égal au quantile i.

**Deux garde-fous.**

1. Si l'effectif total est inférieur à **30**, l'endpoint renvoie `{ mode: 'insufficient' }` et l'interface affiche « Comparaison disponible à partir de 30 participants ». Aucun rang n'est calculé.
2. La formulation retenue est « votre score est supérieur à X pour cent des N participants ». Elle nomme explicitement l'ensemble de référence, qui est l'échantillon lui-même. Le rang est une propriété de cet échantillon, il varie à mesure que la collecte avance, et il ne s'extrapole à aucune population.

La réponse est mise en cache dix minutes et soumise au même contrôle de débit que l'endpoint agrégé.

---

## 8. Agrégats publics et anonymat

Le tableau de bord public expose des distributions par question, calculées par une fonction SQL en base (`get_aggregated_results`, migration 011).

**Expansion des réponses composites.** Les réponses à choix multiples sont dépliées avec `jsonb_array_elements_text`, produisant une cellule par modalité sélectionnée ; les réponses matricielles sont dépliées avec `jsonb_each`, produisant une cellule par couple `ligne:colonne`. Les réponses scalaires produisent une cellule, désormais déquotée. Avant la v2, une réponse multiple produisait une cellule unique clé par le tableau JSON entier, ce qui rendait tout comptage par modalité impossible.

**k-anonymat.** Le paramètre `k = 5` est appliqué au niveau de la cellule : toute modalité comptant moins de 5 répondants est fusionnée dans un agrégat `_autres` propre à la question. Une question dont le total est lui-même inférieur à 5 n'est pas retournée. Les questions à texte libre (`commentaires_libres`) et les clés internes préfixées par `_` sont exclues de l'agrégation.

**Seuil de publication.** Tant que le nombre de participants est inférieur à **30**, l'endpoint agrégé renvoie `{ mode: 'insufficient' }` et le tableau de bord affiche un état « collecte en cours ». Aucune valeur de démonstration n'est affichée.

**Côté administration.** Tout segment de moins de 5 observations renvoie `null` pour les moyennes et les corrélations. Une corrélation n'est calculée qu'à partir de 20 observations, et elle est toujours accompagnée de son intervalle de confiance à 95 pour cent, obtenu par la transformation z de Fisher, et d'un p ajusté par la procédure de Benjamini et Hochberg sur la famille exacte des corrélations calculées.

---

## 9. Hypothèses H1 à H8

### 9.1 Principes

Les hypothèses sont **directionnelles**, énoncées avant la collecte v2, et encodées dans `src/lib/analysis/interpretationCatalog.ts`. Toute hypothèse dont la vérification serait une simple propriété de l'algorithme de scoring a été retirée : l'ancienne liste en comptait plusieurs, notamment sur la rareté des profils extrêmes, qui n'est qu'une conséquence des plages idéales choisies.

Les variables comparées sont **brutes** ou sont des dimensions ne contenant pas la variable testée. Aucune hypothèse ne met en relation une dimension avec un item qui la compose.

**Seuil.** α = 0,05, tests bilatéraux, la direction annoncée étant lue sur le signe de l'effet.

**Correction pour tests multiples.** Correction de Holm à l'intérieur de chaque famille. Deux familles sont définies a priori :

- **Famille A, associations ordinales :** H1, H3, H6, H8 (4 tests).
- **Famille B, comparaisons de groupes :** H2, H4, H5, H7 (4 tests).

Les corrélations exploratoires produites par le module d'analyse forment une troisième famille, distincte, corrigée par Benjamini et Hochberg (section 10).

**Calcul de puissance.** Deux formules sont employées, avec z(0,975) = 1,960 et z(0,80) = 0,842.

Pour une corrélation, l'approximation de Fisher :

```
N = ((z_{1−α/2} + z_{1−β}) / C)² + 3     avec C = 0,5 × ln((1+r) / (1−r))
```

Pour une comparaison de deux moyennes indépendantes de tailles égales :

```
n par groupe = 2 × ((z_{1−α/2} + z_{1−β}) / d)²     puis +1 pour le passage du z au t
```

Pour les comparaisons à plus de deux groupes, les effectifs sont ceux d'une analyse de variance à un facteur avec f = 0,25, effet moyen au sens de Cohen (1988).

Lorsque le test retenu est un test de rang (Spearman, Mann-Whitney, Kruskal-Wallis), l'effectif issu de la formule paramétrique est majoré de 10 pour cent, ce qui correspond à l'ordre de grandeur de la perte d'efficacité asymptotique relative dans le cas gaussien.

Ces formules sont des approximations. Pour r = 0,30 par exemple, l'approximation de Fisher donne N = 85 après arrondi supérieur, là où le calcul exact fondé sur la loi du t non centrée donne N = 84. L'écart d'une unité est sans conséquence pratique ; les valeurs annoncées ci-dessous sont celles de l'approximation, systématiquement la plus prudente des deux.

### 9.2 Liste des hypothèses

#### H1. Religiosité et frontière sacrée

> Une centralité religieuse plus élevée irait de pair avec une frontière sacrée plus stricte.

| | |
|---|---|
| **Variables** | `religiosity` (dimension) et `sacredBoundary` (dimension) |
| **Items partagés** | aucun |
| **Test** | corrélation de Spearman, bilatérale |
| **Famille** | A (Holm sur 4 tests) |
| **Effet attendu** | ρ = 0,30 |
| **N pour puissance 0,80** | 85 en paramétrique, **≈ 94** pour le test de rang |

#### H2. Courant charismatique et ouverture à l'IA

> Les répondants charismatiques et évangéliques présenteraient une ouverture à l'IA distincte de celle de leurs coreligionnaires non charismatiques.

| | |
|---|---|
| **Variables** | `profil_confession_evangelique` (`charismatique` contre `non_charismatique`) et `aiOpenness` |
| **Items partagés** | aucun |
| **Test** | Mann-Whitney bilatéral, avec un test t de Welch en analyse de robustesse |
| **Famille** | B (Holm sur 4 tests) |
| **Effet attendu** | d = 0,50 |
| **N pour puissance 0,80** | 64 par groupe, soit **≈ 128** au total, et ≈ 141 pour le test de rang |

#### H3. Âge et ouverture à l'IA

> Les répondants plus jeunes présenteraient une ouverture à l'IA plus grande, indépendamment de leur niveau de religiosité.

| | |
|---|---|
| **Variables** | `profil_age` (4 classes ordonnées) et `aiOpenness`, avec `religiosity` en covariable |
| **Items partagés** | aucun. `profil_age` est une covariable, exclue de toute dimension depuis la v2 |
| **Test** | corrélation de Spearman, puis régression linéaire de `aiOpenness` sur `profil_age` et `religiosity` |
| **Famille** | A (Holm sur 4 tests) |
| **Effet attendu** | ρ = −0,30 ; f² = 0,15 pour le modèle à deux prédicteurs |
| **N pour puissance 0,80** | **≈ 94** pour la corrélation de rang ; ≈ 68 pour la régression, la corrélation étant donc le critère contraignant |

#### H4. Orientation théologique et frontière sacrée

> Une orientation théologique conservatrice irait de pair avec une frontière sacrée plus stricte.

| | |
|---|---|
| **Variables** | `theo_orientation` (`traditionaliste`, `modere`, `progressiste` ; `ne_sait_pas` et `sans_reponse` exclus) et `sacredBoundary` |
| **Items partagés** | aucun. `theo_orientation` n'entre dans aucune dimension |
| **Test** | test de tendance de Jonckheere-Terpstra (l'hypothèse est monotone), Kruskal-Wallis en secours |
| **Famille** | B (Holm sur 4 tests) |
| **Effet attendu** | f = 0,25 sur 3 groupes |
| **N pour puissance 0,80** | **≈ 160** |
| **Réserve** | `theo_orientation` intervient comme bonus dans l'attribution de profil, jamais dans le calcul de `sacredBoundary`. L'hypothèse n'est donc pas tautologique, mais toute mise en relation entre `theo_orientation` et un **profil** le serait. |

#### H5. Clergé et laïcs

> Le clergé présenterait une frontière sacrée de noyau commun plus stricte que les laïcs.

| | |
|---|---|
| **Variables** | `profil_statut` recodé en clergé contre laïcs, et `sacredBoundaryCore` |
| **Items partagés** | aucun. Le sous-score de noyau exclut par construction les items conditionnels au routage |
| **Test** | Mann-Whitney bilatéral, test t de Welch en analyse de robustesse |
| **Famille** | B (Holm sur 4 tests) |
| **Effet attendu** | d = 0,50 |
| **N pour puissance 0,80** | 64 par groupe, soit **≈ 128** au total, et ≈ 141 pour le test de rang |
| **Réserve** | l'usage du score complet `sacredBoundary` invaliderait la comparaison, les deux groupes ne répondant pas aux mêmes items. |

#### H6. Position officielle perçue et ouverture individuelle

> La position officielle perçue de la communauté irait de pair avec l'ouverture individuelle à l'IA.

| | |
|---|---|
| **Variables** | `communaute_position_officielle` (item brut, valence de 1 à 5) et `aiOpenness` |
| **Items partagés** | aucun. `communaute_position_officielle` alimente `communityContext`, jamais `aiOpenness` |
| **Test** | corrélation de Spearman, bilatérale |
| **Famille** | A (Holm sur 4 tests) |
| **Effet attendu** | ρ = 0,30 |
| **N pour puissance 0,80** | **≈ 94** |
| **Réserve** | mettre en relation `communityContext` et `aiOpenness` serait ici préférable à éviter : la dimension contient l'item testé, et l'association serait pour partie mécanique. L'hypothèse porte donc sur l'item brut. |

#### H7. Formation théologique et préoccupation éthique

> Une formation théologique formelle irait de pair avec une préoccupation éthique plus articulée, et moins extrême.

| | |
|---|---|
| **Variables** | `profil_formation_theologique` (4 modalités) et `ethicalConcern` |
| **Items partagés** | aucun |
| **Test** | Kruskal-Wallis sur les moyennes, et test de Levene sur les variances, la seconde partie de l'énoncé portant sur la dispersion |
| **Famille** | B (Holm sur 4 tests) |
| **Effet attendu** | f = 0,25 sur 4 groupes |
| **N pour puissance 0,80** | **≈ 180** |
| **Réserve** | l'item est nouveau en v2 : les 23 réponses v1 ne peuvent pas y contribuer. |

#### H8. Fréquence d'usage et préoccupation éthique

> Un usage quotidien de l'IA irait de pair avec une préoccupation éthique plus faible.

| | |
|---|---|
| **Variables** | `ctrl_ia_frequence` (item brut ordinal) et `ethicalConcern` |
| **Items partagés** | aucun. `ctrl_ia_frequence` alimente `aiOpenness`, jamais `ethicalConcern` |
| **Test** | corrélation de Spearman, bilatérale |
| **Famille** | A (Holm sur 4 tests) |
| **Effet attendu** | ρ = −0,25 |
| **N pour puissance 0,80** | 124 en paramétrique, **≈ 137** pour le test de rang |

### 9.3 Effectif cible

L'hypothèse la plus exigeante est H7, avec environ 180 répondants complets et non écartés, sous les hypothèses d'effet ci-dessus. Un effectif de **200 réponses exploitables** est donc retenu comme cible pour l'analyse confirmatoire. En dessous de cet effectif, les huit hypothèses sont rapportées comme exploratoires, avec leurs intervalles de confiance et sans conclusion de rejet.

---

## 10. Plan d'analyse et interprétation des corrélations

### 10.1 Principe directeur

Une corrélation est un fait. Une interprétation est une hypothèse graduée. Ces deux niveaux sont séparés dans le code comme dans la restitution : `CorrelationFact` porte r, n, l'intervalle de confiance, le p brut et le p ajusté ; `Interpretation` porte un mécanisme, un libellé et un raisonnement. Le mot « prouve » n'est employé nulle part.

### 10.2 Catalogue pré-spécifié

Les interprétations concurrentes sont **écrites avant de voir les données**, pour chaque paire de dimensions et pour chaque paire liée à une hypothèse. Chaque paire propose deux à quatre mécanismes concurrents, parmi : `x_causes_y`, `y_causes_x`, `confounder`, `selection`, `method_artifact`, `construct_overlap`. Aucun libellé n'affirme une causalité ; tous sont au conditionnel. Pour une paire sans entrée au catalogue, des mécanismes génériques sont engendrés, avec une note interprétative plafonnée à 0,4.

### 10.3 Score de certitude et grades A à D

Chaque interprétation reçoit deux notes entre 0 et 1.

**La certitude statistique** ne dépend que du fait. Elle vaut 0 si n est inférieur à 20. Au delà, elle combine quatre composantes pondérées : l'effectif (poids 0,30, saturé à 200 observations), la taille d'effet (poids 0,25, quatre paliers aux seuils 0,1, 0,3 et 0,5 repris de Cohen comme convention de lecture), la précision de l'intervalle de confiance (poids 0,20, décroissante avec sa largeur) et le franchissement du seuil α après correction (poids 0,25).

**La certitude interprétative** ne dépend que du mécanisme et du contexte du devis. Un mécanisme causal en devis transversal part de 0,50, un confondeur mesuré de 0,70, un recouvrement de construit de 0,60 (0,80 si des items sont partagés), un biais de sélection sur échantillon auto-sélectionné de 0,55. Une pénalité de 0,20 est appliquée si l'interprétation cite un confondeur qui n'est pas collecté par l'enquête, donc non contrôlable.

**Règle de l'artefact de méthode.** Lorsque les deux variables partagent au moins un item, le mécanisme `method_artifact` reçoit une base de 0,90, c'est-à-dire la note la plus haute du barème. Autrement dit, si deux mesures partagent un item, l'explication la plus certaine de leur corrélation est qu'elles se recouvrent, et non qu'un phénomène les relie. En v2, la règle « un item, une dimension » fait que ce cas ne devrait plus se produire entre dimensions ; le contrôle est maintenu parce qu'il reste possible entre une dimension et un item brut.

**Note globale et grade.** La note globale est la **moyenne géométrique** des deux notes, ce qui interdit à une excellente statistique de compenser une interprétation faible, et réciproquement.

| Grade | Note globale | Lecture |
|---|---|---|
| **A** | ≥ 0,75 | association nette et mécanisme plausible ; reste une hypothèse |
| **B** | ≥ 0,50 | association crédible, mécanisme discutable ou confondeurs non contrôlés |
| **C** | ≥ 0,25 | signal faible ou interprétation fragile |
| **D** | < 0,25 | non concluant |

Une interprétation n'est déclarée préférée que si sa note globale dépasse celle de la suivante d'au moins 0,15. Sinon le résultat est déclaré ambigu et plusieurs lectures sont présentées à égalité. **Au moins une explication concurrente est toujours affichée.**

Tous ces seuils sont des heuristiques de lecture, non une calibration validée. Ils servent à ordonner des explications et à rendre visibles les réserves, jamais à trancher.

### 10.4 Analyses prévues

**Confirmatoires.** Les huit hypothèses de la section 9, avec les tests, les familles et les corrections annoncés.

**Descriptives.** Distributions univariées de tous les items, effectifs par strate confessionnelle, par statut, par canal d'entrée et par version d'instrument, taux de complétion et durée médiane de passation.

**Exploratoires.** Matrice des corrélations entre dimensions, avec intervalles de confiance et p ajustés par Benjamini et Hochberg ; analyse factorielle exploratoire de la structure dimensionnelle dès que l'effectif le permet, avec un objectif d'au moins cinq observations par item ; comparaison des strates v1 et v2 sur les items marqués « conservé\* ». Tout résultat exploratoire est rapporté comme tel, y compris s'il est plus frappant que les résultats confirmatoires.

### 10.5 Restitution

Les interprétations ne sont **pas** montrées aux répondants. Elles sont réservées à l'administration de l'étude et aux publications. Le répondant reçoit ses scores, son profil avec la mention « attribution heuristique », et le cas échéant son rang empirique une fois le seuil de 30 participants atteint.

---

## 11. Limites

### 11.1 Auto-sélection

Le questionnaire annonce son sujet dès la page d'accueil. Les personnes indifférentes ou hostiles au sujet sont moins susceptibles de commencer, et celles qui ont une opinion tranchée sont surreprésentées. Ce biais affecte simultanément les deux variables de la plupart des paires étudiées, ce qui signifie qu'il peut engendrer une association dans l'échantillon en l'absence de toute association dans la population. C'est pourquoi le mécanisme `selection` figure dans le catalogue d'interprétations de la quasi-totalité des paires.

### 11.2 Boule de neige par partage

L'application encourage le partage du profil. Les répondants recrutent donc des personnes de leur réseau, c'est-à-dire souvent de leur communauté, de leur confession et de leur classe d'âge. Les observations ne sont pas indépendantes, ce que les tests employés supposent pourtant. Les chaînes de diffusion n'étant pas tracées, cette dépendance ne peut être ni mesurée ni modélisée. Les intervalles de confiance sont donc trop étroits d'une ampleur inconnue.

### 11.3 Non-invariance de mesure entre clergé et laïcs

Le routage expose ces deux groupes à des items différents. Les scores complets `sacredBoundary` et `aiOpenness` ne sont donc pas comparables d'un groupe à l'autre : ils ne mesurent pas la même chose. Les sous-scores de noyau commun (section 4.3) existent pour cette raison, et H5 porte exclusivement sur `sacredBoundaryCore`. L'invariance de mesure des items du noyau eux-mêmes n'a pas été testée et ne pourra l'être qu'avec un effectif nettement supérieur.

### 11.4 Devis transversal

Toutes les variables sont mesurées au même moment. Aucun sens de causalité n'est identifiable. L'ordre des questions n'est pas contrebalancé, ce qui ouvre la possibilité d'effets d'amorçage : les items de religiosité précèdent les items d'attitude envers l'IA.

### 11.5 Désirabilité sociale mesurée par cinq items

Cinq items dichotomiques ne suffisent pas à obtenir une fidélité acceptable. Le drapeau est un signal grossier ; son absence ne garantit pas l'absence de biais et sa présence ne prouve pas un biais. Il est utilisé pour une analyse de sensibilité, jamais pour exclure un répondant ni pour corriger un score.

### 11.6 Traduction non validée

Les items du CRS-5, ainsi que les items inspirés du Godspeed et de l'AIAS, sont employés en français dans une traduction interne, sans traduction et rétrotraduction documentée ni étude d'équivalence. Les propriétés psychométriques publiées pour les instruments d'origine ne se transportent pas à ces versions.

### 11.7 Contamination par le tableau de bord public

Les résultats agrégés sont consultables en ligne pendant la collecte. Un répondant peut les avoir consultés avant de répondre, notamment s'il arrive par un partage renvoyant vers les résultats. Cette exposition n'est pas mesurée. Elle peut produire un effet de conformité aux réponses majoritaires ou, à l'inverse, de différenciation. C'est un coût assumé du choix de la transparence en temps réel ; il doit figurer dans toute publication tirée de ces données.

### 11.8 Construits exploratoires

Six dimensions sur sept reposent sur des construits ad hoc, sans analyse factorielle, sans estimation de fidélité et sans validité convergente ou discriminante établie. Les poids sont fixés à 1 pour presque tous les items, non parce que cette valeur serait justifiée, mais parce qu'aucune donnée ne permet d'en justifier une autre.

### 11.9 Autres limites

- **Portée linguistique et culturelle.** Francophonie européenne majoritairement, avec un français métropolitain. Aucune généralisation à d'autres aires culturelles.
- **Biais numérique.** L'enquête est en ligne ; les chrétiens peu connectés sont exclus de fait, et cette exclusion est corrélée à l'âge, au milieu et probablement aux attitudes mesurées.
- **Statut `responsable_non_ordonne`.** Cette modalité n'existait pas en v1 : les répondants concernés s'étaient répartis entre `clerge` et `laic_engagé`, ce qui rend la comparaison clergé contre laïcs partiellement instable entre les deux versions.
- **Effectif.** Au 7 septembre 2026, 23 réponses v1 sont en base. Aucun test confirmatoire n'est réalisable à ce stade.

---

## 12. Éthique et protection des données

### 12.1 Consentement, version 2.0

Le consentement est recueilli avant la première question, par une case à cocher non précochée. Il porte sur les points suivants :

- **Âge minimal de 18 ans.** L'étude ne recueille pas de données de mineurs.
- **Finalité.** Recherche exploratoire sur les attitudes face à l'IA dans les pratiques chrétiennes, et restitution d'un profil au répondant.
- **Données recueillies.** Réponses au questionnaire, durée de passation, version de l'instrument et canal d'entrée. Aucune adresse IP ni adresse électronique n'est conservée en clair : seule une empreinte cryptographique à clé (HMAC-SHA256) est stockée, aux seules fins de détection de doublons et de limitation des abus.
- **Publication d'un jeu de données ouvert anonymisé.** Les réponses individuelles pourront être publiées sous licence CC-BY-4.0, après suppression du commentaire libre et de toute combinaison de modalités potentiellement identifiante.
- **Droit de retrait.** Le répondant peut à tout moment demander l'export ou l'effacement de ses données via la page `/mes-donnees`, sans justification.
- **Variante CNEF.** Sur la porte d'entrée `/cnef`, une clause dédiée précise que le CNEF, partenaire de diffusion, reçoit des résultats agrégés et anonymes et n'a accès à aucune réponse individuelle.

### 12.2 Données sensibles au sens de l'article 9 du RGPD

Les convictions religieuses sont des données à caractère personnel relevant de l'article 9, paragraphe 1, du règlement (UE) 2016/679. Leur traitement est fondé sur le **consentement explicite** du répondant, au sens de l'article 9, paragraphe 2, point a. Ce consentement est libre, spécifique, éclairé et univoque : la participation est volontaire, la finalité est décrite avant le recueil, et aucun avantage n'est conditionné à la participation.

Les mesures de minimisation applicables sont les suivantes : absence de recueil du nom et de l'adresse postale ; empreintes à clé au lieu des identifiants directs ; k-anonymat à 5 sur les agrégats publiés ; seuil de 30 participants avant toute publication de distribution ; purge des sessions abandonnées à 90 jours ; anonymisation des réponses au terme de la durée de conservation.

### 12.3 Débriefing

L'écran de fin comporte une phrase de débriefing expliquant que les cinq affirmations en vrai ou faux mesuraient la tendance à se présenter sous un jour favorable, et qu'elles n'entrent pas dans le calcul du profil. Cette information est donnée après coup et non avant, car l'annoncer d'emblée invaliderait la mesure ; le répondant n'est à aucun moment trompé sur la finalité générale de l'étude.

### 12.4 Répondants écartés

Les personnes déclarant être sans religion ou hors du champ chrétien voient le questionnaire s'arrêter après la première question, avec un écran de remerciement. Leur réponse est conservée uniquement pour documenter le volume de trafic écarté, et n'est jamais scorée.

---

## 13. Références

Bartneck, C., Kulić, D., Croft, E., et Zoghbi, S. (2009). Measurement instruments for the anthropomorphism, animacy, likeability, perceived intelligence, and perceived safety of robots. *International Journal of Social Robotics*, 1(1), 71-81. https://doi.org/10.1007/s12369-008-0001-3

Benjamini, Y., et Hochberg, Y. (1995). Controlling the false discovery rate: A practical and powerful approach to multiple testing. *Journal of the Royal Statistical Society: Series B*, 57(1), 289-300.

Cohen, J. (1988). *Statistical power analysis for the behavioral sciences* (2e éd.). Lawrence Erlbaum Associates.

Crowne, D. P., et Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. *Journal of Consulting Psychology*, 24(4), 349-354. https://doi.org/10.1037/h0047358

Holm, S. (1979). A simple sequentially rejective multiple test procedure. *Scandinavian Journal of Statistics*, 6(2), 65-70.

Huber, S., et Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). *Religions*, 3(3), 710-724. https://doi.org/10.3390/rel3030710

Reynolds, W. M. (1982). Development of reliable and valid short forms of the Marlowe-Crowne Social Desirability Scale. *Journal of Clinical Psychology*, 38(1), 119-125. https://doi.org/10.1002/1097-4679(198201)38:1<119::AID-JCLP2270380118>3.0.CO;2-I

Strahan, R., et Gerbasi, K. C. (1972). Short, homogeneous versions of the Marlowe-Crowne Social Desirability Scale. *Journal of Clinical Psychology*, 28(2), 191-193. https://doi.org/10.1002/1097-4679(197204)28:2<191::AID-JCLP2270280220>3.0.CO;2-G

Wang, Y. Y., et Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale: An initial application in predicting motivated learning behavior. *Interactive Learning Environments*, 30(4), 619-634. https://doi.org/10.1080/10494820.2019.1674887

**Références citées pour le raisonnement, à vérifier avant toute publication :**

- Bethlehem, J. (2010). Selection bias in web surveys. *International Statistical Review*, 78(2), 161-188. [à vérifier : volume et pagination]
- Podsakoff, P. M., MacKenzie, S. B., Lee, J. Y., et Podsakoff, N. P. (2003). Common method biases in behavioral research. *Journal of Applied Psychology*, 88(5), 879-903. [à vérifier : pagination]

---

## 14. Changelog

Les dates ci-dessous ont été rétablies dans un ordre chronologique cohérent. Les versions antérieures de ce document mêlaient des dates de 2025 et de 2026 de façon contradictoire, notamment une révision « v1.2.0 (2026-01-25) » antérieure à une révision « v1.1.0 (2025-01-25) ». La chronologie retenue est celle de l'historique du dépôt.

### v2.0.0, 7 septembre 2026, refonte du scoring et de l'instrument

**Instrument.** 58 questions. Screen-out effectif sur `sans_religion`. Ajout de `profil_formation_theologique` et du statut `responsable_non_ordonne`. Nomenclature orthodoxe corrigée (byzantin et oriental). Séparation de « Autre » et de « Je préfère ne pas répondre » pour le genre. Ajout d'une modalité `sans_reponse` sur treize items attitudinaux. Tranches contiguës et exclusives sur `profil_milieu`, `profil_anciennete_foi`, `profil_annees_ministere`, `profil_taille_communaute`. Exclusivité des modalités `aucun*`. `questions.ts` devient l'unique source du texte affiché. Durée annoncée portée de 5 à 7 minutes à 8 à 12 minutes, en attente de la médiane observée.

**Dimensions.** Un item alimente exactement une dimension. Sortie de toutes les variables démographiques. `communityInfluence` renommée `communityContext` et recotée sur des valences. `theo_risque_futur` sortie du scoring ordinal. Introduction de `MIN_ITEMS`, de la politique de données manquantes et des sous-scores de noyau commun.

**Religiosité.** Moyenne brute du CRS-5, sans correction par la désirabilité sociale. Recodage Huber sur la pratique privée. Classification à trois classes.

**Désirabilité sociale.** Suppression de `adjustScoreForBias` et de `getBiasConfidenceMultiplier`. Le score devient une covariable et un drapeau. Retrait de la mention erronée « Form C ».

**Profils.** Distance L1 aux plages, bonus appliqués dans l'espace des scores, score `100 × exp(−0,5 × d)`, tri sur le score brut, départage déterministe documenté, seuil de quatre dimensions valuées, `attribution: 'heuristic'` et `profileConfidence`. Plages de l'Équilibriste resserrées. Descriptions de profil réécrites sans formules de Barnum ; « pistes de croissance » renommées « pistes de réflexion, si vous le souhaitez ».

**Comparaisons.** Suppression des paramètres de population postulés, de la fonction de répartition normale et des percentiles côté client. Introduction de `GET /api/results/norms` et des rangs empiriques à partir de 30 participants.

**Indicateurs.** L'« indice de résistance spirituelle » devient l'« écart d'usage », sans inférence motivationnelle.

**Agrégats.** Expansion des tableaux et des matrices en SQL, k-anonymat à 5 par cellule, seuil de 30 participants avant publication, suppression des valeurs de démonstration.

**Analyse.** Nouveau module `src/lib/analysis` : faits de corrélation avec intervalle de Fisher et p ajusté, catalogue pré-spécifié d'interprétations concurrentes, score de certitude en deux volets et grades A à D.

**Documentation.** Réécriture complète de ce document. Ajout de `docs/PREREGISTRATION.md`. Régénération de `docs/codebook.json` et de `docs/data-dictionary.csv`. Retrait du score FAIR autoévalué, remplacé par une déclaration explicite d'autoévaluation (section ci-dessous). Archivage des notes de cadrage préparatoires devenues obsolètes.

### v1.4.0, 19 juin 2026, variante CNEF et segmentation évangélique

Ajout de la porte d'entrée `/cnef`, alimentant le même questionnaire et le même stockage. Passage de la sous-question protestante en deux étapes, avec le clivage charismatique contre non charismatique porté par un champ canonique unique `profil_confession_evangelique`. Remappage sans perte des 14 réponses antérieures, la valeur d'origine étant conservée dans la clé interne `_legacy_protestante` : `evangelique` (non charismatique) vers `non_charismatique` pour 9 réponses, `pentecotiste` (charismatique) vers `charismatique` pour 5 réponses. Exclusion des clés internes préfixées par `_` et des questions à texte libre de l'endpoint d'agrégats public.

### v1.2.0, 25 mars 2026, approfondissement psychométrique

Remplacement de l'item unique d'anthropomorphisme par deux items inspirés du Godspeed (nature et conscience). Ajout d'un item d'opacité inspiré de l'AIAS. Mise à jour des calculs de perception psychologique et de préoccupation éthique. Introduction, alors, de paramètres de population postulés et d'une correction de score par la désirabilité sociale : ces deux mécanismes ont été **supprimés en v2.0.0**, faute de fondement empirique.

### v1.1.0, 25 janvier 2026, renforcement de la frontière sacrée

Ajout de `theo_liturgie_ia`, `theo_activites_sacrees` et `theo_mediation_humaine`, réduisant la dépendance de la dimension à un item unique. Ajout des sous-groupes confessionnels catholiques et évangéliques. Corrections terminologiques œcuméniques : « eucharistie » devient « eucharistie ou cène », « confession » devient « confession ou réconciliation », « transmettre la grâce » devient une formulation moins catholico-centrée, « médiation humaine » devient « présence humaine » pour éviter la confusion avec la médiation du Christ, « traditionaliste ou libéral » devient « conservateur ou progressiste », « exégèse » et « catéchèse » sont explicités.

### v1.0.0, janvier 2026, première version publique

Instrument initial, sept dimensions, huit profils, tableau de bord public.

---

## Annexe. Autoévaluation FAIR

Les versions antérieures de ce document affichaient un « score global FAIR de 30 sur 48 ». Ce chiffre était une **autoévaluation du concepteur de l'étude**, sans grille externe, sans évaluateur indépendant et sans procédure documentée. Il ne provenait d'aucun instrument d'évaluation FAIR reconnu et ne doit pas être cité comme une mesure.

Ce qui est vérifiable est l'état des livrables :

| Livrable | État | Emplacement |
|---|---|---|
| Licence duale, code et données | présent | `/LICENSE` (MIT et CC-BY-4.0) |
| Codebook lisible par machine | présent, régénéré en v2.0.0 | `docs/codebook.json` |
| Dictionnaire des variables | présent, régénéré en v2.0.0 | `docs/data-dictionary.csv` |
| Codebook source, avec la logique de scoring | présent | `src/lib/scoring/codebook.ts` |
| Pré-enregistrement | rédigé, non déposé | `docs/PREREGISTRATION.md` |
| Identifiant pérenne (DOI) | absent | à obtenir au dépôt |
| Jeu de données ouvert anonymisé | absent | prévu après la collecte |
| Enregistrement sur un registre public | absent | prévu (OSF) |

Aucun score global n'est revendiqué tant qu'une évaluation externe n'a pas été conduite.

---

*Document révisé le 7 septembre 2026. Instrument v2.0.0. Étude indépendante conduite par Romain Girardi.*
