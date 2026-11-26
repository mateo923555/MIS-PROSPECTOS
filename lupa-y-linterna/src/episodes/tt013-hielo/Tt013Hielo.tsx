import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, W } from "../../shared/theme";
import { hash, keys, stepTime } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData } from "../../shared/voice";
import { BRAND, Chip, DOG_FOOT, DOG_H, DOG_X, M, Mark, REF_M, REF_T, Sprite, Stage, TABLE_Y, TE, camAt, camTransform, duckOverSpeech, ease, hopArc, makeVoice, mouth, type Shot } from "../../shared/PetKit";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const V = makeVoice(voice);
export const TT013_SECONDS = Math.ceil((V.lastEnd + 1.0) * 10) / 10;
const { seg, word, speaking } = V;
const s1 = seg("s1"), s2 = seg("s2"), s3 = seg("s3"), s4 = seg("s4"), s5 = seg("s5"), s6 = seg("s6"), s7 = seg("s7"), s8 = seg("s8");

// ── línea de tiempo anclada a la voz ──
const SP_IN = s2.voiceStart + 0.25, PUSH0 = s2.voiceEnd + 0.1, PUSH1 = s3.voiceStart - 0.15, RELEASE = s3.voiceEnd + 0.12;
const T_LIVIANO = word("s6", "liviano").start, T_ADENTRO = word("s7", "adentro").start, T_ASOMA = word("s7", "asoma").start;
const BAL_IN = s6.voiceStart - 0.25, BAL_OUT = s7.voiceEnd + 0.1;

// ── vaso, agua, hielo ──
const G = { x0: 385, x1: 695, top: 335, bottom: TABLE_Y - 8 }, LEVEL = 470, CUBE = 150, CX = 540;
const Y_FLOAT = LEVEL - 0.1 * CUBE, Y_DOWN = G.bottom - 14 - CUBE; // arriba del cubo flotando (10% afuera) / en el fondo
const cubeTop = (t: number) => {
  if (t < PUSH0) return Y_FLOAT + Math.sin(t * 2.3) * 1.5;
  if (t < PUSH1) return Y_FLOAT + (Y_DOWN - Y_FLOAT) * ease((t - PUSH0) / (PUSH1 - PUSH0));
  if (t < RELEASE) return Y_DOWN;
  const u = t - RELEASE;
  if (u < 0.65) return Y_DOWN + (Y_FLOAT - 46 - Y_DOWN) * ease(u / 0.65); // sube y asoma de golpe
  return Y_FLOAT - 46 * Math.exp(-3.2 * (u - 0.65)) * Math.cos(11 * (u - 0.65)) + Math.sin(t * 2.3) * 1.2; // se asienta flotando
};
const spoonO = (t: number) => (t < SP_IN ? 1 : t < PUSH0 ? 1 - ease((t - SP_IN) / (PUSH0 - SP_IN)) : t < RELEASE ? 0 : ease((t - RELEASE) / 0.9));
const spoonVisible = (t: number) => t >= SP_IN && t < RELEASE + 0.95;

const SHOTS: Shot[] = [{ t: 0, kind: "wide" }, { t: 0.9, kind: "exp" }, { t: PUSH0 - 0.3, kind: "expclose" }, { t: s4.voiceEnd + 0.2, kind: "exp" }, { t: s8.voiceStart - 0.2, kind: "dogs" }];
const SFX: Sfx[] = duckOverSpeech(voice, [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.3, name: "yip", volume: 0.3 },
  { at: PUSH0 + 0.05, name: "tap", volume: 0.45 }, { at: PUSH0 + 0.4, name: "bubbles", volume: 0.4 },
  { at: RELEASE, name: "whoosh", volume: 0.35 }, { at: RELEASE + 0.55, name: "pop", volume: 0.5 }, { at: RELEASE + 0.6, name: "bubbles", volume: 0.4 },
  { at: s4.voiceStart, name: "yip", volume: 0.4 }, { at: T_LIVIANO, name: "ding", volume: 0.4 }, { at: T_ASOMA, name: "sparkle", volume: 0.4 },
  { at: s8.voiceStart + 0.2, name: "heart", volume: 0.4 }, { at: s8.voiceStart, name: "tada", volume: 0.3 },
]);

export const Tt013Hielo: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24);
  const cam = camAt(SHOTS, t);
  const cy0 = cubeTop(tq);
  const sp = spoonO(tq); const spX = CX + 260 * sp, spY = cy0 - 26 - 330 * sp;
  const balIn = ease((t - BAL_IN) / 0.45) * (1 - ease((t - BAL_OUT) / 0.4));
  const tilt = -9 * ease((t - T_LIVIANO + 0.1) / 0.7) * (1 + 0.12 * Math.sin((t - T_LIVIANO) * 9) * Math.exp(-(t - T_LIVIANO) * 1.6));

  // burbujitas al subir
  const bubbles = Array.from({ length: 9 }, (_, i) => { const t0 = RELEASE + 0.05 + i * 0.07, u = (t - t0) / 0.9; return u >= 0 && u < 1 ? { x: CX - 55 + hash(11, i) * 55 + Math.sin(u * 9 + i) * 8, y: Y_DOWN + 40 - u * (Y_DOWN - LEVEL + 60), r: 5 + 5 * ((hash(12, i) + 1) / 2), o: 1 - u } : null; });
  const ripple = (t0: number) => (t >= t0 && t < t0 + 0.8 ? { k: (t - t0) / 0.8 } : null);
  const rip = [ripple(PUSH0 + 0.05), ripple(RELEASE + 0.55)];

  const timoRaw = t < s2.voiceStart - 0.05 ? M.base : t < s3.voiceStart - 0.1 ? M.up : t < s3.voiceEnd + 0.2 ? M.happy : t < s4.voiceEnd + 0.4 ? M.surp : t < s6.voiceStart ? M.curious : t < s8.voiceStart - 0.1 ? M.think : M.happy;
  const timoK = timoRaw === M.base && speaking(t, "timo") ? mouth(t, M.base, M.talk, M.bark) : timoRaw;
  const timoHop = hopArc(t, s3.voiceStart, 0.45, 60) + hopArc(t, s4.voiceStart, 0.4, 70) + hopArc(t, s8.voiceStart + 0.2, 0.45, 50);
  const tereRaw = t < s2.voiceStart - 0.1 ? TE.look : t < s2.voiceEnd + 0.05 ? TE.base : t < s4.voiceStart - 0.05 ? TE.up : t < s4.voiceEnd + 0.2 ? TE.jump : t < s7.voiceEnd + 0.05 ? TE.base : t < s8.voiceStart - 0.1 ? TE.up : TE.look;
  const tereK = tereRaw === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : Math.floor(t * 10) % 43 === 0 && tereRaw === TE.base ? TE.blink : tereRaw;
  const tereHop = hopArc(t, s4.voiceStart + 0.05, 0.5, 80);
  const brandOp = keys(t, [[TT013_SECONDS - 0.9, 0], [TT013_SECONDS - 0.4, 1]]);

  // balanza: extremos con la inclinación (el agua pesa más → su lado baja)
  const px = CX, py = 215, L = 190, a = (tilt * Math.PI) / 180;
  const lx = px - L * Math.cos(a), ly = py - L * Math.sin(a), rx = px + L * Math.cos(a), ry = py + L * Math.sin(a);
  const CUB = 84;

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
          {/* vaso: fondo + agua */}
          <rect x={G.x0} y={G.top} width={G.x1 - G.x0} height={G.bottom - G.top} rx={34} fill="rgba(225,242,255,0.18)" stroke="#fff" strokeWidth={8} />
          <g clipPath="url(#inside)">
            <rect x={G.x0} y={LEVEL} width={G.x1 - G.x0} height={G.bottom - LEVEL} fill="url(#wat)" />
            <rect x={G.x0} y={LEVEL - 3} width={G.x1 - G.x0} height={6} fill="#fff" opacity={0.7} />
            {/* cubo de hielo */}
            <rect x={CX - CUBE / 2} y={cy0} width={CUBE} height={CUBE} rx={20} fill="url(#ice)" stroke="#fff" strokeWidth={5} opacity={0.96} />
            <rect x={CX - CUBE / 2 + 14} y={cy0 + 14} width={38} height={14} rx={7} fill="#fff" opacity={0.75} />
            <rect x={CX - CUBE / 2 + 14} y={cy0 + 36} width={14} height={34} rx={7} fill="#fff" opacity={0.55} />
            {/* agua por delante (el cubo se ve más azul bajo la superficie) */}
            <rect x={G.x0} y={LEVEL} width={G.x1 - G.x0} height={G.bottom - LEVEL} fill="rgba(110,185,240,0.30)" />
            {bubbles.map((b, i) => b && <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="rgba(255,255,255,0.55)" stroke="#fff" strokeWidth={2} opacity={b.o} />)}
          </g>
          {rip.map((r, i) => r && <ellipse key={i} cx={CX} cy={LEVEL} rx={60 + 110 * r.k} ry={10 + 16 * r.k} fill="none" stroke="#fff" strokeWidth={4} opacity={0.8 * (1 - r.k)} />)}
          <path d={`M${G.x0 + 22} ${G.top + 40} L${G.x0 + 22} ${G.bottom - 70}`} stroke="#fff" strokeWidth={9} strokeLinecap="round" opacity={0.45} />
          {/* en s7: lo que asoma y lo que queda adentro */}
          {t >= T_ADENTRO - 0.1 && t < s7.voiceEnd + 0.3 && <line x1={CX - 130} y1={LEVEL} x2={CX + 130} y2={LEVEL} stroke="#FFE27A" strokeWidth={5} strokeDasharray="14 10" />}
          {t >= T_ADENTRO - 0.05 && t < s7.voiceEnd + 0.3 && <Chip x={CX + 270} y={LEVEL + 80} text="ADENTRO" color="#2F7FB8" w={230} />}
          {t >= T_ASOMA - 0.05 && t < s7.voiceEnd + 0.3 && <><rect x={CX - CUBE / 2 - 4} y={cy0 - 4} width={CUBE + 8} height={LEVEL - cy0 + 6} rx={14} fill="none" stroke="#F2705B" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(t * 9)} /><Chip x={CX + 270} y={LEVEL - 60} text="AFUERA" color="#F2705B" w={230} /></>}
          {/* cuchara */}
          {spoonVisible(tq) && (
            <g>
              <line x1={spX} y1={spY} x2={spX + 250} y2={spY - 560} stroke="#8B5A2B" strokeWidth={26} strokeLinecap="round" />
              <line x1={spX} y1={spY} x2={spX + 250} y2={spY - 560} stroke="#C99158" strokeWidth={16} strokeLinecap="round" />
              <ellipse cx={spX} cy={spY} rx={62} ry={26} fill="#C99158" stroke="#8B5A2B" strokeWidth={7} /><ellipse cx={spX} cy={spY - 3} rx={44} ry={16} fill="#E0B27C" />
            </g>
          )}
          {/* balanza: el hielo pesa menos que el mismo tamaño de agua */}
          {balIn > 0.01 && (
            <g opacity={balIn} transform={`translate(0 ${(1 - balIn) * -30})`}>
              <rect x={170} y={70} width={740} height={250} rx={36} fill="rgba(255,255,255,0.20)" stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
              <polygon points={`${px - 36},${py + 110} ${px + 36},${py + 110} ${px},${py + 8}`} fill="#7A5A3A" />
              <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#5A3E22" strokeWidth={14} strokeLinecap="round" />
              <circle cx={px} cy={py} r={14} fill="#F6C945" stroke="#5A3E22" strokeWidth={5} />
              {[[lx, ly, "AGUA", "#7CC4F0", "#2F7FB8"], [rx, ry, "HIELO", "#EAF6FF", "#7DB5D6"]].map(([x, y, label, fill, stroke], i) => (
                <g key={i}>
                  <line x1={x as number} y1={y as number} x2={(x as number) - 48} y2={(y as number) + 52} stroke="#5A3E22" strokeWidth={4} /><line x1={x as number} y1={y as number} x2={(x as number) + 48} y2={(y as number) + 52} stroke="#5A3E22" strokeWidth={4} />
                  <rect x={(x as number) - 62} y={(y as number) + 52} width={124} height={12} rx={6} fill="#5A3E22" />
                  <rect x={(x as number) - CUB / 2} y={(y as number) + 52 - CUB} width={CUB} height={CUB} rx={14} fill={fill as string} stroke={stroke as string} strokeWidth={5} />
                  <text x={x as number} y={(y as number) + 52 - CUB / 2 + 12} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={26} fill="#16424F">{label as string}</text>
                </g>
              ))}
              <Chip x={px} y={104} text="MISMO TAMAÑO" color="#123C40" w={410} />
            </g>
          )}
        </svg>
        <Sprite k={tereK} ref_={REF_T} x={DOG_X.tere} footY={DOG_FOOT.tere + tereHop} h={DOG_H.tere} />
        <Sprite k={timoK} ref_={REF_M} x={DOG_X.timo} footY={DOG_FOOT.timo + timoHop} h={DOG_H.timo} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={s4.voiceStart} b={s4.voiceStart + 1.1} x={DOG_X.timo + 10} y={DOG_FOOT.timo - DOG_H.timo * 1.12} ch="!" />
          <Mark t={t} a={s4.voiceStart + 0.08} b={s4.voiceStart + 1.1} x={DOG_X.tere} y={DOG_FOOT.tere - DOG_H.tere * 1.1} ch="!" color="#F2705B" />
          <Mark t={t} a={s5.voiceStart + 0.5} b={s5.voiceEnd + 0.4} x={DOG_X.tere + 20} y={DOG_FOOT.tere - DOG_H.tere * 1.12} ch="?" color="#F2705B" size={110} />
          <Hearts t={t} start={s8.voiceStart + 0.3} dur={1.4} x={DOG_X.timo + 40} y={DOG_FOOT.timo - DOG_H.timo * 0.95} rise={230} n={5} size={1.1} />
        </svg>
      </AbsoluteFill>
      <Grain />
      {BRAND("Timo y Tere", brandOp)}
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/mar.wav" voice={voice} totalSec={TT013_SECONDS} base={0.2} duckTo={0.09} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
