import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { MusicTrack, SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { C, FONT, H, SAFE, W } from "../../shared/theme";
import { hash, hops, keys, pop, stepTime } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData, VoiceSegment } from "../../shared/voice";
import { cameraAt } from "../ep001-sombra/camera";
import { CX, D, D_FIT, D_NEAR, D_START, FRAME, LAMP_H, PW, WALL_Y } from "../ep001-sombra/geometry";
import META from "../../shared/petMeta.json";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const lastEnd = Math.max(...voice.segments.map((s) => s.voiceEnd));
export const TT001_SECONDS = Math.ceil((lastEnd + 1.2) * 10) / 10;

// ── poses reales (ver public/art/mascotas/_manifest.json) ──
const M = {
  base: "timoteo/base/timoteo_base_frente_04", surp: "timoteo/emocion/timoteo_emocion_frente_07", think: "timoteo/mirada/timoteo_mirada_frente_01",
  up: "timoteo/mirada/timoteo_mirada_frente_02", jump: "timoteo/salto/timoteo_salto_frente_01", laugh: "timoteo/emocion/timoteo_emocion_frente_08", happy: "timoteo/emocion/timoteo_emocion_frente_04", blink: "timoteo/parpadeo/timoteo_parpadeo_frente_02",
};
const TE = {
  base: "teresa/base/teresa_base_frente_06", look: "teresa/mirada/teresa_mirada_izq_02", up: "teresa/mirada/teresa_mirada_frente_02", jump: "teresa/salto/teresa_salto_frente_01", bark: "teresa/habla/teresa_habla_frente_01", blink: "teresa/parpadeo/teresa_parpadeo_frente_02",
};
const meta = (k: string) => (META as any)[`art/mascotas/${k}.png`] as { w: number; h: number; top: number; bottom: number };
const REF_M = meta(M.base), REF_T = meta(TE.base);

const Sprite: React.FC<{ k: string; ref_: { top: number; bottom: number }; x: number; footY: number; h: number; rot?: number; sx?: number; sy?: number; silhouette?: boolean; blur?: number; opacity?: number; style?: React.CSSProperties }> = ({ k, ref_, x, footY, h, rot = 0, sx = 1, sy = 1, silhouette, blur = 0, opacity = 1, style }) => {
  const m = meta(k);
  const sc = h / (ref_.bottom - ref_.top);
  return (
    <Img
      src={staticFile(`art/mascotas/${k}.png`)}
      style={{
        position: "absolute", left: x - (m.w / 2) * sc, top: footY - m.bottom * sc, width: m.w * sc, height: m.h * sc,
        transformOrigin: `50% ${(m.bottom / m.h) * 100}%`, transform: `rotate(${rot}deg) scale(${sx}, ${sy})`,
        filter: silhouette ? `brightness(0) blur(${blur}px)` : "drop-shadow(0 8px 10px rgba(30,15,5,0.22))", opacity, ...style,
      }}
    />
  );
};

const seg = (id: string): VoiceSegment => voice.segments.find((s) => s.id === id)!;
const ws = (s: VoiceSegment, needle: string) => (s.words.find((w) => w.text.toLowerCase().includes(needle)) ?? s.words[0]).start;
const T = {
  question: seg("s2").voiceStart, acerco: ws(seg("s3"), "acerca"), crece: ws(seg("s3"), "crece"), s3End: seg("s3").voiceEnd,
  alejo: ws(seg("s4"), "aleja"), s4End: seg("s4").voiceEnd, fit: seg("s5").voiceStart, hello: seg("s6").voiceStart, helloEnd: seg("s6").voiceEnd,
};
const LAMP_X = 270, LAMP_Y = 1265;
const XL = (LAMP_X - CX) / 520;
const D_KEYS: Array<[number, number]> = [[0, D_START], [T.acerco - 0.1, D_START], [T.crece + 0.25, D_NEAR], [T.alejo - 0.15, D_NEAR], [T.s4End + 0.1, D_FIT], [30, D_FIT]];

const timoPose = (t: number) => {
  if (t < T.question) return M.surp;
  if (t < T.acerco - 0.1) return M.think;
  if (t < T.crece) return M.base;
  if (t < T.alejo - 0.3) return M.surp;
  if (t < T.fit) return M.up;
  if (t < T.fit + 1.4) return M.jump;
  if (t < T.hello) return M.laugh;
  return M.happy;
};
const terePose = (t: number) => {
  if (t < T.question) return TE.look;
  if (t < T.alejo - 0.3) return TE.base;
  if (t < T.fit) return TE.up;
  if (t < T.fit + 1.4) return TE.jump;
  if (t < T.hello) return TE.bark;
  return TE.base;
};

const SFX: Sfx[] = [
  { at: 0.05, name: "pop", volume: 0.4 }, { at: 0.3, name: "yip", volume: 0.4 }, { at: T.question, name: "think", volume: 0.3 },
  { at: T.acerco - 0.1, name: "pawstep", volume: 0.4 }, { at: T.crece - 0.05, name: "yip", volume: 0.4 }, { at: T.alejo - 0.3, name: "pawstep", volume: 0.35 },
  { at: T.s4End + 0.12, name: "sparkle", volume: 0.4 }, { at: T.fit, name: "yip", volume: 0.5 }, { at: T.fit + 0.1, name: "woof", volume: 0.45 }, { at: T.fit + 0.2, name: "tada", volume: 0.35 }, { at: T.hello, name: "heart", volume: 0.45 },
];

export const Tt001Sombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps; const tq = stepTime(frame, fps, 24); const step = Math.floor(tq * 12);
  const d = keys(tq, D_KEYS); const dPrev = keys(Math.max(0, tq - 0.1), D_KEYS);
  const moving = Math.abs(d - dPrev) > 0.004;
  const k = (D - d) / D;
  const footY = WALL_Y + (LAMP_Y - WALL_Y) * k;
  const timoH = 300 + 220 * k;
  const lateral = XL * (1 - d / D);
  const timoX = CX + lateral * timoH;
  const hop = hops(tq, 0.3, 1, 0.45, 55) + hops(tq, T.crece - 0.05, 1, 0.45, 40) + hops(tq, T.fit, 3, 0.42, 70);
  const bob = (moving ? Math.abs(Math.sin(step * 1.1)) * 14 : 0) + hop;
  const rot = moving ? (step % 2 ? 2.5 : -2.5) : Math.sin(tq * 2.2) * 1.2;
  const pose = timoPose(tq) === M.base && [0.9, 2.7].some((b) => false) ? M.blink : timoPose(tq);
  const blinkT = Math.floor(tq * 10) % 37 === 0 ? TE.blink : null;

  const s = D / d;
  const shH = s * PW;
  const shBottomY = WALL_Y + LAMP_H * (s - 1) * PW - s * (hop / timoH) * PW;
  const shX = CX + s * (timoX - CX) / timoH * PW * 0; // sombra centrada en la pared
  const shBlur = 3 + (s - 1) * 2.4;
  const shRef = { top: REF_M.top, bottom: REF_M.bottom };

  const askGlow = t > T.question - 0.1 && t < T.acerco ? 0.5 + 0.5 * Math.sin((t - T.question) * 7) : 0;
  const fitGlow = keys(t, [[T.s4End - 0.3, 0], [T.s4End + 0.2, 1], [T.hello + 1.2, 0.55]]);
  const fx = FRAME.x0, fw = FRAME.x1 - FRAME.x0, fy = FRAME.y0, fh = FRAME.y1 - FRAME.y0;
  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const brandOp = keys(t, [[TT001_SECONDS - 0.9, 0], [TT001_SECONDS - 0.4, 1]]);
  const cam = cameraAt(t, { question: T.question, acerco: T.acerco, crece: T.crece, alejo: T.alejo, s4End: T.s4End, fit: T.fit });
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${cam.scale}) translate(${-cam.cx}px, ${-cam.cy}px)`;
  const tereJump = t >= T.fit && t < T.fit + 1.4 ? -Math.abs(Math.sin(((t - T.fit) / 0.35) * Math.PI)) * 70 : 0;

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
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, background: "rgba(255,238,180,0.20)", borderRadius: "30px 30px 0 0" }} />
        {/* SOMBRA de Timo en la pared (misma pose, misma escala geométrica) */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Sprite k={pose} ref_={shRef} x={CX} footY={shBottomY} h={shH} rot={rot * 0.5} silhouette blur={shBlur} opacity={0.82} style={{ mixBlendMode: "multiply" }} />
        </div>
        <div style={{ position: "absolute", left: fx - 26, top: fy - 26, width: fw + 52, height: fh + 26, boxSizing: "border-box", border: `26px solid ${C.coral}`, borderBottom: "none", borderRadius: "56px 56px 0 0", boxShadow: `0 0 ${24 + 40 * (askGlow + fitGlow)}px ${6 + 14 * (askGlow + fitGlow)}px rgba(255,214,90,${0.25 + 0.5 * Math.max(askGlow * 0.6, fitGlow)}), inset 0 0 0 5px rgba(255,255,255,0.35)`, pointerEvents: "none" }} />
        {t > T.s4End && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            {[[-1, -1], [1, -1], [0, -1.35], [-1.25, 0.2], [1.25, 0.2]].map(([ox, oy], i) => {
              const sc = pop(t, T.s4End + 0.05 + i * 0.07, 0.35) * (1 - keys(t, [[T.s4End + 1.4, 0], [T.s4End + 2.0, 1]]));
              return <text key={i} x={CX + ox * 230} y={fy + 80 + (oy + 1) * 120} fontSize={70 * sc} textAnchor="middle" fill={C.warmYellow} fontFamily={FONT}>★</text>;
            })}
          </svg>
        )}
        {/* Tere, en primer plano a la derecha, mira y acompaña */}
        <div style={{ position: "absolute", left: 790, top: 1285, width: 250, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.4)", filter: "blur(10px)", opacity: Math.max(0.3, 1 + tereJump / 160) }} />
        <Sprite k={blinkT ?? terePose(tq)} ref_={REF_T} x={905} footY={1300} h={390} rot={0} style={{ transform: `translateY(${tereJump}px)` }} />
        {/* contacto de Timo y Timo */}
        <div style={{ position: "absolute", left: timoX - timoH * 0.3, top: footY - timoH * 0.04, width: timoH * 0.6, height: timoH * 0.12, borderRadius: "50%", background: "rgba(0,0,0,0.38)", filter: "blur(10px)", opacity: Math.max(0.3, 1 - bob / 160) }} />
        <Sprite k={pose} ref_={REF_M} x={timoX} footY={footY - bob} h={timoH} rot={rot} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Hearts t={t} start={T.hello} dur={1.6} x={timoX + 60} y={footY - timoH * 0.9} rise={230} n={4} />
          <Hearts t={t} start={T.helloEnd + 0.15} dur={1.2} x={timoX + 100} y={footY - timoH * 0.9} rise={200} n={5} size={1.15} color="#F6C945" />
        </svg>
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}><Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} /></div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />
      </AbsoluteFill>
      <Grain />
      <div style={{ position: "absolute", top: SAFE.subtitleY, height: SAFE.subtitleH, left: 0, width: W - SAFE.right, display: "flex", alignItems: "center", justifyContent: "center", opacity: brandOp }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 50, color: C.cream, background: "rgba(18,60,64,0.8)", padding: "8px 30px 12px", borderRadius: 40 }}>Timo y Tere</div>
      </div>
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <MusicTrack src="audio/music/linterna.wav" voice={voice} totalSec={TT001_SECONDS} base={0.2} duckTo={0.1} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
