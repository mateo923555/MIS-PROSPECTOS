import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./shared/theme";
import { Ep001Sombra, EP001_SECONDS } from "./episodes/ep001-sombra/Ep001Sombra";
import { Ep002Pulpo, EP002_SECONDS } from "./episodes/ep002-pulpo/Ep002Pulpo";

// Una composición por episodio. Lo común (personaje, subtítulos, audio, grano) vive en src/shared.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep001Sombra" component={Ep001Sombra} durationInFrames={Math.round(EP001_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Ep002Pulpo" component={Ep002Pulpo} durationInFrames={Math.round(EP002_SECONDS * FPS)} fps={FPS} width={W} height={H} />
  </>
);
