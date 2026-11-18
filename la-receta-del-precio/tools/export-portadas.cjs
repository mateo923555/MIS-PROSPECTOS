// Exporta portadas de ejemplo desde plantilla-portada.html (requiere playwright).
// Uso: node la-receta-del-precio/tools/export-portadas.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const EJEMPLOS = [
  ['portada-ej-01-cacao.png', { variante: 'cacao' }],
  ['portada-ej-02-harina.png', { variante: 'harina', titulo: 'El error que\nte hace *perder\nplata* en cada\nalfajor', bajada: 'y cómo arreglarlo en 3 pasos', etiqueta: 'ALFAJORES', episodio: '08', datoLabel: 'TE ESTÁS COMIENDO', dato: '$ 380 c/u' }],
  ['portada-ej-03-margen.png', { variante: 'margen', titulo: 'Tu hora\n*también*\nse cobra', bajada: 'la fórmula que nadie te enseñó', etiqueta: 'COSTOS', episodio: '09', datoLabel: 'VALOR DE TU HORA', dato: '$ 3.500' }],
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.goto('file://' + path.join(ROOT, 'plantilla-portada.html'));
  await p.evaluate(() => window.LRDP.ready);
  fs.mkdirSync(path.join(ROOT, 'export/portadas'), { recursive: true });
  const base = { titulo: '¿Cuánto cobrás\nuna torta de\n*20 porciones?*', bajada: '(spoiler: más de lo que pensás)', etiqueta: 'TORTAS', episodio: '07', datoLabel: 'COSTO REAL', dato: '$ 11.250', porcion: true };
  for (const [name, o] of EJEMPLOS) {
    const data = await p.evaluate((s) => { window.LRDP.set(s); return document.getElementById('cv').toDataURL('image/png'); }, { ...base, ...o });
    fs.writeFileSync(path.join(ROOT, 'export/portadas', name), Buffer.from(data.split(',')[1], 'base64'));
    console.log('   export/portadas/' + name);
  }
  // captura del editor para documentación
  await p.evaluate((s) => window.LRDP.set(s), { ...base, variante: 'cacao' });
  await p.check('#verGrilla');
  await p.screenshot({ path: path.join(ROOT, 'export/portadas/editor.png') });
  await b.close();
})();
