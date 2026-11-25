# Brief — Episodio horizontal 001: «Tres misterios de luz con Lupa y Linterna»

| Campo | Valor |
|---|---|
| ID | h001 |
| Formato | Horizontal 16:9, **1920 × 1080**, 30 fps, MP4 H.264 + AAC |
| Duración objetivo | **4–6 min** (guion pensado para ≈ 5:15) |
| Estado | **BRIEF** (no producido en esta sesión) |
| Cola relacionada | ep001 (sombra), ep005 (lápiz en agua), ep011 (arcoíris) |
| Audiencia | 5–8 años, español latinoamericano; voz narradora cálida con toque rioplatense suave |
| Marcar en YouTube | «Creado para niños» |

## Historia original (hilo conductor)

**Premisa:** una luciérnaga de plastilina, **Chispa**, se quedó sin su luz del otro lado de la colina al atardecer y no encuentra el camino a casa. El bebé de la linterna quiere ayudarla, pero para guiarla necesita entender **cómo viaja la luz**. En el camino aparecen tres misterios; cada respuesta es una pista que usa en el final.

**Por qué se mira hasta el final (motivo propio):** hay un problema con reloj (se hace de noche), un personaje en apuros y una pregunta abierta desde el minuto 0:30: *«¿cómo van a servir tres trucos de luz para llevar a Chispa a casa?»*. El final junta los tres en una sola solución visual.

**Idea que se lleva el chico (una sola):** *la luz va derecha, se dobla al cambiar de medio y la luz blanca está hecha de colores.*

## Estructura

| Tiempo | Bloque | Qué pasa | Recursos |
|---|---|---|---|
| 0:00–0:30 | **Apertura** | Atardecer en el jardín. La linterna del bebé parpadea; en la colina, una lucecita que se apaga (Chispa). Pregunta al espectador: «¿Cómo la ayudamos si no sabemos cómo viaja la luz?» Aparecen tres sobres de plastilina numerados 1-2-3. | bebé (poses base), linterna, música `linterna` |
| 0:30–1:50 | **Misterio 1 — La sombra** | En el cobertizo, la sombra gigante en la pared (versión ampliada del ep001). El bebé descubre que *la luz viaja derecha y no atraviesa al bebé: por eso hay sombra*. Con la sombra hace una **señal** (manos de pájaro) que Chispa ve desde lejos. | sistema de sombra de ep001 (`Ep001Sombra`), fondo `bg_room` |
| 1:50–2:10 | **Transición 1** | La luz de la linterna «corre» por el piso hasta una laguna; un pez salta y la imagen se deforma como ondas. | wipe de agua, SFX `whoosh`/`bubbles` |
| 2:10–3:30 | **Misterio 2 — El lápiz que se dobla** | En la laguna, la ramita de Chispa parece partida en el agua. Vaso con lápiz coral: de frente y de costado con la lupa; la luz **se dobla** al pasar de agua a aire. El bebé aprende a apuntar *donde la luz realmente va* y logra pasar la linterna por el agua hasta la piedra brillante. | vaso, lápiz, laguna (nuevo), poses con lupa (nuevo) |
| 3:30–3:50 | **Transición 2** | Gotas de la laguna salpican al sol bajo; la imagen se vuelve brillante y cálida. | wipe de gotas, SFX `sparkle` |
| 3:50–4:50 | **Misterio 3 — El arcoíris** | Con la regadera del jardín, el bebé (de espaldas al sol) hace llover fino y aparece el arco de colores. La luz del sol *parece blanca pero lleva todos los colores*; las gotas los separan. | regadera, arcoíris (nuevo), mismo sistema de subtítulos |
| 4:50–5:15 | **Resolución** | Con las tres pistas: (1) hace señal con la sombra, (2) apunta bien la luz a través del agua de la laguna, (3) hace un arcoíris de gotas que une la colina con la casa. Chispa vuelve siguiendo el arco y su lucecita se prende. | todo lo anterior |
| 5:15–5:30 | **Cierre** | Recapitulación en tres imágenes (sombra, lápiz, arcoíris) + «Mañana, otro misterio». | tarjeta final (sin depender de comentarios) |

## Transiciones y ritmo

- Cada misterio abre con el **sobre** (corte seco al interior) y cierra con **una frase-resumen** de 1 línea en pantalla.
- Máx. 3–4 planos legibles por escena; el fenómeno ocupa el encuadre y el bebé acompaña.
- Cada misterio incluye un **mini-juego**: pausa de 2 s antes de mostrar la respuesta (formato B embebido) para sostener la atención.
- En horizontal los subtítulos van abajo, tamaño grande, 1–2 líneas.

## Recursos a reutilizar

- Protagonista y poses: `public/art/character/*` (ficha en `docs/personaje.md`), más poses nuevas con lupa.
- Composiciones y utilidades: `src/shared/` (Character, Subtitles, Sound, Grain, motion).
- Escena de la sombra: lógica de `Ep001Sombra.tsx` (geometría D, s = D/d).
- Música y efectos propios (`scripts/synth-audio.py`); sumar un tema más largo (≈ 5 min) generado por el mismo script.
- Pipeline de voz: `npm run voice -- h001` (un segmento por frase, caché por hash).

**Nuevo por producir:** Chispa (ficha + 3 poses), jardín al atardecer, laguna, vaso/lápiz, regadera + arcoíris, tarjeta final, ≈ 12 fondos/props.

## Fuentes a verificar (antes de escribir el guion final)

1. **Sombra:** ACS «S is for Shadow» (ya usada en ep001): https://www.acs.org/education/whatischemistry/adventures-in-chemistry/science-abc/s-is-for-shadow.html — *verificada para el Short 001*.
2. **Lápiz en el agua (refracción):** fuente educativa **por confirmar** (museo de ciencias / ACS / NASA). Verificar que el diagrama de rayos es correcto y que el lápiz no se dobla de verdad.
3. **Arcoíris:** fuente **por confirmar** (NOAA / NASA / museo). Verificar la posición del sol (a la espalda del observador) y el ángulo del arco; **no** usar niebla densa (el «fogbow» se ve casi blanco): usar rocío/gotas.
4. **Luciérnaga (si se afirma algo de biología):** si el guion dice algo sobre cómo brillan las luciérnagas, verificar con una fuente; si no, no afirmarlo.

## Riesgos y decisiones abiertas

- ¿Voz en 1.ª persona del bebé (como ep001) o narradora? **Propuesta:** narradora en los tramos de explicación, bebé en interjecciones breves.
- Duración: ≈ 5:15 con pausas de juego; si se pasa de 6:00, recortar el misterio 3 a una demostración.
- Seguridad/uso: recordar «con un adulto» al usar linterna, agua y luz solar (no mirar el sol directamente).
