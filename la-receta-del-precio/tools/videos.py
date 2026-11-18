"""Genera videos/guiones.json y plan-videos.html desde videos/guiones.py.

Uso: python3 la-receta-del-precio/tools/videos.py
"""
import html
import importlib.util
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("guiones", os.path.join(ROOT, "videos", "guiones.py"))
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

HASHTAGS = "#pasteleria #emprendimiento #costos #precios #reposteria #pastelerias #emprendedoras #larecetadelprecio"
DIAS = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

data = []
for i, v in enumerate(g.G, 1):
    f = g.FORMATOS[v["slot"]]
    d = dict(v, id=f"V{i:02d}", formato=f["nombre"], hora=f["hora"],
             caption_full=f'{v["caption"]}\n\n{HASHTAGS}')
    d["guion"] = "\n".join([
        f'[{d["id"]} · Día {v["dia"]} · {f["nombre"]}]',
        f'TEXTO EN PANTALLA (0 s): {v["hook_txt"]}',
        f'HOOK (0–2 s): {v["hook"]}',
        f'PROMESA (2–5 s): {v["promesa"]}',
        *[f'DESARROLLO {n}: {b}' for n, b in enumerate(v["beats"], 1)],
        f'REMATE: {v["payoff"]}',
        f'CIERRE: {v["cta"]}',
    ])
    d["portada_state"] = dict(titulo=v["portada"], bajada="", etiqueta=v["etiqueta"],
                              episodio=f"{i:02d}", datoLabel=(v["dato"] or ("", ""))[0],
                              dato=(v["dato"] or ("", ""))[1],
                              variante=["cacao", "harina", "margen", "cacao", "margen"][v["slot"] - 1],
                              porcion=True)
    data.append(d)

with open(os.path.join(ROOT, "videos", "guiones.json"), "w") as fh:
    json.dump(dict(formatos=g.FORMATOS, guiones=data, hooks_extra=g.HOOKS_EXTRA), fh, ensure_ascii=False, indent=1)

E = html.escape


def card(d):
    beats = "".join(f'<li><span class="t">{E(t)}</span>{E(b)}</li>'
                    for t, b in zip(["5–12 s", "12–20 s", "20–28 s", "28–34 s"], d["beats"]))
    return f"""
<article class="card s{d['slot']}" data-id="{d['id']}" data-dia="{d['dia']}">
  <header>
    <span class="slot mono">{d['hora']} · {E(d['formato'])}</span>
    <span class="vid mono">{d['id']}</span>
  </header>
  <div class="hooktxt cond">{E(d['hook_txt'])}</div>
  <ol class="script">
    <li class="hk"><span class="t">0–2 s · HOOK</span>{E(d['hook'])}</li>
    <li class="pr"><span class="t">2–5 s · PROMESA</span>{E(d['promesa'])}</li>
    {beats}
    <li class="po"><span class="t">REMATE</span>{E(d['payoff'])}</li>
    <li class="ct"><span class="t">CIERRE</span>{E(d['cta'])}</li>
  </ol>
  <div class="cap"><span class="t mono">CAPTION</span>{E(d['caption'])}</div>
  <footer>
    <div class="acts">
      <button class="b" data-copy="guion">Copiar guion</button>
      <button class="b" data-copy="caption">Copiar caption</button>
      <a class="b o" target="_blank" rel="noopener" href="plantilla-portada.html#{E(json.dumps(d['portada_state'], ensure_ascii=False))}">Abrir portada →</a>
    </div>
    <div class="st">
      <label><input type="checkbox" data-k="grabado">Grabado</label>
      <label><input type="checkbox" data-k="editado">Editado</label>
      <label><input type="checkbox" data-k="publicado">Publicado</label>
    </div>
  </footer>
</article>"""


cards = "".join(card(d) for d in data)
formatos = "".join(f"""<div class="fmt s{k}"><div class="mono hr">{f['hora']}</div>
  <h3 class="cond">{E(f['nombre'])}</h3><p>{E(f['desc'])}</p><div class="mono obj">OBJETIVO · {E(f['obj']).upper()}</div></div>"""
                   for k, f in g.FORMATOS.items())
hooks = "".join(f'<li><button class="hb" title="Copiar">{E(h)}</button></li>' for h in g.HOOKS_EXTRA)
tabs = "".join(f'<button data-d="{n}">{DIAS[n][:3]} <span>Día {n}</span></button>' for n in range(1, 8))
js_data = json.dumps({d["id"]: dict(guion=d["guion"], caption=d["caption_full"]) for d in data}, ensure_ascii=False)

PAGE = """<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plan de videos</title>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,600,100,1&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
:root{--cacao:#24140F;--harina:#F4EADB;--margen:#FF5A1F;--lima:#C8F03C;--gris:#8C7F74;--linea:#E2D5C2}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--harina);color:var(--cacao);font:500 15px/1.5 'Bricolage Grotesque',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.cond{font-variation-settings:'wdth' 75;font-weight:800;letter-spacing:-.01em;line-height:.95}
.it{font-family:'Fraunces',serif;font-style:italic;font-weight:600;font-variation-settings:'SOFT' 100,'WONK' 1}
.mono{font-family:'Space Mono',monospace}
.k{font:700 12px 'Space Mono';letter-spacing:.14em;text-transform:uppercase;color:var(--gris)}
section{padding:52px 0;border-bottom:1px solid var(--linea)}
h1{font-size:clamp(46px,8vw,104px)}
h2{font-size:clamp(34px,5vw,56px);margin:10px 0 14px}
.lead{max-width:680px;font-size:18px}
.hero{background:var(--cacao);color:var(--harina);border:0;padding:64px 0 56px}
.hero .k{color:#bfae9c}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:34px}
.kpi{border:1px solid #4a3329;border-radius:10px;padding:16px}
.kpi b{display:block;font:700 34px 'Space Mono';color:var(--margen)}
.kpi span{font-size:14px;color:#d8c9b6}
.tl{display:grid;grid-template-columns:1.2fr 1.4fr 3.6fr 1.5fr 1.3fr;margin-top:26px;border-radius:10px;overflow:hidden;font-size:13px}
.tl div{padding:14px 10px;min-height:150px;border-right:2px solid var(--harina)}
.tl b{display:block;font:700 12px 'Space Mono';margin-bottom:6px}
.tl .t1{background:var(--margen)}.tl .t2{background:#ffb18f}.tl .t3{background:#fff}.tl .t4{background:var(--cacao);color:var(--harina)}.tl .t5{background:var(--lima)}
.rules{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}
.rules div{background:#fff;border:1px solid var(--linea);border-radius:10px;padding:16px;font-size:14px}
.rules b{display:block;font-size:16px;margin-bottom:4px}
.fmts{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.fmt{background:#fff;border-radius:10px;padding:16px;border-top:6px solid var(--c);display:flex;flex-direction:column;gap:8px}
.fmt h3{font-size:24px}.fmt p{font-size:14px;flex:1}.fmt .hr{font-size:22px;font-weight:700}.fmt .obj{font-size:11px;color:var(--gris)}
.s1{--c:#FF5A1F}.s2{--c:#24140F}.s3{--c:#C8F03C}.s4{--c:#ffb18f}.s5{--c:#8C7F74}
.week{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-top:16px;font-size:13px}
.week div{background:#fff;border:1px solid var(--linea);border-radius:10px;padding:12px;min-height:104px}
.week b{display:block;font:700 12px 'Space Mono';margin-bottom:6px}
.week .rec{background:var(--cacao);color:var(--harina);border-color:var(--cacao)}
.tabs{position:sticky;top:0;z-index:5;background:var(--harina);padding:14px 0;display:flex;gap:8px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--linea)}
.tabs button{font:700 13px 'Space Mono';border:2px solid var(--cacao);background:#fff;border-radius:99px;padding:7px 14px;cursor:pointer;color:var(--cacao)}
.tabs button span{font-weight:400;opacity:.6;font-size:11px}
.tabs button[aria-pressed=true]{background:var(--cacao);color:var(--harina)}
.prog{margin-left:auto;font:700 13px 'Space Mono'}
.prog i{display:inline-block;width:120px;height:8px;border-radius:9px;background:#fff;vertical-align:middle;margin-left:8px;overflow:hidden;border:1px solid var(--linea)}
.prog i b{display:block;height:100%;background:var(--margen);width:0}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px;margin-top:20px}
.card{background:#fff;border-radius:12px;border-top:6px solid var(--c);padding:18px;display:flex;flex-direction:column;gap:12px}
.card.done{opacity:.55}
.card header{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--gris)}
.card .vid{color:var(--cacao);font-weight:700}
.hooktxt{font-size:30px;background:var(--cacao);color:var(--harina);padding:14px 16px;border-radius:8px}
.script{list-style:none;display:grid;gap:9px;font-size:14.5px}
.script .t,.cap .t{display:block;font:700 10.5px 'Space Mono';letter-spacing:.08em;color:var(--gris);margin-bottom:1px}
.script .hk{font-weight:700;font-size:15.5px}
.script .pr{background:#fff3ec;border-left:3px solid var(--margen);padding:6px 10px;border-radius:0 6px 6px 0}
.script .po{background:#f3fbd9;border-left:3px solid #9cc31a;padding:6px 10px;border-radius:0 6px 6px 0;font-weight:700}
.cap{font-size:13.5px;color:#5a4a40;border-top:1px dashed var(--linea);padding-top:10px}
.card footer{margin-top:auto;display:grid;gap:10px}
.acts{display:flex;gap:6px;flex-wrap:wrap}
.b{font:700 11.5px 'Space Mono';border:2px solid var(--cacao);background:var(--harina);color:var(--cacao);border-radius:99px;padding:6px 11px;cursor:pointer;text-decoration:none}
.b.o{background:var(--margen);border-color:var(--margen)}
.b.ok{background:var(--lima);border-color:var(--lima)}
.st{display:flex;gap:14px;font-size:13px}
.st label{display:flex;gap:5px;align-items:center;cursor:pointer}
.st input{accent-color:var(--margen);width:16px;height:16px}
.hooks{columns:2;gap:24px;list-style:none;margin-top:16px}
.hooks li{break-inside:avoid;margin-bottom:8px}
.hb{all:unset;cursor:pointer;display:block;background:#fff;border:1px solid var(--linea);border-radius:8px;padding:10px 12px;font-size:14.5px}
.hb:hover{border-color:var(--cacao)}
.hb.ok{background:var(--lima)}
.metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.metrics div{background:#fff;border:1px solid var(--linea);border-radius:10px;padding:16px;font-size:14px}
.metrics b{display:block;font:700 24px 'Space Mono';color:var(--margen)}
.note{background:#fff;border-left:4px solid var(--margen);border-radius:0 10px 10px 0;padding:14px 16px;font-size:14px;margin-top:16px;max-width:820px}
@media (max-width:900px){.wrap{padding:0 16px}.kpis,.rules,.metrics{grid-template-columns:1fr 1fr}.fmts{grid-template-columns:1fr 1fr}.week{grid-template-columns:repeat(2,1fr)}.tl{grid-template-columns:1fr}.tl div{min-height:0;border-right:0;border-bottom:2px solid var(--harina)}.hooks{columns:1}.cards{grid-template-columns:1fr}.prog{margin-left:0;width:100%}}
</style></head><body>

<section class="hero"><div class="wrap">
  <div class="k">La Receta del Precio · TikTok · plan de contenido</div>
  <h1 class="cond">5 videos por día.<br><span class="it" style="color:var(--margen)">Cada uno</span> se mira hasta el final.</h1>
  <p class="lead" style="margin-top:18px">Volumen para que el algoritmo encuentre a las pasteleras correctas, y una estructura fija para que cada video retenga: un hook que duele, una promesa que obliga a quedarse, números en pantalla y un remate que resuelve el problema de verdad. Cuatro videos dan valor y uno vende el ebook.</p>
  <div class="kpis">
    <div class="kpi"><b>35</b><span>guiones listos: la primera semana completa</span></div>
    <div class="kpi"><b>30–45 s</b><span>duración objetivo de cada video</span></div>
    <div class="kpi"><b>4 : 1</b><span>videos de valor por cada video de venta</span></div>
    <div class="kpi"><b>2 × 2,5 h</b><span>de grabación en lote por semana</span></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="k">01 · Anatomía de un video que se ve completo</div>
  <h2 class="cond">El orden no se negocia.</h2>
  <div class="tl">
    <div class="t1"><b>0–2 s</b>HOOK<br>Texto en pantalla + frase que nombra un dolor.</div>
    <div class="t2"><b>2–5 s</b>PROMESA<br>“Al final te muestro…”: el loop abierto.</div>
    <div class="t3"><b>5–34 s · DESARROLLO</b>3–4 golpes. Uno cada 4–6 s, siempre con un número nuevo en pantalla. Cambio de plano o de texto en cada golpe.</div>
    <div class="t4"><b>REMATE</b>La cifra o la respuesta que cierra el loop.</div>
    <div class="t5"><b>CIERRE</b>Seguime o link al ebook. Máx. 4 s.</div>
  </div>
  <div class="rules">
    <div><b>El hook nombra a la pastelera</b>Que se reconozca en el primer segundo: “si cobrás x3…”, “si te dijeron caro…”. Nada de “hola chicas”.</div>
    <div><b>La promesa se cumple al final, no antes</b>La cifra más importante va al final. Si la decís en el segundo 10, se van en el 11.</div>
    <div><b>Un video, un problema</b>Si da para dos, son dos videos. A 5 por día, el contenido sobra: lo que importa es la claridad.</div>
    <div><b>Números siempre en pantalla</b>En Space Mono, sobre tarjeta Harina. Quien mira sin sonido tiene que entender todo.</div>
    <div><b>Sin intro, sin logo al inicio</b>El símbolo vive arriba a la derecha todo el video. La marca se reconoce por el formato, no por una intro.</div>
    <div><b>Los números son ejemplos</b>Antes de grabar, reemplazá los montos por precios actuales de tu zona. Las cuentas están verificadas.</div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="k">02 · Los 5 formatos fijos del día</div>
  <h2 class="cond">Mismo horario, mismo formato, todos los días.</h2>
  <p class="lead">La repetición crea hábito: tu audiencia aprende que a las 12:30 hay cuenta paso a paso. Los horarios son un punto de partida (Argentina). A las dos semanas, mirá en TikTok Studio a qué hora está activa tu audiencia y movelos.</p>
  <div class="fmts" style="margin-top:22px">__FORMATOS__</div>
</div></section>

<section><div class="wrap">
  <div class="k">03 · Producción en lote</div>
  <h2 class="cond">35 videos por semana sin vivir grabando.</h2>
  <div class="week">
    <div class="rec"><b>DOMINGO</b>Elegís los 35 guiones de la semana siguiente y ajustás los precios.</div>
    <div class="rec"><b>LUNES · 2,5 h</b>Grabás días 1 a 4 (20 videos). Misma ropa y misma luz: ~6 min por video.</div>
    <div><b>MARTES</b>Edición con la plantilla de subtítulos y números. Portadas desde este plan.</div>
    <div class="rec"><b>JUEVES · 2,5 h</b>Grabás días 5 a 7 (15 videos) + repeticiones de los que funcionaron.</div>
    <div><b>VIERNES</b>Edición + programación desde TikTok Studio en la compu.</div>
    <div><b>TODOS LOS DÍAS</b>15 min: responder comentarios (con video si la pregunta es buena).</div>
    <div><b>SÁBADO</b>Revisión de métricas: ¿qué hooks retuvieron? Esos se repiten la semana siguiente con otro ángulo.</div>
  </div>
  <p class="note"><b>Toma rápida:</b> grabá cada guion en 3 tomas cortas (hook / desarrollo / remate) en lugar de una larga. Si el hook no sale perfecto, repetís 5 segundos, no 40. Grabá 2 versiones del hook de cada video: así tenés material para probar cuál retiene más.</p>
</div></section>

<section style="border:0;padding-bottom:20px"><div class="wrap">
  <div class="k">04 · Guiones de la semana 1</div>
  <h2 class="cond">35 guiones listos para grabar.</h2>
  <p class="lead">Cada tarjeta tiene el guion con tiempos, el texto del primer segundo, el caption y el botón para abrir la portada ya cargada en la plantilla. Marcá el avance: se guarda en este navegador.</p>
</div></section>
<div class="wrap">
  <div class="tabs" id="tabs"><button data-d="0">Todos</button>__TABS__<div class="prog" id="prog">0/35<i><b></b></i></div></div>
  <div class="cards" id="cards">__CARDS__</div>
</div>

<section><div class="wrap">
  <div class="k">05 · Banco de hooks</div>
  <h2 class="cond">30 hooks más para la semana 2.</h2>
  <p class="lead">Tocá uno para copiarlo. Cada hook se arma con la misma estructura: promesa → 3 golpes con números → remate.</p>
  <ul class="hooks">__HOOKS__</ul>
</div></section>

<section style="border:0"><div class="wrap">
  <div class="k">06 · Qué medir</div>
  <h2 class="cond">Tres números deciden qué repetir.</h2>
  <div class="metrics">
    <div><b>Retención 3 s</b>Si menos de la mitad pasa los 3 segundos, el problema es el hook. Regrabá solo el inicio.</div>
    <div><b>% visto completo</b>Si se van en la mitad, la promesa no es lo bastante fuerte o el desarrollo es lento. Recortá.</div>
    <div><b>Visitas al perfil</b>Es la métrica que lleva a la venta. Los videos que más visitas generan marcan el formato que más hay que repetir.</div>
  </div>
  <p class="note"><b>Regla de la semana:</b> los 5 videos con mejor retención se rehacen la semana siguiente con otro hook y otro ejemplo (otro producto, otro número). No se inventa todo de cero cada semana: lo que funciona se multiplica.</p>
  <p class="note"><b>Link al ebook:</b> TikTok no habilita el link en el perfil en todas las cuentas desde el principio (depende del tipo de cuenta y la cantidad de seguidores). Si todavía no lo tenés, cambiá el cierre de venta por “Escribime <b>PRECIO</b> por mensaje y te paso el ebook”.</p>
</div></section>

<script>
(() => {
const D = __DATA__;
const KEY = 'lrdp-plan-v1';
let st = {}; try { st = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} };
const cards = [...document.querySelectorAll('.card')];
function prog(){
  const n = cards.filter(c => (st[c.dataset.id] || {}).publicado).length;
  const p = document.getElementById('prog'); p.firstChild.nodeValue = n + '/' + cards.length + ' publicados';
  p.querySelector('b').style.width = (100 * n / cards.length) + '%';
}
cards.forEach(c => {
  const id = c.dataset.id, s = st[id] || {};
  c.querySelectorAll('input[data-k]').forEach(i => {
    i.checked = !!s[i.dataset.k];
    i.addEventListener('change', () => { st[id] = {...(st[id] || {}), [i.dataset.k]: i.checked}; c.classList.toggle('done', !!st[id].publicado); save(); prog(); });
  });
  c.classList.toggle('done', !!s.publicado);
  c.querySelectorAll('[data-copy]').forEach(b => b.addEventListener('click', () => copy(D[id][b.dataset.copy], b)));
});
function copy(t, b){
  const done = () => { const o = b.textContent; b.classList.add('ok'); b.textContent = '¡Copiado!'; setTimeout(() => { b.classList.remove('ok'); b.textContent = o; }, 1200); };
  (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(done).catch(() => {
    const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {} ta.remove();
  });
}
document.querySelectorAll('.hb').forEach(b => b.addEventListener('click', () => {
  const t = b.textContent; navigator.clipboard && navigator.clipboard.writeText(t).then(() => { b.classList.add('ok'); setTimeout(() => b.classList.remove('ok'), 900); });
}));
const tabs = [...document.querySelectorAll('#tabs button')];
function show(d){
  tabs.forEach(t => t.setAttribute('aria-pressed', t.dataset.d === String(d)));
  cards.forEach(c => c.style.display = (d == 0 || c.dataset.dia == d) ? '' : 'none');
  try { localStorage.setItem(KEY + '-tab', d); } catch (e) {}
}
tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.d)));
let t0 = '1'; try { t0 = localStorage.getItem(KEY + '-tab') || '1'; } catch (e) {}
show(t0); prog();
})();
</script>
</body></html>"""

out = (PAGE.replace("__FORMATOS__", formatos).replace("__TABS__", tabs).replace("__CARDS__", cards)
       .replace("__HOOKS__", hooks).replace("__DATA__", js_data))
open(os.path.join(ROOT, "plan-videos.html"), "w").write(out)
print("   plan-videos.html ·", len(data), "guiones · videos/guiones.json")
