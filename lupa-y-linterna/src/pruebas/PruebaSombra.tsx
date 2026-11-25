import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Burst, Dog, DOG_VIEWS, FaceInset, K, QMark, type DogView } from "../shared/Dogs";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { C, H, W } from "../shared/theme";
import { hash, hops, keys, pop, stepTime } from "../shared/motion";

export const PRUEBA_SOMBRA_SECONDS = 10.4;

/* Geometría (misma idea que el Short «La sombra gigante»): linterna y pared FIJAS (D); la sombra de cada perro es la silueta
 * de su propio sprite, escalada por s = D/d (d = distancia perro–linterna) desde la altura de la linterna. */
const D = 4.8, LAMP_H = 0.1, PW = 300, WALL_Y = 768, CX = W / 2, LAMP_X = 270, LAMP_Y = 1265;
const UNIT_LAMP = 500;
const XL = (LAMP_X - CX) / UNIT_LAMP;
const hpx = (d: number) => 300 + 200 * ((D - d) / D); // alto en pantalla de «1 Timoteo» a esa distancia de la luz
const footY = (d: number) => WALL_Y + (LAMP_Y - WALL_Y) * ((D - d) / D);
const shadowX = (x: number, d: number) => CX + (XL + (D / d) * ((x - CX) / hpx(d) - XL)) * PW;

const T_DUR = PRUEBA_SOMBRA_SECONDS;
// Timoteo: distancia a la luz (lo único que cambia respecto de la luz) y posición lateral
const mD = (t: number) => keys(t, [[0, 1.9], [1.25, 1.9], [2.7, 2.4], [5.2, 2.4], [6.9, 2.4], [7.5, 1.5], [8.0, 1.5], [8.9, 2.7], [30, 2.7]]);
const mXat = (t: number, d: number) => {
  const base = CX + XL * (1 - d / D) * hpx(d);
  return base + keys(t, [[0, 0], [8.6, 0], [9.6, 60], [30, 60]]);
};
const tX = (t: number) => keys(t, [[0, 1400], [2.4, 1400], [4.1, 830], [5.0, 790], [8.4, 790], [9.5, 640], [30, 640]]);
const SFX: Sfx[] = [
  { at: 0.1, name: "think", volume: 0.25 },
  { at: 1.2, name: "yip", volume: 0.5 }, { at: 1.3, name: "tap", volume: 0.4 },
  ...[1.5, 1.85, 2.2, 2.55].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  ...[2.7, 3.05, 3.4, 3.75, 4.1].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 4.3, name: "sniff", volume: 0.3 },
  { at: 5.3, name: "discover", volume: 0.5 }, { at: 5.35, name: "sparkle", volume: 0.3 }, { at: 5.45, name: "woof", volume: 0.3 },
  { at: 6.9, name: "whoosh", volume: 0.3 }, { at: 7.5, name: "yip", volume: 0.3 }, { at: 8.2, name: "woof", volume: 0.25 },
  { at: 9.0, name: "heart", volume: 0.4 }, { at: 9.3, name: "tada", volume: 0.3 },
];

export const PruebaSombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 12);
  const step = Math.floor(tq * 12);

  // ── Timoteo
  const d = mD(tq);
  const dPrev = mD(Math.max(0, tq - 0.09));
  const mMoving = Math.abs(d - dPrev) > 0.003;
  const hp = hpx(d);
  const mx = mXat(tq, d);
  const hopM = hops(tq, 1.2, 1, 0.4, 70) + hops(tq, 5.3, 2, 0.38, 45) + hops(tq, 9.0, 2, 0.4, 35);
  const mBob = (mMoving ? Math.abs(Math.sin(step * 1.25)) * 14 : 0) + hopM;
  let mView: DogView = "m_front";
  if (t >= 1.2) mView = "m_tq";
  if (t >= 5.3 && t < 6.8) mView = "m_front";
  if (t >= 6.8) mView = "m_tq";
  const mK = (hp / DOG_VIEWS.m_front.h) * 1.0; // escala: «1 Timoteo» sentado de frente = hp px
  const mRot = mMoving ? (step % 2 ? 3 : -3) : hash(2, step) * 0.8;
  const mFoot = footY(d);

  // ── Teresa
  const txx = tX(tq);
  const tMoving = Math.abs(txx - tX(Math.max(0, tq - 0.09))) > 0.4;
  const tD = Math.min(d, 2.5) + 0; // Teresa camina por el piso a una distancia parecida (fuera del haz hasta el final)
  const tDepth = keys(tq, [[0, 2.5], [8.4, 2.5], [9.5, 2.7], [30, 2.7]]);
  const tFoot = footY(tDepth);
  const tScale = (hpx(tDepth) / DOG_VIEWS.m_front.h) * (K.t / K.m) * 0.98;
  let tView: DogView = "t_side";
  if (t >= 4.1) tView = "t_tq";
  if (t >= 5.3 && t < 6.8) tView = "t_front";
  if (t >= 6.8) tView = "t_tq";
  const hopT = hops(tq, 5.35, 2, 0.38, 50) + hops(tq, 7.5, 1, 0.4, 30) + hops(tq, 9.1, 2, 0.4, 30);
  const tBob = (tMoving ? Math.abs(Math.sin(step * 1.1 + 1)) * 11 : 0) + hopT;
  const tRot = tMoving ? (step % 2 ? 2 : -2) : hash(3, step) * 0.7;
  void tD;

  // ── sombras sobre la pared (recorte en la línea pared–piso)
  const s = D / d;
  const mShH = s * PW * (hp / hpx(d));
  const mShBottom = WALL_Y + LAMP_H * (s - 1) * PW - s * (hopM / hp) * PW;
  const mShBlur = 3 + (s - 1) * 2.2;
  const tIn = keys(t, [[9.0, 0], [9.6, 1]]); // Teresa entra en la luz al final → aparece su sombra
  const sT = D / tDepth;
  const tShH = sT * PW * (hpx(tDepth) / hpx(tDepth)) * 1.02;
  const tShBottom = WALL_Y + LAMP_H * (sT - 1) * PW - sT * (hopT / hpx(tDepth)) * PW;

  // ── cámara: general; primeros planos en la sorpresa y en el descubrimiento
  const camS = keys(t, [[0, 1], [0.9, 1], [1.4, 1.35], [2.3, 1.35], [3.0, 1], [4.9, 1], [5.4, 1.45], [6.6, 1.45], [7.2, 1], [30, 1]]);
  const camX = keys(t, [[0, 540], [0.9, 540], [1.4, 430], [2.3, 430], [3.0, 540], [4.9, 540], [5.4, 600], [6.6, 600], [7.2, 540]]);
  const camY = keys(t, [[0, 960], [0.9, 960], [1.4, 880], [2.3, 880], [3.0, 960], [4.9, 960], [5.4, 800], [6.6, 800], [7.2, 960]]);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-camX}px, ${-camY}px)`;

  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const qOp = keys(t, [[4.15, 0], [4.35, 1], [5.2, 1], [5.35, 0]]);
  const burstM = keys(t, [[1.2, 0], [1.3, 1], [2.1, 1], [2.4, 0]]);
  const burstT = keys(t, [[5.3, 0], [5.4, 1], [6.4, 1], [6.7, 0]]);
  const earOp = keys(t, [[5.6, 0], [5.9, 1], [7.0, 1], [7.3, 0]]);
  const insetM = keys(t, [[1.3, 0], [1.5, 1], [2.3, 1], [2.6, 0]]);
  const insetT = keys(t, [[5.4, 0], [5.65, 1], [6.7, 1], [7.0, 0]]);
  const insetEnd = keys(t, [[9.0, 0], [9.3, 1], [10.2, 1]]);

  // orejas (para marcar que la sombra y Timoteo tienen las MISMAS orejas)
  const ears = [[0.2, 0.13], [0.78, 0.1]];
  const mw = DOG_VIEWS[mView].w * mK, mh = DOG_VIEWS[mView].h * mK;
  const shW = mShH * (DOG_VIEWS[mView].w / DOG_VIEWS[mView].h);
  const sx0 = shadowX(mx, d);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <RoomBg floorBrightness={0.66} />
        {/* luz */}
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="34" /></filter>
            <mask id="beamHole"><rect width={W} height={H} fill="white" /><g filter="url(#soft)" fill="black"><ellipse cx={CX} cy={400} rx={620} ry={470} /><polygon points={`${LAMP_X + 60},${LAMP_Y - 270} ${LAMP_X + 170},${LAMP_Y - 250} ${W + 160},${WALL_Y - 40} ${-60},${WALL_Y - 40}`} /></g></mask>
            <radialGradient id="warm"><stop offset="0" stopColor="#FFE9A8" stopOpacity="0.75" /><stop offset="1" stopColor="#FFD36B" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={W} height={H} fill="#06151C" opacity={0.62} mask="url(#beamHole)" />
          <g filter="url(#soft)" opacity={0.42 * lampGlow} style={{ mixBlendMode: "screen" }}>
            <ellipse cx={CX} cy={400} rx={520} ry={400} fill="url(#warm)" />
            <polygon points={`${LAMP_X + 80},${LAMP_Y - 270} ${LAMP_X + 160},${LAMP_Y - 255} ${W},${WALL_Y} ${0},${WALL_Y}`} fill="#FFDD88" opacity={0.55} />
          </g>
        </svg>

        {/* SOMBRAS (silueta del mismo sprite) */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <Dog view={mView} x={sx0} y={mShBottom} k={mShH / DOG_VIEWS[mView].h} rot={mRot * 0.4} silhouette blur={mShBlur} opacity={0.82} style={{ mixBlendMode: "multiply" }} />
          {tIn > 0 && <Dog view={tView === "t_front" ? "t_front" : "t_tq"} x={shadowX(txx, tDepth)} y={tShBottom} k={tShH / DOG_VIEWS[tView === "t_front" ? "t_front" : "t_tq"].h} silhouette blur={3 + (sT - 1) * 2.2} opacity={0.82 * tIn} style={{ mixBlendMode: "multiply" }} />}
          {earOp > 0 && (
            <svg width={W} height={WALL_Y} style={{ position: "absolute", left: 0, top: 0, opacity: earOp }}>
              {ears.map(([ex, ey], i) => <circle key={i} cx={sx0 - shW / 2 + ex * shW} cy={mShBottom - mShH + ey * mShH} r={Math.max(24, shW * 0.13)} fill="none" stroke={C.warmYellow} strokeWidth={8} strokeDasharray="14 10" />)}
            </svg>
          )}
        </div>

        {/* lámpara (más cerca de cámara: delante) y perros */}
        <div style={{ position: "absolute", left: mx - mw * 0.4, top: mFoot - 40, width: mw * 0.8, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.38)", filter: "blur(10px)" }} />
        <div style={{ position: "absolute", left: txx - 150, top: tFoot - 40, width: 300, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.38)", filter: "blur(10px)" }} />
        <Dog view={tView} x={txx} y={tFoot - tBob} k={tScale} rot={tRot} />
        <Dog view={mView} x={mx} y={mFoot - mBob} k={mK} rot={mRot} />
        {earOp > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: earOp, pointerEvents: "none" }}>
            {ears.map(([ex, ey], i) => <circle key={i} cx={mx - mw / 2 + ex * mw} cy={mFoot - mBob - mh + ey * mh} r={Math.max(22, mw * 0.14)} fill="none" stroke={C.warmYellow} strokeWidth={7} strokeDasharray="12 9" />)}
            {ears.map(([ex, ey], i) => <line key={`l${i}`} x1={mx - mw / 2 + ex * mw} y1={mFoot - mBob - mh + ey * mh - 26} x2={sx0 - shW / 2 + ex * shW} y2={mShBottom - mShH + ey * mShH + 28} stroke={C.warmYellow} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={0.8} />)}
          </svg>
        )}
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}><Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} /></div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />

        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          {burstM > 0 && <g opacity={burstM}><Burst x={mx + 40} y={mFoot - mBob - mh - 30} s={0.8 + 0.25 * pop(t, 1.2, 0.25)} /></g>}
          {qOp > 0 && <g opacity={qOp}><QMark x={txx - 20} y={tFoot - tBob - DOG_VIEWS[tView].h * tScale - 40} s={0.9 + 0.08 * Math.sin(t * 6)} /></g>}
          {burstT > 0 && <g opacity={burstT}><Burst x={txx - 30} y={tFoot - tBob - DOG_VIEWS[tView].h * tScale - 30} s={0.8 + 0.25 * pop(t, 5.35, 0.25)} /></g>}
          <Hearts t={t} start={9.0} dur={1.5} x={(mx + txx) / 2} y={mFoot - mh * 0.9} rise={220} n={5} />
        </svg>
      </AbsoluteFill>

      <Grain />

      {insetM > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={Math.sin(tq * 8) * 5} zoom={1 + 0.06 * Math.sin(t * 9)} scale={pop(t, 1.5, 0.3) * insetM + 0.001} />}
      {insetT > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} ring={C.warmYellow} zoom={1 + 0.05 * Math.sin(t * 7)} scale={pop(t, 5.65, 0.3) * insetT + 0.001} />}
      {insetEnd > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} ring={C.coral} scale={pop(t, 9.3, 0.3) * insetEnd + 0.001} />}
      {insetEnd > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={-6} ring={C.coral} scale={pop(t, 9.3, 0.3) * insetEnd + 0.001} />}

      <MusicTrack src="audio/music/casita.wav" totalSec={T_DUR} base={0.3} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
