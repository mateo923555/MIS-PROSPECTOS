import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { p } from "./paths";

/** Navegador: BROWSER_EXECUTABLE si existe; si no, el Chromium preinstalado (entornos Linux); si no, Remotion descarga el suyo. */
export const browserExecutable = (): string | null => {
  const env = process.env.BROWSER_EXECUTABLE;
  if (env && fs.existsSync(env)) return env;
  for (const c of ["/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell", "/opt/pw-browsers/chromium"]) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
};

export const makeBundle = () => bundle({ entryPoint: p("src/index.ts"), publicDir: p("public") });
export const outDir = () => { const d = p("renders"); fs.mkdirSync(d, { recursive: true }); return d; };
export const epFile = (ep: string) => JSON.parse(fs.readFileSync(p("data/episodes", `${ep}.json`), "utf8"));
export const COMP: Record<string, string> = { ep001: "Ep001Sombra", ep002: "Ep002Pulpo", ep001v1: "Ep001SombraV1", pruebalupa: "PruebaLupa", pruebamascotas: "PruebaMascotas", caminateresa: "PruebaCaminaTeresa", caminatimoteo: "PruebaCaminaTimoteo", reaccion: "PruebaReaccion", parpadeo: "PruebaParpadeo", rigtest: "RigTest", pruebasombra: "PruebaSombra", ep002v1: "Ep002PulpoV1" };
export { path };
