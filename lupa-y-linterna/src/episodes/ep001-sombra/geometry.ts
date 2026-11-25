/**
 * Geometría de la demostración del Short 001 (sin React: la usan la composición y `scripts/check-geometry.ts`).
 * Fuente puntual (linterna) → bebé → pared. Distancia linterna–pared FIJA = D (en "bebés").
 * Con el bebé a distancia d de la luz, la sombra se escala s = D/d respecto de la altura de la linterna.
 */
export const W = 1080;
export const D = 4.8; // linterna–pared, fija durante TODA la demostración
export const LAMP_H = 0.1; // linterna casi a ras del piso → la sombra "se para" sobre la línea pared–piso
export const PW = 300; // px de pared por "bebé"
export const WALL_Y = 768; // línea pared–piso en pantalla
export const CX = W / 2;

/** Hueco del marco en la pared (px). La sombra tiene que entrar justo ahí. */
export const FRAME = { x0: 340, x1: 740, y0: 240, y1: WALL_Y };
export const D_START = 1.8; // sombra desbordando el marco
export const D_NEAR = 1.35; // lo más cerca de la linterna
export const D_FIT = 2.7; // la sombra entra justo

export const shadowBox = (d: number, ar: number, cx = CX) => {
  const s = D / d;
  const h = s * PW;
  const bottom = WALL_Y + LAMP_H * (s - 1) * PW;
  const w = ar * h;
  return { s, h, w, bottom, top: bottom - h, left: cx - w / 2, right: cx + w / 2 };
};

export const fits = (d: number, ar: number) => {
  const b = shadowBox(d, ar);
  return { box: b, ok: b.left >= FRAME.x0 && b.right <= FRAME.x1 && b.top >= FRAME.y0, margins: { left: b.left - FRAME.x0, right: FRAME.x1 - b.right, top: b.top - FRAME.y0 } };
};
