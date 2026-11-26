// Renderiza las pruebas con las poses reales de Teresa y Timoteo: npx tsx scripts/render-poses.ts
import fs from "node:fs";
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { browserExecutable, makeBundle } from "./lib/remotion";
import { masterAudio } from "./master-audio";
import { p } from "./lib/paths";
const JOBS: Array<[string, string]> = [
  ["PruebaCaminaTeresa", "poses-reales_1_teresa-camina"], ["PruebaCaminaTimoteo", "poses-reales_2_timoteo-camina"],
  ["PruebaReaccion", "poses-reales_3_reaccionan-al-descubrimiento"], ["PruebaParpadeo", "poses-reales_4_parpadeo-y-habla"],
];
const dir = p("renders/pruebas-poses-reales"); fs.mkdirSync(dir, { recursive: true });
const serveUrl = await makeBundle();
for (const [id, file] of JOBS) {
  const comp = await selectComposition({ serveUrl, id, browserExecutable: browserExecutable() });
  const out = path.join(dir, `${file}.mp4`);
  await renderMedia({ composition: comp, serveUrl, outputLocation: out, codec: "h264", audioCodec: "aac", audioBitrate: "192k", crf: 18, pixelFormat: "yuv420p", imageFormat: "png", colorSpace: "bt709", concurrency: Number(process.env.RENDER_CONCURRENCY ?? 3), browserExecutable: browserExecutable(), overwrite: true });
  masterAudio(out);
  console.log(`✓ ${id} -> ${path.relative(process.cwd(), out)}`);
}
