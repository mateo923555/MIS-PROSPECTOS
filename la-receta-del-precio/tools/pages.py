"""Genera las páginas HTML (comparación + guía) con los SVG embebidos.

Uso: python3 la-receta-del-precio/tools/pages.py   (después de build.py)
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def svg(rel, cls=""):
    s = open(os.path.join(ROOT, "logos", rel)).read().strip()
    s = re.sub(r'width="\d+" height="\d+"', f'class="{cls}" role="img"', s, count=1)
    return s


FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800'
         '&family=Fraunces:ital,opsz,wght,SOFT,WONK@1,9..144,400..800,100,1&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">')

BASE_CSS = """
:root{--cacao:#24140F;--harina:#F4EADB;--margen:#FF5A1F;--lima:#C8F03C;--gris:#8C7F74;--linea:#E2D5C2}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--harina);color:var(--cacao);font-family:'Bricolage Grotesque',system-ui,sans-serif;font-variation-settings:'wdth' 100;line-height:1.45;-webkit-font-smoothing:antialiased}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}
.cond{font-variation-settings:'wdth' 75;font-weight:800;letter-spacing:-.01em}
.it{font-family:'Fraunces',serif;font-style:italic;font-variation-settings:'SOFT' 100,'WONK' 1;font-weight:600}
.mono{font-family:'Space Mono',monospace}
.kicker{font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--gris)}
header.top{padding:56px 0 40px;border-bottom:2px solid var(--cacao)}
header.top h1{font-size:clamp(44px,8vw,96px);line-height:.92;margin:14px 0 18px}
header.top p{max-width:640px;font-size:18px}
section{padding:56px 0;border-bottom:1px solid var(--linea)}
h2{font-size:clamp(32px,5vw,52px);line-height:1}
h3{font-size:22px;line-height:1.15}
svg{display:block;max-width:100%;height:auto}
@media (max-width:720px){.wrap{padding:0 16px}}
"""

# ------------------------------------------------------------------ comparación
CONCEPTS = [
    dict(n="01", name="La Cucharada %", file="concepto-1-cucharada", bg="#FFD028",
         idea="El signo de porcentaje armado con una cuchara medidora. La barra del % es el mango; "
              "los ceros son dos pizcas. Una receta es medida exacta: tu margen también.",
         pros=["Idea ingeniosa que se entiende en 1 segundo", "Muy gráfico en amarillo + negro"],
         contras=["El % es un territorio usado por finanzas y descuentos", "Habla poco de pastelería"],
         score=[4, 5, 4, 3]),
    dict(n="02", name="La Tajada", file="concepto-2-tajada", bg="#F4EADB",
         idea="Una P cuyo bucle es una torta vista desde arriba — que es exactamente un gráfico de torta. "
              "Falta una porción: esa porción es tu ganancia. Monograma + metáfora en una sola forma.",
         pros=["Une receta y rentabilidad en un solo gesto", "Monograma propio: la P es la marca",
               "La porción naranja funciona sola como recurso de video"],
         contras=["Necesita la porción en otro color o separada para leerse"],
         score=[5, 5, 5, 5]),
    dict(n="03", name="Tiqui", file="concepto-3-tiqui", bg="#2B3BFF",
         idea="Un huevo que es una etiqueta de precio: ojal + hilo. Ceja levantada que pregunta "
              "“¿y eso a cuánto lo vendés?”. Un personaje que puede aparecer en cada video.",
         pros=["Personalidad y cercanía inmediatas", "Animable: stickers, reacciones, memes"],
         contras=["Se lee más “marca infantil” que especialista en números",
                  "Muchos detalles: pierde rasgos a 40 px"],
         score=[4, 3, 4, 4]),
]
CRIT = ["Memorabilidad", "Legible a 40 px", "Receta ↔ rentabilidad", "Rinde en video"]


def avatar(rel, size, dark=False):
    ring = "#fff" if dark else "#fff"
    return (f'<div class="av" style="width:{size}px;height:{size}px;box-shadow:0 0 0 {2 if size>60 else 1}px {ring}">'
            f'{svg(rel)}</div>')


def profile(rel, dark):
    return f"""
<div class="tt {'dark' if dark else ''}">
  <div class="tt-bar"><span>‹</span><b>La Receta del Precio</b><span>⋯</span></div>
  {avatar(rel, 96, dark)}
  <div class="tt-handle">@larecetadelprecio</div>
  <div class="tt-stats"><div><b>—</b><small>Siguiendo</small></div><div><b>—</b><small>Seguidores</small></div><div><b>—</b><small>Me gusta</small></div></div>
  <div class="tt-btn">Seguir</div>
  <div class="tt-bio">Costos, precios y ganancia para pastelería 🍰 → $</div>
</div>"""


def stars(n):
    return "".join(f'<i class="dot {"on" if i < n else ""}"></i>' for i in range(5))


def comparar():
    cards = []
    for c in CONCEPTS:
        sym = f"{c['file']}/simbolo.svg"
        chosen = c["n"] == "02"
        cards.append(f"""
<section class="concept {'chosen' if chosen else ''}" id="c{c['n']}">
 <div class="wrap">
  <div class="c-head">
    <div><div class="kicker">Concepto {c['n']}{' · elegido' if chosen else ''}</div><h2 class="cond">{c['name']}</h2></div>
    <p class="idea">{c['idea']}</p>
  </div>
  <div class="c-grid">
    <div class="big">{svg(sym)}</div>
    <div class="side">
      <div class="lock">{svg(c['file'] + '/lockup.svg')}</div>
      <div class="kicker" style="margin:22px 0 10px">Recorte circular TikTok · 200 / 110 / 56 / 32 px</div>
      <div class="sizes">{avatar(sym,200)}{avatar(sym,110)}{avatar(sym,56)}{avatar(sym,32)}</div>
    </div>
  </div>
  <div class="c-foot">
    <div class="profiles">{profile(sym, False)}{profile(sym, True)}</div>
    <div class="eval">
      <table>{''.join(f'<tr><td>{k}</td><td>{stars(v)}</td></tr>' for k, v in zip(CRIT, c['score']))}</table>
      <ul class="pc">{''.join(f'<li class="p">{p}</li>' for p in c['pros'])}{''.join(f'<li class="c">{p}</li>' for p in c['contras'])}</ul>
    </div>
  </div>
 </div>
</section>""")

    final_sym = "final/lrdp-avatar-tiktok.svg"
    html = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Conceptos de logo</title>{FONTS}<style>{BASE_CSS}
.concept .c-head{{display:grid;grid-template-columns:1fr 1.3fr;gap:32px;align-items:end;margin-bottom:28px}}
.idea{{font-size:17px;max-width:560px}}
.c-grid{{display:grid;grid-template-columns:1fr 1.25fr;gap:28px;align-items:start}}
.big svg{{border-radius:6px;width:100%}}
.lock svg{{width:100%;border-radius:6px}}
.sizes{{display:flex;align-items:center;gap:22px;flex-wrap:wrap;background:#fff;padding:22px;border-radius:6px}}
.av{{border-radius:50%;overflow:hidden;flex:none}} .av svg{{width:100%;height:100%}}
.c-foot{{display:grid;grid-template-columns:1.25fr 1fr;gap:28px;margin-top:28px}}
.profiles{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
.tt{{background:#fff;color:#161823;border-radius:18px;padding:14px 16px 20px;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:system-ui,sans-serif;border:1px solid var(--linea)}}
.tt.dark{{background:#121212;color:#fff;border-color:#121212}}
.tt-bar{{width:100%;display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px}}
.tt-handle{{font-weight:600;font-size:15px}}
.tt-stats{{display:flex;gap:18px;text-align:center}} .tt-stats b{{display:block;font-size:16px}} .tt-stats small{{font-size:11px;opacity:.6}}
.tt-btn{{background:#FE2C55;color:#fff;font-weight:600;font-size:14px;padding:9px 46px;border-radius:4px;margin-top:4px}}
.tt-bio{{font-size:12px;opacity:.8;text-align:center}}
.eval table{{width:100%;border-collapse:collapse;font-size:15px}}
.eval td{{padding:9px 0;border-bottom:1px solid var(--linea)}} .eval td:last-child{{text-align:right;white-space:nowrap}}
.dot{{display:inline-block;width:12px;height:12px;border-radius:50%;border:2px solid var(--cacao);margin-left:4px}} .dot.on{{background:var(--cacao)}}
.chosen .dot.on{{background:var(--margen);border-color:var(--margen)}}
.pc{{list-style:none;margin-top:16px;display:grid;gap:7px;font-size:15px}}
.pc li{{padding-left:24px;position:relative}} .pc li::before{{position:absolute;left:0;font-family:'Space Mono';font-weight:700}}
.pc .p::before{{content:'+';color:#2a8a3a}} .pc .c::before{{content:'−';color:var(--margen)}}
.chosen{{background:#fff}}
.chosen h2::after{{content:'';display:inline-block;width:.5em;height:.5em;background:var(--margen);border-radius:50% 50% 50% 0;margin-left:.25em;transform:rotate(-45deg)}}
.verdict{{background:var(--cacao);color:var(--harina);border:0}}
.verdict .kicker{{color:#bfae9c}}
.v-grid{{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:center;margin-top:28px}}
.v-grid ol{{padding-left:20px;display:grid;gap:12px;font-size:17px}}
.v-grid b{{color:var(--margen)}}
.v-av{{display:flex;gap:22px;align-items:center;flex-wrap:wrap}}
.v-av .av{{box-shadow:0 0 0 2px #fff}}
nav.jump{{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}}
nav.jump a{{font-family:'Space Mono';font-size:13px;color:var(--cacao);border:2px solid var(--cacao);padding:6px 12px;border-radius:99px;text-decoration:none}}
@media (max-width:860px){{.concept .c-head,.c-grid,.c-foot,.v-grid{{grid-template-columns:1fr}} .profiles{{grid-template-columns:1fr}}}}
</style></head><body>
<header class="top"><div class="wrap">
  <div class="kicker">La Receta del Precio · Identidad visual · Ronda 1</div>
  <h1 class="cond">Tres ideas,<br><span class="it" style="color:var(--margen);font-weight:600">una</span> porción ganadora.</h1>
  <p>Una marca para TikTok que enseña a emprendedores de pastelería a calcular costos, poner precios y ganar más. Tres caminos realmente distintos —símbolo, monograma y mascota— evaluados en grande y en el recorte circular del perfil.</p>
  <nav class="jump"><a href="#c01">01 Cucharada %</a><a href="#c02">02 La Tajada</a><a href="#c03">03 Tiqui</a><a href="#final">Final →</a></nav>
</div></header>
{''.join(cards)}
<section class="verdict" id="final"><div class="wrap">
  <div class="kicker">Decisión</div>
  <h2 class="cond">Elegimos <span class="it" style="color:var(--margen)">La Tajada</span>.</h2>
  <div class="v-grid">
    <ol>
      <li>Es la única idea que <b>une receta y rentabilidad en una sola forma</b>: torta = gráfico de torta.</li>
      <li>La P la vuelve <b>propia</b>: no es un ícono de banco de imágenes, es un monograma.</li>
      <li>A 32 px sigue siendo “una P con una porción afuera”. <b>Silueta, no detalle.</b></li>
      <li>La porción naranja se independiza: <b>es el recurso gráfico de todos los videos</b>.</li>
    </ol>
    <div>
      <div class="kicker" style="margin-bottom:12px">Versión refinada · avatar final</div>
      <div class="v-av">{avatar(final_sym, 220)}{avatar(final_sym, 110)}{avatar(final_sym, 56)}{avatar(final_sym, 32)}</div>
      <p style="margin-top:18px;font-size:15px;color:#d8c9b6">Refinamientos: porción exacta de 1/6 (60°) que arranca en el eje vertical y continúa la línea del asta; mayor separación para que no se “pegue” a tamaños chicos; esquinas suavizadas; remate del asta en diagonal, como un corte de espátula; fondo cacao para destacar en el feed claro y oscuro.</p>
    </div>
  </div>
  <div style="margin-top:36px;background:var(--harina);border-radius:8px;padding:28px;display:flex;justify-content:center"><div style="width:min(620px,100%)">{svg('final/lrdp-lockup-horizontal.svg')}</div></div>
</div></section>
</body></html>"""
    open(os.path.join(ROOT, "comparar-conceptos.html"), "w").write(html)
    print("   comparar-conceptos.html")


# ------------------------------------------------------------------ guía
def guia():
    sym_neg = svg("final/lrdp-simbolo-negativo.svg")
    sym = svg("final/lrdp-simbolo-color.svg")
    slice_only = ('<svg viewBox="-10 -270 240 240" class="slice" aria-hidden="true">'
                  '<path d="M28 -48 L28 -248 A200 200 0 0 1 201 -148 Z" fill="currentColor"/></svg>')
    colors = [
        ("Cacao", "#24140F", "36 · 20 · 15", "Texto, símbolo, fondos de autoridad.", "60%", "#F4EADB"),
        ("Harina", "#F4EADB", "244 · 234 · 219", "Fondo base. Nunca blanco puro.", "25%", "#24140F"),
        ("Margen", "#FF5A1F", "255 · 90 · 31", "La porción. Solo para lo que es ganancia o lo que importa.", "10%", "#24140F"),
        ("Lima", "#C8F03C", "200 · 240 · 60", "Solo en video: números positivos, “+ganancia”, checks.", "5%", "#24140F"),
    ]
    sw = "".join(f"""<div class="sw" style="background:{h};color:{t}">
      <div class="sw-top"><span class="cond" style="font-size:30px">{n}</span><span class="mono">{p}</span></div>
      <div><div class="mono" style="font-size:15px">{h}</div><div class="mono" style="font-size:12px;opacity:.75">RGB {rgb}</div>
      <p style="font-size:14px;margin-top:8px">{d}</p></div></div>""" for n, h, rgb, d, p, t in colors)

    def phone(inner, label):
        return f'<figure class="ph-wrap"><div class="ph">{inner}</div><figcaption class="kicker">{label}</figcaption></figure>'

    footage = '<div class="foot"></div>'
    v1 = phone(f"""{footage}<div class="hook">
      <div class="tag mono">EP. 07 · TORTAS</div>
      <div class="cond hook-t">¿Cuánto<br>cobrás una<br>torta de<br><span style="color:var(--margen)">20 porciones?</span></div>
      <div class="it hook-s">(spoiler: más de lo que pensás)</div></div>
      <div class="bug">{sym_neg}</div>""", "01 · Portada / hook")
    v2 = phone(f"""{footage}<div class="bug">{sym_neg}</div>
      <div class="calc">
        <div class="row"><span>Ingredientes</span><span class="mono">$ 6.200</span></div>
        <div class="row"><span>Packaging</span><span class="mono">$ 900</span></div>
        <div class="row"><span>Gas + luz</span><span class="mono">$ 650</span></div>
        <div class="row"><span>Tu hora</span><span class="mono">$ 3.500</span></div>
        <div class="row tot"><span>Costo real</span><span class="mono">$ 11.250</span></div>
        <div class="row price"><span class="cond">Precio</span><span class="mono">$ 22.500</span></div>
        <div class="gain mono">+ $ 11.250 ganancia</div>
      </div>""", "02 · Cálculo en pantalla")
    v3 = phone(f"""{footage}<div class="bug">{sym_neg}</div>
      <div class="pie-card">
        <div class="kicker" style="color:var(--harina);opacity:.7">De cada $100 que cobrás</div>
        <svg viewBox="-230 -260 470 470" class="pie"><path d="M0 0 L173.2 -100 A200 200 0 1 1 0 -200 Z" fill="#F4EADB"/>
        <path d="M28 -48 L28 -248 A200 200 0 0 1 201.2 -148 Z" fill="#FF5A1F"/></svg>
        <div class="cond" style="font-size:34px;line-height:1">La porción<br>que te <span class="it" style="color:var(--margen)">quedás</span></div>
        <div class="mono" style="font-size:13px;margin-top:6px;color:var(--lima)">Margen objetivo: 50 %</div>
      </div>""", "03 · Sticker / explicación")
    v4 = phone(f"""<div class="end">
      <div style="width:150px">{sym_neg}</div>
      <div class="cond" style="font-size:44px;line-height:.95;text-align:center">La Receta<br><span class="it" style="color:var(--margen)">del</span> Precio</div>
      <div class="mono end-cta">Seguí → mañana: precio de alfajores</div></div>""", "04 · Cierre")

    html = f"""<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Guía visual mini</title>{FONTS}<style>{BASE_CSS}
.hero{{display:grid;grid-template-columns:1.2fr 1fr;gap:40px;align-items:center}}
.hero .sym{{background:var(--cacao);border-radius:8px}}
.sec-head{{display:grid;grid-template-columns:200px 1fr;gap:24px;margin-bottom:28px}}
.sws{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}}
.sw{{border-radius:8px;padding:18px;min-height:230px;display:flex;flex-direction:column;justify-content:space-between;border:1px solid rgba(0,0,0,.08)}}
.sw-top{{display:flex;justify-content:space-between;align-items:baseline}}
.ratio{{display:flex;height:22px;border-radius:99px;overflow:hidden;margin-top:14px}}
.types{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}}
.ty{{background:#fff;border-radius:8px;padding:22px;border:1px solid var(--linea)}}
.ty .spec{{font-size:66px;line-height:1;margin:14px 0}}
.ty p{{font-size:14px}}
.scale{{margin-top:22px;background:#fff;border-radius:8px;padding:22px;border:1px solid var(--linea);display:grid;gap:10px}}
.scale div{{display:flex;gap:16px;align-items:baseline}} .scale .lbl{{width:120px;font-size:12px;color:var(--gris);flex:none}}
.logo-row{{display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:12px}}
.logo-row>div{{border-radius:8px;padding:24px;display:flex;align-items:center;justify-content:center;border:1px solid var(--linea)}}
.rules{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px}}
.rules>div{{background:#fff;border-radius:8px;padding:16px;border:1px solid var(--linea);font-size:14px}}
.rules .no{{color:var(--margen);font-family:'Space Mono';font-weight:700;font-size:12px}}
.rules svg{{width:90px;margin:6px auto 10px}}
.phones{{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}}
.ph-wrap{{display:grid;gap:10px}}
.ph{{aspect-ratio:9/16;border-radius:22px;overflow:hidden;position:relative;background:var(--cacao);color:var(--harina);container-type:inline-size}}
.foot{{position:absolute;inset:0;background:radial-gradient(60% 40% at 30% 70%,#7a4a2c 0,transparent 70%),radial-gradient(50% 35% at 75% 35%,#5b3a26 0,transparent 70%),linear-gradient(180deg,#3a241a,#1b0f0b);filter:saturate(.9)}}
.foot::after{{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.15),rgba(0,0,0,.55))}}
.bug{{position:absolute;top:5%;right:6%;width:13%;z-index:2}} .bug svg{{border-radius:50%}}
.hook{{position:absolute;inset:0;padding:12% 9%;display:flex;flex-direction:column;justify-content:center;z-index:1}}
.tag{{background:var(--margen);color:var(--cacao);font-size:5cqw;align-self:flex-start;padding:1.5% 3%;border-radius:3px;font-weight:700}}
.hook-t{{font-size:15cqw;line-height:.9;margin:6% 0 4%}}
.hook-s{{font-size:7cqw}}
.calc{{position:absolute;left:6%;right:6%;bottom:8%;background:var(--harina);color:var(--cacao);border-radius:10px;padding:6%;z-index:1;font-size:5.6cqw}}
.calc .row{{display:flex;justify-content:space-between;padding:1.6% 0;border-bottom:1px dashed #cdbca6}}
.calc .tot{{font-weight:700;border-bottom:2px solid var(--cacao)}}
.calc .price{{font-size:9cqw;border:0;padding-top:4%}}
.calc .price .mono{{background:var(--margen);padding:0 3%;border-radius:3px}}
.gain{{background:var(--lima);color:var(--cacao);font-weight:700;text-align:center;border-radius:99px;padding:2.5%;margin-top:3%;font-size:5.4cqw}}
.pie-card{{position:absolute;left:6%;right:6%;bottom:9%;z-index:1;background:rgba(36,20,15,.88);border-radius:12px;padding:7%;}}
.pie{{width:62%;margin:4% auto 6%}}
.end{{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7%;padding:10%}}
.end > div:first-child{{width:46% !important}}
.end .cond{{font-size:13cqw !important}}
.end-cta{{font-size:5cqw;background:var(--margen);color:var(--cacao);padding:3% 5%;border-radius:99px;font-weight:700;text-align:center}}
.motion{{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}}
.motion>div{{background:#fff;border:1px solid var(--linea);border-radius:8px;padding:18px;font-size:14px}}
.mv{{height:90px;display:flex;align-items:center;justify-content:center;color:var(--margen)}}
.mv svg{{width:70px}}
@keyframes out{{0%,20%{{transform:translate(-14px,14px)}}50%,100%{{transform:translate(0,0)}}}}
@keyframes pop{{0%,30%{{transform:scale(.6);opacity:0}}55%{{transform:scale(1.08);opacity:1}}70%,100%{{transform:scale(1)}}}}
.a1 .slice{{animation:out 1.8s ease-in-out infinite alternate}}
.a2 span{{animation:pop 2s ease-out infinite;display:inline-block}}
@media (prefers-reduced-motion:reduce){{.a1 .slice,.a2 span{{animation:none}}}}
@media (max-width:900px){{.hero,.sec-head{{grid-template-columns:1fr}} .sws,.phones,.rules{{grid-template-columns:repeat(2,1fr)}} .types,.logo-row,.motion{{grid-template-columns:1fr}}}}
</style></head><body>
<header class="top"><div class="wrap hero">
  <div>
    <div class="kicker">Mini guía visual · v1.0</div>
    <h1 class="cond">La Receta<br><span class="it" style="color:var(--margen)">del</span> Precio</h1>
    <p><b>La idea en una línea:</b> toda torta es un gráfico de torta. Nuestro símbolo es una P con la porción que tenés que cobrar —tu ganancia— afuera, a la vista.</p>
    <p style="margin-top:12px;color:var(--gris);font-size:15px">Marca independiente. Tono: un especialista que habla claro, con números reales y sin vergüenza de cobrar.</p>
  </div>
  <div class="sym">{sym_neg}</div>
</div></header>

<section><div class="wrap">
  <div class="sec-head"><div class="kicker">01 · Color</div><div><h2 class="cond">Cacao manda, el naranja <span class="it" style="color:var(--margen)">cobra</span>.</h2>
  <p style="margin-top:10px;max-width:620px">Paleta cálida y oscura, nada de rosa pastel. El naranja Margen se reserva para la ganancia —si todo es naranja, nada es ganancia—. Lima solo aparece en video para números positivos.</p></div></div>
  <div class="sws">{sw}</div>
  <div class="ratio"><span style="flex:60;background:#24140F"></span><span style="flex:25;background:#F4EADB;border:1px solid var(--linea)"></span><span style="flex:10;background:#FF5A1F"></span><span style="flex:5;background:#C8F03C"></span></div>
  <p class="mono" style="font-size:12px;color:var(--gris);margin-top:8px">Proporción de uso aproximada · contraste Cacao/Harina 15.6:1 · Margen sobre Cacao 6:1 (apto para texto grande)</p>
</div></section>

<section><div class="wrap">
  <div class="sec-head"><div class="kicker">02 · Tipografía</div><div><h2 class="cond">Tres voces, un rol cada una.</h2>
  <p style="margin-top:10px;max-width:620px">Todas gratuitas (Google Fonts, licencia OFL). Los TTF exactos usados en el logo están en <span class="mono">fonts/</span>.</p></div></div>
  <div class="types">
    <div class="ty"><div class="kicker">Titulares · Bricolage Grotesque</div><div class="spec cond">Costo real</div><p>ExtraBold (800), ancho condensado (wdth 75). Títulos, hooks, nombres de recetas. Interlineado 0.9–0.95, tracking −1 %.</p></div>
    <div class="ty"><div class="kicker">Acento · Fraunces Italic</div><div class="spec it" style="color:var(--margen)">del precio</div><p>SemiBold (600), SOFT 100, WONK 1. Una o dos palabras por pieza: la “voz” que remata. Nunca párrafos.</p></div>
    <div class="ty"><div class="kicker">Números · Space Mono</div><div class="spec mono" style="font-weight:700;font-size:52px">$ 22.500</div><p>Bold (700) para precios, costos y porcentajes. Todo número en pantalla va en mono: se lee como cálculo, no como publicidad.</p></div>
  </div>
  <div class="scale">
    <div><span class="mono lbl">Hook · 15% ancho</span><span class="cond" style="font-size:44px;line-height:1">¿Cuánto cobrás?</span></div>
    <div><span class="mono lbl">Subtítulo · 7%</span><span class="it" style="font-size:26px">spoiler: más de lo que pensás</span></div>
    <div><span class="mono lbl">Dato · 6%</span><span class="mono" style="font-size:20px;font-weight:700">Costo $ 11.250 → Precio $ 22.500</span></div>
    <div><span class="mono lbl">Cuerpo · 4.5%</span><span style="font-size:16px;font-weight:500">Bricolage Grotesque Medium para textos largos en carruseles o descripciones.</span></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-head"><div class="kicker">03 · Logo</div><div><h2 class="cond">Versiones y reglas.</h2>
  <p style="margin-top:10px;max-width:620px">Área de respeto: el ancho del asta de la P alrededor de todo el símbolo. Tamaño mínimo del símbolo: 24 px de alto en pantalla; del lockup horizontal: 120 px de ancho.</p></div></div>
  <div class="logo-row">
    <div style="background:#fff">{svg('final/lrdp-lockup-horizontal.svg')}</div>
    <div style="background:var(--cacao)"><div style="width:70%">{sym_neg}</div></div>
    <div style="background:var(--margen)"><div style="width:70%">{svg('final/lrdp-simbolo-mono-cacao.svg')}</div></div>
  </div>
  <div class="rules">
    <div><div style="transform:rotate(-28deg)">{sym}</div><span class="no">NO</span> rotar la P ni mover la porción a otro lugar.</div>
    <div><div style="filter:hue-rotate(160deg)">{sym}</div><span class="no">NO</span> recolorear la porción. Siempre Margen (o mono).</div>
    <div><div style="opacity:.9;filter:drop-shadow(6px 6px 0 #c9b8a2)">{sym}</div><span class="no">NO</span> sombras, degradados, 3D ni contornos.</div>
    <div><div style="transform:scaleX(1.35)">{sym}</div><span class="no">NO</span> deformar. Escalar siempre proporcional.</div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="sec-head"><div class="kicker">04 · En video</div><div><h2 class="cond">Aplicaciones 9:16.</h2>
  <p style="margin-top:10px;max-width:620px">El símbolo vive arriba a la derecha como “bug” (fuera de la zona de botones de TikTok). Los textos van en el tercio central-inferior, sobre una tarjeta Harina o un velo Cacao al 88 %: nunca texto suelto sobre el video.</p></div></div>
  <div class="phones">{v1}{v2}{v3}{v4}</div>
  <div class="motion">
    <div class="a1"><div class="mv">{slice_only}</div><b>La porción sale</b><br>Animación firma (0.6 s, ease-in-out): la porción se separa de la P en diagonal. Abre y cierra cada video.</div>
    <div class="a2"><div class="mv"><span class="mono" style="font-size:28px;font-weight:700;background:var(--lima);color:var(--cacao);padding:4px 10px;border-radius:99px">+ $ 11.250</span></div><b>El número “pop”</b><br>Cada resultado entra con escala 60 → 108 → 100 %. Sonido corto tipo caja registradora opcional.</div>
    <div><div class="mv"><span class="cond" style="font-size:30px;color:var(--cacao)">Corte seco</span></div><b>Ritmo</b><br>Cortes secos, sin transiciones de plantilla. Cada pantalla = una sola idea o un solo número.</div>
  </div>
</div></section>

<section style="border:0"><div class="wrap" style="display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;align-items:center">
  <div style="width:220px">{svg('final/lrdp-wordmark.svg')}</div>
  <p class="mono" style="font-size:12px;color:var(--gris)">La Receta del Precio · marca independiente · archivos en logos/final y export/</p>
</div></section>
</body></html>"""
    open(os.path.join(ROOT, "guia-visual.html"), "w").write(html)
    print("   guia-visual.html")


if __name__ == "__main__":
    comparar()
    guia()
