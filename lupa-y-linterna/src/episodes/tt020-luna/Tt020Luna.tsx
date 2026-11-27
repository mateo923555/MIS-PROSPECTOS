import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain } from "../../shared/Grain";
import { loadFonts } from "../../shared/Fonts";
import { Subtitles } from "../../shared/Subtitles";
import { SfxTrack, VoiceTrack, type Sfx } from "../../shared/Sound";
import { H, W } from "../../shared/theme";
import { hash, keys } from "../../shared/motion";
import { Hearts } from "../../shared/Hearts";
import type { VoiceData } from "../../shared/voice";
import { Chip, M, Mark, REF_M, REF_T, Sprite, TE, camAt, camTransform, duckOverSpeech, ease, hopArc, makeVoice, mouth, type Shot } from "../../shared/PetKit";
import voiceJson from "./voice.generated.json";

const voice = voiceJson as unknown as VoiceData;
const V = makeVoice(voice);
export const TT020_SECONDS = Math.ceil((V.lastEnd + 1.2) * 10) / 10;
const { seg, word, speaking } = V;
const S = Object.fromEntries(["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"].map((k) => [k, seg(k)])) as Record<string, ReturnType<typeof seg>>;

// ── poses reales mirando hacia arriba-derecha (hacia la Luna) ──
const UPR_M = "timoteo/mirada/timoteo_mirada_der_04", UPR_T = "teresa/mirada/teresa_mirada_der_03";

// ── línea de tiempo anclada a la voz ──
const B_IN = S.s4.voiceStart - 0.45, B_OUT = S.s8.voiceStart - 0.55;
const ORBIT0 = word("s6", "vueltas").start, ORBIT1 = S.s7.voiceEnd + 0.9;
const GHOST0 = S.s8.voiceStart + 0.15; // la parte oscura se insinúa al decir "no perdió nada"
const THETA0 = 60; // luna gibosa creciente: el Sol ilumina ~75 % del lado que vemos

/** Posición orbital θ (grados, 0 = Luna llena a la derecha, 180 = luna nueva entre la Tierra y el Sol). Gira en sentido antihorario visto desde arriba. */
const thetaAt = (t: number) => THETA0 - 360 * ease((t - ORBIT0) / (ORBIT1 - ORBIT0));
const phaseOf = (thetaDeg: number) => {
  const th = (thetaDeg * Math.PI) / 180;
  return { waxing: Math.sin(th) > 0, cosPhi: -Math.cos(th) }; // cos(elongación) = -cos θ (Sol a la izquierda)
};

/** Región iluminada (polígono) que se ve desde la Tierra. Hemisferio sur: creciente = iluminada a la izquierda. */
const litPolygon = (cx: number, cy: number, r: number, thetaDeg: number) => {
  const { waxing, cosPhi } = phaseOf(thetaDeg); const sx = waxing ? -1 : 1; const pts: string[] = [];
  for (let a = -90; a <= 90; a += 6) pts.push(`${cx + sx * r * Math.cos((a * Math.PI) / 180)},${cy + r * Math.sin((a * Math.PI) / 180)}`);
  for (let a = 90; a >= -90; a -= 6) pts.push(`${cx + sx * cosPhi * r * Math.cos((a * Math.PI) / 180)},${cy + r * Math.sin((a * Math.PI) / 180)}`);
  return pts.join(" ");
};
const CRATERS = [[-0.35, -0.3, 0.16], [0.25, -0.45, 0.11], [0.4, 0.1, 0.18], [-0.2, 0.35, 0.13], [-0.55, 0.05, 0.09], [0.05, 0.05, 0.1], [0.15, 0.55, 0.08]];

const MoonDisc: React.FC<{ id: string; cx: number; cy: number; r: number; theta: number; ghost: number; glow?: number }> = ({ id, cx, cy, r, theta, ghost, glow = 1 }) => {
  const { cosPhi } = phaseOf(theta); const f = (1 - cosPhi) / 2;
  return (
    <g>
      <defs>
        <clipPath id={`lit-${id}`}><polygon points={litPolygon(cx, cy, r, theta)} /></clipPath>
        <radialGradient id={`mg-${id}`} cx="35%" cy="35%" r="80%"><stop offset="0" stopColor="#FFFBE6" /><stop offset="1" stopColor="#E7DBB0" /></radialGradient>
        <radialGradient id={`gl-${id}`} cx="50%" cy="50%" r="50%"><stop offset="0.55" stopColor="#FFF3C4" stopOpacity="0.55" /><stop offset="1" stopColor="#FFF3C4" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 1.9} fill={`url(#gl-${id})`} opacity={0.65 * glow * (0.25 + 0.75 * f)} />
      {/* la parte que no vemos: solo se insinúa (contorno ilustrativo) */}
      <circle cx={cx} cy={cy} r={r} fill={`rgba(140,160,220,${0.10 * ghost})`} stroke={`rgba(205,220,255,${0.65 * ghost})`} strokeWidth={r * 0.03} strokeDasharray={`${r * 0.12} ${r * 0.08}`} />
      <g clipPath={`url(#lit-${id})`}>
        <circle cx={cx} cy={cy} r={r} fill={`url(#mg-${id})`} />
        {CRATERS.map(([dx, dy, dr], i) => <circle key={i} cx={cx + dx * r} cy={cy + dy * r} r={dr * r} fill="#CFC39B" opacity={0.55} />)}
      </g>
    </g>
  );
};

// ── cámara del jardín: el último plano repite el primero (bucle) ──
const SHOTS: Shot[] = [
  { t: 0, kind: "exp" }, // "exp" = plano cercano (ver override)
  { t: S.s1.voiceEnd + 0.4, kind: "wide" },
  { t: B_OUT + 0.1, kind: "wide" }, { t: S.s9.voiceStart - 0.25, kind: "dogs" }, { t: S.s10.voiceStart - 0.5, kind: "exp" },
];
const CAM_OVER = { exp: { s: 1.35, cx: 540, cy: 880 }, wide: { s: 1.0, cx: 540, cy: 960 }, dogs: { s: 1.3, cx: 520, cy: 1000 } };

const MOON = { x: 790, y: 420, r: 165 };
const DOGS_A = { timo: { x: 345, foot: 1290, h: 430 }, tere: { x: 715, foot: 1300, h: 480 } };

const SFX: Sfx[] = duckOverSpeech(voice, [
  { at: 0.05, name: "pop", volume: 0.35 }, { at: S.s2.voiceStart, name: "yip", volume: 0.3 },
  { at: B_IN, name: "whoosh", volume: 0.4 }, { at: S.s5.voiceStart - 0.1, name: "think", volume: 0.3 },
  { at: ORBIT0 + 0.2, name: "whoosh", volume: 0.25 },
  { at: B_OUT, name: "whoosh", volume: 0.4 }, { at: GHOST0 + 0.1, name: "sparkle", volume: 0.45 }, { at: GHOST0 + 0.15, name: "ding", volume: 0.35 },
  { at: S.s10.voiceStart + 0.9, name: "heart", volume: 0.25 },
]);

export const Tt020Luna: React.FC = () => {
  loadFonts();
  const frame = useCurrentFrame(); const { fps } = useVideoConfig();
  const t = frame / fps;
  const fadeB = ease((t - B_IN) / 0.5) * (1 - ease((t - B_OUT) / 0.5));
  const theta = thetaAt(t);
  const th360 = ((theta % 360) + 360) % 360;
  const ghostA = keys(t, [[GHOST0, 0], [GHOST0 + 0.7, 1], [S.s10.voiceStart + 0.1, 1], [S.s10.voiceEnd + 0.6, 0]]); // se apaga antes del final: el último cuadro = el primero
  const cam = camAt(SHOTS, t, CAM_OVER as any);

  // ── poses ──
  const timoA = t < S.s3.voiceStart - 0.05 ? UPR_M : t < S.s3.voiceEnd + 0.1 ? M.surp : t < B_IN ? M.up : t < S.s8.voiceStart + 1.3 ? M.jump : t < S.s9.voiceEnd ? M.happy : UPR_M;
  const timoAK = timoA === M.happy && speaking(t, "timo") ? mouth(t, M.happy, M.laugh, M.happy) : timoA;
  const timoAHop = hopArc(t, S.s3.voiceStart, 0.35, 40) + hopArc(t, S.s8.voiceStart + 0.05, 0.5, 90) + hopArc(t, S.s8.voiceStart + 0.6, 0.45, 55);
  const tereA = t < S.s2.voiceStart - 0.05 ? UPR_T : t < S.s2.voiceStart + 0.9 ? TE.jump : t < S.s3.voiceStart - 0.1 ? TE.curious : t < B_IN ? TE.look : t < S.s9.voiceStart - 0.1 ? TE.up : t < S.s9.voiceEnd + 0.05 ? TE.base : UPR_T;
  const tereAK = tereA === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : tereA;
  const tereAHop = hopArc(t, S.s2.voiceStart + 0.05, 0.5, 70);
  // pequeños en el diagrama
  const timoB = t < S.s5.voiceStart - 0.1 ? M.up : t < S.s6.voiceStart ? M.curious : t < S.s7.voiceStart - 0.2 ? M.up : M.surp;
  const timoBK = timoB === M.base && speaking(t, "timo") ? mouth(t, M.base, M.talk, M.bark) : timoB;
  const tereB = t < S.s5.voiceStart - 0.1 ? TE.base : t < S.s6.voiceStart - 0.1 ? TE.look : t < S.s6.voiceEnd + 0.05 ? TE.base : t < S.s7.voiceStart - 0.1 ? TE.look : t < S.s7.voiceEnd + 0.5 ? TE.jump : TE.base;
  const tereBK = tereB === TE.base && speaking(t, "tere") ? mouth(t, TE.base, TE.talk, TE.bark) : tereB;
  const tereBHop = hopArc(t, S.s7.voiceStart + 0.05, 0.45, 45), timoBHop = hopArc(t, S.s7.voiceStart + 0.05, 0.45, 50);

  // ── música: continua, sin fundidos largos (bucle sin corte); baja un poco al hablar ──
  const musicVol = (f: number) => {
    const tt = f / fps; let v = 0.2;
    for (const s of voice.segments) if (tt > s.voiceStart - 0.15 && tt < s.voiceEnd + 0.25) v = 0.1;
    return v * Math.min(1, tt / 0.08) * Math.min(1, (TT020_SECONDS - tt) / 0.08);
  };

  const stars = Array.from({ length: 150 }, (_, i) => ({ x: ((hash(21, i) + 1) / 2) * W, y: ((hash(22, i) + 1) / 2) * 1050, r: 0.8 + 1.8 * ((hash(23, i) + 1) / 2), ph: hash(24, i) * 6 }));
  const grass = Array.from({ length: 170 }, (_, i) => ({ x: ((hash(31, i) + 1) / 2) * W, y: 1125 + ((hash(32, i) + 1) / 2) * 700, h: 16 + 18 * ((hash(33, i) + 1) / 2), c: hash(34, i) }));
  const flies = Array.from({ length: 12 }, (_, i) => ({ x: ((hash(41, i) + 1) / 2) * W + Math.sin(t * 0.7 + i) * 40, y: 1050 + ((hash(42, i) + 1) / 2) * 420 + Math.cos(t * 0.9 + i * 2) * 25, o: 0.35 + 0.35 * Math.sin(t * 2.2 + i * 1.7) }));

  // ── diagrama visto desde arriba ──
  const EX = 590, EY = 600, R = 300;
  const mx = EX + R * Math.cos((theta * Math.PI) / 180), my = EY + R * Math.sin((theta * Math.PI) / 180);
  const lit4 = t >= S.s4.voiceStart && t < S.s4.voiceEnd + 0.8;
  const chipFull = Math.abs(((th360 + 180) % 360) - 180) < 14 && t > ORBIT0, chipNew = Math.abs(th360 - 180) < 14 && t > ORBIT0;
  const showMonth = t > ORBIT1 - 0.7 && t < B_OUT + 0.3;
  const missingHint = t >= S.s5.voiceStart && t < S.s6.voiceStart + 0.6;
  const ghostB = missingHint ? 0.95 : t > ORBIT0 ? 0.45 : 0.25;

  return (
    <AbsoluteFill style={{ backgroundColor: "#070C2A" }}>
      {/* ───── ESCENA A: noche en el jardín ───── */}
      <AbsoluteFill style={{ opacity: 1 - fadeB, transform: camTransform(cam), transformOrigin: "0 0" }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#060A26" /><stop offset="0.6" stopColor="#16246A" /><stop offset="1" stopColor="#4A4C94" /></linearGradient>
            <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#235038" /><stop offset="1" stopColor="#0C2417" /></linearGradient>
            <radialGradient id="hz" cx="50%" cy="100%" r="70%"><stop offset="0" stopColor="#B07AD0" stopOpacity="0.35" /><stop offset="1" stopColor="#B07AD0" stopOpacity="0" /></radialGradient>
          </defs>
          <rect width={W} height={1180} fill="url(#sky)" />
          <rect width={W} height={1180} fill="url(#hz)" />
          {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={0.45 + 0.4 * Math.sin(t * 1.6 + s.ph)} />)}
          <MoonDisc id="a" cx={MOON.x} cy={MOON.y} r={MOON.r} theta={THETA0} ghost={ghostA} />
          <path d="M0,1070 C160,985 340,1015 520,1045 S880,985 1080,1035 L1080,1300 L0,1300 Z" fill="#111E48" />
          <path d="M0,1115 C220,1060 420,1100 640,1085 S960,1070 1080,1105 L1080,1300 L0,1300 Z" fill="#0B1635" />
          {[[60, 1100, 150], [150, 1120, 110], [930, 1095, 160], [1020, 1115, 120]].map(([x, y, h], i) => (<g key={i}><rect x={x - 9} y={y - 30} width={18} height={60} fill="#08112C" /><ellipse cx={x} cy={y - 40 - h * 0.35} rx={h * 0.42} ry={h * 0.5} fill="#08112C" /></g>))}
          <rect y={1120} width={W} height={H - 1120} fill="url(#gr)" />
          {grass.map((g, i) => <path key={i} d={`M${g.x},${g.y} q${3 * g.c},-${g.h * 0.5} ${7 * g.c},-${g.h}`} stroke={g.y < 1300 ? "#3E8A5A" : "#2B6641"} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.7} />)}
          {flies.map((f, i) => <g key={i} opacity={Math.max(0.05, f.o)}><circle cx={f.x} cy={f.y} r={14} fill="#FFF3A0" opacity={0.25} /><circle cx={f.x} cy={f.y} r={4} fill="#FFF8C8" /></g>)}
        </svg>
        <div style={{ position: "absolute", left: DOGS_A.timo.x - 150, top: DOGS_A.timo.foot - 18, width: 300, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.45)", filter: "blur(10px)" }} />
        <div style={{ position: "absolute", left: DOGS_A.tere.x - 170, top: DOGS_A.tere.foot - 18, width: 340, height: 34, borderRadius: "50%", background: "rgba(0,0,0,0.45)", filter: "blur(10px)" }} />
        <Sprite k={tereAK} ref_={REF_T} x={DOGS_A.tere.x} footY={DOGS_A.tere.foot + tereAHop} h={DOGS_A.tere.h} />
        <Sprite k={timoAK} ref_={REF_M} x={DOGS_A.timo.x} footY={DOGS_A.timo.foot + timoAHop} h={DOGS_A.timo.h} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={S.s2.voiceStart + 0.05} b={S.s2.voiceStart + 1.0} x={DOGS_A.tere.x} y={DOGS_A.tere.foot - DOGS_A.tere.h * 1.12} ch="!" color="#F2705B" />
          <Mark t={t} a={S.s3.voiceStart} b={S.s3.voiceStart + 1.0} x={DOGS_A.timo.x} y={DOGS_A.timo.foot - DOGS_A.timo.h * 1.1} ch="?" size={110} />
          <Hearts t={t} start={S.s8.voiceStart + 0.6} dur={1.3} x={DOGS_A.timo.x + 40} y={DOGS_A.timo.foot - DOGS_A.timo.h * 0.95} rise={220} n={4} size={1.0} />
        </svg>
      </AbsoluteFill>

      {/* ───── ESCENA B: visto desde arriba (diagrama) ───── */}
      <AbsoluteFill style={{ opacity: fadeB }}>
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
          <defs>
            <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#03050E" /><stop offset="1" stopColor="#101C44" /></linearGradient>
            <radialGradient id="sun" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFF4B0" /><stop offset="0.55" stopColor="#FFC93C" /><stop offset="1" stopColor="#FF9A1F" stopOpacity="0.9" /></radialGradient>
            <radialGradient id="sunglow" cx="50%" cy="50%" r="50%"><stop offset="0.4" stopColor="#FFD36B" stopOpacity="0.5" /><stop offset="1" stopColor="#FFD36B" stopOpacity="0" /></radialGradient>
            <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFE8A0" stopOpacity="0.32" /><stop offset="1" stopColor="#FFE8A0" stopOpacity="0.04" /></linearGradient>
            <radialGradient id="earth" cx="35%" cy="35%" r="80%"><stop offset="0" stopColor="#7CC4F2" /><stop offset="1" stopColor="#2C74C0" /></radialGradient>
            <clipPath id="leftHalfE"><rect x={EX - 100} y={EY - 100} width={100} height={200} /></clipPath>
            <clipPath id="leftHalfM"><rect x={mx - 60} y={my - 60} width={60} height={120} /></clipPath>
          </defs>
          <rect width={W} height={H} fill="url(#sp)" />
          {stars.slice(0, 90).map((s, i) => <circle key={i} cx={s.x} cy={(s.y * 0.95) % 1280} r={s.r * 0.9} fill="#fff" opacity={0.3 + 0.35 * Math.sin(t * 1.4 + s.ph)} />)}
          <rect x={150} y={330} width={900} height={540} fill="url(#beam)" />
          {[400, 480, 560, 640, 720, 800].map((y) => <line key={y} x1={190} y1={y} x2={EX - 110} y2={y} stroke="#FFE8A0" strokeWidth={3} strokeDasharray="14 16" opacity={0.35} />)}
          <circle cx={-30} cy={600} r={380} fill="url(#sunglow)" /><circle cx={-30} cy={600} r={230} fill="url(#sun)" />
          <circle cx={EX} cy={EY} r={R} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={3} strokeDasharray="12 14" />
          {/* Tierra: mitad iluminada hacia el Sol */}
          <circle cx={EX} cy={EY} r={96} fill="#0F1B3B" />
          <g clipPath="url(#leftHalfE)"><circle cx={EX} cy={EY} r={96} fill="url(#earth)" /><ellipse cx={EX - 38} cy={EY - 22} rx={24} ry={16} fill="#5DB36B" /><ellipse cx={EX - 56} cy={EY + 34} rx={18} ry={12} fill="#5DB36B" /></g>
          {/* Luna: la mitad que mira al Sol siempre está iluminada */}
          <circle cx={mx} cy={my} r={48} fill="#3A4157" stroke="rgba(255,255,255,0.25)" strokeWidth={2} />
          <g clipPath="url(#leftHalfM)"><circle cx={mx} cy={my} r={48} fill="#FFF3CF" /></g>
          {lit4 && <path d={`M${mx},${my - 48} A48,48 0 0 0 ${mx},${my + 48}`} fill="none" stroke="#FFD23C" strokeWidth={9} opacity={0.5 + 0.5 * Math.sin(t * 9)} />}
          <Chip x={150} y={462} text="SOL" color="#E58A1F" w={150} />
          <Chip x={EX} y={EY - 96 - 52} text="TIERRA" color="#2C74C0" w={210} />
          {t < S.s6.voiceStart && <Chip x={mx} y={my + 80} text="LUNA" color="#5C6585" w={150} />}
          {lit4 && <Chip x={mx - 215} y={my - (my > EY ? 20 : -20)} text="ILUMINADA" color="#C98400" w={250} scale={0.9 + 0.1 * Math.sin(t * 8)} />}
          <Chip x={540} y={196} text="VISTO DESDE ARRIBA" color="#123C40" w={560} />
          {/* flecha y panel: lo que vemos desde la Tierra */}
          <line x1={EX} y1={EY + 96} x2={EX} y2={992} stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeDasharray="8 12" />
          <polygon points={`${EX - 14},${980} ${EX + 14},${980} ${EX},${1004}`} fill="rgba(255,255,255,0.6)" />
          <rect x={330} y={1004} width={520} height={226} rx={44} fill="rgba(4,8,30,0.9)" stroke="rgba(255,255,255,0.45)" strokeWidth={4} />
          <text x={EX} y={1052} textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight={700} fontSize={40} fill="#CFE0FF">ASÍ LA VEMOS</text>
          <MoonDisc id="b" cx={EX} cy={1142} r={72} theta={theta} ghost={ghostB} />
          {missingHint && <Chip x={EX} y={1264} text="PARTE OSCURA: NO SE VE" color="#5C6585" w={640} fs={40} scale={0.95 + 0.05 * Math.sin(t * 8)} />}
          {chipFull && <Chip x={EX} y={1264} text="LUNA LLENA" color="#C98400" w={330} />}
          {chipNew && <Chip x={EX} y={1264} text="NUEVA: ¡NO SE VE, PERO ESTÁ!" color="#3C4A8A" w={640} fs={36} />}
          {showMonth && !chipFull && !chipNew && <Chip x={EX} y={1264} text="UNA VUELTA = CASI UN MES" color="#2F9E6B" w={640} fs={38} />}
        </svg>
        <div style={{ position: "absolute", left: 20, top: 1300 - 300 }} />
        <Sprite k={timoBK} ref_={REF_M} x={105} footY={1300 + timoBHop} h={290} />
        <Sprite k={tereBK} ref_={REF_T} x={975} footY={1305 + tereBHop} h={330} />
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <Mark t={t} a={S.s7.voiceStart} b={S.s7.voiceStart + 1.1} x={105} y={1300 - 290 * 1.12} ch="!" />
          <Mark t={t} a={S.s7.voiceStart + 0.08} b={S.s7.voiceStart + 1.1} x={975} y={1305 - 330 * 1.1} ch="!" color="#F2705B" />
        </svg>
      </AbsoluteFill>
      <Grain />
      <Subtitles segments={voice.segments} />
      <VoiceTrack voice={voice} />
      <Audio src={staticFile("audio/music/luna.wav")} volume={musicVol} />
      <SfxTrack cues={SFX} />
    </AbsoluteFill>
  );
};
