import React from "react";
import { Img, staticFile } from "remotion";
import { DOG_VIEWS, Dog, VIEW_MULT, type DogView } from "./Dogs";
import rigsJson from "./rigs.json";

type Poly = number[][];
type Rig = {
  fur: string; split: { axis: "x" | "y"; at: number; feather: number; side?: "low" | "high" }; pivot: [number, number];
  eyes: number[][]; lids: string[]; skirt?: [number, number];
  ears?: Array<{ poly: Poly; pivot: number[] }>; tail?: { poly: Poly; pivot: number[] };
  legs?: Array<{ poly: Poly; pivot: number[]; group: number; z: "front" | "back" }>;
};
const RIGS = rigsJson as unknown as Record<string, Rig>;

export type PuppetPose = {
  rot?: number; sx?: number; sy?: number;
  headRot?: number; headDx?: number; headDy?: number; // en px de pantalla
  earL?: number; earR?: number; // grados
  blink?: number; // 0 abierto … 1 cerrado
  gait?: number; gaitAmp?: number; tailRot?: number; // fase de la marcha (radianes), amplitud de patas (grados), cola (grados)
};
type Props = PuppetPose & { view: DogView; x: number; y: number; k: number; silhouette?: boolean; blur?: number; opacity?: number; style?: React.CSSProperties };

/** Máscaras SECUENCIALES (cuerpo sube antes del corte, cabeza baja después): nunca hay una banda traslúcida. `side` = qué lado es la cabeza. */
const grad = (axis: "x" | "y", at: number, f: number, head: boolean, side: "low" | "high" = "low") => {
  const dir = axis === "y" ? "to bottom" : side === "low" ? "to right" : "to left";
  // para side "high" el eje se invierte: medimos desde el otro extremo
  const pos = side === "high" ? 100 - at : at;
  return head
    ? `linear-gradient(${dir}, #000 0%, #000 ${pos}%, transparent ${pos + f}%)`
    : `linear-gradient(${dir}, transparent 0%, transparent ${pos - f}%, #000 ${pos}%, #000 100%)`;
};

/** Títere de un solo sprite: cuerpo, cabeza, orejas, párpados, cola y patas por separado (marcha, cabeza que se inclina, parpadeo). */
export const PuppetDog: React.FC<Props> = ({ view, x, y, k: k0, rot = 0, sx = 1, sy = 1, headRot = 0, headDx = 0, headDy = 0, earL = 0, earR = 0, blink = 0, gait, gaitAmp = 0, tailRot = 0, silhouette, blur = 0, opacity = 1, style }) => {
  const rig = RIGS[view];
  if (!rig) return <Dog view={view} x={x} y={y} k={k0} rot={rot} sx={sx} sy={sy} silhouette={silhouette} blur={blur} opacity={opacity} style={style} />;
  const k = k0 * (VIEW_MULT[view] ?? 1);
  const v = DOG_VIEWS[view];
  const w = v.w * k, h = v.h * k;
  const P = (px: number, py: number) => [(px / 100) * w, (py / 100) * h];
  const src = staticFile(v.file);
  const { axis, at, feather } = rig.split; const side = rig.split.side ?? "low";
  const imgStyle: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: w, height: h };
  const [sk0, sk1] = rig.skirt ?? [87, 95];
  const skirt = `linear-gradient(to bottom, #000 0%, #000 ${sk0}%, transparent ${sk1}%)`;
  const [pvx, pvy] = P(rig.pivot[0], rig.pivot[1]);
  const pathOf = (poly: Poly) => "M " + poly.map(([a, b]) => { const [qx, qy] = P(a, b); return `${qx.toFixed(1)} ${qy.toFixed(1)}`; }).join(" L ") + " Z";
  const polyCss = (poly: Poly) => `polygon(${poly.map(([a, b]) => P(a, b).map((n) => n.toFixed(1) + "px").join(" ")).join(", ")})`;
  const legs = rig.legs ?? [];
  const cutOut = (polys: Poly[]) => `path(evenodd, "M 0 0 H ${w} V ${h} H 0 Z ${polys.map(pathOf).join(" ")}")`;
  const cutHead = cutOut((rig.ears ?? []).map((e) => e.poly));
  const cutBody = cutOut([...legs.map((l) => l.poly), ...(rig.tail ? [rig.tail.poly] : [])]);
  const filters = [silhouette ? "brightness(0)" : "", blur ? `blur(${blur}px)` : ""].filter(Boolean).join(" ");
  const earAng = [earL, earR];
  const full = (extra?: React.CSSProperties) => <div style={{ position: "absolute", inset: 0, WebkitMaskImage: skirt, maskImage: skirt, ...extra }}><Img src={src} style={imgStyle} /></div>;
  const legLayer = (l: NonNullable<Rig["legs"]>[number], i: number) => {
    const [lx, ly] = P(l.pivot[0], l.pivot[1]);
    const ph = (gait ?? 0) + (l.group ? Math.PI : 0);
    const ang = gait === undefined ? 0 : gaitAmp * Math.sin(ph);
    const lift = gait === undefined ? 0 : Math.max(0, Math.cos(ph)) * gaitAmp * 0.55 * k * 0.9; // la pata que avanza se levanta
    return (
      <div key={i} style={{ position: "absolute", inset: 0, clipPath: polyCss(l.poly), transformOrigin: `${lx}px ${ly}px`, transform: `translateY(${-lift}px) rotate(${ang}deg)` }}>{full()}</div>
    );
  };
  const tail = rig.tail ? (() => { const [tx, ty] = P(rig.tail.pivot[0], rig.tail.pivot[1]); return (
    <div style={{ position: "absolute", inset: 0, clipPath: polyCss(rig.tail.poly), transformOrigin: `${tx}px ${ty}px`, transform: `rotate(${tailRot}deg)` }}>{full()}</div>
  ); })() : null;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y - h, width: w, height: h, transformOrigin: "50% 100%", transform: `rotate(${rot}deg) scale(${sx}, ${sy})`, filter: filters || undefined, opacity, ...style }}>
      {/* patas del lado lejano (detrás del cuerpo) */}
      {legs.map((l, i) => (l.z === "back" ? legLayer(l, i) : null))}
      {/* cuerpo (sin cabeza, sin patas, sin cola): se funde con la cabeza en el cuello */}
      <div style={{ position: "absolute", inset: 0, clipPath: legs.length || rig.tail ? cutBody : undefined }}>
        <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, false, side), maskImage: grad(axis, at, feather, false, side) }}>{full()}</div>
      </div>
      {tail}
      {legs.map((l, i) => (l.z === "front" ? legLayer(l, i) : null))}
      {/* cabeza + orejas + párpados: giran juntos alrededor del cuello */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${pvx}px ${pvy}px`, transform: `translate(${headDx}px, ${headDy}px) rotate(${headRot}deg)` }}>
        <div style={{ position: "absolute", inset: 0, clipPath: cutHead }}>
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, true, side), maskImage: grad(axis, at, feather, true, side) }}>{full()}</div>
        </div>
        {(rig.ears ?? []).map((e, i) => {
          const [ex, ey] = P(e.pivot[0], e.pivot[1]);
          const ang = e.pivot[0] < rig.pivot[0] ? earAng[0] : earAng[1];
          return (
            <div key={i} style={{ position: "absolute", inset: 0, transformOrigin: `${ex}px ${ey}px`, transform: `rotate(${ang}deg)`, clipPath: polyCss(e.poly) }}>
              <div style={{ position: "absolute", inset: 0, WebkitMaskImage: grad(axis, at, feather, true, side), maskImage: grad(axis, at, feather, true, side) }}>{full()}</div>
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

/** Línea de tiempo de vistas con fundido corto (giros y cambios de pose sin «saltos»). entries = [[tiempo, vista], …] */
export const viewMix = (t: number, entries: Array<[number, DogView]>, blend = 0.14) => {
  let i = 0; for (let n = 0; n < entries.length; n++) if (t >= entries[n][0]) i = n;
  const cur = entries[i], prev = entries[i - 1];
  const m = prev ? Math.min(1, (t - cur[0]) / blend) : 1;
  return { view: cur[1], prev: prev && m < 1 ? prev[1] : null, mix: m };
};
/** Dibuja el perro con fundido entre vistas. */
export const CrossDog: React.FC<{ t: number; entries: Array<[number, DogView]>; blend?: number } & Omit<Props, "view" | "opacity"> & { sideGait?: number; stride?: number }> = ({ t, entries, blend, sideGait, ...rest }) => {
  const { view, prev, mix } = viewMix(t, entries, blend);
  const isSide = (v: DogView) => v.endsWith("_side");
  return (
    <>
      {prev && <PuppetDog {...rest} view={prev} opacity={1 - mix} gait={isSide(prev) ? sideGait : undefined} />}
      <PuppetDog {...rest} view={view} opacity={mix} gait={isSide(view) ? sideGait : undefined} />
    </>
  );
};
