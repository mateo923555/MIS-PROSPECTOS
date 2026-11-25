// Verifica en el MP4 RENDERIZADO los momentos clave de la historia (regla narrativa de briefs/BRIEF-BASE.md).
// Extrae cuadros con ffmpeg y mide píxeles; guarda los cuadros en renders/frames/<ep>/check-*.png para mirarlos.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { p } from "./lib/paths";

type Res = { name: string; ok: boolean; detail: string };
const run = (cmd: string, a: string[]) => spawnSync(cmd, a, { encoding: "utf8" });
const stat = (...a: Array<string | number>) => parseFloat(run("python3", ["-I", p("scripts/frame_stats.py"), ...a.map(String)]).stdout.trim());

export function verifyNarrative(ep: string, mp4: string, meta: any, voice: any): Res[] {
  const out: Res[] = [];
  const add = (name: string, ok: boolean, detail: string) => out.push({ name, ok, detail });
  const dir = p("renders/frames", ep); fs.mkdirSync(dir, { recursive: true });
  const frame = (t: number, tag: string) => {
    const f = path.join(dir, `check-${tag}.png`);
    run("ffmpeg", ["-y", "-loglevel", "error", "-ss", t.toFixed(3), "-i", mp4, "-frames:v", "1", f]);
    return f;
  };
  const seg = (id: string) => voice.segments.find((s: any) => s.id === id);
  const dur = parseFloat(run("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4]).stdout);

  // — Regla común: objetivo dicho antes del segundo 4 y cierre rápido tras el remate
  const first = voice.segments[0];
  add("objetivo dicho antes del seg. 4", first.voiceStart < 4 && first.voiceEnd <= 4.5, `la primera frase «${first.text}» va de ${first.voiceStart.toFixed(1)} a ${first.voiceEnd.toFixed(1)} s`);
  const tail = dur - voice.segments[voice.segments.length - 1].voiceEnd;
  add("cierre inmediato tras el remate", tail >= 0.3 && tail <= 1.5, `${tail.toFixed(2)} s entre el fin de la última frase y el fin del video (0,3–1,5 s)`);
  add("duración 20–25 s", dur >= 20 && dur <= 25, `${dur.toFixed(2)} s`);
  add("dirección creativa: 6 puntos escritos", ["siente", "curiosidad", "intentaYOcurre", "momentoSorprendente", "aprendeYDemuestra", "finalSatisfactorio"].every((k) => meta.creative?.[k]), "data/episodes/" + ep + ".json → creative");
  add("cuatro líneas narrativas escritas", ["primerCuadro", "quiere", "aprende", "planoFinal"].every((k) => meta.narrative?.[k]) && !!meta.contaElChico, "data/episodes/" + ep + ".json → narrative + contaElChico");

  if (ep === "ep001") {
    const tEnd = seg("s4").voiceEnd, tHello = seg("s6").voiceStart;
    const tFit = seg("s5").voiceStart;
    // cuadros en plano general (zoom 1×): primer cuadro, antes del acercamiento de «crece», y después del descubrimiento
    const f0 = frame(0.0, "primer-cuadro"), fFit = frame(tFit + 2.2, "entra-justo"), fEnd = frame(dur - 0.5, "final"), fNear = frame(seg("s3").voiceStart + 3.2, "mas-cerca"), fFar = frame(tFit + 2.2, "mas-lejos");
    frame(1.4, "sorpresa-zoom"); frame(tFit + 0.7, "descubrimiento-zoom"); frame(seg("s3").voiceStart + 2.0, "explicacion-se-acerca"); frame(tEnd - 0.6, "explicacion-se-aleja");
    // franja de pared ARRIBA del marco (y 40–210, x 400–680): oscura si la cabeza de la sombra sobresale
    const over0 = stat("dark", f0, 400, 40, 680, 210, 50), overFit = stat("dark", fFit, 400, 40, 680, 210, 50), overEnd = stat("dark", fEnd, 400, 40, 680, 210, 50);
    add("primer cuadro: la sombra desborda el marco", over0 > 0.3, `${(over0 * 100).toFixed(0)} % de la franja sobre el marco está en sombra (esperado > 30 %)`);
    add("plano final: la sombra NO desborda", overFit < 0.05 && overEnd < 0.05, `franja sobre el marco en sombra: ${(overFit * 100).toFixed(0)} % al entrar, ${(overEnd * 100).toFixed(0)} % al final (esperado < 5 %)`);
    const inside = stat("dark", fEnd, 380, 300, 700, 700, 50);
    add("plano final: la sombra está dentro del marco", inside > 0.2, `${(inside * 100).toFixed(0)} % del interior del marco en sombra (esperado > 20 %)`);
    const dNear = stat("dark", fNear, 100, 100, 980, 700, 50), dFar = stat("dark", fFar, 100, 100, 980, 700, 50);
    add("acercarse agranda / alejarse achica", dNear > dFar, `pared en sombra: ${(dNear * 100).toFixed(0)} % (cerca) vs ${(dFar * 100).toFixed(0)} % (lejos)`);
    add("saluda en el plano final", tHello < dur - 1.0, `«${seg("s6").text}» empieza en ${tHello.toFixed(1)} s`);
    const g = run("npx", ["tsx", p("scripts/check-geometry.ts")]);
    add("geometría (D fija, entra justo)", g.status === 0, g.stdout.split("\n").filter((l) => l.startsWith("✓") || l.startsWith("✗")).length + " chequeos de scripts/check-geometry.ts");
  }
  if (ep === "ep002") {
    const ahi = seg("s3").voiceStart, m0 = seg("s5").voiceStart, m1 = seg("s5").voiceEnd, rem = seg("s6").voiceStart;
    const f0 = frame(0.0, "primer-cuadro");
    // región del pulpo en pantalla con la cámara fija (zoom 1,45 centrado en 670,930)
    const box = [163, 609, 975, 1167];
    const pre1 = frame(ahi - 1.0, "oculto-a"), pre2 = frame(ahi - 0.4, "oculto-b"), rev = frame(ahi + 0.9, "revelado");
    const hid = [f0, pre1, pre2].map((f) => stat("coral", f, 480, 688, 970, 1073));
    add("escondido de verdad: ningún píxel coral antes de la revelación", Math.max(...hid) < 0.0005, `fracción coral en la zona del pulpo: ${hid.map((h) => (h * 100).toFixed(3) + " %").join(" · ")} (esperado ≈ 0)`);
    const dHidden = stat("diff", pre1, pre2, 480, 688, 1060, 1073), dReveal = stat("diff", pre2, rev, ...box);
    add("antes de la revelación no hay pista", dHidden < 6, `cambio medio entre dos cuadros previos: ${dHidden.toFixed(1)} (esperado < 6; solo burbujas)`);
    add("la revelación se nota en el cuadro", dReveal > 8, `cambio medio al revelarse (contorno + brazo): ${dReveal.toFixed(1)} (esperado > 8)`);
    const times = [0, 0.25, 0.5, 0.75, 1].map((q) => m0 + 0.3 + q * (m1 - m0 - 0.6));
    const sats = times.map((t, i) => stat("sat", frame(t, `camuflaje-${i}`), ...box));
    const mono = sats.every((s, i) => i === 0 || s <= sats[i - 1] + 4);
    add("color: se parece cada vez más a la roca", mono && sats[0] - sats[4] > 25, `saturación en la región del pulpo: ${sats.map((s) => s.toFixed(0)).join(" → ")} (decreciente)`);
    const yel = [times[1], times[3], dur - 0.05].map((t, i) => stat("yellow", frame(t, `silueta-${i}`), ...box));
    add("durante el camuflaje se sigue viendo la silueta (contorno)", yel.every((y) => y > 0.004), `fracción de contorno amarillo en la región del pulpo: ${yel.map((y) => (y * 100).toFixed(2) + " %").join(" · ")} (esperado > 0,4 %; la forma queda como referencia)`);
    const e1 = frame(dur - 0.9, "final-a"), e2 = frame(dur - 0.6, "final-b"), e3 = frame(dur - 0.05, "ultimo-cuadro");
    const tipBox = [770, 650, 930, 810];
    const mv = Math.max(stat("diff", e1, e2, ...tipBox), stat("diff", e2, e3, ...tipBox));
    add("el brazo se sigue moviendo hasta el último cuadro", mv > 3, `cambio medio en la punta del brazo en el último segundo: ${mv.toFixed(1)} (esperado > 3)`);
    add("no hay repetición de cierre", rem + 3 >= dur - 1.5, `la última frase («${seg("s6").text}») empieza en ${rem.toFixed(1)} s de ${dur.toFixed(1)} s`);
    void f0;
  }
  return out;
}
