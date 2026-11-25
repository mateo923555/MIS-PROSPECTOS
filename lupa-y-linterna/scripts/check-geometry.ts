// Verifica la regla física/narrativa del Short 001 sin renderizar:
//  · linterna y pared fijas (D constante) · la sombra desborda el marco al inicio · crece al acercarse · se achica al alejarse
//  · entra JUSTO en el marco en el plano final (con las poses que se usan al final)
import { D, D_FIT, D_NEAR, D_START, FRAME, fits, shadowBox } from "../src/episodes/ep001-sombra/geometry";
const poses: Record<string, number> = { surprised: 660 / 1064, neutral: 523 / 1184, chest: 774 / 1401, waveA: 618 / 1057, waveB: 618 / 1057 };
let ok = true;
const check = (name: string, cond: boolean, detail: string) => { console.log(`${cond ? "✓" : "✗"} ${name}: ${detail}`); ok &&= cond; };
const start = fits(D_START, poses.surprised);
check("inicio desborda el marco", !start.ok, `sombra ${start.box.left.toFixed(0)}–${start.box.right.toFixed(0)} × tope ${start.box.top.toFixed(0)} vs marco ${FRAME.x0}–${FRAME.x1} × ${FRAME.y0}`);
const hStart = shadowBox(D_START, 1).h, hNear = shadowBox(D_NEAR, 1).h, hFit = shadowBox(D_FIT, 1).h;
check("acercarse agranda la sombra", hNear > hStart, `${hStart.toFixed(0)} → ${hNear.toFixed(0)} px`);
check("alejarse la achica", hFit < hNear && hFit < hStart, `${hNear.toFixed(0)} → ${hFit.toFixed(0)} px`);
for (const p of ["chest", "waveA", "waveB"]) {
  const f = fits(D_FIT, poses[p]);
  const m = f.margins;
  check(`plano final (${p}) entra justo`, f.ok && Math.min(m.left, m.right, m.top) < 40, `márgenes izq ${m.left.toFixed(0)} · der ${m.right.toFixed(0)} · arriba ${m.top.toFixed(0)} px (0–40 = justo)`);
}
check("distancia linterna–pared fija", D === 4.8, `D = ${D} en todo el episodio (solo cambia d)`);
process.exit(ok ? 0 : 1);
