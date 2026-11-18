// Exporta los PNG finales desde los SVG.
// Uso: node la-receta-del-precio/tools/export.cjs   (requiere playwright)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const jobs = [
  // [svg, png, tamaño, fondo transparente?]
  ['logos/final/lrdp-avatar-tiktok.svg', 'export/lrdp-avatar-tiktok-1024.png', 1024, false],
  ['logos/final/lrdp-avatar-tiktok-claro.svg', 'export/lrdp-avatar-tiktok-claro-1024.png', 1024, false],
  ['logos/final/lrdp-simbolo-color.svg', 'export/lrdp-simbolo-color-1024.png', 1024, true],
  ['logos/final/lrdp-simbolo-negativo.svg', 'export/lrdp-simbolo-negativo-1024.png', 1024, false],
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
  fs.mkdirSync(path.join(ROOT, 'export'), { recursive: true });
  for (const [src, out, size, transparent] of jobs) {
    const s = read(src).replace(/width="\d+" height="\d+"/, `width="${size}" height="${size}"`);
    await page.setContent(`<html><body style="margin:0;background:transparent">${s}</body></html>`);
    await page.locator('svg').screenshot({ path: path.join(ROOT, out), omitBackground: transparent });
    console.log('  ', out);
  }
  // Verificación del recorte circular: avatar con máscara + guía de zona segura.
  const av = read('logos/final/lrdp-avatar-tiktok.svg').replace(/width="\d+" height="\d+"/, 'width="1024" height="1024"');
  await page.setContent(`<html><body style="margin:0;background:#fff">
    <div style="position:relative;width:1024px;height:1024px">
      <div style="position:absolute;inset:0;opacity:.25">${av}</div>
      <div style="position:absolute;inset:0;border-radius:50%;overflow:hidden">${av}</div>
      <div style="position:absolute;inset:0;border-radius:50%;border:4px dashed #FF5A1F"></div>
      <div style="position:absolute;left:${512 - 0.72 * 512}px;top:${512 - 0.72 * 512}px;width:${0.72 * 1024}px;height:${0.72 * 1024}px;border-radius:50%;border:3px solid #C8F03C"></div>
      <div style="position:absolute;left:16px;top:16px;font:700 22px monospace;color:#24140F;background:#fff;padding:6px 10px">— recorte TikTok   ○ zona segura 72 %</div>
    </div></body></html>`);
  await page.screenshot({ path: path.join(ROOT, 'export/verificacion-recorte-circular.png') });
  console.log('   export/verificacion-recorte-circular.png');
  await browser.close();
})();
