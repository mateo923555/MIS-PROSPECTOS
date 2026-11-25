import { keys } from "../../shared/motion";
/**
 * Cámara del Short 001 (pura, la usa la composición y `scripts/check-geometry.ts`).
 * Acercamientos: sorpresa inicial, sorpresa al acercarse (suave) y descubrimiento «¡Entró justo!».
 * Durante la EXPLICACIÓN (se acerca / se aleja) el zoom es mínimo para ver linterna + bebé + pared.
 */
export type Anchors = { question?: number; acerco: number; crece: number; alejo: number; s4End: number; fit: number };
export const cameraAt = (t: number, T: Anchors) => {
  const scale = keys(t, [
    [0, 1], [0.35, 1], [0.95, 1.6], [1.9, 1.6], [2.7, 1], // sorpresa: primer plano del bebé y la sombra
    [(T.question ?? 3.25) - 0.1, 1], [(T.question ?? 3.25) + 0.5, 1.5], [(T.question ?? 3.25) + 1.5, 1.5], [T.acerco - 0.5, 1], // curiosidad: primer plano del bebé pensando
    [T.crece - 0.15, 1], [T.crece + 0.2, 1.18], [T.alejo - 0.35, 1.18], [T.alejo, 1], // «crece más»: apenas
    [T.fit - 0.1, 1], [T.fit + 0.3, 1.5], [T.fit + 1.2, 1.5], [T.fit + 1.9, 1], // descubrimiento: entró justo
  ]);
  const cy = keys(t, [
    [0, 960], [0.35, 960], [0.95, 800], [1.9, 800], [2.7, 960],
    [(T.question ?? 3.25) - 0.1, 960], [(T.question ?? 3.25) + 0.5, 820], [(T.question ?? 3.25) + 1.5, 820], [T.acerco - 0.5, 960],
    [T.crece - 0.15, 960], [T.crece + 0.2, 830], [T.alejo - 0.35, 830], [T.alejo, 960],
    [T.fit - 0.1, 960], [T.fit + 0.3, 650], [T.fit + 1.2, 650], [T.fit + 1.9, 960],
  ]);
  const cx = keys(t, [[0, 540], [0.35, 540], [0.95, 410], [1.9, 410], [2.7, 540], [(T.question ?? 3.25) - 0.1, 540], [(T.question ?? 3.25) + 0.5, 430], [(T.question ?? 3.25) + 1.5, 430], [T.acerco - 0.5, 540], [T.fit - 0.1, 540]]);
  return { scale, cx, cy };
};
/** Punto del mundo → pantalla con esa cámara. */
export const toScreen = (x: number, y: number, c: { scale: number; cx: number; cy: number }) => ({
  x: 540 + (x - c.cx) * c.scale, y: 960 + (y - c.cy) * c.scale,
});
