import React from "react";
import { Img, staticFile } from "remotion";

/**
 * Poses del protagonista (recortes de plastilina). `k` corrige pequeñas diferencias de escala entre generaciones
 * para que la cabeza mida lo mismo en todas las poses (altura de referencia = 1 "bebé").
 * `ar` = ancho/alto del recorte. Ver docs/personaje.md.
 */
export const POSES = {
  neutral: { file: "art/character/c_neutral.png", ar: 523 / 1184, k: 1.0 },
  surprised: { file: "art/character/c_surprised.png", ar: 660 / 1064, k: 1.0 },
  waveA: { file: "art/character/c_wave_a.png", ar: 618 / 1057, k: 1.0 },
  waveB: { file: "art/character/c_wave_b.png", ar: 618 / 1057, k: 1.0 },
  chest: { file: "art/character/c_chest.png", ar: 774 / 1401, k: 1.0 },
  point: { file: "art/character/c_point.png", ar: 557 / 935, k: 1.0 },
  maskPoint: { file: "art/character/m_point.png", ar: 734 / 1087, k: 1.0 },
  maskLook: { file: "art/character/m_look.png", ar: 847 / 1366, k: 1.0 },
  maskSurprised: { file: "art/character/m_surprised.png", ar: 732 / 1138, k: 1.0 },
} as const;
export type PoseName = keyof typeof POSES;

/** Tamaño real del sprite (alto en px) para un alto de "bebé" `h`. */
export const poseSize = (pose: PoseName, h: number) => {
  const p = POSES[pose];
  const height = h * p.k;
  return { w: height * p.ar, h: height };
};

type Props = {
  pose: PoseName;
  x: number; // centro de los pies
  y: number; // línea de los pies
  h: number; // alto del bebé en px
  flip?: boolean;
  rot?: number; // grados
  squash?: number; // 1 = normal; >1 estira
  silhouette?: boolean; // true = solo la silueta oscura (para sombras)
  blur?: number;
  opacity?: number;
  style?: React.CSSProperties;
};

export const Character: React.FC<Props> = ({ pose, x, y, h, flip, rot = 0, squash = 1, silhouette, blur = 0, opacity = 1, style }) => {
  const { w, h: ph } = poseSize(pose, h);
  const filters = [silhouette ? "brightness(0)" : "", blur ? `blur(${blur}px)` : ""].filter(Boolean).join(" ");
  return (
    <Img
      src={staticFile(POSES[pose].file)}
      style={{
        position: "absolute", left: x - w / 2, top: y - ph, width: w, height: ph,
        transformOrigin: "50% 100%",
        transform: `rotate(${rot}deg) scale(${flip ? -1 : 1}, ${squash})`,
        filter: filters || undefined, opacity, ...style,
      }}
    />
  );
};
