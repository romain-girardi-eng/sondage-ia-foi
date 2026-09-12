# Pré-enregistrement, enquête « IA et foi chrétienne »

*Modèle : OSF Preregistration (formulaire standard), rempli pour un dépôt sur OSF Registries.*

| Champ | Valeur |
|---|---|
| **Titre** | Attitudes des chrétiens francophones face à l'intelligence artificielle générative dans les pratiques spirituelles et ministérielles |
| **Auteur** | Romain Girardi |
| **Affiliation** | Aucune. Étude indépendante, non adossée à une institution universitaire ou à un laboratoire |
| **Contact** | via le dépôt du projet |
| **Date de dépôt** | 12 septembre 2026 |
| **Date de début de la collecte v2.0.0** | 7 septembre 2026 (mise en production de l'instrument v2.0.0) |
| **Statut au moment du dépôt** | Aucune réponse v2.0.0 collectée au 12 septembre 2026. La base contient 23 réponses recueillies avec l'instrument v1.x (dernière le 23 août 2026), rescorées sous la même table de recodage ; aucune analyse confirmatoire n'a été conduite sur elles. |
| **Version de l'instrument** | 2.0.0 |
| **Version du consentement** | 2.0 |
| **Licence** | MIT pour le code, CC-BY-4.0 pour les données et la documentation |
| **Documentation de référence** | `METHODOLOGY.md`, `docs/SCORING_V2_SPEC.md`, `docs/INSTRUMENT_V2_CHANGES.md`, `docs/codebook.json`, `docs/data-dictionary.csv` |

**Déclaration de données existantes.** Vingt-trois réponses ont été collectées sous les versions v1.x de l'instrument, avant la rédaction de ce pré-enregistrement. Elles ne servent à aucune analyse confirmatoire. Leur seul usage prévu est descriptif, et toute analyse les incluant devra contrôler la variable de strate `instrumentVersion`. Les items dont le remappage v1 vers v2 est marqué « null » dans `docs/INSTRUMENT_V2_CHANGES.md` sont inutilisables pour ces réponses.

---

## 1. Informations sur l'étude

### 1.1 Question de recherche

Comment des chrétiens francophones déclarent-ils utiliser, refuser ou délimiter l'usage des outils d'intelligence artificielle générative dans leurs pratiques spirituelles et ministérielles, et quelles variables individuelles, théologiques et communautaires sont associées à ces déclarations ?

### 1.2 Objectifs

1. Décrire les usages déclarés et les positions théologiques sur l'usage de l'IA dans le champ spirituel.
2. Tester huit hypothèses directionnelles pré-spécifiées (section 2).
3. Explorer la structure dimensionnelle de l'instrument, en vue d'une révision ultérieure.

### 1.3 Ce qui n'est pas visé

L'étude ne vise ni l'estimation de prévalences dans une population définie, ni la validation psychométrique d'un instrument, ni l'établissement de relations causales.

---

## 2. Hypothèses

Toutes les hypothèses sont **directionnelles** et ont été formulées avant la collecte sous l'instrument v2.0.0. Elles sont encodées dans `src/lib/analysis/interpretationCatalog.ts` (constante `HYPOTHESES`) et reproduites à l'identique dans `METHODOLOGY.md`, section 9.

Convention de lecture des variables : un identifiant en `snake_case` désigne un item brut du questionnaire ; un identifiant en `camelCase` désigne un score de dimension calculé.

| Id | Énoncé directionnel | Variables | Test | Famille | Effet attendu | N pour puissance 0,80 |
|---|---|---|---|---|---|---|
| **H1** | Une centralité religieuse plus élevée va de pair avec une frontière sacrée plus stricte | `religiosity` × `sacredBoundary` | Spearman bilatéral | A | ρ = 0,30 | ≈ 94 |
| **H2** | Les répondants charismatiques et évangéliques présentent une ouverture à l'IA distincte de celle de leurs coreligionnaires non charismatiques | `profil_confession_evangelique` × `aiOpenness` | Mann-Whitney (t de Welch en robustesse) | B | d = 0,50 | ≈ 141 (64 par groupe en paramétrique) |
| **H3** | Les répondants plus jeunes présentent une ouverture à l'IA plus grande, indépendamment de leur religiosité | `profil_age` × `aiOpenness`, covariable `religiosity` | Spearman, puis régression linéaire à deux prédicteurs | A | ρ = −0,30 ; f² = 0,15 | ≈ 94 |
| **H4** | Une orientation théologique conservatrice va de pair avec une frontière sacrée plus stricte | `theo_orientation` × `sacredBoundary` | Jonckheere-Terpstra (Kruskal-Wallis en secours) | B | f = 0,25, 3 groupes | ≈ 160 |
| **H5** | Le clergé présente une frontière sacrée de noyau commun plus stricte que les laïcs | `profil_statut` (clergé / laïcs) × `sacredBoundaryCore` | Mann-Whitney (t de Welch en robustesse) | B | d = 0,50 | ≈ 141 |
| **H6** | La position officielle perçue de la communauté va de pair avec l'ouverture individuelle à l'IA | `communaute_position_officielle` × `aiOpenness` | Spearman bilatéral | A | ρ = 0,30 | ≈ 94 |
| **H7** | Une formation théologique formelle va de pair avec une préoccupation éthique plus articulée et moins extrême | `profil_formation_theologique` × `ethicalConcern` | Kruskal-Wallis (moyennes) et Levene (variances) | B | f = 0,25, 4 groupes | ≈ 180 |
| **H8** | Un usage quotidien de l'IA va de pair avec une préoccupation éthique plus faible | `ctrl_ia_frequence` × `ethicalConcern` | Spearman bilatéral | A | ρ = −0,25 | ≈ 137 |

**Non-recouvrement des mesures.** Pour chacune des huit paires, les deux variables ne partagent aucun item. En v2, un item alimente exactement une dimension et aucune variable démographique n'entre dans une dimension ; H3, H6 et H8 opposent en outre un item brut à une dimension qui ne le contient pas. Ce contrôle est automatisé : le module d'analyse expose `sharedItems` et signale toute paire recouvrante comme artefact de méthode.

**Hypothèses retirées.** Les hypothèses de la v1 portant sur des propriétés de l'algorithme de scoring, notamment sur la rareté des profils extrêmes ou sur la meilleure prédiction de l'intention d'usage par l'ouverture à l'IA que par la frontière sacrée, ont été retirées : elles se déduisent des définitions et ne sont pas testables sur des données.

---

## 3. Devis

| Élément | Valeur |
|---|---|
| **Type d'étude** | observationnelle, transversale, en ligne |
| **Manipulation expérimentale** | aucune |
| **Aveugle** | sans objet |
| **Randomisation** | aucune. L'ordre des blocs et des items est fixe et non contrebalancé |
| **Mesures répétées** | aucune. Un répondant, une mesure |
| **Groupes** | non assignés. Les groupes analysés (clergé et laïcs, courants confessionnels, classes d'âge) sont des groupes naturels, définis par les réponses |
| **Support** | application web, français et anglais, questionnaire adaptatif |
| **Durée de passation annoncée** | 8 à 12 minutes, à remplacer par la médiane observée dès que l'effectif le permet |

**Routage.** Le nombre de questions affichées varie de 47 à 52 selon le statut déclaré et l'usage déclaré de l'IA. Une réponse `sans_religion` à la première question met fin au questionnaire (screen-out).

---

## 4. Plan d'échantillonnage

### 4.1 Recrutement

Échantillonnage non probabiliste, combinant :

1. **Convenance** : diffusion publique du lien.
2. **Boule de neige** : partage encouragé par l'application (profil partageable, code QR, rapport PDF). Les chaînes de diffusion ne sont pas tracées.
3. **Partenariat de diffusion** : porte d'entrée dédiée diffusée par le Conseil national des évangéliques de France (CNEF). Le CNEF n'est pas coauteur, n'a pas participé à la conception de l'instrument, et ne reçoit que des résultats agrégés et anonymes.

Le canal d'entrée est enregistré (`metadata.entryVariant`, valeurs `general` ou `cnef`) et sera traité comme strate.

### 4.2 Population visée et représentativité

Population visée : personnes majeures se reconnaissant dans la foi chrétienne et lisant le français ou l'anglais. **Aucune représentativité n'est revendiquée.** Il n'existe pas de base de sondage, aucun tirage aléatoire n'est réalisé et aucune pondération de redressement ne sera appliquée. Les résultats décrivent l'échantillon obtenu.

### 4.3 Effectif cible et règle d'arrêt

| Palier | Effectif de réponses exploitables | Ce qui est fait |
|---|---|---|
| Publication des agrégats | 30 | Le tableau de bord public et les rangs empiriques s'activent |
| Analyse descriptive | 100 | Distributions par item et par strate, sans test d'hypothèse |
| **Analyse confirmatoire** | **200** | Les huit hypothèses sont testées, une seule fois, selon le plan de la section 6 |
| Analyse factorielle exploratoire | 290 au moins (5 observations par item scoré) | Structure dimensionnelle, en exploratoire strict |

**Règle d'arrêt.** La collecte se poursuit jusqu'au 31 décembre 2026, ou jusqu'à 200 réponses exploitables si ce seuil est atteint plus tôt, la date faisant foi en cas d'ambiguïté. **Aucun test d'hypothèse n'est conduit avant l'atteinte du seuil de 200**, et aucune décision de poursuite ou d'arrêt de la collecte n'est prise au vu d'un résultat de test. Si le seuil de 200 n'est pas atteint à la date limite, les huit hypothèses sont rapportées comme exploratoires, avec leurs estimations ponctuelles et leurs intervalles de confiance, sans conclusion de rejet.

Le tableau de bord public affiche des distributions univariées pendant la collecte. Il n'affiche aucune association bivariée, aucun test et aucune valeur p, précisément pour que la consultation du tableau de bord ne puisse pas informer une décision d'arrêt.

---

## 5. Variables

### 5.1 Variables mesurées

Les 58 items sont décrits exhaustivement dans `docs/data-dictionary.csv` (identifiant, libellé français et anglais, type, modalités, dimension, catégorie) et dans `docs/codebook.json` (logique de cotation item par item).

Blocs :

| Bloc | Contenu |
|---|---|
| Profil | confession et sous-courant, statut, âge, genre, éducation, formation théologique, pays, milieu, secteur, ancienneté de foi, années de ministère, taille de la communauté |
| Religiosité | 5 items CRS-5 |
| Orientation théologique | `theo_orientation` |
| Usage de l'IA | fréquence, contextes, confort, outils existants, attitude générale |
| Ministère (clergé) | usage pour la prédication, nature des tâches déléguées, malaise ressenti, courriel d'accompagnement, charge administrative |
| Usage spirituel (laïcs) | substitution de prière, conseil spirituel |
| Perception psychologique | nature de l'IA, conscience, opacité, image de Dieu, anticipation de remplacement |
| Positions théologiques | inspiration, liturgie, activités sacrées, médiation humaine, risque perçu, utilité perçue |
| Contexte communautaire | position officielle perçue, discussions, perception des pairs |
| Orientation future | intention d'usage, souhait de formation, domaines d'intérêt |
| Commentaire libre | `commentaires_libres` (exclu de toute publication) |
| Désirabilité sociale | 5 items en vrai ou faux |

Métadonnées enregistrées : `instrumentVersion`, `consentVersion`, `entryVariant`, `screenedOut`, `timeSpent`.

### 5.2 Indices calculés

**Dimensions (7).** Pour chaque dimension d, sur les items applicables au répondant et effectivement répondus :

```
value(d) = Σ (score_i × poids_i) / Σ poids_i     si nItems ≥ minItems
value(d) = null                                  sinon
```

`minItems` vaut 4 pour `religiosity` et 2 pour les six autres. Les scores d'item sont sur 1 à 5. Tous les poids valent 1, sauf `min_admin_burden` qui vaut 0,5. Un item alimente exactement une dimension. Aucune variable démographique n'entre dans une dimension. « Je ne sais pas », « Je préfère ne pas répondre » et l'absence de réponse sont des données manquantes, exclues de la moyenne et jamais imputées.

Chaque dimension expose aussi `nItems`, `maxItems` (items posables compte tenu du routage) et `confidence = nItems / maxItems`.

**Sous-scores de noyau commun (2).** `sacredBoundaryCore` et `aiOpennessCore`, calculés selon la même formule sur les seuls items posés à tous les répondants. Ils existent pour permettre les comparaisons entre clergé et laïcs, qui ne répondent pas aux mêmes items conditionnels.

**Religiosité.** Moyenne brute des 5 items CRS-5, sans correction. Classification en trois classes de Huber : non religieux (1,0 à 2,0), religieux (2,1 à 3,9), hautement religieux (4,0 à 5,0).

**Désirabilité sociale.** Proportion d'items endossés dans le sens désirable parmi les items répondus, normalisée de 0 à 1, `null` en dessous de 4 items répondus. Drapeau levé si au moins 4 items répondus et proportion supérieure ou égale à 0,8.

**Écart d'usage.** Variable catégorielle à quatre modalités : `uses_both`, `uses_general_not_spiritual`, `no_use`, `none` (indéterminé). Construite sur la comparaison entre usage général déclaré et usage déclaré dans le champ spirituel ou ministériel. Aucune inférence motivationnelle.

**Profil.** Attribution heuristique. Distance L1 pondérée aux plages idéales, calculée sur les seules dimensions valuées, poids renormalisés ; conversion `score = 100 × exp(−0,5 × distance)` ; bonus ajoutés dans l'espace des scores. Pas de profil si moins de 4 dimensions sont valuées. **Le profil n'est la variable dépendante d'aucune hypothèse confirmatoire.**

---

## 6. Plan d'analyse

### 6.1 Analyses confirmatoires

Les huit hypothèses du tableau de la section 2, chacune testée **une seule fois**, avec le test annoncé, sur l'échantillon défini par les critères d'inclusion de la section 7.

**Seuil.** α = 0,05, tests bilatéraux ; la direction annoncée est lue sur le signe de l'effet observé.

**Correction pour tests multiples.** Correction de Holm à l'intérieur de chaque famille, définie a priori :

- **Famille A**, associations ordinales : H1, H3, H6, H8 (4 tests).
- **Famille B**, comparaisons de groupes : H2, H4, H5, H7 (4 tests).

Aucune correction n'est appliquée entre les deux familles, qui portent sur des questions distinctes.

**Rapport.** Pour chaque hypothèse : effectif analysé, statistique de test, taille d'effet avec son intervalle de confiance à 95 pour cent, p brut, p ajusté par Holm, et décision. Les résultats non significatifs sont rapportés au même niveau de détail que les résultats significatifs.

### 6.2 Analyses de robustesse pré-spécifiées

Ces analyses ne modifient jamais la conclusion confirmatoire ; elles la qualifient.

1. **Désirabilité sociale.** Réestimation des huit effets en excluant les répondants dont le drapeau est levé. Un écart substantiel est rapporté comme une réserve, pas comme un résultat.
2. **Version de l'instrument.** Réestimation sur les seules réponses v2.0.0, si des réponses v1 ont été incluses.
3. **Canal d'entrée.** Réestimation avec `entryVariant` en covariable, la porte CNEF surreprésentant par construction les évangéliques, ce qui affecte directement H2.
4. **Choix du test.** Pour H2 et H5, test t de Welch en complément du test de rang ; pour H1, H3, H6 et H8, corrélation de Pearson en complément de Spearman.

### 6.3 Analyses exploratoires

Explicitement étiquetées comme telles dans toute restitution, et non corrigées par Holm mais par Benjamini et Hochberg sur leur propre famille :

- Matrice des corrélations entre les sept dimensions, avec intervalles de Fisher.
- Analyse factorielle exploratoire de la structure dimensionnelle, à partir de 290 réponses.
- Comparaisons entre strates confessionnelles fines, entre pays et entre milieux de résidence.
- Distribution des profils attribués et des écarts d'usage.
- Analyse des commentaires libres, non publiée, servant uniquement à la révision de l'instrument.

Aucun résultat exploratoire n'est présenté comme une confirmation, quelle que soit sa taille d'effet ou sa valeur p.

### 6.4 Interprétation

Chaque association retenue est accompagnée d'au moins une explication concurrente, tirée du catalogue pré-spécifié (`src/lib/analysis/interpretationCatalog.ts`), et d'un grade de certitude A à D calculé par le module `src/lib/analysis/certainty.ts`. Le mot « prouve » n'est employé nulle part. Le devis étant transversal et l'échantillon auto-sélectionné, aucun énoncé causal n'est produit.

---

## 7. Critères d'exclusion et données manquantes

### 7.1 Exclusions

| Critère | Traitement | Justification |
|---|---|---|
| **Répondant écarté** (`metadata.screenedOut = true` ou `profil_confession = sans_religion`) | exclu de toutes les analyses | aucun item scoré n'a été présenté |
| **Consentement absent** (`consent_given` faux) | exclu de toutes les analyses | absence de base légale |
| **Réponse incomplète** (questionnaire non soumis, session abandonnée) | exclue des analyses confirmatoires ; conservée pour l'analyse d'attrition | l'analyse d'attrition compare les abandons aux réponses complètes sur les items déjà renseignés |
| **Moins de 4 dimensions valuées** | exclu des analyses portant sur un profil ; conservé pour les analyses portant sur ses dimensions valuées | seuil d'attribution du profil |
| **Dimension sous son seuil `minItems`** | la dimension vaut `null` et l'observation est écartée du test portant sur cette dimension | seuil de calcul |
| **Doublon détecté** (empreinte de courriel déjà présente) | seule la première soumission est conservée | anti-doublon |

### 7.2 Ce qui n'est pas un critère d'exclusion

**Le drapeau de désirabilité sociale n'exclut personne.** Il est traité en analyse de sensibilité (section 6.2), jamais en critère d'exclusion. Les cinq items ne constituent pas une forme courte validée et n'autorisent aucune décision individuelle.

Ne sont pas non plus des critères d'exclusion : une durée de passation atypique, un profil rare, une combinaison de réponses jugée inattendue, ou un commentaire libre en désaccord avec l'étude.

### 7.3 Données manquantes

| Situation | Traitement |
|---|---|
| « Je ne sais pas », « Je préfère ne pas répondre », item non répondu | donnée manquante, exclue de la moyenne de la dimension, **jamais imputée au milieu de l'échelle** |
| Item non posé par le routage | non manquant, mais hors du champ de mesure de ce répondant. Il ne compte ni dans `nItems` ni dans `maxItems` |
| Dimension sous le seuil `minItems` | `value = null` |
| Item v1 marqué « null » au remappage | traité comme manquant pour les analyses v2 |

**Aucune imputation multiple ni aucun remplacement par la moyenne n'est prévu.** Les analyses sont conduites sur les observations complètes pour les variables du test considéré (analyse par paire disponible), et l'effectif effectif est rapporté pour chaque test. Le taux de non-réponse par item est publié avec les résultats.

---

## 8. Critères d'inférence

1. Une hypothèse est déclarée soutenue si le p ajusté par Holm est inférieur à 0,05 **et** si le signe de l'effet correspond à la direction annoncée. Un effet significatif de signe opposé est rapporté comme une infirmation de l'hypothèse directionnelle, non comme un succès.
2. Un résultat non significatif n'est jamais interprété comme une preuve d'absence d'effet. L'intervalle de confiance est rapporté et sa compatibilité avec l'effet attendu est discutée.
3. Aucun énoncé causal n'est produit à partir d'un devis transversal.
4. Aucune extrapolation à une population n'est produite à partir d'un échantillon de convenance.
5. Toute association pour laquelle les deux mesures partageraient un item serait rapportée en priorité comme un artefact de méthode.

---

## 9. Autres informations

**Conflits d'intérêts.** L'étude est autofinancée. Le CNEF est partenaire de diffusion et n'a exercé aucun contrôle sur la conception de l'instrument, sur le plan d'analyse ni sur la publication des résultats. Aucun financement, aucune contrepartie et aucun droit de regard préalable ne sont associés à ce partenariat.

**Éthique.** Consentement explicite, version 2.0, recueilli avant la première question. Âge minimal 18 ans. Traitement de données relevant de l'article 9 du RGPD (convictions religieuses) fondé sur le consentement explicite au sens de l'article 9, paragraphe 2, point a. Droit de retrait exerçable à tout moment via la page `/mes-donnees`. Aucune adresse IP ni adresse électronique n'est conservée en clair.

**Disponibilité des données et du code.** Le code de l'instrument, du scoring et de l'analyse est public. Un jeu de données anonymisé sera publié sous CC-BY-4.0 après la clôture de la collecte, sans les commentaires libres et après suppression des combinaisons de modalités potentiellement identifiantes. Les agrégats publics sont soumis à un k-anonymat de 5 par cellule et à un seuil de 30 participants.

**Écarts au plan.** Tout écart à ce pré-enregistrement sera consigné dans une section « écarts au plan » du rapport final, avec sa date, son motif et son effet sur les conclusions.
