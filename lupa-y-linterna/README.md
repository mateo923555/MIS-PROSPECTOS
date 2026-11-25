# Lupa y Linterna — proyecto de producción

Shorts de ciencia para chicos de 5 a 8 años (español latinoamericano). Un bebé de plastilina descubre un misterio cotidiano y lo resuelve con algo que se ve.
Stack: **TypeScript + Remotion**, voz con la **API de OpenAI**, todo local. El resultado de cada sesión son MP4 + fichas + metadatos para **revisar y publicar a mano**.

> Proyecto independiente (carpeta `lupa-y-linterna/`, con su propio `package.json`). No toca ni usa código, credenciales o configuración de YouTube de otros proyectos.
> Si lo querés como repo aparte: `cp -r lupa-y-linterna ../lupa-y-linterna && cd ../lupa-y-linterna && git init`.

## Dirección narrativa y creativa (v3) — leer primero

Todos los Shorts siguen **`briefs/BRIEF-BASE.md`**: primer cuadro raro que se entiende sin sonido → objetivo del personaje claro **antes del seg. 4** → intento/pista/dos opciones (juego: **2 s reales** de pensar) → **prueba** que completa la historia → cierre enseguida tras el remate. Antes de animar se escriben **cuatro líneas** por episodio (`data/episodes/epXXX.json → narrative`: primer cuadro · qué quiere · qué aprende · plano final) y una frase de «qué puede contar un chico» (`contaElChico`). **Dirección creativa:** el bebé es curioso, expresivo y cariñoso (observa → prueba → se sorprende → celebra) y cada episodio define 6 puntos (`creative`: qué siente el chico, curiosidad, qué intenta, momento sorprendente, qué aprende, final satisfactorio); planos cercanos para sentir, abiertos para entender. Detalle en `briefs/BRIEF-BASE.md`. La cola de ideas con sus cuatro líneas está en `briefs/cola-semana-1.md` (`data/queue.json`).

## Estado

| Entregable | Ruta | Estado |
|---|---|---|
| Short 001 **v3** «La sombra gigante» (A) | `renders/lupa-y-linterna_ep001_sombra-gigante_v3_*.mp4` | ver `renders/verification-ep001.json` |
| Short 002 **v3** «El pulpo escondido» (B) | `renders/lupa-y-linterna_ep002_pulpo-escondido_v3_*.mp4` | ver `renders/verification-ep002.json` |
| Versiones **v2** (archivadas, solo MP4) | `renders/v2/` (el código v2 está en el commit `d149f5b`) | conservadas |
| Versiones **v1** (archivadas) | `renders/v1/`, `data/episodes/v1/`, `src/episodes/v1/` (`Ep001SombraV1`, `Ep002PulpoV1`), `public/audio/v1/` | conservadas |
| Ficha del personaje | `docs/personaje.md` + `public/art/character/ficha-maestra.png` | listo |
| Brief base + cola (con 4 líneas) | `briefs/BRIEF-BASE.md`, `briefs/cola-semana-1.md`, `data/queue.json` | listo |
| Brief del horizontal | `briefs/h001-tres-misterios-de-luz.md` | brief listo (aplicar la regla narrativa al producirlo) |
| Medición | `data/metrics.csv` + `npm run metrics` | listo, métricas vacías |
| Fichas de episodio | `briefs/ep001.md`, `briefs/ep002.md` | listo |

**Etiquetas:** `_PREVIEW` = renderizado sin que la voz esté verificada. `_FINAL` = lo asigna **solo** `npm run verify` cuando la voz del MP4 renderizado se verificó (ffprobe + transcripción de la mezcla final). Aun así, **escuchalo vos** antes de publicar.

## Requisitos

- Node 22+, `ffmpeg`/`ffprobe`, Python 3 con `numpy` y `Pillow` (música/efectos y recorte de imágenes).
- Un navegador Chromium para Remotion: lo descarga solo, o `export BROWSER_EXECUTABLE=/ruta/al/chrome`.
- Clave de OpenAI en la variable de entorno `OPENAI_API_KEY` (voz, transcripción e imágenes). **Nunca** va en el repo, en logs ni en archivos de entrega.

```bash
npm install
export OPENAI_API_KEY=...        # solo en tu terminal
```

> Nota para entornos con proxy (p. ej. la nube): `export NODE_USE_ENV_PROXY=1` para que Node respete `HTTPS_PROXY`.

## Comandos

| Qué | Comando |
|---|---|
| Previsualizar (Remotion Studio) | `npm run studio` |
| Chequeo de tipos | `npm run typecheck` |
| Generar recursos visuales que falten | `npm run assets` (o `npm run assets -- --force c_wave_a`) |
| Música y efectos propios | `npm run audio:synth` |
| Voz + tiempos por palabra | `npm run voice -- ep001 ep002` |
| **Renderizar un episodio** | `npm run render -- ep001` |
| **Renderizar los dos pilotos** | `npm run render:all` |
| Masterizar audio (≈ -15 LUFS; `render` ya lo hace) | `npm run master -- ep001` |
| Chequeo de la geometría del ep001 (sin render) | `npm run check` |
| Verificar MP4 + momentos clave de la historia (y promover a FINAL) | `npm run verify -- ep001 ep002` |
| Cuadros de control (PNG) | `npm run stills -- ep001 0 2.5 9.9 22` → `renders/frames/ep001/` |
| Regenerar fichas `briefs/epXXX.md` | `npm run briefs -- ep001 ep002` |
| Medianas A vs B | `npm run metrics` |

Flujo completo de los pilotos: `npm run voice -- ep001 ep002 && npm run render:all && npm run verify -- ep001 ep002`.
Salidas: `renders/*.mp4`, `renders/verification-<ep>.json`.

### Sin acceso a voz

Si no hay clave/acceso: `npm run voice -- ep001 ep002 --estimate` (guion con tiempos estimados, sin audio) → `npm run render:all` deja `*_PREVIEW.mp4` mudos con subtítulos y música.
Para completarlos: configurá `OPENAI_API_KEY`, corré `npm run voice -- ep001 ep002 && npm run render:all && npm run verify -- ep001 ep002`.

## Estructura

```
data/episodes/epXXX.json   ficha + guion por segmentos (at = segundo donde empieza la voz) + fuente + estado
data/queue.json            cola editable de la semana · data/metrics.csv  medición
public/art/                personaje (poses PNG), fondos y objetos generados
public/audio/              voz por frase (ep001/…wav, caché), música y efectos propios
src/shared/                COMÚN: Character, Subtitles, Sound, Grain, motion, theme
src/episodes/ep00X-…/      UNA composición por episodio (armado de escena y animación propios) + voice.generated.json
scripts/                   assets, voz, render, verify, stills, briefs, métricas, síntesis de audio
briefs/  docs/  renders/
```

Cada episodio es una composición independiente (`Ep001Sombra`, `Ep002Pulpo`) registrada en `src/Root.tsx`. Para variar puesta en escena y ritmo no se rehace lo común: se crea otra carpeta en `src/episodes/` y se reutiliza `src/shared/`.

## Decisiones visuales

- **Imágenes generadas** con `gpt-image-2` a partir de una **ficha maestra** (4 poses). Cada pose y escena se generó referenciando esa ficha; los fondos magenta se recortan con `scripts/key.py` (alfa suave + despill) para tener capas animables.
- **Stop motion de verdad en el código:** personaje a 10 fps (pose/posición/vibración cada 3 cuadros), grano de plastilina que «hierve», caminata con saltito.
- **Ep. 001 v2 — objetivo: que la sombra entre en el marco.** Hay un marco coral en la pared; la sombra lo desborda al inicio, crece al acercarse, se achica al alejarse y entra **justo** al final (la geometría y sus márgenes se verifican en `scripts/check-geometry.ts`). **La sombra es física, no un dibujo:** distancia linterna–pared fija `D`; la sombra es la silueta del *mismo sprite* escalada por `s = D/d` desde la altura de la linterna, con penumbra que crece con `s`. Se recorta en la línea pared–piso. La linterna está delante del bebé y a un costado; el bebé se desplaza en diagonal para que la sombra quede centrada.
- **Ep. 002 v2 — objetivo: encontrar al pulpo y ver cómo se esconde otra vez.** Dos «?» sobre los escondites, pausa de 2 s con temporizador, revelación por el brazo, y el camuflaje avanza **gradualmente en el mismo encuadre** (manchitas) hasta que solo se lo sigue por el brazo en movimiento (aro sobre una ventosa). Sin repetición de cierre. **Camuflaje real:** la «piel de roca» es el propio fondo visto a través de la silueta del pulpo, así que se funde con la roca; se lo sigue distinguiendo por el contorno, los ojitos cerrados y el relieve. La transición es por manchitas (cromatóforos). El brazo se mueve por separado. La pausa de 2 s tiene un temporizador visual sin palabras. La comparación *Antes / Ahora* usa miniaturas de la misma escena.
- **Subtítulos** grandes (≈ 92 px), 1–3 palabras, palabra activa en amarillo, dentro de la franja segura de Shorts (`SAFE` en `src/shared/theme.ts`).
- **Audio:** al renderizar se masteriza la mezcla a ≈ -15 LUFS (sin recodificar el video). Voz por frase, ubicada por el inicio real de la voz; música propia con *ducking*; efectos propios. Todo sintetizado por `scripts/synth-audio.py` (sin muestras de terceros → **sin licencias que atribuir**).

## Próxima tanda (14 → siguientes Shorts)

1. Elegí un ítem de `data/queue.json` y **resolvé sus `porVerificar`** con una fuente; completá `fuente`.
2. Copiá `data/episodes/ep002.json` (o `ep001.json`) a `data/episodes/epNNN.json`: id, título, guion en segmentos con `at`, fuente.
3. Copiá la carpeta del episodio más parecido en `src/episodes/` y editá la escena; registrá la composición en `src/Root.tsx` y en `COMP` (`scripts/lib/remotion.ts`).
4. Recursos nuevos: agregalos a `scripts/assets-manifest.ts` y corré `npm run assets`.
5. `npm run voice -- epNNN` → `npm run stills -- epNNN 0 5 10 15 20` (revisar) → `npm run render -- epNNN` → `npm run verify -- epNNN`.
6. `npm run briefs -- epNNN` (agregá su texto en `scripts/make-briefs.ts`), publicá a mano y cargá `data/metrics.csv`.

## Medición y decisión editorial

`data/metrics.csv` tiene una fila por episodio y momento (**48 h** y **7 d**) con: vistas interesadas, % que decidió mirar, % promedio visto y suscriptores ganados (vacías hasta cargar). `npm run metrics` calcula **medianas de A y B en el mismo momento**.
No atribuyas diferencias al *hook* hasta tener varios episodios por formato (≥ 5 cada uno) y anotá tema, duración y ejecución visual (`notas_ejecucion`). **Subir a 3 diarios solo si** aparece un patrón repetible **y** se sostiene el horizontal semanal.
