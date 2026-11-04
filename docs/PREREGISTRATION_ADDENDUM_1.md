# Addendum 1 au préenregistrement : version CNEF du questionnaire

*À déposer sur OSF avec le préenregistrement, avant toute extraction de cohorte. Version du 5 novembre 2026. Cet addendum prime sur les sections 4.1, 4.3, 4.4, 6.1, 6.6 et 7 du préenregistrement pour ce qu'il modifie. À cette date, aucun test d'hypothèse n'a été conduit, aucune cohorte n'a été extraite et le tableau de bord public n'a publié aucun résultat (moins de 30 participants).*

## Ce qui change

Le 29 octobre 2026, à la demande du CNEF, partenaire de diffusion, la porte `/cnef` reçoit une version du questionnaire adaptée au vocabulaire évangélique (`src/lib/i18n/cnefWording.ts`, journal des versions de `METHODOLOGY.md`). Chaque réponse donnée par cette porte porte `metadata.wordingVariant = "cnef-2026-10"`. La porte générale garde l'instrument du tag `v2.0.1`.

Sur cette version :

- `theo_orientation` et les cinq items de Marlowe-Crowne ne sont pas posés ;
- les cinq items du CRS-5 sont reformulés ; `crs_intellect` change de contenu, passant de la réflexion sur les questions religieuses au temps spirituel personnel ;
- `profil_formation_theologique`, `profil_anciennete_foi`, `psych_anxiete_remplacement` et une modalité de `theo_inspiration` sont reformulés ;
- les exemples d'Églises de `profil_confession_evangelique` changent (« Frères » disparaît, le réseau FEF et la FEPEF apparaissent), comme des modalités de `min_pred_usage`, `laic_conseil_spirituel` et `theo_activites_sacrees` ;
- `profil_statut` est posé à choix multiple sur huit modalités, puis recodé vers la modalité canonique de la réponse la plus engagée ;
- `ctrl_ia_frequence` propose un sixième niveau, « Plusieurs fois par jour », recodé `quotidien` ;
- `profil_genre` ne propose pas « Autre », et `min_pred_nature` a une ligne « Relecture ou reformulation », enregistrée et non scorée.

Ces reformulations valent en français. La page anglaise `/eng/cnef` garde la structure de la version CNEF et les libellés anglais de l'instrument, sauf pour `profil_statut` ; ses réponses portent le même marqueur et suivent la même règle.

Le texte d'accueil de la porte change aussi, et la section 4.1 cite donc un texte qui n'est plus affiché. Il annonce que l'enquête sert à la rédaction d'une déclaration du CNEF et que le mouvement Tech & Foi en publiera les conclusions début 2027 ; il ne dit plus « sans prétention de représentativité ». Ce cadrage peut orienter les réponses (effet de demande), et il n'est pas comparable à celui de la porte générale. Le consentement de cette porte nomme désormais Tech & Foi (version 2.1).

**Rôle du CNEF.** Les sections 4.1 et 7 disent que le CNEF n'a pas participé à la conception de l'instrument et n'a exercé aucun contrôle sur elle. Pour la version CNEF, cela n'est plus exact : le CNEF a relu le questionnaire et demandé ces changements, qui ont été intégrés. Le plan d'analyse, les tests et la publication scientifique restent du seul ressort du chercheur.

## Règle d'analyse

Deux cohortes remplacent la cohorte unique de la section 4.3 :

- la **cohorte de l'instrument gelé** : les 200 premières réponses exploitables données sans le marqueur `cnef-2026-10` ;
- la **cohorte commune** : les 200 premières réponses exploitables, toutes portes confondues.

Sans réponse marquée, ces deux cohortes sont les mêmes lignes et l'on retrouve la règle préenregistrée. La raison du changement tient au calendrier de diffusion du CNEF et non à un résultat : une cohorte unique laisserait les réponses CNEF occuper des places dans des tests où elles ne peuvent pas entrer, jusqu'à priver H1, test primaire, de la puissance prévue. Les huit tests sont conduits une seule fois, ensemble, dès que la cohorte de l'instrument gelé compte 200 réponses ; la cohorte commune est alors déjà fixée.

**Date butoir.** Les tests sont conduits au plus tard le 31 mars 2027. Si la cohorte de l'instrument gelé n'est pas complète à cette date, chaque cohorte réunit les réponses exploitables enregistrées avant le 1er avril 2027 à 0 h, heure de Paris (200 au plus pour la cohorte commune). Le statut reste confirmatoire, et chaque test est rapporté avec sa puissance à l'effectif atteint, calculée pour l'effet attendu selon la section 4.4, jamais pour l'effet observé. Cette date a été fixée le 5 novembre 2026, alors que l'enquête comptait 24 participants et qu'aucun test n'avait été conduit : sans elle, les tests sur l'instrument gelé pouvaient ne jamais avoir lieu. La collecte peut continuer après cette date ; les réponses enregistrées ensuite sont exploratoires.

| Test | Cohorte | Réponses `cnef-2026-10` | Raison |
|---|---|---|---|
| H1 | instrument gelé | exclues | CRS-5 reformulé ; `theo_inspiration` dans `sacredBoundaryCore` |
| H2 | commune | incluses | les deux groupes gardent leurs valeurs, mais leurs exemples diffèrent ; `aiOpennessCore` garde ses items, la fréquence étant recodée sur cinq niveaux |
| H3 | instrument gelé | exclues | covariable `religiosity` (CRS-5 reformulé) |
| H4 | instrument gelé | exclues | `theo_orientation` non posée |
| H5 | instrument gelé | exclues | `sacredBoundaryCore` touché ; statut recodé |
| H6 | commune | incluses | `communaute_position_officielle` et `aiOpennessCore` comparables |
| H7 | instrument gelé | exclues | `profil_formation_theologique` reformulé |
| H8 | commune | incluses | fréquence recodée sur les cinq niveaux préenregistrés ; `ethicalConcern` inchangé |
| Analyse de sensibilité 1 | selon le test | exclues | pas de drapeau de désirabilité sociale |

**Lecture de H2.** Les évangéliques de la cohorte commune viendront surtout de la porte CNEF. H2 porte donc pour l'essentiel sur des répondants recrutés par un réseau de fédérations, classés avec des exemples reformulés. Son estimation par canal d'entrée (troisième analyse de sensibilité) est à lire avec le test.

**Recodages.** Le recodage vers cinq niveaux et vers une modalité canonique rend les réponses utilisables dans les tests, avec une perte d'information : le sixième niveau de fréquence et le cumul des rôles disparaissent de la variable testée. Ils restent dans les clés `_cnef_ctrl_ia_frequence` et `_cnef_profil_statut`, qui ne servent à aucun test. Le sixième niveau a pu changer la manière de répondre aux niveaux voisins, ce qui n'est pas mesuré. « Pasteur (bénévole) » est recodé `clerge`, modalité libellée « Ministre ordonné » à la porte générale ; H5 n'étant pas concernée, l'effet se limite aux descriptions.

**Analyse ajoutée, exploratoire.** Les réponses CNEF de la cohorte commune sont aussi analysées avec leurs variables adaptées, à part et hors plan, comme un autre instrument. Ce bloc n'entre dans aucune décision.

**Profils.** `theo_orientation` entre dans le calcul des profils : sans elle, un même jeu de réponses peut recevoir un autre profil. Les profils des deux portes ne sont pas comparables entre eux, et aucune analyse ne les réunit.

## Mise en œuvre des engagements du plan

`analysis/confirmatory.py` applique désormais lui-même ce que le plan lui attribuait :

- il refuse un export auquel manque `wordingVariant`, `entryVariant`, `instrumentVersion`, `submittedAt`, `consentGiven` ou `screenedOut`, ou qui porte un marqueur inconnu : la règle CNEF ne peut plus tomber en silence ;
- il retient lui-même les réponses exploitables (section 4.3) et rapporte les lignes écartées, dont les réponses v1 ;
- il marque « fidélité insuffisante » tout test reposant sur un omega inférieur à 0,60 et ajoute la corrélation de chaque item (section 6.1) ;
- il rapporte la décision de chaque hypothèse et, côte à côte, l'effet avec et sans les répondants signalés, avec la règle de l'écart substantiel (section 6.6) ;
- une valeur p indéfinie (variable constante) rend le test non testable et le retire de sa famille avant Holm ;
- il calcule pour chaque test la puissance à l'effectif atteint, pour l'effet attendu, avec les formules de la section 4.4 (et `analysis/power_h7.py` pour H7), et rapporte comme sous-puissante une hypothèse dont la puissance est inférieure à 0,80 : la condition d'effectif de la section 4.4 se lit sur cette puissance ;
- il applique la date butoir : aucune réponse enregistrée après elle n'entre dans une cohorte, et une cohorte incomplète n'est acceptée comme confirmatoire qu'une fois la date passée.

`analysis/comparability_v1_v2.py` produit la note de comparabilité prévue à la section 6.6. Le tableau par item de H8 est publié dans tous les cas, à titre descriptif : le composite `ethicalConcern` contient un item d'utilité perçue, et l'association avec la fréquence d'usage peut en dépendre.

**Verrou de l'administration.** La section 4.3 laissait visibles les moyennes par statut, confession et âge, qui sont la forme descriptive de H3, H4 et H5, et levait le verrou à la 200e réponse, juste avant les tests. Désormais, seuls les effectifs par groupe restent visibles, et le verrou ne se lève qu'après l'exécution du script (`CONFIRMATORY_ANALYSIS_DONE`). Le décompte suit la cohorte de l'instrument gelé. Jusqu'au 4 novembre 2026, ces moyennes étaient consultables : leur consultation éventuelle, sur moins de 30 réponses, est un écart mineur consigné ici.

## Résultats publics et résultats remis au CNEF

Les effectifs publiés sont arrondis à 5, ce qui empêche de lire une cellule masquée par différence. Le seuil de 30 participants est appliqué dans la fonction SQL, qui n'est plus accessible par la clé publique (migration 014). Le rang empirique du répondant repose sur des déciles arrondis au dixième, calculés parmi les personnes qui ont lu les mêmes questions, avec 30 personnes au moins par dimension. Les distributions publiques des items reformulés ne mélangent plus les deux libellés.

Le CNEF reçoit les résultats agrégés de sa seule porte, sous les mêmes règles (k ≥ 5 par cellule, seuil de 30 participants, effectifs arrondis). Ces résultats sont descriptifs, ne comportent aucune comparaison avec les autres répondants et décrivent les participants, pas les évangéliques de France ; toute publication qui en est tirée doit le dire.

**Jeu de données ouvert.** Les clés `_cnef_profil_statut` et `_cnef_ctrl_ia_frequence` s'ajoutent aux quasi-identifiants de la règle d'anonymisation de la section 7 : elles sont retirées du jeu publié.

## Écarts et chronologie déclarés

- Le préenregistrement n'est pas encore déposé. Il indiquait une date de dépôt au 12 septembre 2026, qui était la date de révision du texte ; ce champ est corrigé. L'historique public du dépôt GitHub horodate les versions successives.
- Au tag `v2.0.1`, le texte prévoyait une clôture de la collecte au 31 décembre 2026. La règle d'arrêt à effectif fixe l'a remplacée le 13 septembre 2026 (commit `f9fc1f3`).
- La collecte v2 a commencé le 7 septembre 2026, avant le dépôt, et les règles de cet addendum sont fixées pendant la collecte, sans qu'aucun résultat bivarié ait été calculé.
- `analysis/confirmatory.py` a été modifié le 29 octobre 2026 (commit `6ffb4ac`), puis les 4 et 5 novembre 2026, pour les raisons décrites ci-dessus, avant tout dépôt et toute extraction.
- La date butoir du 31 mars 2027 a été ajoutée le 5 novembre 2026.

## Autres versions partenaires

Toute autre version du questionnaire adaptée pour un partenaire de diffusion suit la règle de la version CNEF : ses réponses entrent dans la cohorte commune pour les seuls tests dont toutes les variables sont restées identiques, ou s'y ramènent sur l'échelle préenregistrée ; le partenaire reçoit les résultats agrégés de sa seule porte, sous les mêmes règles d'anonymat, sans comparaison avec les autres répondants. Un addendum au préenregistrement, qui donne pour cette version la liste des tests où ses réponses entrent, est déposé avant chaque extraction.
