// Cuadros de control (PNG) de un episodio: npm run stills -- ep001 0 2.5 5 12 21
import path from "node:path";
import fs from "node:fs";
import { renderStill, selectComposition } from "@remotion/renderer";
import { COMP, browserExecutable, makeBundle } from "./lib/remotion";
import { p } from "./lib/paths";

const [ep, ...times] = process.argv.slice(2);
const serveUrl = await makeBundle();
const comp = await selectComposition({ serveUrl, id: COMP[ep], browserExecutable: browserExecutable() });
const dir = p("renders", "frames", ep);
fs.mkdirSync(dir, { recursive: true });
for (const t of times) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(parseFloat(t) * comp.fps));
  const output = path.join(dir, `t${String(t).replace(".", "_")}.png`);
  await renderStill({ composition: comp, serveUrl, output, frame, browserExecutable: browserExecutable(), imageFormat: "png", scale: 0.5 });
  console.log("✓", output);
}
