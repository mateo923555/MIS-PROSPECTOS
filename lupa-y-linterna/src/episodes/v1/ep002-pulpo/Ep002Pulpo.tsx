import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, type PoseName } from "../../../shared/Character";
import { Grain } from "../../../shared/Grain";
import { loadFonts } from "../../../shared/Fonts";
import { Subtitles } from "../../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../../shared/Sound";
import { C, FONT, H, W } from "../../../shared/theme";
import { hash, keys, pop, stepTime } from "../../../shared/motion";
import type { VoiceData, VoiceSegment } from "../../../shared/voice";
import { OCT_BOX, Octopus, SeaBackground } from "./Octopus";
import voiceJson from "./voice.generated.json";

export const EP002V1_SECONDS = 24;
const voice = voiceJson as unknown as VoiceData;

/* ── Anclas de tiempo tomadas de la voz generada: si cambia la voz, la puesta en escena sigue a la narración ── */
const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
const wordStart = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]).start;
const T = {
  algas: wordStart(seg("s2"), "algas"),
  roca: wordStart(seg("s2"), "roca"),
  qEnd: seg("s2").voiceEnd, // fin de la pregunta → empieza la pausa de adivinar
  ahi: seg("s3").voiceStart, // "¡Ahí está!"
  cambio: wordStart(seg("s3"), "cambi"),
  rocaEnd: seg("s3").voiceEnd,
  mira: seg("s4").voiceStart,
  miraEnd: seg("s4").voiceEnd,
};
const GUESS = T.ahi - T.qEnd; // pausa real para pensar (debe ser ≥ 2 s)

const BABY = { x: 330, y: 1295, h: 500 };

const poseAt = (t: number): { pose: PoseName; flip: boolean } => {
  if (t < T.algas - 0.4) return { pose: "maskLook", flip: false };
  if (t < T.roca - 0.9) return { pose: "maskPoint", flip: true }; // señala las algas (izquierda)
  if (t < T.qEnd + 0.1) return { pose: "maskPoint", flip: false }; // señala la roca (derecha)
  if (t < T.ahi) return { pose: "maskLook", flip: false }; // piensa
  if (t < T.ahi + 1.3) return { pose: "maskSurprised", flip: false };
  return { pose: "maskPoint", flip: false };
};

const SFX: Sfx[] = [
  { at: 1.75, name: "bubbles", volume: 0.35 },
  { at: 1.85, name: "pop", volume: 0.5 },
  { at: T.algas - 0.5, name: "tap", volume: 0.4 },
  { at: T.roca - 0.9, name: "tap", volume: 0.4 },
  { at: T.qEnd + 0.15, name: "think", volume: 0.35 },
  { at: T.ahi - 0.02, name: "discover", volume: 0.55 },
  { at: T.ahi + 0.05, name: "whoosh", volume: 0.3 },
  { at: T.ahi + 0.6, name: "sparkle", volume: 0.35 },
  { at: T.cambio, name: "morph", volume: 0.5 },
  { at: T.mira, name: "bubbles", volume: 0.3 },
  { at: 16.85, name: "sparkle", volume: 0.3 },
  { at: 19.3, name: "morph", volume: 0.5 },
  { at: 22.0, name: "tada", volume: 0.4 },
];

/** Estado de la piel del pulpo en el tiempo: 0 = coral (su color), 1 = camuflado en la roca. */
const skinAt = (t: number) => {
  if (t < T.ahi + 0.55) return 1;
  if (t < T.ahi + 1.05) return keys(t, [[T.ahi + 0.55, 1], [T.ahi + 1.05, 0]]); // aparece su color
  if (t < T.cambio) return 0;
  if (t < T.rocaEnd - 0.2) return keys(t, [[T.cambio, 0], [T.rocaEnd - 0.2, 1]]); // "cambió… para parecerse a la roca"
  if (t < 16.8) return 1;
  if (t < 17.4) return keys(t, [[16.8, 1], [17.4, 0]]); // repetición: de nuevo coral
  if (t < 19.3) return 0;
  return keys(t, [[19.3, 0], [21.7, 1]]); // …y otra vez camuflado
};

export const Ep002PulpoV1: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 10);
  const step = Math.floor(tq * 10);

  // ── cámara
  const camS = keys(t, [[0, 1], [T.ahi, 1], [T.ahi + 2.6, 1.42], [T.mira - 0.3, 1.42], [T.miraEnd + 1.0, 1.85], [24, 1.9]]);
  const camX = keys(t, [[0, W / 2], [T.ahi, W / 2], [T.ahi + 2.6, 670], [T.mira - 0.3, 670], [T.miraEnd + 1.0, OCT_BOX.cx], [24, OCT_BOX.cx]]);
  const camY = keys(t, [[0, H / 2], [T.ahi, H / 2], [T.ahi + 2.6, 930], [T.mira - 0.3, 930], [T.miraEnd + 1.0, OCT_BOX.cy + 20], [24, OCT_BOX.cy + 20]]);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-camX}px, ${-camY}px)`;

  // ── pulpo
  const p = skinAt(tq);
  const wig = (a: number, f: number) => a * Math.sin(2 * Math.PI * f * tq);
  let arm = 0;
  if (t >= T.ahi - 0.05 && t < T.ahi + 1.6) arm = wig(8, 1.6) * keys(t, [[T.ahi - 0.05, 0], [T.ahi + 0.2, 1]]);
  else if (t >= T.ahi + 1.6 && t < T.mira - 0.1) arm = wig(4, 1.1);
  else if (t >= T.mira - 0.1 && t < T.miraEnd + 0.6) arm = wig(11, 1.9);
  else if (t >= 21.7) arm = wig(7, 1.5);
  const halo = keys(t, [[T.ahi + 0.05, 0], [T.ahi + 0.55, 1]]) * keys(t, [[T.miraEnd + 0.2, 1], [T.miraEnd + 0.8, 0]]) + keys(t, [[21.8, 0], [22.3, 1]]);

  // ── bebé
  const { pose, flip } = poseAt(tq);
  const bIn = pop(t, 1.8, 0.45);
  const bob = Math.sin(t * 2.2) * 10 + hash(5, step) * 2;
  const babyOp = keys(t, [[T.ahi + 2.2, 1], [T.ahi + 3.4, 0]]) * 0 + 1; // se mantiene visible hasta que la cámara lo deja fuera

  // ── temporizador para adivinar
  const thinkP = Math.min(1, Math.max(0, (t - T.qEnd) / GUESS));
  const thinkOn = t >= T.qEnd - 0.05 && t < T.ahi;
  const R = 92, CIRC = 2 * Math.PI * R;

  const showCompare = t >= 17.4;
  const compareOp = keys(t, [[17.4, 0], [17.9, 1]]);

  const Thumb: React.FC<{ cx: number; skin: number; label: string; ring: string }> = ({ cx, skin, label, ring }) => (
    <div style={{ position: "absolute", left: cx - 105, top: 235, width: 210, textAlign: "center", opacity: compareOp, transform: `scale(${0.85 + 0.15 * compareOp})` }}>
      <div style={{ width: 210, height: 210, borderRadius: "50%", overflow: "hidden", position: "relative", border: `9px solid ${ring}`, boxShadow: "0 8px 24px rgba(0,0,0,.4)", background: C.seaDeep }}>
        <div style={{ position: "absolute", left: 0, top: 0, transformOrigin: "0 0", transform: `translate(96px, 96px) scale(0.34) translate(${-OCT_BOX.cx}px, ${-OCT_BOX.cy}px)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H }}>
            <SeaBackground />
            <Octopus p={skin} halo={skin >= 0.99 ? 1 : 0} />
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, display: "inline-block", fontFamily: FONT, fontWeight: 700, fontSize: 44, color: C.cream, background: "rgba(18,60,64,0.85)", padding: "2px 22px 6px", borderRadius: 30 }}>{label}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: C.seaDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <SeaBackground />
        <Octopus p={p} arm={arm} halo={halo} />

        {/* bebé con visor: ancla en la esquina inferior izquierda */}
        <div style={{ opacity: babyOp, transform: `scale(${bIn})`, transformOrigin: `${BABY.x}px ${BABY.y}px`, position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: BABY.x - 150, top: BABY.y - 18, width: 300, height: 50, borderRadius: "50%", background: "rgba(40,30,10,0.35)", filter: "blur(12px)" }} />
          <Character pose={pose} flip={flip} x={BABY.x + hash(7, step) * 2} y={BABY.y + bob * 0.5} h={BABY.h} rot={hash(9, step) * 0.8} />
        </div>
      </AbsoluteFill>

      {/* burbujas */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 16 }).map((_, i) => {
          const sp = 60 + (i * 37) % 70;
          const x0 = ((i * 211) % 1000) + 40 + Math.sin(t * 1.3 + i) * 18;
          const y = ((H + 100 + i * 170 - t * sp) % (H + 200)) - 100;
          const r = 8 + ((i * 13) % 20);
          return <circle key={i} cx={x0} cy={y} r={r} fill="rgba(220,240,255,0.14)" stroke="rgba(235,248,255,0.55)" strokeWidth={2.5} />;
        })}
      </svg>

      <Grain />

      {/* temporizador "¡pensá!" (2 s de pausa real) */}
      {thinkOn && (
        <div style={{ position: "absolute", left: W / 2 - 110 - 40, top: 235, width: 220, height: 220, opacity: pop(t, T.qEnd - 0.05, 0.3) }}>
          <svg width={220} height={220} viewBox="0 0 220 220">
            <circle cx={110} cy={110} r={R + 8} fill="rgba(18,60,64,0.82)" />
            <circle cx={110} cy={110} r={R} fill="none" stroke="rgba(243,231,201,0.25)" strokeWidth={16} />
            <circle cx={110} cy={110} r={R} fill="none" stroke={C.coral} strokeWidth={16} strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - thinkP)} transform="rotate(-90 110 110)" />
            <text x={110} y={142} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={110} fill={C.cream}>?</text>
          </svg>
        </div>
      )}

      {showCompare && (
        <>
          <Thumb cx={300} skin={0} label="Antes" ring={C.coral} />
          <Thumb cx={W / 2 - 40 + 280} skin={1} label="Ahora" ring="#8A8374" />
          <div style={{ position: "absolute", left: W / 2 - 70, top: 310, width: 80, textAlign: "center", opacity: compareOp, fontFamily: FONT, fontWeight: 700, fontSize: 88, color: C.warmYellow, textShadow: "0 4px 12px rgba(0,0,0,.5)" }}>→</div>
        </>
      )}

      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/mar.wav" voice={voice} totalSec={EP002V1_SECONDS} base={0.2} duckTo={0.1} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
