import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Burst, DOG_VIEWS, FaceInset, K, QMark, type DogView } from "../shared/Dogs";
import { PuppetDog, blinkAt, earTwitch, idleHead } from "../shared/PuppetDog";
import { Dust, Vignette, handheld } from "../shared/Fx";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { C, H, W } from "../shared/theme";
import { hash, hopSquash, keys, pop, stepTime } from "../shared/motion";

export const PRUEBA_SOMBRA_SECONDS = 13.0;

/* Geometría (misma idea que el Short «La sombra gigante»): linterna y pared FIJAS (D); la sombra de cada perro es la silueta de su
 * PROPIO títere (con la misma cabeza ladeada, orejas y respiración), escalada por s = D/d desde la altura de la linterna. */
const D = 4.8, LAMP_H = 0.1, PW = 300, WALL_Y = 768, CX = W / 2, LAMP_X = 270, LAMP_Y = 1265;
const XL = (LAMP_X - CX) / 500;
const hpx = (d: number) => 300 + 200 * ((D - d) / D);
const footY = (d: number) => WALL_Y + (LAMP_Y - WALL_Y) * ((D - d) / D);
const shadowX = (x: number, d: number) => CX + (XL + (D / d) * ((x - CX) / hpx(d) - XL)) * PW;

const TM = { notice: 1.3, retreat: 1.9, tEnter: 3.0, flick: 5.9, aha: 6.3, demo: 6.9, tender: 10.3, end: 12.4 };
const mD: Array<[number, number]> = [[0, 1.9], [1.25, 1.9], [3.0, 2.5], [6.5, 2.5], [7.0, 2.0], [7.5, 1.5], [8.0, 1.5], [8.6, 2.7], [9.0, 2.0], [9.4, 1.5], [9.8, 1.5], [10.4, 2.6], [30, 2.6]];
const tPath: Array<[number, number]> = [[0, 1420], [TM.tEnter, 1420], [4.7, 800], [5.4, 770], [9.9, 770], [11.0, 640], [30, 640]];
const SFX: Sfx[] = [
  { at: 0.1, name: "think", volume: 0.25 }, { at: TM.notice, name: "yip", volume: 0.55 }, { at: TM.notice + 0.05, name: "tap", volume: 0.4 },
  ...[2.0, 2.35, 2.7].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  ...[3.2, 3.55, 3.9, 4.25, 4.6].map((at) => ({ at, name: "pawstep", volume: 0.32 })),
  { at: 4.9, name: "sniff", volume: 0.3 }, { at: TM.flick, name: "ding", volume: 0.3 },
  { at: TM.aha, name: "discover", volume: 0.55 }, { at: TM.aha + 0.05, name: "woof", volume: 0.4 }, { at: TM.aha + 0.2, name: "sparkle", volume: 0.3 },
  { at: 6.9, name: "whoosh", volume: 0.3 }, { at: 7.4, name: "yip", volume: 0.3 }, { at: 8.7, name: "whoosh", volume: 0.3 }, { at: 9.35, name: "yip", volume: 0.3 }, { at: 9.9, name: "woof", volume: 0.28 },
  { at: TM.tender + 0.4, name: "heart", volume: 0.4 }, { at: 11.9, name: "tada", volume: 0.35 },
];

export const PruebaSombra: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 12);
  const step = Math.floor(tq * 12);

  // ── Timoteo ──
  const d = keys(tq, mD);
  const dPrev = keys(Math.max(0, tq - 0.09), mD);
  const mMoving = Math.abs(d - dPrev) > 0.003;
  const hp = hpx(d);
  const mx = CX + XL * (1 - d / D) * hp + keys(tq, [[0, 0], [10.2, 0], [11.2, 70], [30, 70]]);
  const hopN = hopSquash(tq, TM.notice, 0.6, 80);
  const hopA = hopSquash(tq, TM.aha + 0.3, 0.5, 40), hopB = hopSquash(tq, TM.aha + 0.9, 0.5, 40);
  const hopM = tq >= TM.notice && tq < TM.notice + 0.6 ? hopN : tq >= TM.aha + 0.3 && tq < TM.aha + 0.8 ? hopA : tq >= TM.aha + 0.9 && tq < TM.aha + 1.4 ? hopB : { dy: 0, sy: 1 };
  const idleM = idleHead(tq, 1), earsM = earTwitch(tq, 2);
  let mEarL = earsM.l, mEarR = earsM.r;
  if (tq >= TM.flick && tq < TM.flick + 0.4) { const u = Math.sin(((tq - TM.flick) / 0.4) * Math.PI); mEarL = 18 * u; mEarR = -4 * u; } // el GUIÑO de oreja que delata la sombra
  if (tq >= 7.4 && tq < 8.2) { mEarL = 14 * Math.sin(tq * 26); mEarR = -14 * Math.sin(tq * 26 + 1); } // «orejas de conejo»
  if (tq >= TM.notice && tq < TM.notice + 0.9) { mEarL = 10; mEarR = -10; } // susto: orejas paradas
  if (mMoving) { mEarL += 9 * Math.sin(step * 1.25); mEarR += -9 * Math.sin(step * 1.25 + 0.5); }
  const cower = tq >= 3.0 && tq < 5.9;
  const mHeadRot = idleM.headRot + (cower ? -9 + 2.5 * Math.sin(tq * 5) : 0) + (tq >= TM.tender ? 9 : 0) + (tq >= 7.0 && tq < 10 ? 7 * Math.sin(tq * 2) : 0);
  const mHeadDy = idleM.headDy + (cower ? 12 : 0);
  const mView: DogView = tq < TM.notice ? "m_front" : tq >= TM.aha - 0.1 && tq < 6.9 ? "m_front" : "m_tq";
  const mBob = (mMoving ? Math.abs(Math.sin(step * 1.25)) * 14 : 0) + hopM.dy;
  const mK = hp / DOG_VIEWS.m_front.h;
  const mFoot = footY(d);
  const mBlink = blinkAt(tq, 1);

  // ── Teresa ──
  const txx = keys(tq, tPath);
  const tMoving = Math.abs(txx - keys(Math.max(0, tq - 0.09), tPath)) > 0.4;
  const tDepth = keys(tq, [[0, 2.5], [10.0, 2.5], [11.0, 2.7], [30, 2.7]]);
  const tFoot = footY(tDepth);
  const tScale = (hpx(tDepth) / DOG_VIEWS.m_front.h) * (K.t / K.m) * 0.98;
  const idleT = idleHead(tq, 4), earsT = earTwitch(tq, 7);
  const hopT1 = hopSquash(tq, TM.aha, 0.6, 62), hopT2 = hopSquash(tq, 7.6, 0.5, 34), hopT3 = hopSquash(tq, 9.6, 0.5, 34);
  const hopT = tq >= TM.aha && tq < TM.aha + 0.6 ? hopT1 : tq >= 7.6 && tq < 8.1 ? hopT2 : tq >= 9.6 && tq < 10.1 ? hopT3 : { dy: 0, sy: 1 };
  const tView: DogView = tq < 4.6 ? "t_side" : tq >= TM.aha && tq < TM.aha + 1.1 ? "t_front" : "t_tq";
  const lookShadow = tq >= 4.8 && tq < TM.flick; // inclina la cabeza mirando la sombra
  const tHeadRot = idleT.headRot + (lookShadow ? 11 * Math.sin((tq - 4.8) * 3.2) : 0) + (tq >= TM.tender ? -9 : 0) + (tq >= 7 && tq < 10 ? -6 * Math.sin(tq * 2 + 1) : 0);
  const tBob = (tMoving ? Math.abs(Math.sin(step * 1.05 + 1)) * 11 : 0) + hopT.dy;
  const tRot = tView === "t_side" ? (tMoving ? (step % 2 ? 1.6 : -1.6) : 0) : hash(3, step) * 0.5;

  // ── sombras (silueta del MISMO títere: orejas, cabeza ladeada y respiración incluidas) ──
  const s = D / d;
  const mShH = s * PW * (hp / hpx(d));
  const mShK = mShH / DOG_VIEWS[mView].h;
  const ratio = mShK / mK;
  const mShBottom = WALL_Y + LAMP_H * (s - 1) * PW - s * (hopM.dy / hp) * PW;
  const sx0 = shadowX(mx, d);
  const sT = D / tDepth;
  const tIn = keys(t, [[9.9, 0], [10.6, 1]]);
  const tShView: DogView = tView === "t_front" ? "t_front" : "t_tq";
  const tShK = (sT * PW) / DOG_VIEWS[tShView].h * 1.02;
  const tShBottom = WALL_Y + LAMP_H * (sT - 1) * PW - sT * (hopT.dy / hpx(tDepth)) * PW;

  // ── cámara: general + primeros planos de emoción ──
  const camS = keys(t, [[0, 1.04], [0.9, 1.04], [1.35, 1.5], [2.5, 1.5], [3.1, 1.04], [5.8, 1.04], [6.2, 1.5], [7.3, 1.5], [7.8, 1.04], [10.0, 1.04], [10.5, 1.35], [11.9, 1.35], [13.0, 1.08]]);
  const camX = keys(t, [[0, 540], [0.9, 540], [1.35, 440], [2.5, 440], [3.1, 540], [5.8, 540], [6.2, 640], [7.3, 640], [7.8, 540], [10.0, 540], [10.5, 560], [13, 540]]);
  const camY = keys(t, [[0, 960], [0.9, 960], [1.35, 900], [2.5, 900], [3.1, 960], [5.8, 960], [6.2, 840], [7.3, 840], [7.8, 960], [10.0, 960], [10.5, 900], [13, 950]]);
  const hh = handheld(t, 2.4);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-(camX + hh.x)}px, ${-(camY + hh.y)}px)`;

  const lampGlow = 0.8 + 0.2 * Math.sin(t * 6);
  const qOp = keys(t, [[4.8, 0], [5.0, 1], [5.8, 1], [5.9, 0]]);
  const burstM = keys(t, [[TM.notice, 0], [TM.notice + 0.1, 1], [TM.notice + 1.0, 1], [TM.notice + 1.3, 0]]);
  const burstT = keys(t, [[TM.aha, 0], [TM.aha + 0.1, 1], [TM.aha + 1.0, 1], [TM.aha + 1.3, 0]]);
  const earOp = keys(t, [[TM.aha + 0.3, 0], [TM.aha + 0.6, 1], [7.7, 1], [8.0, 0]]);
  const insetM = keys(t, [[1.5, 0], [1.7, 1], [2.5, 1], [2.8, 0]]);
  const insetT = keys(t, [[TM.aha + 0.3, 0], [TM.aha + 0.55, 1], [7.4, 1], [7.7, 0]]);
  const insetEnd = keys(t, [[10.6, 0], [10.9, 1], [12.3, 1], [12.6, 0]]);
  const ears = [[0.2, 0.13], [0.78, 0.1]];
  const mw = DOG_VIEWS[mView].w * mK, mh = DOG_VIEWS[mView].h * mK;
  const shW = mShH * (DOG_VIEWS[mView].w / DOG_VIEWS[mView].h);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <RoomBg floorBrightness={0.66} />
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

        {/* SOMBRAS: silueta del títere completo */}
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: WALL_Y, overflow: "hidden" }}>
          <PuppetDog view={mView} x={sx0} y={mShBottom} k={mShK} sy={hopM.sy * idleM.sy} headRot={mHeadRot} headDx={0} headDy={mHeadDy * ratio} earL={mEarL} earR={mEarR} blink={0}
            silhouette blur={3 + (s - 1) * 2.2} opacity={0.82} style={{ mixBlendMode: "multiply" }} />
          {tIn > 0 && <PuppetDog view={tShView} x={shadowX(txx, tDepth)} y={tShBottom} k={tShK} sy={hopT.sy} headRot={tHeadRot} silhouette blur={3 + (sT - 1) * 2.2} opacity={0.82 * tIn} style={{ mixBlendMode: "multiply" }} />}
          {earOp > 0 && (
            <svg width={W} height={WALL_Y} style={{ position: "absolute", left: 0, top: 0, opacity: earOp }}>
              {ears.map(([ex, ey], i) => <circle key={i} cx={sx0 - shW / 2 + ex * shW} cy={mShBottom - mShH + ey * mShH} r={Math.max(24, shW * 0.13)} fill="none" stroke={C.warmYellow} strokeWidth={8} strokeDasharray="14 10" />)}
            </svg>
          )}
        </div>

        <div style={{ position: "absolute", left: mx - mw * 0.4, top: mFoot - 40, width: mw * 0.8, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.38)", filter: "blur(10px)" }} />
        <div style={{ position: "absolute", left: txx - 150, top: tFoot - 40, width: 300, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.38)", filter: "blur(10px)" }} />
        <PuppetDog view={tView} x={txx} y={tFoot - tBob} k={tScale} sy={hopT.sy * idleT.sy} rot={tRot} headRot={tHeadRot} headDy={idleT.headDy} earL={earsT.l} earR={earsT.r} blink={blinkAt(tq, 5)} />
        <PuppetDog view={mView} x={mx} y={mFoot - mBob} k={mK} sy={hopM.sy * idleM.sy} rot={mMoving ? (step % 2 ? 2.5 : -2.5) : 0} headRot={mHeadRot} headDy={mHeadDy} earL={mEarL} earR={mEarR} blink={mBlink} />
        {earOp > 0 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, opacity: earOp, pointerEvents: "none" }}>
            {ears.map(([ex, ey], i) => <circle key={i} cx={mx - mw / 2 + ex * mw} cy={mFoot - mBob - mh + ey * mh} r={Math.max(22, mw * 0.14)} fill="none" stroke={C.warmYellow} strokeWidth={7} strokeDasharray="12 9" />)}
            {ears.map(([ex, ey], i) => <line key={`l${i}`} x1={mx - mw / 2 + ex * mw} y1={mFoot - mBob - mh + ey * mh - 26} x2={sx0 - shW / 2 + ex * shW} y2={mShBottom - mShH + ey * mShH + 28} stroke={C.warmYellow} strokeWidth={4} strokeDasharray="4 12" strokeLinecap="round" opacity={0.8} />)}
          </svg>
        )}
        <div style={{ position: "absolute", left: LAMP_X - 125, top: LAMP_Y - 281, width: 250, height: 281 }}><Img src={staticFile("art/generated/flashlight.png")} style={{ width: "100%", height: "100%" }} /></div>
        <div style={{ position: "absolute", left: LAMP_X + 20, top: LAMP_Y - 330, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,240,170,0.95), rgba(255,220,120,0) 70%)", opacity: lampGlow }} />

        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          {burstM > 0 && <g opacity={burstM}><Burst x={mx + 40} y={mFoot - mBob - mh - 30} s={0.8 + 0.25 * pop(t, TM.notice, 0.25)} /></g>}
          {qOp > 0 && <g opacity={qOp}><QMark x={txx - 20} y={tFoot - tBob - DOG_VIEWS[tView].h * tScale - 40} s={0.9 + 0.08 * Math.sin(t * 6)} /></g>}
          {burstT > 0 && <g opacity={burstT}><Burst x={txx - 30} y={tFoot - tBob - DOG_VIEWS[tView].h * tScale - 30} s={0.8 + 0.25 * pop(t, TM.aha, 0.25)} /></g>}
          <Hearts t={t} start={TM.tender + 0.4} dur={1.6} x={(mx + txx) / 2} y={mFoot - mh * 0.9} rise={230} n={6} />
        </svg>
      </AbsoluteFill>

      <Dust t={t} opacity={0.4} />
      <Vignette />
      <Grain />

      {insetM > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={Math.sin(tq * 8) * 5} zoom={1 + 0.06 * Math.sin(t * 9)} scale={pop(t, 1.7, 0.3) * insetM + 0.001} />}
      {insetT > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} ring={C.warmYellow} zoom={1 + 0.05 * Math.sin(t * 7)} scale={pop(t, TM.aha + 0.55, 0.3) * insetT + 0.001} />}
      {insetEnd > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} ring={C.coral} scale={pop(t, 10.9, 0.3) * insetEnd + 0.001} />}
      {insetEnd > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={-6} ring={C.coral} scale={pop(t, 10.9, 0.3) * insetEnd + 0.001} />}

      <MusicTrack src="audio/music/casita.wav" totalSec={PRUEBA_SOMBRA_SECONDS} base={0.3} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
