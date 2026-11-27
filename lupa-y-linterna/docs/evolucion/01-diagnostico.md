# Diagnóstico de los pilotos de Timo y Tere

Revisados sin modificar: **La sombra de Timo (v4)**, **Por qué flota el hielo**, **La pimienta y el jabón**. Los archivos anteriores (v1–v3, pilotos del bebé) siguen intactos.

## Qué funciona
- **Estructura narrativa:** los tres tienen situación → intento → cambio visual → explicación → cierre tierno.
- **Voces:** Timo (`cedar`) y Tere (`marin`) a 1,5× se entienden y se complementan; la transcripción de la mezcla final coincide con el guion en los tres.
- **Experimentos con causa visible:** en la sombra, el desplazamiento de Timo y el cambio de la sombra son simultáneos (correlación medida +0,87 y +0,89). El marco rojo/verde y las etiquetas CERCA/LEJOS ayudan a leer la explicación.
- **Identidad:** las poses reales mantienen collar, chapita y colores en todos los cuadros.

## Qué se ve repetitivo
- **Mismo escenario base:** mesa + dos perros debajo (hielo y pimienta). Los dos Shorts de la mesa se parecen entre sí en encuadre, color y composición.
- **Perros estáticos:** en hielo y pimienta están parados de frente, casi quietos, debajo de la mesa; reaccionan con un cambio de pose, pero no *hacen* nada que cause el fenómeno.
- **Acción sin autor:** la cuchara y los palitos se mueven solos. Un chico puede preguntarse quién los mueve.
- **Tere = maestra:** en hielo y pimienta Tere explica casi todo y Timo reacciona. Falta que Tere pruebe, se equivoque y se sorprenda de verdad.
- **Ritmo de explicación:** la explicación queda como una escena quieta de 3–4 s.

## Defectos que encontré (reales)
1. **Música cortada en la pimienta:** usa `casita.wav` (12 s) en un video de 20,5 s → desde el segundo 12 se queda sin música. Corregido en el código (usa `linterna.wav`, 25 s) y se vuelve a renderizar en este paso.
2. **Efectos más fuertes que la voz:** algunos efectos (el "yip", el "ding") sonaban al nivel de la voz o más fuerte. Ya tienen bajada automática bajo cualquier frase (10 dB por debajo de la voz).
3. **Fuentes no verificadas a fondo en las colas anteriores:** quedaron como "por verificar". En esta etapa se contrastaron con búsquedas filtradas por dominio (ver cola nueva).

## Revisión científica: hielo
- **Flota con una parte afuera:** el cubo flotante se dibuja con ~10 % fuera y ~90 % dentro. Es coherente con la fuente: al congelarse el agua ocupa unos 9 % más de lugar (≈ 9 % menos densa), así que un cubo flota con aproximadamente 90 % sumergido. ([USGS Water Science School](https://www.usgs.gov/water-science-school/science/water-density))
- **Balanza:** comparé un cubo "AGUA" con un cubo "HIELO" del mismo tamaño, con el rótulo MISMO TAMAÑO (volúmenes iguales). Está bien en la idea, pero **mejora**: ambos deben verse como dos recipientes transparentes idénticos (uno con agua, otro con hielo) para que no parezca que el agua es un sólido. 
- **Frase a corregir:** «el hielo es más liviano que el agua» puede entenderse mal (un iceberg pesa más que un vaso de agua). Reemplazar por: **«Un cubito de hielo pesa menos que el mismo tamaño de agua.»**
- **Falta el "por qué":** agregar un cuadro corto: al congelarse, el agua ocupa más lugar (frasquito que se hincha). Sin números ni la palabra "densidad".

## Revisión científica: pimienta
- La explicación actual («El jabón afloja el agua del centro, y el agua de los bordes se lleva la pimienta») va en la dirección correcta pero es vaga. **Versión corregida:** **«El jabón hace que la superficie del agua tire menos en el centro. En los bordes sigue tirando fuerte y arrastra la pimienta.»** Esto corresponde a lo que describen [Fleet Science Center](https://www.fleetscience.org/activities-resources/pepper-and-soap) y [Science Buddies](https://www.sciencebuddies.org/stem-activities/dancing-spices-use-surface-tension-to-make-your-pepper-dance) (el jabón debilita la tensión superficial donde toca; el agua de los bordes, que mantiene su tensión, tira hacia afuera).
- **Nada de "miedo":** el guion actual no dice que la pimienta tenga miedo, y se mantiene así («se escapa» es descriptivo; mejor «se aleja»).
- **Visual:** agregar flechas sobre la superficie que muestren el tirón desde los bordes hacia afuera mientras Tere habla.
- **Seguridad:** perros lejos del plato (ya está), y nota para adultos en la descripción (la pimienta irrita ojos y nariz).
- **Control:** ya incluye el palito limpio (no pasa nada), que es buena ciencia.

## Mejoras concretas con lo que ya tenemos
| Problema | Mejora con poses y herramientas actuales |
|---|---|
| Perros estáticos bajo la mesa | Poses "apoyado en pared / en dos patas" (Timo `accion_der_01`, Tere `accion_der_02`) para que asomen a la mesa; ambos del mismo lado (miran a la derecha). |
| Acción sin autor | **Hielo:** poner el hielo en el **tazón de agua de Tere** en el piso; Timo lo empuja con la pata (pose `accion_izq_03`, pata extendida) y rebota. **Pimienta:** Timo roza sin querer el frasco de jabón con la nariz (pose de olfateo) y cae una gota (gag + causa). |
| Mismo escenario | Alternar: noche en el jardín (Luna), terraza de verano con tazón (hielo), cocina con luz de mañana (pimienta). |
| Tere siempre explica | Que Tere se equivoque primero («seguro se hunde si lo aprieto más») y que Timo descubra la clave. |
| Explicación quieta | Que la explicación ocurra sobre la acción repetida (como en la sombra) y con flechas. |

## Poses que ayudarían (pedirlas a ChatGPT, de a una, fondo magenta)
1. Timo de frente levantando la pata delantera derecha **bien arriba**, saludando.
2. Tere de frente, **sorprendida**, ojos muy abiertos, orejas atentas.
3. Timo y Tere **de espaldas, sentados**, mirando hacia arriba (para cielos y noches).
4. Timo de perfil izquierda y derecha **empujando un objeto con la pata**.
5. Tere de perfil empujando con el **hocico**.
6. Timo y Tere **caminando de frente** (2 fases).
7. Los dos juntos, **frente con frente** (cierre tierno).
8. Tere **riéndose** (ojos entrecerrados, boca abierta).
