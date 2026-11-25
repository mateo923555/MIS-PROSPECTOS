import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, type PoseName } from "../../shared/Character";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, SAFE, W } from "../../shared/theme";
import { hash, keys, stepTime } from "../../shared/motion";
import type { VoiceData } from "../../shared/voice";
import voiceJson from "./voice.generated.json";

export const EP001_SECONDS = 23;
const voice = voiceJson as unknown as VoiceData;

/* ───────── Geometría de la demostración (física de la sombra) ─────────
 * Fuente puntual (linterna) → bebé → pared. Distancia linterna–pared FIJA = D.
 * Si el bebé está a distancia d de la linterna, la sombra en la pared se agranda por s = D / d.
 * El bebé mide 1 unidad; en la pared 1 unidad = PW px. La linterna está a altura LAMP_H (en unidades de bebé),
 * así que la sombra "crece" hacia arriba y se corta en la línea pared–piso, como en la vida real.          */
const D = 4.8;
const LAMP_H = 0.5;
const PW = 380;
const WALL_Y = 768; // línea pared–piso en pantalla
const LAMP_Y = 1265; // base de la linterna (cerca de cámara)
const CX = W / 2;
const LAMP_X = 270; // la linterna está adelante a la izquierda
const XL = (LAMP_X - CX) / 520; // posición lateral de la linterna en unidades de bebé

/** Distancia linterna–bebé en el tiempo [t, d]. Lo único que cambia en toda la demostración. */
const D_KEYS: Array<[number, number]> = [
  [0, 1.8], [4.9, 1.8], [6.7, 3.4], [7.3, 3.4], // se aparta para empezar
  [10.2, 1.5], [12.9, 1.5], // "me acerco… mi sombra crece"
  [13.4, 1.5], [16.0, 3.6], // "ahora me alejo y se achica"
  [16.4, 3.6], [18.0, 2.3], [23, 2.3], // se acomoda para saludar
];

const poseAt = (t: number): PoseName => {
  if (t < 4.55) return "surprised";
  if (t < 6.2) return "chest";
  if (t < 10.4) return "neutral";
  if (t < 12.9) return "surprised";
  if (t < 18.2) return "neutral";
  return Math.floor(t * 5) % 2 === 0 ? "waveA" : "waveB"; // saludo: alterna a 5 cuadros/seg
};

const SFX: Sfx[] = [
  { at: 2.0, name: "click", volume: 0.5 },
  { at: 2.15, name: "whoosh", volume: 0.45 },
  { at: 4.55, name: "tap", volume: 0.5 },
  { at: 10.4, name: "tap", volume: 0.5 },
  { at: 12.9, name: "tap", volume: 0.4 },
  { at: 18.2, name: "tap", volume: 0.5 },
  { at: 18.3, name: "sparkle", volume: 0.3 },
  { at: 21.55, name: "tada", volume: 0.4 },
];

export const Ep001Sombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 10); // stop motion "a 3s": todo lo del personaje se actualiza cada 3 cuadros
  const step = Math.floor(tq * 10);

  // ── bebé: distancia, posición, caminata
  const d = keys(tq, D_KEYS);
  const dPrev = keys(Math.max(0, tq - 0.1), D_KEYS);
  const moving = Math.abs(d - dPrev) > 0.004;
  const wd = D - d; // distancia a la pared
  const k = wd / D;
  const footY = WALL_Y + (LAMP_Y - WALL_Y) * k;
  const babyH = 300 + 220 * k;
  const lateral = XL * (1 - d / D); // geometría: sombra centrada en la pared (ver README)
  const babyX = CX + lateral * babyH;
  const jx = hash(1, step) * 3 + (moving ? 0 : hash(2, step) * 1.5);
  const bob = moving ? Math.abs(Math.sin(step * 1.1)) * 16 : 0;
  const rot = moving ? (step % 2 ? 3 : -3) : hash(3, step) * 0.9;
  const pose = poseAt(tq);

  // ── sombra (derivada del MISMO sprite y del MISMO movimiento)
  const s = D / d;
  const shH = s * PW;
  const shBottomY = WALL_Y + LAMP_H * (s - 1) * PW;
  const shX = CX + s * (jx / babyH) * PW;
  const shBlur = 3 + (s - 1) * 2.4;

  // ── cámara: arranca cerrada en la sombra y se abre para revelar linterna, bebé y pared
  const camS = keys(t, [[0, 1.8], [2.0, 1.8], [3.5, 1.0]]);
  const camY = keys(t, [[0, 110], [2.0, 110], [3.5, H / 2]]);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-CX}px, ${-camY}px)`;

  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const guideOp = keys(t, [[5.8, 0], [6.6, 0.7]]);
  const brandOp = keys(t, [[21.6, 0], [22.2, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        {/* Pared (continúa hacia arriba para el plano cerrado) y piso: la imagen se reparte para que la línea quede en WALL_Y */}
        <div style={{ position: "absolute", left: 0, top: -800, width: W, height: WALL_Y + 800, overflow: "hidden" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: 2777 }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: WALL_Y, width: W, height: H - WALL_Y, overflow: "hidden", filter: "brightness(0.78) saturate(0.85) hue-rotate(-8deg)" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: -1494, width: W, height: 2646 }} />
        </div>

        {/* Luz: oscuridad con un "agujero" para el haz (pared + piso) y brillo cálido */}
        <svg width={W} height={H + 800} viewBox={`0 -800 ${W} ${H + 800}`} style={{ position: "absolute", left: 0, top: -800 }}>
          <defs>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34" /></filter>
            <mask id="beamHole">
              <rect y={-800} width={W} height={H + 800} fill="white" />
              <g filter="url(#soft)" fill="black">
                <ellipse cx={CX} cy={400} rx={600} ry={470} />
                <polygon points={`${LAMP_X + 60},${LAMP_Y - 270} ${LAMP_X + 170},${LAMP_Y - 250} ${W + 160},${WALL_Y - 40} ${-60},${WALL_Y - 40}`} />
              </g>
            </mask>
            <radialGradient id="warm" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.75" /><stop offset="1" stopColor="#FFD36B" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect y={-800} width={W} height={H + 800} fill="#06151C" opacity={0.66} mask="url(#beamHole)" />
          <g filter="url(#soft)" opacity={0.42 * lampGlow} style={{ mixBlendMode: "screen" }}>
            <ellipse cx={CX} cy={400} rx={520} ry={400} fill="url(#warm)" />
            <polygon points={`${LAMP_X + 80},${LAMP_Y - 270} ${LAMP_X + 160},${LAMP_Y - 255} ${W},${WALL_Y} ${0},${WALL_Y}`} fill="#FFDD88" opacity={0.55} />
          </g>
        </svg>

        {/* Guía de distancia fija: puntitos de la linterna a la pared */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: guideOp }}>
          <line x1={LAMP_X + 120} y1={LAMP_Y - 250} x2={CX} y2={WALL_Y + 14} stroke={C.coral} strokeWidth={9} strokeLinecap="round" strokeDasharray="0 26" />
        </svg>

        {/* SOMBRA sobre la pared (recortada en la línea pared–piso) */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Character pose={pose} x={shX} y={shBottomY} h={shH} rot={rot * 0.5} silhouette blur={shBlur} opacity={0.8} style={{ mixBlendMode: "multiply" }} />
        </div>

        {/* sombrita de contacto del bebé en el piso */}
        <div style={{ position: "absolute", left: babyX - babyH * 0.32 + jx, top: footY - babyH * 0.04, width: babyH * 0.64, height: babyH * 0.12, borderRadius: "50%", background: "rgba(0,0,0,0.38)", filter: "blur(10px)" }} />

        {/* BEBÉ */}
        <Character pose={pose} x={babyX + jx} y={footY - bob} h={babyH} rot={rot} />

        {/* LINTERNA: más cerca de cámara que el bebé → se dibuja DELANTE */}
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}>
          <Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />

      </AbsoluteFill>

      <Grain />

      {/* marca discreta al final */}
      <div style={{ position: "absolute", top: SAFE.subtitleY, height: SAFE.subtitleH, left: 0, width: W - SAFE.right, display: "flex", alignItems: "center", justifyContent: "center", opacity: brandOp }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.cream, background: "rgba(18,60,64,0.8)", padding: "8px 30px 12px", borderRadius: 40 }}>
          Lupa y Linterna
        </div>
      </div>

      <Subtitles segments={voice.segments} />

      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/linterna.wav" voice={voice} totalSec={EP001_SECONDS} base={0.2} duckTo={0.1} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
