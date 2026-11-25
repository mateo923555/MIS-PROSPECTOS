// Renderiza episodios a MP4 (1080×1920, 30 fps, H.264 + AAC). Uso: npm run render -- ep001 [ep002]
// El archivo sale como *_PREVIEW.mp4. La etiqueta FINAL solo la asigna `npm run verify` cuando la voz queda verificada.
import fs from "node:fs";
import path from "node:path";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { masterAudio } from "./master-audio";
import { COMP, browserExecutable, epFile, makeBundle, outDir } from "./lib/remotion";

const eps = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!eps.length) { console.error("Uso: npm run render -- ep001 [ep002]"); process.exit(1); }
const concurrency = Number(process.env.RENDER_CONCURRENCY ?? 3);

const serveUrl = await makeBundle();
for (const ep of eps) {
  const meta = epFile(ep);
  const comp = await selectComposition({ serveUrl, id: COMP[ep], browserExecutable: browserExecutable() });
  const out = path.join(outDir(), `${meta.file}_PREVIEW.mp4`);
  const t0 = Date.now();
  await renderMedia({
    composition: comp, serveUrl, outputLocation: out, codec: "h264", audioCodec: "aac", audioBitrate: "192k",
    crf: 18, pixelFormat: "yuv420p", imageFormat: "png", colorSpace: "bt709", concurrency, browserExecutable: browserExecutable(), overwrite: true,
    onProgress: ({ progress }) => { if (Math.round(progress * 100) % 10 === 0) process.stdout.write(`\r${ep} ${Math.round(progress * 100)}%   `); },
  });
  console.log(`\n✓ ${ep} -> ${path.relative(process.cwd(), out)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  masterAudio(out); // ≈ -15 LUFS, video sin recodificar
  // un PREVIEW nuevo invalida un FINAL anterior del mismo episodio
  const finalPath = out.replace("_PREVIEW", "_FINAL");
  if (fs.existsSync(finalPath)) fs.rmSync(finalPath);
}
