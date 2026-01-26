# Méthodologie de l'enquête "IA & Foi Chrétienne"

## Table des matières

1. [Contexte scientifique](#1-contexte-scientifique)
2. [Échelles utilisées](#2-échelles-utilisées)
3. [Structure confessionnelle](#3-structure-confessionnelle)
4. [Les 7 dimensions de scoring](#4-les-7-dimensions-de-scoring)
5. [Les 8 profils](#5-les-8-profils)
6. [Hypothèses de recherche](#6-hypothèses-de-recherche)
7. [Limites méthodologiques](#7-limites-méthodologiques)
8. [Changelog des révisions](#8-changelog-des-révisions)

---

## 1. Contexte scientifique

### 1.1 Objectif de l'étude

Cette enquête vise à cartographier les attitudes des chrétiens francophones face à l'utilisation de l'intelligence artificielle dans les pratiques spirituelles et ministérielles. Elle s'inscrit dans un contexte où l'IA générative (ChatGPT, Claude, etc.) transforme rapidement les pratiques professionnelles, y compris potentiellement les pratiques religieuses.

### 1.2 Positionnement méthodologique

**Ce que cette enquête EST :**
- Un outil d'engagement et de réflexion personnelle ("Psychometrically-Informed Engagement Tool")
- Une analyse sociologique exploratoire du paysage chrétien francophone
- Un instrument utilisant des versions adaptées d'échelles académiques validées

**Ce que cette enquête N'EST PAS :**
- Un instrument clinique ou diagnostique
- Une étude publiable en l'état dans une revue à comité de lecture (nécessiterait les échelles complètes)
- Une catégorisation définitive des répondants

### 1.3 Trade-off engagement vs. rigueur

| Aspect | Choix académique pur | Notre choix | Justification |
|--------|---------------------|-------------|---------------|
| CRS (religiosité) | CRS-15 (15 questions) | CRS-5 (5 questions) | Taux de complétion vs. fiabilité |
| Nombre de questions | 40-60 questions | 55 total (35-45 par répondant) | Optimisé pour mobile, 5-7 min |
| Échelles Likert | 7 points | 5 points | Simplicité cognitive |

---

## 2. Échelles utilisées

### 2.1 CRS-5 (Centrality of Religiosity Scale - Short Form)

**Source :** Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). *Religions*, 3(3), 710-724.

**Adaptation :** Version courte à 5 items couvrant les 5 dimensions de Huber :

| Dimension | Question ID | Mesure |
|-----------|-------------|--------|
| Intellect | `crs_intellect` | Fréquence de réflexion religieuse |
| Idéologie | `crs_ideology` | Intensité de la croyance en Dieu |
| Pratique publique | `crs_public_practice` | Fréquence de participation aux offices |
| Pratique privée | `crs_private_practice` | Fréquence de prière personnelle |
| Expérience | `crs_experience` | Fréquence d'expériences spirituelles profondes |

**Calcul :** Moyenne arithmétique des 5 scores (1-5)

**Limitation connue :** Avec un seul item par dimension, pas de possibilité de calculer l'alpha de Cronbach. La cohérence interne repose sur la validation de l'échelle originale.

### 2.2 Contrôle de désirabilité sociale (Marlowe-Crowne Short Form)

**Source :** Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. *Journal of Consulting Psychology*, 24(4), 349-354.

**Adaptation :** 5 items sélectionnés (`ctrl_mc_1` à `ctrl_mc_5`)

**Usage :** Permet d'identifier les répondants dont les réponses pourraient être biaisées par le désir de paraître "bon chrétien". Score élevé = potentiel biais de désirabilité sociale.

### 2.3 Proxies pour l'anxiété face à l'IA

**Inspiré de :** Wang, Y. Y., & Wang, Y. S. (2022). Artificial Intelligence Anxiety Scale (AIAS).

**Adaptation :** Plutôt que l'échelle complète, nous utilisons des proxies comportementaux :
- `ctrl_ia_confort` : Niveau de confort général
- `psych_anxiete_remplacement` : Peur du remplacement
- `psych_godspeed_nature` / `psych_godspeed_conscience` : Perception de la nature de l'IA

---

## 3. Structure confessionnelle

### 3.1 Arborescence des confessions

```
profil_confession
├── Catholique
│   └── profil_confession_catholique
│       ├── Paroissial classique
│       ├── Charismatique (Renouveau, Emmanuel, Chemin Neuf...)
│       └── Traditionaliste (forme extraordinaire, messe en latin)
│
├── Protestant
│   └── profil_confession_protestante
│       ├── Protestantisme historique (Luthérien, Réformé, Anglican)
│       └── Évangélique
│           └── profil_confession_evangelique
│               ├── Évangélique classique (Baptiste, Mennonite, Frères...)
│               └── Pentecôtiste / Charismatique
│
├── Orthodoxe
│   (pas de sous-catégorie - population attendue trop faible)
│
└── Autre sensibilité chrétienne
    (catch-all pour communautés non-dénominationnelles, etc.)
```

### 3.2 Justification des sous-groupes

#### Catholiques

| Sous-groupe | Population FR estimée | Intérêt analytique |
|-------------|----------------------|-------------------|
| Paroissial classique | ~80% des pratiquants | Baseline catholique |
| Charismatique | ~10-15% | Comparable aux pentecôtistes protestants |
| Traditionaliste | ~5-10% | Hypothèse : forte résistance au sacré boundary |

#### Protestants

| Sous-groupe | Population FR estimée | Intérêt analytique |
|-------------|----------------------|-------------------|
| Historique (Luthéro-réformé, Anglican) | ~40% des protestants FR | Tradition liturgique, moins charismatique |
| Évangélique classique | ~35% | Position intermédiaire |
| Pentecôtiste/Charismatique | ~25% | Hypothèse : plus ouverts à l'expérimentation spirituelle |

### 3.3 Analyses croisées possibles

Ces sous-groupes permettent des comparaisons intra et inter-confessionnelles :

1. **Charismatiques catholiques vs Pentecôtistes protestants**
   - Même spiritualité expérientielle, ecclésiologies différentes
   - Hypothèse : attitudes similaires face à l'IA dans la prière

2. **Traditionalistes catholiques vs Protestants historiques**
   - Attachement commun aux formes liturgiques traditionnelles
   - Hypothèse : résistance similaire à l'IA dans le sacré

3. **Gradient charismatique transversal**
   - Comparer tous les charismatiques (catho + protestant) aux non-charismatiques
   - Hypothèse : la spiritualité expérientielle transcende les frontières confessionnelles

---

## 4. Les 7 dimensions de scoring

### 4.1 Vue d'ensemble

| # | Dimension | Questions clés | Robustesse |
|---|-----------|---------------|------------|
| 1 | Religiosité | 5 (CRS-5) | ✅ Excellente |
| 2 | Ouverture à l'IA | 4-7 selon profil | ⚠️ Modérée |
| 3 | Frontière Sacrée | 6-8 selon profil | ✅ Bonne (après renforcement) |
| 4 | Préoccupation Éthique | 4-5 | ⚠️ Modérée |
| 5 | Perception Psychologique | 3-4 | ⚠️ Modérée-faible |
| 6 | Influence Communautaire | 5-6 | ✅ Bonne |
| 7 | Orientation Future | 5-6 | ⚠️ Modérée |

### 4.2 Dimension 3 : Frontière Sacrée (détail)

Cette dimension a été **renforcée** pour réduire la dépendance à un seul item.

#### Questions universelles (tous répondants)

| Question ID | Poids | Mesure |
|-------------|-------|--------|
| `theo_inspiration` | 1.5 | L'IA peut-elle porter un message spirituel authentique ? |
| `theo_liturgie_ia` | 2.0 | Acceptabilité de l'IA en contexte liturgique (échelle 1-5) |
| `theo_activites_sacrees` | 2.0 | Activités qui ne devraient JAMAIS impliquer l'IA |
| `theo_mediation_humaine` | 1.8 | Nécessité d'une présence humaine exclusive |
| Inférence usage | 0.8-1.5 | Utilise l'IA en général mais PAS pour le spirituel |

#### Questions conditionnelles (clergé)

| Question ID | Poids | Mesure |
|-------------|-------|--------|
| `min_pred_sentiment` | 1.2 | Malaise lors de l'usage pour la prédication |
| `min_pred_usage` | 1.0 | Usage effectif pour la prédication |
| `min_care_email` | 0.8 | Usage pour l'accompagnement pastoral |

#### Questions conditionnelles (laïcs)

| Question ID | Poids | Mesure |
|-------------|-------|--------|
| `laic_substitution_priere` | 1.0 | Attitude envers la prière générée par IA |
| `laic_conseil_spirituel` | 1.0 | Ouverture au conseil spirituel par IA |

#### Calcul

```
Score = Σ(score_i × poids_i) / Σ(poids_i)
```

Score élevé (4-5) = Frontière stricte entre sacré et profane
Score faible (1-2) = Frontière perméable, l'IA peut intervenir partout

### 4.3 Distribution des poids (avant/après renforcement)

**Avant (vulnérabilité critique) :**
- `theo_inspiration` seul représentait ~50-60% du score universel

**Après (robustesse améliorée) :**
- `theo_liturgie_ia` : ~22%
- `theo_activites_sacrees` : ~22%
- `theo_mediation_humaine` : ~20%
- `theo_inspiration` : ~17%
- Inférence usage : ~9-17%

---

## 5. Les 8 profils

### 5.1 Matrice de classification

Les profils émergent de l'interaction entre dimensions :

| Profil | Religiosité | Ouverture IA | Frontière Sacrée | Caractéristique |
|--------|-------------|--------------|------------------|-----------------|
| Gardien de la Tradition | Haute | Faible | Haute | Protège l'authenticité |
| Prudent Éclairé | Haute | Moyenne | Haute | Discernement équilibré |
| Innovateur Ancré | Haute | Haute | Basse | Rare : tradition + tech |
| Équilibriste Spirituel | Moyenne | Moyenne | Moyenne | Voie du milieu |
| Pragmatique Moderne | Variable | Haute | Basse | Orienté efficacité |
| Pionnier Spirituel | Variable | Haute | Très basse | Avant-garde |
| Progressiste Critique | Variable | Haute | Moyenne-Haute | Ouvert mais vigilant |
| Explorateur | Faible-Moyenne | Variable | Variable | En questionnement |

### 5.2 Logique de matching

Le score de correspondance (%) est calculé par :

1. **Distance vectorielle** entre le profil du répondant et le profil-type
2. **Bonus/malus** basés sur des réponses spécifiques (ex: orientation théologique auto-déclarée)
3. **Détection de tensions** : combinaisons de dimensions contradictoires

Voir `src/lib/scoring/profiles.ts` pour l'implémentation détaillée.

---

## 6. Hypothèses de recherche

### 6.1 Hypothèses principales (H1-H6)

#### H1 : Corrélation religiosité × frontière sacrée
> Les personnes avec un score CRS-5 élevé auront une frontière sacrée plus stricte.

**Variables :** `religiosity` ↔ `sacredBoundary`
**Test :** Corrélation de Pearson, régression linéaire
**Statut :** À vérifier

#### H2 : Effet charismatique transversal
> Les chrétiens charismatiques (catholiques et protestants) auront des attitudes plus similaires entre eux qu'avec leurs coreligionnaires non-charismatiques.

**Variables :**
- `profil_confession_catholique === 'catholique_charismatique'`
- `profil_confession_evangelique === 'pentecotiste'`

**Test :** ANOVA, comparaison de moyennes
**Statut :** À vérifier (dépend de la taille des échantillons)

#### H3 : Résistance spirituelle spécifique
> La résistance à l'IA dans le domaine spirituel est distincte de la résistance générale au numérique.

**Variables :**
- `ctrl_ia_frequence` vs usage dans `ctrl_ia_contextes.spirituel`
- `digital_attitude_generale` vs `sacredBoundary`

**Test :** Analyse de variance, régression multiple
**Statut :** À vérifier

#### H4 : Effet générationnel
> Les répondants plus jeunes auront une frontière sacrée plus perméable, indépendamment de leur niveau de religiosité.

**Variables :** `profil_age` × `sacredBoundary` (contrôlé par `religiosity`)
**Test :** Régression multiple avec interaction
**Statut :** À vérifier

#### H5 : Influence communautaire sur les attitudes individuelles
> Les répondants dont la communauté discute activement de l'IA auront des positions plus tranchées (positives ou négatives).

**Variables :** `communaute_discussions` × variance des scores
**Test :** Test de Levene, comparaison de variances
**Statut :** À vérifier

#### H6 : Écart clergé-laïcs
> Le clergé aura une frontière sacrée plus stricte que les laïcs, particulièrement concernant la prédication et l'accompagnement.

**Variables :** `profil_statut` × `sacredBoundary`
**Test :** Test t, Mann-Whitney
**Statut :** À vérifier

### 6.2 Hypothèses exploratoires (H7-H10)

#### H7 : Traditionalistes catholiques ≈ Protestants historiques
> Sur la dimension `sacredBoundary`, les traditionalistes catholiques et les protestants historiques auront des scores similaires malgré des théologies différentes.

#### H8 : Formation théologique comme modérateur
> Les répondants avec une formation théologique formelle auront des positions plus nuancées (scores moyens plutôt qu'extrêmes).

**Proxy :** `profil_education` + `profil_secteur === 'religieux'`

#### H9 : Anxiété anthropomorphique
> Les répondants qui attribuent une forme de conscience à l'IA (`psych_godspeed_conscience`) auront une frontière sacrée plus basse.

#### H10 : Prédicteurs de l'adoption future
> L'intention d'usage futur (`futur_intention_usage`) sera mieux prédite par `aiOpenness` que par `sacredBoundary`.

---

## 7. Limites méthodologiques

### 7.1 Biais d'échantillonnage

| Biais | Description | Mitigation |
|-------|-------------|------------|
| Auto-sélection | Seuls les intéressés par le sujet répondent | Transparence dans l'interprétation |
| Biais numérique | Exclut les chrétiens peu connectés | Mentionner dans les limites |
| Biais francophone | Non représentatif du christianisme mondial | Scope clairement défini |
| Biais de diffusion | Dépend des réseaux de partage | Diversifier les canaux |

### 7.2 Limites psychométriques

| Limite | Impact | Mitigation |
|--------|--------|------------|
| Single-item pour certaines dimensions | Pas de fiabilité test-retest | Renforcement de Sacred Boundary |
| Pas d'alpha de Cronbach calculable | Cohérence interne non vérifiable | S'appuyer sur les échelles validées |
| Désirabilité sociale | Sur-déclaration de religiosité | Échelle Marlowe-Crowne |

### 7.3 Limites interprétatives

1. **Corrélation ≠ Causalité** : Les associations observées ne prouvent pas de liens causaux
2. **Snapshot temporel** : Les attitudes évoluent rapidement avec l'IA
3. **Catégories simplificatrices** : Les profils sont des outils heuristiques, pas des identités fixes

---

## 8. Changelog des révisions

### v1.2.0 (2026-01-25) - Scientific Deepening

#### Psychometric Enhancements
- **Godspeed Questionnaire Integration** : Replacement of the single anthropomorphism question with a multi-item construct (Nature & Consciousness) inspired by the Godspeed Scale.
- **AI Anxiety Scale (AIAS) Integration** : Addition of a question on "Sociotechnical Blindness" (fear of the black box) to better capture the "Learning" and "Opacity" dimensions of anxiety.

#### Scoring Refinements
- **Calculations Updated** : `calculatePsychologicalPerceptionDimension` and `calculateEthicalConcernDimension` now incorporate the new Godspeed and AIAS items respectively.
- **Population Models** : Refined mock population parameters to reflect more realistic distributions (e.g. higher mean for religiosity in this target group).
- **Bias Correction** : Full implementation of the Marlowe-Crowne weighting logic to adjust scores based on social desirability bias.

### v1.1.0 (2025-01-25)

#### Ajouts
- **3 nouvelles questions pour Sacred Boundary** :
  - `theo_liturgie_ia` : Acceptabilité en contexte liturgique (échelle)
  - `theo_activites_sacrees` : Activités à exclure de l'IA (choix multiple)
  - `theo_mediation_humaine` : Nécessité de présence humaine (choix)

- **Sous-groupes confessionnels** :
  - `profil_confession_catholique` : Paroissial / Charismatique / Traditionaliste
  - `profil_confession_evangelique` : Classique / Pentecôtiste-Charismatique

- **Note méthodologique** ajoutée aux écrans de résultats

#### Corrections terminologiques
| Avant | Après | Raison |
|-------|-------|--------|
| "eucharistie" | "eucharistie/cène" | Terminologie protestante |
| "confession" | "confession/réconciliation" | Plus universel |
| "offices religieux" | "offices religieux (messe, culte, liturgie)" | Clarification |
| "transmettre la grâce" | "porter un message spirituel authentique" | Moins catholico-centré |
| "médiation humaine" | "présence humaine" | Évite confusion théologique (Christ seul médiateur) |
| "Traditionaliste / Libéral" | "Conservateur / Progressiste" avec descriptions | Moins connoté |
| "exégèse" | "recherche biblique (commentaires, contexte historique)" | Plus accessible |
| "Catéchèse" | "Enseignement religieux (catéchèse, école du dimanche)" | Œcuménique |

#### Améliorations scoring
- Réduction de la dépendance single-item sur Sacred Boundary : de ~60% à ~22% par question
- Rééquilibrage des poids dans `dimensions.ts`

---

## Références

1. Huber, S., & Huber, O. W. (2012). The Centrality of Religiosity Scale (CRS). *Religions*, 3(3), 710-724. https://doi.org/10.3390/rel3030710
2. Crowne, D. P., & Marlowe, D. (1960). A new scale of social desirability independent of psychopathology. *Journal of Consulting Psychology*, 24(4), 349-354. https://doi.org/10.1037/h0047358
3. Wang, Y. Y., & Wang, Y. S. (2022). Development and validation of an artificial intelligence anxiety scale: An initial application in predicting motivated learning behavior. *Interactive Learning Environments*, 30(4), 619-634. https://doi.org/10.1080/10494820.2019.1674887

---

*Document généré le 25 janvier 2025. Dernière mise à jour : v1.2.1 (26 janvier 2026)*
