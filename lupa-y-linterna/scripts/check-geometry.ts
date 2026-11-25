// Verifica la regla física/narrativa del Short 001 sin renderizar:
//  · linterna y pared fijas (D constante) · la sombra desborda el marco al inicio · crece al acercarse · se achica al alejarse
//  · entra JUSTO en el marco en el plano final (con las poses que se usan al final)
import fs from "node:fs";
import { cameraAt, toScreen } from "../src/episodes/ep001-sombra/camera";
import { D, D_FIT, D_NEAR, D_START, FRAME, fits, shadowBox } from "../src/episodes/ep001-sombra/geometry";
const poses: Record<string, number> = { surprised: 660 / 1064, neutral: 523 / 1184, chest: 774 / 1401, cheer: 697 / 1030, love: 443 / 1060, think: 492 / 1062, waveA: 618 / 1057, waveB: 618 / 1057 };
let ok = true;
const check = (name: string, cond: boolean, detail: string) => { console.log(`${cond ? "✓" : "✗"} ${name}: ${detail}`); ok &&= cond; };
const start = fits(D_START, poses.surprised);
check("inicio desborda el marco", !start.ok, `sombra ${start.box.left.toFixed(0)}–${start.box.right.toFixed(0)} × tope ${start.box.top.toFixed(0)} vs marco ${FRAME.x0}–${FRAME.x1} × ${FRAME.y0}`);
const hStart = shadowBox(D_START, 1).h, hNear = shadowBox(D_NEAR, 1).h, hFit = shadowBox(D_FIT, 1).h;
check("acercarse agranda la sombra", hNear > hStart, `${hStart.toFixed(0)} → ${hNear.toFixed(0)} px`);
check("alejarse la achica", hFit < hNear && hFit < hStart, `${hNear.toFixed(0)} → ${hFit.toFixed(0)} px`);
for (const p of ["cheer", "chest", "waveA", "waveB", "love"]) {
  const f = fits(D_FIT, poses[p]);
  const m = f.margins;
  check(`plano final (${p}) entra justo`, f.ok && Math.min(m.left, m.right, m.top) < 60, `márgenes izq ${m.left.toFixed(0)} · der ${m.right.toFixed(0)} · arriba ${m.top.toFixed(0)} px (0–60 = justo)`);
}
check("distancia linterna–pared fija", D === 4.8, `D = ${D} en todo el episodio (solo cambia d)`);
// — Vista clara durante la explicación (se acerca / se aleja): linterna, bebé y pared/marco dentro del cuadro y zoom mínimo
const v = JSON.parse(fs.readFileSync(new URL("../src/episodes/ep001-sombra/voice.generated.json", import.meta.url), "utf8"));
const seg = (id: string) => v.segments.find((s: any) => s.id === id);
const wst = (id: string, n: string) => (seg(id).words.find((w: any) => w.text.toLowerCase().includes(n)) ?? seg(id).words[0]).start;
const T = { question: seg("s2").voiceStart, acerco: wst("s3", "acerco"), crece: wst("s3", "crece"), alejo: wst("s4", "alejo"), s4End: seg("s4").voiceEnd, fit: seg("s5").voiceStart };
let worstScale = 1, allIn = true;
for (let t = T.acerco - 0.2; t <= T.s4End + 0.05; t += 0.05) {
  const c = cameraAt(t, T);
  worstScale = Math.max(worstScale, c.scale);
  const pts = [[145, 984], [395, 1265], [314, 214], [766, 768], [300, 640], [420, 1100]]; // linterna, marco/pared, bebé (cabeza y pies, rango de su recorrido)
  for (const [x, y] of pts) { const p = toScreen(x, y, c); if (p.x < 0 || p.x > 1080 || p.y < 0 || p.y > 1920) allIn = false; }
}
check("explicación: linterna, bebé y pared siempre visibles", allIn, `entre ${T.acerco.toFixed(1)} s y ${T.s4End.toFixed(1)} s los tres quedan dentro del cuadro`);
check("explicación: zoom mínimo", worstScale <= 1.2, `escala máxima ${worstScale.toFixed(2)} (≤ 1,20) durante «me acerco / me alejo»`);
const c0 = cameraAt(0, T);
check("primer cuadro en plano general", c0.scale === 1, `escala ${c0.scale} en t=0`);
check("hay acercamientos de sorpresa y descubrimiento", cameraAt(1.3, T).scale >= 1.5 && cameraAt(T.fit + 0.6, T).scale >= 1.4, `sorpresa ${cameraAt(1.3, T).scale.toFixed(2)}× · descubrimiento ${cameraAt(T.fit + 0.6, T).scale.toFixed(2)}×`);
process.exit(ok ? 0 : 1);
