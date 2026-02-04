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

/**
 * Check if respondent is clergy (ordained minister or religious)
 */
export function isClergy(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return ['clerge', 'religieux'].includes(statut);
}

/**
 * Check if respondent is a layperson
 */
export function isLayperson(answers: Answers): boolean {
  const statut = getStringAnswer(answers, 'profil_statut');
  return ['laic_engagé', 'laic_pratiquant', 'curieux'].includes(statut);
}

/**
 * Check if clergy uses AI for preaching
 */
export function clergyUsesAI(answers: Answers): boolean {
  const usage = getStringAnswer(answers, 'min_pred_usage');
  return isClergy(answers) && usage !== '' && usage !== 'jamais';
}
