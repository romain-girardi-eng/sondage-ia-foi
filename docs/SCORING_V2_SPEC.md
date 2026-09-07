# Scoring v2 — décisions et contrats d'interface

Ce document fixe les décisions issues de l'audit méthodologique du 7 septembre 2026 et les contrats que chaque module doit respecter. Il fait autorité sur le code tant que la v2 n'est pas livrée ; ensuite METHODOLOGY.md est mis à jour pour le refléter.

Principe directeur : **une corrélation est un fait, une interprétation est une hypothèse graduée.** Tout nombre affiché à un répondant ou dans l'admin doit être soit calculé sur des données réelles avec N visible, soit explicitement étiqueté comme heuristique.

## 1. Décisions scientifiques

### 1.1 Religiosité (CRS-5)
- Le score de religiosité est la **moyenne brute** des 5 items CRS-5 (1 à 5). Aucune correction par désirabilité sociale.
- Libellés d'items alignés sur Huber & Huber (2012) : `crs_experience` redevient « À quelle fréquence vivez-vous des situations où vous avez le sentiment que Dieu ou quelque chose de divin intervient dans votre vie ? ». `crs_private_practice` gagne une modalité hebdomadaire ; `quotidien` et `pluri_quotidien` sont tous deux cotés 5 (recodage Huber).
- Classification en 3 classes Huber : `non_religieux` (1,0 à 2,0), `religieux` (2,1 à 3,9), `hautement_religieux` (4,0 à 5,0). L'ancien type à 4 classes disparaît.
- Nom de dimension : « Centralité de la religiosité (CRS-5, adapté) ». Statut : `adapted`, pas `validated`.

### 1.2 Désirabilité sociale (Marlowe-Crowne)
- 5 items conservés, clés inchangées. Présentés comme « sélection ad hoc de 5 items de la MCSDS (Crowne & Marlowe, 1960) ». Aucune mention de « Form C ».
- Produit : `socialDesirability: { score: number | null; nItems: number; flag: boolean }`. `score` est le nombre d'items endossés dans le sens désirable sur ceux répondus, normalisé 0 à 1. `flag = true` si ≥ 4 items répondus et score ≥ 0,8 (4 sur 5 ou 5 sur 5). Moins de 4 items répondus → `score = null`, `flag = false`.
- **Aucune** déflation de score, aucun multiplicateur de confiance. `adjustScoreForBias` et `getBiasConfidenceMultiplier` sont supprimés. Le drapeau est stocké dans le spectre et disponible comme covariable côté admin.

### 1.3 Dimensions
- 7 dimensions conservées, mais **chaque item n'alimente qu'une seule dimension**. Affectation retenue :
  - `psych_anxiete_remplacement` → renommé conceptuellement « anticipation de remplacement », affecté à **psychologicalPerception** uniquement.
  - `psych_imago_dei` → **ethicalConcern** uniquement.
  - `theo_inspiration` → **sacredBoundary** uniquement.
  - `min_pred_sentiment` → **sacredBoundary** uniquement.
  - `ctrl_ia_frequence` → **aiOpenness** uniquement.
  - `digital_attitude_generale` → **aiOpenness** uniquement.
- **Aucune variable démographique** dans les dimensions : `profil_age`, `profil_statut`, `profil_taille_communaute` sortent de futureOrientation et communityInfluence. Elles restent des covariables.
- `theo_risque_futur` (nominale) sort du scoring ordinal. Elle reste collectée et décrite en fréquences.
- `communityInfluence` est renommée **communityContext** (« contexte communautaire ») et scorée uniquement sur des items dont l'ordre est défendable : position officielle scorée sur la **valence** (défavorable 1, aucune/ne sait pas → manquant, favorable 5), perception des pairs sur la valence (hostile 1 … très favorable 5), influence perçue sur soi.
- « Ne sait pas » et « préfère ne pas répondre » sont **des données manquantes** : exclus de la moyenne, jamais imputés au milieu.
- Seuil minimal d'items par dimension : `MIN_ITEMS = 2` (religiosité : 4). En dessous, `value = null`.
- Sous-scores « noyau commun » pour les comparaisons inter-groupes : `sacredBoundaryCore` (4 items universels `theo_inspiration`, `theo_liturgie_ia`, `theo_activites_sacrees`, `theo_mediation_humaine`) et `aiOpennessCore` (items posés à tout le monde). Les items conditionnels clergé/laïcs n'entrent que dans le score complet, jamais dans le core.

### 1.4 Contrat `DimensionScore` (src/lib/scoring/types.ts)
```ts
export interface DimensionScore {
  value: number | null;      // 1-5, null si nItems < minItems
  confidence: number;        // nItems / maxItemsForThisRespondent, 0-1
  nItems: number;            // items effectivement répondus (hors DK / sans réponse)
  maxItems: number;          // items posables à ce répondant (selon parcours)
  percentile: number | null; // TOUJOURS null côté client ; rempli uniquement via /api/results/norms (voir §3)
}
export interface SevenDimensions {
  religiosity; aiOpenness; sacredBoundary; ethicalConcern;
  psychologicalPerception; communityContext; futureOrientation;
}
export interface CoreSubscores { sacredBoundaryCore: DimensionScore; aiOpennessCore: DimensionScore; }
```
Tout consommateur (FeedbackScreen, PDF, admin, ProfileShare, Remotion) doit gérer `value === null`.

### 1.5 Profils (8 conservés, attribution heuristique)
- Distance : pour chaque dimension avec `value !== null`, distance L1 à la plage idéale, pondérée ; les dimensions nulles sont exclues et les poids renormalisés. Si moins de 4 dimensions valuées → `primary = null` (pas de profil).
- Bonus : appliqués **dans l'espace des scores** après conversion, jamais soustraits de la distance puis clampés. Poids de l'auto-étiquetage `theo_orientation` divisé par 2.
- Score de correspondance : `100 · exp(−0,5 · d)` **non arrondi** ; tri sur le score brut ; tie-breaker : dimension de plus grande confiance, puis ordre alphabétique de l'identifiant (documenté).
- Plus de normalisation à 100 % : `allMatches` expose les scores bruts. `matchScore` arrondi seulement à l'affichage.
- `equilibriste` : plages resserrées à 2,75-3,25 sur les 4 dimensions centrales pour ne plus absorber les profils modérés.
- Le spectre porte `attribution: 'heuristic'` et `profileConfidence: 'low' | 'medium' | 'high'` (high si score primaire ≥ 60 et écart avec le secondaire ≥ 15 ; medium si score ≥ 45 ; sinon low). L'UI affiche le nom du profil avec la mention « attribution heuristique » et, si `low`, propose deux profils à égalité plutôt qu'un seul.
- Descriptions de profil : retirer toute formule Barnum (« n'est pas X mais Y », « profil rare et précieux », « sagesse »). Une description = 2 phrases descriptives des scores, sans jugement. « Pistes de croissance » renommées « Pistes de réflexion, si vous le souhaitez », neutres, jamais incitatives à adopter l'IA.
- Le rapport de simulation doit être relancé : les personas Traditionaliste, Innovateur, Prudent doivent retrouver leur profil cible en premier dans ≥ 80 % des tirages. C'est un test automatisé (`profiles.simulation.test.ts`).

### 1.6 Percentiles
- Supprimés du calcul client. `POPULATION_PARAMS`, `normalCDF` pour les percentiles, `getPercentileComparison`, et la phrase « 15 % les plus ouverts » disparaissent.
- Remplacés par un **rang empirique** servi par `GET /api/results/norms` (voir §3). Affiché uniquement si `n >= 30`, formulé « Votre score est supérieur à X % des N participants ». Sinon : « Comparaison disponible à partir de 30 participants ».

### 1.7 Indice de résistance spirituelle
- Supprimé sous ce nom. Remplacé par `usageGap: 'none' | 'uses_general_not_spiritual' | 'uses_both' | 'no_use'`, ordinal, calculé sur `ctrl_ia_frequence` et la présence du contexte `spirituel` (ou des items ministère/laïcs). Libellé : « Écart d'usage ». Aucune inférence motivationnelle.

### 1.8 Agrégats publics et admin
- Fonction SQL d'agrégation : tableaux via `jsonb_array_elements_text`, matrices via `jsonb_each` avec clé `ligne:colonne`, scalaires inchangés. `HAVING COUNT(*) >= 5` par cellule ; cellules sous 5 fusionnées dans `_autres`.
- Endpoint agrégé : si `participantCount < 30`, renvoie `{ mode: 'insufficient', participantCount }` et le dashboard affiche l'état « collecte en cours ». Les chaînes de démo « 42 % … » sont supprimées.
- Admin : tout segment avec `n < 5` renvoie `null` pour moyennes et corrélations. Corrélations calculées seulement si `n >= 20`, avec intervalle de confiance à 95 % (transformation de Fisher) et p ajusté Benjamini-Hochberg sur la famille des corrélations calculées.

### 1.9 Questionnaire (instrument v2.0.0)
- `INSTRUMENT_VERSION = "2.0.0"`. Les réponses v1.x restent en base ; METHODOLOGY.md documente le remappage (items inchangés → conservés ; items modifiés → `null` en v2).
- Screen-out effectif : `profil_confession = sans_religion` termine le parcours sur un écran de remerciement sans scoring et la réponse est enregistrée avec `metadata.screenedOut = true`.
- `metadata.entryVariant: 'general' | 'cnef'` envoyé à la soumission.
- Item ajouté `profil_formation_theologique` : « Avez-vous suivi une formation théologique formelle ? » (aucune / cours ponctuels / diplôme de théologie / formation pastorale).
- `profil_statut` gagne `responsable_non_ordonne` (« Responsable ou prédicateur non ordonné »), traité comme clergé pour le routage.
- Orthodoxie : « Orthodoxe (byzantin : grec, russe, roumain, serbe…) » et « Orthodoxe oriental (copte, arménien, syriaque, éthiopien…) ».
- Option « Je préfère ne pas répondre » séparée de « Autre » pour le genre ; option « Sans réponse » sur les items attitudinaux théologiques et psychologiques (valeur `sans_reponse`, traitée comme manquante).
- Multi-choix : `aucun*` est exclusif (UI + validation serveur).
- `min_admin_burden` conditionnée à `clergyUsesAI`. `min_pred_usage` : « Jamais » sans parenthèse. `min_care_email` équilibrée (non / oui relu / oui tel quel). `theo_activites_sacrees` sans capitales. `theo_inspiration` reformulée neutre.
- `profil_milieu` : tranches contiguës. `profil_anciennete_foi` : « Depuis l'enfance » remplace « Depuis toujours », tranches exclusives.
- Texte affiché : `questions.ts` devient la seule source ; le codebook et le data-dictionary sont générés depuis lui (ou le schéma importe `questions.ts`).
- Écran de consentement : mention de l'usage par le partenaire CNEF le cas échéant, de la publication d'un jeu de données ouvert anonymisé, du droit de retrait, et de l'âge minimal 18 ans. `consentVersion = "2.0"`.
- Écran de fin : une phrase de débriefing sur les 5 items vrai/faux.

### 1.10 Hypothèses et plan d'analyse
- Une seule liste H1 à H8, dans METHODOLOGY.md et sur la page, identique. Pour chaque hypothèse : variables **brutes** (jamais une dimension contenant la covariable testée), test, seuil α = 0,05, correction Holm dans la famille, taille d'effet attendue, N minimal pour puissance 0,80.
- Les hypothèses tautologiques (propriétés de l'algorithme) sont retirées.
- Un fichier `docs/PREREGISTRATION.md` prêt à déposer sur OSF.

## 2. Module d'interprétation des corrélations

Nouveau module `src/lib/analysis/` :

```ts
export interface CorrelationFact {
  x: string; y: string;           // identifiants de variables (dimension ou item)
  r: number; n: number;
  ci95: [number, number];         // Fisher z
  pRaw: number; pAdjusted: number; // BH sur la famille
  sharedItems: string[];          // items communs aux deux variables (artefact de méthode si non vide)
}

export type Mechanism = 'x_causes_y' | 'y_causes_x' | 'confounder' | 'selection' | 'method_artifact' | 'construct_overlap';

export interface Interpretation {
  mechanism: Mechanism;
  label: string;                  // phrase FR courte, ex. « Une religiosité élevée renforce la frontière sacrée »
  rationale: string;              // 1-3 phrases : pourquoi c'est plausible, quelle littérature ou quel raisonnement
  confounders: string[];          // variables collectées qui pourraient expliquer la relation
  testable: string | null;        // ce qui permettrait de trancher avec les données collectées (ex. « contrôler par profil_age »)
}

export interface CertaintyScore {
  statistical: number;   // 0-1 : f(n, |r|, largeur IC, pAdjusted)
  interpretive: number;  // 0-1 : plausibilité du mécanisme, pénalisée si sharedItems non vide, si confondeurs non contrôlés, si design transversal
  overall: number;       // moyenne géométrique des deux
  grade: 'A' | 'B' | 'C' | 'D';  // A ≥ 0,75 ; B ≥ 0,5 ; C ≥ 0,25 ; D sinon
  caveats: string[];     // phrases FR listant ce qui limite la certitude
}

export interface InterpretedCorrelation {
  fact: CorrelationFact;
  interpretations: Array<Interpretation & { certainty: CertaintyScore }>; // triées par overall décroissant
  preferred: Interpretation | null; // la mieux notée si son overall dépasse la suivante d'au moins 0,15, sinon null (ambigu)
}
```

- Le catalogue des interprétations est **pré-spécifié** dans `src/lib/analysis/interpretationCatalog.ts` pour chaque paire de dimensions et pour les paires hypothèse-liées (H1 à H8). Pour une paire sans entrée, le module génère les mécanismes génériques (`confounder` avec les covariables collectées, `method_artifact` si items partagés, `selection` pour l'auto-sélection) avec une note interprétative plafonnée à 0,4.
- `statistical` : 0 si n < 20 ; sinon combine n (saturation à 200), |r| (seuils 0,1 / 0,3 / 0,5), largeur de l'IC et pAdjusted < 0,05.
- `interpretive` : base 0,5 pour un mécanisme causal en design transversal, 0,7 pour un confondeur mesuré, 0,9 pour `method_artifact` quand `sharedItems` est non vide (c'est alors l'explication la plus certaine). Pénalité −0,2 si un confondeur listé n'est pas contrôlable avec les données.
- Sortie admin : page « Corrélations et interprétations » listant les faits (r, IC, n, p ajusté) puis, pour chacun, les interprétations classées avec leur grade et leurs réserves. Toujours afficher au moins une explication concurrente. Jamais le mot « prouve ».
- Aucune interprétation n'est montrée aux répondants dans la v2 ; elle est réservée à l'admin et aux publications.

## 3. Contrat `GET /api/results/norms`
- Réponse : `{ n: number; instrumentVersion: string; dimensions: Record<DimensionKey, { n: number; quantiles: number[] }> }` où `quantiles` est un tableau de 99 valeurs (percentiles 1 à 99) calculé sur les réponses complètes, consenties, non screen-out, avec `value !== null`.
- Si `n < 30` : `{ n, mode: 'insufficient' }`.
- Cache 10 minutes. Rate limit identique à l'endpoint agrégé.
- Le client calcule le rang : plus petit i tel que `score <= quantiles[i]`.

## 4. Ce qui ne change pas
- Schéma Supabase des tables (colonnes), flux de consentement, dédup, RLS, purge.
- Dark mode, design, i18n FR/EN.
- Les 8 noms de profils et les 24 sous-profils (seule l'attribution et les descriptions changent).
