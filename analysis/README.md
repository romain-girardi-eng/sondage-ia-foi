# Analyse confirmatoire — IA et foi

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
# Sur un export réel
analysis/.venv/bin/python analysis/confirmatory.py --input export.csv --out analysis/out

# Sans données : jeu synthétique généré puis analysé de bout en bout
analysis/.venv/bin/python analysis/confirmatory.py --dry-run

# Tests
analysis/.venv/bin/python -m pytest analysis -q
```

Sorties, dans `--out` (`analysis/out` par défaut) :

- `confirmatory_report.md` — rapport lisible ;
- `confirmatory_results.json` — tous les nombres, y compris le SHA-256 de
  l'extrait analysé.

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
virgules non échappées, et `instrumentVersion` et `entryVariant` n'y figurent
pas. L'extrait de clôture doit être produit par un export dédié, puis archivé
avec son SHA-256.

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
   | H2 | Mann-Whitney unilatéral, charismatiques > non-charismatiques sur `aiOpennessCore` | delta de Cliff |
   | H3 | MCO `aiOpennessCore ~ âge + religiosity`, test du coefficient d'âge | beta (âge) |
   | H4 | Jonckheere-Terpstra bilatéral sur `theo_orientation` ordonnée × `sacredBoundaryCore` | tau-b de Kendall |
   | H5 | Mann-Whitney bilatéral, clergé vs laïcs sur `sacredBoundaryCore` | delta de Cliff |
   | H6 | Jonckheere-Terpstra bilatéral sur `communaute_position_officielle` (`oui_*`) × `aiOpennessCore` | tau-b de Kendall |
   | H7 | Brown-Forsythe unilatéral, dispersion de `ethicalConcern` plus faible chez les formés | rapport des écarts absolus moyens |
   | H8 | Spearman bilatéral `ctrl_ia_frequence × ethicalConcern` | rho |

   L'âge est codé 1 = 18-35, 2 = 36-50, 3 = 51-65, 4 = 66+, pour que le signe de
   l'effet soit lisible. `theo_orientation` est codée
   traditionaliste = 1, modéré = 2, progressiste = 3 ; `ne_sait_pas` et
   `sans_reponse` sont exclus. H6 ne porte que sur les répondants déclarant une
   position officielle (`oui_defavorable` = 1, `oui_prudent` = 2,
   `oui_favorable` = 3) : `non`, `ne_sait_pas` et `sans_reponse` sont exclus,
   et l'effectif utile est rapporté.

   H5 est bilatéral : le plan ne fixe pas de sens pour la comparaison clergé /
   laïcs. H2 et H7 sont unilatéraux dans le sens annoncé.

3. **Multiplicité.** Holm à l'intérieur de deux familles, sans correction entre
   elles : famille primaire {H1, H8}, famille secondaire {H2, H3, H4, H5, H6,
   H7}.

4. **Intervalles.** Bootstrap percentile à 95 %, 2 000 tirages, graine 20260907,
   pour chaque taille d'effet. Le rééchantillonnage porte sur les **répondants**
   (les lignes), pas sur les colonnes prises séparément.

5. **Fidélité.** Alpha de Cronbach et omega ordinal par dimension et par
   sous-score de noyau.

6. **Sensibilité.** Tout est réexécuté (a) en excluant les répondants
   drapeautés par l'échelle de désirabilité sociale, (b) séparément par strate
   `entryVariant`.

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

## Reproductibilité

Graine unique : **20260907**, pour les permutations comme pour le bootstrap.
Deux exécutions sur le même fichier donnent les mêmes nombres. Le SHA-256 de
l'extrait analysé figure dans le rapport et dans le JSON ; il doit être archivé
avec eux.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `confirmatory.py` | pilote : lecture, recalcul, tests, sensibilité, rapports |
| `scoring_maps.py` | tables de cotation, transcrites du TypeScript |
| `scoring.py` | calcul des sept dimensions et des deux sous-scores de noyau |
| `stats.py` | Spearman, Mann-Whitney, Jonckheere-Terpstra, Brown-Forsythe, MCO, Holm, bootstrap, alpha, omega |
| `synthetic.py` | générateur de jeu synthétique pour `--dry-run` |
| `test_analysis.py` | tests : dérive vis-à-vis du TypeScript, fixtures calculées à la main, procédures statistiques |
