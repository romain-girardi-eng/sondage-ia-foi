# Instrument v2.0.0 — journal des changements

Référence : `docs/SCORING_V2_SPEC.md` §1.9. Ce document liste **tout** ce qui change dans le questionnaire entre `INSTRUMENT_VERSION = "1.4.0"` et `INSTRUMENT_VERSION = "2.0.0"`, avec la règle de remappage des réponses v1 déjà en base. Il sert de source à la mise à jour de `METHODOLOGY.md` et du codebook.

- `INSTRUMENT_VERSION = "2.0.0"` et `CONSENT_VERSION = "2.0"` sont exportés par `src/data/surveySchema.ts` et estampillés sur chaque réponse.
- Nombre de questions : **57 → 58**. Parcours affichés : **48** (laïc utilisant l'IA), **49** (clergé n'utilisant pas l'IA), **52** (clergé utilisant l'IA), **1** (répondant écarté).
- Texte affiché : `src/lib/i18n/questions.ts` est désormais **l'unique source**. Le schéma importe ses libellés FR et l'ordre des modalités depuis ce fichier ; le codebook généré depuis le schéma cite donc exactement ce que le répondant a lu.

## Conventions de la colonne « remappage v1 → v2 »

| Règle | Signification |
| --- | --- |
| **conservé** | Identifiant, modalités et formulation inchangés (ou clarification purement typographique). Les réponses v1 sont utilisables telles quelles. |
| **conservé\*** | Modalités inchangées mais libellé reformulé : les réponses restent lisibles, la comparabilité v1/v2 doit être traitée en strate (variable `instrumentVersion`). |
| **recodé** | Correspondance 1-1 (ou par regroupement) explicite entre valeurs v1 et v2. |
| **null** | Non comparable : la réponse v1 doit être mise à `null` pour l'analyse v2. |
| **nouveau** | Item absent en v1 : `null` pour toutes les réponses v1. |

## 1. Items ajoutés

| Id | Type | Modalités | Remappage v1 → v2 |
| --- | --- | --- | --- |
| `profil_formation_theologique` | choice, posé à tous, après `profil_education` | `aucune`, `cours_ponctuels`, `diplome_theologie`, `formation_pastorale` | nouveau → `null` |

## 2. Items supprimés

Aucun. Toutes les questions v1 sont conservées.

## 3. Modalités modifiées

| Id | v1 | v2 | Remappage v1 → v2 |
| --- | --- | --- | --- |
| `profil_confession` | `sans_religion` = « Sans religion / Autre (Fin du sondage) » | `sans_religion` = « Sans religion / Autre » | conservé (le screen-out est désormais réel, la mention n'a plus lieu d'être) |
| `profil_confession_orthodoxe` | `orthodoxe_oriental` (grec, russe, serbe…), `orthodoxe_ancien` (copte, éthiopien…) | `byzantin` (« Orthodoxe byzantin (grec, russe, roumain, serbe…) »), `oriental` (« Orthodoxe oriental (copte, arménien, syriaque, éthiopien…) ») | recodé : `orthodoxe_oriental` → `byzantin` ; `orthodoxe_ancien` → `oriental` (la nomenclature v1 était inversée par rapport à l'usage académique) |
| `profil_statut` | `clerge`, `religieux`, `laic_engagé`, `laic_pratiquant`, `curieux` | ajout de `responsable_non_ordonne` (« Responsable ou prédicateur non ordonné »), placé après `clerge` | conservé ; la catégorie n'existait pas en v1, les responsables non ordonnés s'y étaient répartis entre `clerge` et `laic_engagé` (à signaler dans les limites) |
| `profil_genre` | `autre` = « Autre / Ne souhaite pas répondre » | `autre` = « Autre » **et** `prefere_ne_pas_repondre` = « Je préfère ne pas répondre » | recodé : v1 `autre` → catégorie distincte `autre_ou_nsp`, jamais fusionnée avec `autre` v2 (les deux sens étaient confondus) |
| `profil_education` | `ne_souhaite_pas` = « Ne souhaite pas répondre » | `ne_souhaite_pas` = « Je préfère ne pas répondre » | conservé |
| `profil_milieu` | `rural` (<2 000), `periurbain` (petite ville, banlieue), `urbain_moyen` (20 000-100 000), `grande_ville` (>100 000), `metropole` (métropole / grande agglomération) | tranches contiguës : `rural` (<2 000), `periurbain` (2 000-20 000), `urbain_moyen` (20 000-100 000), `grande_ville` (100 000-500 000), `metropole` (>500 000) | `rural` et `urbain_moyen` : conservés. `periurbain`, `grande_ville`, `metropole` : **null** (les bornes v1 étaient absentes ou recouvrantes) |
| `profil_anciennete_foi` | `naissance` = « Depuis toujours (éducation chrétienne) » ; tranches recouvrantes (« Entre 10 et 20 ans »…) | `naissance` = « Depuis l'enfance (éducation chrétienne) » ; tranches exclusives (« De 10 à moins de 20 ans »…) | conservé (mêmes classes, bornes désambiguïsées) |
| `profil_annees_ministere` | « 5 à 10 ans », « 10 à 20 ans », « 20 à 30 ans », « Plus de 30 ans » | « De 5 à moins de 10 ans », « De 10 à moins de 20 ans », « De 20 à moins de 30 ans », « 30 ans ou plus » | conservé (bornes désambiguïsées) |
| `profil_taille_communaute` | « 50 à 150 », « 150 à 500 », « 500 à 1000 », « Plus de 1000 » | « De 50 à moins de 150 », « De 150 à moins de 500 », « De 500 à moins de 1 000 », « 1 000 personnes ou plus » | conservé (bornes désambiguïsées) |
| `crs_public_practice` | `jamais`, `quelques_fois_an`, `mensuel`, `hebdo` (une fois/semaine), `pluri_hebdo` (plus d'une fois/semaine) | `hebdomadaire_plus` (une fois par semaine ou plus), `mensuel` (une à trois fois par mois), `quelques_fois_an`, `rarement` (moins souvent), `jamais` | recodé par regroupement : `hebdo` + `pluri_hebdo` → `hebdomadaire_plus` ; `mensuel` → `mensuel` ; `quelques_fois_an` → `quelques_fois_an` ; `jamais` → `jamais`. `rarement` n'a pas d'équivalent v1 |
| `crs_private_practice` | `jamais`, `rarement`, `occasionnellement`, `quotidien` (quotidiennement), `pluri_quotidien` | `pluri_quotidien`, `quotidien` (une fois par jour), `hebdomadaire` (une ou plusieurs fois par semaine), `mensuel` (une à trois fois par mois), `rarement` (quelques fois par an ou moins), `jamais` | recodé partiel : `pluri_quotidien` → `pluri_quotidien` ; `quotidien` → `quotidien` ; `jamais` → `jamais`. `rarement` et `occasionnellement` v1 : **null** (ancres absentes en v1, la modalité hebdomadaire manquait) |
| `min_care_email` | `non_jamais` (« Non, jamais (manque d'empathie réelle) »), `oui_brouillon`, `oui_souvent` (« Oui, cela me permet d'être plus réactif ») | `non` (« Non »), `oui_relu` (« Oui, en relisant et modifiant »), `oui_tel_quel` (« Oui, tel quel ou presque ») | recodé : `non_jamais` → `non` ; `oui_brouillon` → `oui_relu`. `oui_souvent` : **null** (v1 mesurait la réactivité, v2 le degré de délégation) |
| `min_pred_usage` | `jamais` = « Jamais (Par principe ou désintérêt) » ; parenthèses capitalisées | `jamais` = « Jamais » ; parenthèses en minuscules | conservé (la parenthèse v1 confondait deux motifs) |
| `theo_inspiration` | `impossible` « Non, c'est impossible - l'IA ne fait que reproduire », `possible` « Oui, Dieu peut agir par tous les moyens » | libellés neutralisés : `impossible` « Non, ce n'est pas possible », `possible_indirect` « Possible, si une personne s'en saisit spirituellement », `possible` « Oui, c'est possible » | conservé\* (valeurs et ordre inchangés, libellés dépersuadés : traiter v1/v2 en strates) |
| `theo_activites_sacrees` | énoncé « ne devraient JAMAIS » ; `aucune` = « Aucune - l'IA peut intervenir partout avec discernement » | énoncé « ne devraient jamais » ; `aucune` = « Aucune de ces activités » | conservé\* |
| `communaute_perception_pairs` | `ne_sait_pas` = « Je ne sais pas / opinions variées » | `opinions_variees` = « Les opinions sont très variées » **et** `ne_sait_pas` = « Je ne sais pas » | recodé : v1 `ne_sait_pas` → catégorie distincte `ne_sait_pas_ou_variees`, jamais fusionnée avec l'une des deux modalités v2 |
| `theo_orientation`, `theo_inspiration`, `theo_mediation_humaine`, `theo_risque_futur`, `theo_utilite_percue`, `psych_godspeed_nature`, `psych_godspeed_conscience`, `psych_aias_opacity`, `psych_imago_dei`, `psych_anxiete_remplacement`, `communaute_position_officielle`, `communaute_discussions`, `communaute_perception_pairs` | — | ajout de `sans_reponse` (« Je préfère ne pas répondre ») **en dernière position** | conservé (modalité ajoutée, aucune réponse v1 affectée ; `sans_reponse` est une donnée manquante, jamais imputée) |

`sans_reponse` n'est pas ajouté aux items à échelle (`theo_liturgie_ia`) faute d'emplacement, ni aux items à choix multiples (`theo_activites_sacrees`), où une modalité « aucune » exclusive joue déjà ce rôle et où « préfère ne pas répondre » serait ambigu avec une sélection partielle.

## 4. Énoncés modifiés

| Id | v1 (texte affiché) | v2 | Remappage v1 → v2 |
| --- | --- | --- | --- |
| `crs_experience` | « À quelle fréquence vivez-vous des moments de spiritualité profonde ? » | « À quelle fréquence vivez-vous des situations où vous avez le sentiment que Dieu ou quelque chose de divin intervient dans votre vie ? » (Huber & Huber, 2012) | **null** (construit différent : expérience esthétique/intériorité vs expérience d'intervention divine) |
| `crs_public_practice` | « À quelle fréquence participez-vous à des offices religieux ? » | « … à des offices religieux (messe, culte, liturgie) ? » | conservé (précision d'exemples ; voir le recodage des modalités ci-dessus) |
| `theo_activites_sacrees` | « … ne devraient JAMAIS faire intervenir l'IA ? » | « … ne devraient jamais faire intervenir l'IA ? » | conservé\* |
| `profil_taille_communaute` | divergence : schéma « Combien de personnes assistent régulièrement aux offices… » vs affiché « Quelle est la taille approximative de votre communauté / paroisse ? » | énoncé unique : « Quelle est la taille approximative de votre communauté / paroisse ? » (celui réellement affiché en v1) | conservé |
| `profil_anciennete_foi` | divergence : schéma « Depuis combien de temps êtes-vous engagé(e) dans la foi chrétienne ? » vs affiché « Depuis combien de temps vous considérez-vous comme croyant(e) / pratiquant(e) ? » | énoncé unique : celui affiché | conservé |
| `digital_attitude_generale` | divergence : schéma « … dans la vie spirituelle ? » vs affiché « … dans votre vie spirituelle personnelle ? » | énoncé unique : celui affiché | conservé |
| `theo_inspiration` | divergence : schéma « … porteur d'un message spirituel authentique ? » vs affiché « … avoir une dimension spirituelle authentique ? » | énoncé unique : celui affiché | conservé |

Les quatre dernières lignes corrigent les divergences connues entre `surveySchema.ts` et `questions.ts` : dans chaque cas c'est **le texte réellement affiché** (celui de `questions.ts`, prioritaire dans `QuestionCard`) qui devient canonique, donc aucune réponse v1 n'est invalidée.

## 5. Logique de parcours

| Changement | Détail | Remappage v1 → v2 |
| --- | --- | --- |
| Screen-out effectif | `profil_confession = sans_religion` termine le questionnaire après la première question. La réponse est enregistrée avec `metadata.screenedOut = true`, sans scoring, sans étape email, sur un écran de remerciement court. Helpers : `isScreenedOut()` / `getVisibleQuestions()` (`src/data/surveySchema.ts`) | Les réponses v1 `sans_religion` complètes restent en base ; elles doivent être exclues des analyses comme les nouvelles (filtrer `answers.profil_confession = 'sans_religion'` **ou** `metadata.screenedOut = true`) |
| Routage clergé | `responsable_non_ordonne` est traité comme clergé (`CLERGY_STATUSES` dans `src/lib/utils/answers.ts`) | sans objet |
| `min_admin_burden` | conditionné à `clergyUsesAI` (clergé **et** usage réel de l'IA) au lieu de `isClergy` | conservé : les réponses v1 de clergé n'utilisant pas l'IA portent sur un gain de temps jamais expérimenté ; les écarter ou les traiter en covariable |
| Multi-choix exclusifs | toute modalité dont la valeur commence par `aucun` (`aucun`, `aucune`, `aucun_domaines`) est exclusive : l'UI vide les autres sélections et la validation serveur rejette la combinaison | des réponses v1 combinant `aucun*` et d'autres modalités peuvent exister : les nettoyer avant analyse (conserver `aucun*` seul ou marquer l'item `null`) |

## 6. Métadonnées de soumission

| Champ | Valeur | Notes |
| --- | --- | --- |
| `metadata.instrumentVersion` | `"2.0.0"` | déjà présent en v1 (`"1.4.0"`) |
| `metadata.entryVariant` | `'general' \| 'cnef'` | canal de recrutement (page d'entrée), **pas** une confession ; absent des réponses v1 → `null` |
| `metadata.screenedOut` | `true` uniquement pour les répondants écartés | absent des réponses v1 |
| `consentVersion` | `"2.0"` | v1 : `"1.0"` |

## 7. Consentement et débriefing

- Case de consentement (FR/EN) : ajout de l'**âge minimal 18 ans**, de la **publication d'un jeu de données ouvert anonymisé**, et du **droit de retrait** via `/mes-donnees`. Clés `consent.checkbox`, `consent.details`, `consent.minimumAge`.
- Variante CNEF : clé dédiée `consent.checkboxCnef`, mentionnant l'exploitation agrégée et anonyme par le CNEF, partenaire de l'enquête.
- Durée annoncée : « 5 à 7 minutes » → « **8 à 12 minutes** » (`intro.time`, `intro.featureDuration`). **À remplacer par la médiane observée** dès que N le permet (`metadata.timeSpent`).
- Écran de fin : phrase de débriefing (`thanks.debrief`) expliquant que les cinq affirmations vrai/faux mesuraient la désirabilité sociale et n'entrent pas dans le profil.
- Écran de screen-out : `thanks.screenedOutTitle` / `thanks.screenedOutDescription`.

## 8. Points ouverts pour la documentation

1. **Ordre des modalités CRS-5** : les deux items de pratique (`crs_public_practice`, `crs_private_practice`) sont présentés du plus fréquent au moins fréquent (format Huber & Huber), tandis que `crs_intellect`, `crs_ideology` et `crs_experience` restent du moins fréquent au plus fréquent (ordre v1, conservé pour ne pas modifier des items par ailleurs inchangés). À trancher avant la collecte : uniformiser ou documenter l'écart.
2. **Durée annoncée** : « 8 à 12 minutes » est une estimation ; à remplacer par la médiane observée.
3. **Strates v1/v2** : toute analyse poolant les deux versions doit contrôler `metadata.instrumentVersion` pour les items marqués « conservé\* ».
4. **Test e2e du screen-out** : à ajouter dans `e2e/survey-flow.spec.ts` une fois la réécriture du scoring terminée (la page du sondage ne compile pas tant que `src/lib/scoring` est en cours de refonte).
