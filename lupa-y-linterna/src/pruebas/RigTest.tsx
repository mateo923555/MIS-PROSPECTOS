import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { K, DOG_VIEWS } from "../shared/Dogs";
import { PuppetDog, blinkAt, earTwitch, idleHead } from "../shared/PuppetDog";
import { RoomBg } from "../shared/Room";
import { stepTime } from "../shared/motion";
export const RigTest: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig(); const t = stepTime(f, fps, 12);
  const id = idleHead(t, 1); const ea = earTwitch(t, 2);
  const tilt = 14 * Math.sin(t * 1.6);
  return (
    <AbsoluteFill style={{ background: "#1B3C40" }}>
      <RoomBg floorBrightness={0.66} />
      <PuppetDog view="m_front" x={300} y={900} k={K.m * 1.4} sy={id.sy} headRot={tilt} headDy={id.headDy} earL={ea.l * 2 + 10 * Math.sin(t * 5)} earR={ea.r * 2 - 10 * Math.sin(t * 5)} blink={blinkAt(t, 1) || (Math.sin(t * 2) > 0.9 ? 1 : 0)} />
      <PuppetDog view="t_front" x={760} y={900} k={K.t * 1.1} sy={id.sy} headRot={-tilt * 0.8} headDy={id.headDy} earL={ea.l * 2} earR={ea.r * 2} blink={Math.sin(t * 2) > 0.9 ? 1 : 0} />
      <PuppetDog view="m_tq" x={300} y={1500} k={K.m * 1.2} headRot={tilt} earL={12 * Math.sin(t * 4)} earR={-12 * Math.sin(t * 4)} blink={Math.sin(t * 2) > 0.9 ? 1 : 0} />
      <PuppetDog view="t_tq" x={760} y={1500} k={K.t * 1.0} headRot={-tilt} blink={Math.sin(t * 2) > 0.9 ? 1 : 0} />
    </AbsoluteFill>
  );
};
void DOG_VIEWS;
