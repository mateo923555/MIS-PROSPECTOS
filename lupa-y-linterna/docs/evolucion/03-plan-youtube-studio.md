# Plan simple para comparar los primeros Shorts en YouTube Studio

Objetivo: aprender qué funciona con **pocas publicaciones**, sin sacar conclusiones apuradas ni prometer resultados.

## Antes de publicar
- En cada video: configuración **«Creado para niños»** según corresponda. Con esa opción los comentarios y algunas funciones de personalización quedan limitados; **verificá en tu Studio qué métricas aparecen** y anotalas (no asumo cuáles).
- Descripción con fuente científica y nota para adultos cuando haga falta (pimienta, imanes, globos, tormenta).
- Marcar contenido sintético/voces generadas si la plataforma lo pide.

## Qué medir (Studio → Contenido → Shorts → Analytics)
1. **Vistos vs. deslizados** (si aparece): % que decide mirar.
2. **Porcentaje promedio visto** y **duración promedio de visualización**.
3. **Gráfico de retención:** dónde baja (¿en el gancho? ¿en la explicación?).
4. **Suscriptores ganados** por video.
5. **Origen del tráfico** (Shorts feed vs. otras fuentes).

## Cómo comparar sin engañarse
- **Un cambio por vez:** tipo de gancho, velocidad de voz o cierre con bucle (no varios a la vez).
- **Pares parecidos:** comparar videos de dificultad y duración similares, publicados en horarios comparables.
- **Esperar 48–72 h** y mirar de nuevo a los 7 días (ya está en `data/metrics-timo-y-tere.csv`).
- **Muestras chicas:** con pocas vistas, las diferencias pueden ser azar. Usar la **mediana** de varios videos y decidir con al menos 6 por variante.
- **Cuidado con el bucle:** un bucle puede hacer que el "porcentaje visto" supere el 100 % sin que sea mejor contenido. Mirar también retención y vistos vs. deslizados.

## Tabla sugerida (agregar columnas al CSV)
`id, titulo, tipo_gancho (pregunta/situación/acción), voz_velocidad, bucle (sí/no), duracion_s, fecha_hora, vistas_48h, %visto_48h, vistos_vs_deslizados, suscriptores_7d, notas`

## Primer experimento (propuesto)
- Semana 1: 6 Shorts con **gancho = situación visible + frase** (como la Luna), 3 con bucle y 3 sin bucle.
- Semana 2: repetir con otros temas y comparar medianas.
- Registrar en el CSV; decidir qué mantener recién después de 12 videos.
