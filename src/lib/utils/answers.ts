/**
 * Answer Helper Utilities
 * Shared functions for safely extracting typed values from survey answers
 */

import type { Answers } from '@/data';

/**
 * Safely extract a string value from answers
 */
export function getStringAnswer(answers: Answers, key: string): string {
  const value = answers[key];
  return typeof value === 'string' ? value : '';
}

/**
 * Safely extract a number value from answers
 */
export function getNumberAnswer(answers: Answers, key: string): number | null {
  const value = answers[key];
  return typeof value === 'number' ? value : null;
}

/**
 * Safely extract an array value from answers
 */
export function getArrayAnswer(answers: Answers, key: string): string[] {
  const value = answers[key];
  return Array.isArray(value) ? value : [];
}

/** Statuses routed through the ministry block */
export const CLERGY_STATUSES: readonly string[] = [
  'clerge',
  'religieux',
  'responsable_non_ordonne',
];

/** Statuses routed through the lay block */
export const LAY_STATUSES: readonly string[] = [
  'laic_engagé',
  'laic_pratiquant',
  'curieux',
];

/**
 * Check if respondent is clergy (ordained minister, religious, or a
 * non-ordained leader/preacher, who faces the same ministry questions)
 */
export function isClergy(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return CLERGY_STATUSES.includes(statut);
}

/**
 * Check if respondent is a layperson
 */
export function isLayperson(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return LAY_STATUSES.includes(statut);
}

/**
 * Check if clergy uses AI for preaching
 */
export function clergyUsesAI(answers: Answers): boolean {
  const usage = getStringAnswer(answers, 'min_pred_usage');
  return isClergy(answers) && usage !== '' && usage !== 'jamais';
}
