// Renderiza las pruebas animadas de Teresa y Timoteo: npm run pruebas
import fs from "node:fs";
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { browserExecutable, makeBundle } from "./lib/remotion";
import { masterAudio } from "./master-audio";
import { p } from "./lib/paths";

const JOBS: Array<[string, string]> = [["PruebaLupa", "teresa-y-timoteo_prueba1_la-lupa-misteriosa"], ["PruebaSombra", "teresa-y-timoteo_prueba2_la-sombra-gigante"]];
const dir = p("renders/pruebas"); fs.mkdirSync(dir, { recursive: true });
const serveUrl = await makeBundle();
for (const [id, file] of JOBS) {
  const comp = await selectComposition({ serveUrl, id, browserExecutable: browserExecutable() });
  const out = path.join(dir, `${file}.mp4`);
  await renderMedia({ composition: comp, serveUrl, outputLocation: out, codec: "h264", audioCodec: "aac", audioBitrate: "192k", crf: 18, pixelFormat: "yuv420p", imageFormat: "png", colorSpace: "bt709", concurrency: Number(process.env.RENDER_CONCURRENCY ?? 3), browserExecutable: browserExecutable(), overwrite: true });
  masterAudio(out);
  console.log(`✓ ${id} -> ${path.relative(process.cwd(), out)}`);
}
