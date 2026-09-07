/**
 * Statistiques élémentaires pour le module d'analyse.
 * Fonctions pures, sans dépendance externe.
 */

export interface PearsonResult {
  r: number;
  /** Nombre de paires effectivement utilisées. */
  n: number;
}

/** Valeur observée pouvant être manquante. */
export type Observation = number | null | undefined;

function pairs(x: readonly Observation[], y: readonly Observation[]): Array<[number, number]> {
  const length = Math.min(x.length, y.length);
  const out: Array<[number, number]> = [];
  for (let i = 0; i < length; i += 1) {
    const a = x[i];
    const b = y[i];
    if (typeof a === 'number' && Number.isFinite(a) && typeof b === 'number' && Number.isFinite(b)) {
      out.push([a, b]);
    }
  }
  return out;
}

/** Écart type d'échantillon (dénominateur n − 1). */
export function sampleSd(values: readonly Observation[]): number | null {
  const clean = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (clean.length < 2) return null;
  const mean = clean.reduce((s, v) => s + v, 0) / clean.length;
  const ss = clean.reduce((s, v) => s + (v - mean) ** 2, 0);
  return Math.sqrt(ss / (clean.length - 1));
}

/**
 * Corrélation de Pearson sur les paires complètes (suppression par paire).
 * Retourne null si moins de 3 paires ou si une des variables est constante.
 */
export function pearson(x: readonly Observation[], y: readonly Observation[]): PearsonResult | null {
  const p = pairs(x, y);
  const n = p.length;
  if (n < 3) return null;
  const mx = p.reduce((s, [a]) => s + a, 0) / n;
  const my = p.reduce((s, [, b]) => s + b, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [a, b] of p) {
    const da = a - mx;
    const db = b - my;
    sxy += da * db;
    sxx += da * da;
    syy += db * db;
  }
  if (sxx <= 0 || syy <= 0) return null;
  const r = sxy / Math.sqrt(sxx * syy);
  return { r: Math.max(-1, Math.min(1, r)), n };
}

/**
 * Quantile de la loi normale centrée réduite.
 * Approximation rationnelle d'Acklam, erreur absolue inférieure à 1,15e-9.
 */
export function normalQuantile(p: number): number {
  if (p <= 0 || p >= 1 || !Number.isFinite(p)) return Number.NaN;
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const pLow = 0.02425;
  const pHigh = 1 - pLow;
  if (p < pLow) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > pHigh) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/**
 * Intervalle de confiance d'un r de Pearson par transformation z de Fisher.
 * Retourne null si n <= 3 (l'erreur type n'est pas définie).
 */
export function fisherCI(r: number, n: number, level = 0.95): [number, number] | null {
  if (!Number.isFinite(r) || Math.abs(r) >= 1 || n <= 3) return null;
  if (!(level > 0 && level < 1)) return null;
  const z = Math.atanh(r);
  const se = 1 / Math.sqrt(n - 3);
  const crit = normalQuantile(1 - (1 - level) / 2);
  return [Math.tanh(z - crit * se), Math.tanh(z + crit * se)];
}

/** Logarithme de la fonction gamma, approximation de Lanczos (g = 7, n = 9). */
function logGamma(x: number): number {
  const g = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const z = x - 1;
  let sum = g[0];
  for (let i = 1; i < 9; i += 1) sum += g[i] / (z + i);
  const t = z + 7.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(sum);
}

/** Fraction continue de la fonction bêta incomplète (algorithme de Lentz modifié). */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const tiny = 1e-30;
  const eps = 3e-16;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 300; m += 1) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c;
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < eps) break;
  }
  return h;
}

/**
 * Fonction bêta incomplète régularisée I_x(a, b).
 * Précision de l'ordre de 1e-14 sur le domaine utile ici.
 */
export function incompleteBeta(a: number, b: number, x: number): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(x)) return Number.NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x),
  );
  return x < (a + 1) / (a + b + 2)
    ? (front * betaContinuedFraction(a, b, x)) / a
    : 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/**
 * Valeur p bilatérale d'un r de Pearson via la statistique t = r·sqrt((n−2)/(1−r²))
 * suivie d'une loi de Student à n − 2 degrés de liberté.
 * Le calcul est exact au sens de la loi t, la seule approximation étant celle de
 * la bêta incomplète (fraction continue, environ 1e-14).
 */
export function pValueFromR(r: number, n: number): number {
  if (!Number.isFinite(r) || n < 3) return Number.NaN;
  if (Math.abs(r) >= 1) return 0;
  const df = n - 2;
  const t2 = (r * r * df) / (1 - r * r);
  const p = incompleteBeta(df / 2, 0.5, df / (df + t2));
  return Math.max(0, Math.min(1, p));
}

/**
 * Correction de Benjamini-Hochberg (FDR). Retourne les p ajustés dans l'ordre
 * d'entrée, avec la monotonie imposée par le minimum cumulé décroissant.
 */
export function benjaminiHochberg(pValues: readonly number[]): number[] {
  const m = pValues.length;
  if (m === 0) return [];
  const order = pValues
    .map((p, index) => ({ p, index }))
    .sort((a, b) => a.p - b.p);
  const adjusted = new Array<number>(m);
  let running = 1;
  for (let k = m; k >= 1; k -= 1) {
    const { p, index } = order[k - 1];
    const scaled = (p * m) / k;
    running = Math.min(running, scaled);
    adjusted[index] = Math.max(0, Math.min(1, running));
  }
  return adjusted;
}
