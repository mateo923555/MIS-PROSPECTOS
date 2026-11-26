import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, H, W } from "../../shared/theme";
import { hash, keys, stepTime } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData } from "../../shared/voice";
import { BRAND, Chip, DOG_FOOT, DOG_H, DOG_X, M, Mark, REF_M, REF_T, Sprite, Stage, TE, camAt, camTransform, duckOverSpeech, ease, hopArc, makeVoice, mouth, type Shot } from "../../shared/PetKit";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const V = makeVoice(voice);
export const TT010_SECONDS = Math.ceil((V.lastEnd + 1.0) * 10) / 10;
const { seg, word, speaking } = V;
const s1 = seg("s1"), s2 = seg("s2"), s3 = seg("s3"), s4 = seg("s4"), s5 = seg("s5"), s6 = seg("s6"), s7 = seg("s7");

// ── línea de tiempo anclada a la voz ──
const CLEAN_IN = s2.voiceStart + 0.15, CLEAN_TOUCH = s2.voiceEnd + 0.25, CLEAN_OUT0 = CLEAN_TOUCH + 0.55, CLEAN_OUT1 = CLEAN_OUT0 + 0.8;
const SOAP_TOUCH = s5.voiceStart - 0.3, SOAP_IN = Math.min(s4.voiceEnd + 0.2, SOAP_TOUCH - 1.0), SOAP_OUT0 = SOAP_TOUCH + 1.1, SOAP_OUT1 = SOAP_OUT0 + 0.9;
const T_HUNDE = word("s4", "hunde").start, T_ALEJA = word("s4", "aleja").start;

// ── plato con agua y pimienta ──
const PL = { cx: 540, cy: 728, rx: 405, ry: 108 }, WA = { rx: 352, ry: 80 };
const PEPPER = Array.from({ length: 260 }, (_, i) => {
  const r = Math.sqrt((hash(2, i) + 1) / 2) * 0.93, th = (hash(3, i) + 1) * Math.PI;
  return { r, th, rf: 0.8 + 0.17 * ((hash(4, i) + 1) / 2), size: 4 + 2.6 * ((hash(5, i) + 1) / 2), ph: hash(6, i) * 6 };
});
const TIP_START = { x: 720, y: 200 }, TIP_TOUCH = { x: 540, y: 718 };
const stickTip = (t: number, tin: number, tt: number, t0: number, t1: number) => {
  if (t < tin || t > t1) return null;
  const L = (p: number) => ({ x: TIP_START.x + (TIP_TOUCH.x - TIP_START.x) * p, y: TIP_START.y + (TIP_TOUCH.y - TIP_START.y) * p });
  if (t < tt) return L(ease((t - tin) / (tt - tin)));
  if (t < t0) return L(1);
  return L(1 - ease((t - t0) / (t1 - t0)));
};

const SHOTS: Shot[] = [{ t: 0, kind: "wide" }, { t: 1.0, kind: "exp" }, { t: SOAP_IN - 0.3, kind: "expclose" }, { t: SOAP_TOUCH + 1.7, kind: "exp" }, { t: s7.voiceStart - 0.25, kind: "dogs" }];

const SFX: Sfx[] = duckOverSpeech(voice, [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.3, name: "yip", volume: 0.3 },
  { at: CLEAN_TOUCH, name: "tap", volume: 0.4 }, { at: SOAP_IN, name: "whoosh", volume: 0.3 }, { at: SOAP_TOUCH, name: "tap", volume: 0.45 },
  { at: SOAP_TOUCH + 0.1, name: "discover", volume: 0.55 }, { at: SOAP_TOUCH + 0.15, name: "sparkle", volume: 0.4 }, { at: SOAP_TOUCH + 0.1, name: "yip", volume: 0.45 },
  { at: s7.voiceStart, name: "tada", volume: 0.35 }, { at: s7.voiceStart + 0.2, name: "heart", volume: 0.4 },
]);

export const Tt010Pimienta: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24);
  const cam = camAt(SHOTS, t);

  // ── pimienta: quietita → huye al borde cuando toca el jabón ──
  const flee = (i: number) => ease((tq - SOAP_TOUCH - PEPPER[i].r * 0.5) / 0.95);
  const cleanShimmer = tq > CLEAN_TOUCH && tq < CLEAN_TOUCH + 0.5 ? Math.sin((tq - CLEAN_TOUCH) * 30) * 0.6 : 0;
  const dots = PEPPER.map((d, i) => {
    const p = flee(i); const r = d.r + (d.rf - d.r) * p;
    return { x: PL.cx + Math.cos(d.th) * r * WA.rx + cleanShimmer * Math.cos(d.ph), y: PL.cy + Math.sin(d.th) * r * WA.ry + Math.sin(tq * 1.3 + d.ph) * 0.7, s: d.size };
  });
  const film = ease((tq - SOAP_TOUCH) / 1.2);
  const ripple = (t0: number, big: number) => (tq >= t0 && tq < t0 + 0.8 ? { r: 12 + big * ease((tq - t0) / 0.8), o: 0.7 * (1 - (tq - t0) / 0.8) } : null);
  const rC = ripple(CLEAN_TOUCH, 55), rS = ripple(SOAP_TOUCH, 90);
  const tipC = stickTip(tq, CLEAN_IN, CLEAN_TOUCH, CLEAN_OUT0, CLEAN_OUT1), tipS = stickTip(tq, SOAP_IN, SOAP_TOUCH, SOAP_OUT0, SOAP_OUT1);

  // ── Timo ──
  const timoRaw = t < s1.voiceEnd + 0.1 ? M.up : t < s3.voiceStart - 0.1 ? M.up : t < s4.voiceStart - 0.1 ? M.think : t < SOAP_TOUCH ? M.up : t < SOAP_TOUCH + 1.4 ? M.surp : t < s7.voiceStart - 0.2 ? M.up : t < s7.voiceStart + 0.9 ? M.jump : M.laugh;
  const timoK = timoRaw === M.base && speaking(t, "timo") ? mouth(t, M.base, M.talk, M.bark) : timoRaw;
  const timoHop = hopArc(t, SOAP_TOUCH + 0.1, 0.45, 70) + hopArc(t, s7.voiceStart, 0.5, 90) + hopArc(t, s7.voiceStart + 0.55, 0.5, 70);
  // ── Tere ──
  const tereRaw = t < s2.voiceStart - 0.1 ? TE.up : t < s2.voiceEnd + 0.05 ? TE.base : t < s4.voiceStart - 0.1 ? TE.look : t < s4.voiceEnd + 0.05 ? TE.base : t < SOAP_TOUCH ? TE.curious : t < SOAP_TOUCH + 0.7 ? TE.jump : t < s6.voiceStart - 0.1 ? TE.up : t < s6.voiceEnd + 0.05 ? TE.base : t < s7.voiceStart + 0.2 ? TE.up : TE.bark;
  const tereK = tereRaw === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : Math.floor(t * 10) % 43 === 0 && tereRaw === TE.base ? TE.blink : tereRaw;
  const tereHop = hopArc(t, SOAP_TOUCH + 0.05, 0.5, 80) + hopArc(t, s7.voiceStart + 0.3, 0.4, 35);
  const brandOp = keys(t, [[TT010_SECONDS - 0.9, 0], [TT010_SECONDS - 0.4, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
        <Stage />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <radialGradient id="water" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor="#CFEFFF" /><stop offset="1" stopColor="#8CCBEA" /></radialGradient>
            <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9DEE6" /></linearGradient>
          </defs>
          {/* plato */}
          <ellipse cx={PL.cx} cy={PL.cy + 16} rx={PL.rx} ry={PL.ry} fill="#B8BEC9" />
          <ellipse cx={PL.cx} cy={PL.cy} rx={PL.rx} ry={PL.ry} fill="url(#rim)" stroke="#fff" strokeWidth={4} />
          <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx + 24} ry={WA.ry + 10} fill="#E9EDF3" />
          <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx} ry={WA.ry} fill="url(#water)" />
          <ellipse cx={PL.cx - 120} cy={PL.cy - 28} rx={90} ry={10} fill="#fff" opacity={0.45} />
          {/* película de jabón que se expande */}
          {film > 0 && <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx * film * 0.96} ry={WA.ry * film * 0.96} fill="rgba(255,190,222,0.22)" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />}
          {/* pimienta */}
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#2B2420" opacity={0.92} />)}
          {[rC, rS].map((r, i) => r && <ellipse key={i} cx={PL.cx} cy={PL.cy} rx={r.r * 1.9} ry={r.r * 0.55} fill="none" stroke="#fff" strokeWidth={4} opacity={r.o} />)}
          {/* palitos */}
          {tipC && (<g><line x1={tipC.x} y1={tipC.y} x2={tipC.x + 260} y2={tipC.y - 640} stroke="#B98B52" strokeWidth={20} strokeLinecap="round" /><line x1={tipC.x} y1={tipC.y} x2={tipC.x + 260} y2={tipC.y - 640} stroke="#E8C690" strokeWidth={13} strokeLinecap="round" /></g>)}
          {tipS && (<g><line x1={tipS.x} y1={tipS.y} x2={tipS.x + 260} y2={tipS.y - 640} stroke="#B98B52" strokeWidth={20} strokeLinecap="round" /><line x1={tipS.x} y1={tipS.y} x2={tipS.x + 260} y2={tipS.y - 640} stroke="#E8C690" strokeWidth={13} strokeLinecap="round" />
            <circle cx={tipS.x} cy={tipS.y} r={20} fill="#FFB6D6" stroke="#fff" strokeWidth={4} /><circle cx={tipS.x - 6} cy={tipS.y - 7} r={6} fill="#fff" opacity={0.8} /></g>)}
          {/* opciones: la pregunta se abre antes de resolverla */}
          {t >= T_HUNDE - 0.05 && t < SOAP_TOUCH + 0.1 && <Chip x={335} y={430} text="¿SE HUNDE?" color="#2F7FB8" w={310} scale={0.9 + 0.1 * Math.min(1, (t - T_HUNDE) / 0.25)} />}
          {t >= T_ALEJA - 0.05 && t < SOAP_TOUCH + 0.1 && <Chip x={745} y={430} text="¿SE ALEJA?" color="#F2705B" w={310} scale={0.9 + 0.1 * Math.min(1, (t - T_ALEJA) / 0.25)} />}
        </svg>
        <Sprite k={tereK} ref_={REF_T} x={DOG_X.tere} footY={DOG_FOOT.tere + tereHop} h={DOG_H.tere} />
        <Sprite k={timoK} ref_={REF_M} x={DOG_X.timo} footY={DOG_FOOT.timo + timoHop} h={DOG_H.timo} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={SOAP_TOUCH + 0.1} b={SOAP_TOUCH + 1.2} x={DOG_X.timo + 10} y={DOG_FOOT.timo - DOG_H.timo * 1.12} ch="!" />
          <Mark t={t} a={SOAP_TOUCH + 0.18} b={SOAP_TOUCH + 1.2} x={DOG_X.tere} y={DOG_FOOT.tere - DOG_H.tere * 1.1} ch="!" color="#F2705B" />
          <Mark t={t} a={T_HUNDE} b={SOAP_TOUCH - 0.1} x={DOG_X.tere + 20} y={DOG_FOOT.tere - DOG_H.tere * 1.12} ch="?" color="#F2705B" size={110} />
          <Hearts t={t} start={s7.voiceStart + 0.3} dur={1.4} x={DOG_X.timo + 40} y={DOG_FOOT.timo - DOG_H.timo * 0.95} rise={230} n={5} size={1.1} />
        </svg>
      </AbsoluteFill>
      <Grain />
      {BRAND("Timo y Tere", brandOp)}
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/casita.wav" voice={voice} totalSec={TT010_SECONDS} base={0.2} duckTo={0.09} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
