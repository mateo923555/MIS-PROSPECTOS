# Bucles en Timo y Tere

**Mapadoja:** no tengo acceso a ese proyecto (no aparece entre los repositorios disponibles y no hay código de Mapadoja en este repo), así que **no sé cómo lo implementaron** y no invento detalles. Esta es una implementación propia.

## Principios
1. **La respuesta queda completa antes del bucle.** Nada de esconder la explicación.
2. **Último plano compatible con el primero.** Mismo encuadre, misma posición de cámara, mismos personajes y misma luz; solo cambia lo que cuenta la historia.
3. **Continuidad científica.** El bucle no puede contradecir lo explicado (en la Luna, todo ocurre en la misma noche, así que la fase es la misma al principio y al final).
4. **Audio sin corte:** música continua de principio a fin (colchón constante), notas que se apagan antes del final, microfundidos de 80 ms en los extremos, voz en silencio al menos 1 s antes del final y no antes de 0,15 s del inicio.
5. **Sin dependencia de comentarios** ni de un "mirá otra vez": el bucle es solo una cortesía visual.
6. **Sin promesas de viralidad.** Es una hipótesis de edición que se mide (ver plan de YouTube Studio).

## Técnicas disponibles
| Técnica | Ejemplo |
|---|---|
| Mismo plano inicial y final | Luna: primer plano de Timo y Tere mirando la Luna / último plano idéntico (solo cambia el subtítulo). |
| Estado que vuelve | Charco: el charco vuelve a llenarse con la lluvia, igual que al inicio. |
| Gesto que cierra y abre | Imán: el clip vuelve al punto de partida, listo para moverse otra vez. |
| Música cíclica | Colchón constante + notas sueltas; el final del archivo coincide en nivel con el inicio. |

## Cómo se prueba
- Comparar numéricamente el último cuadro con el primero (diferencia de píxeles sin la zona de subtítulos).
- Medir el nivel de audio en ±100 ms alrededor de la costura al repetir el archivo.
- Reproducir el MP4 en bucle en el celular y mirar la costura.
