import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "./shared/theme";
import { Ep001Sombra, EP001_SECONDS } from "./episodes/ep001-sombra/Ep001Sombra";
import { Ep002Pulpo, EP002_SECONDS } from "./episodes/ep002-pulpo/Ep002Pulpo";
import { RigTest } from "./pruebas/RigTest";
import { PruebaSombra, PRUEBA_SOMBRA_SECONDS } from "./pruebas/PruebaSombra";
import { PruebaLupa, PRUEBA_LUPA_SECONDS } from "./pruebas/PruebaLupa";
import { Tt001Sombra, TT001_SECONDS } from "./episodes/tt001-sombra-timo/Tt001Sombra";
import { Tt001v3Sombra, TT001V3_SECONDS } from "./episodes/tt001v3-sombra-timo/Tt001v3Sombra";
import { Tt001v4Sombra, TT001V4_SECONDS } from "./episodes/tt001v4-sombra-timo/Tt001v4Sombra";
import { Tt010Pimienta, TT010_SECONDS } from "./episodes/tt010-pimienta/Tt010Pimienta";
import { Tt013Hielo, TT013_SECONDS } from "./episodes/tt013-hielo/Tt013Hielo";
import { Tt020Luna, TT020_SECONDS } from "./episodes/tt020-luna/Tt020Luna";
import { PruebaMascotas, PRUEBA_MASCOTAS_SECONDS } from "./pruebas/PruebaMascotas";
import { PruebaCaminaTeresa, T_CAMINA_SECONDS, PruebaCaminaTimoteo, M_CAMINA_SECONDS, PruebaReaccion, REACCION_SECONDS, PruebaParpadeo, PARPADEO_SECONDS } from "./pruebas/PruebasPoses";
import { Ep001SombraV1, EP001V1_SECONDS } from "./episodes/v1/ep001-sombra/Ep001Sombra";
import { Ep002PulpoV1, EP002V1_SECONDS } from "./episodes/v1/ep002-pulpo/Ep002Pulpo";

// Una composición por episodio. Lo común (personaje, subtítulos, audio, grano) vive en src/shared.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Ep001Sombra" component={Ep001Sombra} durationInFrames={Math.round(EP001_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Ep002Pulpo" component={Ep002Pulpo} durationInFrames={Math.round(EP002_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    {/* pruebas animadas con Teresa y Timoteo (nueva dirección: mascotas) */}
    <Composition id="PruebaCaminaTeresa" component={PruebaCaminaTeresa} durationInFrames={Math.round(T_CAMINA_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaCaminaTimoteo" component={PruebaCaminaTimoteo} durationInFrames={Math.round(M_CAMINA_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaReaccion" component={PruebaReaccion} durationInFrames={Math.round(REACCION_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaParpadeo" component={PruebaParpadeo} durationInFrames={Math.round(PARPADEO_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt001Sombra" component={Tt001Sombra} durationInFrames={Math.round(TT001_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt001v3Sombra" component={Tt001v3Sombra} durationInFrames={Math.round(TT001V3_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt001v4Sombra" component={Tt001v4Sombra} durationInFrames={Math.round(TT001V4_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt010Pimienta" component={Tt010Pimienta} durationInFrames={Math.round(TT010_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt013Hielo" component={Tt013Hielo} durationInFrames={Math.round(TT013_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Tt020Luna" component={Tt020Luna} durationInFrames={Math.round(TT020_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaMascotas" component={PruebaMascotas} durationInFrames={Math.round(PRUEBA_MASCOTAS_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaLupa" component={PruebaLupa} durationInFrames={Math.round(PRUEBA_LUPA_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="PruebaSombra" component={PruebaSombra} durationInFrames={Math.round(PRUEBA_SOMBRA_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="RigTest" component={RigTest} durationInFrames={60} fps={FPS} width={W} height={H} />
    {/* versiones v1 archivadas (sin la dirección narrativa de objetivo) */}
    <Composition id="Ep001SombraV1" component={Ep001SombraV1} durationInFrames={Math.round(EP001V1_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Ep002PulpoV1" component={Ep002PulpoV1} durationInFrames={Math.round(EP002V1_SECONDS * FPS)} fps={FPS} width={W} height={H} />
  </>
);
