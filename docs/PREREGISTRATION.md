# Préenregistrement, enquête « IA et foi chrétienne »

*Modèle : OSF Preregistration (formulaire standard), rempli pour un dépôt sur OSF Registries. L'ordre des rubriques est celui du formulaire.*

Convention de notation : les lettres statistiques (p, r, ρ, d, f, n, N) sont écrites en romain dans tout le document. N désigne l'effectif total de l'échantillon analysé pour un test ; n désigne l'effectif d'un groupe ou d'une paire.

---

## 1. Informations sur l'étude

### 1.1 Identification

| Champ | Valeur |
|---|---|
| **Titre** | Attitudes des chrétiens francophones face à l'intelligence artificielle générative dans les pratiques spirituelles et ministérielles |
| **Auteur** | Romain Girardi |
| **Affiliation** | Aucune. Étude indépendante, non adossée à une institution universitaire ou à un laboratoire |
| **Responsable de traitement** | Romain Girardi |
| **Contact** | contact@ia-foi.fr |
| **Date de dépôt** | 12 septembre 2026 |
| **Date de début de la collecte v2.0.0** | 7 septembre 2026 (mise en production de l'instrument v2.0.0) |
| **Date de clôture de la collecte** | 31 décembre 2026 à 23 h 59, heure de Paris |
| **Version de l'instrument** | 2.0.0, code figé au tag `v2.0.0` (commit [hash au dépôt]) |
| **Version du consentement** | 2.0 |
| **Licence** | MIT pour le code, CC-BY-4.0 pour les données et la documentation |
| **Documentation de référence** | `METHODOLOGY.md`, `docs/SCORING_V2_SPEC.md`, `docs/INSTRUMENT_V2_CHANGES.md`, `docs/codebook.json`, `docs/data-dictionary.csv` |
| **Script d'analyse confirmatoire** | `analysis/confirmatory.py` (section 6.1) |

### 1.2 Question de recherche

Comment des chrétiens francophones déclarent-ils utiliser, refuser ou délimiter l'usage des outils d'intelligence artificielle générative dans leurs pratiques spirituelles et ministérielles, et quelles variables individuelles, théologiques et communautaires sont associées à ces déclarations ?

### 1.3 Objectifs

1. Décrire les usages déclarés et les positions théologiques sur l'usage de l'IA dans le champ spirituel.
2. Tester huit hypothèses directionnelles préspécifiées (section 2), dont deux primaires.
3. Explorer la structure dimensionnelle de l'instrument, en vue d'une révision ultérieure.

### 1.4 Hors champ

L'étude ne vise ni l'estimation de prévalences dans une population définie, ni la validation psychométrique d'un instrument, ni l'établissement de relations causales.

---

## 2. Hypothèses

Les huit hypothèses sont directionnelles et ont été formulées avant la collecte sous l'instrument v2.0.0. Les identifiants de variables et les énoncés sont encodés dans `src/lib/analysis/interpretationCatalog.ts` (constante `HYPOTHESES`) ; le test, la famille, l'effet attendu et l'effectif ne figurent que dans ce document, et `METHODOLOGY.md` (section 9) y renvoie.

Convention de lecture des variables : un identifiant en `snake_case` désigne un item brut du questionnaire ; un identifiant en `camelCase` désigne un score de dimension ou un sous-score de noyau. Les sous-scores de noyau (`sacredBoundaryCore`, `aiOpennessCore`) sont calculés sur les seuls items posés à tous les répondants (section 5.2).

**Hiérarchie.** H1 et H8 sont primaires : elles portent sur des variables mesurées chez tous les répondants, sans condition de sous-groupe, et disposent de la meilleure puissance à l'effectif prévu. Les six autres sont secondaires. Cette hiérarchie fixe les deux familles de la correction de Holm (section 6.1).

**Une statistique confirmatoire par hypothèse.** Pour chaque hypothèse, une seule statistique, nommée dans le tableau, entre dans la correction de Holm et fonde la décision. Toute autre statistique calculée sur la même paire est une analyse de sensibilité (section 6.6) sans effet sur la décision.

| Id | Énoncé | Variables | Statistique confirmatoire | Rang | Effet attendu | N pour puissance 0,80 | Condition d'effectif |
|---|---|---|---|---|---|---|---|
| **H1** | Une centralité religieuse plus élevée est associée à une frontière sacrée de noyau plus stricte | `religiosity` × `sacredBoundaryCore` | corrélation de Spearman bilatérale, ex æquo corrigés | primaire | ρ = 0,30 | ≈ 94 (85 en paramétrique) | aucune |
| **H2** | Les évangéliques charismatiques présentent une ouverture à l'IA de noyau plus élevée que les évangéliques non charismatiques | `profil_confession_evangelique` (`charismatique`, `non_charismatique`) × `aiOpennessCore` | test U de Mann-Whitney unilatéral (charismatiques > non charismatiques) | secondaire | d = 0,50 | ≈ 141 (64 par groupe en paramétrique) | ≥ 71 par bras parmi les évangéliques |
| **H3** | Les répondants plus jeunes présentent une ouverture à l'IA de noyau plus élevée, à religiosité égale | `profil_age` (codé 1 à 4) × `aiOpennessCore`, covariable `religiosity` | coefficient de `profil_age` dans la régression linéaire de `aiOpennessCore` sur `profil_age` et `religiosity`, test t bilatéral | secondaire | f² = 0,15 pour le coefficient (signe négatif attendu) | 55 pour le coefficient (u = 1) ; 68 pour le modèle entier (u = 2) | les quatre classes d'âge sont non vides |
| **H4** | Une orientation théologique plus conservatrice est associée à une frontière sacrée de noyau plus stricte | `theo_orientation` ordonnée `traditionaliste` < `modere` < `progressiste` × `sacredBoundaryCore` | test de Jonckheere-Terpstra bilatéral | secondaire | f = 0,25 sur 3 groupes | ≈ 174 (158 en paramétrique) | trois groupes non vides ; ≈ 58 par groupe pour la puissance annoncée |
| **H5** | Le clergé présente une frontière sacrée de noyau plus stricte que les laïcs | `profil_statut` recodé clergé / laïcs × `sacredBoundaryCore` | test U de Mann-Whitney bilatéral | secondaire | d = 0,50 | ≈ 141 (64 par groupe en paramétrique) | ≥ 71 clergé et ≥ 71 laïcs |
| **H6** | Chez les répondants qui déclarent une position officielle de leur Église, une position perçue plus favorable est associée à une ouverture à l'IA de noyau plus élevée | `communaute_position_officielle` ordonnée `oui_defavorable` < `oui_prudent` < `oui_favorable` × `aiOpennessCore` | test de Jonckheere-Terpstra bilatéral | secondaire | équivalent de ρ = 0,30 | ≈ 94 dans le sous-échantillon | ≥ 94 répondants `oui_*`, trois niveaux non vides |
| **H7** | Les répondants ayant une formation théologique formelle présentent une dispersion de la préoccupation éthique plus faible que les autres | `profil_formation_theologique` recodé formelle / autre × `ethicalConcern` | test de Brown-Forsythe unilatéral (dispersion plus faible dans le groupe formé) | secondaire | rapport de 0,70 entre les écarts absolus à la médiane | ≈ 100 par groupe (simulation, section 4.4) | ≥ 100 par groupe ; sous-puissante en l'état, voir 4.4 |
| **H8** | Une fréquence d'usage plus élevée de l'IA est associée à une préoccupation éthique plus faible | `ctrl_ia_frequence` (5 niveaux) × `ethicalConcern` | corrélation de Spearman bilatérale, ex æquo corrigés | primaire | ρ = −0,25 | ≈ 137 (124 en paramétrique) | aucune |

**Codage de `profil_age`.** Les quatre modalités affichées sont codées 1 = « 18-35 ans », 2 = « 36-50 ans », 3 = « 51-65 ans », 4 = « Plus de 66 ans » (identifiants `18-35`, `36-50`, `51-65`, `66+`). Un coefficient négatif signifie donc une ouverture plus élevée chez les plus jeunes.

**Recodages de groupe.** Pour H5, le clergé regroupe les statuts `clerge`, `religieux` et `responsable_non_ordonne` ; les laïcs regroupent `laic_engagé`, `laic_pratiquant` et `curieux` (constantes `CLERGY_STATUSES` et `LAY_STATUSES` de `src/lib/utils/answers.ts`). Les religieux non ordonnés et les prédicateurs laïcs sont donc comptés avec le clergé. Pour H7, la formation formelle regroupe `diplome_theologie` et `formation_pastorale` ; les autres regroupent `aucune` et `cours_ponctuels`. Pour H4, les modalités `ne_sait_pas` et `sans_reponse` sont exclues. Pour H6, les modalités `non`, `ne_sait_pas` et `sans_reponse` sont exclues : l'hypothèse est testée sur le seul sous-échantillon déclarant une position officielle, qui sera vraisemblablement minoritaire, et l'effectif de ce sous-échantillon est rapporté.

**Scores de noyau et scores complets.** H1, H2, H3, H4 et H6 sont testées sur les sous-scores de noyau, H5 également. Les scores complets `sacredBoundary` et `aiOpenness` contiennent des items conditionnels au statut, donc mesurent des ensembles d'items différents chez le clergé et chez les laïcs, alors que le statut est lié à la religiosité, à l'orientation théologique et à l'âge. L'invariance de mesure des items de noyau n'est pas testée. Toute comparaison ou association calculée sur un score complet est descriptive. `ethicalConcern` ne contient que des items de noyau, et son score complet est le score utilisé pour H7 et H8.

**Non-recouvrement des mesures.** Pour chacune des huit paires, les deux variables ne partagent aucun item. Un item alimente exactement une dimension, aucune variable démographique n'entre dans une dimension, et H3, H6 et H8 opposent un item brut à une dimension qui ne le contient pas. Le module d'analyse expose `sharedItems` et signale toute paire recouvrante comme artefact de méthode.

**Hypothèses retirées.** Les hypothèses de la v1 portant sur des propriétés de l'algorithme de scoring, dont une sur la rareté des profils extrêmes, ont été retirées : elles se déduisent des définitions et ne sont pas testables sur des données.

---

## 3. Devis

| Élément | Valeur |
|---|---|
| **Type d'étude** | observationnelle, transversale, en ligne |
| **Manipulation expérimentale** | aucune |
| **Aveugle** | sans objet |
| **Randomisation** | aucune. L'ordre des blocs et des items est fixe |
| **Mesures répétées** | aucune. Un répondant, une mesure |
| **Groupes** | non assignés. Les groupes analysés (clergé et laïcs, courants confessionnels, classes d'âge) sont des groupes naturels, définis par les réponses |
| **Support** | application web, français et anglais, questionnaire adaptatif |
| **Durée de passation annoncée** | 8 à 12 minutes (section 7, écarts autorisés) |

**Routage.** L'instrument compte 58 questions. Le nombre de questions affichées varie de 46 à 53 selon la confession (0 à 2 sous-questions confessionnelles), le statut (bloc ministère ou bloc laïc) et l'usage déclaré de l'IA (en général et en prédication). Une réponse `sans_religion` à la première question met fin au questionnaire ; le répondant est écarté.

---

## 4. Plan d'échantillonnage

### 4.0 Données existantes

Vingt-trois réponses ont été collectées sous les versions v1.x de l'instrument, la dernière le 23 août 2026, avant la rédaction de ce préenregistrement. Elles ont été rescorées sous la même table de recodage. Aucune analyse confirmatoire n'a été conduite sur elles. Avant l'ajout du verrou décrit en 4.3, l'interface d'administration calculait et affichait des corrélations entre les sept dimensions dès 20 observations ; ces affichages, s'ils ont été consultés, ne portaient que sur ces 23 réponses, exclues de toute analyse confirmatoire.

Ces 23 réponses sont exclues des analyses confirmatoires et du jeu de données ouvert : la version 1.0 du consentement ne mentionnait ni la publication d'un jeu de données ni l'âge minimal. Elles sont conservées dans les agrégats publics et dans les normes empiriques, comme strate `instrumentVersion`, et servent à une note descriptive de comparabilité v1 et v2 (section 6.6). Les items dont le remappage v1 vers v2 est marqué « null » dans `docs/INSTRUMENT_V2_CHANGES.md` sont inutilisables pour ces réponses.

**État de la base au dépôt.** Réponses v2.0.0 : 0 au 12 septembre 2026, [heure au dépôt] UTC. Réponses v1.x : 23, dont [n au dépôt] lignes `sans_religion` écartées.

### 4.1 Recrutement

L'échantillonnage est non probabiliste et combine trois canaux :

1. **Convenance.** Diffusion publique du lien.
2. **Boule de neige.** Le partage est encouragé par l'application (profil partageable, code QR, rapport PDF). Les chaînes de diffusion ne sont pas tracées.
3. **Partenariat de diffusion.** Une porte d'entrée dédiée (`/cnef`) est diffusée par le Conseil national des évangéliques de France (CNEF). Le CNEF n'est pas coauteur, n'a pas participé à la conception de l'instrument et ne reçoit que des résultats agrégés et anonymes.

Le canal d'entrée est enregistré (`metadata.entryVariant`, valeurs `general` ou `cnef`) et est traité comme strate.

**Les deux portes d'entrée.** La porte générale annonce une enquête sur la transformation des pratiques religieuses par l'IA, avec les mentions « Méthodologie » et « 8 à 12 minutes ». La porte CNEF annonce que « le CNEF prépare une déclaration sur l'intelligence artificielle » et que l'enquête « recueille les pratiques déclarées d'évangéliques francophones, sans prétention de représentativité » ; elle préremplit `profil_confession = protestant` et `profil_confession_protestante = evangelique` et démarre le questionnaire à la question `profil_confession_evangelique`. Le canal `cnef` est donc emboîté dans la confession évangélique, et la consigne diffère entre les deux bras, ce qui est une source possible d'effet de demande. Les deux portes qualifient les réponses de « pseudonymisées », les réponses étant reliées à des empreintes de courriel, d'appareil et d'adresse IP ; le libellé « 100 % anonyme » d'une version antérieure a été retiré.

**Filtres de recrutement.** Cinq mécanismes s'appliquent avant l'enregistrement d'une réponse (`src/app/api/survey/submit/route.ts`, fonction SQL `check_submission_allowed`, migration 010) :

1. un cookie `survey_submitted` d'une durée d'un an, déposé après toute soumission non écartée ;
2. un verrou permanent sur l'empreinte du navigateur (`fingerprint_id`) après une soumission réussie ;
3. un verrou permanent sur l'identifiant anonyme (`anonymous_id`) après une soumission réussie ;
4. un plafond de 5 soumissions réussies par empreinte d'adresse IP sur une fenêtre glissante de 30 jours ;
5. un refus de toute empreinte de courriel déjà présente dans `email_hashes`.

Une soumission bloquée est refusée avant insertion (HTTP 403) ; il n'existe donc pas de « seconde soumission conservée ». La vérification de l'adresse électronique est obligatoire : l'écran de vérification ne propose aucune option pour continuer sans adresse. Le plafond par adresse IP tronque à 5 les groupes situés derrière un même réseau (séminaire, communauté, famille), ce qui pèse en particulier sur le recrutement du clergé. Le nombre de tentatives bloquées, par motif (`blocked_reason`), est relevé chaque mois dans `submission_tracking` avant sa purge à 90 jours, et publié avec les résultats. Un répondant écarté ne déclenche aucun verrou.

### 4.2 Population visée et représentativité

Population visée : personnes majeures se reconnaissant dans la foi chrétienne et lisant le français ou l'anglais. Aucune représentativité n'est revendiquée. Il n'existe pas de base de sondage, aucun tirage aléatoire n'est réalisé et aucune pondération de redressement n'est appliquée. Les résultats décrivent l'échantillon obtenu.

### 4.3 Réponse exploitable, effectif cible et règle d'arrêt

**Réponse exploitable.** Une réponse exploitable est une ligne de la table `responses` telle que : `consent_given = true` ; `metadata.screenedOut` absent ou faux et `profil_confession ≠ sans_religion` ; `metadata.instrumentVersion` commençant par « 2. ». Cette définition est codée dans la fonction `isExploitableV2Response` de `src/lib/admin/stats-helpers.ts`.

**Règle d'arrêt.** La collecte est close le 31 décembre 2026 à 23 h 59, heure de Paris, quel que soit l'effectif. Les tests confirmatoires sont conduits une seule fois, sur les réponses exploitables présentes à cette date. Aucun test d'hypothèse n'est conduit avant la clôture, et aucune décision de poursuite ou d'arrêt n'est prise au vu d'un résultat.

**Effectif prévu.** L'effectif de 200 réponses exploitables est la taille d'échantillon prévue pour la puissance (section 4.4). Il n'est pas un critère d'arrêt. Si l'effectif à la clôture est inférieur, les hypothèses sont testées comme prévu et rapportées avec la règle de sous-puissance de la section 4.4.

| Palier | Effectif de réponses exploitables | Usage |
|---|---|---|
| Publication des agrégats | 30 | Le tableau de bord public et les rangs empiriques s'activent |
| Analyse descriptive | 100 | Distributions par item et par strate, sans test d'hypothèse |
| Analyse confirmatoire | 200 prévues, à la clôture | Les huit hypothèses sont testées, une seule fois, selon le plan de la section 6 |
| Analyse factorielle exploratoire | 120 | AFE sur les 24 items de noyau posés à tous (5 observations par item) ; séparément pour le clergé et pour les laïcs dès 120 dans chaque groupe |

**Verrou de l'interface d'administration.** L'interface d'administration désactive le calcul de toute corrélation entre dimensions et entre une dimension et un item d'hypothèse tant que l'effectif exploitable est inférieur à 200 (constante `CONFIRMATORY_N = 200` et fonction `buildCorrelationsLock` dans `src/lib/admin/stats-helpers.ts`, garde appliquée à `computeCorrelations`, commit [hash au dépôt]). Les phrases de synthèse qui rapportaient un coefficient ou un p ajusté sont supprimées dans le même état. Toute consultation d'une statistique bivariée avant la clôture est consignée comme écart au plan.

Le tableau de bord public affiche des distributions univariées pendant la collecte. Il n'affiche aucune association bivariée ni aucun test. Sa consultation ne donne donc aucune information utile à une décision d'arrêt.

### 4.4 Justification de l'effectif

**Formules.** α = 0,05, puissance 0,80, z(0,975) = 1,960 et z(0,80) = 0,842. Pour une corrélation, l'approximation de Fisher : N = ((z(1−α/2) + z(1−β)) / C)² + 3, avec C = 0,5 × ln((1 + r) / (1 − r)). Pour deux moyennes indépendantes de tailles égales : n par groupe = 2 × ((z(1−α/2) + z(1−β)) / d)², plus un pour le passage du z au t. Pour trois groupes ou plus, l'effectif est celui d'une analyse de variance à un facteur, loi F non centrée. Pour le coefficient de H3, l'effectif est celui d'un test F sur u = 1 degré de liberté au numérateur dans un modèle à deux prédicteurs, f² = 0,15. Lorsque la statistique retenue est un test de rang, l'effectif paramétrique est majoré de 10 %, ordre de grandeur de la perte d'efficacité asymptotique relative dans le cas gaussien.

**Valeurs.** r = 0,30 donne 85 (84 en calcul exact), soit 94 après majoration ; r = 0,25 donne 124, soit 137 ; d = 0,50 donne 64 par groupe, 128 au total, soit 141 ; f = 0,25 sur 3 groupes donne 158, soit 174 ; f² = 0,15 donne 55 pour le coefficient de `profil_age` (u = 1) et 68 pour le modèle entier (u = 2). Le coefficient est la statistique confirmatoire de H3 ; 55 est donc l'effectif contraignant pour H3. Les effectifs de H4 supposent des groupes équilibrés, ce qu'une variable d'orientation théologique ne sera pas.

**H7.** Aucune formule standard ne donne l'effectif d'un test unilatéral de dispersion. Une simulation de Monte-Carlo (graine 20260907, 4 000 réplications par point, test t de Welch unilatéral sur les écarts absolus à la médiane) a été conduite sur un composite de trois items cotés de 1 à 5, engendrés à partir d'une variable latente normale discrétisée, avec un rapport d'écarts types de 0,70 entre le groupe formé et le groupe non formé. La puissance atteint 0,80 à 100 répondants par groupe ; elle vaut 0,75 pour une répartition de 150 et 50, qui est l'ordre de grandeur attendu à 200 réponses. Sur des données normales non discrétisées, 62 par groupe suffisent. Le groupe formé étant vraisemblablement minoritaire, H7 est sous-puissante à l'effectif prévu ; elle est testée comme prévu, rapportée comme secondaire et accompagnée de sa puissance a posteriori.

**Effets attendus et effet minimal d'intérêt.** Les effets attendus (ρ = 0,30, d = 0,50, f = 0,25, f² = 0,15) sont les conventions de Cohen (1988), faute de données antérieures sur ces construits. L'effet minimal d'intérêt est fixé à ρ = 0,10, d = 0,20 et f = 0,10. Ces deux seuils sont utilisés par les critères d'inférence de la section 6.3.

**Sous-groupes.** Les 200 réponses prévues forment un total. H2 exige 71 répondants par bras parmi les seuls évangéliques ; H5 exige 71 clergé et 71 laïcs ; H4 exige trois groupes d'orientation théologique à peu près équilibrés ; H6 exige 94 répondants déclarant une position officielle ; H7 exige 100 répondants par groupe. À 200 réponses, aucune de ces conditions n'est acquise. **Règle.** Si la condition d'effectif d'une hypothèse n'est pas remplie à la clôture, l'hypothèse est testée comme prévu, puis rapportée comme sous-puissante, avec sa puissance a posteriori calculée sur l'effet attendu, jamais sur l'effet observé.

---

## 5. Variables

### 5.1 Variables mesurées

Les 58 questions sont décrites une à une dans `docs/data-dictionary.csv` (identifiant, libellé français et anglais, type, modalités, dimension, catégorie) et dans `docs/codebook.json` (logique de cotation item par item). Trente-deux items alimentent une dimension ; les 24 items de noyau sont posés à tous les répondants.

| Bloc | Contenu |
|---|---|
| Profil | confession et sous-courant, statut, âge, genre, éducation, formation théologique, pays, milieu, secteur, ancienneté de foi, années de ministère, taille de la communauté |
| Religiosité | cinq items CRS-5 |
| Orientation théologique | `theo_orientation` |
| Usage de l'IA | fréquence, contextes, confort, outils existants, attitude générale |
| Ministère (clergé) | usage pour la prédication, nature des tâches déléguées, malaise ressenti, courriel d'accompagnement, charge administrative |
| Usage spirituel (laïcs) | substitution de prière, conseil spirituel |
| Perception psychologique | nature de l'IA, conscience, opacité, image de Dieu, anticipation de remplacement |
| Positions théologiques | inspiration, liturgie, activités sacrées, médiation humaine, risque perçu, utilité perçue |
| Contexte communautaire | position officielle perçue, discussions, perception des pairs |
| Orientation future | intention d'usage, souhait de formation, domaines d'intérêt |
| Commentaire libre | `commentaires_libres` (exclu de toute publication) |
| Désirabilité sociale | cinq items en vrai ou faux |

Métadonnées enregistrées dans `metadata` : `instrumentVersion`, `entryVariant`, `screenedOut`, `language`, `timeSpent` (millisecondes). La version du consentement est une colonne de la table (`consent_version`).

### 5.2 Scores calculés

**Dimensions.** Sept dimensions sont calculées : `religiosity`, `aiOpenness`, `sacredBoundary`, `ethicalConcern`, `psychologicalPerception`, `communityContext`, `futureOrientation`. Pour une dimension d, sur les items applicables au répondant et effectivement répondus :

```
value(d) = Σ (score_i × poids_i) / Σ poids_i     si nItems ≥ minItems
value(d) = null                                  sinon
```

`minItems` vaut 4 pour `religiosity` et 2 ailleurs. Les scores d'item vont de 1 à 5 ; tous les poids valent 1, sauf `min_admin_burden` qui vaut 0,5. Un item alimente une seule dimension, et aucune variable démographique n'entre dans un score ; les réponses « Je ne sais pas », « Je préfère ne pas répondre » et les absences de réponse sont manquantes, exclues de la moyenne et jamais imputées. Chaque dimension expose aussi `nItems`, `maxItems` (items posables compte tenu du routage) et `confidence = nItems / maxItems`. Les tables de cotation, y compris les valeurs non entières (`psych_aias_opacity` : 1 ; 1,5 ; 2,5 ; 4 ; 5), sont fixées a priori dans `src/lib/scoring/score-maps.ts` et reproduites dans `docs/codebook.json` ; elles ne sont pas modifiées après le dépôt.

**Sous-scores de noyau.** `sacredBoundaryCore` (`theo_inspiration`, `theo_liturgie_ia`, `theo_activites_sacrees`, `theo_mediation_humaine`) et `aiOpennessCore` (`ctrl_ia_frequence`, `ctrl_ia_confort`, `digital_attitude_generale`) suivent la même formule, avec un seuil de deux items. Ils servent aux comparaisons entre clergé et laïcs, qui ne répondent pas aux mêmes items conditionnels, et portent les hypothèses H1 à H6.

**Religiosité.** Le score est la moyenne brute des cinq items CRS-5, sans correction. La classification de Huber compte trois classes : non religieux (≤ 2,0), religieux (> 2,0 et < 4,0), hautement religieux (≥ 4,0).

**Désirabilité sociale.** Le score est la proportion d'items endossés dans le sens désirable parmi les items répondus, `null` en dessous de quatre items répondus. Le drapeau est levé si la proportion atteint 0,8 : quatre items sur quatre quand quatre sont répondus, quatre ou cinq sur cinq sinon.

**Écart d'usage.** La variable est catégorielle à quatre modalités (`uses_both`, `uses_general_not_spiritual`, `no_use`, `none` pour indéterminé) et compare l'usage général déclaré à l'usage déclaré dans le champ spirituel ou ministériel. Aucune inférence motivationnelle n'y est attachée.

**Profil.** L'attribution est heuristique. Pour chaque profil, une distance L1 pondérée aux plages idéales est calculée sur les dimensions calculées, avec des poids renormalisés, puis convertie en score par `score = 100 × exp(−0,5 × distance)` ; les bonus sont ajoutés dans l'espace des scores. Aucun profil n'est attribué si moins de quatre dimensions sont calculées. Le profil n'est la variable dépendante d'aucune hypothèse confirmatoire.

---

## 6. Plan d'analyse

### 6.1 Modèles statistiques

Chacune des huit hypothèses de la section 2 est testée une seule fois, avec la statistique confirmatoire annoncée, sur l'échantillon défini par la section 4.3 et les exclusions de la section 6.4.

**Seuil et direction.** α = 0,05. H2 et H7 sont unilatérales dans la direction annoncée. Les six autres statistiques sont bilatérales ; la direction annoncée est lue sur le signe de l'effet observé.

**Correction pour tests multiples.** La correction de Holm est appliquée à l'intérieur de deux familles définies par la hiérarchie des hypothèses : la famille primaire, H1 et H8 (2 tests), et la famille secondaire, H2 à H7 (6 tests). Le taux d'erreur par famille est au plus 0,05. Pour l'ensemble des huit hypothèses, le taux d'erreur est borné par 0,10 (somme des deux familles). Aucune correction n'est appliquée entre les familles.

**Tailles d'effet et intervalles de confiance.** Chaque test est accompagné d'une taille d'effet et de son IC à 95 %, obtenu par bootstrap percentile à 2 000 tirages, graine 20260907 :

| Statistique | Taille d'effet | IC à 95 % |
|---|---|---|
| corrélation de Spearman (H1, H8) | ρ avec correction des ex æquo | bootstrap percentile |
| test U de Mann-Whitney (H2, H5) | delta de Cliff | bootstrap percentile |
| régression linéaire (H3) | coefficient non standardisé et coefficient standardisé de `profil_age` | intervalle du test t du coefficient, et bootstrap percentile en sensibilité |
| test de Jonckheere-Terpstra (H4, H6) | statistique standardisée et tau-b de Kendall | bootstrap percentile du tau-b |
| test de Brown-Forsythe (H7) | rapport des moyennes des écarts absolus à la médiane, groupe formé sur groupe non formé | bootstrap percentile |

**Fidélité des composites.** Avant tout test, l'alpha de Cronbach et l'omega ordinal (sur corrélations polychoriques) sont calculés pour chaque dimension et chaque sous-score de noyau, et publiés. Si l'omega d'un score est inférieur à 0,60, le test préenregistré est conduit tel quel, marqué « fidélité insuffisante » et complété par une analyse item par item. Aucun item n'est retiré ni repondéré après avoir vu les données.

**Indépendance des observations.** Les tests supposent l'indépendance des observations. Le recrutement en boule de neige et par une organisation la viole d'une ampleur non mesurable. Aucune correction n'est possible ; les intervalles de confiance sont à lire comme des bornes optimistes. `entryVariant` est le seul proxy de grappe disponible et est utilisé en strate (section 6.6).

**Script et version du code.** Le code de l'instrument et du scoring est figé au tag `v2.0.0` (commit [hash au dépôt]). Le script d'analyse confirmatoire `analysis/confirmatory.py` (Python, versionné, graine 20260907) implémente la corrélation de Spearman avec correction des ex æquo, le test U de Mann-Whitney avec delta de Cliff, le test de Jonckheere-Terpstra, le test de Brown-Forsythe, la régression de H3, la correction de Holm et les intervalles bootstrap ; il est déposé sur OSF avec ce document, avant l'extraction des données de clôture. L'extrait analysé est archivé avec son empreinte SHA-256, publiée dans le rapport. Toute modification de `score-maps.ts`, `dimensions.ts`, `bias.ts`, `usage-gap.ts` ou du script après le dépôt est un écart au plan.

**Rapport.** Pour chaque hypothèse sont rapportés l'effectif analysé, la statistique de test, la taille d'effet et son IC à 95 %, le p brut, le p ajusté par Holm et la décision. Les résultats non significatifs sont rapportés au même niveau de détail que les résultats significatifs.

### 6.2 Transformations

Les transformations appliquées avant les tests sont les suivantes : le calcul des scores de dimension et des sous-scores de noyau selon la section 5.2 ; le recodage de `profil_statut` en clergé et laïcs, de `profil_formation_theologique` en formation formelle et autre, et de `profil_age` en entier de 1 à 4 (section 2) ; l'exclusion des modalités `ne_sait_pas` et `sans_reponse` de `theo_orientation` pour H4, et des modalités `non`, `ne_sait_pas` et `sans_reponse` de `communaute_position_officielle` pour H6 ; la cotation ordinale de `ctrl_ia_frequence` de 1 (`jamais`) à 5 (`quotidien`) pour H8. Aucune autre transformation n'est appliquée ; aucune variable n'est centrée, standardisée ni catégorisée en dehors de ce qui précède.

### 6.3 Critères d'inférence

Une hypothèse est déclarée soutenue si le p ajusté par Holm est inférieur à 0,05 et si le signe de l'effet correspond à la direction annoncée. Un effet significatif de signe opposé l'infirme. Un résultat non significatif n'est pas une preuve d'absence d'effet : l'IC à 95 % est rapporté et confronté aux deux seuils de la section 4.4. Si l'IC exclut l'effet attendu, le résultat est rapporté comme incompatible avec l'hypothèse ; si l'IC contient l'effet minimal d'intérêt, le résultat est rapporté comme non concluant. Le devis transversal exclut tout énoncé causal ; l'échantillon de convenance exclut toute extrapolation à une population. Enfin, si deux mesures partageaient un item, leur association serait rapportée d'abord comme un artefact de méthode.

### 6.4 Exclusions

| Critère | Traitement | Justification |
|---|---|---|
| **Répondant écarté** (`metadata.screenedOut = true` ou `profil_confession = sans_religion`) | exclu de toutes les analyses | aucun item scoré n'a été présenté |
| **Consentement absent** (`consent_given` faux) | exclu de toutes les analyses ; aucune ligne attendue, la soumission étant refusée sans consentement | absence de base légale |
| **Instrument v1** (`metadata.instrumentVersion` ne commençant pas par « 2. ») | exclu des analyses confirmatoires et du jeu de données publié ; conservé pour les agrégats et normes publics (strate `instrumentVersion`) et pour la note de comparabilité | consentement 1.0 ; items remappés « null » |
| **Réponse incomplète** (questionnaire non soumis, session abandonnée) | exclue de toutes les analyses ; sert à l'analyse d'attrition | l'analyse d'attrition décrit la position d'abandon par strate (paragraphe suivant) |
| **Moins de quatre dimensions calculées** | exclu des analyses portant sur un profil ; conservé pour les analyses portant sur ses dimensions calculées | seuil d'attribution du profil |
| **Dimension sous son seuil `minItems`** | la dimension vaut `null` et l'observation est écartée du test portant sur cette dimension | seuil de calcul |
| **Modalités hors ordre** (`ne_sait_pas`, `sans_reponse`, `non` selon la section 6.2) | observation écartée du seul test concerné | pas de position sur l'échelle |

Les sessions abandonnées sont purgées après 90 jours (migration 010). Avant chaque purge, la fonction `snapshot_attrition` (migration 012) archive dans la table `attrition_snapshots` le nombre de sessions abandonnées par croisement de la version d'instrument, du canal d'entrée et du nombre d'items renseignés à l'abandon ; seules les cellules d'au moins cinq sessions sont archivées, et aucun identifiant, horodatage ni contenu de réponse n'est conservé. L'analyse d'attrition porte sur ces comptages archivés, complétés par les sessions abandonnées encore présentes à la clôture. Elle décrit la position d'abandon par strate ; la comparaison des abandons aux réponses complètes sur les items déjà renseignés n'est possible que pour les sessions des 90 jours précédant la clôture.

**Critères non retenus.** Le drapeau de désirabilité sociale n'exclut personne : il sert à l'analyse de sensibilité de la section 6.6. Les cinq items ne forment pas une forme courte validée et ne fondent aucune décision individuelle. Ne sont pas non plus des critères d'exclusion : une durée de passation atypique, un profil rare, une combinaison de réponses jugée inattendue, ou un commentaire libre en désaccord avec l'étude.

### 6.5 Données manquantes

| Situation | Traitement |
|---|---|
| « Je ne sais pas », « Je préfère ne pas répondre », item non répondu | donnée manquante, exclue de la moyenne de la dimension, jamais imputée au milieu de l'échelle |
| Item non posé par le routage | hors du champ de mesure de ce répondant ; il ne compte ni dans `nItems` ni dans `maxItems` |
| Dimension sous le seuil `minItems` | `value = null` |

Aucune imputation multiple ni aucun remplacement par la moyenne n'est prévu. Les analyses sont conduites sur les observations complètes pour les variables du test considéré (analyse par paire disponible), et l'effectif analysé est rapporté pour chaque test. Le taux de non-réponse par item est publié avec les résultats.

### 6.6 Analyses de robustesse préspécifiées

Ces analyses ne modifient pas la conclusion confirmatoire ; elles en mesurent la stabilité. Quatre sont prévues. La première réestime les huit effets sans les répondants dont le drapeau de désirabilité sociale est levé, avec les mêmes tests, les mêmes covariables et les mêmes familles ; sont rapportés côte à côte la taille d'effet et son IC à 95 % avec et sans ces répondants, et le nombre exclu. L'écart est déclaré substantiel si la décision change, ou si l'estimation sans drapeau sort de l'IC à 95 % de l'estimation complète ; un écart substantiel est rapporté comme une réserve sur la conclusion. La deuxième est une note descriptive de comparabilité v1 et v2 : distributions des items marqués « conservé\* » dans `docs/INSTRUMENT_V2_CHANGES.md`, par version, sans test. La troisième réestime les huit effets avec `entryVariant` en strate, la porte CNEF surreprésentant par construction les évangéliques, ce qui touche directement H2. La quatrième change de test : test t de Welch pour H2 et H5, corrélation de Pearson pour H1 et H8, corrélation de Spearman marginale pour H3 et H6, test de Kruskal-Wallis pour H4, test de Kruskal-Wallis sur la position centrale pour H7.

### 6.7 Analyses exploratoires

Ces analyses sont étiquetées comme exploratoires dans toute restitution. Elles forment leur propre famille, corrigée par la procédure de Benjamini-Hochberg :

- matrice des corrélations entre les sept dimensions, avec IC à 95 % (transformation z de Fisher) ;
- analyse factorielle exploratoire sur les 24 items de noyau, à partir de 120 réponses exploitables ;
- comparaisons entre strates confessionnelles fines, entre pays et entre milieux de résidence ;
- distribution des profils attribués et des écarts d'usage ;
- comparaisons sur les scores complets `sacredBoundary` et `aiOpenness`, descriptives ;
- analyse des commentaires libres, non publiée, servant uniquement à la révision de l'instrument.

Les grades de certitude A à D, le catalogue d'interprétations et le score de certitude (`src/lib/analysis/certainty.ts`) s'appliquent exclusivement aux corrélations exploratoires de la matrice inter-dimensions. Ils reposent sur un r de Pearson et un p ajusté par Benjamini-Hochberg, et ne sont jamais attachés à la décision sur H1 à H8.

Aucun résultat exploratoire n'est présenté comme une confirmation, quelle que soit sa taille d'effet ou sa valeur p.

### 6.8 Interprétation

Chaque association retenue est accompagnée d'au moins une explication concurrente, tirée du catalogue préspécifié (`src/lib/analysis/interpretationCatalog.ts`). Aucun résultat n'est présenté comme une preuve. Le devis transversal et l'échantillon auto-sélectionné excluent tout énoncé causal.

---

## 7. Autres informations

**Conflits d'intérêts.** L'étude est autofinancée. Le CNEF est partenaire de diffusion ; il n'a exercé aucun contrôle sur la conception de l'instrument, sur le plan d'analyse ni sur la publication des résultats, et n'a aucun droit de regard sur les analyses. Le CNEF a indiqué vouloir s'appuyer sur les agrégats pour une déclaration publique sur l'intelligence artificielle. Aucun financement ni aucune contrepartie ne sont associés à ce partenariat.

**Éthique.** Aucun comité d'éthique ni délégué à la protection des données n'a examiné ce protocole, l'étude n'étant rattachée à aucune institution. Le responsable de traitement est Romain Girardi, joignable à contact@ia-foi.fr. Le consentement explicite (version 2.0) est recueilli avant la première question ; l'âge minimal est de 18 ans ; le texte de consentement qualifie l'étude de « recherche indépendante ». Les convictions religieuses relèvent de l'article 9 du RGPD ; leur traitement est fondé sur le consentement explicite (article 9, paragraphe 2, point a). Le retrait est possible à tout moment via la page `/mes-donnees`. Aucune adresse IP ni adresse électronique n'est conservée en clair ; la table héritée `email_submissions`, qui contient des courriels chiffrés issus de la v1, est supprimée avant toute publication.

**Disponibilité des données et du code.** Le code de l'instrument, du scoring et de l'analyse est public. Un jeu de données individuel est publié sous CC-BY-4.0 après la clôture, limité aux réponses exploitables v2. Règle d'anonymisation : les quasi-identifiants sont `profil_pays`, `profil_confession_*`, `profil_statut`, `profil_age`, `profil_genre`, `profil_milieu` et `profil_annees_ministere` ; leurs modalités sont regroupées jusqu'à obtenir k ≥ 5 sur leur croisement ; `commentaires_libres` et `timeSpent` sont retirés ; `entryVariant` est conservé. Les agrégats publics sont soumis à un k-anonymat de 5 par cellule et à un seuil de 30 participants.

**Écarts autorisés, déclarés d'avance.** La durée de passation annoncée (8 à 12 minutes) sera remplacée par la médiane observée de `timeSpent` dès que 100 réponses exploitables seront disponibles ; la date du changement sera consignée. Ce remplacement modifie le texte d'accueil, non l'instrument.

**Limite documentée.** L'ordre des modalités du CRS-5 n'est pas uniforme : les deux items de pratique sont présentés du plus fréquent au moins fréquent, les trois autres du moins fréquent au plus fréquent. La collecte ayant commencé, le point est tranché de fait et l'écart est conservé tel quel jusqu'à la clôture.

**Écarts au plan.** Tout écart à ce préenregistrement sera consigné dans une section « écarts au plan » du rapport final, avec sa date, son motif et son effet sur les conclusions.
