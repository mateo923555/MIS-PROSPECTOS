# Ficha del personaje — el bebé de «Lupa y Linterna»

**Estado:** piloto (sin nombre por ahora; el canal se llama *Lupa y Linterna*). Ficha maestra: `public/art/character/ficha-maestra.png`
(frente · perfil · sorpresa · señalando). Todas las poses se generaron **a partir de esa ficha** (`scripts/assets-manifest.ts`).

## Rasgos que SIEMPRE se repiten

| Rasgo | Regla |
|---|---|
| Material | Bebé ficticio de **plastilina**, huellas dactilares y volumen suave, estilo stop motion. |
| Cabeza | Redonda y grande (≈ 1/3 de la altura total), orejas chicas, mejillas rosadas. |
| Ojos | Grandes, negros y brillantes (cuentas), cejas marrones simples. Sin pupilas con color. |
| **Tres mechones** | Exactamente **tres** rulitos marrones sobre la cabeza (izq · centro · der). Es el rasgo firma: se reconoce hasta en sombra. |
| Ropa | **Jardinero verde petróleo** (pana) con dos botones crema y bolsillo en el pecho; **remera crema** de manga corta. |
| Accesorio | **Linterna amarilla** con lente plateada, siempre asomando del **bolsillo del pecho**. Las manos quedan libres para las poses. |
| Pies | Descalzo, deditos redondos. |
| Proporciones | Cuerpo rechoncho de bebé (≈ 3 cabezas de alto), brazos cortos. |

## Paleta

| Uso | Color | Nota |
|---|---|---|
| Verde petróleo | `#1F5F63` (jardinero; en las poses sale ≈ `#0B4344` con sombras) | color de marca |
| Crema | `#F3E7C9` | remera, textos, botones |
| Amarillo cálido | `#F6C945` | linterna, subtítulo activo, luz |
| Coral (acento) | `#F2705B` | visor, pulpo, guías y temporizador |
| Azules apagados | `#2F5F7E` / `#1B3C57` | escena submarina |
| Piel / pelo | ≈ `#EBB079` / `#6F4B32` | sale de la generación; no se re-tiñe |

## Poses disponibles (recortes PNG con transparencia)

| Archivo | Uso |
|---|---|
| `c_neutral` | de pie, brazos abajo (caminar, esperar) |
| `c_surprised` | sorpresa, manos arriba (silueta muy reconocible → gancho del ep001) |
| `c_wave_a` / `c_wave_b` | saludo en dos cuadros (se alternan a 5 fps) |
| `c_chest` | mano en el pecho («Es mía») |
| `c_point` | señala a la derecha |
| `m_point`, `m_look`, `m_surprised` | con **visor de buceo** coral (ep002); `m_point` se espeja para señalar a la izquierda |

Los factores de escala por pose están en `src/shared/Character.tsx` (`POSES[...].k`).

## Reglas de animación (stop motion)

- El personaje se actualiza **a 10 fps** («a tres cuadros»): pose, posición y vibración cambian cada 3 cuadros (`stepTime` en `src/shared/motion.ts`).
- Caminar = deslizamiento + saltito (≈ 16 px) + inclinación ±3° alternada. En reposo: vibración mínima (≤ 3 px / 1°).
- Un **grano de plastilina** («boiling») se mueve sobre toda la imagen cada 3 cuadros (`src/shared/Grain.tsx`).
- La silueta/sombra se deriva del **mismo sprite** y del mismo movimiento que el bebé (ver ep001).

## Qué evitar

- Cambiar el número de mechones, quitar el bolsillo/linterna o variar el verde del jardinero.
- Rostros sin ojos brillantes o con sonrisa de dientes grandes (mantener sonrisa simple).
- Que el bebé tape el fenómeno: el fenómeno manda en el encuadre; el bebé acompaña.

## Limitaciones conocidas del piloto

- Las poses vienen de un generador de imágenes: pequeñas diferencias de textura/escala entre poses (se corrigen con `k`). Para series largas conviene congelar una **biblia de poses** y regenerar solo lo que falte.
- No hay sincronización labial (la narración no la necesita).
