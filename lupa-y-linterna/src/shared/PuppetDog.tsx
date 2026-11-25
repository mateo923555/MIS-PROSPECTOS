import React from "react";
import { Img, staticFile } from "remotion";
import { DOG_VIEWS, Dog, type DogView } from "./Dogs";
import rigsJson from "./rigs.json";

type Rig = { fur: string; split: { axis: "x" | "y"; at: number; feather: number }; pivot: [number, number]; eyes: number[][]; lids: string[]; ears?: Array<{ poly: number[][]; pivot: number[] }> };
const RIGS = rigsJson as unknown as Record<string, Rig>;

export type PuppetPose = {
  rot?: number; sx?: number; sy?: number;
  headRot?: number; headDx?: number; headDy?: number; // en px de pantalla
  earL?: number; earR?: number; // grados
  blink?: number; // 0 abierto … 1 cerrado
};
type Props = PuppetPose & { view: DogView; x: number; y: number; k: number; silhouette?: boolean; blur?: number; opacity?: number; style?: React.CSSProperties };

const grad = (axis: "x" | "y", at: number, f: number, head: boolean) => {
  const dir = axis === "y" ? "to bottom" : "to right";
  // rampas SECUENCIALES (cuerpo sube antes del corte, cabeza baja después): nunca hay una banda traslúcida
  return head
    ? `linear-gradient(${dir}, #000 0%, #000 ${at}%, transparent ${at + f}%)`
    : `linear-gradient(${dir}, transparent 0%, transparent ${at - f}%, #000 ${at}%, #000 100%)`;
};

/** Títere de un solo sprite: cuerpo, cabeza, orejas y párpados por separado (cabeza que se inclina, orejas, parpadeo). */
export const PuppetDog: React.FC<Props> = ({ view, x, y, k, rot = 0, sx = 1, sy = 1, headRot = 0, headDx = 0, headDy = 0, earL = 0, earR = 0, blink = 0, silhouette, blur = 0, opacity = 1, style }) => {
  const rig = RIGS[view];
  if (!rig) return <Dog view={view} x={x} y={y} k={k} rot={rot} sx={sx} sy={sy} silhouette={silhouette} blur={blur} opacity={opacity} style={style} />;
  const v = DOG_VIEWS[view];
  const w = v.w * k, h = v.h * k;
  const P = (px: number, py: number) => [(px / 100) * w, (py / 100) * h];
  const src = staticFile(v.file);
  const { axis, at, feather } = rig.split;
  const imgStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: h };
  const skirt = "linear-gradient(to bottom, #000 0%, #000 87%, transparent 95%)";
  const [pvx, pvy] = P(rig.pivot[0], rig.pivot[1]);
  const earPaths = (rig.ears ?? []).map((e) => e.poly.map(([a, b]) => { const [qx, qy] = P(a, b); return `${qx.toFixed(1)} ${qy.toFixed(1)}`; }));
  const cutHead = `path(evenodd, "M 0 0 H ${w} V ${h} H 0 Z ${earPaths.map((p) => "M " + p.join(" L ") + " Z").join(" ")}")`;
  const filters = [silhouette ? "brightness(0)" : "", blur ? `blur(${blur}px)` : ""].filter(Boolean).join(" ");
  const earAng = [earL, earR];
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${rot}deg) scale(${sx}, ${sy})`, filter: filters || undefined, opacity, ...style }}>
      {/* cuerpo (sin cabeza): se funde con la cabeza en el cuello */}
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, false), maskImage: grad(axis, at, feather, false) }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: skirt, maskImage: skirt }}><Img src={src} style={imgStyle} /></div>
      </div>
      {/* cabeza + orejas + párpados: giran juntos alrededor del cuello */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${pvx}px ${pvy}px`, transform: `translate(${headDx}px, ${headDy}px) rotate(${headRot}deg)` }}>
        <div style={{ position: "absolute", inset: 0, clipPath: cutHead }}>
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, true), maskImage: grad(axis, at, feather, true) }}><Img src={src} style={imgStyle} /></div>
        </div>
        {(rig.ears ?? []).map((e, i) => {
          const [ex, ey] = P(e.pivot[0], e.pivot[1]);
          const pts = e.poly.map(([a, b]) => P(a, b).map((n) => n.toFixed(1) + "px").join(" ")).join(", ");
          // las orejas del lado izquierdo usan earL, las del derecho earR
          const ang = e.pivot[0] < rig.pivot[0] ? earAng[0] : earAng[1];
          return (
            <div key={i} style={{ position: "absolute", inset: 0, transformOrigin: `${ex}px ${ey}px`, transform: `rotate(${ang}deg)`, clipPath: `polygon(${pts})` }}>
              <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, true), maskImage: grad(axis, at, feather, true) }}><Img src={src} style={imgStyle} /></div>
            </div>
          );
        })}
        {blink > 0.02 && rig.eyes.map(([ex, ey, rx, ry], i) => {
          const [cx, cy] = P(ex, ey);
          const lw = (rx / 100) * w * 2.15, lh = (ry / 100) * h * 2.3;
          return (
            <div key={i} style={{ position: "absolute", left: cx - lw / 2, top: cy - lh / 2, width: lw, height: lh, borderRadius: "50%", overflow: "hidden", transformOrigin: "50% 0%", transform: `scaleY(${blink})`, background: `radial-gradient(ellipse at 50% 40%, ${rig.fur} 0%, ${rig.fur} 50%, ${rig.lids[i]} 100%)`, boxShadow: "inset 0 -3px 4px rgba(50,30,20,0.35)" }}>
              <div style={{ position: "absolute", left: "8%", right: "8%", bottom: 0, height: 3, borderRadius: 3, background: "rgba(35,22,14,0.75)" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ───────── Movimiento secundario (vida propia) ───────── */
const rnd = (a: number, n: number) => { const s = Math.sin(a * 127.1 + n * 311.7) * 43758.5453; return s - Math.floor(s); };
/** Parpadeo: cada ~2,4–4,2 s, 0,2 s de duración. t en segundos (usar el tiempo en pasos de stop motion). */
export const blinkAt = (t: number, seed = 1) => {
  const period = 3.2; const n = Math.floor(t / period); const start = n * period + 0.4 + rnd(seed, n) * 2.2; const u = (t - start) / 0.2;
  return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0;
};
/** Orejas: espasmos aleatorios y alternados (grados). */
export const earTwitch = (t: number, seed = 1) => {
  const period = 2.1; const n = Math.floor(t / period); const start = n * period + rnd(seed + 3, n) * 1.3; const u = (t - start) / 0.35;
  const side = rnd(seed + 5, n) > 0.5 ? 1 : 0;
  const a = u > 0 && u < 1 ? Math.sin(u * Math.PI) * 9 : 0;
  return { l: side ? a : a * 0.3, r: side ? a * 0.3 : -a };
};
/** Respiración + balanceo de cabeza con retardo (follow-through). */
export const idleHead = (t: number, seed = 1) => ({
  sy: 1 + 0.012 * Math.sin((t * 2 * Math.PI) / 2.3 + seed),
  headRot: 1.6 * Math.sin((t * 2 * Math.PI) / 3.7 + seed * 2),
  headDy: 2.2 * Math.sin((t * 2 * Math.PI) / 2.3 + seed + 0.6),
});
