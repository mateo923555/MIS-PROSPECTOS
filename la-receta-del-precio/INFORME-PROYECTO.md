# Informe del proyecto: La Receta del Precio (TikTok)

## Qué es
"La Receta del Precio" es una marca independiente para TikTok. Enseña a emprendedoras de pastelería a calcular costos, ponerle precio a sus tortas y ganar más. El objetivo de la cuenta es vender el pack digital (ebook + cuaderno de 11 hojas + 2 bonos). El checkout es en Impulsienda y se paga con Mercado Pago. Usuario de TikTok: @larecetadelprecio.

## El producto que se vende (pack)
- **Ebook/guía:** el método completo, del ingrediente al presupuesto.
- **Cuaderno de 11 hojas:** ficha de receta, historial de pedidos, decoración, tiempos, costo por pieza, relleno y cobertura, packaging, suma de la torta, gastos del mes, "Mi precio" (3 caminos de ganancia: monto fijo, recargo o margen, más el costo de cobro) y presupuesto.
- **Bono 1, "Tu presupuesto, bien dicho":** cómo explicar el precio, responder "está caro", pedidos de descuento (se ofrece otra versión, no se rebaja el mismo pedido) y cambios. Incluye mensajes para copiar.
- **Bono 2, "Tu catálogo de tortas":** fotos con el celular, fichas por torta y una plantilla editable de catálogo.
- **Tono del producto:** no promete ventas, aclara que los ejemplos son inventados y deja que cada pastelera defina su seña y sus condiciones. Los videos respetan ese tono: las cifras se marcan como "ejemplo" y no se inventa urgencia.

## Identidad visual
- **Logo "La Tajada":** una P cuyo bucle es una torta vista desde arriba (que también es un gráfico de torta), a la que le falta una porción naranja: la ganancia.
- **Paleta:** Cacao #24140F, Harina #F4EADB, Margen (naranja) #FF5A1F y Lima #C8F03C (solo en video, para números positivos).
- **Tipografías (gratuitas, Google Fonts):** Bricolage Grotesque ExtraBold condensada (títulos), Fraunces Italic (acentos) y Space Mono (números).
- **Entregados:** logo en SVG y PNG, foto de perfil de 1024×1024, mini guía visual y plantilla de portadas de 1080×1920.

## Estrategia de contenido
- **Volumen:** 5 videos por día, con un tipo de video fijo en cada horario (horarios de Argentina, a ajustar con TikTok Studio):

  | Hora | Tipo de video | Objetivo |
  |---|---|---|
  | 08:30 | El error que te cuesta plata | Alcance |
  | 12:30 | Calculamos juntas | Guardados |
  | 15:30 | Mito vs. realidad | Comentarios |
  | 19:00 | La clienta me dijo… | Compartidos |
  | 21:30 | La receta completa | Ventas |

- **Estructura de cada video (~28 a 31 segundos):**
  1. Gancho de 2 a 3 segundos.
  2. Promesa de 1 segundo ("Mirá el número del final").
  3. Hasta 3 pasos con números en pantalla.
  4. Remate con el dato que cierra la promesa.
  5. Cierre de venta.
- **Cierre de venta en los 35 videos:** "Está todo en mi ebook… y viene con dos bonos de regalo. Link en mi perfil." En pantalla aparece la tapa del ebook en 3D y los dos bonos entrando por los costados, con el botón "↑ Link en mi perfil".
- **Guiones:** 35 escritos (una semana completa), alineados con las hojas del cuaderno y los bonos. Hay además 30 ganchos extra para la semana 2.
- **Métricas a mirar:** retención a los 3 segundos, porcentaje del video visto completo y visitas al perfil. Los 5 videos que más retienen se rehacen la semana siguiente con otro gancho.

## Los videos: "Doña Marga"
- **Presentadora animada:** Doña Marga (de "margen"). Es una señora de pelo canoso con rodete, un lápiz clavado en el rodete, anteojos redondos y delantal con el logo. Mueve la boca al ritmo de la voz, parpadea y levanta las cejas (en el gancho, con mirada escéptica).
- **Voz:** OpenAI gpt-4o-mini-tts, voz "marin", con acento rioplatense y tono firme y cálido, acelerada a 1,5×.
- **Edición:**
  - cambios de plano: primer plano, plano medio, plano lateral y pantalla de datos con Doña Marga en un círculo;
  - micro-cortes cada 1,7 segundos;
  - subtítulos grandes palabra por palabra (la palabra que se dice en lima, los números en naranja);
  - montos que cuentan desde cero, cuentas que aparecen símbolo por símbolo y círculo de marcador sobre el resultado;
  - lluvia de monedas cuando cae el dato, glitch en el gancho y barra de progreso.
- **Sonido:** golpe grave al inicio, ritmo de fondo constante, tic en cada subtítulo, caja registradora en cada monto, subida de tensión antes del remate y "ding".
- **Formato:** MP4 vertical de 1080×1920, con una versión de 720p para Drive.

## Dónde está todo
- **Google Drive, carpeta "La Receta del Precio – TikTok":**
  - 1 · Videos listos para subir (720p, con nombre de día y hora)
  - 2 · Portadas (35)
  - 3 · Marca (foto de perfil y logos)
  - documento "Textos para publicar" (bio sugerida, pasos y descripción con hashtags de cada video)
- **Repositorio GitHub:** mateo923555/MIS-PROSPECTOS, rama `claude/receta-precio-branding-aonzrl`, carpeta `la-receta-del-precio/`. Ahí están el código que genera los videos, los guiones (`videos/guiones.py`) y los videos en calidad completa (`export/videos/`).

## Pendientes
- Pegar el link de Impulsienda en la bio de TikTok y en el documento de textos.
- Terminar de renderizar y subir los videos que faltan de los 35.
- Opcional: conectar la carpeta TIKTOKS del Escritorio (Claude → Configuración → Claude Code → Remote Control) para guardar todo directo en la compu.
- Semana 2: nuevos guiones a partir de los ganchos extra y de los videos que mejor funcionen.
