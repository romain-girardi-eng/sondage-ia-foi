# Addendum 1 au préenregistrement : version CNEF du questionnaire

*À déposer sur OSF avec le préenregistrement, avant l'extraction de la cohorte confirmatoire.*

## Ce qui change

Le 29 octobre 2026, à la demande du CNEF, partenaire de diffusion, la porte `/cnef` reçoit une version du questionnaire adaptée au vocabulaire évangélique (`src/lib/i18n/cnefWording.ts`, journal des versions de `METHODOLOGY.md`). Le CNEF a relu le questionnaire ; ce n'était pas le cas lors du dépôt (section 4.1). La porte générale garde l'instrument du tag `v2.0.1`. Chaque réponse donnée par la porte CNEF porte `metadata.wordingVariant = "cnef-2026-10"`.

Sur cette version, `theo_orientation` et les cinq items de Marlowe-Crowne ne sont pas posés ; les cinq items du CRS-5, `profil_formation_theologique`, `profil_anciennete_foi`, `psych_anxiete_remplacement` et une modalité de `theo_inspiration` sont reformulés ; `profil_statut` est posé à choix multiple sur huit modalités, puis recodé vers la modalité canonique de la réponse la plus engagée ; `ctrl_ia_frequence` propose un sixième niveau, « Plusieurs fois par jour », recodé `quotidien`.

## Règle d'analyse

La cohorte confirmatoire reste celle de la section 4.3 : les 200 premières réponses exploitables, toutes portes confondues. Une réponse marquée `cnef-2026-10` entre dans un test seulement si toutes les variables du test sont restées identiques sur la porte CNEF, ou s'y ramènent sans perte :

| Test | Réponses `cnef-2026-10` | Raison |
|---|---|---|
| H1 | exclues | CRS-5 reformulé ; `theo_inspiration` dans `sacredBoundaryCore` |
| H2 | incluses | `profil_confession_evangelique` garde ses valeurs ; `aiOpennessCore` garde ses items, la fréquence étant recodée sur cinq niveaux |
| H3 | exclues | covariable `religiosity` (CRS-5 reformulé) |
| H4 | exclues | `theo_orientation` non posée |
| H5 | exclues | `sacredBoundaryCore` touché ; statut recodé |
| H6 | incluses | `communaute_position_officielle` et `aiOpennessCore` comparables |
| H7 | exclues | `profil_formation_theologique` reformulé |
| H8 | incluses | fréquence recodée sur les cinq niveaux préenregistrés ; `ethicalConcern` inchangé |
| Analyse de sensibilité 1 | exclues | pas de drapeau de désirabilité sociale |

Pour H1, H3, H4, H5 et H7, l'effectif est donc celui des réponses de la porte générale comprises dans la cohorte ; la puissance est rapportée à cet effectif, comme le prévoit la section 4.4. La troisième analyse de sensibilité (un canal d'entrée à la fois) reste inchangée. `analysis/confirmatory.py` applique cette règle : il vide, pour ces réponses, les variables non comparables, ce qui les retire des seuls tests concernés (test `test_cnef_version_enters_only_the_unchanged_tests`).

## Résultats remis au CNEF

Le CNEF reçoit les résultats agrégés de sa seule porte, sous les mêmes règles d'anonymat que le tableau de bord public (k ≥ 5 par cellule, seuil de 30 participants). Ces résultats sont descriptifs et ne comportent aucune comparaison avec les autres répondants.

## Autres versions partenaires

Toute autre version du questionnaire adaptée pour un partenaire de diffusion suit la règle de la version CNEF : ses réponses entrent dans la cohorte confirmatoire pour les seuls tests dont toutes les variables sont restées identiques, ou s'y ramènent sans perte ; le partenaire reçoit les résultats agrégés de sa seule porte, sous les mêmes règles d'anonymat, sans comparaison avec les autres répondants. Un addendum au préenregistrement, qui donne pour cette version la liste des tests où ses réponses entrent, est déposé avant chaque extraction.
