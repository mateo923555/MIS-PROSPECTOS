import React from "react";
import { Audio, Img, staticFile, useVideoConfig } from "remotion";
import META from "./petMeta.json";
import { C, FONT, H, W } from "./theme";
import { RoomBg } from "./Room";
import type { VoiceData, VoiceSegment } from "./voice";
import type { Sfx } from "./Sound";

/** Poses reales de Timo y Tere (public/art/mascotas/_manifest.json). */
export const M = {
  base: "timoteo/base/timoteo_base_frente_04", talk: "timoteo/base/timoteo_base_frente_01", bark: "timoteo/habla/timoteo_habla_frente_01",
  surp: "timoteo/emocion/timoteo_emocion_frente_07", sad: "timoteo/emocion/timoteo_emocion_frente_05", think: "timoteo/mirada/timoteo_mirada_frente_01",
  up: "timoteo/mirada/timoteo_mirada_frente_02", jump: "timoteo/salto/timoteo_salto_frente_01", laugh: "timoteo/emocion/timoteo_emocion_frente_08",
  happy: "timoteo/emocion/timoteo_emocion_frente_04", point: "timoteo/accion/timoteo_accion_izq_03", blink: "timoteo/parpadeo/timoteo_parpadeo_frente_02",
  curious: "timoteo/mirada/timoteo_mirada_frente_04", yawn: "timoteo/emocion/timoteo_emocion_frente_06",
};
export const TE = {
  base: "teresa/base/teresa_base_frente_06", talk: "teresa/base/teresa_base_frente_02", bark: "teresa/habla/teresa_habla_frente_01",
  look: "teresa/mirada/teresa_mirada_izq_02", up: "teresa/mirada/teresa_mirada_frente_02", curious: "teresa/mirada/teresa_mirada_frente_01",
  jump: "teresa/salto/teresa_salto_frente_01", blink: "teresa/parpadeo/teresa_parpadeo_frente_02", yawn: "teresa/emocion/teresa_emocion_frente_03",
};
export const meta = (k: string) => (META as any)[`art/mascotas/${k}.png`] as { w: number; h: number; top: number; bottom: number };
export const REF_M = meta(M.base), REF_T = meta(TE.base);

export const Sprite: React.FC<{ k: string; ref_: { top: number; bottom: number }; x: number; footY: number; h: number; rot?: number; flip?: boolean; style?: React.CSSProperties }> = ({ k, ref_, x, footY, h, rot = 0, flip, style }) => {
  const m = meta(k); const sc = h / (ref_.bottom - ref_.top);
  return (
    <Img src={staticFile(`art/mascotas/${k}.png`)} style={{
      position: "absolute", left: x - (m.w / 2) * sc, top: footY - m.bottom * sc, width: m.w * sc, height: m.h * sc,
      transformOrigin: `50% ${(m.bottom / m.h) * 100}%`, transform: `rotate(${rot}deg) scaleX(${flip ? -1 : 1})`,
      filter: "drop-shadow(0 8px 10px rgba(30,15,5,0.22))", ...style,
    }} />
  );
};

// ───────── voz ─────────
export const makeVoice = (voice: VoiceData) => {
  const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
  const word = (id: string, needle: string) => { const s = seg(id); return (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]); };
  const speaking = (t: number, who: "timo" | "tere") => voice.segments.some((s) => (s as any).speaker === who && t >= s.voiceStart - 0.03 && t <= s.voiceEnd + 0.05);
  const lastEnd = Math.max(...voice.segments.map((s) => s.voiceEnd));
  return { seg, word, speaking, lastEnd };
};
export const mouth = (t: number, a: string, b: string, c: string) => [a, b, c, b][Math.floor(t * 9) % 4];
export const hopArc = (t: number, t0: number, dur: number, h: number) => (t < t0 || t > t0 + dur ? 0 : -Math.abs(Math.sin(((t - t0) / dur) * Math.PI)) * h);
export const ease = (p: number) => { const c = Math.min(1, Math.max(0, p)); return c * c * (3 - 2 * c); };
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// ───────── efectos de sonido: bajan solos si caen sobre una frase ─────────
const SFX_RMS: Record<string, number> = { pop: -13.3, yip: -7.7, pawstep: -15.1, ding: -14.1, think: -15.6, sparkle: -15.4, tada: -15.1, woof: -12.2, heart: -14.6, discover: -15.4, whoosh: -16.3, tap: -15, click: -15, bubbles: -15, morph: -15 };
export const duckOverSpeech = (voice: VoiceData, cues: Sfx[], voiceDb = -21.6, margin = 10): Sfx[] => cues.map((c) => {
  const over = voice.segments.some((s) => c.at >= s.voiceStart - 0.12 && c.at <= s.voiceEnd + 0.12);
  if (!over) return c;
  return { ...c, volume: Math.min(c.volume ?? 0.6, Math.pow(10, (voiceDb - margin - (SFX_RMS[c.name] ?? -20)) / 20)) };
});

// ───────── escenario: pared, piso, mesa y experimento arriba ─────────
export const TABLE_Y = 840; // el experimento apoya acá
export const Stage: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>
    <RoomBg floorBrightness={0.95} />
    {/* mesa */}
    <div style={{ position: "absolute", left: 70, top: TABLE_Y, width: 940, height: 54, borderRadius: 16, background: "linear-gradient(#C98F55,#A9743E)", boxShadow: "0 10px 24px rgba(0,0,0,.35), inset 0 3px 0 rgba(255,255,255,.28)" }} />
    <div style={{ position: "absolute", left: 100, top: TABLE_Y + 54, width: 880, height: 62, background: "linear-gradient(#8E5F31,#6E4825)", borderRadius: "0 0 10px 10px", boxShadow: "0 8px 18px rgba(0,0,0,.3)" }} />
    {[130, 900].map((x) => <div key={x} style={{ position: "absolute", left: x, top: TABLE_Y + 100, width: 52, height: 420, background: "linear-gradient(90deg,#7B5128,#5E3E1D)", borderRadius: "0 0 8px 8px" }} />)}
    {children}
  </>
);

// ───────── cámara por planos ─────────
export type ShotKind = "wide" | "exp" | "dogs" | "timo" | "tere" | "expclose";
export type Shot = { t: number; kind: ShotKind };
const TARGET: Record<ShotKind, { s: number; cx: number; cy: number }> = {
  wide: { s: 1.0, cx: 540, cy: 960 }, exp: { s: 1.18, cx: 540, cy: 820 }, expclose: { s: 1.45, cx: 540, cy: 700 },
  dogs: { s: 1.35, cx: 540, cy: 1090 }, timo: { s: 1.6, cx: 290, cy: 1120 }, tere: { s: 1.6, cx: 800, cy: 1110 },
};
export const camAt = (shots: Shot[], t: number, over?: Partial<Record<ShotKind, { s: number; cx: number; cy: number }>>) => {
  const tg = (k: ShotKind) => ({ ...TARGET[k], ...(over?.[k] ?? {}) });
  let i = 0; while (i + 1 < shots.length && t >= shots[i + 1].t) i++;
  const cur = tg(shots[i].kind); let out = cur; const dt = t - shots[i].t;
  if (i > 0 && dt < 0.45) { const prev = tg(shots[i - 1].kind); const p = ease(dt / 0.45); out = { s: prev.s + (cur.s - prev.s) * p, cx: prev.cx + (cur.cx - prev.cx) * p, cy: prev.cy + (cur.cy - prev.cy) * p }; }
  const lim = (c: number, size: number) => Math.min(size - size / (2 * out.s) - 1, Math.max(size / (2 * out.s) + 1, c));
  return { scale: out.s, cx: lim(out.cx, W), cy: lim(out.cy, H) };
};
export const camTransform = (c: { scale: number; cx: number; cy: number }) => `translate(${W / 2}px, ${H / 2}px) scale(${c.scale}) translate(${-c.cx}px, ${-c.cy}px)`;

export const Mark: React.FC<{ t: number; a: number; b: number; x: number; y: number; ch: string; color?: string; size?: number }> = ({ t, a, b, x, y, ch, color = "#F6C945", size = 130 }) => {
  if (t < a || t > b) return null;
  const p = (t - a) / (b - a); const s = Math.min(1, (t - a) / 0.12);
  const sc = (0.4 + 0.75 * Math.sin(s * Math.PI * 0.5)) * (p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1);
  return <text x={x} y={y} fontFamily={FONT} fontWeight={700} fontSize={size} textAnchor="middle" fill={color} stroke="#123C40" strokeWidth={size / 10} paintOrder="stroke" transform={`rotate(${Math.sin(p * 9) * 6} ${x} ${y}) translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>{ch}</text>;
};

/** Etiqueta redonda (para opciones, cerca/lejos, etc.). */
export const Chip: React.FC<{ x: number; y: number; text: string; color: string; scale?: number; w?: number; fs?: number }> = ({ x, y, text, color, scale = 1, w = 250, fs = 46 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-w / 2} y={-38} width={w} height={76} rx={38} fill={color} stroke="#fff" strokeWidth={6} />
    <text x={0} y={17} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={fs} fill="#fff">{text}</text>
  </g>
);

export const DOG_X = { timo: 285, tere: 795 }, DOG_FOOT = { timo: 1290, tere: 1300 }, DOG_H = { timo: 400, tere: 470 };
export const BRAND = (text: string, op: number) => (
  <div style={{ position: "absolute", top: 1330, height: 210, left: 0, width: W - 150, display: "flex", alignItems: "center", justifyContent: "center", opacity: op }}>
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.cream, background: "rgba(18,60,64,0.8)", padding: "8px 30px 12px", borderRadius: 40 }}>{text}</div>
  </div>
);

// ───────── botón que aprietan los perros (acción con autor) ─────────
export const PUSH_M = "timoteo/accion/timoteo_accion_der_01", PUSH_T = "teresa/accion/teresa_accion_der_02";
/** Punto de las patas delanteras en una pose "empujando" (fracciones medidas sobre el recorte). */
export const pawPoint = (k: string, ref_: { top: number; bottom: number }, x: number, footY: number, h: number, fx: number, fy: number) => {
  const m = meta(k); const sc = h / (ref_.bottom - ref_.top);
  return { x: x - (m.w / 2) * sc + fx * m.w * sc, y: footY - m.bottom * sc + fy * m.h * sc };
};
export const pressAmt = (t: number, a: number, b: number) => ease((t - a) / 0.16) * (1 - ease((t - b) / 0.22));
export const PushButton: React.FC<{ x: number; y: number; floorY: number; press: number; color: string; label: string; showLabel?: boolean }> = ({ x, y, floorY, press, color, label, showLabel = true }) => (
  <g>
    <rect x={x - 10} y={y + 52} width={20} height={floorY - y - 52} fill="#5C6470" />
    <rect x={x - 56} y={floorY - 14} width={112} height={14} rx={6} fill="#3E444F" />
    <rect x={x - 46} y={y - 62} width={92} height={118} rx={18} fill="#8B94A3" stroke="#fff" strokeWidth={4} />
    <circle cx={x} cy={y - 8 + press * 10} r={30} fill={color} stroke="#fff" strokeWidth={5} />
    <circle cx={x - 8} cy={y - 18 + press * 10} r={8} fill="#fff" opacity={0.6 - press * 0.4} />
    {showLabel && <text x={x} y={y + 44} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={20} fill="#fff">{label}</text>}
  </g>
);
/** Cable desde el botón hasta la máquina (con una "señal" que viaja cuando se aprieta). */
export const Cable: React.FC<{ pts: Array<[number, number]>; t: number; t0: number }> = ({ pts, t, t0 }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const seg = pts.slice(1).map((p, i) => ({ a: pts[i], b: p, len: Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]) }));
  const total = seg.reduce((s, q) => s + q.len, 0); const u = (t - t0) / 0.55;
  let dot: { x: number; y: number } | null = null;
  if (u >= 0 && u <= 1) { let d0 = u * total; for (const q of seg) { if (d0 <= q.len) { const f = d0 / q.len; dot = { x: q.a[0] + (q.b[0] - q.a[0]) * f, y: q.a[1] + (q.b[1] - q.a[1]) * f }; break; } d0 -= q.len; } }
  return (<g><path d={d} fill="none" stroke="#2B2F38" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /><path d={d} fill="none" stroke="#FFC93C" strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />{dot && <circle cx={dot.x} cy={dot.y} r={13} fill="#FFE27A" stroke="#fff" strokeWidth={3} />}</g>);
};

/** Música en bucle (si el video dura más que el archivo), con bajada bajo la voz y fundido corto al final. */
export const LoopMusic: React.FC<{ src: string; voice: VoiceData; totalSec: number; base?: number; duckTo?: number }> = ({ src, voice, totalSec, base = 0.2, duckTo = 0.09 }) => {
  const { fps } = useVideoConfig();
  return (
    <Audio src={staticFile(src)} loop volume={(f) => {
      const tt = f / fps; let v = base;
      for (const s of voice.segments) if (tt > s.voiceStart - 0.15 && tt < s.voiceEnd + 0.25) v = duckTo;
      return v * Math.min(1, tt / 0.5) * Math.min(1, Math.max(0, (totalSec - 0.15 - tt) / 0.9));
    }} />
  );
};
