# Brief base de «Lupa y Linterna» (vigente para TODOS los Shorts)

Versión 2 — incorpora la **dirección narrativa**. Reemplaza cualquier pauta anterior que la contradiga. Los pilotos v1 están archivados en `renders/v1/`.

## Canal
- Audiencia: chicos de 5 a 8 años, español latinoamericano. Bebé ficticio de plastilina (ver `docs/personaje.md`).
- Bio provisoria: «Misterios chiquitos, descubrimientos grandes. Historias y juegos de ciencia para chicos curiosos. ¿Qué pensás que va a pasar?» · Handle a verificar en YouTube Studio: @lupaylinterna.
- Formato técnico: Shorts 9:16, 1080×1920, 30 fps, H.264 + AAC. Se publica a mano; «Creado para niños»; aviso de voz generada con IA.
- Formato **A** «¿Por qué pasa esto?» · Formato **B** «¿Podés descubrirlo?» (dos opciones + **2 s reales** para pensar). Los primeros 14 Shorts comparan A vs. B.

## Regla narrativa (obligatoria)
Referencia: Mapadoja — *algo parece imposible, investigamos y vemos una prueba*. Acá sumamos una **mini historia: un personaje quiere conseguir algo y el dato educativo lo ayuda a resolverlo.**

| Tramo | Qué tiene que pasar |
|---|---|
| 1. **Primer cuadro** | Algo raro que se entienda **sin sonido**. |
| 2. **Antes del segundo 4** | Queda claro **qué quiere descubrir o lograr** el personaje. Alcanza con una pregunta concreta. |
| 3. **En el medio** | Un **intento**, una **pista** o **dos opciones**. En un juego de adivinar: **2 segundos reales** de silencio para pensar (con temporizador visual). |
| 4. **Último tramo** | La **prueba** que completa la historia. El chico tiene que poder **explicar qué pasó con sus propias palabras**. |
| 5. **Cierre** | Termina **enseguida** después del remate. Si queda tiempo sin una acción o idea nueva, **se recorta**. La duración la dicta la historia; se mantiene **20–25 s** cuando el montaje lo sostiene. |

### Las cuatro líneas (se escriben ANTES de animar, en `data/episodes/epXXX.json → narrative`)
1. **¿Qué se ve en el primer cuadro?**
2. **¿Qué quiere lograr el personaje?**
3. **¿Qué aprende el chico?**
4. **¿Qué plano final lo demuestra?**

Y una quinta, para la ficha: **«Qué puede contar un chico después de verlo»** (`contaElChico`): una frase en palabras de chico.

### Checklist narrativo antes de renderizar
- [ ] Las cuatro líneas están escritas y el guion las cumple.
- [ ] El objetivo está dicho (voz) **y** mostrado (imagen) antes del segundo 4.
- [ ] El dato educativo es lo que resuelve el objetivo (no un agregado al final).
- [ ] Si hay juego: ≥ 2,0 s de silencio de voz tras la pregunta, con temporizador visual.
- [ ] El plano final muestra la prueba en el **mismo encuadre** de la demostración (no un resumen aparte).
- [ ] No hay repeticiones ni cola sin acción nueva tras el remate (≤ ~1,2 s).
- [ ] Una cosa en movimiento permite seguir la acción hasta el último cuadro.
- [ ] Verificación científica de la `scienceCheck` (fuente confirmada).

## Reglas de edición y sonido (sin cambios)
- Misterio en pantalla en los primeros 2 s; título/marca ceden espacio; 3–4 planos legibles.
- Subtítulos grandes y cortos, dentro de la zona segura de Shorts, sincronizados con la voz.
- Narración al frente, música baja, un efecto puntual en la revelación; 0,3–0,5 s de margen al final del audio.
- Cada historia se entiende con el sonido apagado; la voz agrega contexto.
- Música/efectos propios (`scripts/synth-audio.py`) o con licencia comprobable.

## Cómo se verifica
- `npm run check` (geometría del ep001) y `npm run verify` (ffprobe, voz en la mezcla final, pausa, **momentos clave** de revelación). Detalle en `README.md`.

## Ejemplos aplicados
- **ep001 v2:** el bebé quiere que su sombra gigante entre en el marco; se acerca (crece), se aleja (se achica) y entra justo.
- **ep002 v2:** el bebé quiere encontrar al pulpo; lo descubre por el brazo y después ve cómo se esconde otra vez, en el mismo encuadre.

---

# Dirección creativa (versión 3) — emoción y personalidad

Objetivo: que cada Short genere **curiosidad, sorpresa y una pequeña emoción**, y que al terminar el chico haya aprendido algo que **pueda contarle a otra persona**. Esta sección se suma a la regla narrativa de arriba; no la reemplaza.

## El bebé tiene personalidad: curioso · expresivo · cariñoso
- **Curioso:** observa antes de actuar (mano en la frente, dedo en el mentón, cabeza ladeada), señala, se acerca.
- **Expresivo:** cada emoción se ve en el cuerpo: asombro (boca redonda + saltito), duda (pose pensativa y balanceo), alegría (brazos arriba + saltitos), orgullo (mano en el pecho).
- **Cariñoso:** celebra con ternura: saluda a lo que descubre, le manda corazoncitos, termina con un gesto tierno.
- **Ritmo de gestos (obligatorio en cada Short):** **observa → hace una prueba → se sorprende → celebra el descubrimiento.** Los gestos y acciones ayudan a entender la historia (no son relleno).
- Poses disponibles (`docs/personaje.md`): neutral, sorprendido, saludo (2 cuadros), mano en el pecho, señala, **pensativo, festejo, ternura**, y con visor: señala, mira, sorprendido, **pensativo, festejo**. Si falta una emoción, se genera una pose nueva a partir de la ficha maestra (`scripts/assets-manifest.ts`).

## Seis definiciones ANTES de producir (`data/episodes/epXXX.json → creative`)
1. **Qué queremos que sienta el chico.**
2. **Qué pregunta o situación despierta su curiosidad.**
3. **Qué intenta hacer el bebé y qué ocurre.**
4. **Cuál es el momento visual sorprendente.**
5. **Qué aprende el chico y cómo se demuestra.**
6. **Cómo termina la historia de manera satisfactoria.**

Además se escribe «emoción y aprendizaje en una línea» (`emocionYAprendizaje`) para la entrega, junto con las cuatro líneas narrativas y `contaElChico`.

## Lenguaje de planos
- **Planos cercanos** cuando ayudan a **sentir** la emoción: asombro inicial, duda/pensamiento, festejo. Duran ≈ 1 s y vuelven al plano abierto.
- **Planos abiertos** cuando hace falta **entender la demostración**: durante la prueba se ve siempre toda la mecánica (p. ej. linterna + bebé + pared; escondite + pulpo). Zoom ≤ 1,2× en esos tramos.
- En un encuadre cerrado sobre la acción, un **círculo de reacción** (primer plano del bebé) mantiene visible su emoción.
- El primer cuadro es siempre un plano general que se entiende sin sonido.

## Checklist de dirección creativa (antes de renderizar)
- [ ] ¿El primer cuadro despierta curiosidad (algo raro, una pregunta en la imagen)?
- [ ] ¿Las reacciones del bebé se entienden sin sonido (observa, prueba, se sorprende, celebra)?
- [ ] ¿Hay al menos un momento visual sorprendente, con acercamiento que ayude a sentirlo?
- [ ] ¿Durante la demostración el plano es abierto y claro?
- [ ] ¿El final deja **una** idea clara y un cierre emocional breve (≤ ~1,2 s tras el remate)?
- [ ] ¿La referencia de forma/posición se mantiene mientras algo cambia (p. ej. contorno del pulpo durante el camuflaje)?
- [ ] Seis definiciones + cuatro líneas + `contaElChico` + `emocionYAprendizaje` escritos.

## Aplicado en los pilotos
- **ep001 «La sombra gigante»:** asombro → duda → prueba → festejo → ternura. Aprende: cerca de la luz, sombra más grande; lejos, más chica.
- **ep002 «El pulpo escondido»:** suspenso → alegría de descubrir → asombro y ternura. Aprende: el pulpo cambia color y textura para parecerse a la roca.

---

# Dirección creativa (versión 4) — canal «Timo y Tere»

Desde esta versión los protagonistas son **Timo (Timoteo)** y **Tere (Teresa)**, los bulldogs reales del canal. El bebé queda como versión archivada (`data/queue-bebe.json`, `renders/`). La regla narrativa (4 líneas, objetivo antes del seg. 4, prueba, cierre rápido) y las 6 definiciones creativas siguen vigentes.

- **Timo** (francés, chiquito, orejas enormes): siente primero, se asusta, se emociona, nota los detalles. Hace las preguntas con el cuerpo.
- **Tere** (inglés, grande, tranquila): prueba con paciencia, empuja, espera, consuela.
- **Dinámica fija:** Timo nota/se asusta → Tere prueba con calma → los dos se sorprenden → celebran con cariño.
- **Sin diálogos ni manos:** todo se cuenta con cuerpo, ojos, orejas, ladridos y objetos movidos con el hocico o la pata.
- **Un momento tierno distinto por Short** (frente con frente, lametón, hombro con hombro, dormirse apoyados…).
- **Poses:** cada episodio de `data/queue.json` lista las poses necesarias (`posesNecesarias`, códigos de los paquetes A–F del prompt de ChatGPT). No espejar a Tere: generar cada dirección como pose propia.
- **Seguridad:** nada de perros comiendo objetos peligrosos ni con la cabeza afuera del auto; notas para adultos en la descripción.

## Voces (preferencia fija de Mateo)
- **Velocidad: 1.5x** para todas las voces (Timo, Tere y narración). Configuración en `data/voz-config.json` (`speed: 1.5`); `scripts/gen-voice.ts` la aplica con ffmpeg `atempo` (conserva el tono) sobre el TTS original (`sX.raw.wav`, que se guarda para no volver a pagar).
- **Voces:** Timo = `cedar`, Tere = `marin`, modelo `gpt-4o-mini-tts` (el más barato). Cada frase lleva su `emotion` en el JSON del episodio.
- **Costo:** unos 1,5 centavos de dólar por minuto de audio; caché por frase; Whisper solo para sincronizar subtítulos.
