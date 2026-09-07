/**
 * Formatage typographique français des nombres statistiques.
 * Séparateur décimal virgule, espace fine insécable avant ? ! ; %,
 * espace insécable avant les deux-points.
 */

/** U+202F espace fine insécable. */
export const NNBSP = ' ';
/** U+00A0 espace insécable. */
export const NBSP = ' ';

/** Formate un nombre avec la virgule décimale et un nombre fixe de décimales. */
export function frNumber(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return 'n.d.';
  return value.toFixed(digits).replace('.', ',');
}

/**
 * Formate une valeur p. Sous 0,001 on affiche un seuil plutôt qu'un nombre :
 * la précision de l'approximation n'est pas interprétable au delà.
 */
export function frPValue(p: number): string {
  if (!Number.isFinite(p)) return 'n.d.';
  if (p < 0.001) return `<${NNBSP}0,001`;
  const fixed = p.toFixed(3).replace('.', ',');
  return fixed.endsWith('0') ? fixed.slice(0, -1) : fixed;
}

/** Formate un pourcentage entier avec espace fine insécable avant le signe. */
export function frPercent(value: number, digits = 0): string {
  return `${frNumber(value, digits)}${NNBSP}%`;
}

/** Intervalle de confiance au format [0,12 ; 0,50]. */
export function frInterval(bounds: readonly [number, number], digits = 2): string {
  return `[${frNumber(bounds[0], digits)}${NNBSP}; ${frNumber(bounds[1], digits)}]`;
}
