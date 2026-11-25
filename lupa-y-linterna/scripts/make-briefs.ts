// Genera briefs/<ep>.md (ficha del episodio + descripción de YouTube + checklist) desde data/episodes/<ep>.json.
// Uso: npm run briefs -- ep001 ep002
import fs from "node:fs";
import { p } from "./lib/paths";

const eps = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const closings: Record<string, string[]> = {
  ep001: ["Cierre del cuento: la sombra entra justo en el marco y saluda (es el remate; el video corta ~1 s después).", "Idea de cierre de juego (descripción): «Probalo con una linterna y una pared: ¿hasta dónde tenés que alejarte para que tu sombra entre en un cuadro?» (con un adulto)."],
  ep002: ["Cierre del juego: la revelación por el brazo y el camuflaje gradual completan la historia; no hace falta pedir comentarios.", "Idea: segunda pasada del juego en el próximo Short («¿Y si el pulpo se esconde en la arena?»)."],
};
const desc: Record<string, (m: any) => string> = {
  ep001: (m) => `¿Por qué mi sombra se hizo gigante? 🔦\n\nEl bebé quiere que su sombra gigante entre en el marco de la pared. Cuando se acerca a la linterna, la sombra crece; cuando se aleja, se achica… ¡hasta que entra justo! La linterna y la pared no se mueven: lo único que cambia es qué tan cerca de la luz está el bebé.\n\nProbalo en casa con una linterna y una pared (con un adulto): ¿hasta dónde crece tu sombra?\n\nFuente: ${m.source.title} — ${m.source.url}\n\n🎙️ La voz de este video fue generada con inteligencia artificial. Animación e ilustraciones creadas con herramientas de IA y edición de AKI Studio.\n\n#Shorts #ciencia #niños #sombras #LupaYLinterna`,
  ep002: (m) => `¿Podés encontrar al pulpo escondido? 🐙\n\n¿Estaba entre las algas o en la roca? El pulpo puede cambiar el color y la textura de su piel para parecerse a lo que tiene alrededor. Es su manera de esconderse: se camufla… pero si mueve un brazo, se lo puede seguir.\n\nFuente: ${m.source.title} — ${m.source.url}\n\n🎙️ La voz de este video fue generada con inteligencia artificial. Animación e ilustraciones creadas con herramientas de IA y edición de AKI Studio.\n\n#Shorts #ciencia #niños #pulpo #camuflaje #LupaYLinterna`,
};

for (const ep of eps) {
  const m = JSON.parse(fs.readFileSync(p("data/episodes", `${ep}.json`), "utf8"));
  const script = m.voice.segments.map((s: any) => `- **${s.at.toFixed(1)} s** — ${s.text}`).join("\n");
  const md = `# ${m.id} — ${m.title}

| Campo | Valor |
|---|---|
| ID | ${m.id} |
| Archivo | \`renders/${m.file}_FINAL.mp4\` (o \`_PREVIEW.mp4\` si la voz no está verificada) · versión anterior en \`renders/v1/\` |
| Formato | ${m.format} — ${m.formatName} |
| Título | ${m.title} |
| Duración objetivo | ${m.durationTargetSec} s · 1080×1920 · 30 fps |
| Estado | ${m.status} |
| Fuente | [${m.source.title}](${m.source.url}) |
| Primer cuadro sugerido (miniatura/portada) | ${m.firstFrameSuggested} |

## Dirección narrativa (regla de \`briefs/BRIEF-BASE.md\`)

1. **¿Qué se ve en el primer cuadro?** ${m.narrative.primerCuadro}
2. **¿Qué quiere lograr el personaje?** ${m.narrative.quiere}
3. **¿Qué aprende el chico?** ${m.narrative.aprende}
4. **¿Qué plano final lo demuestra?** ${m.narrative.planoFinal}

**Qué puede contar un chico después de verlo:** ${m.contaElChico}

## Guion de voz (${m.voice.person})

${script}
${m.voice.guessPause ? `\n> Pausa real de ≥ ${m.voice.guessPause.minSeconds} s tras «${m.voice.segments.find((s: any) => s.id === m.voice.guessPause.afterSegment).text}» (temporizador visual en pantalla).\n` : ""}
## Verificación científica

${m.scienceCheck}

## Descripción para YouTube (copiar y pegar)

\`\`\`
${desc[ep](m)}
\`\`\`

## Cierres sugeridos

${closings[ep].map((c) => `- ${c}`).join("\n")}

## Checklist de publicación

- [ ] Se cumplen las cuatro líneas narrativas y el objetivo se dice antes del segundo 4.
- [ ] Escuchar el MP4 completo (voz clara, ninguna frase cortada${m.voice.guessPause ? ", la pausa de adivinar se siente" : ""}).
- [ ] Ver el video en el celular con sonido apagado: ¿se entiende solo con imágenes?
- [ ] Subir el MP4 y elegir el primer cuadro / miniatura (ver «Primer cuadro sugerido»).
- [ ] Título y descripción cargados (con fuente y aviso de voz generada con IA).
- [ ] Audiencia: **«Sí, es contenido creado para niños»** (Creado para niños).
- [ ] Revisar la declaración de contenido alterado o sintético en Studio según las reglas vigentes de YouTube (la voz es generada con IA) — *confirmar en Studio*.
- [ ] Sin música/efectos de terceros: son propios (\`scripts/synth-audio.py\`); sin licencias que atribuir.
- [ ] Anotar fecha de publicación en \`data/metrics.csv\` y cargar métricas a las **48 h** y a los **7 días**.
`;
  fs.writeFileSync(p("briefs", `${ep}.md`), md);
  console.log("✓", `briefs/${ep}.md`);
}
