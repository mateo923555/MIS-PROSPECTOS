import { Easing, interpolate } from "remotion";

/** Pasa el tiempo a "pasos" de stop motion: p. ej. 10 fps (a 3 cuadros por pose). */
export const stepTime = (frame: number, fps: number, rate = 10) => Math.floor((frame / fps) * rate) / rate;

/** Ruido determinista ∈ [-1,1] para una semilla y un índice de paso. */
export const hash = (seed: number, n: number) => {
  const x = Math.sin(seed * 127.1 + n * 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Interpola por tramos [tiempo, valor] con easing suave. */
export const keys = (t: number, pts: Array<[number, number]>, ease = Easing.inOut(Easing.cubic)) => {
  if (t <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i][0]) {
      return interpolate(t, [pts[i - 1][0], pts[i][0]], [pts[i - 1][1], pts[i][1]], { easing: ease });
    }
  }
  return pts[pts.length - 1][1];
};

/** Rebote de pop-in (0→1 con ligero sobreimpulso). */
export const pop = (t: number, start: number, dur = 0.35) => {
  const p = clamp01((t - start) / dur);
  return Easing.out(Easing.back(2.2))(p);
};

/** Saltitos de stop motion: `n` saltos de `dur` s y altura `h` px desde `t0` (parábola; 0 fuera del salto). */
export const hops = (t: number, t0: number, n: number, dur: number, h: number) => {
  const u = (t - t0) / dur;
  if (u < 0 || u >= n) return 0;
  const f = u - Math.floor(u);
  return 4 * f * (1 - f) * h;
};
