// Genera los recursos visuales con la API de imágenes de OpenAI (gpt-image-2) y recorta los fondos magenta.
// Uso: npm run assets            -> genera lo que falte
//      npm run assets -- --force id1 id2   -> regenera esos ids
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ASSETS, DOG_ASSETS, type AssetSpec } from "./assets-manifest";
import { openaiForm, openaiJson, ensureDir } from "./lib/openai";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));
const MODEL = process.env.IMAGE_MODEL ?? "gpt-image-2";

async function gen(spec: AssetSpec) {
  const out = path.join(ROOT, spec.out);
  const raw = path.join(ROOT, "art-raw", path.basename(out).replace(/\.png$/, ".raw.png"));
  fs.mkdirSync(path.dirname(raw), { recursive: true });
  ensureDir(out);
  const quality = spec.quality ?? "medium";
  let b64: string;
  if (spec.refs?.length) {
    const fd = new FormData();
    fd.append("model", MODEL);
    fd.append("prompt", spec.prompt);
    fd.append("size", spec.size);
    fd.append("quality", quality);
    for (const r of spec.refs) {
      fd.append("image[]", new Blob([fs.readFileSync(path.join(ROOT, r))], { type: "image/png" }), path.basename(r));
    }
    b64 = (await openaiForm("/images/edits", fd)).data[0].b64_json;
  } else {
    b64 = (await openaiJson("/images/generations", { model: MODEL, prompt: spec.prompt, size: spec.size, quality, n: 1 })).data[0].b64_json;
  }
  if (spec.key) {
    fs.writeFileSync(raw, Buffer.from(b64, "base64"));
    execFileSync("python3", ["-I", path.join(ROOT, "scripts/key.py"), raw, out], { stdio: "inherit" });
  } else {
    fs.writeFileSync(out, Buffer.from(b64, "base64"));
  }
  console.log(`✓ ${spec.id}`);
}

async function main() {
  const todo = [...ASSETS, ...DOG_ASSETS].filter((a) => (only.length ? only.includes(a.id) : true)).filter(
    (a) => force || !fs.existsSync(path.join(ROOT, a.out)),
  );
  console.log(`Generando ${todo.length} recurso(s) con ${MODEL}…`);
  // Los que dependen de otro recurso que también se genera ahora (p. ej. poses → ficha) van después.
  const outs = new Set(todo.map((t) => t.out));
  const deps = todo.filter((a) => a.refs?.some((r) => outs.has(r)));
  const free = todo.filter((a) => !deps.includes(a));
  const queue = [...free];
  const workers = Array.from({ length: 3 }, async () => {
    while (queue.length) {
      const s = queue.shift()!;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try { await gen(s); break; } catch (e) {
          console.error(`✗ ${s.id} intento ${attempt}:`, (e as Error).message);
          if (attempt === 3) process.exitCode = 1;
        }
      }
    }
  });
  await Promise.all(workers);
  const q2 = [...deps];
  await Promise.all(Array.from({ length: 3 }, async () => { while (q2.length) { const s = q2.shift()!; for (let k = 1; k <= 3; k++) { try { await gen(s); break; } catch (e) { console.error(`✗ ${s.id} intento ${k}:`, (e as Error).message); if (k === 3) process.exitCode = 1; } } } }));
}
main();
