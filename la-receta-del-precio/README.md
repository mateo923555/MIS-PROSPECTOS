# La Receta del Precio — Identidad visual

Marca independiente para TikTok: costos, precios y ganancia para emprendedores de pastelería.

## Abrir primero
- `comparar-conceptos.html`: los 3 conceptos en grande, en el recorte circular (200/110/56/32 px) y en un perfil de TikTok claro y oscuro, más la decisión.
- `guia-visual.html`: mini guía con colores, tipografías, reglas del logo y aplicaciones en video 9:16.

## Conceptos (`logos/concepto-*`)
1. **La Cucharada %**: el signo % armado con una cuchara medidora.
2. **La Tajada** ✅: una P cuyo bucle es una torta vista desde arriba (un gráfico de torta) a la que le falta una porción: tu ganancia.
3. **Tiqui**: una mascota con forma de huevo que además es una etiqueta de precio.

## Final (`logos/final`, `export`)
| Archivo | Uso |
|---|---|
| `export/lrdp-avatar-tiktok-1024.png` | **Foto de perfil** (1024×1024, fondo cacao) |
| `export/lrdp-avatar-tiktok-claro-1024.png` | Alternativa sobre harina |
| `export/lrdp-simbolo-color-1024.png` | Símbolo con fondo transparente |
| `export/verificacion-recorte-circular.png` | Comprobación del recorte y la zona segura |
| `logos/final/*.svg` | Símbolo (color, negativo, mono), lockups horizontal/vertical, wordmark |

El texto de los SVG está convertido a contornos, así que no hace falta tener las fuentes instaladas. Cada parte tiene su `id` (`torta-p`, `porcion-ganancia`…), así que se puede editar en Figma o Illustrator.

## Paleta
Cacao `#24140F` · Harina `#F4EADB` · Margen `#FF5A1F` · Lima `#C8F03C` (solo en video)

## Tipografías (Google Fonts, OFL)
Bricolage Grotesque 800 condensada (titulares) · Fraunces Italic 600 (acento) · Space Mono 700 (números).
Los TTF exactos están en `fonts/`.

## Regenerar
```bash
pip install fonttools uharfbuzz
python3 tools/build.py      # SVG
python3 tools/pages.py      # HTML
node tools/export.cjs       # PNG (requiere playwright)
```
