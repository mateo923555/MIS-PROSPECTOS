import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";

/** Textura de huellas/grano de plastilina que "hierve" cada 3 cuadros (efecto stop motion). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.16 }) => {
  const f = useCurrentFrame();
  const v = Math.floor(f / 3) % 3;
  return (
    <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity, pointerEvents: "none" }}>
      <Img src={staticFile(`art-grain-${v}.png`)} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  );
};
