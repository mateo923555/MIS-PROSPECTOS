// Renderiza un video de Doña Marga: node render.cjs v01 [--preview t1,t2,...]
// Requiere playwright y ffmpeg. Lee build/<id>/timeline.json y voz.wav.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync, spawn } = require('child_process');
(async () => {
  const id = process.argv[2] || 'v01';
  const prevIdx = process.argv.indexOf('--preview');
  const dir = path.join(__dirname, 'build', id);
  const tl = JSON.parse(fs.readFileSync(path.join(dir, 'timeline.json'), 'utf8'));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'estudio.html'));
  await p.evaluate(async (tl) => { await document.fonts.ready; window.load(tl); }, tl);
  if (prevIdx > 0) {
    for (const t of process.argv[prevIdx + 1].split(',').map(Number)) {
      await p.evaluate((t) => window.render(t), t);
      await p.screenshot({ path: path.join(dir, `preview-${t}.png`) });
    }
    await b.close(); return;
  }
  const n = Math.ceil(tl.duracion * tl.fps);
  const out = path.join(dir, `${id}-dona-marga.mp4`);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(tl.fps), '-i', '-',
    '-i', path.join(dir, 'voz.wav'), '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < n; f++) {
    await p.evaluate((t) => window.render(t), f / tl.fps);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`   frame ${f}/${n}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  await b.close(); console.log('   ' + out);
})();
