import React from "react";

/** Corazoncitos de plastilina que suben y se desvanecen (cariño). Coordenadas del mundo. */
export const Hearts: React.FC<{ t: number; start: number; dur?: number; x: number; y: number; rise?: number; n?: number; size?: number; color?: string }> = ({
  t, start, dur = 1.5, x, y, rise = 220, n = 4, size = 1, color = "#F2705B",
}) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const p = (t - start - i * 0.22) / dur;
      if (p < 0 || p > 1) return null;
      const px = x + (i - (n - 1) / 2) * 46 + Math.sin(p * 6 + i) * 18;
      const py = y - p * rise;
      const sc = size * (0.55 + 0.45 * Math.min(1, p * 4)) * (0.8 + (i % 2) * 0.25);
      return (
        <g key={i} transform={`translate(${px} ${py}) scale(${sc})`} opacity={1 - Math.max(0, (p - 0.65) / 0.35)}>
          <path d="M0 -8 C -22 -36, -58 -6, 0 38 C 58 -6, 22 -36, 0 -8 Z" fill={color} stroke="#FFF1D6" strokeWidth={5} />
          <ellipse cx={-14} cy={-12} rx={7} ry={4} fill="rgba(255,255,255,0.55)" transform="rotate(-30 -14 -12)" />
        </g>
      );
    })}
  </g>
);
