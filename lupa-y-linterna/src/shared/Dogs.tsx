import React from "react";
import { Img, staticFile } from "remotion";

/**
 * Teresa (bulldog inglés blanca) y Timoteo (bulldog francés marroncito): vistas recortadas de sus fichas
 * (scripts/cut-sheet.py). Las vistas están ESPEJADAS respecto de las fichas: Teresa mira a la IZQUIERDA (mancha oscura en la oreja
 * derecha de cámara, como en las fotos) y Timoteo mira a la DERECHA, así que se miran de frente sin voltear sprites.
 * `px` = tamaño del sprite en la ficha; `k` = escala en pantalla (px de ficha → px de pantalla).
 */
export const DOG_VIEWS = {
  t_front: { file: "art/dogs/t_0.png", w: 302, h: 459 },
  t_tq: { file: "art/dogs/t_1.png", w: 320, h: 460 }, // 3/4 sentada, mira a la izquierda
  t_side: { file: "art/dogs/t_2.png", w: 457, h: 402 }, // de perfil, parada, mira a la izquierda
  t_face: { file: "art/dogs/t_3.png", w: 376, h: 299 }, // primer plano de la cara
  m_front: { file: "art/dogs/m_0.png", w: 297, h: 562 },
  m_tq: { file: "art/dogs/m_1.png", w: 286, h: 545 }, // 3/4 sentado, mira a la derecha
  m_face: { file: "art/dogs/m_3.png", w: 447, h: 686 }, // primer plano con la cabeza inclinada
} as const;
export type DogView = keyof typeof DOG_VIEWS;
/** Escala base: Teresa es más corpulenta; Timoteo, más chico pero con orejas altas. */
export const K = { t: 0.9, m: 0.78 };

type Props = {
  view: DogView; x: number; y: number; k: number; rot?: number; sx?: number; sy?: number;
  silhouette?: boolean; blur?: number; opacity?: number; style?: React.CSSProperties;
};
export const dogSize = (view: DogView, k: number) => ({ w: DOG_VIEWS[view].w * k, h: DOG_VIEWS[view].h * k });

export const Dog: React.FC<Props> = ({ view, x, y, k, rot = 0, sx = 1, sy = 1, silhouette, blur = 0, opacity = 1, style }) => {
  const v = DOG_VIEWS[view];
  const w = v.w * k, h = v.h * k;
  const filters = [silhouette ? "brightness(0)" : "", blur ? `blur(${blur}px)` : ""].filter(Boolean).join(" ");
  return (
    <Img
      src={staticFile(v.file)}
      style={{
        position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transformOrigin: "50% 100%",
        transform: `rotate(${rot}deg) scale(${sx}, ${sy})`, filter: filters || undefined, opacity,
        ...(silhouette || view.endsWith("face") ? {} : { WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 87%, transparent 95%)", maskImage: "linear-gradient(to bottom, #000 0%, #000 87%, transparent 95%)" }),
        ...style,
      }}
    />
  );
};

/** Burbuja «?» y estallido «!» (se entienden sin sonido). */
export const QMark: React.FC<{ x: number; y: number; s?: number; color?: string }> = ({ x, y, s = 1, color = "#F2705B" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={48} fill="rgba(18,60,64,0.88)" stroke={color} strokeWidth={8} />
    <text y={26} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={74} fill="#F3E7C9">?</text>
  </g>
);
export const Burst: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => {
  const pts = Array.from({ length: 16 }).map((_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 40 : 66; return `${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(" ");
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <polygon points={pts} fill="#F6C945" stroke="#F3E7C9" strokeWidth={5} />
      <text y={22} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={64} fill="#8A2E1E">!</text>
    </g>
  );
};
export const Sparkle: React.FC<{ x: number; y: number; s: number; rot?: number }> = ({ x, y, s, rot = 0 }) => (
  <path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30 Z" fill="#FFF1B8" stroke="#F6C945" strokeWidth={3} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} />
);

/** Primer plano circular de la cara (reacción). */
export const FaceInset: React.FC<{ who: "t" | "m"; left: number; top: number; size?: number; rot?: number; zoom?: number; ring?: string; scale?: number }> = ({
  who, left, top, size = 250, rot = 0, zoom = 1, ring = "#F2705B", scale = 1,
}) => {
  const view = who === "t" ? DOG_VIEWS.t_face : DOG_VIEWS.m_face;
  const imgW = (who === "t" ? 330 : 310) * zoom;
  const imgH = imgW * (view.h / view.w);
  // centro de la cara dentro de cada primer plano: Teresa centrada; Timoteo (cabeza inclinada) un poco a la derecha y arriba
  const ox = who === "t" ? (size - imgW) / 2 : size / 2 - 0.45 * imgW, oy = who === "t" ? (size - imgH) / 2 : size / 2 - 0.44 * imgH;
  return (
    <div style={{ position: "absolute", left, top, width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `9px solid ${ring}`, boxShadow: "0 8px 24px rgba(0,0,0,.45)", background: "#4E8785", transform: `scale(${scale})`, boxSizing: "border-box" }}>
      <Img src={staticFile(view.file)} style={{ position: "absolute", left: ox, top: oy, width: imgW, height: imgH, transform: `rotate(${rot}deg)`, transformOrigin: "50% 40%" }} />
    </div>
  );
};
