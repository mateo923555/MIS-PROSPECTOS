import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, type PoseName } from "../../shared/Character";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, W } from "../../shared/theme";
import { hash, keys, pop, stepTime } from "../../shared/motion";
import type { VoiceData, VoiceSegment } from "../../shared/voice";
import { armTipWorld, OCT_BOX, Octopus, SeaBackground } from "./Octopus";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const lastEnd = Math.max(...voice.segments.map((s) => s.voiceEnd));
/** Cierra ~1,1 s después del remate: se recortó la repetición del cierre anterior. */
export const EP002_SECONDS = Math.ceil((lastEnd + 1.1) * 10) / 10;

/* ── Anclas de tiempo tomadas de la voz generada ── */
const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
const ws = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]).start;
export const T = {
  ask: seg("s2").voiceStart,
  algas: ws(seg("s2"), "algas"),
  roca: ws(seg("s2"), "roca"),
  qEnd: seg("s2").voiceEnd, // fin de la pregunta → empieza la pausa de adivinar
  ahi: seg("s3").voiceStart, // «¡Ahí está!» + el brazo se mueve
  brazo: ws(seg("s3"), "brazo"),
  q2: seg("s4").voiceStart, // «¿cómo se esconde otra vez?»
  morph0: seg("s5").voiceStart, // empieza a parecerse a la roca
  morph1: seg("s5").voiceEnd,
  remate: seg("s6").voiceStart, // «Pero un brazo lo delata»
};
const GUESS = T.ahi - T.qEnd; // pausa real (≥ 2 s)

const BABY = { x: 330, y: 1295, h: 500 };
const CAM = { s: 1.45, x: 670, y: 930 }; // encuadre fijo durante la transformación

const poseAt = (t: number): { pose: PoseName; flip: boolean } => {
  if (t < T.algas - 0.5) return { pose: "maskLook", flip: false };
  if (t < T.roca - 0.7) return { pose: "maskPoint", flip: true }; // señala las algas (izquierda)
  if (t < T.qEnd + 0.1) return { pose: "maskPoint", flip: false }; // señala la roca (derecha)
  if (t < T.ahi) return { pose: "maskLook", flip: false }; // piensa
  if (t < T.ahi + 1.4) return { pose: "maskSurprised", flip: false };
  return { pose: "maskPoint", flip: false };
};

const SFX: Sfx[] = [
  { at: 0.05, name: "bubbles", volume: 0.3 },
  { at: T.algas - 0.5, name: "tap", volume: 0.4 },
  { at: T.roca - 0.7, name: "tap", volume: 0.4 },
  { at: T.qEnd + 0.15, name: "think", volume: 0.35 },
  { at: T.ahi - 0.02, name: "discover", volume: 0.55 },
  { at: T.ahi + 0.05, name: "whoosh", volume: 0.3 },
  { at: T.brazo, name: "sparkle", volume: 0.3 },
  { at: T.morph0, name: "morph", volume: 0.45 },
  { at: T.morph0 + 2.2, name: "morph", volume: 0.35 },
  { at: T.morph0 + 4.4, name: "morph", volume: 0.3 },
  { at: T.remate, name: "ding", volume: 0.4 },
];

/** Piel: 1 = camuflado (escondido), 0 = coral. Se esconde → aparece → vuelve a esconderse GRADUALMENTE en el mismo encuadre. */
const skinAt = (t: number) => {
  if (t < T.brazo) return 1;
  if (t < T.brazo + 0.5) return keys(t, [[T.brazo, 1], [T.brazo + 0.5, 0]]);
  if (t < T.morph0) return 0;
  return keys(t, [[T.morph0, 0], [T.morph1, 1]], (x) => x); // lineal: «cada vez más» parecido a la roca
};

export const Ep002Pulpo: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 10);
  const step = Math.floor(tq * 10);

  // cámara: general hasta la revelación; luego un encuadre fijo sobre el pulpo
  const k = keys(t, [[T.ahi, 0], [T.ahi + 2.4, 1]]);
  const camS = 1 + (CAM.s - 1) * k;
  const camX = W / 2 + (CAM.x - W / 2) * k;
  const camY = H / 2 + (CAM.y - H / 2) * k;
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-camX}px, ${-camY}px)`;

  // pulpo
  const p = skinAt(tq);
  const wig = (a: number, f: number) => a * Math.sin(2 * Math.PI * f * tq);
  let arm = 0;
  if (t >= T.ahi - 0.05 && t < T.ahi + 2.0) arm = wig(8, 1.6) * keys(t, [[T.ahi - 0.05, 0], [T.ahi + 0.25, 1]]);
  else if (t >= T.ahi + 2.0 && t < T.morph0) arm = wig(5, 1.1);
  else if (t >= T.morph0) arm = wig(7, 1.3) + (t >= T.remate ? wig(5, 2.3) : 0); // se sigue moviendo hasta el último cuadro
  // contorno amarillo: muestra la silueta completa al descubrirlo y se apaga cuando empieza a esconderse otra vez
  const halo = keys(t, [[T.ahi + 0.05, 0], [T.ahi + 0.5, 1]]) * keys(t, [[T.morph0, 1], [T.morph0 + 1.2, 0]]);
  // aro sobre una ventosa de la punta del brazo: permite seguirlo hasta el último cuadro
  const tip = armTipWorld(arm);
  const ringOn = keys(t, [[T.morph0 + 0.4, 0], [T.morph0 + 1.2, 1]]);

  // bebé
  const { pose, flip } = poseAt(tq);
  const bob = Math.sin(t * 2.2) * 10 + hash(5, step) * 2;

  // temporizador «¡pensá!»
  const thinkP = Math.min(1, Math.max(0, (t - T.qEnd) / GUESS));
  const thinkOn = t >= T.qEnd - 0.05 && t < T.ahi;
  const R = 92, CIRC = 2 * Math.PI * R;

  // «?» sobre los dos escondites (se entiende sin sonido)
  const qOp = keys(t, [[T.ahi - 0.1, 1], [T.ahi + 0.3, 0]]);
  const markers: Array<{ x: number; y: number; hit: number }> = [
    { x: 215, y: 560, hit: pop(t, T.algas, 0.3) * (t < T.roca - 0.5 ? 1 : 0.0) },
    { x: 715, y: 535, hit: pop(t, T.roca, 0.3) },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.seaDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <SeaBackground />
        <Octopus p={p} arm={arm} halo={halo} armCap={t >= T.morph0 ? 0.72 : 1} />

        {ringOn > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: ringOn }}>
            <circle cx={tip.x} cy={tip.y} r={34 + 5 * Math.sin(t * 8)} fill="none" stroke={C.warmYellow} strokeWidth={8} />
            <circle cx={tip.x} cy={tip.y} r={9} fill={C.warmYellow} />
          </svg>
        )}

        {qOp > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: qOp }}>
            {markers.map((m, i) => {
              const sc = 1 + 0.08 * Math.sin(t * 5 + i * 2) + 0.25 * m.hit;
              return (
                <g key={i} transform={`translate(${m.x} ${m.y}) scale(${sc})`}>
                  <circle r={62} fill="rgba(18,60,64,0.85)" stroke={C.coral} strokeWidth={9} />
                  <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={90} fill={C.cream}>?</text>
                </g>
              );
            })}
          </svg>
        )}

        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: BABY.x - 150, top: BABY.y - 18, width: 300, height: 50, borderRadius: "50%", background: "rgba(40,30,10,0.35)", filter: "blur(12px)" }} />
          <Character pose={pose} flip={flip} x={BABY.x + hash(7, step) * 2} y={BABY.y + bob * 0.5} h={BABY.h} rot={hash(9, step) * 0.8} />
        </div>
      </AbsoluteFill>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const sp = 60 + ((i * 37) % 70);
          const x0 = ((i * 211) % 1000) + 40 + Math.sin(t * 1.3 + i) * 18;
          const y = ((H + 100 + i * 170 - t * sp) % (H + 200)) - 100;
          const r = 8 + ((i * 13) % 20);
          return <circle key={i} cx={x0} cy={y} r={r} fill="rgba(220,240,255,0.14)" stroke="rgba(235,248,255,0.55)" strokeWidth={2.5} />;
        })}
      </svg>

      <Grain />

      {thinkOn && (
        <div style={{ position: "absolute", left: W / 2 - 150, top: 235, width: 220, height: 220, opacity: pop(t, T.qEnd - 0.05, 0.3) }}>
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx={110} cy={110} r={R + 8} fill="rgba(18,60,64,0.82)" />
            <circle cx={110} cy={110} r={R} fill="none" stroke="rgba(243,231,201,0.25)" strokeWidth={16} />
            <circle cx={110} cy={110} r={R} fill="none" stroke={C.coral} strokeWidth={16} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - thinkP)} transform="rotate(-90 110 110)" />
            <text x={110} y={142} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={110} fill={C.cream}>?</text>
          </svg>
        </div>
      )}

      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/mar.wav" voice={voice} totalSec={EP002_SECONDS} base={0.2} duckTo={0.1} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
