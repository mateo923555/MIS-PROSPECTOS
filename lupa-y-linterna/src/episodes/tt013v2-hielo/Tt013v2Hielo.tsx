import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, W } from "../../shared/theme";
import { hash, keys, stepTime } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData } from "../../shared/voice";
import { BRAND, Cable, LoopMusic, Chip, DOG_FOOT, DOG_H, DOG_X, M, Mark, PUSH_M, PushButton, REF_M, REF_T, Sprite, Stage, TABLE_Y, TE, camAt, camTransform, duckOverSpeech, ease, hopArc, makeVoice, mouth, pawPoint, pressAmt, type Shot } from "../../shared/PetKit";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const V = makeVoice(voice);
export const TT013V2_SECONDS = Math.ceil((V.lastEnd + 1.0) * 10) / 10;
const { seg, word, speaking } = V;
const S = Object.fromEntries(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"].map((k) => [k, seg(k)])) as Record<string, ReturnType<typeof seg>>;

// ── línea de tiempo anclada a la voz ──
const PUSH_A = S.s2.voiceEnd + 0.15, REL = S.s3.voiceEnd + 0.15; // Timo aprieta el botón y lo suelta
const T_MISMO = word("s7", "mismo").start, T_CONGEL = word("s8", "congelarse").start, T_ADENTRO = word("s9", "adentro").start, T_ASOMA = word("s9", "asoma").start;
const BAL_IN = S.s7.voiceStart - 0.3, BAL_OUT = S.s8.voiceStart - 0.25, JAR_IN = S.s8.voiceStart - 0.2, JAR_OUT = S.s9.voiceStart - 0.2;

// ── vaso, agua, hielo ──
const G = { x0: 385, x1: 695, top: 335, bottom: TABLE_Y - 8 }, LEVEL = 470, CUBE = 150, CX = 540;
const Y_FLOAT = LEVEL - 0.1 * CUBE; // flotando: ~10 % afuera, ~90 % adentro
const Y_DOWN = G.bottom - 14 - CUBE;
const PRESS_END = PUSH_A + 0.75;
const cubeTop = (t: number) => {
  if (t < PUSH_A) return Y_FLOAT + Math.sin(t * 2.3) * 1.5;
  if (t < PRESS_END) return Y_FLOAT + (Y_DOWN - Y_FLOAT) * ease((t - PUSH_A) / 0.75);
  if (t < REL) return Y_DOWN;
  const u = t - REL;
  if (u < 0.65) return Y_DOWN + (Y_FLOAT - 46 - Y_DOWN) * ease(u / 0.65);
  return Y_FLOAT - 46 * Math.exp(-3.2 * (u - 0.65)) * Math.cos(11 * (u - 0.65)) + Math.sin(t * 2.3) * 1.2;
};

// ── botón: lo aprietan las patas de Timo ──
const TIMO_X = 235;
const PAW = pawPoint(PUSH_M, REF_M, TIMO_X, DOG_FOOT.timo, DOG_H.timo, 0.97, 0.4);
const BTN = { x: PAW.x + 36, y: PAW.y + 6, floor: DOG_FOOT.timo };
const SHOTS: Shot[] = [{ t: 0, kind: "wide" }, { t: 0.8, kind: "exp" }, { t: S.s7.voiceStart - 0.3, kind: "exp" }, { t: S.s10.voiceStart - 0.25, kind: "dogs" }];
const SFX: Sfx[] = duckOverSpeech(voice, [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.3, name: "yip", volume: 0.3 },
  { at: PUSH_A, name: "click", volume: 0.5 }, { at: PUSH_A + 0.1, name: "bubbles", volume: 0.4 }, { at: REL, name: "click", volume: 0.4 },
  { at: REL + 0.15, name: "whoosh", volume: 0.35 }, { at: REL + 0.6, name: "pop", volume: 0.5 }, { at: REL + 0.65, name: "bubbles", volume: 0.4 },
  { at: S.s4.voiceStart, name: "yip", volume: 0.4 }, { at: S.s6.voiceStart, name: "think", volume: 0.3 },
  { at: T_MISMO, name: "ding", volume: 0.4 }, { at: T_CONGEL, name: "sparkle", volume: 0.4 }, { at: T_ASOMA, name: "sparkle", volume: 0.4 },
  { at: S.s10.voiceStart + 0.2, name: "heart", volume: 0.4 }, { at: S.s10.voiceStart, name: "tada", volume: 0.3 },
]);

const Jar: React.FC<{ x: number; y: number; fill: number; mark: number; label: string; color: string; frozen?: boolean }> = ({ x, y, fill, mark, label, color, frozen }) => {
  const w = 120, h = 150; const lvY = y + h - fill * h;
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx={16} fill="rgba(225,242,255,0.18)" stroke="#fff" strokeWidth={5} />
      <rect x={x - w / 2 + 3} y={lvY} width={w - 6} height={y + h - lvY - 3} rx={12} fill={color} opacity={frozen ? 0.95 : 0.85} />
      {frozen && <><rect x={x - 30} y={lvY + 12} width={22} height={9} rx={4} fill="#fff" opacity={0.7} /><rect x={x + 8} y={lvY + 30} width={9} height={26} rx={4} fill="#fff" opacity={0.55} /></>}
      <line x1={x - w / 2 - 14} y1={y + h - mark * h} x2={x + w / 2 + 14} y2={y + h - mark * h} stroke="#FFE27A" strokeWidth={4} strokeDasharray="10 7" />
      <text x={x} y={y + h + 34} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={28} fill="#fff">{label}</text>
    </g>
  );
};

export const Tt013v2Hielo: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24);
  const cam = camAt(SHOTS, t);
  const press = pressAmt(tq, PUSH_A, REL);
  const cy0 = cubeTop(tq);
  const balIn = ease((t - BAL_IN) / 0.45) * (1 - ease((t - BAL_OUT) / 0.35));
  const jarIn = ease((t - JAR_IN) / 0.45) * (1 - ease((t - JAR_OUT) / 0.35));
  const jarGrow = ease((t - T_CONGEL - 0.2) / 1.1);
  const tilt = -9 * ease((t - T_MISMO - 0.2) / 0.7) * (1 + 0.12 * Math.sin((t - T_MISMO) * 9) * Math.exp(-(t - T_MISMO) * 1.6));

  // pistón con cuchara: lo mueve el botón (a través del cable); al soltar, sube
  const retract = ease((t - REL) / 0.35) * 170;
  const headY = Math.min(cy0 - 22, cy0 - 22 - (1 - Math.min(1, press * 6)) * 150) - retract * (t >= REL ? 1 : 0);
  const pistonVisible = t >= PUSH_A - 0.9 && t < REL + 1.0;
  const approach = ease((t - (PUSH_A - 0.9)) / 0.6); // el pistón baja hasta quedar sobre el hielo antes de apretar
  const headShown = pistonVisible ? (t < PUSH_A ? Y_FLOAT - 22 - 170 * (1 - approach) : headY) : -300;

  const bubbles = Array.from({ length: 9 }, (_, i) => { const t0 = REL + 0.05 + i * 0.07, u = (t - t0) / 0.9; return u >= 0 && u < 1 ? { x: CX - 55 + hash(11, i) * 55 + Math.sin(u * 9 + i) * 8, y: Y_DOWN + 40 - u * (Y_DOWN - LEVEL + 60), r: 5 + 5 * ((hash(12, i) + 1) / 2), o: 1 - u } : null; });
  const ripple = (t0: number) => (t >= t0 && t < t0 + 0.8 ? { k: (t - t0) / 0.8 } : null);
  const rip = [ripple(PUSH_A + 0.05), ripple(REL + 0.55)];

  // ── Timo (empuja con las patas) y Tere (se equivoca, se sorprende, explica) ──
  const pushing = t >= PUSH_A - 0.25 && t < REL + 0.05;
  const timoRaw = t < S.s2.voiceStart - 0.05 ? M.base : t < PUSH_A - 0.25 ? M.up : pushing ? PUSH_M : t < S.s5.voiceEnd ? M.surp : t < S.s6.voiceEnd + 0.1 ? M.think : t < S.s10.voiceStart - 0.1 ? M.curious : M.happy;
  const timoK = timoRaw === M.base && speaking(t, "timo") ? mouth(t, M.base, M.talk, M.bark) : timoRaw === M.happy && speaking(t, "timo") ? mouth(t, M.happy, M.laugh, M.happy) : timoRaw;
  const timoHop = hopArc(t, PUSH_A - 0.55, 0.3, 40) + hopArc(t, S.s10.voiceStart + 0.2, 0.45, 55) + hopArc(t, S.s4.voiceStart, 0.35, 45);
  const tereRaw = t < S.s2.voiceStart - 0.1 ? TE.look : t < S.s2.voiceEnd + 0.05 ? TE.base : t < REL + 0.4 ? TE.curious : t < S.s5.voiceStart - 0.05 ? TE.up : t < S.s5.voiceEnd + 0.1 ? TE.jump : t < S.s6.voiceEnd ? TE.up : t < S.s9.voiceEnd + 0.05 ? TE.base : TE.look;
  const tereK = tereRaw === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : Math.floor(t * 10) % 43 === 0 && tereRaw === TE.base ? TE.blink : tereRaw;
  const tereHop = hopArc(t, S.s5.voiceStart + 0.05, 0.5, 75);
  const brandOp = keys(t, [[TT013V2_SECONDS - 0.9, 0], [TT013V2_SECONDS - 0.4, 1]]);

  // balanza con dos recipientes IGUALES
  const px = CX, py = 215, L = 190, a = (tilt * Math.PI) / 180;
  const lx = px - L * Math.cos(a), ly = py - L * Math.sin(a), rx = px + L * Math.cos(a), ry = py + L * Math.sin(a);
  const CUB = 84;
  const Pan: React.FC<{ x: number; y: number; ice: boolean; label: string }> = ({ x, y, ice, label }) => (
    <g>
      <line x1={x} y1={y} x2={x - 48} y2={y + 52} stroke="#5A3E22" strokeWidth={4} /><line x1={x} y1={y} x2={x + 48} y2={y + 52} stroke="#5A3E22" strokeWidth={4} />
      <rect x={x - 62} y={y + 52} width={124} height={12} rx={6} fill="#5A3E22" />
      <rect x={x - CUB / 2} y={y + 52 - CUB} width={CUB} height={CUB} rx={12} fill="rgba(225,242,255,0.28)" stroke="#fff" strokeWidth={5} />
      <rect x={x - CUB / 2 + 4} y={y + 52 - CUB + 4} width={CUB - 8} height={CUB - 8} rx={9} fill={ice ? "#F4FBFF" : "#7CC4F0"} stroke={ice ? "#9ED0EA" : "#2F7FB8"} strokeWidth={3} />
      <text x={x} y={y + 52 - CUB / 2 + 10} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={24} fill="#16424F">{label}</text>
    </g>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
        <Stage />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="wat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9FD6F5" stopOpacity="0.62" /><stop offset="1" stopColor="#5BAEE0" stopOpacity="0.78" /></linearGradient>
            <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CDEBFA" /></linearGradient>
            <clipPath id="inside"><rect x={G.x0 + 8} y={G.top} width={G.x1 - G.x0 - 16} height={G.bottom - G.top - 6} rx={28} /></clipPath>
          </defs>
          <rect x={G.x0} y={G.top} width={G.x1 - G.x0} height={G.bottom - G.top} rx={34} fill="rgba(225,242,255,0.18)" stroke="#fff" strokeWidth={8} />
          <g clipPath="url(#inside)">
            <rect x={G.x0} y={LEVEL} width={G.x1 - G.x0} height={G.bottom - LEVEL} fill="url(#wat)" />
            <rect x={G.x0} y={LEVEL - 3} width={G.x1 - G.x0} height={6} fill="#fff" opacity={0.7} />
            <rect x={CX - CUBE / 2} y={cy0} width={CUBE} height={CUBE} rx={20} fill="url(#ice)" stroke="#fff" strokeWidth={5} opacity={0.96} />
            <rect x={CX - CUBE / 2 + 14} y={cy0 + 14} width={38} height={14} rx={7} fill="#fff" opacity={0.75} />
            <rect x={CX - CUBE / 2 + 14} y={cy0 + 36} width={14} height={34} rx={7} fill="#fff" opacity={0.55} />
            <rect x={G.x0} y={LEVEL} width={G.x1 - G.x0} height={G.bottom - LEVEL} fill="rgba(110,185,240,0.30)" />
            {bubbles.map((b, i) => b && <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="rgba(255,255,255,0.55)" stroke="#fff" strokeWidth={2} opacity={b.o} />)}
          </g>
          {rip.map((r, i) => r && <ellipse key={i} cx={CX} cy={LEVEL} rx={60 + 110 * r.k} ry={10 + 16 * r.k} fill="none" stroke="#fff" strokeWidth={4} opacity={0.8 * (1 - r.k)} />)}
          <path d={`M${G.x0 + 22} ${G.top + 40} L${G.x0 + 22} ${G.bottom - 70}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.45} />
          {t >= T_ADENTRO - 0.1 && t < S.s9.voiceEnd + 0.3 && <line x1={CX - 130} y1={LEVEL} x2={CX + 130} y2={LEVEL} stroke="#FFE27A" strokeWidth={5} strokeDasharray="14 10" />}
          {t >= T_ADENTRO - 0.05 && t < S.s9.voiceEnd + 0.3 && <Chip x={CX + 270} y={LEVEL + 80} text="ADENTRO" color="#2F7FB8" w={230} />}
          {t >= T_ASOMA - 0.05 && t < S.s9.voiceEnd + 0.3 && <><rect x={CX - CUBE / 2 - 4} y={cy0 - 4} width={CUBE + 8} height={LEVEL - cy0 + 6} rx={14} fill="none" stroke="#F2705B" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(t * 9)} /><Chip x={CX + 270} y={LEVEL - 60} text="AFUERA" color="#F2705B" w={230} /></>}
          {/* pistón con cuchara (lo mueve el botón) */}
          {headShown > -200 && (
            <g>
              <line x1={CX} y1={headShown} x2={CX} y2={headShown - 520} stroke="#7E8794" strokeWidth={22} strokeLinecap="round" /><line x1={CX} y1={headShown} x2={CX} y2={headShown - 520} stroke="#C3CAD6" strokeWidth={11} strokeLinecap="round" />
              <ellipse cx={CX} cy={headShown} rx={74} ry={22} fill="#C99158" stroke="#8B5A2B" strokeWidth={7} /><ellipse cx={CX} cy={headShown - 3} rx={54} ry={13} fill="#E0B27C" />
            </g>
          )}
          {/* cable del botón al pistón */}
          <Cable pts={[[BTN.x, BTN.y - 62], [BTN.x, 250], [CX, 250], [CX, 130]]} t={t} t0={PUSH_A} />
          <PushButton x={BTN.x} y={BTN.y} floorY={BTN.floor} press={press} color="#E53935" label="BAJAR" />
          {t >= 0.9 && t < PUSH_A + 0.3 && <Chip x={BTN.x + 20} y={BTN.y - 120} text="BOTÓN" color="#E53935" w={170} fs={34} />}
          {/* balanza: dos recipientes iguales, mismo tamaño */}
          {balIn > 0.01 && (
            <g opacity={balIn} transform={`translate(0 ${(1 - balIn) * -30})`}>
              <rect x={170} y={70} width={740} height={250} rx={36} fill="rgba(14,52,58,0.88)" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
              <polygon points={`${px - 36},${py + 110} ${px + 36},${py + 110} ${px},${py + 8}`} fill="#7A5A3A" />
              <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#5A3E22" strokeWidth={14} strokeLinecap="round" />
              <circle cx={px} cy={py} r={14} fill="#F6C945" stroke="#5A3E22" strokeWidth={5} />
              <Pan x={lx} y={ly} ice={false} label="AGUA" /><Pan x={rx} y={ry} ice label="HIELO" />
              <Chip x={px} y={104} text="MISMO TAMAÑO" color="#123C40" w={410} />
            </g>
          )}
          {/* frasquitos: al congelarse, el agua ocupa más lugar */}
          {jarIn > 0.01 && (
            <g opacity={jarIn} transform={`translate(0 ${(1 - jarIn) * -30})`}>
              <rect x={170} y={70} width={740} height={250} rx={36} fill="rgba(14,52,58,0.88)" stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
              <Jar x={330} y={128} fill={0.62} mark={0.62} label="AGUA" color="#7CC4F0" />
              <Jar x={750} y={128} fill={0.62 + 0.15 * jarGrow} mark={0.62} label="CONGELADA" color="#F4FBFF" frozen />
              <text x={540} y={215} textAnchor="middle" fontSize={60} fill="#fff">❄</text>
              <Chip x={540} y={98} text="OCUPA MÁS LUGAR" color="#2F7FB8" w={400} fs={36} />
            </g>
          )}
        </svg>
        <Sprite k={tereK} ref_={REF_T} x={DOG_X.tere} footY={DOG_FOOT.tere + tereHop} h={DOG_H.tere} />
        <Sprite k={timoK} ref_={REF_M} x={TIMO_X} footY={DOG_FOOT.timo + timoHop} h={DOG_H.timo} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={S.s4.voiceStart} b={S.s4.voiceStart + 1.1} x={TIMO_X + 10} y={DOG_FOOT.timo - DOG_H.timo * 1.12} ch="!" />
          <Mark t={t} a={S.s5.voiceStart + 0.05} b={S.s5.voiceStart + 1.2} x={DOG_X.tere} y={DOG_FOOT.tere - DOG_H.tere * 1.1} ch="!" color="#F2705B" />
          <Mark t={t} a={S.s6.voiceStart} b={S.s6.voiceEnd + 0.3} x={TIMO_X + 10} y={DOG_FOOT.timo - DOG_H.timo * 1.12} ch="?" color="#F6C945" size={110} />
          <Hearts t={t} start={S.s10.voiceStart + 0.3} dur={1.4} x={TIMO_X + 40} y={DOG_FOOT.timo - DOG_H.timo * 0.95} rise={230} n={5} size={1.1} />
        </svg>
      </AbsoluteFill>
      <Grain />
      {BRAND("Timo y Tere", brandOp)}
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <LoopMusic src="audio/music/mar.wav" voice={voice} totalSec={TT013V2_SECONDS} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
