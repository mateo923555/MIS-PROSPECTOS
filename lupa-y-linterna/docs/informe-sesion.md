# Informe de sesión — Lupa y Linterna (para pasarle contexto completo a otra IA)

Fecha de la sesión: 2026-11-25. Quien pidió el trabajo: Mateo (AKI Studio). Idioma de trabajo: español rioplatense.

## 1. Qué se pidió

Construir un proyecto de producción para un segundo canal de YouTube infantil, provisoriamente «Lupa y Linterna» (@lupaylinterna, a verificar en Studio), y renderizar los dos primeros Shorts:

- Audiencia: chicos de 5 a 8 años, español latinoamericano. Premisa: un bebé ficticio de plastilina descubre un misterio cotidiano y lo resuelve con algo que se ve.
- Dos formatos: **A** «¿Por qué pasa esto?» y **B** «¿Podés descubrirlo?». Hipótesis a comparar con los primeros 14 Shorts.
- Shorts de 20–25 s, 9:16, 1080×1920, 30 fps, H.264 + AAC. Misterio en pantalla en los primeros 2 s, 3–4 planos, subtítulos grandes, música baja, narración al frente, margen final de audio de 0,3–0,5 s.
- Short 001 (formato A, 23 s): «¿Por qué mi sombra se hizo gigante?». Short 002 (formato B, 24 s): «¿Podés encontrar al pulpo escondido?» (pausa real de 2 s para adivinar).
- Además: ficha del personaje, cola editable de 14 ideas (7 días × 2), brief de un episodio horizontal («Tres misterios de luz con Lupa y Linterna», 16:9, 4–6 min), CSV de medición (48 h y 7 días), README, verificación con ffprobe y revisión de cuadros.
- Reglas: TypeScript + Remotion; voz con la API de OpenAI leyendo la clave por variable de entorno (nunca en repo/logs/entregas); música y efectos propios o con licencia comprobable; etiqueta FINAL solo para el MP4 con voz verificada, si no PREVIEW; checklist con «Creado para niños»; aviso de voz generada con IA en la descripción.

## 2. Entorno real de la sesión (importante)

- La sesión corrió en un **contenedor Linux en la nube** (Claude Code remoto), **no en la Mac de Mateo**. Node 22.23.5, ffmpeg/ffprobe, Chromium preinstalado.
- El repo de trabajo era `mateo923555/MIS-PROSPECTOS` (un CRM de prospectos con React + Vite). **No** era Mapadoja ni AKI OS. No hubo acceso al método de producción de Mapadoja ni a sus archivos; no se tocó nada de eso.
- Decisión: crear el proyecto como **subcarpeta independiente `lupa-y-linterna/`** con su propio `package.json`, sin tocar el CRM. (El pedido decía «proyecto hermano fuera del repo» solo si se estaba dentro de Mapadoja/AKI OS; además los archivos tenían que quedar dentro del directorio de trabajo para que Mateo los abriera, y la rama de trabajo asignada era del repo MIS-PROSPECTOS.)
- Rama de desarrollo: `claude/lupa-linterna-shorts-pilot-zsmafp`. Un commit con todo (93 archivos). **No se creó pull request.**
- OpenAI: no había variable `OPENAI_API_KEY`, pero el proxy del entorno inyecta credenciales para `api.openai.com`, así que se usó con una clave dummy. Node necesita `NODE_USE_ENV_PROXY=1` para respetar `HTTPS_PROXY`. La clave real nunca se vio ni se guardó.
- Modelos de OpenAI usados: `gpt-image-2` (imágenes), `gpt-4o-mini-tts` (voz), `whisper-1` (tiempos por palabra y verificación).

## 3. Stack y estructura

Remotion 4.0.547, React 18, TypeScript, tsx, `@remotion/bundler`/`renderer`/`cli`, fuente Fredoka (`@fontsource/fredoka`, copiada a `public/fonts`). Python 3 con numpy y Pillow para recortes y síntesis de audio.

```
lupa-y-linterna/
  README.md                      comandos, estructura, decisiones, próxima tanda, medición
  package.json / tsconfig.json / remotion.config.ts
  data/episodes/ep001.json, ep002.json   ficha + guion en segmentos (at = segundo en que empieza la voz) + fuente + estado
  data/queue.json                cola editable de 14 ideas (+ primerHorizontal)
  data/metrics.csv               28 filas (14 episodios × 48h/7d), métricas vacías
  public/art/character/          ficha-maestra.png + poses PNG recortadas
  public/art/generated/          bg_room, bg_sea, flashlight, octopus
  public/art-grain-0..2.png      grano de plastilina
  public/audio/ep001|ep002/      voz por frase (wav) + voice.json (caché)
  public/audio/music/            linterna.wav, mar.wav
  public/audio/sfx/              pop, tap, click, whoosh, sparkle, tada, discover, morph, bubbles, ding, think
  src/index.ts, src/Root.tsx     registro de composiciones Ep001Sombra y Ep002Pulpo
  src/shared/                    COMÚN: theme, motion, Character, Subtitles, Sound, Grain, Fonts, voice
  src/episodes/ep001-sombra/     Ep001Sombra.tsx + voice.generated.json
  src/episodes/ep002-pulpo/      Ep002Pulpo.tsx + Octopus.tsx + voice.generated.json
  scripts/                       assets-manifest, gen-assets, key.py, gen-voice, synth-audio.py, render, master-audio,
                                 verify, stills, contact.py, make-briefs, analyze-metrics, lib/
  briefs/                        ep001.md, ep002.md, h001-tres-misterios-de-luz.md
  docs/                          personaje.md, informe-sesion.md (este)
  renders/                       los MP4 finales + verification-*.json + transcript
```

Cada episodio es una composición independiente que reutiliza `src/shared/` (personaje, subtítulos, audio, grano, utilidades de movimiento). La puesta en escena y animación de cada episodio viven en su propia carpeta.

## 4. Identidad visual y recursos generados

- **Ficha maestra** (`public/art/character/ficha-maestra.png`, `gpt-image-2`, 1536×1024, calidad alta): bebé de plastilina, cabeza redonda, ojos negros brillantes, **tres mechones marrones** (rasgo firma, se reconoce hasta en sombra), jardinero de pana verde petróleo con dos botones crema y bolsillo en el pecho, remera crema, descalzo, **linterna amarilla asomando del bolsillo del pecho** (las manos quedan libres). La primera versión salió con un solo mechón y la linterna en la mano; se regeneró con prompt corregido.
- **Poses** (cada una por `/images/edits` con la ficha como referencia, fondo magenta plano, recorte con `scripts/key.py`: alfa suave, estimación del color de fondo desde los bordes y des-premultiplicado): `c_neutral`, `c_surprised`, `c_wave_a`, `c_wave_b` (derivada de `c_wave_a`), `c_chest`, `c_point`, y con **visor de buceo coral** `m_point`, `m_look`, `m_surprised`. Se probó `gpt-image-1.5` con fondo transparente y se descartó: menos fiel a la textura de la ficha.
- **Escenarios/objetos**: `bg_room` (pared verde petróleo + piso de madera, línea pared-piso al 56 % de la altura), `flashlight` (linterna grande sobre bloque crema, vista trasera, apunta hacia arriba a la derecha), `bg_sea` (mar en azules apagados: algas a la izquierda, gran roca con cara plana a la derecha, arena abajo), `octopus` (pulpo coral con 8 brazos extendidos; **se regeneró** porque la primera versión traía una roca/decoración pegada).
- **Paleta**: verde petróleo `#1F5F63`, crema `#F3E7C9`, amarillo cálido `#F6C945`, coral `#F2705B`, azules apagados `#2F5F7E`/`#1B3C57` (escena submarina).
- **Estética stop motion hecha en código**: el personaje se actualiza a **10 fps** (pose/posición/vibración cada 3 cuadros), caminata con saltito + inclinación alternada, y un **grano de plastilina** que «hierve» cada 3 cuadros (3 PNG de ruido en `soft-light`).
- Limitación honesta: los factores de escala por pose (`POSES[...].k` en `Character.tsx`) quedaron todos en 1,0; hay pequeñas diferencias de tamaño de cabeza entre poses (por ejemplo `c_chest`) que no se corrigieron. `c_point` se generó pero no se usa en ningún episodio.

## 5. Voz y audio

- **Voz**: `gpt-4o-mini-tts`, voz `coral`, formato wav, con instrucciones: narradora de cuentos para chicos de 5–8 años, español latinoamericano con toque rioplatense suave (voseo), cálida y expresiva, ritmo pausado, pronunciar cada palabra completa. Configurable por `TTS_VOICE`, `TTS_MODEL`, `TTS_INSTRUCTIONS`.
- **Un archivo por frase/segmento** (`public/audio/<ep>/sN.wav`) con caché por hash SHA-1 de texto+voz+modelo+instrucciones: solo se regenera si algo cambia. Los tiempos por palabra salen de `whisper-1` (timestamps de palabra); si el recuento no coincide con el guion se reparte proporcionalmente dentro del tramo hablado. Cada segmento se ubica de modo que el **inicio real de la voz** caiga en `at`.
- Bug que se encontró y corrigió: `p()` duplicaba la ruta absoluta y los wav se guardaron en una carpeta anidada; se corrigió y se movieron.
- Tiempos de voz (inicio de la voz → fin):
  - ep001: s1 «¡Esa sombra es gigante! ¿De quién será?» 0,30–4,24 · s2 «Es mía.» 4,70–6,12 · s3 «Mirá, me acerco a la linterna y mi sombra crece.» 6,30–10,46 · s4 «Ahora me alejo y se achica.» 12,60–15,44 · s5 «¡Hasta la sombra puede saludar!» 18,30–21,24.
  - ep002: s1 «Acá hay un pulpo escondido.» 0,30–3,38 · s2 «¿Entre las algas o pegado a la roca?» 3,75–7,03 · (pausa real ≈ 2,07 s, sin voz 7,18–8,95) · s3 «¡Ahí está! Cambió el color y la textura de su piel para parecerse a la roca.» 9,10–14,44 · s4 «Mirá cómo se mueve.» 14,80–16,28. Después de 16,3 s no hay narración (solo música, efectos y la repetición visual).
- **Modo sin voz**: `gen-voice --estimate` genera guion con tiempos estimados y sin audio (`file: null`) para renderizar PREVIEW mudo. **Se implementó pero no se probó de punta a punta.**
- **Música y efectos 100 % propios**, sintetizados por `scripts/synth-audio.py` (síntesis aditiva con numpy, sin muestras ni bancos externos → no hay licencias de terceros): `linterna.wav` (Do mayor pentatónica, progresión C–Am–F–G, 100 bpm, tipo kalimba) y `mar.wav` (re, 76 bpm, colchón con trémolo, campanitas, burbujas); efectos `pop, tap, click, whoosh, sparkle, tada, discover, morph, bubbles, ding, think`. Procedencia y licencia: generados por este script (AKI Studio / Lupa y Linterna).
- Mezcla en Remotion: voz al frente (volumen 1), música base 0,2 con *ducking* a 0,1 mientras habla la voz y fundidos de entrada/salida, efectos puntuales (0,3–0,55).
- **Masterización**: al terminar el render se aplica `loudnorm` (I = −15 LUFS, TP = −1,5 dB, LRA = 9) con ffmpeg **sin recodificar el video** (`-c:v copy -shortest`). Sin esto la mezcla salió en −24 y −20,5 LUFS (muy baja).

## 6. Short 001 — «¿Por qué mi sombra se hizo gigante?» (formato A, 23 s)

Archivo: `renders/lupa-y-linterna_ep001_sombra-gigante_FINAL.mp4` (13,3 MB). Composición `Ep001Sombra`.

**Física real de la sombra** (no es un dibujo): fuente puntual (linterna) → bebé → pared. Distancia linterna–pared fija `D = 4,8` (en unidades de bebé); el bebé está a distancia `d` de la luz; la sombra se escala por `s = D/d` respecto de la altura de la linterna (`LAMP_H = 0,5`), así que crece hacia arriba y se corta en la línea pared–piso. La sombra es la **silueta (brightness 0) del mismo sprite** y del mismo movimiento/vibración que el bebé, con penumbra que crece con `s` (blur = 3 + (s−1)·2,4) y `mix-blend-mode: multiply`. La linterna está delante y a la izquierda; el bebé se desplaza en diagonal (`lateral = XL·(1 − d/D)`) para que la sombra quede centrada. La linterna se dibuja delante del bebé (más cerca de cámara). Luz: oscuridad con «agujero» para el haz (SVG con máscara y desenfoque) + brillo cálido; guía de puntitos coral desde la linterna a la pared (distancia fija).

**Línea de tiempo**: 0–2 s plano cerrado en la sombra gigante (cámara escala 1,8, el bebé queda fuera de cuadro; pared extendida hacia arriba para ese plano) · 2,0–3,5 s la cámara se abre y revela linterna, bebé y pared · 0–4,55 sorprendido (manos arriba) · 4,55–6,2 mano en el pecho («Es mía») · el bebé se aparta (d 1,8→3,4) · 7,3–10,2 se acerca (d→1,5) y la sombra crece sincronizada con «me acerco… mi sombra crece» · 10,4–12,9 sorprendido, sombra gigante · 13,4–16,0 se aleja (d→3,6), sombra chica y nítida con «se achica» · se acomoda (d 2,3) · 18,2–23 saludo alternando `waveA/waveB` a 5 fps, y la sombra repite el gesto · marca «Lupa y Linterna» discreta desde 21,6 s en la franja de subtítulos.

Efectos: click 2,0 · whoosh 2,15 · tap en cada cambio de pose · sparkle 18,3 · tada 21,55.

## 7. Short 002 — «¿Podés encontrar al pulpo escondido?» (formato B, 24 s)

Archivo: `renders/lupa-y-linterna_ep002_pulpo-escondido_FINAL.mp4` (15,5 MB). Composición `Ep002Pulpo` + `Octopus.tsx`.

- **Camuflaje real**: la «piel de roca» es el propio fondo (`bg_sea`) visto a través de la silueta del pulpo (máscara CSS con el alfa del pulpo), por lo que coincide con la roca; se sigue distinguiendo por relieve gris de las ventosas (multiplicado al 20 %), contorno y ojitos cerrados (rendijas al 40 % de opacidad, pista muy sutil). La transición coral↔roca es **por manchitas** (rejilla de 15×11 círculos con retardos pseudoaleatorios deterministas; radio ∝ q²), simulando cromatóforos.
- **Brazo que se mueve**: un brazo (polígono en coordenadas de la imagen) se recorta y rota alrededor de un pivote; el resto del cuerpo se recorta con `clip-path` evenodd. Es lo que lo delata a partir de 9,1 s.
- **Contorno amarillo** para mostrar la silueta completa: se genera con un filtro SVG (`feMorphology` dilate + `feComposite out`) que dibuja **solo el anillo** (se corrigió un defecto: una copia coral del pulpo quedaba visible debajo cuando el brazo se movía); el anillo del brazo rota junto con él.
- **Tiempos anclados a la voz** (las constantes `T` se leen de `voice.generated.json`, así que si cambia la voz la puesta en escena la sigue): 0–1,8 escena sola · 1,8 el bebé con visor aparece (pop) · 2–5 mira/escanea · señala algas (izquierda, sprite espejado) en «algas» y la roca (derecha) en «roca» · tras la pregunta, **temporizador circular coral con «?»** durante la pausa de ≥ 2 s · 9,1 «¡Ahí está!»: sorpresa, brazo se mueve, aparece el contorno y la cámara se acerca · ≈ 9,65–10,15 aparece su color coral · desde «Cambió» (≈ 10,6) hasta el fin de la frase pasa lentamente a camuflaje · 14,8 «Mirá cómo se mueve»: brazo más amplio · 16,8–17,4 vuelve a coral (repetición) · 17,4+ **comparación «Antes → Ahora»** con miniaturas circulares de la misma escena (coral vs. camuflado con contorno) · 19,3–21,7 se camufla otra vez · cámara final en plano cerrado del pulpo (escala ≈ 1,9).
- Extras: burbujas procedurales; bebé flota con leve oscilación; no hay marca final (para no tapar las miniaturas).
- Efectos: bubbles+pop al entrar, tap en gestos, think tras la pregunta, discover en «¡Ahí está!», whoosh, sparkle al aparecer el color, morph en cada transformación, tada 22,0.

## 8. Subtítulos y zonas seguras

`src/shared/Subtitles.tsx`: frases de 1–3 palabras partidas por puntuación, ~92 px Fredoka 700, crema sobre píldora verde petróleo semitransparente, palabra activa en amarillo, pop-in suave; cada frase se queda 0,45 s tras terminar. Posición en la franja `y = 1330–1540` (`SAFE` en `theme.ts`): por encima de la zona inferior de la interfaz de Shorts (≈ 380 px) y con margen derecho de 150 px. Sincronizados con los tiempos por palabra de la voz.

## 9. Render, verificación y resultados

- **Render**: `scripts/render.ts` (bundle + `renderMedia`, H.264, AAC 192k, crf 18, `yuv420p`, cuadros **PNG**, `bt709`, concurrencia 3). Primer intento con cuadros JPEG salió `yuvj420p` (rango completo); la verificación lo detectó y se cambió a PNG. Salen como `*_PREVIEW.mp4`; solo `npm run verify` los promueve a `*_FINAL.mp4`. Tiempos: ep001 ≈ 6 min, ep002 ≈ 4–10 min.
- **Verificación** (`scripts/verify.ts`): ffprobe, picos/loudness con ffmpeg, margen final, pausa del pulpo, y **transcripción con timestamps de la mezcla final renderizada** comparada con el guion. Resultados finales:
  - ep001: 23,00 s · 1080×1920 · 30 fps · H.264 yuv420p · AAC 48 kHz · −14,3 LUFS · pico −1,5 dBFS · margen final 1,76 s · las 5 frases al 100 %.
  - ep002: 24,00 s · 1080×1920 · 30 fps · H.264 yuv420p · AAC 48 kHz · −15 LUFS · pico −1,5 dBFS · pausa de adivinar 2,07 s sin voz · las 4 frases al 100 % (margen final 7,7 s).
  - Transcripción de la mezcla (coincide con el guion): ep001 «Esa sombra es gigante. ¿De quién será? Es mía. Mirá, me acerco a la linterna y mi sombra crece. Ahora me alejo y se achica. Hasta la sombra puede saludar.» ep002 «Acá hay un pulpo escondido. Entre las algas o pegado a la roca. ¡Ahí está! Cambió el color y la textura de su piel para parecerse a la roca. ¡Mirá cómo se mueve!»
  - `tsc --noEmit` sin errores (no había otros comandos de validación en el proyecto nuevo).
- **Revisión de cuadros** (extraídos de los MP4): inicio, revelación y cierre de cada video; personaje consistente, sombra coherente con la geometría, camuflaje correcto, subtítulos legibles y fuera de la demostración. Se corrigieron en el camino: seam/ausencia de pared arriba en el plano inicial, baby tapando la linterna (orden de dibujo), subtítulo final «pegado», transición del pulpo demasiado rápida, marca tapando miniaturas/mechones, anillo con restos coral.

## 10. Cola editorial (data/queue.json)

14 ítems editables (id, día, formato, título, línea visual, estado, fuente, `porVerificar`):

- D1: A Sombra gigante (ep001, hecho) / B Pulpo escondido (ep002, hecho).
- D2: A La Luna parece seguirte / B ¿Flota el barquito de aluminio?
- D3: A El lápiz parece doblarse en el agua / B ¿Qué objeto atrae el imán?
- D4: A El eco devuelve tu voz / B ¿Dónde está el insecto palo?
- D5: A El globo atrae papelitos / B ¿Qué pasa con la pimienta al tocar el agua con jabón?
- D6: A Cómo aparece un arcoíris en la niebla / B ¿Cuál de estas sombras será más grande?
- D7: A Por qué flota el hielo / B ¿Qué animal dejó estas huellas?

Datos marcados «por verificar» (no se consultaron fuentes externas en esta sesión): explicación de paralaje de la Luna; resultado real de la bolita vs. barquito de aluminio (probar físicamente); objetos que atrae un imán y seguridad con imanes chicos; distancia mínima para un eco claro (≈ 17 m); datos del insecto palo; explicación de la estática y seguridad con globos; tensión superficial en el experimento de pimienta y jabón; **el arcoíris en niebla densa suele verse casi blanco («fogbow»)**, quizá convenga retitular como «con gotitas de agua»; por qué flota el hielo (evitar la explicación errónea de burbujas de aire); huellas fieles de 3 animales (idealmente latinoamericanos).

## 11. Brief del episodio horizontal (briefs/h001-tres-misterios-de-luz.md)

«Tres misterios de luz con Lupa y Linterna», 1920×1080, ≈ 5:15 (objetivo 4–6 min), estado BRIEF (sin producir). Historia original: una **luciérnaga de plastilina, Chispa**, perdió su luz del otro lado de la colina al atardecer; el bebé necesita entender cómo viaja la luz para guiarla. Estructura: apertura 0:00–0:30 (tres sobres 1-2-3) · misterio 1 sombra 0:30–1:50 (reutiliza el sistema de Ep001; hace una «señal» con la sombra) · transición de agua · misterio 2 lápiz que se dobla 2:10–3:30 (refracción; aprende a apuntar la luz a través del agua hasta la piedra brillante) · transición de gotas · misterio 3 arcoíris 3:50–4:50 (regadera, de espaldas al sol) · resolución 4:50–5:15 (usa las tres pistas para guiar a Chispa) · cierre 5:15–5:30. Motivo para verlo completo: problema con reloj, personaje en apuros y pregunta abierta («¿cómo sirven tres trucos de luz para llevar a Chispa a casa?»); mini-juegos con pausa de 2 s. Incluye recursos a reutilizar, recursos nuevos (Chispa, jardín, laguna, vaso/lápiz, regadera + arcoíris, tarjeta final), fuentes a verificar (ACS sombra verificada; refracción y arcoíris por confirmar) y riesgos abiertos (voz en 1.ª persona vs. narradora; recortar si pasa de 6:00; seguridad con linterna/agua/sol).

## 12. Medición y decisión editorial

`data/metrics.csv`: columnas `id, tema, formato, duracion_s, fecha_publicacion, medicion, vistas_interesadas, pct_decidio_mirar, pct_promedio_visto, suscriptores_ganados, notas_ejecucion`; una fila por episodio y momento (48 h / 7 d); métricas vacías (duración precargada para ep001=23 y ep002=24). `npm run metrics` calcula **medianas de A vs. B en el mismo momento de medición** e ignora celdas vacías; avisa si n < 5 por formato. Regla anotada: no atribuir diferencias al hook hasta tener varios episodios de cada formato, anotar diferencias de tema/duración/ejecución, y **subir a 3 diarios solo si hay un patrón repetible y se sostiene el horizontal semanal**.

## 13. Fichas, descripciones y publicación

`briefs/ep001.md` y `briefs/ep002.md` (generadas por `npm run briefs` desde `data/episodes/*.json`) incluyen: archivo, ID, formato A/B, título, guion, fuente, estado, primer cuadro sugerido, verificación científica, **descripción de YouTube lista para pegar** (con fuente y aviso de voz generada con IA), cierres sugeridos que no dependen de comentarios (el saludo/«antes–ahora» ya completa la historia; reto de probar en casa con linterna y adulto) y checklist de publicación con **«Creado para niños»**, revisión de la declaración de contenido alterado/sintético en Studio (a confirmar) y carga de métricas a 48 h y 7 d.
Fuentes: ep001 ACS «S is for Shadow» (https://www.acs.org/education/whatischemistry/adventures-in-chemistry/science-abc/s-is-for-shadow.html); ep002 Smithsonian Ocean «How Octopuses and Squids Change Color» (https://ocean.si.edu/ocean-life/invertebrates/how-octopuses-and-squids-change-color). Las URLs vinieron en el pedido; no se abrieron ni se contrastaron en esta sesión (la verificación científica se hizo contra el contenido del pedido y conocimiento general).

## 14. Comandos (todos desde `lupa-y-linterna/`)

```
npm install
export OPENAI_API_KEY=...          # solo en la terminal; en entornos con proxy: export NODE_USE_ENV_PROXY=1
npm run studio                      # previsualizar
npm run typecheck
npm run assets [-- --force c_wave_a]   # imágenes que falten (gpt-image-2 + recorte)
npm run audio:synth                 # música y efectos propios
npm run voice -- ep001 ep002        # voz + tiempos (caché); --estimate = sin audio
npm run render -- ep001             # un episodio
npm run render:all                  # los dos pilotos
npm run master -- ep001             # loudnorm (render ya lo hace)
npm run verify -- ep001 ep002       # ffprobe + audio + transcripción → promueve a FINAL
npm run stills -- ep001 0 2.5 9.9 22   # PNG de control en renders/frames/
npm run briefs -- ep001 ep002
npm run metrics
```

## 15. Qué NO se hizo / pendientes / honestidad

- **Nadie escuchó las pistas**: la voz se verificó técnicamente (transcripción de la mezcla final, pausa, picos, loudness), pero falta la escucha humana de Mateo antes de publicar (tono, acento rioplatense, ritmo).
- No se usó el método de Mapadoja (sin acceso). No se probó el proyecto en la Mac de Mateo; Remotion descarga su propio Chromium o se fija `BROWSER_EXECUTABLE`.
- `--estimate` (modo sin voz) y la regeneración de recursos con `npm run assets` tras mover las rutas a `public/art` y los crudos a `art-raw/` (ignorada por git) **no se volvieron a ejecutar** después del refactor; el chequeo de tipos pasa.
- `@lupaylinterna` y la declaración de contenido sintético de YouTube no se pueden comprobar desde aquí; las fuentes citadas y los ítems «por verificar» de la cola siguen pendientes.
- Pose scale `k` sin ajustar; `c_point` sin usar; el Short 002 tiene ≈ 7,7 s finales sin narración (guion original terminaba en «Mirá cómo se mueve»).
- Se desvió ligeramente de los tiempos del montaje para respetar la pausa real de 2 s: la revelación del pulpo cae en 9,1 s (el pedido decía 8–16 s).
- Git: un commit en la rama indicada, ya subido; el commit incluye los MP4 (~29 MB), los wav de voz y música (~35 MB `public/`). No se creó PR.
