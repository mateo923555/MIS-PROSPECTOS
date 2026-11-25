import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Burst, Dog, FaceInset, K, QMark, Sparkle, type DogView } from "../shared/Dogs";
import { Grain } from "../shared/Grain";
import { Hearts } from "../shared/Hearts";
import { loadFonts } from "../shared/Fonts";
import { MusicTrack, SfxTrack, type Sfx } from "../shared/Sound";
import { RoomBg } from "../shared/Room";
import { C, H, W } from "../shared/theme";
import { hash, hops, keys, pop, stepTime } from "../shared/motion";

export const PRUEBA_LUPA_SECONDS = 9.6;

// lupa (imagen recortada 481×929; hueco de la lente: centro (237,241), radio 163)
const LUPA = { s: 0.62, x: 540, base: 1240, lensX: 237.5, lensY: 241, lensR: 163, w: 481, h: 929 };
const lupaLeft = LUPA.x - (LUPA.w * LUPA.s) / 2, lupaTop = LUPA.base - LUPA.h * LUPA.s;
const LENS = { x: lupaLeft + LUPA.lensX * LUPA.s, y: lupaTop + LUPA.lensY * LUPA.s, r: LUPA.lensR * LUPA.s };
const FOOT_T = 1262, FOOT_M = 1252;

const SFX: Sfx[] = [
  ...[0.25, 0.6, 0.95, 1.3, 1.6].map((at) => ({ at, name: "pawstep", volume: 0.35 })),
  ...[0.4, 0.8, 1.2, 1.55].map((at) => ({ at, name: "pawstep", volume: 0.3 })),
  { at: 1.7, name: "think", volume: 0.3 },
  { at: 2.3, name: "sniff", volume: 0.35 },
  { at: 2.7, name: "whoosh", volume: 0.3 },
  { at: 3.3, name: "yip", volume: 0.25 },
  { at: 4.75, name: "discover", volume: 0.55 },
  { at: 4.9, name: "sparkle", volume: 0.3 },
  { at: 5.2, name: "yip", volume: 0.5 },
  { at: 5.35, name: "woof", volume: 0.3 },
  { at: 7.1, name: "heart", volume: 0.4 },
  { at: 8.7, name: "tada", volume: 0.3 },
];

export const PruebaLupa: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tq = stepTime(frame, fps, 12); // stop motion «a dos»
  const step = Math.floor(tq * 12);

  // ── posiciones (Timoteo entra por la izquierda mirando a la derecha; Teresa por la derecha mirando a la izquierda)
  const mx = keys(tq, [[0, -40], [1.6, 330], [2.3, 330], [3.4, 392], [5.2, 392], [6.6, 360], [30, 360]]);
  const tx = keys(tq, [[0, 1120], [1.7, 735], [2.2, 735], [3.3, 700], [5.2, 700], [6.6, 735], [30, 735]]);
  const mMoving = Math.abs(mx - keys(Math.max(0, tq - 0.09), [[0, -40], [1.6, 330], [2.3, 330], [3.4, 392], [5.2, 392], [6.6, 360], [30, 360]])) > 0.5;
  const tMoving = Math.abs(tx - keys(Math.max(0, tq - 0.09), [[0, 1120], [1.7, 735], [2.2, 735], [3.3, 700], [5.2, 700], [6.6, 735], [30, 735]])) > 0.5;

  // ── poses
  const surprise = t >= 5.2 && t < 6.5;
  const mView: DogView = surprise ? "m_front" : "m_tq";
  const tView: DogView = t < 3.3 ? "t_side" : surprise ? "t_front" : "t_tq";
  // peering de Timoteo: se inclina hacia la lupa
  const peering = t >= 3.3 && t < 5.2;
  const mRot = peering ? 7 + Math.sin(tq * 3.2) * 2.5 : t < 3.3 && t > 2.3 ? -6 : hash(2, step) * 0.8;
  const tRot = tView === "t_side" && t >= 1.9 ? -4 + Math.sin(tq * 9) * 2 : hash(3, step) * 0.8; // olfatea: nariz que sube y baja
  const mBob = mMoving ? Math.abs(Math.sin(step * 1.25)) * 16 : 0;
  const tBob = tMoving ? Math.abs(Math.sin(step * 1.1 + 1)) * 12 : 0;
  const hopM = hops(tq, 5.2, 2, 0.4, 60) + hops(tq, 1.7, 1, 0.35, 28);
  const hopT = hops(tq, 5.25, 2, 0.4, 55) + hops(tq, 1.8, 1, 0.35, 24);
  const breathe = 1 + Math.sin(t * 3) * 0.012;

  // ── lente y huella
  const glow = keys(t, [[4.55, 0], [5.3, 1]]);
  const pulse = 0.85 + 0.15 * Math.sin(t * 6);
  const showPaw = glow > 0;

  // ── cámara: general → acercamiento a la lupa y a Timoteo → abre
  const camS = keys(t, [[0, 1], [2.6, 1], [3.5, 1.5], [5.0, 1.5], [5.4, 1.3], [8.3, 1.3], [9.6, 1.12]]);
  const camX = keys(t, [[0, 540], [2.6, 540], [3.5, 480], [5.0, 480], [5.4, 540], [9.6, 540]]);
  const camY = keys(t, [[0, 960], [2.6, 960], [3.5, 1020], [5.0, 1020], [5.4, 1050], [9.6, 1000]]);
  const camTf = `translate(${W / 2}px, ${H / 2}px) scale(${camS}) translate(${-camX}px, ${-camY}px)`;

  const qOp = keys(t, [[1.6, 0], [1.8, 1], [3.0, 1], [3.3, 0]]);
  const burstOp = keys(t, [[5.2, 0], [5.35, 1], [6.3, 1], [6.6, 0]]);
  const insetM = keys(t, [[3.3, 0], [3.55, 1], [5.0, 1], [5.25, 1], [6.6, 1], [6.9, 0]]);
  const insetT = keys(t, [[5.25, 0], [5.5, 1], [6.6, 1], [6.9, 0]]);
  const insetT2 = keys(t, [[7.4, 0], [7.7, 1], [8.9, 1], [9.2, 0]]);
  const endGlow = keys(t, [[7.0, 0], [7.6, 1]]);

  return (
    <AbsoluteFill style={{ backgroundColor: C.petrolDeep }}>
      <AbsoluteFill style={{ transform: camTf, transformOrigin: "0 0" }}>
        <RoomBg floorBrightness={0.66} rug={{ x: 540, y: 1250, rx: 470, ry: 96 }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% 62%, rgba(255,230,170,0.22), rgba(10,25,30,0.38) 100%)" }} />

        {/* lente: vista ampliada del fondo + huella iluminada */}
        <div style={{ position: "absolute", left: LENS.x - LENS.r, top: LENS.y - LENS.r, width: LENS.r * 2, height: LENS.r * 2, borderRadius: "50%", overflow: "hidden", background: "#2D5C5A" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${LENS.r - LENS.x * 1.7}px, ${LENS.r - LENS.y * 1.7}px) scale(1.7)` }}>
            <RoomBg floorBrightness={0.66} />
          </div>
          {showPaw && (
            <svg width={LENS.r * 2} height={LENS.r * 2} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 0, top: 0 }}>
              <defs><radialGradient id="pg"><stop offset="0" stopColor="#FFF3B0" stopOpacity="0.95" /><stop offset="1" stopColor="#FFD35A" stopOpacity="0" /></radialGradient></defs>
              <circle r={90 * glow * pulse} fill="url(#pg)" />
              <g opacity={glow} transform={`translate(0 12) scale(${0.95 + 0.05 * pulse})`}>
                <ellipse cx={0} cy={14} rx={30} ry={24} fill="#FFE28A" stroke="#FFF8D8" strokeWidth={4} />
                {[[-38, -18, -14], [-14, -40, -4], [14, -40, 4], [38, -18, 14]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={12} ry={15} transform={`rotate(${r} ${x} ${y})`} fill="#FFE28A" stroke="#FFF8D8" strokeWidth={4} />)}
              </g>
            </svg>
          )}
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 35%)", boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }} />
        </div>
        <div style={{ position: "absolute", left: lupaLeft, top: lupaTop, width: LUPA.w * LUPA.s, height: LUPA.h * LUPA.s }}>
          <Img src={staticFile("art/generated/lupa.png")} style={{ width: "100%", height: "100%" }} />
        </div>

        {/* sombras de contacto */}
        {[mx, tx].map((x, i) => <div key={i} style={{ position: "absolute", left: x - 130, top: (i ? FOOT_T : FOOT_M) - 20, width: 260, height: 40, borderRadius: "50%", background: "rgba(40,25,10,0.35)", filter: "blur(10px)" }} />)}

        <Dog view={mView} x={mx} y={FOOT_M - mBob - hopM} k={K.m * 0.98} rot={mRot} sy={breathe} />
        <Dog view={tView} x={tx} y={FOOT_T - tBob - hopT} k={K.t * 0.98} rot={tRot} sy={breathe} />

        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          {qOp > 0 && <g opacity={qOp}><QMark x={mx + 20} y={FOOT_M - 470} s={0.9 + 0.08 * Math.sin(t * 6)} /><QMark x={tx - 10} y={FOOT_T - 440} s={0.9 + 0.08 * Math.sin(t * 6 + 2)} /></g>}
          {burstOp > 0 && <g opacity={burstOp}><Burst x={mx + 60} y={FOOT_M - 520 - hopM} s={0.8 + 0.2 * pop(t, 5.2, 0.25)} /><Burst x={tx - 40} y={FOOT_T - 490 - hopT} s={0.8 + 0.2 * pop(t, 5.25, 0.25)} /></g>}
          {glow > 0.2 && [0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + t * 1.4; const p = 0.5 + 0.5 * Math.sin(t * 5 + i * 1.7); return <Sparkle key={i} x={LENS.x + Math.cos(a) * (LENS.r + 38)} y={LENS.y + Math.sin(a) * (LENS.r + 38)} s={0.35 + 0.35 * p} rot={t * 40 + i * 30} />; })}
          <Hearts t={t} start={7.1} dur={1.6} x={(mx + tx) / 2} y={FOOT_M - 480} rise={200} n={5} />
        </svg>
        {endGlow > 0 && <div style={{ position: "absolute", left: LENS.x - LENS.r * 1.5, top: LENS.y - LENS.r * 1.5, width: LENS.r * 3, height: LENS.r * 3, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,130,0.35), rgba(255,226,130,0) 65%)", opacity: endGlow * pulse }} />}
      </AbsoluteFill>

      <Grain />

      {/* primeros planos de la reacción */}
      {insetM > 0 && <FaceInset who="m" left={56} top={250} size={270} rot={peering ? Math.sin(tq * 3.2) * 6 : 0} zoom={1 + 0.05 * Math.sin(t * 4)} scale={pop(t, 3.3, 0.3) * insetM + 0.001} />}
      {insetT > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} zoom={1 + 0.06 * Math.sin(t * 7)} ring={C.warmYellow} scale={pop(t, 5.25, 0.3) * insetT + 0.001} />}
      {insetT2 > 0 && <FaceInset who="t" left={W - 56 - 270 - 90} top={250} size={270} ring={C.coral} scale={pop(t, 7.4, 0.3) * insetT2 + 0.001} />}

      <MusicTrack src="audio/music/casita.wav" totalSec={PRUEBA_LUPA_SECONDS} base={0.3} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
