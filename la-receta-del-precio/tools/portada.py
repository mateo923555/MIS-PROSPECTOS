"""Genera plantilla-portada.html: editor de portadas TikTok (1080×1920).

Uso: python3 la-receta-del-precio/tools/portada.py
Incrusta las fuentes de marca en base64 para que la exportación PNG
(canvas) sea idéntica en cualquier compu, sin depender de internet.
"""
import base64
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def b64(name):
    return base64.b64encode(open(os.path.join(ROOT, "fonts", name), "rb").read()).decode()


sym = open(os.path.join(ROOT, "logos/final/lrdp-simbolo-color.svg")).read()
D_BODY, D_SLICE = [d for d in re.findall(r' d="([^"]+)"', sym)]

HTML = r"""<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portadas TikTok</title>
<style>
@font-face{font-family:'LRDP Titular';src:url(data:font/ttf;base64,__COND__) format('truetype');font-weight:800}
@font-face{font-family:'LRDP Acento';src:url(data:font/ttf;base64,__FRAUN__) format('truetype');font-style:italic;font-weight:600}
@font-face{font-family:'LRDP Numeros';src:url(data:font/ttf;base64,__MONO__) format('truetype');font-weight:700}
@font-face{font-family:'LRDP Texto';src:url(data:font/ttf;base64,__MED__) format('truetype');font-weight:500}
:root{--cacao:#24140F;--harina:#F4EADB;--margen:#FF5A1F;--lima:#C8F03C;--gris:#8C7F74;--linea:#E2D5C2}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--harina);color:var(--cacao);font:500 15px/1.4 'LRDP Texto',system-ui,sans-serif}
.app{display:grid;grid-template-columns:400px 1fr;min-height:100vh}
aside{background:#fff;border-right:1px solid var(--linea);padding:28px 24px 40px;display:flex;flex-direction:column;gap:18px}
h1{font:800 40px/.92 'LRDP Titular';letter-spacing:-.01em}
h1 em{font:italic 600 40px 'LRDP Acento';color:var(--margen)}
.kicker{font:700 11px 'LRDP Numeros';letter-spacing:.14em;text-transform:uppercase;color:var(--gris)}
label{display:grid;gap:6px;font-size:13px;font-weight:500}
label small{color:var(--gris);font-size:12px}
input[type=text],textarea{width:100%;font:500 16px 'LRDP Texto';color:var(--cacao);background:var(--harina);border:2px solid transparent;border-radius:8px;padding:10px 12px;outline:none}
input[type=text]:focus,textarea:focus{border-color:var(--cacao)}
textarea{resize:vertical;min-height:120px;font:800 22px/1.05 'LRDP Titular'}
.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.seg{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.seg button{border:2px solid var(--cacao);border-radius:8px;padding:9px 4px;font:700 11px 'LRDP Numeros';cursor:pointer;background:#fff;color:var(--cacao)}
.seg button[aria-pressed=true]{background:var(--cacao);color:var(--harina)}
.seg .sw{display:block;height:10px;border-radius:3px;margin-bottom:6px}
.check{display:flex;gap:10px;align-items:center;font-size:14px;cursor:pointer}
.check input{width:18px;height:18px;accent-color:var(--margen)}
.btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:6px}
.btn{border:0;border-radius:99px;padding:14px;font:700 13px 'LRDP Numeros';cursor:pointer;background:var(--margen);color:var(--cacao)}
.btn.sec{background:var(--harina);border:2px solid var(--cacao)}
.file{font-size:13px}
.tips{font-size:13px;color:var(--gris);border-top:1px solid var(--linea);padding-top:16px;display:grid;gap:6px}
.tips b{color:var(--cacao)}
main{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px 20px}
.views{display:flex;gap:28px;align-items:flex-end;flex-wrap:wrap;justify-content:center}
.stage{position:relative;height:min(82vh,860px);aspect-ratio:9/16;border-radius:26px;overflow:hidden;box-shadow:0 30px 60px -20px rgba(36,20,15,.45)}
.stage canvas{width:100%;height:100%;display:block}
.ov{position:absolute;inset:0;pointer-events:none}
.grid-ov{display:none}
.grid-ov::before,.grid-ov::after{content:'';position:absolute;left:0;right:0;height:12.5%;background:rgba(255,255,255,.55);border-color:#FF5A1F;border-style:dashed;border-width:0}
.grid-ov::before{top:0;border-bottom-width:3px}.grid-ov::after{bottom:0;border-top-width:3px}
.grid-ov span{position:absolute;left:10px;top:8.5%;font:700 11px 'LRDP Numeros';background:#FF5A1F;color:#24140F;padding:3px 7px;border-radius:3px}
.show-grid .grid-ov{display:block}
.ui-ov{display:none;color:#fff;font-family:system-ui,sans-serif}
.show-ui .ui-ov{display:block}
.ui-ov .rail{position:absolute;right:3.5%;bottom:22%;display:grid;gap:5.5cqh;justify-items:center}
.stage{container-type:size}
.ui-ov .ic{width:9cqh;height:9cqh;max-width:46px;max-height:46px;border-radius:50%;background:rgba(255,255,255,.88)}
.ui-ov .cap{position:absolute;left:4%;right:24%;bottom:7%;font-size:2cqh;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.ui-ov .cap b{display:block;font-size:2.2cqh;margin-bottom:.5cqh}
.ui-ov .tabs{position:absolute;top:4%;left:0;right:0;text-align:center;font-weight:600;font-size:2.1cqh;text-shadow:0 1px 2px rgba(0,0,0,.6)}
.thumbwrap{display:grid;gap:8px;justify-items:center}
.thumb{width:150px;aspect-ratio:3/4;border-radius:6px;overflow:hidden;position:relative;box-shadow:0 10px 24px -10px rgba(36,20,15,.5)}
.thumb canvas{position:absolute;left:0;top:-16.6667%;width:100%;height:133.3333%}
.thumbs{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:230px}
.thumbs .thumb{width:auto;border-radius:0;box-shadow:none}
.mini{display:grid;gap:8px;justify-items:center}
@media (max-width:900px){.app{grid-template-columns:1fr}aside{border-right:0;border-bottom:1px solid var(--linea);padding:20px 16px 28px}main{padding:24px 16px}.stage{height:auto;width:min(100%,380px)}}
</style></head>
<body>
<div class="app">
<aside>
  <div>
    <div class="kicker">La Receta del Precio · plantilla</div>
    <h1 style="margin-top:8px">Portada <em>de</em> video</h1>
  </div>

  <label>Título <small>Un renglón por línea. Encerrá entre *asteriscos* lo que va en naranja.</small>
    <textarea id="titulo" rows="4"></textarea></label>
  <label>Bajada <small>Opcional. Va en itálica, máx. 1 línea.</small>
    <input type="text" id="bajada"></label>
  <div class="row">
    <label>Etiqueta <input type="text" id="etiqueta"></label>
    <label>Episodio <input type="text" id="episodio"></label>
  </div>
  <div class="row">
    <label>Dato · rótulo <input type="text" id="datoLabel"></label>
    <label>Dato · número <input type="text" id="dato"></label>
  </div>

  <div>
    <div class="kicker" style="margin-bottom:8px">Fondo</div>
    <div class="seg" id="variantes">
      <button data-v="cacao"><span class="sw" style="background:#24140F"></span>CACAO</button>
      <button data-v="harina"><span class="sw" style="background:#F4EADB;outline:1px solid #ccc"></span>HARINA</button>
      <button data-v="margen"><span class="sw" style="background:#FF5A1F"></span>MARGEN</button>
      <button data-v="foto"><span class="sw" style="background:linear-gradient(90deg,#7a4a2c,#24140F)"></span>FOTO</button>
    </div>
  </div>
  <label class="file" id="fotoBox">Foto de fondo <small>Se cubre con un velo cacao para que el texto siempre se lea.</small>
    <input type="file" id="foto" accept="image/*">
    <input type="range" id="fotoY" min="0" max="100" value="50" aria-label="Encuadre vertical de la foto"></label>

  <label class="check"><input type="checkbox" id="porcion" checked> Porción gigante (firma de la marca)</label>
  <label class="check"><input type="checkbox" id="verGrilla"> Ver recorte del perfil (3:4)</label>
  <label class="check"><input type="checkbox" id="verUI"> Ver interfaz de TikTok encima</label>

  <div class="btns">
    <button class="btn" id="exportar">Descargar PNG</button>
    <button class="btn sec" id="reset">Restaurar ejemplo</button>
  </div>

  <div class="tips">
    <div><b>Tamaño:</b> 1080 × 1920 px. En TikTok: Editar portada → Subir desde galería.</div>
    <div><b>Zona segura:</b> todo lo importante vive dentro del recorte 3:4 del perfil (línea naranja punteada).</div>
    <div><b>Regla:</b> una pregunta o un número por portada. Máximo 4 líneas de título.</div>
  </div>
</aside>

<main>
  <div class="views">
    <div class="stage" id="stage">
      <canvas id="cv" width="1080" height="1920" aria-label="Vista previa de la portada"></canvas>
      <div class="ov grid-ov"><span>VISIBLE EN EL PERFIL</span></div>
      <div class="ov ui-ov">
        <div class="tabs">Siguiendo &nbsp;·&nbsp; Para ti</div>
        <div class="rail"><div class="ic"></div><div class="ic"></div><div class="ic"></div><div class="ic"></div></div>
        <div class="cap"><b>@larecetadelprecio</b>Así se calcula el precio real de una torta 🧮</div>
      </div>
    </div>
    <div class="mini">
      <div class="kicker">Así se ve en tu perfil</div>
      <div class="thumbs" id="thumbs"></div>
    </div>
  </div>
</main>
</div>

<script>
(() => {
const C = {cacao:'#24140F', harina:'#F4EADB', margen:'#FF5A1F', lima:'#C8F03C'};
const BODY = new Path2D('__BODY__');
const SLICE = new Path2D('__SLICE__');
const W = 1080, H = 1920, CROP_T = 240, CROP_B = 1680, M = 96;

const EJEMPLO = {
  titulo: '¿Cuánto cobrás\nuna torta de\n*20 porciones?*',
  bajada: '(spoiler: más de lo que pensás)',
  etiqueta: 'TORTAS', episodio: '07',
  datoLabel: 'COSTO REAL', dato: '$ 11.250',
  variante: 'cacao', porcion: true
};
const KEY = 'lrdp-portada-v1';
let S = {...EJEMPLO};
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) S = {...S, ...s}; } catch (e) {}
let foto = null;

const $ = id => document.getElementById(id);
const cv = $('cv'), ctx = cv.getContext('2d');
const fields = ['titulo','bajada','etiqueta','episodio','datoLabel','dato'];

function pal(v){
  if (v === 'harina') return {bg:C.harina, fg:C.cacao, acc:C.margen, tagBg:C.cacao, tagFg:C.harina, sym:C.cacao, symAcc:C.margen, slice:C.margen, chipBg:C.cacao, chipFg:C.harina, chipNum:C.margen};
  if (v === 'margen') return {bg:C.margen, fg:C.cacao, acc:C.harina, tagBg:C.cacao, tagFg:C.margen, sym:C.cacao, symAcc:C.harina, slice:C.cacao, chipBg:C.cacao, chipFg:C.harina, chipNum:C.margen};
  return {bg:C.cacao, fg:C.harina, acc:C.margen, tagBg:C.margen, tagFg:C.cacao, sym:C.harina, symAcc:C.margen, slice:C.margen, chipBg:C.harina, chipFg:C.cacao, chipNum:C.cacao};
}

// "texto *resaltado* texto" -> [{t, hi}]
function parse(line){
  const out = []; let hi = false;
  line.split('*').forEach((t, i) => { if (i) hi = !hi; if (t) out.push({t, hi}); });
  return out;
}
function lineWidth(segs){ return segs.reduce((w, s) => w + ctx.measureText(s.t).width, 0); }

function roundRect(x, y, w, h, r){ ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

function drawSymbol(x, y, h, ink, acc){
  // geometría local: alto 608 (y -248..360), centro óptico (0,56)
  const s = h / 608;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(0, -56);
  ctx.lineJoin = 'round'; ctx.lineWidth = 10;
  ctx.fillStyle = ctx.strokeStyle = ink; ctx.fill(BODY); ctx.stroke(BODY);
  ctx.fillStyle = ctx.strokeStyle = acc; ctx.fill(SLICE); ctx.stroke(SLICE);
  ctx.restore();
}

function draw(target = ctx){
  const c = target, p = pal(S.variante);
  c.save();
  c.fillStyle = p.bg; c.fillRect(0, 0, W, H);

  if (S.variante === 'foto' && foto){
    const r = Math.max(W / foto.width, H / foto.height);
    const fw = foto.width * r, fh = foto.height * r;
    const oy = (H - fh) * ((+$('fotoY').value) / 100);
    c.drawImage(foto, (W - fw) / 2, oy, fw, fh);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(36,20,15,.55)'); g.addColorStop(.35, 'rgba(36,20,15,.72)'); g.addColorStop(1, 'rgba(36,20,15,.94)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
  } else if (S.variante === 'foto') {
    c.fillStyle = '#3a241a'; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(244,234,219,.35)'; c.font = "700 30px 'LRDP Numeros'"; c.textAlign = 'center';
    c.fillText('↑ SUBÍ UNA FOTO', W / 2, 200); c.textAlign = 'left';
  }

  // firma: porción gigante dentro del recorte 3:4
  if (S.porcion){
    // porción entera (no cortada): el vértice apunta al título, el arco abajo a la derecha
    c.save(); c.translate(680, 1250); c.rotate(105 * Math.PI / 180); c.scale(1.9, 1.9);
    c.translate(-28, 48.5);
    c.fillStyle = p.slice; c.globalAlpha = S.variante === 'foto' ? .95 : 1; c.fill(SLICE);
    c.restore();
  }

  // fila superior: etiqueta + episodio · símbolo
  let y = CROP_T + 96;
  const tag = [S.episodio && ('EP. ' + S.episodio), S.etiqueta].filter(Boolean).join('  ·  ').toUpperCase();
  if (tag){
    c.font = "700 36px 'LRDP Numeros'";
    const tw = c.measureText(tag).width;
    c.fillStyle = p.tagBg; c.beginPath(); c.roundRect(M, y - 50, tw + 44, 68, 6); c.fill();
    c.fillStyle = p.tagFg; c.fillText(tag, M + 22, y - 2);
  }
  const symInk = S.variante === 'foto' ? C.harina : p.sym;
  drawSymbol(W - M - 60, y - 22, 128, symInk, p.symAcc);

  // título: ajusta el tamaño al ancho y alto disponibles
  const lines = (S.titulo || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 5).map(parse);
  const maxW = W - 2 * M, maxH = 640;
  let size = 190;
  const fit = () => {
    c.font = `800 ${size}px 'LRDP Titular'`;
    return Math.max(...lines.map(l => l.reduce((w, s) => w + c.measureText(s.t).width, 0)), 0);
  };
  while (size > 70 && (fit() > maxW || lines.length * size * .92 > maxH)) size -= 4;
  y = CROP_T + 200 + size * .78;
  c.textBaseline = 'alphabetic';
  for (const l of lines){
    let x = M;
    for (const s of l){
      c.fillStyle = s.hi ? p.acc : p.fg;
      c.font = `800 ${size}px 'LRDP Titular'`;
      c.fillText(s.t, x, y);
      x += c.measureText(s.t).width;
    }
    y += size * .92;
  }

  // bajada
  if (S.bajada){
    y += 20;
    let bs = 60; c.font = `italic 600 ${bs}px 'LRDP Acento'`;
    while (c.measureText(S.bajada).width > maxW && bs > 34){ bs -= 2; c.font = `italic 600 ${bs}px 'LRDP Acento'`; }
    c.fillStyle = p.fg; c.globalAlpha = .9; c.fillText(S.bajada, M, y); c.globalAlpha = 1;
  }

  // dato (chip) anclado al borde inferior del recorte 3:4
  if (S.dato){
    const by = CROP_B - 96;
    c.font = "700 92px 'LRDP Numeros'";
    const nw = c.measureText(S.dato).width;
    c.font = "700 28px 'LRDP Numeros'";
    const lab = (S.datoLabel || '').toUpperCase();
    const lw = lab ? c.measureText(lab).width : 0;
    const cw = Math.max(nw, lw) + 64;
    c.fillStyle = p.chipBg; c.beginPath(); c.roundRect(M, by - 168, cw, 196, 14); c.fill();
    if (lab){ c.fillStyle = p.chipFg; c.globalAlpha = .7; c.fillText(lab, M + 32, by - 110); c.globalAlpha = 1; }
    c.fillStyle = p.chipNum; c.font = "700 92px 'LRDP Numeros'"; c.fillText(S.dato, M + 30, by - 8);
  }

  // usuario, fuera del recorte (solo se ve a pantalla completa)
  c.font = "700 30px 'LRDP Numeros'"; c.fillStyle = S.variante === 'foto' ? C.harina : p.fg; c.globalAlpha = .55;
  c.textAlign = 'center'; c.fillText('@larecetadelprecio', W / 2, CROP_B + 120); c.textAlign = 'left'; c.globalAlpha = 1;
  c.restore();
  thumbs();
}

// vista del perfil: la portada actual en una fila de la grilla
const thumbCanvases = [];
function thumbs(){
  const box = $('thumbs');
  if (!thumbCanvases.length){
    for (let i = 0; i < 3; i++){
      const d = document.createElement('div'); d.className = 'thumb';
      const t = document.createElement('canvas'); t.width = 270; t.height = 480;
      if (i) d.style.opacity = .3;
      d.appendChild(t); box.appendChild(d); thumbCanvases.push(t);
    }
  }
  thumbCanvases.forEach(t => { const tc = t.getContext('2d'); tc.drawImage(cv, 0, 0, 270, 480); });
}

function sync(){
  fields.forEach(f => { if ($(f).value !== S[f]) $(f).value = S[f] || ''; });
  document.querySelectorAll('#variantes button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === S.variante));
  $('porcion').checked = !!S.porcion;
  $('fotoBox').style.display = S.variante === 'foto' ? '' : 'none';
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
function update(){ sync(); draw(); save(); }

fields.forEach(f => $(f).addEventListener('input', e => { S[f] = e.target.value; draw(); save(); }));
document.querySelectorAll('#variantes button').forEach(b => b.addEventListener('click', () => { S.variante = b.dataset.v; update(); }));
$('porcion').addEventListener('change', e => { S.porcion = e.target.checked; update(); });
$('verGrilla').addEventListener('change', e => $('stage').classList.toggle('show-grid', e.target.checked));
$('verUI').addEventListener('change', e => $('stage').classList.toggle('show-ui', e.target.checked));
$('fotoY').addEventListener('input', () => draw());
$('foto').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image(); img.onload = () => { foto = img; S.variante = 'foto'; update(); };
  img.src = URL.createObjectURL(f);
});
$('reset').addEventListener('click', () => { S = {...EJEMPLO}; update(); });
$('exportar').addEventListener('click', () => {
  cv.toBlob(b => {
    const a = document.createElement('a');
    const slug = (S.titulo || 'portada').replace(/\*/g,'').toLowerCase().normalize('NFD').replace(/[^\w\s-]/g,'').trim().split(/\s+/).slice(0,5).join('-');
    a.download = `lrdp-ep${(S.episodio||'').replace(/\W/g,'')}-${slug}.png`;
    a.href = URL.createObjectURL(b); a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }, 'image/png');
});

window.LRDP = { set(o){ S = {...S, ...o}; update(); }, ready: null };
window.LRDP.ready = document.fonts.load("800 100px 'LRDP Titular'")
  .then(() => Promise.all([document.fonts.load("italic 600 60px 'LRDP Acento'"), document.fonts.load("700 40px 'LRDP Numeros'")]))
  .then(() => update());
sync(); draw();
})();
</script>
</body></html>
"""

out = (HTML.replace("__COND__", b64("Bric-XB-Cond.ttf"))
       .replace("__FRAUN__", b64("Fraun-It-SB.ttf"))
       .replace("__MONO__", b64("SpaceMono-Bold.ttf"))
       .replace("__MED__", b64("Bric-M.ttf"))
       .replace("__BODY__", D_BODY).replace("__SLICE__", D_SLICE))
open(os.path.join(ROOT, "plantilla-portada.html"), "w").write(out)
print("   plantilla-portada.html", len(out) // 1024, "KB")
