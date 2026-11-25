# Teresa y Timoteo — nueva dirección (pruebas animadas)

**Estado:** PRUEBA. El trabajo del bebé (Lupa y Linterna v1–v3) se conserva intacto (`renders/v1`, `v2`, y los MP4 `*_v3_FINAL.mp4`).

## Personajes (según descripción y fotos de Mateo)
- **Teresa:** bulldog inglés blanca; cuerpo robusto; cara con pliegues; **mancha oscura en una oreja** (en las fotos, la de la derecha de cámara); hocico negro con manchas rosadas; orejas caídas.
- **Timoteo:** bulldog francés marroncito (fawn); **orejas grandes y paradas**; hocico oscuro; ojos expresivos; **mancha blanca en el pecho**.
- Personalidades a desarrollar: Teresa = tranquila, curiosa, protectora; Timoteo = inquieto, sensible, se asombra fácil. Se miran, se ayudan y festejan juntos.

## Archivos
- Fichas generadas: `public/art/dogs/teresa-ficha.png`, `timoteo-ficha.png`; vistas recortadas `t_0..3.png`, `m_0..3.png` (espejadas: Teresa mira a la izquierda, Timoteo a la derecha → se miran de frente). Recorte: `scripts/cut-sheet.py`.
- Componentes: `src/shared/Dogs.tsx`, `Room.tsx`; pruebas: `src/pruebas/PruebaLupa.tsx`, `PruebaSombra.tsx`; render: `npm run pruebas` → `renders/pruebas/`.
- Audio nuevo (propio, sintetizado): música `casita.wav`; efectos `yip, woof, sniff, pawstep, heart`.
- Ficha visual: `docs/ficha-teresa-y-timoteo.png`.

## Limitaciones de esta tanda
- Se terminó el crédito de la API de imágenes (OpenAI) y Higgsfield tiene 0 créditos: no se pudieron generar poses nuevas. Se trabajó con las 4 vistas de cada ficha.
- Faltan: ciclo de caminata, parpadeo, orejas/cola independientes, expresiones (triste, enojo suave, risa). Timoteo conserva un antifaz oscuro alrededor de los ojos que no está en las fotos; la mancha de Teresa se corrigió espejando.
- Las fotos llegaron como imágenes en el chat (no como archivos), por eso sirvieron para corregir descripciones pero no como referencia de píxeles.

## Cómo mejorar el movimiento para los Shorts definitivos
1. Regenerar con crédito una **biblia de poses** por perro (≈ 12 poses: caminata A/B, olfatear, cabeza inclinada, sorpresa, alegría, tristeza leve, abrazo/ternura, mirando arriba/abajo) usando las fotos reales como referencia.
2. Separar **cabeza, orejas, cuerpo, cola** en capas (generadas por pose) para animar inclinación de cabeza, orejas que se paran y cola.
3. Para escenas clave, usar **video generativo imagen→video** (p. ej. Kling/Seedance vía Higgsfield, con las fotos reales como referencia) en clips de 3–5 s y componerlos en Remotion con audio y subtítulos propios; hay que revisar consistencia de rasgos cuadro a cuadro.
4. Mantener Remotion para continuidad: fondos, luz y sombra físicas, cámara, textos, audio.
