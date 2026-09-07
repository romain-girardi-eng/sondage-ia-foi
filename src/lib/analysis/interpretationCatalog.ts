/**
 * Catalogue pré-spécifié des interprétations concurrentes.
 *
 * Il est pré-spécifié au sens fort : les explications rivales sont écrites avant
 * de voir les données, pour éviter de raconter après coup l’histoire que le
 * signe du r suggère. Chaque paire propose 2 à 4 mécanismes concurrents, et
 * aucun libellé n’affirme une causalité, tous sont au conditionnel.
 *
 * Les références citées le sont au titre du raisonnement qu’elles rendent
 * plausible, jamais comme une validation du résultat local.
 */

import type { Interpretation } from './types';

export type HypothesisId = 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'H7' | 'H8';

export interface Hypothesis {
  id: HypothesisId;
  /** Variables brutes ou dimensions comparées. */
  variables: [string, string];
  /** Énoncé directionnel, tel qu’il figure dans METHODOLOGY.md §6. */
  statement: string;
}

export interface CatalogEntry {
  pair: [string, string];
  hypothesis?: HypothesisId;
  interpretations: Interpretation[];
}

/**
 * Covariables effectivement collectées par l’instrument v2.
 * `profil_formation_theologique` est ajouté par la v2 (SPEC §1.9) et figure
 * dans PLANNED_V2_VARIABLES tant qu’il n’est pas présent dans surveySchema.
 */
export const PLANNED_V2_VARIABLES: readonly string[] = ['profil_formation_theologique'];

const DESIRABILITY_ITEMS = ['ctrl_mc_1', 'ctrl_mc_2', 'ctrl_mc_3', 'ctrl_mc_4', 'ctrl_mc_5'];

export const DEFAULT_COLLECTED_COVARIATES: readonly string[] = [
  'profil_confession',
  'profil_confession_catholique',
  'profil_confession_protestante',
  'profil_confession_evangelique',
  'profil_confession_orthodoxe',
  'profil_confession_autre',
  'profil_statut',
  'profil_age',
  'profil_genre',
  'profil_education',
  'profil_formation_theologique',
  'profil_pays',
  'profil_milieu',
  'profil_secteur',
  'profil_anciennete_foi',
  'profil_annees_ministere',
  'profil_taille_communaute',
  'theo_orientation',
  'ctrl_ia_frequence',
  'ctrl_ia_confort',
  'ctrl_ia_contextes',
  'digital_outils_existants',
  'communaute_position_officielle',
  'communaute_discussions',
  'communaute_perception_pairs',
  ...DESIRABILITY_ITEMS,
];

export const HYPOTHESES: Record<HypothesisId, Hypothesis> = {
  H1: {
    id: 'H1',
    variables: ['religiosity', 'sacredBoundary'],
    statement:
      'Une centralité religieuse plus élevée irait de pair avec une frontière sacrée plus stricte.',
  },
  H2: {
    id: 'H2',
    variables: ['profil_confession_evangelique', 'aiOpenness'],
    statement:
      'Les répondants charismatiques et évangéliques présenteraient une ouverture à l’IA distincte de celle de leurs coreligionnaires non charismatiques.',
  },
  H3: {
    id: 'H3',
    variables: ['profil_age', 'aiOpenness'],
    statement:
      'Les répondants plus jeunes présenteraient une ouverture à l’IA plus grande, indépendamment de leur niveau de religiosité.',
  },
  H4: {
    id: 'H4',
    variables: ['theo_orientation', 'sacredBoundary'],
    statement:
      'Une orientation théologique conservatrice irait de pair avec une frontière sacrée plus stricte.',
  },
  H5: {
    id: 'H5',
    variables: ['profil_statut', 'sacredBoundaryCore'],
    statement:
      'Le clergé présenterait une frontière sacrée de noyau commun plus stricte que les laïcs.',
  },
  H6: {
    id: 'H6',
    variables: ['communaute_position_officielle', 'aiOpenness'],
    statement:
      'La position officielle perçue de la communauté irait de pair avec l’ouverture individuelle à l’IA.',
  },
  H7: {
    id: 'H7',
    variables: ['profil_formation_theologique', 'ethicalConcern'],
    statement:
      'Une formation théologique formelle irait de pair avec une préoccupation éthique plus articulée, et moins extrême.',
  },
  H8: {
    id: 'H8',
    variables: ['ctrl_ia_frequence', 'ethicalConcern'],
    statement:
      'Un usage quotidien de l’IA irait de pair avec une préoccupation éthique plus faible.',
  },
};

export const INTERPRETATION_CATALOG: CatalogEntry[] = [
  // ==========================================
  // Paires de dimensions
  // ==========================================
  {
    pair: ['religiosity', 'sacredBoundary'],
    hypothesis: 'H1',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La centralité religieuse orienterait vers une frontière sacrée plus stricte',
        rationale:
          'Huber et Huber (2012) définissent la centralité comme la saillance quotidienne des contenus religieux. Plus ces contenus sont saillants, plus les catégories de sacré et de profane décrites par Durkheim (1912) et Eliade (1957) seraient disponibles pour trier ce qui peut être délégué à une machine.',
        confounders: ['theo_orientation', 'profil_statut', 'profil_age'],
        testable:
          'Estimer la pente religiosité vers frontière sacrée à theo_orientation constante, puis à profil_statut constant.',
      },
      {
        mechanism: 'confounder',
        label: 'Une orientation théologique conservatrice alimenterait les deux mesures',
        rationale:
          'Les groupes doctrinalement stricts obtiennent à la fois un engagement plus intense et une défense plus nette des formes rituelles (Iannaccone 1994). La relation observée pourrait ne refléter que cette position commune.',
        confounders: ['theo_orientation', 'profil_confession', 'profil_anciennete_foi'],
        testable:
          'Stratifier par theo_orientation et vérifier si le r subsiste dans chaque strate.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Une frontière sacrée déjà stricte soutiendrait l’engagement religieux',
        rationale:
          'La littérature sur les frontières symboliques (Lamont et Molnár 2002) décrit des frontières qui, une fois posées, alimentent en retour l’appartenance et la pratique. Une passation unique ne permet pas d’écarter ce sens de lecture.',
        confounders: ['profil_anciennete_foi'],
        testable: null,
      },
      {
        mechanism: 'construct_overlap',
        label: 'Les deux scores capteraient partiellement le même attachement au culte',
        rationale:
          'L’item crs_public_practice porte sur la fréquentation du culte, et plusieurs items de frontière sacrée portent sur ce qui doit rester humain dans ce même culte. Un recouvrement conceptuel suffirait à produire une association.',
        confounders: [],
        testable:
          'Recalculer la corrélation après retrait de crs_public_practice du score de religiosité.',
      },
    ],
  },
  {
    pair: ['religiosity', 'aiOpenness'],
    interpretations: [
      {
        mechanism: 'confounder',
        label: 'L’âge structurerait à la fois la pratique religieuse et l’usage numérique',
        rationale:
          'Les cohortes plus âgées sont en moyenne plus pratiquantes et moins équipées en outils d’IA. Hargittai (2010) montre que les écarts d’usage tiennent autant aux compétences qu’à l’accès, ce qui rend la covariation d’âge très plausible ici.',
        confounders: ['profil_age', 'profil_education', 'profil_secteur'],
        testable: 'Contrôler par profil_age puis par profil_education dans une régression.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Une religiosité plus centrale s’accompagnerait d’une réserve envers l’IA',
        rationale:
          'Campbell (2010) décrit un filtrage communautaire des technologies selon leur compatibilité avec les valeurs centrales du groupe. Plus ces valeurs sont saillantes, plus le filtrage serait sélectif.',
        confounders: ['theo_orientation', 'profil_confession'],
        testable:
          'Comparer la relation chez les répondants dont la communauté a pris position et chez les autres.',
      },
      {
        mechanism: 'selection',
        label: 'Le recrutement en ligne déformerait la relation observée',
        rationale:
          'Une enquête diffusée par canaux numériques sur-représente les croyants à l’aise avec le numérique (Bethlehem 2010). Cette troncature peut atténuer, annuler ou inverser une relation présente dans la population.',
        confounders: ['profil_age', 'ctrl_ia_confort'],
        testable:
          'Comparer les répondants venus de la variante générale et de la variante partenaire, à âge constant.',
      },
    ],
  },
  {
    pair: ['religiosity', 'ethicalConcern'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'L’intensité religieuse nourrirait la vigilance éthique envers l’IA',
        rationale:
          'Graham, Haidt et Nosek (2009) observent que les fondements moraux de sainteté et d’autorité pèsent davantage chez les personnes religieuses. Une technologie perçue comme touchant à la dignité humaine y serait évaluée plus sévèrement.',
        confounders: ['profil_education', 'profil_formation_theologique', 'theo_orientation'],
        testable: 'Contrôler par profil_formation_theologique et par profil_education.',
      },
      {
        mechanism: 'confounder',
        label: 'La formation reçue expliquerait à la fois la pratique et l’argumentation éthique',
        rationale:
          'Une formation théologique ou universitaire fournit un vocabulaire éthique et va souvent de pair avec un engagement religieux plus formalisé. Les deux scores pourraient dépendre de cette ressource commune.',
        confounders: ['profil_formation_theologique', 'profil_education', 'profil_secteur'],
        testable: 'Stratifier par profil_formation_theologique.',
      },
      {
        mechanism: 'method_artifact',
        label: 'Un style de réponse commun gonflerait les deux scores',
        rationale:
          'Les deux dimensions reposent sur des items d’accord présentés dans une même passation, configuration exposée au biais de méthode commune (Podsakoff et al. 2003). Une tendance à l’acquiescement ou à la désirabilité produirait une association sans lien substantiel.',
        confounders: DESIRABILITY_ITEMS,
        testable:
          'Comparer le r chez les répondants signalés par l’échelle de désirabilité sociale et chez les autres.',
      },
    ],
  },
  {
    pair: ['religiosity', 'psychologicalPerception'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'Une religiosité plus centrale rendrait plus saillante la question du statut de l’IA',
        rationale:
          'La perception d’un esprit chez autrui se décompose en agentivité et en expérience (Gray, Gray et Wegner 2007). Un cadre anthropologique explicite, où l’humain est défini par une vocation particulière, fournirait une grille prête à l’emploi pour trancher ce que l’IA est ou n’est pas.',
        confounders: ['profil_education', 'ctrl_ia_confort'],
        testable: 'Contrôler par ctrl_ia_confort, la familiarité technique pouvant jouer le même rôle.',
      },
      {
        mechanism: 'confounder',
        label: 'La familiarité technique expliquerait les deux mesures',
        rationale:
          'Epley, Waytz et Cacioppo (2007) lient l’anthropomorphisme au déficit de connaissance sur l’objet. Le niveau de familiarité technique, corrélé au milieu et au secteur d’activité, pourrait porter la relation entière.',
        confounders: ['ctrl_ia_confort', 'profil_secteur', 'profil_education'],
        testable: 'Stratifier par ctrl_ia_confort en trois groupes.',
      },
      {
        mechanism: 'selection',
        label: 'L’intérêt pour le sujet biaiserait le recrutement dans les deux directions',
        rationale:
          'Un questionnaire annoncé sur l’IA et la foi attire des personnes déjà engagées sur ce terrain. Cette double sélection peut créer une association absente dans la population, mécanisme de conditionnement sur un collisionneur décrit par Cole et al. (2010).',
        confounders: [],
        testable: null,
      },
    ],
  },
  {
    pair: ['religiosity', 'communityContext'],
    interpretations: [
      {
        mechanism: 'confounder',
        label: 'Le statut dans la communauté porterait les deux mesures',
        rationale:
          'Le clergé et les laïcs engagés cumulent une pratique plus intense et une meilleure connaissance des positions officielles. Ce statut suffirait à produire l’association.',
        confounders: ['profil_statut', 'profil_annees_ministere', 'profil_taille_communaute'],
        testable: 'Comparer clergé et laïcs séparément.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Un engagement religieux plus fort exposerait davantage au discours communautaire',
        rationale:
          'Berger (1967) décrit la communauté comme structure de plausibilité qui entretient la croyance. Une présence plus fréquente exposerait mécaniquement à davantage de prises de position et de discussions sur l’IA.',
        confounders: ['profil_taille_communaute'],
        testable: 'Contrôler par la fréquence de participation mesurée par crs_public_practice.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Un contexte communautaire dense soutiendrait la centralité religieuse',
        rationale:
          'Stark et Finke (2000) soutiennent que l’engagement religieux se maintient par les réseaux locaux plutôt que par la conviction isolée. Le sens de lecture inverse est donc au moins aussi défendable.',
        confounders: [],
        testable: null,
      },
    ],
  },
  {
    pair: ['religiosity', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La religiosité orienterait l’intention future via l’utilité perçue pour le ministère',
        rationale:
          'Dans le modèle d’acceptation des technologies (Davis 1989), l’intention dépend d’abord de l’utilité perçue. Un engagement religieux fort peut rendre l’IA utile pour la mission ou au contraire hors sujet, ce qui rend le signe attendu incertain.',
        confounders: ['profil_statut', 'ctrl_ia_frequence'],
        testable: 'Contrôler par theo_utilite_percue et par profil_statut.',
      },
      {
        mechanism: 'confounder',
        label: 'L’âge et la position ministérielle expliqueraient les deux mesures',
        rationale:
          'L’intention d’usage à douze mois dépend fortement de l’horizon professionnel et de l’âge, deux variables également associées à la pratique religieuse dans cet échantillon.',
        confounders: ['profil_age', 'profil_statut', 'profil_annees_ministere'],
        testable: 'Ajouter profil_age et profil_statut comme covariables.',
      },
      {
        mechanism: 'selection',
        label: 'L’auto-sélection concentrerait les profils à forte intention',
        rationale:
          'Les répondants qui achèvent un questionnaire long sur l’IA sont plus susceptibles d’avoir déjà un projet d’usage. La variance de l’intention est alors tronquée, ce qui déforme l’estimation.',
        confounders: [],
        testable: 'Comparer les sessions complètes aux sessions abandonnées sur les items communs.',
      },
    ],
  },
  {
    pair: ['aiOpenness', 'sacredBoundary'],
    interpretations: [
      {
        mechanism: 'construct_overlap',
        label: 'Les deux dimensions décriraient une même attitude générale envers l’IA',
        rationale:
          'Une attitude globale unique, au sens d’Ajzen (1991), pourrait générer à la fois les réponses d’usage et les réponses de refus. La distinction entre ouverture et frontière serait alors analytique plutôt qu’empirique.',
        confounders: [],
        testable:
          'Vérifier la structure factorielle des items des deux dimensions une fois n suffisant.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'La pratique de l’IA assouplirait progressivement la frontière posée',
        rationale:
          'Logg, Minson et Moore (2019) observent que l’appréciation des algorithmes augmente avec l’expérience directe. Un usage régulier pourrait déplacer la ligne de ce qui paraît acceptable dans le champ spirituel.',
        confounders: ['ctrl_ia_frequence', 'profil_age'],
        testable: 'Comparer les usagers quotidiens et les non usagers à âge constant.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Une frontière stricte limiterait en amont l’adoption',
        rationale:
          'Parasuraman et Riley (1997) décrivent le non usage délibéré comme une réponse rationnelle à une défiance préalable. La conviction précéderait alors le comportement.',
        confounders: ['theo_orientation'],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'L’orientation théologique déterminerait les deux positions',
        rationale:
          'Une sensibilité traditionaliste rendrait à la fois l’adoption moins probable et la frontière plus nette, sans lien direct entre les deux.',
        confounders: ['theo_orientation', 'profil_confession', 'profil_age'],
        testable: 'Stratifier par theo_orientation.',
      },
    ],
  },
  {
    pair: ['aiOpenness', 'ethicalConcern'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'La préoccupation éthique freinerait l’adoption',
        rationale:
          'La défiance envers un système automatisé se traduit couramment par un non usage assumé (Parasuraman et Riley 1997). Le sens éthique vers usage est le plus souvent postulé dans la littérature d’acceptation.',
        confounders: ['profil_education', 'profil_secteur'],
        testable: 'Comparer les non usagers déclarés et les usagers occasionnels.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'L’usage régulier atténuerait la perception du risque',
        rationale:
          'La familiarité réduit l’incertitude perçue et donc l’évaluation du risque. Une réduction de dissonance (Festinger 1957) est également plausible chez qui utilise déjà l’outil quotidiennement.',
        confounders: ['ctrl_ia_frequence', 'ctrl_ia_confort'],
        testable: 'Contrôler par ctrl_ia_frequence, qui alimente déjà la dimension d’ouverture.',
      },
      {
        mechanism: 'confounder',
        label: 'Le niveau d’études et le secteur porteraient les deux mesures',
        rationale:
          'Le secteur d’activité conditionne à la fois l’exposition professionnelle aux outils et la familiarité avec les débats éthiques les concernant.',
        confounders: ['profil_education', 'profil_secteur', 'ctrl_ia_confort'],
        testable: 'Ajouter profil_secteur comme covariable.',
      },
    ],
  },
  {
    pair: ['aiOpenness', 'psychologicalPerception'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'L’usage modifierait la représentation de ce qu’est une IA',
        rationale:
          'Nass et Moon (2000) montrent que l’interaction avec une machine conversationnelle déclenche des réponses sociales automatiques. Un usage fréquent pourrait donc nourrir, ou au contraire dissiper, l’attribution d’une intériorité.',
        confounders: ['ctrl_ia_confort', 'profil_education'],
        testable: 'Comparer les usagers quotidiens et les non usagers sur psych_godspeed_conscience.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Attribuer une conscience à l’IA découragerait son usage',
        rationale:
          'L’effet de vallée de l’étrange décrit par Mori (1970) associe une ressemblance humaine trop grande à un malaise. Ce malaise pourrait précéder et limiter l’adoption.',
        confounders: [],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'La familiarité technique expliquerait les deux réponses',
        rationale:
          'Epley, Waytz et Cacioppo (2007) relient l’anthropomorphisme au manque de connaissance du fonctionnement de l’objet. La maîtrise technique déclarée est mesurée ici et devrait être testée en premier.',
        confounders: ['ctrl_ia_confort', 'profil_secteur'],
        testable: 'Stratifier par ctrl_ia_confort.',
      },
    ],
  },
  {
    pair: ['aiOpenness', 'communityContext'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'Le climat communautaire orienterait l’ouverture individuelle',
        rationale:
          'La norme subjective est un déterminant reconnu de l’intention d’usage (Venkatesh et al. 2003), et la théorie de la conduite normative (Cialdini, Reno et Kallgren 1990) distingue norme perçue et norme réelle. Une communauté favorable rendrait l’adoption socialement moins coûteuse.',
        confounders: ['profil_statut', 'profil_taille_communaute'],
        testable: 'Comparer les répondants dont la communauté a pris position et les autres.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Les usagers percevraient leur communauté comme plus favorable qu’elle ne l’est',
        rationale:
          'L’effet de faux consensus (Ross, Greene et House 1977) conduit à surestimer la part d’autrui partageant sa position. La mesure du contexte étant déclarative, elle est exposée à cette projection.',
        confounders: [],
        testable:
          'Comparer la perception des pairs aux moyennes observées dans la même communauté quand n le permet.',
      },
      {
        mechanism: 'confounder',
        label: 'Le type de communauté expliquerait les deux mesures',
        rationale:
          'Les grandes assemblées urbaines cumulent équipement numérique et discours institutionnel structuré sur l’IA, sans lien individuel entre les deux.',
        confounders: ['profil_taille_communaute', 'profil_milieu', 'profil_confession'],
        testable: 'Ajouter profil_milieu et profil_taille_communaute comme covariables.',
      },
    ],
  },
  {
    pair: ['aiOpenness', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'construct_overlap',
        label: 'Usage actuel et intention future relèveraient du même construit',
        rationale:
          'Dans la théorie du comportement planifié (Ajzen 1991) le comportement passé est le meilleur prédicteur de l’intention, au point que les deux mesures se distinguent mal. Une forte corrélation serait ici attendue par construction.',
        confounders: [],
        testable:
          'Comparer la corrélation à celle obtenue entre deux moitiés aléatoires de la même dimension.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'L’usage installé nourrirait l’intention de poursuivre',
        rationale:
          'L’habitude réduit le coût perçu de la poursuite d’un usage et rend l’intention presque automatique.',
        confounders: ['ctrl_ia_frequence'],
        testable: 'Retirer ctrl_ia_frequence du score d’ouverture et recalculer.',
      },
      {
        mechanism: 'method_artifact',
        label: 'La proximité des items dans le questionnaire gonflerait l’association',
        rationale:
          'Des items voisins dans une même passation produisent des réponses cohérentes par effet de contexte, mécanisme central du biais de méthode commune (Podsakoff et al. 2003).',
        confounders: [],
        testable: 'Comparer les répondants ayant répondu vite et lentement au bloc concerné.',
      },
    ],
  },
  {
    pair: ['sacredBoundary', 'ethicalConcern'],
    interpretations: [
      {
        mechanism: 'construct_overlap',
        label: 'Les deux dimensions exprimeraient une même réserve normative',
        rationale:
          'Refuser l’IA dans le culte et s’inquiéter de ses effets sur la dignité humaine peuvent relever d’une seule attitude de retenue. Cronbach et Meehl (1955) rappellent qu’une corrélation élevée entre deux échelles voisines est d’abord une question de validité discriminante.',
        confounders: [],
        testable: 'Examiner la validité discriminante par analyse factorielle une fois n suffisant.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'La clôture du sacré alimenterait la lecture éthique des usages',
        rationale:
          'Le fondement moral de sainteté décrit par Graham, Haidt et Nosek (2009) traduit une transgression rituelle en jugement moral général. Ce transfert rendrait la préoccupation éthique dépendante de la frontière posée.',
        confounders: ['theo_orientation', 'profil_formation_theologique'],
        testable: 'Contrôler par theo_orientation.',
      },
      {
        mechanism: 'confounder',
        label: 'L’orientation théologique et la formation porteraient les deux scores',
        rationale:
          'Une position théologique explicite fournit simultanément des raisons de protéger le rite et des raisons de critiquer la technique.',
        confounders: ['theo_orientation', 'profil_formation_theologique', 'profil_education'],
        testable: 'Stratifier par theo_orientation puis par profil_formation_theologique.',
      },
    ],
  },
  {
    pair: ['sacredBoundary', 'psychologicalPerception'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'La perception de la nature de l’IA déplacerait la frontière posée',
        rationale:
          'Selon que l’IA est vue comme un outil ou comme une entité dotée d’une forme d’intériorité, l’enjeu rituel change de nature. La perception d’un esprit modifie les obligations morales attribuées (Gray, Gray et Wegner 2007).',
        confounders: ['profil_education', 'ctrl_ia_confort'],
        testable: 'Contrôler par ctrl_ia_confort et par profil_education.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Une frontière stricte conduirait à rejeter toute intériorité de la machine',
        rationale:
          'Poser que le sacré exige une présence humaine engage à nier à la machine ce qui la rendrait admissible. La cohérence des positions peut se construire dans ce sens également.',
        confounders: ['theo_orientation'],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'L’anthropologie théologique implicite expliquerait les deux mesures',
        rationale:
          'Une conception forte de la singularité humaine produit simultanément un refus de l’IA dans le culte et un refus de lui prêter une conscience, sans relation causale entre les deux.',
        confounders: ['theo_orientation', 'profil_formation_theologique', 'profil_confession'],
        testable: 'Stratifier par profil_confession et par theo_orientation.',
      },
    ],
  },
  {
    pair: ['sacredBoundary', 'communityContext'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'La norme communautaire perçue orienterait la frontière individuelle',
        rationale:
          'Berger et Luckmann (1966) décrivent la construction sociale des évidences partagées. Le tracé de ce qui est admissible dans le culte est typiquement une évidence produite collectivement plutôt qu’un arbitrage individuel.',
        confounders: ['profil_confession', 'profil_statut'],
        testable: 'Comparer les répondants d’une même confession selon la position officielle rapportée.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Les convictions individuelles coloreraient la perception du climat communautaire',
        rationale:
          'La mesure du contexte reposant sur une perception déclarée, elle est exposée à une projection de ses propres positions sur le groupe.',
        confounders: [],
        testable: 'Comparer les perceptions rapportées au sein d’une même communauté quand n le permet.',
      },
      {
        mechanism: 'confounder',
        label: 'L’appartenance confessionnelle porterait les deux mesures',
        rationale:
          'Les traditions diffèrent à la fois par leur théologie sacramentelle et par leur capacité institutionnelle à produire des positions officielles.',
        confounders: ['profil_confession', 'profil_confession_catholique', 'profil_confession_evangelique'],
        testable: 'Stratifier par profil_confession.',
      },
    ],
  },
  {
    pair: ['sacredBoundary', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'Une frontière stricte réduirait l’intention d’usage à venir',
        rationale:
          'Une norme personnelle défavorable diminue l’intention comportementale dans le cadre d’Ajzen (1991), indépendamment de l’utilité perçue de l’outil.',
        confounders: ['ctrl_ia_frequence', 'profil_age'],
        testable: 'Contrôler par ctrl_ia_frequence, l’usage passé prédisant fortement l’intention.',
      },
      {
        mechanism: 'confounder',
        label: 'L’âge et l’usage installé expliqueraient les deux mesures',
        rationale:
          'Les répondants âgés déclarent moins d’intentions d’usage et posent des frontières plus nettes, ce qui suffirait à produire l’association.',
        confounders: ['profil_age', 'ctrl_ia_frequence', 'profil_statut'],
        testable: 'Ajouter profil_age comme covariable.',
      },
      {
        mechanism: 'selection',
        label: 'La troncature de l’échantillon déformerait la relation',
        rationale:
          'Les personnes hostiles à l’IA dans le champ spirituel sont moins susceptibles de terminer un questionnaire sur ce thème. Cette perte différentielle affecte les deux variables (Bethlehem 2010).',
        confounders: [],
        testable: 'Comparer les sessions abandonnées et complètes sur les items communs déjà répondus.',
      },
    ],
  },
  {
    pair: ['ethicalConcern', 'psychologicalPerception'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'Percevoir une opacité ou une intériorité nourrirait la préoccupation éthique',
        rationale:
          'L’opacité perçue d’un système est un déterminant classique de la méfiance envers l’automatisation. Attribuer en outre une forme d’expérience à la machine engage des considérations morales supplémentaires (Gray, Gray et Wegner 2007).',
        confounders: ['profil_education', 'ctrl_ia_confort'],
        testable: 'Contrôler par ctrl_ia_confort.',
      },
      {
        mechanism: 'construct_overlap',
        label: 'Les deux dimensions relèveraient d’une même inquiétude diffuse',
        rationale:
          'Les items d’opacité, d’anticipation de remplacement et de dignité humaine peuvent charger sur un facteur unique d’inquiétude. La séparation retenue en v2 est conceptuelle et reste à valider empiriquement.',
        confounders: [],
        testable: 'Tester un modèle à un facteur contre un modèle à deux facteurs.',
      },
      {
        mechanism: 'method_artifact',
        label: 'Un style de réponse commun produirait l’association',
        rationale:
          'Les deux blocs sont contigus et utilisent le même format d’échelle, ce qui expose au biais de méthode commune (Podsakoff et al. 2003).',
        confounders: DESIRABILITY_ITEMS,
        testable: 'Comparer le r selon le drapeau de désirabilité sociale.',
      },
    ],
  },
  {
    pair: ['ethicalConcern', 'communityContext'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'La discussion collective structurerait le cadrage éthique individuel',
        rationale:
          'Une communauté qui thématise l’IA fournit des arguments et un vocabulaire disponibles. Berger (1967) rappelle que la plausibilité d’une position tient à son entretien conversationnel.',
        confounders: ['profil_statut', 'profil_taille_communaute'],
        testable: 'Comparer selon communaute_discussions à statut constant.',
      },
      {
        mechanism: 'x_causes_y',
        label: 'Une préoccupation éthique forte pousserait à engager la discussion communautaire',
        rationale:
          'Les personnes préoccupées cherchent à en parler et déclarent donc davantage de discussions. Le sens de lecture inverse est équivalent en plausibilité.',
        confounders: [],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'Le statut dans la communauté porterait les deux mesures',
        rationale:
          'Le clergé est à la fois plus exposé aux prises de position institutionnelles et davantage sollicité sur les questions éthiques.',
        confounders: ['profil_statut', 'profil_secteur', 'profil_formation_theologique'],
        testable: 'Comparer clergé et laïcs séparément.',
      },
    ],
  },
  {
    pair: ['ethicalConcern', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La préoccupation éthique réduirait l’intention d’usage future',
        rationale:
          'Une évaluation négative des conséquences diminue l’intention dans les modèles d’acceptation (Davis 1989, Ajzen 1991).',
        confounders: ['ctrl_ia_frequence', 'profil_age'],
        testable: 'Contrôler par ctrl_ia_frequence.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Un projet d’usage déjà formé atténuerait l’expression des réserves',
        rationale:
          'La réduction de dissonance (Festinger 1957) conduit à ajuster ses jugements à ses engagements plutôt que l’inverse.',
        confounders: [],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'L’usage actuel expliquerait les deux mesures',
        rationale:
          'La fréquence d’usage déjà installée prédit l’intention future et va de pair avec une moindre inquiétude, sans lien direct entre les deux mesures.',
        confounders: ['ctrl_ia_frequence', 'ctrl_ia_confort', 'profil_secteur'],
        testable: 'Ajouter ctrl_ia_frequence comme covariable.',
      },
    ],
  },
  {
    pair: ['psychologicalPerception', 'communityContext'],
    interpretations: [
      {
        mechanism: 'y_causes_x',
        label: 'Le cadrage collectif façonnerait la représentation de l’IA',
        rationale:
          'Les représentations d’objets techniques nouveaux se stabilisent dans la conversation ordinaire du groupe (Berger et Luckmann 1966). Une communauté qui en parle fournit des catégories toutes faites.',
        confounders: ['profil_statut', 'profil_education'],
        testable: 'Comparer selon communaute_discussions à profil_education constant.',
      },
      {
        mechanism: 'confounder',
        label: 'Le niveau d’études et l’âge porteraient les deux mesures',
        rationale:
          'La familiarité avec le vocabulaire technique conditionne à la fois les réponses sur la nature de l’IA et l’exposition à des discussions structurées.',
        confounders: ['profil_education', 'profil_age', 'ctrl_ia_confort'],
        testable: 'Ajouter profil_education et profil_age comme covariables.',
      },
      {
        mechanism: 'selection',
        label: 'L’intérêt préalable pour le sujet créerait l’association',
        rationale:
          'Répondre suppose souvent d’avoir déjà rencontré le sujet dans sa communauté et de s’être forgé une opinion sur la nature de l’IA. Conditionner sur la participation peut suffire à lier les deux (Cole et al. 2010).',
        confounders: [],
        testable: null,
      },
    ],
  },
  {
    pair: ['psychologicalPerception', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La représentation de l’IA orienterait l’intention d’usage',
        rationale:
          'Voir l’IA comme un outil neutre lève un obstacle que l’attribution d’une intériorité maintient. Le malaise décrit par Mori (1970) est un frein plausible à la projection d’usage.',
        confounders: ['ctrl_ia_confort', 'ctrl_ia_frequence'],
        testable: 'Contrôler par ctrl_ia_confort.',
      },
      {
        mechanism: 'confounder',
        label: 'La familiarité technique expliquerait les deux mesures',
        rationale:
          'La maîtrise déclarée réduit l’anthropomorphisme et augmente l’intention d’usage, ce qui suffirait à produire l’association.',
        confounders: ['ctrl_ia_confort', 'profil_secteur', 'profil_age'],
        testable: 'Stratifier par ctrl_ia_confort.',
      },
      {
        mechanism: 'selection',
        label: 'La composition de l’échantillon déformerait la relation',
        rationale:
          'Les personnes très réticentes sont sous-représentées, ce qui tronque la variance des deux mesures et rend l’estimation peu généralisable.',
        confounders: [],
        testable: null,
      },
    ],
  },
  {
    pair: ['communityContext', 'futureOrientation'],
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'Un contexte communautaire favorable soutiendrait l’intention d’usage',
        rationale:
          'La norme subjective et les conditions facilitatrices sont deux déterminants de l’intention dans UTAUT (Venkatesh et al. 2003). Une communauté qui encadre l’IA fournit les deux.',
        confounders: ['profil_statut', 'profil_taille_communaute'],
        testable: 'Comparer selon communaute_position_officielle à statut constant.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'Un projet d’usage personnel colorerait la lecture du climat communautaire',
        rationale:
          'La perception du groupe est déclarative et peut refléter une projection de ses propres intentions (effet de faux consensus, Ross, Greene et House 1977).',
        confounders: [],
        testable: 'Comparer les perceptions au sein d’une même communauté quand n le permet.',
      },
      {
        mechanism: 'confounder',
        label: 'Le statut et la taille de la communauté porteraient les deux mesures',
        rationale:
          'Les responsables de grandes communautés sont plus exposés au discours institutionnel et ont davantage d’occasions d’usage professionnel.',
        confounders: ['profil_statut', 'profil_taille_communaute', 'profil_milieu'],
        testable: 'Ajouter profil_statut et profil_taille_communaute comme covariables.',
      },
    ],
  },
];

// ==========================================
// Paires liées aux hypothèses H2 à H8
// (H1 est portée par la paire religiosity x sacredBoundary ci-dessus)
// ==========================================

INTERPRETATION_CATALOG.push(
  {
    pair: ['profil_confession_evangelique', 'aiOpenness'],
    hypothesis: 'H2',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La sensibilité charismatique irait de pair avec une ouverture accrue à l’IA',
        rationale:
          'Les milieux évangéliques et charismatiques ont historiquement adopté vite les médias de masse, la radio puis la télévision, quand ceux-ci servaient la diffusion du message. Campbell (2010) montre que ce filtrage se fait selon la compatibilité perçue avec la mission plus que selon la nouveauté technique.',
        confounders: ['profil_age', 'profil_education', 'profil_milieu', 'profil_statut'],
        testable:
          'Comparer les sous-groupes confessionnels à profil_age et profil_education constants.',
      },
      {
        mechanism: 'confounder',
        label: 'La composition démographique des sous-groupes expliquerait l’écart',
        rationale:
          'Les assemblées évangéliques françaises sont en moyenne plus jeunes et plus urbaines que les paroisses catholiques ou les Églises protestantes historiques. L’écart d’ouverture pourrait n’être qu’un écart d’âge et de milieu.',
        confounders: ['profil_age', 'profil_milieu', 'profil_education', 'profil_taille_communaute'],
        testable: 'Stratifier par profil_age puis par profil_milieu avant de comparer les confessions.',
      },
      {
        mechanism: 'selection',
        label: 'Le canal de recrutement produirait l’écart observé',
        rationale:
          'Une diffusion via un réseau évangélique partenaire attire un sous-échantillon particulier de ce courant, plus connecté et plus engagé que sa base. La variante d’entrée doit être traitée comme une variable, pas comme un détail logistique.',
        confounders: [],
        testable:
          'Comparer les répondants évangéliques de la variante générale et de la variante partenaire.',
      },
    ],
  },
  {
    pair: ['profil_age', 'aiOpenness'],
    hypothesis: 'H3',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'L’appartenance de cohorte orienterait l’ouverture à l’IA',
        rationale:
          'Inglehart (1997) traite le changement de valeurs comme un effet de cohorte plus que de cycle de vie. Appliqué ici, l’écart tiendrait à la période de socialisation technique et non à l’âge en lui même.',
        confounders: ['profil_education', 'profil_secteur', 'ctrl_ia_confort'],
        testable:
          'Contrôler par ctrl_ia_confort, qui capte la compétence indépendamment de la génération.',
      },
      {
        mechanism: 'confounder',
        label: 'Les compétences et le secteur d’activité porteraient l’effet d’âge',
        rationale:
          'Hargittai (2010) montre que les écarts d’usage attribués à l’âge tiennent largement à des différences de compétence et d’exposition professionnelle. L’âge servirait alors d’étiquette pour ces différences.',
        confounders: ['ctrl_ia_confort', 'profil_secteur', 'profil_education'],
        testable: 'Comparer les tranches d’âge à ctrl_ia_confort constant.',
      },
      {
        mechanism: 'selection',
        label: 'La sous-représentation des répondants âgés non usagers gonflerait l’écart',
        rationale:
          'Un questionnaire en ligne exclut de fait les personnes âgées les moins équipées. Les répondants âgés présents sont donc plus ouverts que leur cohorte, ce qui atténue plutôt qu’exagère la pente, tout en la rendant non généralisable.',
        confounders: [],
        testable: 'Comparer la distribution d’âge obtenue aux données de cadrage disponibles.',
      },
    ],
  },
  {
    pair: ['theo_orientation', 'sacredBoundary'],
    hypothesis: 'H4',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'Une orientation conservatrice conduirait à une frontière sacrée plus stricte',
        rationale:
          'Douglas (1966) analyse la pureté rituelle comme un travail de classification qui protège un ordre symbolique. Une position théologique attachée aux formes reçues mobiliserait plus volontiers ce travail de délimitation.',
        confounders: ['profil_age', 'profil_confession', 'profil_formation_theologique'],
        testable: 'Contrôler par profil_confession, les traditions ne se distribuant pas également.',
      },
      {
        mechanism: 'construct_overlap',
        label: 'L’auto-étiquetage et la frontière mesureraient la même chose',
        rationale:
          'Se déclarer conservateur revient déjà, en partie, à annoncer ce que l’on refuse de modifier dans le culte. La corrélation serait alors une redondance de mesure plutôt qu’un résultat.',
        confounders: [],
        testable:
          'Comparer la corrélation à celle obtenue avec des items comportementaux plutôt que déclaratifs.',
      },
      {
        mechanism: 'confounder',
        label: 'L’appartenance confessionnelle porterait les deux mesures',
        rationale:
          'Le sens du mot conservateur diffère fortement entre une paroisse catholique, une Église réformée et une assemblée évangélique, tout comme la théologie sacramentelle sous-jacente.',
        confounders: ['profil_confession', 'profil_confession_catholique', 'profil_confession_protestante'],
        testable: 'Estimer la relation séparément dans chaque grande famille confessionnelle.',
      },
    ],
  },
  {
    pair: ['profil_statut', 'sacredBoundaryCore'],
    hypothesis: 'H5',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La responsabilité ministérielle conduirait à une frontière de noyau plus stricte',
        rationale:
          'Gieryn (1983) décrit le travail de démarcation par lequel un groupe professionnel protège la juridiction de son activité. Un ministre ordonné a un intérêt de rôle à maintenir humaine la prédication et l’accompagnement.',
        confounders: ['profil_age', 'profil_annees_ministere', 'profil_formation_theologique'],
        testable:
          'Comparer clergé et laïcs à profil_age constant, le clergé étant en moyenne plus âgé.',
      },
      {
        mechanism: 'confounder',
        label: 'L’âge et la formation expliqueraient l’écart de statut',
        rationale:
          'Le clergé cumule un âge moyen plus élevé et une formation théologique formelle, deux variables associées séparément à la frontière sacrée.',
        confounders: ['profil_age', 'profil_formation_theologique', 'profil_education'],
        testable: 'Ajouter profil_age et profil_formation_theologique comme covariables.',
      },
      {
        mechanism: 'selection',
        label: 'Le clergé répondant ne représenterait pas le clergé',
        rationale:
          'Les ministres qui prennent le temps de répondre à une enquête sur l’IA sont plus susceptibles d’avoir déjà une position formée sur le sujet, dans un sens ou dans l’autre.',
        confounders: [],
        testable:
          'Comparer la distribution des années de ministère obtenue aux effectifs connus des dénominations participantes.',
      },
    ],
  },
  {
    pair: ['communaute_position_officielle', 'aiOpenness'],
    hypothesis: 'H6',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La position institutionnelle orienterait l’ouverture individuelle',
        rationale:
          'Une prise de position officielle abaisse le coût social de l’adoption et fournit une justification disponible. C’est le mécanisme de norme injonctive décrit par Cialdini, Reno et Kallgren (1990).',
        confounders: ['profil_confession', 'profil_statut', 'profil_taille_communaute'],
        testable:
          'Comparer les répondants d’une même confession selon la position officielle rapportée.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'L’ouverture personnelle augmenterait la probabilité de connaître cette position',
        rationale:
          'La variable mesure une position rapportée, donc une connaissance. Les personnes intéressées par l’IA sont plus susceptibles d’avoir cherché et retenu ce que leur Église en dit.',
        confounders: [],
        testable:
          'Comparer la part de réponses ne sait pas selon le niveau d’ouverture déclaré.',
      },
      {
        mechanism: 'confounder',
        label: 'Le type d’institution porterait les deux mesures',
        rationale:
          'Les institutions capables de produire une position formelle sont aussi celles qui disposent de moyens numériques, sans lien individuel entre les deux.',
        confounders: ['profil_confession', 'profil_taille_communaute', 'profil_milieu'],
        testable: 'Stratifier par profil_confession et par profil_taille_communaute.',
      },
      {
        mechanism: 'selection',
        label: 'Le recrutement par les institutions elles mêmes créerait l’association',
        rationale:
          'Quand une Église relaie l’enquête, elle sélectionne des répondants alignés sur son orientation et informés de ses positions. La participation devient une variable de collision entre les deux mesures.',
        confounders: [],
        testable: 'Comparer les variantes d’entrée du questionnaire.',
      },
    ],
  },
  {
    pair: ['profil_formation_theologique', 'ethicalConcern'],
    hypothesis: 'H7',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'La formation théologique modulerait l’expression de la préoccupation éthique',
        rationale:
          'Une formation fournit des catégories et des précédents qui permettent de qualifier un problème plutôt que de le rejeter en bloc. L’effet attendu porte donc autant sur la dispersion des réponses que sur leur moyenne.',
        confounders: ['profil_education', 'profil_statut', 'profil_age'],
        testable:
          'Comparer les variances par test de Levene, et pas seulement les moyennes, entre niveaux de formation.',
      },
      {
        mechanism: 'confounder',
        label: 'Le niveau d’études général expliquerait l’écart',
        rationale:
          'La formation théologique est fortement liée au niveau d’études et au secteur d’activité, tous deux associés à l’aisance avec un raisonnement éthique abstrait.',
        confounders: ['profil_education', 'profil_secteur', 'profil_statut'],
        testable: 'Contrôler par profil_education avant d’interpréter l’effet de la formation.',
      },
      {
        mechanism: 'method_artifact',
        label: 'La formation modifierait la compréhension des items plutôt que la position',
        rationale:
          'Un vocabulaire technique commun peut faire lire différemment les mêmes énoncés, ce qui relève d’un défaut d’invariance de mesure et non d’une différence d’attitude.',
        confounders: [],
        testable:
          'Tester l’invariance de mesure de la dimension entre groupes de formation quand n le permet.',
      },
    ],
  },
  {
    pair: ['ctrl_ia_frequence', 'ethicalConcern'],
    hypothesis: 'H8',
    interpretations: [
      {
        mechanism: 'x_causes_y',
        label: 'L’usage quotidien atténuerait la préoccupation éthique déclarée',
        rationale:
          'La familiarité réduit l’incertitude perçue, et la réduction de dissonance (Festinger 1957) pousse à aligner ses jugements sur ses pratiques établies.',
        confounders: ['profil_age', 'profil_secteur', 'profil_education'],
        testable: 'Contrôler par profil_secteur, l’usage professionnel étant contraint par l’emploi.',
      },
      {
        mechanism: 'y_causes_x',
        label: 'La préoccupation éthique limiterait en amont la fréquence d’usage',
        rationale:
          'Le non usage délibéré est une réponse documentée à une défiance préalable (Parasuraman et Riley 1997). Rien dans une passation unique ne départage ce sens de lecture du précédent.',
        confounders: [],
        testable: null,
      },
      {
        mechanism: 'confounder',
        label: 'Le secteur d’activité et l’âge porteraient les deux mesures',
        rationale:
          'Travailler dans un secteur où l’IA est déjà déployée impose l’usage et expose simultanément aux discours de gestion du risque, ce qui peut jouer dans les deux sens.',
        confounders: ['profil_secteur', 'profil_age', 'profil_education', 'ctrl_ia_confort'],
        testable: 'Stratifier par profil_secteur.',
      },
    ],
  },
);

// ==========================================
// Accès
// ==========================================

/** Clé canonique d’une paire non ordonnée. */
export function pairKey(a: string, b: string): string {
  return a <= b ? `${a}|${b}` : `${b}|${a}`;
}

const CATALOG_INDEX: ReadonlyMap<string, CatalogEntry> = new Map(
  INTERPRETATION_CATALOG.map((entry) => [pairKey(entry.pair[0], entry.pair[1]), entry]),
);

/** Retrouve l’entrée du catalogue quel que soit l’ordre des variables. */
export function findCatalogEntry(a: string, b: string): CatalogEntry | undefined {
  return CATALOG_INDEX.get(pairKey(a, b));
}

/** Toutes les clés de paires couvertes, utile pour les tests d’intégrité. */
export function catalogPairKeys(): string[] {
  return INTERPRETATION_CATALOG.map((entry) => pairKey(entry.pair[0], entry.pair[1]));
}
