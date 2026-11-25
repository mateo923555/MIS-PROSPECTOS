import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Character, type PoseName } from "../../shared/Character";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, SAFE, W } from "../../shared/theme";
import { hash, keys, pop, stepTime } from "../../shared/motion";
import type { VoiceData, VoiceSegment } from "../../shared/voice";
import { CX, D, D_FIT, D_NEAR, D_START, FRAME, LAMP_H, PW, WALL_Y } from "./geometry";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const lastEnd = Math.max(...voice.segments.map((s) => s.voiceEnd));
/** Cierra ~1,1 s después del remate (la última frase): nada de cola sin acción nueva. */
export const EP001_SECONDS = Math.ceil((lastEnd + 1.1) * 10) / 10;

/* ── Anclas tomadas de la voz generada: la escena sigue a la narración ── */
const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
const ws = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]).start;
const T = {
  question: seg("s2").voiceStart,
  acerco: ws(seg("s3"), "acerco"),
  crece: ws(seg("s3"), "crece"),
  s3End: seg("s3").voiceEnd,
  alejo: ws(seg("s4"), "alejo"),
  s4End: seg("s4").voiceEnd,
  fit: seg("s5").voiceStart,
  hello: seg("s6").voiceStart,
};

const LAMP_X = 270;
const LAMP_Y = 1265;
const XL = (LAMP_X - CX) / 520;

/** Distancia linterna–bebé: lo ÚNICO que cambia en la demostración. */
const D_KEYS: Array<[number, number]> = [
  [0, D_START], [T.acerco - 0.1, D_START],
  [T.crece + 0.25, D_NEAR], [T.alejo - 0.15, D_NEAR], // "me acerco… ¡crece más!"
  [T.s4End + 0.1, D_FIT], [30, D_FIT], // "me alejo… ¡se achica!" → entra justo
];

const poseAt = (t: number): PoseName => {
  if (t < T.question) return "surprised";
  if (t < T.acerco - 0.1) return "point";
  if (t < T.crece) return "neutral";
  if (t < T.alejo - 0.3) return "surprised";
  if (t < T.fit) return "neutral";
  if (t < T.hello) return "chest";
  return Math.floor(t * 5) % 2 === 0 ? "waveA" : "waveB";
};

const SFX: Sfx[] = [
  { at: 0.05, name: "pop", volume: 0.4 },
  { at: T.question, name: "think", volume: 0.3 },
  { at: T.acerco - 0.1, name: "tap", volume: 0.45 },
  { at: T.crece - 0.05, name: "tap", volume: 0.45 },
  { at: T.alejo - 0.3, name: "tap", volume: 0.4 },
  { at: T.s4End + 0.12, name: "sparkle", volume: 0.4 },
  { at: T.fit, name: "tap", volume: 0.45 },
  { at: T.hello, name: "tada", volume: 0.35 },
];

export const Ep001Sombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 10); // stop motion "a 3s"
  const step = Math.floor(tq * 10);

  const d = keys(tq, D_KEYS);
  const dPrev = keys(Math.max(0, tq - 0.1), D_KEYS);
  const moving = Math.abs(d - dPrev) > 0.004;
  const k = (D - d) / D;
  const footY = WALL_Y + (LAMP_Y - WALL_Y) * k;
  const babyH = 300 + 220 * k;
  const lateral = XL * (1 - d / D); // mantiene la sombra centrada en la pared
  const babyX = CX + lateral * babyH;
  const jx = hash(1, step) * 3 + (moving ? 0 : hash(2, step) * 1.5);
  const bob = moving ? Math.abs(Math.sin(step * 1.1)) * 16 : 0;
  const rot = moving ? (step % 2 ? 3 : -3) : hash(3, step) * 0.9;
  const pose = poseAt(tq);

  // sombra: mismo sprite, mismo movimiento (geometría en ./geometry.ts)
  const s = D / d;
  const shH = s * PW;
  const shBottomY = WALL_Y + LAMP_H * (s - 1) * PW;
  const shX = CX + s * (jx / babyH) * PW;
  const shBlur = 3 + (s - 1) * 2.4;

  // marco-objetivo: late mientras el bebé se pregunta; brilla cuando la sombra entra
  const askGlow = t > T.question - 0.1 && t < T.acerco ? 0.5 + 0.5 * Math.sin((t - T.question) * 7) : 0;
  const fitGlow = keys(t, [[T.s4End - 0.3, 0], [T.s4End + 0.2, 1], [T.hello + 1.2, 0.55]]);
  const fx = FRAME.x0, fw = FRAME.x1 - FRAME.x0, fy = FRAME.y0, fh = FRAME.y1 - FRAME.y0;
  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const brandOp = keys(t, [[EP001_SECONDS - 0.9, 0], [EP001_SECONDS - 0.4, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill>
        {/* pared y piso */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: 0, width: W, height: 1360 }} />
        </div>
        <div style={{ position: "absolute", left: 0, top: WALL_Y, width: W, height: H - WALL_Y, overflow: "hidden", filter: "brightness(0.78) saturate(0.85) hue-rotate(-8deg)" }}>
          <Img src={staticFile("art/generated/bg_room.png")} style={{ position: "absolute", left: 0, top: -1494, width: W, height: 2646 }} />
        </div>

        {/* luz fija: la linterna no se mueve */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34" /></filter>
            <mask id="beamHole">
              <rect width={W} height={H} fill="white" />
              <g filter="url(#soft)" fill="black">
                <ellipse cx={CX} cy={400} rx={600} ry={470} />
                <polygon points={`${LAMP_X + 60},${LAMP_Y - 270} ${LAMP_X + 170},${LAMP_Y - 250} ${W + 160},${WALL_Y - 40} ${-60},${WALL_Y - 40}`} />
              </g>
            </mask>
            <radialGradient id="warm" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE9A8" stopOpacity="0.75" /><stop offset="1" stopColor="#FFD36B" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={W} height={H} fill="#06151C" opacity={0.66} mask="url(#beamHole)" />
          <g filter="url(#soft)" opacity={0.42 * lampGlow} style={{ mixBlendMode: "screen" }}>
            <ellipse cx={CX} cy={400} rx={520} ry={400} fill="url(#warm)" />
            <polygon points={`${LAMP_X + 80},${LAMP_Y - 270} ${LAMP_X + 160},${LAMP_Y - 255} ${W},${WALL_Y} ${0},${WALL_Y}`} fill="#FFDD88" opacity={0.55} />
          </g>
        </svg>

        {/* interior del marco (objetivo) */}
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, background: "rgba(255,238,180,0.20)", borderRadius: "30px 30px 0 0" }} />

        {/* SOMBRA sobre la pared */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Character pose={pose} x={shX} y={shBottomY} h={shH} rot={rot * 0.5} silhouette blur={shBlur} opacity={0.82} style={{ mixBlendMode: "multiply" }} />
        </div>

        {/* borde del marco (por delante de la sombra, para que se vea qué desborda) */}
        <div
          style={{
            position: "absolute", left: fx - 26, top: fy - 26, width: fw + 52, height: fh + 26, boxSizing: "border-box",
            border: `26px solid ${C.coral}`, borderBottom: "none", borderRadius: "56px 56px 0 0",
            boxShadow: `0 0 ${24 + 40 * (askGlow + fitGlow)}px ${6 + 14 * (askGlow + fitGlow)}px rgba(255,214,90,${0.25 + 0.5 * Math.max(askGlow * 0.6, fitGlow)}), inset 0 0 0 5px rgba(255,255,255,0.35)`,
            pointerEvents: "none",
          }}
        />
        {/* estrellitas cuando entra */}
        {t > T.s4End && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            {[[-1, -1], [1, -1], [0, -1.35], [-1.25, 0.2], [1.25, 0.2]].map(([ox, oy], i) => {
              const sc = pop(t, T.s4End + 0.05 + i * 0.07, 0.35) * (1 - keys(t, [[T.s4End + 1.4, 0], [T.s4End + 2.0, 1]]));
              return <text key={i} x={CX + ox * 230} y={fy + 80 + (oy + 1) * 120} fontSize={70 * sc} textAnchor="middle" fill={C.warmYellow} fontFamily={FONT}>★</text>;
            })}
          </svg>
        )}

        {/* sombrita de contacto */}
        <div style={{ position: "absolute", left: babyX - babyH * 0.32 + jx, top: footY - babyH * 0.04, width: babyH * 0.64, height: babyH * 0.12, borderRadius: "50%", background: "rgba(0,0,0,0.38)", filter: "blur(10px)" }} />

        {/* bebé y, delante, la linterna (más cerca de cámara) */}
        <Character pose={pose} x={babyX + jx} y={footY - bob} h={babyH} rot={rot} />
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}>
          <Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />
      </AbsoluteFill>

      <Grain />

      <div style={{ position: "absolute", top: SAFE.subtitleY, height: SAFE.subtitleH, left: 0, width: W - SAFE.right, display: "flex", alignItems: "center", justifyContent: "center", opacity: brandOp }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.cream, background: "rgba(18,60,64,0.8)", padding: "8px 30px 12px", borderRadius: 40 }}>Lupa y Linterna</div>
      </div>

      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/linterna.wav" voice={voice} totalSec={EP001_SECONDS} base={0.2} duckTo={0.1} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
