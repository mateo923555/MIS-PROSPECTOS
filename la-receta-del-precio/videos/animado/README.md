# Doña Marga · videos animados

Doña Marga es la presentadora animada de La Receta del Precio: una señora de pelo canoso con rodete, un lápiz clavado en el rodete (la que hace las cuentas), anteojos redondos y el delantal con el logo. Habla con voz cálida y mueve la boca al ritmo de la voz.

## Hacer un video nuevo
1. Copiá `v01.json` y escribí el guion. `say` es lo que dice la voz: escribí los números en palabras ("diez mil"). `sub` es el subtítulo. `accion` es lo que aparece en pantalla (`hook`, `ticket`, `precio`, `row`, `total`, `big`, `cta`).
2. Generá la voz: `python3 voz.py v02.json --modelo es_AR-daniela-high.onnx`
3. Renderizá: `node render.cjs v02` (con `--preview 2,10,30` saca cuadros sueltos para revisar).

El video queda en `build/<id>/<id>-dona-marga.mp4` (1080×1920, ~1 minuto de render).

## Voz
Piper, voz "es_AR daniela high" (licencia CC BY-SA 4.0, dataset OpenSLR 61), con el tono apenas más grave para que suene más cálida.
Descargá `es_AR-daniela-high.onnx` y `.onnx.json` de huggingface.co/rhasspy/piper-voices (es/es_AR/daniela/high).
Requiere `pip install piper-tts`, ffmpeg y playwright.
