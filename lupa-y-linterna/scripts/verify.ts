// Verificación técnica + de voz de los MP4 renderizados. Uso: npm run verify -- ep001 ep002 [--no-asr]
//  1) ffprobe: duración, dimensiones, fps, códec de video/audio, pix_fmt
//  2) audio: picos (sin clipping), loudness, y que cada frase del guion se oiga en la pista RENDERIZADA
//     (transcripción con timestamps de la mezcla final), la pausa del pulpo y el margen final de 0,3–0,5 s
//  3) si todo pasa, renombra *_PREVIEW.mp4 → *_FINAL.mp4 y guarda renders/verification-<ep>.json
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { p } from "./lib/paths";
import { openaiForm } from "./lib/openai";
import { epFile, outDir } from "./lib/remotion";
import { verifyNarrative } from "./verify-narrative";

const args = process.argv.slice(2);
const eps = args.filter((a) => !a.startsWith("--"));
const noAsr = args.includes("--no-asr");
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ ]/g, " ").split(/\s+/).filter(Boolean);
const sh = (cmd: string, a: string[]) => { const r = spawnSync(cmd, a, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }); return (r.stdout ?? "") + (r.stderr ?? ""); };

type Check = { name: string; ok: boolean; detail: string };

for (const ep of eps) {
  const meta = epFile(ep);
  const preview = path.join(outDir(), `${meta.file}_PREVIEW.mp4`);
  const final = path.join(outDir(), `${meta.file}_FINAL.mp4`);
  const file = fs.existsSync(preview) ? preview : final;
  const checks: Check[] = [];
  const add = (name: string, ok: boolean, detail: string) => { checks.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${ep} ${name}: ${detail}`); };
  if (!fs.existsSync(file)) { console.error(`✗ ${ep}: no existe ${file}`); process.exitCode = 1; continue; }

  // 1) ffprobe
  const pr = JSON.parse(sh("ffprobe", ["-v", "error", "-print_format", "json", "-show_streams", "-show_format", file]));
  const v = pr.streams.find((s: any) => s.codec_type === "video");
  const a = pr.streams.find((s: any) => s.codec_type === "audio");
  const dur = parseFloat(pr.format.duration);
  const [fn, fd] = v.avg_frame_rate.split("/").map(Number);
  add("duración", Math.abs(dur - meta.durationTargetSec) <= 0.25, `${dur.toFixed(2)} s (objetivo ${meta.durationTargetSec} s, rango 20–25 s: ${dur >= 20 && dur <= 25 ? "ok" : "FUERA"})`);
  add("dimensiones", v.width === 1080 && v.height === 1920, `${v.width}×${v.height}`);
  add("fps", Math.abs(fn / fd - 30) < 0.01, `${(fn / fd).toFixed(2)}`);
  add("video", v.codec_name === "h264" && v.pix_fmt === "yuv420p", `${v.codec_name} ${v.pix_fmt} ${(parseInt(v.bit_rate || pr.format.bit_rate) / 1e6).toFixed(1)} Mb/s`);
  add("audio", !!a && a.codec_name === "aac", a ? `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch ${parseFloat(a.duration).toFixed(2)} s` : "SIN PISTA DE AUDIO");
  if (!a) { process.exitCode = 1; continue; }

  // 2) audio: picos y loudness
  const vol = sh("ffmpeg", ["-hide_banner", "-i", file, "-af", "volumedetect,ebur128=peak=true", "-vn", "-f", "null", "-"]);
  const maxV = parseFloat(/max_volume:\s*(-?[\d.]+) dB/.exec(vol)?.[1] ?? "NaN");
  const lufs = parseFloat([...vol.matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop()?.[1] ?? "NaN");
  add("picos", maxV < -0.3, `pico ${maxV} dBFS (sin clipping si < -0.3)`);
  add("loudness", lufs > -26 && lufs < -10, `${lufs} LUFS integrados (referencia para Shorts ≈ -14)`);

  // voz: guion
  const vj = JSON.parse(fs.readFileSync(p("src/episodes", fs.readdirSync(p("src/episodes")).find((d) => d.startsWith(ep))!, "voice.generated.json"), "utf8"));
  const lastEnd = Math.max(...vj.segments.map((s: any) => s.voiceEnd));
  const tailMargin = dur - lastEnd;
  add("margen final", tailMargin >= 0.3, `${tailMargin.toFixed(2)} s entre el fin de la voz y el fin del video (mín 0,3 s)`);
  for (let i = 1; i < vj.segments.length; i++) {
    const gap = vj.segments[i].voiceStart - vj.segments[i - 1].voiceEnd;
    if (gap < 0.1) add(`solape ${vj.segments[i - 1].id}/${vj.segments[i].id}`, false, `solo ${gap.toFixed(2)} s`);
  }
  if (meta.voice.guessPause) {
    const after = vj.segments.findIndex((s: any) => s.id === meta.voice.guessPause.afterSegment);
    const gap = vj.segments[after + 1].voiceStart - vj.segments[after].voiceEnd;
    add("pausa de adivinar", gap >= meta.voice.guessPause.minSeconds, `${gap.toFixed(2)} s de silencio de voz tras la pregunta (mín ${meta.voice.guessPause.minSeconds} s)`);
  }

  // transcripción de la mezcla renderizada
  if (!noAsr) {
    const wav = path.join(outDir(), `.${ep}-mix.wav`);
    sh("ffmpeg", ["-y", "-i", file, "-vn", "-ac", "1", "-ar", "16000", wav]);
    const fd2 = new FormData();
    fd2.append("file", new Blob([fs.readFileSync(wav)], { type: "audio/wav" }), "mix.wav");
    fd2.append("model", "whisper-1"); fd2.append("language", "es");
    fd2.append("response_format", "verbose_json"); fd2.append("timestamp_granularities[]", "word");
    try {
      const j = await openaiForm("/audio/transcriptions", fd2);
      const heard: Array<{ word: string; start: number; end: number }> = j.words ?? [];
      const heardNorm = heard.flatMap((w) => norm(w.word).map((x) => ({ x, start: w.start, end: w.end })));
      for (const s of vj.segments) {
        const want = norm(s.text);
        const win = heardNorm.filter((h) => h.start >= s.voiceStart - 0.6 && h.end <= s.voiceEnd + 0.8).map((h) => h.x);
        const hit = want.filter((w) => win.includes(w)).length;
        const rec = hit / want.length;
        add(`oye "${s.id}"`, rec >= 0.8, `${Math.round(rec * 100)}% de las palabras de «${s.text}» se oyen en la mezcla final, dentro de su ventana`);
      }
      if (meta.voice.guessPause) {
        const after = vj.segments.findIndex((s: any) => s.id === meta.voice.guessPause.afterSegment);
        const g0 = vj.segments[after].voiceEnd + 0.15, g1 = vj.segments[after + 1].voiceStart - 0.15;
        const stray = heardNorm.filter((h) => h.start > g0 && h.end < g1);
        add("silencio en la pausa", stray.length === 0, stray.length ? `se oyó "${stray.map((s) => s.x).join(" ")}" dentro de la pausa` : `sin voz entre ${g0.toFixed(2)} s y ${g1.toFixed(2)} s`);
      }
      fs.writeFileSync(path.join(outDir(), `verification-${ep}.transcript.txt`), j.text ?? "");
    } catch (e: any) { add("transcripción", false, `no disponible: ${e.message.slice(0, 120)}`); }
    fs.rmSync(wav, { force: true });
  } else add("transcripción", false, "omitida (--no-asr): la voz NO queda verificada");

  // narrativa: momentos clave sobre el MP4 renderizado
  for (const r of verifyNarrative(ep, file, meta, vj)) add(`narrativa · ${r.name}`, r.ok, r.detail);

  const ok = checks.every((c) => c.ok);
  const report = { ep, file: path.basename(file), checkedAt: new Date().toISOString(), ok, checks };
  fs.writeFileSync(path.join(outDir(), `verification-${ep}.json`), JSON.stringify(report, null, 2));
  if (ok && file === preview) { fs.renameSync(preview, final); console.log(`★ ${ep}: verificado → ${path.basename(final)}`); }
  else if (!ok) { console.log(`⚠ ${ep}: quedó como PREVIEW (hay chequeos fallidos)`); process.exitCode = 1; }
  if (ok) {
    const f = p("data/episodes", `${ep}.json`); const d = JSON.parse(fs.readFileSync(f, "utf8"));
    d.status = "FINAL (voz verificada técnicamente; falta tu escucha)"; d.render = `renders/${meta.file}_FINAL.mp4`;
    fs.writeFileSync(f, JSON.stringify(d, null, 2));
  }
}
