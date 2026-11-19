// Exporta las 35 portadas (1080×1920) desde plantilla-portada.html usando videos/guiones.json
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'videos/guiones.json'), 'utf8'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  await p.goto('file://' + path.join(ROOT, 'plantilla-portada.html')); await p.evaluate(() => window.LRDP.ready);
  const out = path.join(ROOT, 'export/portadas/todas'); fs.mkdirSync(out, { recursive: true });
  for (const g of data.guiones) {
    const st = { ...g.portada_state, bajada: '' };
    const url = await p.evaluate((s) => { window.LRDP.set(s); return document.getElementById('cv').toDataURL('image/png'); }, st);
    fs.writeFileSync(path.join(out, `${g.id.toLowerCase()}-portada.png`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close(); console.log('   ' + data.guiones.length + ' portadas');
})();
