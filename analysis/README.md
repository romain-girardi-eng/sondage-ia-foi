# Analyse confirmatoire, IA et foi

Script d'analyse des huit hypothèses préenregistrées (H1 à H8). Il lit un export
CSV, recalcule les scores avec les règles de l'instrument, exécute les tests,
et écrit un rapport Markdown et un JSON contenant tous les nombres.

Le script ne se connecte à rien : ni réseau, ni base de données. Il prend un
fichier et écrit des fichiers.

## Installation

```bash
python3 -m venv analysis/.venv
analysis/.venv/bin/pip install -r analysis/requirements.txt
```

## Exécution

```bash
# Sur un export réel : cohorte des 200 premières lignes par submittedAt
analysis/.venv/bin/python analysis/confirmatory.py --input export.csv --out analysis/out

# Taille de cohorte explicite (200 est la valeur préenregistrée)
analysis/.venv/bin/python analysis/confirmatory.py --input export.csv --cohort-size 200

# Moins de 200 lignes : refus, sauf --allow-partial (rapport étiqueté « exploratoire »)
analysis/.venv/bin/python analysis/confirmatory.py --input partiel.csv --allow-partial

# Sans données : jeu synthétique généré puis analysé de bout en bout
analysis/.venv/bin/python analysis/confirmatory.py --dry-run

# Tests
analysis/.venv/bin/python -m pytest analysis -q
```

Sorties, dans `--out` (`analysis/out` par défaut) :

- `cohort_extract.csv` : la cohorte analysée, à archiver avec le rapport ;
- `confirmatory_report.md` : rapport lisible ;
- `confirmatory_results.json` : tous les nombres, y compris le SHA-256 de
  l'export lu et celui de la cohorte.

## Règle de cohorte

La collecte n'a pas de date de fin. L'échantillon confirmatoire est la cohorte
des 200 premières réponses exploitables par ordre de soumission
(préenregistrement, §4.3). Le script applique cette règle lui-même :

1. il exige une colonne `submittedAt` (ISO 8601 ; `created_at` de la table
   `responses`), trie l'export sur cette colonne en ordre croissant, les ex æquo
   restant dans l'ordre du fichier, et retient les `--cohort-size` premières
   lignes (200 par défaut) ;
2. il écrit la cohorte dans `cohort_extract.csv`, calcule son SHA-256 et
   reporte, dans le rapport et dans le JSON, cette empreinte ainsi que le
   `submittedAt` de la première et de la dernière ligne retenue ;
3. si l'export compte moins de lignes que la taille de cohorte, il s'arrête en
   erreur avant tout calcul. Avec `--allow-partial`, il s'exécute quand même et
   le rapport porte le statut « exploratoire » dans son titre et son en-tête :
   ce rapport n'est pas le test préenregistré.

Les tests, les analyses de sensibilité et la fidélité portent sur la cohorte
seule. Les réponses postérieures à la 200e sont exploratoires et ne passent
pas par ce script sans addendum préenregistré.

## Format de l'export attendu

Un CSV, **une ligne par réponse exploitable v2**, en-tête sur la première ligne.
Une réponse exploitable est définie par le préenregistrement (§4.3) :
`consent_given = true`, `metadata.screenedOut` absent ou faux,
`profil_confession ≠ sans_religion`, `metadata.instrumentVersion` commençant par
`2.`. Le filtrage se fait à l'extraction ; le script ne le refait pas, il compte
seulement les lignes non v2 qu'il rencontre et le signale dans le rapport.

Colonnes :

| Colonne | Contenu |
| --- | --- |
| `submittedAt` | `created_at` de la réponse, ISO 8601 (`2026-09-07T10:15:00Z`) ; obligatoire, sert à la cohorte |
| `instrumentVersion` | `metadata.instrumentVersion`, par exemple `2.0.0` |
| `entryVariant` | `metadata.entryVariant` : `general`, `cnef`, … |
| un identifiant de question par colonne | la réponse brute, telle que stockée dans `answers` |

Typage des cellules, puisqu'un CSV n'en a pas :

- **choix simple** : la valeur d'option telle quelle (`souvent`, `oui_prudent`) ;
- **échelle 1-5** : le nombre (`4`) ;
- **choix multiple** : un tableau JSON (`["general","etudes"]`) ou une liste
  séparée par des barres verticales (`general|etudes`) ;
- **matrice** : un objet JSON (`{"plan":2,"exegese":1}`) ;
- **non répondu** : cellule vide, ou l'un des codes manquants de l'instrument
  (`ne_sait_pas`, `sans_reponse`, `prefere_ne_pas_repondre`, `ne_souhaite_pas`).

Les items de l'échelle de désirabilité sociale (`ctrl_mc_1` à `ctrl_mc_5`)
doivent être exportés : ils servent à l'analyse de sensibilité, jamais à
corriger un score.

L'export CSV actuel de l'administration (`/api/results/export?format=csv`) ne
produit pas ce format : ses colonnes sont déduites de la première ligne, donc
les items conditionnels manquent, les valeurs multi-choix contiennent des
virgules non échappées, et `submittedAt`, `instrumentVersion` et `entryVariant`
n'y figurent pas. L'export soumis au script doit être produit par un export
dédié, puis archivé avec son SHA-256 ; la cohorte extraite l'est à son tour.

## Ce que fait le script

1. **Recalcul du scoring.** `scoring_maps.py` et `scoring.py` réimplémentent
   exactement `src/lib/scoring/score-maps.ts` et
   `src/lib/scoring/dimensions.ts` : mêmes items, mêmes poids, mêmes prédicats
   de routage, mêmes codes manquants (jamais imputés), même arrondi à deux
   décimales. `test_analysis.py` relit les fichiers TypeScript et échoue si les
   deux copies divergent.

2. **Les huit tests préenregistrés.**

   | Hypothèse | Test confirmatoire | Taille d'effet |
   | --- | --- | --- |
   | H1 | Spearman bilatéral, ex æquo corrigés, `religiosity × sacredBoundaryCore` | rho |
   | H2 | Mann-Whitney bilatéral, charismatiques vs non-charismatiques sur `aiOpennessCore` | delta de Cliff |
   | H3 | MCO `aiOpennessCore ~ âge + religiosity`, test t bilatéral du coefficient d'âge | beta (âge), non standardisé |
   | H4 | Jonckheere-Terpstra bilatéral (permutation) sur `theo_orientation` ordonnée × `sacredBoundaryCore` | tau-b de Kendall |
   | H5 | Mann-Whitney bilatéral, clergé vs laïcs sur `sacredBoundaryCore` | delta de Cliff |
   | H6 | Jonckheere-Terpstra bilatéral (permutation) sur `communaute_position_officielle` (`oui_*`) × `aiOpennessCore` | tau-b de Kendall |
   | H7 | Brown-Forsythe unilatéral, dispersion de `ethicalConcern` plus faible chez les formés | rapport des écarts absolus moyens |
   | H8 | Spearman bilatéral `ctrl_ia_frequence × ethicalConcern` | rho |

   L'âge est codé 1 = 18-35, 2 = 36-50, 3 = 51-65, 4 = 66+, pour que le signe de
   l'effet soit lisible. `theo_orientation` est codée
   traditionaliste = 1, modéré = 2, progressiste = 3 ; `ne_sait_pas` et
   `sans_reponse` sont exclus. H6 ne porte que sur les répondants déclarant une
   position officielle (`oui_defavorable` = 1, `oui_prudent` = 2,
   `oui_favorable` = 3) : `non`, `ne_sait_pas` et `sans_reponse` sont exclus,
   et l'effectif utile est rapporté.

   Toutes les statistiques sont bilatérales et la direction annoncée est lue
   sur le signe de l'effet (H2 : delta de Cliff positif attendu ; H5 : clergé
   plus strict attendu). Seule H7 est unilatérale : un test de dispersion
   omnibus n'a pas de signe, la version directionnelle est donc codée.

   Pour H3, le coefficient standardisé (`betaAgeStandardised`, beta multiplié
   par le rapport des écarts types de l'âge et de la variable dépendante) est
   écrit dans le détail du rapport ; il ne sert qu'à lire l'effet contre les
   seuils du préenregistrement (section 4.4). La statistique confirmatoire et
   son intervalle bootstrap restent non standardisés.

   Seuils de non-testabilité, codés : Spearman n < 3 ; Mann-Whitney, un groupe
   sous 3 ; Jonckheere-Terpstra n < 6 ou moins de deux niveaux ; H3 n < 10 ;
   H7, un groupe sous 3. Une hypothèse non testable est rapportée sans valeur p
   et retirée de sa famille avant Holm (m diminue d'autant) ; la réserve
   correspondante l'écrit dans le rapport.

3. **Multiplicité.** Holm à l'intérieur de deux familles, sans correction entre
   elles : famille primaire {H1, H8}, famille secondaire {H2, H3, H4, H5, H6,
   H7}.

4. **Intervalles.** Bootstrap percentile à 95 %, 2 000 tirages, graine 20260907,
   pour chaque taille d'effet. Le rééchantillonnage porte sur les **répondants**
   (les lignes), pas sur les colonnes prises séparément.

5. **Fidélité.** Alpha de Cronbach et omega ordinal approximé par dimension et
   par sous-score de noyau, après retrait des items posés à moins de la moitié
   des répondants (voir plus bas).

6. **Sensibilité.** Tout est réexécuté (a) en excluant les répondants dont le
   drapeau de désirabilité sociale est levé, (b) séparément dans chaque canal
   d'entrée (`entryVariant`) comptant au moins 20 réponses exploitables. Aucune
   statistique stratifiée n'est calculée.

## Choix de méthode à connaître

**Jonckheere-Terpstra par permutation.** Aucune approximation asymptotique et
aucun test de secours : les groupes ordonnés sont petits et massivement ex æquo.
La distribution de référence est construite par 10 000 permutations des
étiquettes de groupe sous la graine 20260907, et la valeur p bilatérale vaut
`(1 + #{|J* − E[J]| ≥ |J − E[J]|}) / (1 + 10 000)`, jamais nulle.

**Brown-Forsythe à deux groupes.** Brown-Forsythe est le test de Levene sur les
écarts absolus à la **médiane** du groupe. Sur deux groupes, le F omnibus vaut
t², donc la version directionnelle est un test t de Welch unilatéral sur ces
écarts. C'est ce dont le plan a besoin : un F omnibus n'a pas de signe à
comparer à une direction annoncée. Aucune hypothèse n'est posée sur la position
centrale.

**Omega ordinal : approximation assumée.** L'estimateur publié (Gadermann, Guhn
et Zumbo, 2012) ajuste un modèle à un facteur sur la matrice de corrélations
**polychoriques**. Aucun estimateur polychorique n'est implémenté ici : la
matrice de corrélations de Spearman lui est substituée, les saturations sont
extraites de la première composante principale, et
`omega = (Σλ)² / ((Σλ)² + Σ(1 − λ²))`. La valeur est donc indicative et
apparaît partout avec la mention « approx. ». Une estimation polychorique
complète est le remplacement attendu si la fidélité devient un point de
discussion.

**Couverture des items pour la fidélité.** Un item posé à moins de la moitié des
répondants (bloc ministère ou bloc laïc) est retiré avant le calcul d'alpha et
d'omega. Sans cette règle, une dimension qui mélange les deux blocs n'a aucune
ligne complète et son alpha porterait sur personne. Les items retirés sont
listés dans le rapport.

**Spearman.** `scipy.stats.spearmanr` classe les ex æquo par rangs moyens :
c'est le coefficient corrigé des ex æquo. Sa valeur p repose sur
l'approximation en t.

**Mann-Whitney.** `scipy.stats.mannwhitneyu`, méthode asymptotique :
approximation normale avec correction des ex æquo et correction de continuité.

**Puissance de H7.** `power_h7.py` recalcule la puissance du test de dispersion
à l'effet attendu (rapport d'écarts types latents de 0,70, trois items
discrétisés, bruit d'item 0,3, seuils ±0,5 et ±1,5, 2 000 réplications, graine
20260907) pour les effectifs cités par le préenregistrement, section 4.4.

## Reproductibilité

Graine unique : **20260907**, pour les permutations comme pour le bootstrap.
Deux exécutions sur le même fichier donnent les mêmes nombres. Le SHA-256 de
l'export lu et celui de la cohorte analysée figurent dans le rapport et dans le
JSON ; la cohorte (`cohort_extract.csv`) doit être archivée avec eux.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `confirmatory.py` | pilote : lecture, recalcul, tests, sensibilité, rapports |
| `scoring_maps.py` | tables de cotation, transcrites du TypeScript |
| `scoring.py` | calcul des sept dimensions et des deux sous-scores de noyau |
| `stats.py` | Spearman, Mann-Whitney, Jonckheere-Terpstra, Brown-Forsythe, MCO, Holm, bootstrap, alpha, omega |
| `synthetic.py` | générateur de jeu synthétique pour `--dry-run`, avec `submittedAt` et lignes mélangées |
| `power_h7.py` | simulation de puissance de H7, paramètres écrits dans le fichier |
| `test_analysis.py` | tests : dérive vis-à-vis du TypeScript, fixtures calculées à la main, procédures statistiques |
