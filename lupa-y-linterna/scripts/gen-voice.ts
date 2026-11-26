// Voz narradora con la API de OpenAI (TTS) + tiempos por palabra (transcripción con timestamps).
// - La clave se lee de OPENAI_API_KEY (nunca se guarda ni se imprime). Sin clave y sin proxy: sale con aviso y los episodios
//   se renderizan como PREVIEW (sin voz) — ver README.
// - Caché: audio en public/audio/<ep>/<seg>.wav + hash. Solo se regenera si cambian texto, voz, modelo o instrucciones.
// Uso: npm run voice -- ep001 ep002 [--force]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { p } from "./lib/paths";
import { openaiBinary, openaiForm, ensureDir } from "./lib/openai";

const MODEL = process.env.TTS_MODEL ?? "gpt-4o-mini-tts";
const VOICE = process.env.TTS_VOICE ?? "coral";
const INSTRUCTIONS =
  process.env.TTS_INSTRUCTIONS ??
  "Narradora de cuentos para chicos de 5 a 8 años. Español latinoamericano con un toque rioplatense suave (voseo natural, 'mirá', 'podés'; la 'y' y la 'll' suaves). Voz cálida, cercana y expresiva, sonrisa audible. Ritmo ágil y natural, sin apuro ni lentitud (como contando un cuento con energía), muy claro, con asombro en las exclamaciones y curiosidad en las preguntas. Pronunciá cada palabra completa, sin apurarte ni cortar el final de las frases.";

type Seg = { id: string; at: number; text: string; voice?: string; instructions?: string; emotion?: string; speaker?: string };
type Word = { text: string; start: number; end: number };

const args = process.argv.slice(2);
const force = args.includes("--force");
const estimate = args.includes("--estimate"); // sin API: tiempos estimados, sin audio → el render sale como PREVIEW mudo
const eps = args.filter((a) => !a.startsWith("--"));
if (!eps.length) { console.error("Uso: npm run voice -- ep001 [ep002] [--force]"); process.exit(1); }

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const wavDuration = (f: string) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

async function transcribeWords(file: string): Promise<Word[]> {
  const fd = new FormData();
  fd.append("file", new Blob([fs.readFileSync(file)], { type: "audio/wav" }), "seg.wav");
  fd.append("model", "whisper-1");
  fd.append("language", "es");
  fd.append("response_format", "verbose_json");
  fd.append("timestamp_granularities[]", "word");
  const j = await openaiForm("/audio/transcriptions", fd);
  return (j.words ?? []).map((w: any) => ({ text: w.word, start: w.start, end: w.end }));
}

/** Alinea las palabras del guion con las detectadas. Si no coinciden en cantidad, reparte por longitud dentro del tramo hablado. */
function align(script: string, heard: Word[], dur: number): { words: Word[]; voiceStart: number; voiceEnd: number } {
  const tokens = script.split(/\s+/).filter(Boolean);
  const voiceStart = heard.length ? heard[0].start : 0;
  const voiceEnd = heard.length ? heard[heard.length - 1].end : dur;
  if (heard.length === tokens.length) {
    return { words: tokens.map((t, i) => ({ text: t, start: heard[i].start, end: heard[i].end })), voiceStart, voiceEnd };
  }
  const weights = tokens.map((t) => Math.max(2, norm(t).length) + (/[.!?¿¡,]/.test(t) ? 2 : 0));
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const span = voiceEnd - voiceStart;
  return {
    words: tokens.map((t, i) => {
      const s = voiceStart + (acc / total) * span;
      acc += weights[i];
      return { text: t, start: s, end: voiceStart + (acc / total) * span };
    }),
    voiceStart, voiceEnd,
  };
}

async function main() {
  for (const ep of eps) {
    const data = JSON.parse(fs.readFileSync(p("data/episodes", `${ep}.json`), "utf8"));
    const segs: Seg[] = data.voice.segments;
    const dir = p("public/audio", ep); // ruta absoluta
    const cachePath = path.join(dir, "voice.json");
    ensureDir(cachePath);
    const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : { segments: {} };
    const out: any[] = [];
    if (estimate) {
      const est = segs.map((s) => {
        const words = s.text.split(/\s+/).filter(Boolean);
        const w = words.map((t) => Math.max(2, norm(t).length) + (/[.!?¿¡,]/.test(t) ? 2 : 0));
        const total = w.reduce((a, b) => a + b, 0), span = total * 0.075; // ≈ 13 caracteres/seg, ritmo infantil
        let acc = 0;
        return { id: s.id, text: s.text, file: null, offset: s.at, duration: span, voiceStart: s.at, voiceEnd: s.at + span,
          words: words.map((t, i) => { const a0 = s.at + (acc / total) * span; acc += w[i]; return { text: t, start: +a0.toFixed(3), end: +(s.at + (acc / total) * span).toFixed(3) }; }) };
      });
      const epDirName = fs.readdirSync(p("src/episodes")).find((d) => d.startsWith(ep));
      const target = p("src/episodes", epDirName ?? ep, "voice.generated.json");
      fs.writeFileSync(target, JSON.stringify({ model: "estimate", voice: "none", segments: est }, null, 2));
      console.log(`✓ ${ep}: guion con tiempos estimados (SIN audio) -> ${target}`);
      continue;
    }
    for (const s of segs) {
      const segVoice = s.voice ?? VOICE;
      const segInstr = (s.instructions ?? INSTRUCTIONS) + (s.emotion ? ` Emoción de esta frase: ${s.emotion}.` : "");
      const hash = crypto.createHash("sha1").update(JSON.stringify([s.text, segVoice, MODEL, segInstr])).digest("hex").slice(0, 12);
      const file = path.join(dir, `${s.id}.wav`);
      let entry = cache.segments[s.id];
      if (force || !entry || entry.hash !== hash || !fs.existsSync(file)) {
        console.log(`TTS ${ep}/${s.id}: "${s.text}"`);
        const buf = await openaiBinary("/audio/speech", { model: MODEL, voice: segVoice, input: s.text, instructions: segInstr, response_format: "wav" });
        fs.writeFileSync(file, buf);
        const dur = wavDuration(file);
        const heard = await transcribeWords(file);
        const al = align(s.text, heard, dur);
        entry = { hash, duration: dur, transcript: heard.map((w) => w.text).join(" "), ...al };
        cache.segments[s.id] = entry;
      } else console.log(`(caché) ${ep}/${s.id}`);
      // posición absoluta: el inicio de la VOZ cae en `at`
      const offset = s.at - entry.voiceStart;
      out.push({
        id: s.id, speaker: s.speaker ?? null, text: s.text, file: `audio/${ep}/${s.id}.wav`, offset, duration: entry.duration,
        voiceStart: s.at, voiceEnd: s.at + (entry.voiceEnd - entry.voiceStart),
        words: entry.words.map((w: Word) => ({ text: w.text, start: +(w.start + offset).toFixed(3), end: +(w.end + offset).toFixed(3) })),
      });
    }
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
    // Archivo que consume la composición (sin secretos): src/episodes/<ep>/voice.generated.json
    const epDirName = fs.readdirSync(p("src/episodes")).find((d) => d.startsWith(ep));
    const target = p("src/episodes", epDirName ?? ep, "voice.generated.json");
    ensureDir(target);
    fs.writeFileSync(target, JSON.stringify({ model: MODEL, voice: VOICE, segments: out }, null, 2));
    console.log(`✓ ${ep}: ${out.length} segmentos -> ${target}`);
    for (let i = 1; i < out.length; i++) {
      if (out[i].voiceStart < out[i - 1].voiceEnd + 0.15) console.warn(`  ⚠ ${out[i - 1].id} y ${out[i].id} casi se pisan: ajustá "at" en data/episodes/${ep}.json`);
    }
  }
}
main().catch((e) => { console.error(e.message); process.exit(1); });
