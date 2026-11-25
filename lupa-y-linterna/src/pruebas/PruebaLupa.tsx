import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Burst, FaceInset, K, QMark, Sparkle, type DogView } from "../shared/Dogs";
import { CrossDog, PuppetDog, blinkAt, earTwitch, idleHead } from "../shared/PuppetDog";
import { Dust, LightShaft, Vignette, handheld } from "../shared/Fx";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { C, H, W } from "../shared/theme";
import { hash, hopSquash, keys, pop, stepTime, wobble } from "../shared/motion";

const clampC = (c: number, size: number, s: number) => Math.min(size - size / (2 * s) - 2, Math.max(size / (2 * s) + 2, c)); // la cámara nunca muestra fuera del escenario
export const PRUEBA_LUPA_SECONDS = 12.8;

// lupa (imagen recortada 481×929; hueco de la lente: centro (237,241), radio 163)
const LUPA = { s: 0.62, x: 540, base: 1240, lensX: 237.5, lensY: 241, lensR: 163, w: 481, h: 929 };
const lupaLeft = LUPA.x - (LUPA.w * LUPA.s) / 2, lupaTop = LUPA.base - LUPA.h * LUPA.s;
const LENS = { x: lupaLeft + LUPA.lensX * LUPA.s, y: lupaTop + LUPA.lensY * LUPA.s, r: LUPA.lensR * LUPA.s };
const FOOT_T = 1262, FOOT_M = 1252;
// hitos (s)
const TT = { macroEnd: 1.9, enter: 1.0, stop: 2.9, boop: 4.9, peer: 6.0, eye0: 6.9, eye1: 8.1, glow: 8.3, react: 9.2, nuzzle: 10.7, end: 12.2 };

const SFX: Sfx[] = [
  { at: 0.1, name: "sparkle", volume: 0.3 }, { at: 0.55, name: "whoosh", volume: 0.4 },
  ...[1.15, 1.5, 1.85, 2.2, 2.5].map((at) => ({ at, name: "pawstep", volume: 0.35 })),
  ...[1.3, 1.75, 2.2, 2.65].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 2.95, name: "think", volume: 0.3 }, { at: 3.9, name: "sniff", volume: 0.4 },
  { at: TT.boop, name: "ding", volume: 0.5 }, { at: TT.boop + 0.05, name: "yip", volume: 0.45 },
  { at: 5.6, name: "tap", volume: 0.3 }, { at: 6.7, name: "whoosh", volume: 0.35 }, { at: TT.eye0 + 0.5, name: "pop", volume: 0.4 },
  { at: 8.0, name: "whoosh", volume: 0.35 }, { at: 8.7, name: "discover", volume: 0.6 }, { at: 8.85, name: "sparkle", volume: 0.35 },
  { at: TT.react, name: "yip", volume: 0.55 }, { at: TT.react + 0.1, name: "woof", volume: 0.35 }, { at: TT.react + 0.2, name: "tada", volume: 0.25 },
  { at: TT.nuzzle + 0.3, name: "heart", volume: 0.4 }, { at: 12.0, name: "tada", volume: 0.35 },
];

const mPath: Array<[number, number]> = [[0, -90], [TT.enter, -90], [2.7, 300], [4.4, 300], [TT.boop + 0.4, 235], [5.5, 300], [TT.peer + 0.4, 392], [10.2, 392], [TT.nuzzle + 0.6, 420], [30, 420]];
const tPath: Array<[number, number]> = [[0, 1170], [1.1, 1170], [2.8, 735], [3.9, 735], [TT.boop, 640], [5.6, 690], [10.2, 735], [TT.nuzzle + 0.6, 690], [30, 690]];

export const PruebaLupa: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 12);
  const step = Math.floor(tq * 12); // solo para tics de vibración

  const mx = keys(tq, mPath), tx = keys(tq, tPath);
  const mMoving = Math.abs(mx - keys(Math.max(0, tq - 0.09), mPath)) > 0.6;
  const tMoving = Math.abs(tx - keys(Math.max(0, tq - 0.09), tPath)) > 0.6;
  const mWalk = tq < 2.75 || (tq >= 5.5 && tq < 6.45);
  const tWalk = tq < 2.85 || (tq >= 3.5 && tq < 5.6);
  const idleM = idleHead(tq, 1), idleT = idleHead(tq, 4);
  const earsM = earTwitch(tq, 2), earsT = earTwitch(tq, 7);

  // ── acting de Timoteo (curioso, inquieto) ──
  const hopStart = hopSquash(tq, TT.boop, 0.55, 60); // susto cuando Teresa toca la lupa
  const hopReactM = hopSquash(tq, TT.react, 0.6, 80);
  const hopReactM2 = hopSquash(tq, TT.react + 0.75, 0.5, 50);
  const hopM = TT.boop <= tq && tq < TT.boop + 0.55 ? hopStart : tq >= TT.react && tq < TT.react + 0.6 ? hopReactM : tq >= TT.react + 0.75 && tq < TT.react + 1.25 ? hopReactM2 : { dy: 0, sy: 1 };
  const peering = tq >= TT.peer && tq < TT.eye1 + 0.3;
  const lookAtTeresa = tq >= TT.nuzzle;
  let mHeadRot = idleM.headRot + (peering ? 12 + 3 * Math.sin(tq * 3) : 0) + (lookAtTeresa ? 9 : 0) + (tq >= 3 && tq < TT.boop - 0.4 ? 9 * Math.sin(tq * 2.2) : 0);
  let mEarL = earsM.l, mEarR = earsM.r;
  if (mMoving) { mEarL += 11 * Math.sin(step * 1.25); mEarR += -11 * Math.sin(step * 1.25 + 0.4); }
  if (tq >= 2.9 && tq < 3.6) { mEarL += 12 * (tq - 2.9) / 0.7; mEarR -= 12 * (tq - 2.9) / 0.7; } // orejas paradas: «¿qué es eso?»
  const mBlink = blinkAt(tq, 1);
  const mBob = (mWalk && mMoving ? Math.abs(Math.sin((mx / 105) * Math.PI)) * 9 : mMoving ? Math.abs(Math.sin(step * 1.25)) * 14 : 0) + hopM.dy;
  const mEntries: Array<[number, DogView]> = [[0, "m_side"], [2.75, "m_tq"], [5.5, "m_side"], [6.45, "m_tq"], [TT.react, "m_front"], [TT.react + 1.3, "m_tq"]];

  // ── acting de Teresa (calma, curiosa, pesada) ──
  const hopReactT = hopSquash(tq, TT.react + 0.1, 0.65, 62);
  const hopT = tq >= TT.react + 0.1 && tq < TT.react + 0.75 ? hopReactT : { dy: 0, sy: 1 };
  const sniffing = tq >= 3.4 && tq < TT.boop + 0.5;
  const tEntries: Array<[number, DogView]> = [[0, "t_side"], [2.85, "t_tq"], [3.5, "t_side"], [5.6, "t_tq"], [TT.react, "t_front"], [TT.react + 1.3, "t_tq"]];
  const tHeadRot = idleT.headRot + (sniffing ? -7 + 3 * Math.sin(tq * 9) : 0) + (lookAtTeresa ? -8 : 0) + (tq >= 3 && tq < 3.8 ? 10 * Math.sin((tq - 3) * 4) : 0);
  const tHeadDx = sniffing ? -16 - 6 * Math.sin(tq * 9) : 0;
  const tBob = (tWalk && tMoving ? Math.abs(Math.sin((tx / 120) * Math.PI)) * 7 : 0) + hopT.dy;
  const tRot = Math.sin(tx / 40) * 0.8; // balanceo suave al andar
  const mGait = mWalk && mMoving ? (mx / 105) * 2 * Math.PI : undefined, tGait = tWalk && tMoving ? (-tx / 120) * 2 * Math.PI : undefined;

  // ── lupa: se bambolea cuando Teresa le toca con la nariz ──
  const lupaRot = wobble(tq, TT.boop, 7, 2.6, 2.4);
  const glow = keys(t, [[TT.glow, 0], [TT.glow + 0.8, 1]]);
  const pulse = 0.85 + 0.15 * Math.sin(t * 6);
  const showPaw = glow > 0;

  // ── cámara ──
  const camS = keys(t, [[0, 4.6], [0.55, 4.6], [TT.macroEnd, 1.04], [4.4, 1.04], [TT.boop - 0.2, 1.3], [5.8, 1.3], [6.4, 1.15], [8.0, 1.15], [8.4, 1.6], [9.1, 1.6], [9.5, 1.3], [11.0, 1.3], [12.8, 1.1]]);
  const camX = keys(t, [[0, LENS.x], [0.55, LENS.x], [TT.macroEnd, 540], [TT.boop - 0.2, 470], [5.8, 470], [6.4, 540], [8.4, 540], [11, 540]]);
  const camY = keys(t, [[0, LENS.y], [0.55, LENS.y], [TT.macroEnd, 960], [TT.boop - 0.2, 1010], [5.8, 1010], [6.4, 980], [8.4, 930], [9.5, 1010], [12.8, 1000]]);
  const hh = handheld(t, 2.2 * Math.min(1, camS / 1.2));
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-clampC(camX + hh.x, W, camS)}px, ${-clampC(camY + hh.y, H, camS)}px)`;
  const dof = keys(t, [[0, 6], [0.55, 6], [TT.macroEnd, 0], [8.4, 0], [8.8, 2.5], [9.5, 0]]);

  const qOp = keys(t, [[3.0, 0], [3.2, 1], [4.2, 1], [4.4, 0]]);
  const burstOp = keys(t, [[TT.react, 0], [TT.react + 0.12, 1], [TT.react + 1.2, 1], [TT.react + 1.5, 0]]);
  const eyeShot = keys(t, [[TT.eye0 - 0.15, 0], [TT.eye0 + 0.1, 1], [TT.eye1 - 0.1, 1], [TT.eye1 + 0.12, 0]]);
  const insetM = keys(t, [[TT.react + 0.15, 0], [TT.react + 0.4, 1], [TT.react + 1.4, 1], [TT.react + 1.7, 0]]);
  const insetT = keys(t, [[TT.react + 0.25, 0], [TT.react + 0.5, 1], [TT.react + 1.4, 1], [TT.react + 1.7, 0]]);
  const endGlow = keys(t, [[TT.nuzzle, 0], [TT.nuzzle + 0.6, 1]]);
  const eyeBlink = keys(t, [[7.3, 0], [7.4, 1], [7.55, 0]]) || keys(t, [[7.8, 0], [7.88, 1], [7.98, 0]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <div style={{ position: "absolute", inset: 0, filter: dof ? `blur(${dof}px)` : undefined }}>
          <RoomBg floorBrightness={0.66} rug={{ x: 540, y: 1250, rx: 470, ry: 96 }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 62%, rgba(255,230,170,0.22), rgba(10,25,30,0.38) 100%)" }} />
        </div>

        {/* lente: vista ampliada del fondo + huella iluminada */}
        <div style={{ position: "absolute", left: LENS.x - LENS.r, top: LENS.y - LENS.r, width: LENS.r * 2, height: LENS.r * 2, borderRadius: "50%", overflow: "hidden", background: "#2D5C5A", transform: `rotate(${lupaRot}deg)`, transformOrigin: `${LENS.r}px ${LUPA.base - LENS.y + LENS.r}px` }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${LENS.r - LENS.x * 1.7}px, ${LENS.r - LENS.y * 1.7}px) scale(1.7)` }}><RoomBg floorBrightness={0.66} /></div>
          {showPaw && (
            <svg width={LENS.r * 2} height={LENS.r * 2} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 0, top: 0 }}>
              <defs><radialGradient id="pg"><stop offset="0" stopColor="#FFF3B0" stopOpacity="0.95" /><stop offset="1" stopColor="#FFD35A" stopOpacity="0" /></radialGradient></defs>
              <circle r={95 * glow * pulse} fill="url(#pg)" />
              <g opacity={glow} transform={`translate(0 12) scale(${0.9 + 0.1 * pulse})`}>
                <ellipse cx={0} cy={14} rx={30} ry={24} fill="#FFE28A" stroke="#FFF8D8" strokeWidth={4} />
                {[[-38, -18, -14], [-14, -40, -4], [14, -40, 4], [38, -18, 14]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={12} ry={15} transform={`rotate(${r} ${x} ${y})`} fill="#FFE28A" stroke="#FFF8D8" strokeWidth={4} />)}
              </g>
            </svg>
          )}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 35%)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }} />
        </div>
        <div style={{ position: "absolute", left: lupaLeft, top: lupaTop, width: LUPA.w * LUPA.s, height: LUPA.h * LUPA.s, transform: `rotate(${lupaRot}deg)`, transformOrigin: "50% 100%" }}>
          <Img src={staticFile("art/generated/lupa.png")} style={{ width: "100%", height: "100%" }} />
        </div>

        {[mx, tx].map((x, i) => <div key={i} style={{ position: "absolute", left: x - 130, top: (i ? FOOT_T : FOOT_M) - 20, width: 260, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.38)", filter: "blur(10px)" }} />)}

        <CrossDog t={tq} entries={mEntries} x={mx} y={FOOT_M - mBob} k={K.m * 0.98} sy={hopM.sy * idleM.sy} rot={mWalk && mMoving ? Math.sin(mx / 33) * 1.4 : 0}
          headRot={mHeadRot} headDy={idleM.headDy} earL={mEarL - 0.4 * mHeadRot} earR={mEarR - 0.4 * mHeadRot} blink={mBlink} sideGait={mGait} gaitAmp={12} tailRot={12 * Math.sin(tq * 9)} />
        <CrossDog t={tq} entries={tEntries} x={tx} y={FOOT_T - tBob} k={K.t * 0.98} sy={hopT.sy * idleT.sy} rot={tRot}
          headRot={tHeadRot} headDx={tHeadDx} headDy={idleT.headDy} earL={earsT.l - 0.3 * tHeadRot} earR={earsT.r - 0.3 * tHeadRot} blink={blinkAt(tq, 5)} sideGait={tGait} gaitAmp={11} tailRot={9 * Math.sin(tq * 6 + 1)} />

        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          {qOp > 0 && <g opacity={qOp}><QMark x={mx + 20} y={FOOT_M - 480} s={0.9 + 0.08 * Math.sin(t * 6)} /><QMark x={tx - 10} y={FOOT_T - 450} s={0.9 + 0.08 * Math.sin(t * 6 + 2)} /></g>}
          {burstOp > 0 && <g opacity={burstOp}><Burst x={mx + 60} y={FOOT_M - 540 - hopM.dy} s={0.8 + 0.2 * pop(t, TT.react, 0.25)} /><Burst x={tx - 40} y={FOOT_T - 510 - hopT.dy} s={0.8 + 0.2 * pop(t, TT.react + 0.1, 0.25)} /></g>}
          {(glow > 0.2 || t < 1.9) && [0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + t * 1.4; const p = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); const op = t < 1.9 ? keys(t, [[0, 1], [1.2, 0.7], [1.9, 0]]) : 1; return <g key={i} opacity={op}><Sparkle x={LENS.x + Math.cos(a) * (LENS.r + 38)} y={LENS.y + Math.sin(a) * (LENS.r + 38)} s={0.35 + 0.35 * p} rot={t * 40 + i * 30} /></g>; })}
          <Hearts t={t} start={TT.nuzzle + 0.3} dur={1.7} x={(mx + tx) / 2} y={FOOT_M - 470} rise={210} n={6} />
        </svg>
        {endGlow > 0 && <div style={{ position: "absolute", left: LENS.x - LENS.r * 1.6, top: LENS.y - LENS.r * 1.6, width: LENS.r * 3.2, height: LENS.r * 3.2, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,130,0.38), rgba(255,226,130,0) 65%)", opacity: endGlow * pulse }} />}
      </AbsoluteFill>

      <LightShaft t={t} />
      <Dust t={t} />
      <Vignette />
      <Grain />

      {/* plano «ojo gigante»: Timoteo mira por la lupa (la lente lo agranda) */}
      {eyeShot > 0 && (
        <AbsoluteFill style={{ opacity: eyeShot, background: "rgba(8,18,20,0.78)", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", width: 900, height: 900, borderRadius: "50%", overflow: "hidden", border: "46px solid #F0A91E", boxShadow: "0 0 0 10px #C97A12, 0 30px 80px rgba(0,0,0,.6), inset 0 0 90px rgba(0,0,0,.45)", background: "#3F7F7C", transform: `scale(${1 + 0.05 * Math.sin((t - TT.eye0) * 2.2) + 0.12 * (1 - eyeShot)})` }}>
            <PuppetDog view="m_front" x={450 - 20} y={450 + 0.62 * 562 * 4.1 - 20} k={4.1} headRot={Math.sin(t * 2.4) * 4} earL={earsM.l * 1.5} earR={earsM.r * 1.5} blink={eyeBlink} />
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 32%)" }} />
          </div>
        </AbsoluteFill>
      )}

      {insetM > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={Math.sin(tq * 8) * 5} zoom={1 + 0.05 * Math.sin(t * 4)} scale={pop(t, TT.react + 0.15, 0.3) * insetM + 0.001} />}
      {insetT > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} zoom={1 + 0.06 * Math.sin(t * 7)} ring={C.warmYellow} scale={pop(t, TT.react + 0.25, 0.3) * insetT + 0.001} />}

      <MusicTrack src="audio/music/casita.wav" totalSec={PRUEBA_LUPA_SECONDS} base={0.3} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
