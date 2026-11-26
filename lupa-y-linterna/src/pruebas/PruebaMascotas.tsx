import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust, Vignette, handheld } from "../shared/Fx";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { FONT, H, W } from "../shared/theme";
import { keys, stepTime } from "../shared/motion";

export const PRUEBA_MASCOTAS_SECONDS = 12.0;

// tamaños (px) de las poses ya recortadas
const SZ: Record<string, [number, number]> = {
  t_olfatea: [1072, 1026], t_sorprendida: [936, 1130], t_curiosa: [927, 1140], t_juego: [1009, 1078],
  t_corre: [1214, 992], t_salto: [1139, 1061], t_triste: [1016, 947],
  m_corre: [1178, 1048], m_sorprendido: [923, 1122], m_curioso: [1016, 1185], m_juego: [1014, 1104],
  m_salto: [1113, 1163], m_triste: [1048, 901], m_olfatea: [1085, 1023],
};
const KT = 0.64, KM = 0.54; // Teresa es más grande que Timoteo
const FLOOR_T = 1500, FLOOR_M = 1468;

type Fx = { dy: number; rot: number; sx: number; sy: number };
type Seg = { a: number; b: number; pose: string; flip?: boolean; x: [number, number] | ((u: number) => number); fx?: (u: number, p: number, t: number) => Partial<Fx> };

const ease = (p: number) => p * p * (3 - 2 * p);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const hop = (t: number, a: number, d: number, h: number) => (t < a || t > a + d ? 0 : -h * Math.sin(((t - a) / d) * Math.PI));
const run = (f: number, amp = 26) => (t: number) => ({ dy: -Math.abs(Math.sin(t * f * Math.PI)) * amp, rot: Math.sin(t * f * Math.PI) * 2.2, sy: 1 + 0.03 * Math.cos(t * f * 2 * Math.PI), sx: 1 - 0.02 * Math.cos(t * f * 2 * Math.PI) });
const bounce2 = (u: number, d: number, h: number) => {
  // dos saltos seguidos con aplastamiento al aterrizar
  const hopD = d / 2; const k = Math.floor(u / hopD); const f = (u - k * hopD) / hopD;
  const dy = -h * Math.sin(f * Math.PI);
  const land = f > 0.86 || f < 0.1 ? 0.07 : 0;
  return { dy, sy: 1 - land + (dy < -60 ? 0.04 : 0), sx: 1 + land * 0.7 - (dy < -60 ? 0.02 : 0), rot: 0 };
};

const T_SEGS: Seg[] = [
  { a: 0, b: 2.0, pose: "t_olfatea", x: [270, 300], fx: (u, p, t) => ({ rot: Math.sin(t * 9) * 1.2, dy: Math.abs(Math.sin(t * 7)) * 5, sy: 1 - 0.012 * Math.sin(t * 7) }) },
  { a: 2.0, b: 2.9, pose: "t_sorprendida", x: [300, 300], fx: (u) => ({ dy: hop(u, 0, 0.35, 70), sy: u < 0.12 ? 0.94 : 1, sx: u < 0.12 ? 1.04 : 1 }) },
  { a: 2.9, b: 4.3, pose: "t_curiosa", x: [300, 300], fx: (u, p, t) => ({ rot: Math.sin(t * 2.6) * 3.2, sy: 1 + 0.01 * Math.sin(t * 4) }) },
  { a: 4.3, b: 5.65, pose: "t_juego", x: [300, 300], fx: (u, p, t) => ({ rot: Math.sin(t * 13) * 3.5, sx: 1 + 0.03 * Math.sin(t * 13 + 1.4), sy: 1 - 0.03 * Math.sin(t * 13 + 1.4), dy: -Math.abs(Math.sin(t * 6.5)) * 10 }) },
  { a: 5.65, b: 6.95, pose: "t_corre", x: (u) => lerp(300, -520, ease(Math.min(1, u / 1.3))), fx: (u, p, t) => run(7.5, 22)(t) },
  { a: 6.95, b: 7.25, pose: "t_corre", flip: true, x: [-520, -520] },
  { a: 7.25, b: 8.3, pose: "t_corre", flip: true, x: (u) => lerp(-520, 300, 1 - Math.pow(1 - Math.min(1, u / 1.05), 2.2)), fx: (u, p, t) => run(7.5, 22)(t) },
  { a: 8.3, b: 8.6, pose: "t_juego", x: [300, 300], fx: () => ({ sy: 0.95, sx: 1.04 }) },
  { a: 8.6, b: 9.5, pose: "t_salto", x: [300, 300], fx: (u) => bounce2(u, 0.9, 200) },
  { a: 9.5, b: 10.6, pose: "t_triste", x: [300, 300], fx: (u, p, t) => ({ sy: 1 + 0.012 * Math.sin(t * 2.2), rot: Math.sin(t * 1.1) * 0.8 }) },
  { a: 10.6, b: 12.0, pose: "t_juego", x: [300, 300], fx: (u, p, t) => ({ rot: Math.sin(t * 12) * 3.2, sx: 1 + 0.03 * Math.sin(t * 12 + 1.4), sy: 1 - 0.03 * Math.sin(t * 12 + 1.4), dy: -Math.abs(Math.sin(t * 6)) * 12 }) },
];
const M_SEGS: Seg[] = [
  { a: 1.3, b: 2.0, pose: "m_corre", flip: true, x: (u) => lerp(1400, 850, 1 - Math.pow(1 - Math.min(1, u / 0.7), 2)), fx: (u, p, t) => run(8.5, 22)(t) },
  { a: 2.0, b: 2.9, pose: "m_sorprendido", x: [850, 850], fx: (u) => ({ dy: hop(u, 0.05, 0.4, 90), sy: u < 0.12 ? 0.93 : 1, sx: u < 0.12 ? 1.05 : 1 }) },
  { a: 2.9, b: 4.3, pose: "m_curioso", flip: true, x: [850, 850], fx: (u, p, t) => ({ rot: Math.sin(t * 2.8 + 1) * -3.5, sy: 1 + 0.01 * Math.sin(t * 4.5) }) },
  { a: 4.3, b: 5.4, pose: "m_juego", x: [850, 850], fx: (u, p, t) => ({ rot: Math.sin(t * 14 + 2) * 3.5, sx: 1 + 0.03 * Math.sin(t * 14 + 3.2), sy: 1 - 0.03 * Math.sin(t * 14 + 3.2), dy: -Math.abs(Math.sin(t * 7 + 1)) * 12 }) },
  { a: 5.4, b: 6.7, pose: "m_corre", flip: true, x: (u) => lerp(850, -460, ease(Math.min(1, u / 1.3))), fx: (u, p, t) => run(8.5, 22)(t) },
  { a: 6.7, b: 7.0, pose: "m_corre", x: [-460, -460] },
  { a: 7.0, b: 8.0, pose: "m_corre", x: (u) => lerp(-460, 850, 1 - Math.pow(1 - Math.min(1, u / 1.0), 2.2)), fx: (u, p, t) => run(8.5, 22)(t) },
  { a: 8.0, b: 8.5, pose: "m_juego", x: [850, 850], fx: () => ({ sy: 0.95, sx: 1.04 }) },
  { a: 8.5, b: 9.5, pose: "m_salto", x: [850, 850], fx: (u) => bounce2(u, 1.0, 230) },
  { a: 9.5, b: 10.6, pose: "m_triste", flip: true, x: [850, 850], fx: (u, p, t) => ({ sy: 1 + 0.012 * Math.sin(t * 2.4 + 1), rot: Math.sin(t * 1.3) * 0.8 }) },
  { a: 10.6, b: 12.0, pose: "m_juego", x: [850, 850], fx: (u, p, t) => ({ rot: Math.sin(t * 13 + 2) * 3.2, sx: 1 + 0.03 * Math.sin(t * 13 + 3.2), sy: 1 - 0.03 * Math.sin(t * 13 + 3.2), dy: -Math.abs(Math.sin(t * 6.5 + 1)) * 12 }) },
];

type State = { pose: string; flip: boolean; x: number; fx: Fx; since: number } | null;
const stateAt = (segs: Seg[], t: number): State => {
  const s = segs.find((g) => t >= g.a && t < g.b) ?? (t >= segs[segs.length - 1].b ? segs[segs.length - 1] : null);
  if (!s) return null;
  const u = t - s.a, p = (t - s.a) / (s.b - s.a);
  const x = typeof s.x === "function" ? s.x(u) : lerp(s.x[0], s.x[1], ease(p));
  const f = s.fx?.(u, p, t) ?? {};
  return { pose: s.pose, flip: !!s.flip, x, since: u, fx: { dy: 0, rot: 0, sx: 1, sy: 1, ...f } };
};

const Sprite: React.FC<{ st: State; k: number; floor: number }> = ({ st, k, floor }) => {
  if (!st) return null;
  const [w, h] = SZ[st.pose];
  const sw = w * k, sh = h * k;
  const pop = st.since < 0.16 ? 1 + 0.05 * Math.sin((1 - st.since / 0.16) * Math.PI * 0.5) : 1; // "pop" de plastilina al cambiar de pose
  return (
    <Img
      src={staticFile(`art/pets/${st.pose}.png`)}
      style={{
        position: "absolute", left: st.x - sw / 2, top: floor + st.fx.dy - sh, width: sw, height: sh,
        transformOrigin: "50% 100%",
        transform: `rotate(${st.fx.rot}deg) scale(${st.fx.sx * pop * (st.flip ? -1 : 1)}, ${st.fx.sy * pop})`,
        filter: "drop-shadow(0 6px 10px rgba(30,15,5,0.25))",
      }}
    />
  );
};
const Shadow: React.FC<{ st: State; k: number; floor: number }> = ({ st, k, floor }) => {
  if (!st) return null;
  const [w] = SZ[st.pose];
  const lift = Math.max(0, -st.fx.dy);
  const rx = Math.min(w * k, 640 * k * 1.1) * 0.42 * (1 - Math.min(0.4, lift / 500));
  return <ellipse cx={st.x} cy={floor - 4} rx={rx} ry={rx * 0.16} fill="rgba(20,10,5,0.35)" opacity={Math.max(0.35, 1 - lift / 320)} />;
};

const Mark: React.FC<{ t: number; a: number; b: number; x: number; y: number; ch: string; color?: string }> = ({ t, a, b, x, y, ch, color = "#F6C945" }) => {
  if (t < a || t > b) return null;
  const p = (t - a) / (b - a);
  const s = Math.min(1, (t - a) / 0.12);
  const sc = (0.4 + 0.75 * Math.sin(s * Math.PI * 0.5) + 0.0) * (p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1);
  return (
    <text x={x} y={y - 10 * Math.sin(p * 6)} fontFamily={FONT} fontWeight={700} fontSize={150} textAnchor="middle" fill={color} stroke="#123C40" strokeWidth={14} paintOrder="stroke" transform={`rotate(${Math.sin(p * 9) * 6} ${x} ${y}) translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>
      {ch}
    </text>
  );
};

const SFX: Sfx[] = [
  { at: 0.1, name: "sparkle", volume: 0.3 }, ...[0.35, 0.9, 1.45].map((at) => ({ at, name: "sniff", volume: 0.35 })),
  { at: 1.3, name: "whoosh", volume: 0.4 }, ...[1.4, 1.58, 1.76, 1.94].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 2.0, name: "yip", volume: 0.5 }, { at: 2.05, name: "ding", volume: 0.4 },
  { at: 3.0, name: "think", volume: 0.3 },
  { at: 4.35, name: "woof", volume: 0.4 }, { at: 4.5, name: "yip", volume: 0.45 },
  { at: 5.4, name: "whoosh", volume: 0.4 }, ...[5.55, 5.8, 6.05, 6.3, 6.55].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 7.0, name: "whoosh", volume: 0.35 }, ...[7.15, 7.4, 7.65, 7.9].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 8.6, name: "yip", volume: 0.5 }, { at: 8.65, name: "woof", volume: 0.35 }, { at: 8.7, name: "tada", volume: 0.3 },
  { at: 9.6, name: "think", volume: 0.25 },
  { at: 10.7, name: "heart", volume: 0.45 }, { at: 10.75, name: "yip", volume: 0.4 }, { at: 11.15, name: "sparkle", volume: 0.35 }, { at: 11.6, name: "tada", volume: 0.35 },
];

export const PruebaMascotas: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 24); // 24 fps de "stop-motion suave"
  const T = stateAt(T_SEGS, tq), M = stateAt(M_SEGS, tq);
  const hh = handheld(t, 2.4);
  const zoom = 1.06 + 0.035 * keys(t, [[0, 0], [2.0, 0.2], [3.2, 1], [4.3, 0.2], [5.4, 0], [8.5, 0.8], [10.8, 1], [12, 1]]);
  return (
    <AbsoluteFill style={{ background: "#123C40" }}>
      <AbsoluteFill style={{ transform: `translate(${hh.x}px, ${hh.y}px) scale(${zoom})`, transformOrigin: "540px 1300px" }}>
        <RoomBg floorBrightness={0.95} />
        <div style={{ position: "absolute", left: 40, top: 1370, width: 1000, height: 250, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 45%, #D98B6B 0%, #C9735A 68%, #B05F4A 100%)", boxShadow: "0 12px 30px rgba(0,0,0,.35), inset 0 0 0 8px rgba(255,235,210,.35)" }} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <Shadow st={M} k={KM} floor={FLOOR_M} />
          <Shadow st={T} k={KT} floor={FLOOR_T} />
        </svg>
        <Sprite st={M} k={KM} floor={FLOOR_M} />
        <Sprite st={T} k={KT} floor={FLOOR_T} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <Mark t={t} a={2.05} b={2.9} x={560} y={700} ch="!" />
          <Mark t={t} a={3.05} b={4.2} x={560} y={720} ch="?" color="#F2705B" />
          <Mark t={t} a={4.4} b={5.2} x={560} y={780} ch="♪" color="#F3E7C9" />
          <Mark t={t} a={8.7} b={9.5} x={560} y={640} ch="¡!" />
          <Hearts t={t} start={10.75} dur={1.4} x={570} y={1000} rise={300} n={5} size={1.1} />
        </svg>
        <Dust t={t} opacity={0.3} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.1} />
      <MusicTrack src="audio/music/casita.wav" base={0.3} totalSec={PRUEBA_MASCOTAS_SECONDS} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
