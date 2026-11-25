// Mediana por formato (A vs B) en el MISMO momento de medición. Uso: npm run metrics
// Lee data/metrics.csv; ignora celdas vacías. No concluye nada con < 5 episodios por formato.
import fs from "node:fs";
import { p } from "./lib/paths";

const rows = fs.readFileSync(p("data/metrics.csv"), "utf8").trim().split(/\r?\n/).map((l) => l.split(","));
const head = rows.shift()!;
const col = (n: string) => head.indexOf(n);
const med = (a: number[]) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : NaN; };
const metrics = ["vistas_interesadas", "pct_decidio_mirar", "pct_promedio_visto", "suscriptores_ganados"];
for (const when of ["48h", "7d"]) {
  console.log(`\n== Medición ${when} ==`);
  for (const f of ["A", "B"]) {
    const sel = rows.filter((r) => r[col("medicion")] === when && r[col("formato")] === f && r[col("vistas_interesadas")] !== "");
    const out = metrics.map((m) => `${m}: ${med(sel.map((r) => parseFloat(r[col(m)])).filter((x) => !isNaN(x))).toFixed(1)}`);
    console.log(`Formato ${f} (n=${sel.length}) -> ${out.join(" | ")}${sel.length < 5 ? "  ⚠ n<5: todavía no atribuir resultados al hook" : ""}`);
  }
}
