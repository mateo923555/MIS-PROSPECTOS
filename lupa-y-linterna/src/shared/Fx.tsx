import React from "react";
import { H, W } from "./theme";

/** Polvo flotando en la luz (profundidad). */
export const Dust: React.FC<{ t: number; n?: number; opacity?: number }> = ({ t, n = 34, opacity = 0.5 }) => (
  <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", mixBlendMode: "screen", opacity }}>
    {Array.from({ length: n }).map((_, i) => {
      const sp = 8 + ((i * 29) % 22); const x = ((i * 173) % W) + Math.sin(t * 0.6 + i) * 26; const y = ((H + 60 + i * 97 - t * sp) % (H + 120)) - 60;
      const r = 2 + ((i * 7) % 6); const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i * 2.1));
      return <circle key={i} cx={x} cy={y} r={r} fill="#FFF1C4" opacity={tw * 0.8} filter={r > 5 ? "blur(1.5px)" : undefined} />;
    })}
  </svg>
);

/** Viñeta suave (cine) y rayo de luz diagonal. */
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 85% 70% at 50% 52%, rgba(0,0,0,0) 55%, rgba(5,12,14,${strength}) 100%)` }} />
);
export const LightShaft: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", mixBlendMode: "screen", opacity: 0.16 + 0.03 * Math.sin(t * 0.8), background: "linear-gradient(115deg, rgba(255,226,160,0) 5%, rgba(255,226,160,0.9) 18%, rgba(255,226,160,0) 34%), linear-gradient(115deg, rgba(255,226,160,0) 40%, rgba(255,226,160,0.6) 50%, rgba(255,226,160,0) 60%)" }} />
);

/** Temblor de cámara «en mano» (px). */
export const handheld = (t: number, amp = 3) => ({ x: amp * (Math.sin(t * 1.7) + 0.5 * Math.sin(t * 4.3)), y: amp * (Math.sin(t * 1.3 + 1) + 0.5 * Math.sin(t * 3.7)) });
