import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, SAFE, W } from "../../shared/theme";
import { hops, keys, pop, stepTime } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData, VoiceSegment } from "../../shared/voice";
import { CX, D, D_FIT, D_NEAR, D_START, FRAME, LAMP_H, PW, WALL_Y } from "../ep001-sombra/geometry";
import META from "../../shared/petMeta.json";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const lastEnd = Math.max(...voice.segments.map((s) => s.voiceEnd));
/** Termina ~1 s después de la última frase: apenas se resolvió la historia. */
export const TT001V3_SECONDS = Math.ceil((lastEnd + 1.0) * 10) / 10;

// ───────── poses reales (public/art/mascotas/_manifest.json) ─────────
const M = {
  base: "timoteo/base/timoteo_base_frente_04", talk: "timoteo/base/timoteo_base_frente_01", bark: "timoteo/habla/timoteo_habla_frente_01",
  surp: "timoteo/emocion/timoteo_emocion_frente_07", sad: "timoteo/emocion/timoteo_emocion_frente_05", think: "timoteo/mirada/timoteo_mirada_frente_01",
  up: "timoteo/mirada/timoteo_mirada_frente_02", jump: "timoteo/salto/timoteo_salto_frente_01", laugh: "timoteo/emocion/timoteo_emocion_frente_08",
  happy: "timoteo/emocion/timoteo_emocion_frente_04", wave: "timoteo/accion/timoteo_accion_frente_01",
};
const TE = {
  base: "teresa/base/teresa_base_frente_06", talk: "teresa/base/teresa_base_frente_02", bark: "teresa/habla/teresa_habla_frente_01",
  look: "teresa/mirada/teresa_mirada_izq_02", up: "teresa/mirada/teresa_mirada_frente_02", curious: "teresa/mirada/teresa_mirada_frente_01",
  jump: "teresa/salto/teresa_salto_frente_01", blink: "teresa/parpadeo/teresa_parpadeo_frente_02",
};
const meta = (k: string) => (META as any)[`art/mascotas/${k}.png`] as { w: number; h: number; top: number; bottom: number };
const REF_M = meta(M.base), REF_T = meta(TE.base);
const AR = REF_M.w / (REF_M.bottom - REF_M.top); // ancho/alto de la silueta de Timo (para saber si cabe en el marco)

const Sprite: React.FC<{ k: string; ref_: { top: number; bottom: number }; x: number; footY: number; h: number; rot?: number; silhouette?: boolean; blur?: number; opacity?: number; style?: React.CSSProperties }> = ({ k, ref_, x, footY, h, rot = 0, silhouette, blur = 0, opacity = 1, style }) => {
  const m = meta(k); const sc = h / (ref_.bottom - ref_.top);
  return (
    <Img src={staticFile(`art/mascotas/${k}.png`)} style={{
      position: "absolute", left: x - (m.w / 2) * sc, top: footY - m.bottom * sc, width: m.w * sc, height: m.h * sc,
      transformOrigin: `50% ${(m.bottom / m.h) * 100}%`, transform: `rotate(${rot}deg)`,
      filter: silhouette ? `brightness(0) blur(${blur}px)` : "drop-shadow(0 8px 10px rgba(30,15,5,0.22))", opacity, ...style,
    }} />
  );
};

// ───────── anclas desde la voz real ─────────
const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
const ws = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]).start;
const we = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[s.words.length - 1]).end;
const T = {
  s1: seg("s1"), s2: seg("s2"), s3: seg("s3"), s4: seg("s4"), s5: seg("s5"), s6: seg("s6"), s7: seg("s7"), s8: seg("s8"), s9: seg("s9"), s10: seg("s10"),
  acerco: ws(seg("s2"), "acercarte"),
  cerca: ws(seg("s7"), "cerca"), crece: ws(seg("s7"), "crece"), lejos: ws(seg("s7"), "lejos"), achica: ws(seg("s7"), "achica"),
};
const AWAY0 = T.s5.voiceEnd + 0.05; // "¿Y si hacemos lo contrario?" → empieza a alejarse
const AWAY1 = T.s6.voiceEnd + 0.2;
const WAVE0 = T.s9.voiceStart, WAVE1 = T.s9.voiceEnd + 0.15; // Timo saluda
const SHW0 = T.s9.voiceEnd + 0.4, SHW1 = T.s10.voiceEnd + 0.1; // la sombra le devuelve el saludo (con retraso)
const D_DEMO = 2.2;

/** Distancia linterna–Timo: lo ÚNICO que cambia. Linterna y pared fijas. */
const D_KEYS: Array<[number, number]> = [
  [0, D_START], [T.acerco + 0.1, D_START], [T.s3.voiceStart + 0.7, D_NEAR], [AWAY0, D_NEAR], [AWAY1, D_FIT],
  [T.cerca - 0.1, D_FIT], [T.crece + 0.2, D_DEMO], [T.lejos - 0.2, D_DEMO], [T.achica - 0.05, D_FIT], [60, D_FIT],
];
const FIT_S = 1.84; // s máximo para que la silueta (alto 300·s) entre en el marco
const dAt = (t: number) => keys(t, D_KEYS);

const speaking = (t: number, who: "timo" | "tere") => voice.segments.some((s) => (s as any).speaker === who && t >= s.voiceStart - 0.03 && t <= s.voiceEnd + 0.05);
const mouth = (t: number, a: string, b: string, c: string) => [a, b, c, b][Math.floor(t * 9) % 4];

const timoPoseRaw = (t: number) => {
  if (t < 1.2) return M.surp; // gancho: susto con la sombra gigante
  if (t < T.acerco - 0.2) return M.sad; // preocupación tierna
  if (t < T.s3.voiceStart - 0.4) return M.base; // camina hacia la luz
  if (t < T.s4.voiceEnd) return M.surp; // "¡Crece y crece!"
  if (t < AWAY0) return M.think; // se pregunta: ¿lo contrario?
  if (t < AWAY1 - 0.35) return M.up; // se aleja mirando su sombra
  if (t < AWAY1 + 0.7) return M.jump; // ¡entra!
  if (t < T.cerca - 0.2) return M.happy;
  if (t >= T.crece - 0.1 && t < T.lejos - 0.4) return M.surp;
  if (t < T.s8.voiceStart - 0.1) return M.up;
  if (t < WAVE0 - 0.05) return M.happy; // agradece
  if (t < WAVE1) return M.wave; // saluda
  if (t < SHW0) return M.base; // espera un instante…
  if (t < T.s10.voiceStart + 0.9) return M.surp; // ¡la sombra saluda!
  return M.laugh;
};
const terePoseRaw = (t: number) => {
  if (t < T.s2.voiceStart - 0.1) return TE.look; // mira a Timo: preocupada
  if (t < T.s2.voiceEnd + 0.05) return TE.base; // habla (boca)
  if (t < T.s4.voiceStart) return TE.up; // mira la sombra que crece
  if (t < T.s4.voiceEnd + 0.1) return TE.base; // "¡Uy! ¡Qué grande!"
  if (t < T.s5.voiceStart - 0.1) return TE.look;
  if (t < T.s5.voiceEnd + 0.05) return TE.base; // idea: "¿y si hacemos lo contrario?"
  if (t < AWAY1 - 0.2) return TE.curious; // observa
  if (t < AWAY1 + 0.9) return TE.jump; // ¡entró!
  if (t < T.s7.voiceEnd + 0.05) return TE.base; // explica
  if (t < SHW0) return TE.look;
  if (t < T.s10.voiceStart + 1.2) return TE.up; // ve que la sombra saluda
  return TE.bark; // risita
};

// ───────── cámara: varía los planos con la historia ─────────
type St = { timoX: number; footY: number; timoH: number };
type Shot = { t: number; kind: "wide" | "timo" | "two" | "tere" | "frame" | "med" | "thanks" };
const SHOTS: Shot[] = [
  { t: 0, kind: "wide" }, { t: 1.25, kind: "timo" }, { t: T.s2.voiceStart - 0.1, kind: "two" },
  { t: T.acerco - 0.1, kind: "wide" }, { t: T.s3.voiceStart + 1.0, kind: "timo" }, { t: T.s4.voiceStart - 0.05, kind: "tere" },
  { t: T.s4.voiceEnd + 0.15, kind: "two" }, { t: T.s5.voiceStart - 0.05, kind: "tere" }, { t: AWAY0 + 0.1, kind: "wide" },
  { t: AWAY1 - 0.6, kind: "frame" }, { t: T.s7.voiceStart - 0.15, kind: "wide" }, { t: T.s8.voiceStart - 0.1, kind: "thanks" },
  { t: WAVE0 - 0.1, kind: "med" }, { t: T.s10.voiceStart + 1.0, kind: "timo" },
];
const target = (k: Shot["kind"], st: St) => {
  switch (k) {
    case "wide": return { s: 1.0, cx: 540, cy: 960 };
    case "timo": return { s: 1.5, cx: st.timoX, cy: st.footY - st.timoH * 0.62 };
    case "two": return { s: 1.12, cx: 700, cy: 1060 };
    case "tere": return { s: 1.55, cx: 880, cy: 1070 };
    case "frame": return { s: 1.3, cx: 540, cy: 620 };
    case "med": return { s: 1.18, cx: 540, cy: 800 };
    case "thanks": return { s: 1.3, cx: (st.timoX + 905) / 2, cy: 1090 };
  }
};
const ease = (p: number) => p * p * (3 - 2 * p);
const camAt = (t: number, st: St) => {
  let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1].t) i++;
  const cur = target(SHOTS[i].kind, st);
  let out = cur;
  const dt = t - SHOTS[i].t;
  if (i > 0 && dt < 0.45) {
    const prev = target(SHOTS[i - 1].kind, st); const p = ease(dt / 0.45);
    out = { s: prev.s + (cur.s - prev.s) * p, cx: prev.cx + (cur.cx - prev.cx) * p, cy: prev.cy + (cur.cy - prev.cy) * p };
  }
  const lim = (c: number, size: number) => Math.min(size - size / (2 * out.s) - 1, Math.max(size / (2 * out.s) + 1, c));
  return { scale: out.s, cx: lim(out.cx, W), cy: lim(out.cy, H) };
};

const LAMP_X = 270, LAMP_Y = 1265;
const XL = (LAMP_X - CX) / 520;
const stateAt = (tq: number): St => {
  const d = dAt(tq); const k = (D - d) / D;
  const footY = WALL_Y + (LAMP_Y - WALL_Y) * k; const timoH = 300 + 220 * k;
  return { footY, timoH, timoX: CX + XL * (1 - d / D) * timoH };
};

// pasos (sonido) mientras se mueve
const stepCues = (): Sfx[] => {
  const cues: Sfx[] = []; let last = -1;
  for (let t = 0.3; t < 40; t += 0.05) {
    const mv = Math.abs(dAt(t) - dAt(t - 0.1)) > 0.004;
    if (mv && t - last > 0.3) { cues.push({ at: t, name: "pawstep", volume: 0.3 }); last = t; }
  }
  return cues;
};
const FIT_T = (() => { for (let t = AWAY0; t < AWAY1 + 3; t += 0.02) if (D / dAt(t) <= FIT_S) return t; return AWAY1; })();
const SFX: Sfx[] = [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.2, name: "yip", volume: 0.35 }, ...stepCues(),
  { at: T.s3.voiceStart + 0.6, name: "whoosh", volume: 0.3 }, { at: T.s4.voiceStart, name: "yip", volume: 0.35 },
  { at: T.s5.voiceStart - 0.1, name: "think", volume: 0.35 },
  { at: FIT_T, name: "sparkle", volume: 0.45 }, { at: FIT_T + 0.1, name: "tada", volume: 0.35 },
  { at: T.s8.voiceStart + 0.2, name: "heart", volume: 0.4 }, { at: WAVE0 + 0.2, name: "pop", volume: 0.3 },
  { at: SHW0 + 0.1, name: "discover", volume: 0.5 }, { at: SHW0 + 0.15, name: "sparkle", volume: 0.4 }, { at: T.s10.voiceStart + 1.0, name: "heart", volume: 0.4 },
];

export const Tt001v3Sombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24); const step = Math.floor(tq * 12);
  const st = stateAt(tq); const { footY, timoH, timoX } = st;
  const d = dAt(tq); const moving = Math.abs(d - dAt(Math.max(0, tq - 0.1))) > 0.004;
  const hop = hops(tq, AWAY1 - 0.3, 2, 0.4, 70);
  const bob = (moving ? Math.abs(Math.sin(step * 1.1)) * 14 : 0) + hop;
  const rawM = timoPoseRaw(tq);
  const wave = rawM === M.wave ? Math.sin(tq * 16) * 6 : 0;
  const sway = moving ? (step % 2 ? 2.5 : -2.5) : Math.sin(tq * 2.2) * 1.2;
  const waveAlt = (x: number) => Math.floor(x * 5) % 2 === 0; // la patita sube y baja al saludar
  const pose = rawM === M.wave ? (waveAlt(tq) ? M.wave : M.happy) : rawM === M.base && speaking(tq, "timo") ? mouth(tq, M.base, M.talk, M.bark) : rawM;
  const rawT = terePoseRaw(tq);
  const tereJump = (tq >= AWAY1 - 0.2 && tq < AWAY1 + 0.9 ? -Math.abs(Math.sin(((tq - AWAY1 + 0.2) / 0.5) * Math.PI)) * 80 : 0) + (tq >= T.s4.voiceStart && tq < T.s4.voiceStart + 0.35 ? -Math.sin(((tq - T.s4.voiceStart) / 0.35) * Math.PI) * 35 : 0) + (tq >= T.s10.voiceStart + 1.0 && tq < T.s10.voiceStart + 1.5 ? -Math.abs(Math.sin(((tq - T.s10.voiceStart - 1.0) / 0.25) * Math.PI)) * 30 : 0);
  const tereK = rawT === TE.base && speaking(tq, "tere") ? mouth(tq, TE.base, TE.talk, TE.bark) : Math.floor(tq * 10) % 41 === 0 && rawT === TE.base ? TE.blink : rawT;

  // ── sombra (misma pose y movimiento que Timo; al final saluda con retraso) ──
  const s = D / d; const shH = s * PW;
  const shBounce = tq >= SHW0 && tq < SHW1 ? Math.abs(Math.sin((tq - SHW0) * 7)) * 22 : 0; // la sombra rebota contenta al saludar
  const shBottomY = WALL_Y + LAMP_H * (s - 1) * PW - s * (hop / timoH) * PW - shBounce;
  const shBlur = 3 + (s - 1) * 2.4;
  const shWaving = tq >= SHW0 && tq < SHW1;
  const shPose = shWaving ? (waveAlt(tq - SHW0) ? M.wave : M.happy) : rawM === M.wave ? M.happy : rawM === M.jump ? M.jump : pose === M.talk || pose === M.bark ? M.base : pose;
  const shRot = (shWaving ? Math.sin((tq - SHW0) * 14) * 7 : 0) + sway * 0.4;
  const shW = AR * shH, shTop = shBottomY - shH;
  const overflowTop = shTop < FRAME.y0 - 4, overflowSide = shW > FRAME.x1 - FRAME.x0 + 4;
  const overflow = (overflowTop || overflowSide) && s > FIT_S - 0.01;
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);
  const fitGlow = keys(t, [[FIT_T - 0.2, 0], [FIT_T + 0.3, 1], [T.cerca - 0.1, 0.6]]);
  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const fx = FRAME.x0, fw = FRAME.x1 - FRAME.x0, fy = FRAME.y0, fh = FRAME.y1 - FRAME.y0;
  const frameCol = overflow ? C.coral : "#7BD88F";
  const glow = overflow ? 0.35 + 0.45 * pulse : 0.35 + 0.5 * fitGlow;
  const brandOp = keys(t, [[TT001V3_SECONDS - 0.9, 0], [TT001V3_SECONDS - 0.4, 1]]);
  const cam = camAt(t, st);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${cam.scale}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  // etiquetas cerca / lejos durante la explicación
  const chip = t >= T.cerca - 0.05 && t < T.lejos - 0.35 ? "CERCA" : t >= T.lejos - 0.05 && t < T.s7.voiceEnd + 0.6 ? "LEJOS" : null;
  const midX = (LAMP_X + timoX) / 2, midY = (LAMP_Y + footY) / 2 - 24;

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: 1360 }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: WALL_Y, width: W, height: H - WALL_Y, overflow: "hidden", filter: "brightness(0.78) saturate(0.85) hue-rotate(-8deg)" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: -1494, width: W, height: 2646 }} />
        </div>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34" /></filter>
            <mask id="beamHole"><rect width={W} height={H} fill="white" /><g filter="url(#soft)" fill="black"><ellipse cx={CX} cy={400} rx={600} ry={470} /><polygon points={`${LAMP_X + 60},${LAMP_Y - 270} ${LAMP_X + 170},${LAMP_Y - 250} ${W + 160},${WALL_Y - 40} ${-60},${WALL_Y - 40}`} /></g></mask>
            <radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE9A8" stopOpacity="0.75" /><stop offset="1" stopColor="#FFD36B" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={W} height={H} fill="#06151C" opacity={0.66} mask="url(#beamHole)" />
          <g filter="url(#soft)" opacity={0.42 * lampGlow} style={{ mixBlendMode: "screen" }}>
            <ellipse cx={CX} cy={400} rx={520} ry={400} fill="url(#warm)" />
            <polygon points={`${LAMP_X + 80},${LAMP_Y - 270} ${LAMP_X + 160},${LAMP_Y - 255} ${W},${WALL_Y} ${0},${WALL_Y}`} fill="#FFDD88" opacity={0.55} />
          </g>
        </svg>
        {/* interior del marco (objetivo) */}
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, background: overflow ? "rgba(255,238,180,0.20)" : "rgba(160,255,190,0.22)", borderRadius: "30px 30px 0 0" }} />
        {/* SOMBRA en la pared */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Sprite k={shPose} ref_={REF_M} x={CX} footY={shBottomY} h={shH} rot={shRot} silhouette blur={shBlur} opacity={0.82} style={{ mixBlendMode: "multiply" }} />
        </div>
        {/* marco (rojo = no entra · verde = entra) */}
        <div style={{ position: "absolute", left: fx - 26, top: fy - 26, width: fw + 52, height: fh + 26, boxSizing: "border-box", border: `26px solid ${frameCol}`, borderBottom: "none", borderRadius: "56px 56px 0 0", boxShadow: `0 0 ${24 + 40 * glow}px ${6 + 14 * glow}px ${overflow ? "rgba(242,112,91" : "rgba(123,216,143"},${0.25 + 0.5 * glow}), inset 0 0 0 5px rgba(255,255,255,0.35)`, pointerEvents: "none" }} />
        {/* flechas: dónde se sale la sombra */}
        {overflow && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} opacity={0.55 + 0.45 * pulse}>
            {overflowTop && [fx + fw * 0.2, fx + fw * 0.8].map((ax, i) => <polygon key={`t${i}`} points={`${ax - 26},${fy - 52} ${ax + 26},${fy - 52} ${ax},${fy - 100}`} fill="#FF4D3D" stroke="#fff" strokeWidth={5} />)}
            {overflowSide && <><polygon points={`${fx - 56},${fy + fh * 0.35 - 26} ${fx - 56},${fy + fh * 0.35 + 26} ${fx - 104},${fy + fh * 0.35}`} fill="#FF4D3D" stroke="#fff" strokeWidth={5} /><polygon points={`${fx + fw + 56},${fy + fh * 0.35 - 26} ${fx + fw + 56},${fy + fh * 0.35 + 26} ${fx + fw + 104},${fy + fh * 0.35}`} fill="#FF4D3D" stroke="#fff" strokeWidth={5} /></>}
          </svg>
        )}
        {/* estrellitas al entrar */}
        {t > FIT_T && t < FIT_T + 2 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            {[[-1, -1], [1, -1], [0, -1.35], [-1.25, 0.2], [1.25, 0.2]].map(([ox, oy], i) => {
              const sc = pop(t, FIT_T + 0.05 + i * 0.07, 0.35) * (1 - keys(t, [[FIT_T + 1.4, 0], [FIT_T + 2.0, 1]]));
              return <text key={i} x={CX + ox * 230} y={fy + 80 + (oy + 1) * 120} fontSize={70 * sc} textAnchor="middle" fill={C.warmYellow} fontFamily={FONT}>★</text>;
            })}
          </svg>
        )}
        {/* Tere */}
        <div style={{ position: "absolute", left: 790, top: 1285, width: 250, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.4)", filter: "blur(10px)", opacity: Math.max(0.3, 1 + tereJump / 160) }} />
        <Sprite k={tereK} ref_={REF_T} x={905} footY={1300} h={390} style={{ transform: `translateY(${tereJump}px)` }} />
        {/* distancia linterna–Timo (en el piso) */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <line x1={LAMP_X + 40} y1={LAMP_Y - 8} x2={timoX} y2={footY - 6} stroke="#FFE27A" strokeWidth={9} strokeDasharray="4 22" strokeLinecap="round" opacity={0.85} />
          <circle cx={timoX} cy={footY - 6} r={11} fill="#FFE27A" opacity={0.9} />
        </svg>
        {/* Timo */}
        <div style={{ position: "absolute", left: timoX - timoH * 0.3, top: footY - timoH * 0.04, width: timoH * 0.6, height: timoH * 0.12, borderRadius: "50%", background: "rgba(0,0,0,0.38)", filter: "blur(10px)", opacity: Math.max(0.3, 1 - bob / 160) }} />
        <Sprite k={pose} ref_={REF_M} x={timoX} footY={footY - bob} h={timoH} rot={sway + wave} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Hearts t={t} start={T.s8.voiceStart + 0.1} dur={1.5} x={timoX + 70} y={footY - timoH * 0.9} rise={230} n={4} />
          <Hearts t={t} start={T.s10.voiceStart + 0.9} dur={1.4} x={timoX + 40} y={footY - timoH * 0.9} rise={220} n={5} size={1.15} color="#F6C945" />
        </svg>
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}><Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} /></div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          {chip && (
            <g transform={`translate(${midX + 110} ${midY - 70}) scale(${0.9 + 0.1 * pop(t, chip === "CERCA" ? T.cerca : T.lejos, 0.25)})`}>
              <rect x={-100} y={-38} width={200} height={76} rx={38} fill={chip === "CERCA" ? "#F2705B" : "#2F9E6B"} stroke="#fff" strokeWidth={6} />
              <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={48} fill="#fff">{chip}</text>
            </g>
          )}
        </svg>
      </AbsoluteFill>
      <Grain />
      <div style={{ position: "absolute", top: SAFE.subtitleY, height: SAFE.subtitleH, left: 0, width: W - SAFE.right, display: "flex", alignItems: "center", justifyContent: "center", opacity: brandOp }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.cream, background: "rgba(18,60,64,0.8)", padding: "8px 30px 12px", borderRadius: 40 }}>Timo y Tere</div>
      </div>
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/linterna.wav" voice={voice} totalSec={TT001V3_SECONDS} base={0.2} duckTo={0.09} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
