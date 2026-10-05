export const mean = (xs: number[]): number =>
  xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;

export function sd(xs: number[]): number {
  if (xs.length < 2) return NaN;
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
}

export const zScore = (x: number, mu: number, sigma: number): number => (x - mu) / sigma;

/** Inverse standard normal CDF (Acklam's approximation, |error| < 1.2e-9). */
export function normInv(p: number): number {
  if (p <= 0 || p >= 1) throw new RangeError("p must be in (0,1)");
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - lo) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  const q = p - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** Signal-detection d' with the log-linear correction (Hautus 1995) so rates of 0 or 1 are safe. */
export function dPrime(hits: number, nSignal: number, falseAlarms: number, nNoise: number): number {
  const hr = (hits + 0.5) / (nSignal + 1);
  const far = (falseAlarms + 0.5) / (nNoise + 1);
  return normInv(hr) - normInv(far);
}

/** Ex-Gaussian parameters by method of moments (skew-based tau). */
export function exGaussian(xs: number[]): { mu: number; sigma: number; tau: number } {
  const m = mean(xs);
  const v = xs.reduce((a, x) => a + (x - m) ** 2, 0) / xs.length;
  const m3 = xs.reduce((a, x) => a + (x - m) ** 3, 0) / xs.length;
  const tau = m3 > 0 ? Math.cbrt(m3 / 2) : 0;
  const sigma2 = v - tau * tau;
  return { mu: m - tau, sigma: sigma2 > 0 ? Math.sqrt(sigma2) : 0, tau };
}

/**
 * Stop-signal reaction time, integration method (Verbruggen et al. 2019).
 * Go omissions are replaced by the maximum RT before taking the nth RT.
 */
export function ssrtIntegration(goRts: (number | null)[], maxRt: number, ssds: number[], pRespondGivenStop: number): number {
  const rts = goRts.map((r) => (r === null ? maxRt : r)).sort((x, y) => x - y);
  const idx = Math.min(rts.length - 1, Math.max(0, Math.ceil(pRespondGivenStop * rts.length) - 1));
  return rts[idx] - mean(ssds);
}
