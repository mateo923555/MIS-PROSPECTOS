import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { K } from "../shared/Dogs";
import { PuppetDog, blinkAt } from "../shared/PuppetDog";
import { RoomBg } from "../shared/Room";
export const RigTest: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = f / fps;
  const ph = t * 2 * Math.PI * 1.6;
  return (
    <AbsoluteFill style={{ background: "#1B3C40" }}>
      <RoomBg floorBrightness={0.66} />
      <PuppetDog view="t_side" x={540} y={1000} k={K.t * 1.4} gait={ph} gaitAmp={11} tailRot={14 * Math.sin(ph * 2)} headRot={5 * Math.sin(ph * 2)} rot={Math.sin(ph * 2) * 1.2} blink={blinkAt(t, 3)} />
      <PuppetDog view="m_side" x={540} y={1450} k={K.m * 1.4} gait={ph} gaitAmp={12} tailRot={16 * Math.sin(ph * 2)} headRot={4 * Math.sin(ph * 2 + 1)} earL={10 * Math.sin(ph * 2)} earR={8 * Math.sin(ph * 2)} blink={blinkAt(t, 5)} />
    </AbsoluteFill>
  );
};
