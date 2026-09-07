/**
 * Deterministic persona generator for the profile simulation.
 *
 * Each persona is described by a target level (1-5) per dimension. Every item
 * of that dimension is drawn around the target with gaussian noise, then
 * mapped onto the item's ordered option list. The RNG is seeded, so a failing
 * run is reproducible.
 */

import type { Answers } from '@/data';
import type { DimensionKey, PrimaryProfile } from '../types';

// ==========================================
// SEEDED RNG
// ==========================================

export function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rng: () => number): number {
  const u = Math.max(rng(), Number.EPSILON);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

// ==========================================
// ORDERED OPTION LISTS (ascending dimension score)
// ==========================================

const ORDERED_OPTIONS: Record<string, string[]> = {
  crs_intellect: ['jamais', 'rarement', 'occasionnellement', 'souvent', 'tres_souvent'],
  crs_ideology: ['pas_du_tout', 'peu', 'moderement', 'beaucoup', 'totalement'],
  crs_public_practice: ['jamais', 'quelques_fois_an', 'mensuel', 'hebdo', 'pluri_hebdo'],
  crs_private_practice: ['jamais', 'rarement', 'mensuel', 'hebdomadaire', 'quotidien'],
  crs_experience: ['jamais', 'rarement', 'occasionnellement', 'souvent', 'tres_souvent'],

  ctrl_ia_frequence: ['jamais', 'essaye', 'occasionnel', 'regulier', 'quotidien'],
  digital_attitude_generale: ['tres_negatif', 'negatif', 'neutre', 'positif', 'tres_positif'],

  theo_inspiration: ['possible', 'possible_indirect', 'peu_probable', 'impossible'],
  theo_mediation_humaine: [
    'non_pas_necessairement',
    'partiellement',
    'oui_pour_essentiel',
    'oui_absolument',
  ],

  theo_utilite_percue: ['tres_positif', 'positif', 'neutre', 'negatif', 'tres_negatif'],
  psych_aias_opacity: ['non_confiance', 'non_indifferent', 'peu', 'oui_moderement', 'oui_fortement'],
  psych_imago_dei: ['pas_du_tout', 'peu', 'moderement', 'beaucoup', 'totalement'],

  psych_godspeed_nature: ['1_machine', '2_machine_plus', '3_neutre', '4_humain_moins', '5_humain'],
  psych_godspeed_conscience: ['impossible', 'imitation', 'incertain', 'possible_emergence', 'probable'],
  psych_anxiete_remplacement: [
    'non_impossible',
    'non_peu_probable',
    'possible_partiel',
    'oui_probable',
    'oui_certain',
  ],

  communaute_position_officielle: ['oui_defavorable', 'oui_prudent', 'oui_favorable'],
  communaute_perception_pairs: ['hostile', 'mefiant', 'neutre', 'favorable', 'tres_favorable'],
  communaute_discussions: ['jamais', 'rarement', 'parfois', 'souvent', 'organise'],

  futur_intention_usage: ['non_certain', 'non_probable', 'peut_etre', 'oui_probable', 'oui_certain'],
  futur_formation_souhait: [
    'non_pas_du_tout',
    'non_pas_vraiment',
    'peut_etre',
    'oui_assez',
    'oui_tres',
  ],
};

const CONTEXT_OPTIONS = ['travail_pro', 'recherche_info', 'creation', 'programmation', 'loisirs'];
const SACRED_ACTIVITY_OPTIONS = [
  'sacrements',
  'predication',
  'priere_personnelle',
  'accompagnement',
  'discernement',
];
const FUTURE_DOMAIN_OPTIONS = [
  'etude_bible',
  'preparation_predication',
  'catechese',
  'priere_meditation',
  'accompagnement',
  'communication',
  'administration',
  'musique_liturgie',
];

function pickOrdered(itemId: string, level: number): string {
  const options = ORDERED_OPTIONS[itemId];
  const index = Math.round(((level - 1) / 4) * (options.length - 1));
  return options[clamp(index, 0, options.length - 1)];
}

function takeFirst(options: string[], count: number): string[] {
  return options.slice(0, clamp(count, 0, options.length));
}

// ==========================================
// PERSONAS
// ==========================================

export interface Persona {
  name: string;
  targetProfile: PrimaryProfile;
  levels: Record<DimensionKey, number>;
  /** Weighted draw over theo_orientation values */
  orientation: Array<[string, number]>;
  statut: string;
}

export const PERSONAS: Persona[] = [
  {
    name: 'traditionaliste',
    targetProfile: 'gardien_tradition',
    levels: {
      religiosity: 4.6,
      aiOpenness: 1.3,
      sacredBoundary: 4.6,
      ethicalConcern: 4.2,
      psychologicalPerception: 2.0,
      communityContext: 2.5,
      futureOrientation: 1.4,
    },
    orientation: [
      ['traditionaliste', 0.8],
      ['modere', 0.2],
    ],
    statut: 'laic_pratiquant',
  },
  {
    name: 'innovateur',
    targetProfile: 'pionnier_spirituel',
    levels: {
      religiosity: 3.4,
      aiOpenness: 4.7,
      sacredBoundary: 1.4,
      ethicalConcern: 2.0,
      psychologicalPerception: 3.5,
      communityContext: 2.5,
      futureOrientation: 4.7,
    },
    orientation: [
      ['progressiste', 0.7],
      ['modere', 0.3],
    ],
    statut: 'laic_engagé',
  },
  {
    name: 'prudent',
    targetProfile: 'prudent_eclaire',
    levels: {
      religiosity: 4.2,
      aiOpenness: 3.0,
      sacredBoundary: 4.1,
      ethicalConcern: 3.8,
      psychologicalPerception: 2.5,
      communityContext: 3.0,
      futureOrientation: 3.0,
    },
    orientation: [
      ['traditionaliste', 0.5],
      ['modere', 0.5],
    ],
    statut: 'laic_pratiquant',
  },
  {
    name: 'equilibre',
    targetProfile: 'equilibriste',
    levels: {
      religiosity: 3.2,
      aiOpenness: 3.0,
      sacredBoundary: 3.0,
      ethicalConcern: 3.0,
      psychologicalPerception: 3.0,
      communityContext: 3.0,
      futureOrientation: 3.0,
    },
    orientation: [
      ['modere', 0.8],
      ['traditionaliste', 0.1],
      ['progressiste', 0.1],
    ],
    statut: 'laic_pratiquant',
  },
];

// ==========================================
// GENERATION
// ==========================================

const NOISE_SD = 0.7;

function drawLevel(rng: () => number, target: number): number {
  return clamp(Math.round(target + gaussian(rng) * NOISE_SD), 1, 5);
}

function drawWeighted(rng: () => number, choices: Array<[string, number]>): string {
  const total = choices.reduce((sum, [, weight]) => sum + weight, 0);
  let threshold = rng() * total;
  for (const [value, weight] of choices) {
    threshold -= weight;
    if (threshold <= 0) return value;
  }
  return choices[choices.length - 1][0];
}

export function generateRespondent(persona: Persona, rng: () => number): Answers {
  const level = (key: DimensionKey): number => drawLevel(rng, persona.levels[key]);

  const aiLevel = level('aiOpenness');
  const boundaryLevel = level('sacredBoundary');
  const futureLevel = level('futureOrientation');

  const frequence = pickOrdered('ctrl_ia_frequence', aiLevel);

  const answers: Answers = {
    profil_statut: persona.statut,
    profil_confession: 'catholique',
    profil_age: '36-50',
    theo_orientation: drawWeighted(rng, persona.orientation),

    // religiosity
    crs_intellect: pickOrdered('crs_intellect', level('religiosity')),
    crs_ideology: pickOrdered('crs_ideology', level('religiosity')),
    crs_public_practice: pickOrdered('crs_public_practice', level('religiosity')),
    crs_private_practice: pickOrdered('crs_private_practice', level('religiosity')),
    crs_experience: pickOrdered('crs_experience', level('religiosity')),

    // aiOpenness
    ctrl_ia_frequence: frequence,
    ctrl_ia_confort: drawLevel(rng, persona.levels.aiOpenness),
    digital_attitude_generale: pickOrdered('digital_attitude_generale', level('aiOpenness')),

    // sacredBoundary
    theo_inspiration: pickOrdered('theo_inspiration', boundaryLevel),
    theo_liturgie_ia: 6 - drawLevel(rng, persona.levels.sacredBoundary),
    theo_mediation_humaine: pickOrdered('theo_mediation_humaine', level('sacredBoundary')),

    // ethicalConcern
    theo_utilite_percue: pickOrdered('theo_utilite_percue', level('ethicalConcern')),
    psych_aias_opacity: pickOrdered('psych_aias_opacity', level('ethicalConcern')),
    psych_imago_dei: pickOrdered('psych_imago_dei', level('ethicalConcern')),

    // psychologicalPerception
    psych_godspeed_nature: pickOrdered('psych_godspeed_nature', level('psychologicalPerception')),
    psych_godspeed_conscience: pickOrdered(
      'psych_godspeed_conscience',
      level('psychologicalPerception'),
    ),
    psych_anxiete_remplacement: pickOrdered(
      'psych_anxiete_remplacement',
      level('psychologicalPerception'),
    ),

    // communityContext
    communaute_position_officielle: pickOrdered(
      'communaute_position_officielle',
      level('communityContext'),
    ),
    communaute_perception_pairs: pickOrdered(
      'communaute_perception_pairs',
      level('communityContext'),
    ),
    communaute_discussions: pickOrdered('communaute_discussions', level('communityContext')),

    // futureOrientation
    futur_intention_usage: pickOrdered('futur_intention_usage', level('futureOrientation')),
    futur_formation_souhait: pickOrdered('futur_formation_souhait', level('futureOrientation')),
  };

  if (frequence !== 'jamais') {
    answers.ctrl_ia_contextes = takeFirst(CONTEXT_OPTIONS, Math.round((aiLevel - 1) * 1.25));
  }

  answers.theo_activites_sacrees =
    boundaryLevel <= 1
      ? ['aucune']
      : takeFirst(SACRED_ACTIVITY_OPTIONS, Math.round((boundaryLevel - 1) * 1.25));

  answers.futur_domaines_interet =
    futureLevel <= 1
      ? ['aucun_domaines']
      : takeFirst(FUTURE_DOMAIN_OPTIONS, Math.round((futureLevel - 1) * 1.6));

  return answers;
}

export function generateCohort(persona: Persona, size: number, seed: number): Answers[] {
  const rng = makeRng(seed);
  return Array.from({ length: size }, () => generateRespondent(persona, rng));
}
