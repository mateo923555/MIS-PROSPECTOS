import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust, Vignette, handheld } from "../shared/Fx";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { FONT, H, W } from "../shared/theme";
import { keys } from "../shared/motion";
import META from "../shared/petMeta.json";

/** Poses reales (recortadas del Drive de Mateo). El nombre del archivo está en public/art/mascotas/_manifest.json. */
const P = {
  // Teresa
  T_walk: ["teresa/caminata/teresa_caminata_izq_03", "teresa/caminata/teresa_caminata_izq_04", "teresa/caminata/teresa_caminata_izq_02", "teresa/caminata/teresa_caminata_izq_04"],
  T_base: "teresa/base/teresa_base_frente_06", T_baseB: "teresa/base/teresa_base_frente_05", T_blink: "teresa/parpadeo/teresa_parpadeo_frente_02",
  T_up: "teresa/mirada/teresa_mirada_frente_02", T_upB: "teresa/mirada/teresa_mirada_frente_01", T_left: "teresa/mirada/teresa_mirada_izq_02",
  T_jump: "teresa/salto/teresa_salto_frente_01", T_bark: "teresa/habla/teresa_habla_frente_01", T_talk: "teresa/base/teresa_base_frente_02",
  // Timoteo
  M_walkR: ["timoteo/caminata/timoteo_caminata_der_01", "timoteo/caminata/timoteo_caminata_der_02", "timoteo/caminata/timoteo_caminata_der_03", "timoteo/caminata/timoteo_caminata_der_02"],
  M_walkL: ["timoteo/caminata/timoteo_caminata_izq_04", "timoteo/caminata/timoteo_caminata_izq_03", "timoteo/caminata/timoteo_caminata_izq_02", "timoteo/caminata/timoteo_caminata_izq_03"],
  M_base: "timoteo/base/timoteo_base_frente_04", M_talk: "timoteo/base/timoteo_base_frente_01", M_blink: "timoteo/parpadeo/timoteo_parpadeo_frente_02",
  M_up: "timoteo/mirada/timoteo_mirada_frente_02", M_upB: "timoteo/mirada/timoteo_mirada_frente_04", M_surp: "timoteo/emocion/timoteo_emocion_frente_07",
  M_happy: "timoteo/emocion/timoteo_emocion_frente_04", M_laugh: "timoteo/emocion/timoteo_emocion_frente_08", M_jump: "timoteo/salto/timoteo_salto_frente_01",
  M_bark: "timoteo/habla/timoteo_habla_frente_01",
};
const meta = (k: string) => (META as any)[`art/mascotas/${k}.png`] as { w: number; h: number; bottom: number; cx: number };

type Pose = { k: string; x: number; floor: number; scale: number; flip?: boolean; anchor?: "center" | "centroid"; dy?: number; sx?: number; sy?: number; rot?: number };
/** Coloca una pose con los pies (parte más baja) en `floor` y el centro de masa (o del recorte) en `x`. */
const Dog: React.FC<Pose> = ({ k, x, floor, scale, flip, anchor = "center", dy = 0, sx = 1, sy = 1, rot = 0 }) => {
  const m = meta(k);
  const cx = anchor === "centroid" ? m.cx : m.w / 2;
  const left = x - (flip ? m.w - cx : cx) * scale;
  const top = floor - m.bottom * scale + dy;
  return (
    <Img
      src={staticFile(`art/mascotas/${k}.png`)}
      style={{
        position: "absolute", left, top, width: m.w * scale, height: m.h * scale,
        transformOrigin: `${flip ? 100 - (cx / m.w) * 100 : (cx / m.w) * 100}% ${(m.bottom / m.h) * 100}%`,
        transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy})`,
        filter: "drop-shadow(0 8px 10px rgba(30,15,5,0.22))",
      }}
    />
  );
};
const Shadow: React.FC<{ x: number; floor: number; w: number; lift?: number }> = ({ x, floor, w, lift = 0 }) => (
  <div style={{ position: "absolute", left: x - w / 2, top: floor - 16, width: w, height: 34, borderRadius: "50%", background: "rgba(20,10,5,0.36)", filter: "blur(7px)", opacity: Math.max(0.3, 1 - lift / 360), transform: `scaleX(${1 - Math.min(0.35, lift / 700)})` }} />
);

const Stage: React.FC<{ children: React.ReactNode; zoom?: number; pan?: number }> = ({ children, zoom = 1.04, pan = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hh = handheld(t, 2);
  return (
    <AbsoluteFill style={{ background: "#123C40" }}>
      <AbsoluteFill style={{ transform: `translate(${hh.x + pan}px, ${hh.y}px) scale(${zoom})`, transformOrigin: "540px 1300px" }}>
        <RoomBg floorBrightness={0.95} />
        <div style={{ position: "absolute", left: 40, top: 1370, width: 1000, height: 250, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 45%, #D98B6B 0%, #C9735A 68%, #B05F4A 100%)", boxShadow: "0 12px 30px rgba(0,0,0,.35), inset 0 0 0 8px rgba(255,235,210,.35)" }} />
        {children}
        <Dust t={t} opacity={0.28} />
      </AbsoluteFill>
      <Vignette strength={0.5} />
      <Grain opacity={0.1} />
    </AbsoluteFill>
  );
};

// ───────── Prueba A: Teresa camina (6 s) ─────────
export const T_CAMINA_SECONDS = 6.4;
const HOLD = 0.2; // s por pose
export const PruebaCaminaTeresa: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const step = Math.floor(t / HOLD);
  const x = keys(t, [[0, 1500], [T_CAMINA_SECONDS, -450]]);
  const k = P.T_walk[step % 4];
  const bob = -Math.abs(Math.sin((t / (HOLD * 2)) * Math.PI)) * 7;
  const cues: Sfx[] = Array.from({ length: Math.floor(T_CAMINA_SECONDS / HOLD) }, (_, i) => ({ at: i * HOLD + 0.04, name: "pawstep", volume: 0.22 }));
  return (
    <Stage>
      <Shadow x={x} floor={1500} w={760} />
      <Dog k={k} x={x} floor={1500} scale={0.74} anchor="centroid" dy={bob} />
      <MusicTrack src="audio/music/casita.wav" base={0.3} totalSec={T_CAMINA_SECONDS} />
      <SfxTrack cues={cues} />
    </Stage>
  );
};

// ───────── Prueba B: Timoteo camina (derecha e izquierda) ─────────
export const M_CAMINA_SECONDS = 7.4;
export const PruebaCaminaTimoteo: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const right = t < 3.6;
  const step = Math.floor(t / 0.17);
  const x = right ? keys(t, [[0, -380], [3.6, 1450]]) : keys(t, [[3.6, 1450], [M_CAMINA_SECONDS, -380]]);
  const k = (right ? P.M_walkR : P.M_walkL)[step % 4];
  const bob = -Math.abs(Math.sin((t / 0.34) * Math.PI)) * 8;
  const cues: Sfx[] = Array.from({ length: Math.floor(M_CAMINA_SECONDS / 0.17) }, (_, i) => ({ at: i * 0.17 + 0.03, name: "pawstep", volume: 0.2 }));
  return (
    <Stage>
      <Shadow x={x} floor={1480} w={660} />
      <Dog k={k} x={x} floor={1480} scale={0.7} anchor="centroid" dy={bob} />
      <MusicTrack src="audio/music/casita.wav" base={0.3} totalSec={M_CAMINA_SECONDS} />
      <SfxTrack cues={cues} />
    </Stage>
  );
};

// ───────── Prueba C: reaccionan a un descubrimiento (9.5 s) ─────────
export const REACCION_SECONDS = 9.5;
const hopY = (t: number, a: number, d: number, h: number) => (t < a || t > a + d ? 0 : -h * Math.sin(((t - a) / d) * Math.PI));
export const PruebaReaccion: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const XM = 290, XT = 790, FM = 1500, FT = 1510, KM = 0.62, KT = 0.72;
  const breathe = (ph: number) => 1 + 0.008 * Math.sin(t * 2.2 + ph);
  // Timoteo
  let mk = P.M_base; let tk = P.T_base;
  if (t >= 0.85 && t < 1.0) { mk = P.M_blink; }
  if (t >= 1.2 && t < 1.32) { tk = P.T_blink; }
  if (t >= 1.6 && t < 2.7) { mk = P.M_up; tk = P.T_up; }
  if (t >= 2.7 && t < 3.9) { mk = P.M_surp; tk = P.T_upB; }
  if (t >= 3.9 && t < 5.1) { mk = P.M_upB; tk = P.T_left; }
  if (t >= 5.1 && t < 7.2) { mk = P.M_jump; tk = P.T_jump; }
  if (t >= 7.2 && t < 8.2) { mk = P.M_laugh; tk = P.T_baseB; }
  if (t >= 8.2) { mk = P.M_happy; tk = P.T_base; }
  const mDy = hopY(t, 2.7, 0.45, 70) + (t >= 5.1 && t < 7.2 ? -Math.abs(Math.sin(((t - 5.1) / 0.7) * Math.PI)) * 190 : 0);
  const tDy = hopY(t, 2.75, 0.35, 35) + (t >= 5.1 && t < 7.2 ? -Math.abs(Math.sin(((t - 5.25) / 0.78) * Math.PI)) * 150 : 0);
  const mAir = Math.max(0, -mDy), tAir = Math.max(0, -tDy);
  const squashM = (t >= 5.1 && t < 7.2 && mAir < 8) ? 0.93 : 1, squashT = (t >= 5.1 && t < 7.2 && tAir < 8) ? 0.94 : 1;
  const lupaIn = keys(t, [[1.35, -420], [1.75, 300]]);
  const lupaGlow = t >= 1.5 ? 0.55 + 0.25 * Math.sin(t * 5) : 0;
  const cues: Sfx[] = [
    { at: 0.2, name: "sparkle", volume: 0.25 }, { at: 1.45, name: "whoosh", volume: 0.4 }, { at: 1.75, name: "discover", volume: 0.5 }, { at: 2.7, name: "yip", volume: 0.55 }, { at: 2.75, name: "ding", volume: 0.4 },
    { at: 3.95, name: "think", volume: 0.3 }, { at: 5.1, name: "tada", volume: 0.35 }, { at: 5.15, name: "woof", volume: 0.4 }, { at: 5.9, name: "yip", volume: 0.4 }, { at: 6.5, name: "yip", volume: 0.35 },
    { at: 7.3, name: "heart", volume: 0.45 }, { at: 8.4, name: "sparkle", volume: 0.3 },
  ];
  return (
    <Stage zoom={1.0 + 0.04 * keys(t, [[0, 0], [2.6, 0.2], [3.0, 1], [4.2, 0.6], [5.0, 0], [7.4, 0.8], [9.5, 1]])}>
      <Shadow x={XM} floor={FM} w={440} lift={mAir} />
      <Shadow x={XT} floor={FT} w={560} lift={tAir} />
      <Dog k={mk} x={XM} floor={FM} scale={KM} dy={mDy} sy={squashM * breathe(0)} sx={1 + (1 - squashM) * 0.7} />
      <Dog k={tk} x={XT} floor={FT} scale={KT} dy={tDy} sy={squashT * breathe(1.3)} sx={1 + (1 - squashT) * 0.7} />
      {t >= 1.35 && t < 5.2 && (
        <div style={{ position: "absolute", left: 540 - 130, top: lupaIn, width: 260, height: 520, transform: `rotate(${Math.sin(t * 3) * 6}deg)`, filter: "drop-shadow(0 12px 14px rgba(0,0,0,.4))" }}>
          <div style={{ position: "absolute", left: -120, top: -80, width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,235,150,${lupaGlow}) 0%, rgba(255,220,100,0) 65%)` }} />
          <Img src={staticFile("art/generated/lupa.png")} style={{ position: "absolute", left: 0, top: 0, width: 260, height: 520 }} />
        </div>
      )}
      <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
        <Mark t={t} a={2.75} b={3.8} x={XM} y={620} ch="!" />
        <Mark t={t} a={3.95} b={5.0} x={XT} y={600} ch="?" color="#F2705B" />
        <Hearts t={t} start={7.3} dur={1.5} x={545} y={1100} rise={300} n={5} size={1.1} />
      </svg>
      <MusicTrack src="audio/music/casita.wav" base={0.3} totalSec={REACCION_SECONDS} />
      <SfxTrack cues={cues} />
    </Stage>
  );
};
const Mark: React.FC<{ t: number; a: number; b: number; x: number; y: number; ch: string; color?: string }> = ({ t, a, b, x, y, ch, color = "#F6C945" }) => {
  if (t < a || t > b) return null;
  const p = (t - a) / (b - a); const s = Math.min(1, (t - a) / 0.12);
  const sc = (0.4 + 0.75 * Math.sin(s * Math.PI * 0.5)) * (p > 0.85 ? 1 - (p - 0.85) / 0.15 : 1);
  return (
    <text x={x} y={y} fontFamily={FONT} fontWeight={700} fontSize={150} textAnchor="middle" fill={color} stroke="#123C40" strokeWidth={14} paintOrder="stroke"
      transform={`rotate(${Math.sin(p * 9) * 6} ${x} ${y}) translate(${x} ${y}) scale(${sc}) translate(${-x} ${-y})`}>{ch}</text>
  );
};

// ───────── Prueba D: parpadeo y habla (6.4 s) ─────────
export const PARPADEO_SECONDS = 6.4;
export const PruebaParpadeo: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  const blinkM = [0.9, 2.55, 4.4].some((b) => t >= b && t < b + 0.13);
  const blinkT = [1.4, 3.3, 5.2].some((b) => t >= b + 0 && t < b + 0.13);
  // habla de Timoteo (2.0–3.4 y 4.0–5.2): alterna cerrada / media / abierta
  const talkingM = (t >= 2.0 && t < 3.4) || (t >= 4.0 && t < 5.2);
  const phaseM = Math.floor(t * 8) % 3;
  const mk = blinkM ? P.M_blink : talkingM ? [P.M_base, P.M_talk, P.M_bark][phaseM] : P.M_base;
  const talkingT = t >= 3.4 && t < 4.6;
  const phaseT = Math.floor(t * 7) % 3;
  const tk = blinkT ? P.T_blink : talkingT ? [P.T_base, P.T_talk, P.T_bark][phaseT] : P.T_base;
  const cues: Sfx[] = [
    { at: 2.0, name: "woof", volume: 0.4 }, { at: 2.6, name: "yip", volume: 0.4 }, { at: 3.1, name: "woof", volume: 0.35 }, { at: 3.5, name: "woof", volume: 0.45 }, { at: 4.1, name: "yip", volume: 0.4 }, { at: 4.5, name: "woof", volume: 0.35 },
  ];
  return (
    <Stage>
      <Shadow x={290} floor={1500} w={440} />
      <Shadow x={790} floor={1510} w={560} />
      <Dog k={mk} x={290} floor={1500} scale={0.62} />
      <Dog k={tk} x={790} floor={1510} scale={0.72} />
      <MusicTrack src="audio/music/casita.wav" base={0.25} totalSec={PARPADEO_SECONDS} />
      <SfxTrack cues={cues} />
    </Stage>
  );
};
