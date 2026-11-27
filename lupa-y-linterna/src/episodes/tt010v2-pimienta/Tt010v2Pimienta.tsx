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
import { BRAND, Cable, Chip, DOG_FOOT, DOG_H, LoopMusic, M, Mark, PUSH_M, PUSH_T, PushButton, REF_M, REF_T, Sprite, Stage, TE, camAt, camTransform, duckOverSpeech, ease, hopArc, makeVoice, mouth, pawPoint, pressAmt, type Shot } from "../../shared/PetKit";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const V = makeVoice(voice);
export const TT010V2_SECONDS = Math.ceil((V.lastEnd + 1.0) * 10) / 10;
const { seg, word, speaking } = V;
const S = Object.fromEntries(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"].map((k) => [k, seg(k)])) as Record<string, ReturnType<typeof seg>>;

// ── tiempos anclados a la voz ──
const PA = S.s2.voiceEnd + 0.2, PA_END = PA + 0.7; // Timo aprieta el botón AZUL → gota de agua
const PB = S.s4.voiceEnd + 0.3, PB_END = PB + 0.7; // Tere aprieta el botón ROSA → gota de jabón
const DROP_FALL = 0.5, LAND_A = PA + 0.12 + DROP_FALL, LAND_B = PB + 0.12 + DROP_FALL;
const T_HUNDE = word("s4", "hunde").start;
const T_POCO = word("s7", "menos").start, T_FUERTE = word("s8", "fuerte").start;

// ── plato, agua, pimienta (todo bien separado de los perros) ──
const PL = { cx: 540, cy: 728, rx: 405, ry: 108 }, WA = { rx: 352, ry: 80 };
const PEPPER = Array.from({ length: 260 }, (_, i) => {
  const r = Math.sqrt((hash(2, i) + 1) / 2) * 0.93, th = (hash(3, i) + 1) * Math.PI;
  return { r, th, rf: 0.8 + 0.17 * ((hash(4, i) + 1) / 2), size: 4 + 2.6 * ((hash(5, i) + 1) / 2), ph: hash(6, i) * 6 };
});
const DROPPER_A = { x: 395, color: "#2F7FB8", name: "AGUA" }, DROPPER_B = { x: 540, color: "#E86AA6", name: "JABÓN" };
const TIP_Y = 560; // punta de los goteros
const TIMO_X = 235, TERE_X = 600;
const PAW_M = pawPoint(PUSH_M, REF_M, TIMO_X, DOG_FOOT.timo, DOG_H.timo, 0.97, 0.4), PAW_T = pawPoint(PUSH_T, REF_T, TERE_X, DOG_FOOT.tere, DOG_H.tere, 0.95, 0.35);
const BTN_A = { x: PAW_M.x + 36, y: PAW_M.y + 6, floor: DOG_FOOT.timo }, BTN_B = { x: PAW_T.x + 36, y: PAW_T.y + 6, floor: DOG_FOOT.tere };

const SHOTS: Shot[] = [{ t: 0, kind: "wide" }, { t: 0.8, kind: "exp" }, { t: S.s7.voiceStart - 0.3, kind: "exp" }, { t: S.s9.voiceStart - 0.3, kind: "dogs" }];
const SFX: Sfx[] = duckOverSpeech(voice, [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.3, name: "yip", volume: 0.3 },
  { at: PA, name: "click", volume: 0.5 }, { at: PA + 0.15, name: "tap", volume: 0.3 }, { at: LAND_A, name: "bubbles", volume: 0.35 },
  { at: PB, name: "click", volume: 0.5 }, { at: PB + 0.15, name: "tap", volume: 0.3 }, { at: LAND_B, name: "discover", volume: 0.55 }, { at: LAND_B + 0.05, name: "sparkle", volume: 0.4 }, { at: LAND_B + 0.1, name: "yip", volume: 0.45 },
  { at: T_POCO, name: "ding", volume: 0.35 }, { at: T_FUERTE, name: "ding", volume: 0.35 },
  { at: S.s9.voiceStart, name: "tada", volume: 0.35 }, { at: S.s9.voiceStart + 0.2, name: "heart", volume: 0.4 },
]);

const Dropper: React.FC<{ x: number; color: string; squeeze: number; hidden?: boolean }> = ({ x, color, squeeze, hidden }) => hidden ? null : (
  <g>
    <line x1={x} y1={TIP_Y - 150} x2={x} y2={-40} stroke="#7E8794" strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={x} cy={TIP_Y - 190} rx={32 - squeeze * 6} ry={34 - squeeze * 14} fill="#2B2F38" stroke="#fff" strokeWidth={3} />
    <rect x={x - 30} y={TIP_Y - 160} width={60} height={110} rx={14} fill={color} stroke="#fff" strokeWidth={4} opacity={0.95} />
    <polygon points={`${x - 18},${TIP_Y - 52} ${x + 18},${TIP_Y - 52} ${x},${TIP_Y}`} fill={color} stroke="#fff" strokeWidth={3} />
    <rect x={x - 20} y={TIP_Y - 128} width={40} height={14} rx={7} fill="#fff" opacity={0.45} />
  </g>
);

export const Tt010v2Pimienta: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24);
  const cam = camAt(SHOTS, t);
  const pA = pressAmt(tq, PA, PA_END), pB = pressAmt(tq, PB, PB_END);

  // ── pimienta ──
  const flee = (i: number) => ease((tq - LAND_B - PEPPER[i].r * 0.5) / 0.95);
  const shimmer = tq > LAND_A && tq < LAND_A + 0.5 ? Math.sin((tq - LAND_A) * 30) * 0.6 : 0;
  const dots = PEPPER.map((d, i) => { const p = flee(i); const r = d.r + (d.rf - d.r) * p; return { x: PL.cx + Math.cos(d.th) * r * WA.rx + shimmer * Math.cos(d.ph), y: PL.cy + Math.sin(d.th) * r * WA.ry + Math.sin(tq * 1.3 + d.ph) * 0.7, s: d.size }; });
  const film = ease((tq - LAND_B) / 1.2);
  const ripple = (t0: number, big: number) => (tq >= t0 && tq < t0 + 0.8 ? { r: 12 + big * ease((tq - t0) / 0.8), o: 0.7 * (1 - (tq - t0) / 0.8) } : null);
  const rA = ripple(LAND_A, 40), rB = ripple(LAND_B, 90);
  const dropAt = (tp: number, x: number) => { const u = (tq - (tp + 0.12)) / DROP_FALL; return u >= 0 && u < 1 ? { x, y: TIP_Y + (PL.cy - 8 - TIP_Y) * u * u } : null; };
  const dA = dropAt(PA, DROPPER_A.x), dB = dropAt(PB, DROPPER_B.x);
  // flechas de tirón (explicación)
  const arrowsOn = ease((t - T_FUERTE + 0.1) / 0.4) * (1 - ease((t - (S.s8.voiceEnd + 0.6)) / 0.4));
  const centerOn = ease((t - T_POCO + 0.1) / 0.4) * (1 - ease((t - (S.s8.voiceEnd + 0.6)) / 0.4));
  const pulse = 0.5 + 0.5 * Math.sin(t * 8);

  // ── perros ──
  const timoPush = t >= PA - 0.3 && t < PA_END + 0.1, terePush = t >= PB - 0.3 && t < PB_END + 0.1;
  const timoRaw = t < PA - 0.3 ? (t < S.s2.voiceStart ? M.up : M.base) : timoPush ? PUSH_M : t < LAND_B - 0.1 ? M.think : t < S.s6.voiceStart ? M.surp : t < S.s9.voiceStart - 0.2 ? M.curious : t < S.s9.voiceStart + 1.0 ? M.jump : M.laugh;
  const timoK = timoRaw === M.base && speaking(t, "timo") ? mouth(t, M.base, M.talk, M.bark) : timoRaw === M.curious && speaking(t, "timo") ? mouth(t, M.curious, M.talk, M.bark) : timoRaw;
  const timoHop = hopArc(t, LAND_B + 0.1, 0.45, 70) + hopArc(t, S.s9.voiceStart, 0.5, 90) + hopArc(t, S.s9.voiceStart + 0.55, 0.5, 70);
  const tereRaw = t < S.s2.voiceStart - 0.1 ? TE.up : t < S.s2.voiceEnd + 0.05 ? TE.base : t < PB - 0.4 ? TE.curious : t < S.s4.voiceEnd + 0.05 ? TE.base : terePush ? PUSH_T : t < S.s6.voiceStart - 0.05 ? TE.curious : t < S.s6.voiceEnd + 0.1 ? TE.jump : t < S.s8.voiceEnd + 0.05 ? TE.base : t < S.s9.voiceStart + 0.2 ? TE.up : TE.bark;
  const tereK = tereRaw === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : Math.floor(t * 10) % 43 === 0 && tereRaw === TE.base ? TE.blink : tereRaw;
  const tereHop = hopArc(t, S.s6.voiceStart + 0.02, 0.45, 65) + hopArc(t, S.s9.voiceStart + 0.3, 0.4, 35);
  const brandOp = keys(t, [[TT010V2_SECONDS - 0.9, 0], [TT010V2_SECONDS - 0.4, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTransform(cam), transformOrigin: "0 0" }}>
        <Stage />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <radialGradient id="water" cx="50%" cy="40%" r="70%"><stop offset="0" stopColor="#CFEFFF" /><stop offset="1" stopColor="#8CCBEA" /></radialGradient>
            <linearGradient id="rim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#D9DEE6" /></linearGradient>
            <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#FF6B3D" /></marker>
            <marker id="ahs" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="#FFE27A" /></marker>
          </defs>
          {/* cables de los botones a los goteros */}
          <Cable pts={[[BTN_A.x, BTN_A.y - 62], [BTN_A.x, 420], [DROPPER_A.x - 40, 420], [DROPPER_A.x - 40, TIP_Y - 190]]} t={t} t0={PA} />
          <Cable pts={[[BTN_B.x, BTN_B.y - 62], [BTN_B.x, 380], [DROPPER_B.x + 40, 380], [DROPPER_B.x + 40, TIP_Y - 190]]} t={t} t0={PB} />
          {/* plato */}
          <ellipse cx={PL.cx} cy={PL.cy + 16} rx={PL.rx} ry={PL.ry} fill="#B8BEC9" />
          <ellipse cx={PL.cx} cy={PL.cy} rx={PL.rx} ry={PL.ry} fill="url(#rim)" stroke="#fff" strokeWidth={4} />
          <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx + 24} ry={WA.ry + 10} fill="#E9EDF3" />
          <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx} ry={WA.ry} fill="url(#water)" />
          <ellipse cx={PL.cx - 120} cy={PL.cy - 28} rx={90} ry={10} fill="#fff" opacity={0.45} />
          {film > 0 && <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx * film * 0.96} ry={WA.ry * film * 0.96} fill="rgba(255,190,222,0.22)" stroke="rgba(255,255,255,0.55)" strokeWidth={3} />}
          {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#2B2420" opacity={0.92} />)}
          {[rA, rB].map((r, i) => r && <ellipse key={i} cx={i ? DROPPER_B.x : DROPPER_A.x} cy={PL.cy} rx={r.r * 1.9} ry={r.r * 0.55} fill="none" stroke="#fff" strokeWidth={4} opacity={r.o} />)}
          {/* goteros y gotas */}
          <Dropper x={DROPPER_A.x} color={DROPPER_A.color} squeeze={pA} />
          <Dropper x={DROPPER_B.x} color={DROPPER_B.color} squeeze={pB} />
          {[[dA, DROPPER_A.color], [dB, DROPPER_B.color]].map(([d, c], i) => d && <path key={i} d={`M${(d as any).x},${(d as any).y - 18} q16,24 0,34 q-16,-10 0,-34 z`} fill={c as string} stroke="#fff" strokeWidth={3} />)}
          <text x={DROPPER_A.x} y={TIP_Y - 175} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={22} fill="#fff" opacity={0}>{DROPPER_A.name}</text>
          {t >= 0.9 && t < PB_END && <Chip x={DROPPER_A.x} y={TIP_Y - 235} text="AGUA" color={DROPPER_A.color} w={150} fs={34} />}
          {t >= S.s4.voiceStart - 0.3 && t < LAND_B + 1.6 && <Chip x={DROPPER_B.x + 20} y={TIP_Y - 235} text="JABÓN" color={DROPPER_B.color} w={170} fs={34} />}
          {/* opciones (Tere dice "se hunde") */}
          {t >= T_HUNDE - 0.05 && t < LAND_B + 0.1 && <Chip x={330} y={430} text="¿SE HUNDE?" color="#2F7FB8" w={310} scale={0.9 + 0.1 * Math.min(1, (t - T_HUNDE) / 0.25)} />}
          {t >= T_HUNDE + 0.35 && t < LAND_B + 0.1 && <Chip x={760} y={430} text="¿SE ALEJA?" color="#F2705B" w={310} scale={0.9 + 0.1 * Math.min(1, (t - T_HUNDE - 0.35) / 0.25)} />}
          {/* explicación: en el centro el jabón tira poco; en los bordes el agua tira fuerte y arrastra */}
          {centerOn > 0.02 && (
            <g opacity={centerOn}>
              <ellipse cx={PL.cx} cy={PL.cy} rx={WA.rx * 0.34} ry={WA.ry * 0.34} fill="rgba(255,190,222,0.35)" stroke="#E86AA6" strokeWidth={5} strokeDasharray="10 8" />
              {[-1, 1].map((s) => <line key={s} x1={PL.cx + s * 36} y1={PL.cy} x2={PL.cx + s * 70} y2={PL.cy} stroke="#FFE27A" strokeWidth={4} markerEnd="url(#ahs)" opacity={0.8} />)}
              <Chip x={PL.cx} y={PL.cy - 150} text="CENTRO: TIRA POCO" color="#E86AA6" w={420} fs={36} />
            </g>
          )}
          {arrowsOn > 0.02 && (
            <g opacity={arrowsOn}>
              {Array.from({ length: 14 }, (_, i) => { const th = (i / 14) * Math.PI * 2 + 0.2; const x1 = PL.cx + Math.cos(th) * WA.rx * 0.78, y1 = PL.cy + Math.sin(th) * WA.ry * 0.78; const len = 0.2 + 0.05 * pulse; return <line key={i} x1={x1} y1={y1} x2={PL.cx + Math.cos(th) * WA.rx * (0.78 + len)} y2={PL.cy + Math.sin(th) * WA.ry * (0.78 + len)} stroke="#FF6B3D" strokeWidth={9} strokeLinecap="round" markerEnd="url(#ah)" />; })}
              <Chip x={PL.cx} y={PL.cy + 130} text="BORDES: TIRAN FUERTE" color="#FF6B3D" w={500} fs={36} />
            </g>
          )}
          {/* botones */}
          <PushButton x={BTN_A.x} y={BTN_A.y} floorY={BTN_A.floor} press={pA} color="#2F7FB8" label="AGUA" />
          <PushButton x={BTN_B.x} y={BTN_B.y} floorY={BTN_B.floor} press={pB} color="#E86AA6" label="JABÓN" />
        </svg>
        <Sprite k={tereK} ref_={REF_T} x={TERE_X} footY={DOG_FOOT.tere + tereHop} h={DOG_H.tere} />
        <Sprite k={timoK} ref_={REF_M} x={TIMO_X} footY={DOG_FOOT.timo + timoHop} h={DOG_H.timo} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={LAND_B + 0.1} b={LAND_B + 1.2} x={TIMO_X + 10} y={DOG_FOOT.timo - DOG_H.timo * 1.12} ch="!" />
          <Mark t={t} a={S.s6.voiceStart} b={S.s6.voiceEnd + 0.4} x={TERE_X} y={DOG_FOOT.tere - DOG_H.tere * 1.1} ch="!" color="#F2705B" />
          <Hearts t={t} start={S.s9.voiceStart + 0.3} dur={1.4} x={TIMO_X + 40} y={DOG_FOOT.timo - DOG_H.timo * 0.95} rise={230} n={5} size={1.1} />
        </svg>
      </AbsoluteFill>
      <Grain />
      {BRAND("Timo y Tere", brandOp)}
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <LoopMusic src="audio/music/linterna.wav" voice={voice} totalSec={TT010V2_SECONDS} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
