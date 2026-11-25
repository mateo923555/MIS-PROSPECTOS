// Masteriza el audio de un MP4 ya renderizado a ≈ -15 LUFS (pico real ≤ -1.5 dB) SIN recodificar el video.
// Uso: npm run master -- ep001 ep002   (render.ts también lo hace al terminar)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { epFile, outDir } from "./lib/remotion";

export function masterAudio(file: string) {
  const tmp = file.replace(/\.mp4$/, ".mastered.mp4");
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-c:v", "copy", "-af", "loudnorm=I=-15:TP=-1.5:LRA=9", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", tmp], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`ffmpeg loudnorm falló: ${r.stderr}`);
  fs.renameSync(tmp, file);
}

if (process.argv[1]?.endsWith("master-audio.ts")) {
  for (const ep of process.argv.slice(2).filter((a) => !a.startsWith("--"))) {
    const m = epFile(ep);
    const f = ["_PREVIEW", "_FINAL"].map((s) => path.join(outDir(), `${m.file}${s}.mp4`)).find(fs.existsSync);
    if (!f) { console.error(`✗ ${ep}: no hay MP4`); continue; }
    masterAudio(f); console.log(`✓ audio masterizado: ${path.basename(f)}`);
  }
}
