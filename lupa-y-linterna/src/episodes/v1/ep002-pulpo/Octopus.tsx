import React from "react";
import { Img, staticFile } from "remotion";

/**
 * Pulpo con camuflaje REAL: la "piel de roca" es la propia imagen del fondo vista a través de la silueta del pulpo,
 * así que cuando está camuflado coincide pixel a pixel con la roca de atrás (y se sigue distinguiendo por el contorno,
 * los ojitos cerrados y el relieve de las ventosas). La transición es por manchitas (cromatóforos).
 */
export const OCT_IMG = { w: 1409, h: 968 };
export const OCT_BOX = { cx: 690, cy: 880, w: 560 }; // posición sobre la roca (coordenadas del mundo 1080×1920)
const F = OCT_BOX.w / OCT_IMG.w;
export const OCT_LEFT = OCT_BOX.cx - OCT_BOX.w / 2;
export const OCT_TOP = OCT_BOX.cy - (OCT_IMG.h * F) / 2;
const BW = Math.round(OCT_BOX.w);
const BH = Math.round(OCT_IMG.h * F);
export const BG = { left: -8.5, top: 0, w: 1097, h: 1920 }; // fondo del mar a escala "cubrir"

// Brazo que se mueve (polígono en px de la imagen original del pulpo) y su pivote
const ARM_POLY: Array<[number, number]> = [[905, 300], [1180, 50], [1340, 50], [1340, 392], [1010, 415], [905, 440]];
const ARM_PIVOT: [number, number] = [930, 370];
const sc = (pts: Array<[number, number]>) => pts.map(([x, y]) => [x * F, y * F] as [number, number]);
const armPath = (pts: Array<[number, number]>) => "M " + sc(pts).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ") + " Z";
const CLIP_ARM = `path("${armPath(ARM_POLY)}")`;
const CLIP_BODY = `path(evenodd, "M 0 0 H ${BW} V ${BH} H 0 Z ${armPath(ARM_POLY)}")`;

// manchitas: rejilla con retardos pseudoaleatorios deterministas
type Dot = { x: number; y: number; delay: number };
const DOTS: Dot[] = (() => {
  const out: Dot[] = []; const cols = 15, rows = 11;
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    out.push({ x: ((c + 0.5 + (rnd() - 0.5) * 0.7) / cols) * BW, y: ((r + 0.5 + (rnd() - 0.5) * 0.7) / rows) * BH, delay: rnd() });
  }
  return out;
})();

const dotsMask = (p: number) => {
  const R = 46;
  const circles = DOTS.map((d) => {
    const q = Math.min(1, Math.max(0, (p * 1.6 - d.delay * 0.6) / 1.0));
    const r = R * q * q;
    return r > 0.4 ? `<circle cx='${d.x.toFixed(0)}' cy='${d.y.toFixed(0)}' r='${r.toFixed(1)}' fill='white'/>` : "";
  }).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${BW}' height='${BH}'>${circles}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

/** Capa de piel (coral o camuflaje) con el recorte de la silueta. */
const Skin: React.FC<{ p: number; clip: string }> = ({ p, clip }) => {
  const octoUrl = `url(${staticFile("art/generated/octopus.png")})`;
  const full = p >= 0.999;
  const none = p <= 0.001;
  const maskStyle = (extra: boolean): React.CSSProperties => {
    const imgs = extra ? `${octoUrl}, ${dotsMask(p)}` : octoUrl;
    const sizes = extra ? "100% 100%, 100% 100%" : "100% 100%";
    return {
      WebkitMaskImage: imgs, maskImage: imgs, WebkitMaskSize: sizes, maskSize: sizes,
      WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
      WebkitMaskComposite: extra ? "source-in" : undefined, maskComposite: extra ? "intersect" : undefined,
    } as React.CSSProperties;
  };
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: clip }}>
      {/* piel coral (la de verdad) */}
      <Img src={staticFile("art/generated/octopus.png")} style={{ position: "absolute", inset: 0, width: BW, height: BH, filter: "saturate(0.92) brightness(0.97)" }} />
      {/* piel de roca: el fondo visto por la silueta + relieve gris de la piel */}
      {!none && (
        <div style={{ position: "absolute", inset: 0, ...maskStyle(!full) }}>
          <Img src={staticFile("art/generated/bg_sea.png")} style={{ position: "absolute", left: BG.left - OCT_LEFT, top: BG.top - OCT_TOP, width: BG.w, height: BG.h }} />
          <Img
            src={staticFile("art/generated/octopus.png")}
            style={{ position: "absolute", inset: 0, width: BW, height: BH, filter: "grayscale(1) contrast(0.85) brightness(1.15)", mixBlendMode: "multiply", opacity: 0.2 }}
          />
        </div>
      )}
    </div>
  );
};

const Ring: React.FC<{ clip: string; halo: number }> = ({ clip, halo }) => (
  <div style={{ position: "absolute", inset: 0, clipPath: clip, opacity: halo }}>
    <Img src={staticFile("art/generated/octopus.png")} style={{ position: "absolute", inset: 0, width: BW, height: BH, filter: "url(#octoRing)" }} />
  </div>
);

type Props = { p: number; arm?: number; halo?: number; eyes?: number; scale?: number };
/** p: 0 = coral, 1 = camuflado · arm: grados del brazo · halo: 0–1 contorno amarillo · eyes: 0 cerrados, 1 abiertos(coral) */
export const Octopus: React.FC<Props> = ({ p, arm = 0, halo = 0 }) => {
  const piv = [ARM_PIVOT[0] * F, ARM_PIVOT[1] * F];
  // ojitos cerrados (rendijas) solo cuando está camuflado
  const slitOp = Math.max(0, (p - 0.6) / 0.4) * 0.4; // pista muy sutil: los ojitos cerrados
  const eyes = [[675, 330], [850, 330]].map(([x, y]) => [x * F, y * F]);
  return (
    <div style={{ position: "absolute", left: OCT_LEFT, top: OCT_TOP, width: BW, height: BH }}>
      {/* filtro SVG: SOLO el anillo exterior de la silueta (sin la copia coral debajo) */}
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="octoRing" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="7" result="d" />
          <feComposite in="d" in2="SourceAlpha" operator="out" result="ring" />
          <feFlood floodColor="#FFE066" result="c" />
          <feComposite in="c" in2="ring" operator="in" />
        </filter>
      </svg>
      {halo > 0 && <Ring clip={CLIP_BODY} halo={halo} />}
      <Skin p={p} clip={CLIP_BODY} />
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${arm}deg)`, transformOrigin: `${piv[0]}px ${piv[1]}px` }}>
        <Skin p={p} clip={CLIP_ARM} />
        {halo > 0 && <Ring clip={CLIP_ARM} halo={halo} />}
      </div>
      <svg width={BW} height={BH} style={{ position: "absolute", inset: 0, opacity: slitOp }}>
        {eyes.map(([x, y], i) => (
          <path key={i} d={`M ${x - 17} ${y} Q ${x} ${y + 9} ${x + 17} ${y}`} stroke="#3B3A33" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.75} />
        ))}
      </svg>
    </div>
  );
};

/** Escena del mar (fondo) para reutilizar en miniaturas. */
export const SeaBackground: React.FC = () => (
  <Img src={staticFile("art/generated/bg_sea.png")} style={{ position: "absolute", left: BG.left, top: BG.top, width: BG.w, height: BG.h }} />
);
