"""Genera todos los SVG de La Receta del Precio.

Uso:  python3 la-receta-del-precio/tools/build.py
Requiere: fonttools, uharfbuzz.  El texto se convierte a contornos (paths)
para que los SVG no dependan de fuentes instaladas.
"""
import math
import os

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "fonts")

# ---------------------------------------------------------------- paleta
CACAO = "#24140F"      # tinta principal
HARINA = "#F4EADB"     # fondo claro
MARGEN = "#FF5A1F"     # naranja: la porción de ganancia
LIMA = "#C8F03C"       # acento de video (+ganancia)
# paletas de concepto
MANTECA = "#FFD028"
TINTA = "#16120F"
COBALTO = "#2B3BFF"


# ---------------------------------------------------------------- texto -> path
_cache = {}


def _font(name):
    if name not in _cache:
        path = os.path.join(FONTS, name)
        blob = hb.Blob.from_file_path(path)
        _cache[name] = (TTFont(path), hb.Font(hb.Face(blob)))
    return _cache[name]


def text_path(text, font, size, x=0, y=0, tracking=0, anchor="start"):
    """Devuelve (d, ancho) del texto como contorno SVG. y = línea base."""
    tt, hbf = _font(font)
    upm = tt["head"].unitsPerEm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbf, buf, {"kern": True, "liga": True})
    s = size / upm
    track = tracking * size / 1000
    total = sum(p.x_advance for p in buf.glyph_positions) * s + track * (len(text) - 1)
    if anchor == "middle":
        x -= total / 2
    elif anchor == "end":
        x -= total
    gs = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}".rstrip("0").rstrip("."))
    cx = 0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        g = order[info.codepoint]
        gx = x + (cx + pos.x_offset) * s
        gy = y - pos.y_offset * s
        gs[g].draw(TransformPen(pen, (s, 0, 0, -s, gx, gy)))
        cx += pos.x_advance + track / s
    return pen.getCommands(), total


def tp(text, font, size, x, y, fill, tracking=0, anchor="start", id_=None):
    d, _ = text_path(text, font, size, x, y, tracking, anchor)
    idattr = f' id="{id_}"' if id_ else ""
    return f'<path{idattr} fill="{fill}" d="{d}"/>'


def width(text, font, size, tracking=0):
    return text_path(text, font, size, 0, 0, tracking)[1]


# ---------------------------------------------------------------- utilidades
def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def svg(w, h, body, title, bg=None, vb=None):
    """vb = (x, y, w, h) recorta el lienzo al contenido + área de respeto."""
    x, y = 0, 0
    if vb:
        x, y, w, h = (round(v) for v in vb)
    rect = f'<rect id="fondo" x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" width="{w}" height="{h}">'
        f"<title>{title}</title>{rect}{body}</svg>\n"
    )


def save(rel, content):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        fh.write(content)
    print("  ", rel)


# =================================================================
# CONCEPTO 1 — LA CUCHARADA %
# El signo de porcentaje armado con una cuchara medidora: la barra
# del % es el mango, los ceros son "pizcas". Receta = medida exacta.
# =================================================================
def concepto1_simbolo(ink=TINTA, accent="#FF4D2E"):
    ax, ay, bx, by = 300, 770, 712, 236
    ang = math.degrees(math.atan2(by - ay, bx - ax))
    L = math.hypot(bx - ax, by - ay)
    ux, uy = (bx - ax) / L, (by - ay) / L
    hx, hy = ax + ux * L * 0.56, ay + uy * L * 0.56
    ex, ey = ax + ux * L * 0.80, ay + uy * L * 0.80
    return (
        '<g id="cucharada-porcentaje">'
        f'<line id="mango" x1="{ax}" y1="{ay}" x2="{f(hx)}" y2="{f(hy)}" stroke="{ink}" stroke-width="64" stroke-linecap="round"/>'
        f'<ellipse id="cuenco" cx="{f(ex)}" cy="{f(ey)}" rx="128" ry="92" transform="rotate({f(ang)} {f(ex)} {f(ey)})" fill="{ink}"/>'
        f'<circle id="pizca-1" cx="318" cy="330" r="84" fill="{ink}"/>'
        f'<circle id="pizca-2" cx="688" cy="690" r="84" fill="{accent}"/>'
        "</g>"
    )


def concepto1():
    sym = concepto1_simbolo()
    save("logos/concepto-1-cucharada/simbolo.svg",
         svg(1000, 1000, sym, "La Receta del Precio — Concepto 1: Cucharada %", MANTECA))
    # lockup
    body = f'<g transform="translate(40 60) scale(.48)">{concepto1_simbolo()}</g>'
    body += tp("LA RECETA", "SpaceMono-Bold.ttf", 118, 560, 268, TINTA, tracking=-20)
    body += tp("DEL PRECIO", "SpaceMono-Bold.ttf", 118, 560, 400, TINTA, tracking=-20)
    body += f'<rect x="560" y="430" width="560" height="10" fill="{TINTA}"/>'
    body += tp("COSTOS · PRECIOS · GANANCIA", "SpaceMono-Bold.ttf", 30, 560, 488, TINTA, tracking=60)
    save("logos/concepto-1-cucharada/lockup.svg",
         svg(1300, 600, body, "La Receta del Precio — Concepto 1 lockup", MANTECA, (52, 49, 1303, 539)))


# =================================================================
# CONCEPTO 2 — LA TAJADA (monograma P)
# Una P cuyo bucle es una torta vista desde arriba = un gráfico de
# torta. Falta una porción: esa porción es tu ganancia.
# =================================================================
def tajada_geo(cx=575, cy=395, r=200, a0=-82, a1=-28, push=46, stem_w=160, stem_bottom=812):
    """Devuelve paths (cuerpo, porcion) del monograma P."""
    p0 = pt(cx, cy, r, a1)
    p1 = pt(cx, cy, r, a0)
    # cuerpo: círculo sin la porción  + asta
    body = (
        f"M{f(cx)} {f(cy)} L{f(p0[0])} {f(p0[1])} "
        f"A{r} {r} 0 1 1 {f(p1[0])} {f(p1[1])} Z "
        f"M{f(cx - r)} {f(cy)} H{f(cx - r + stem_w)} V{stem_bottom} H{f(cx - r)} Z"
    )
    mid = (a0 + a1) / 2
    dx, dy = pt(0, 0, push, mid)
    q0 = (p0[0] + dx, p0[1] + dy)
    q1 = (p1[0] + dx, p1[1] + dy)
    slice_ = (
        f"M{f(cx + dx)} {f(cy + dy)} L{f(q1[0])} {f(q1[1])} "
        f"A{r} {r} 0 0 1 {f(q0[0])} {f(q0[1])} Z"
    )
    return body, slice_


def concepto2_simbolo(ink=CACAO, accent=MARGEN, round_=0):
    b, s = tajada_geo()
    st = (f' stroke-linejoin="round" stroke-width="{round_}"') if round_ else ""
    return (
        '<g id="tajada-p">'
        f'<path id="torta-p" fill="{ink}"{st and st + f" stroke=\"{ink}\""} d="{b}"/>'
        f'<path id="porcion-ganancia" fill="{accent}"{st and st + f" stroke=\"{accent}\""} d="{s}"/>'
        "</g>"
    )


def concepto2():
    save("logos/concepto-2-tajada/simbolo.svg",
         svg(1000, 1000, f'<g transform="translate(-72 22)">{concepto2_simbolo()}</g>',
             "La Receta del Precio — Concepto 2: La Tajada", HARINA))
    body = f'<g transform="translate(-10 70) scale(.5)">{concepto2_simbolo()}</g>'
    body += tp("La Receta", "Bric-XB-Cond.ttf", 150, 520, 300, CACAO, tracking=-10)
    w_del = width("del ", "Fraun-It-SB.ttf", 150)
    body += tp("del", "Fraun-It-SB.ttf", 150, 524, 450, MARGEN)
    body += tp("Precio", "Bric-XB-Cond.ttf", 150, 524 + w_del, 450, CACAO, tracking=-10)
    save("logos/concepto-2-tajada/lockup.svg",
         svg(1300, 600, body, "La Receta del Precio — Concepto 2 lockup", HARINA, (77, 50, 1050, 526)))


# =================================================================
# CONCEPTO 3 — TIQUI, la mascota
# Un huevo que es una etiqueta de precio (agujero + hilo). Ceja
# levantada: "¿y eso a cuánto lo vendés?". El personaje que te
# cuestiona el precio en cada video.
# =================================================================
def concepto3_simbolo(body_fill="#FFF3DC", ink=CACAO, bg=COBALTO, cheek=MARGEN):
    egg = ("M500 236 C648 236 730 432 730 572 C730 706 628 800 500 800 "
           "C372 800 270 706 270 572 C270 432 352 236 500 236 Z")
    return (
        '<g id="tiqui" stroke-linecap="round" stroke-linejoin="round">'
        f'<path id="hilo" d="M500 300 C500 196 560 150 640 150 C716 150 742 206 708 246" fill="none" stroke="{ink}" stroke-width="20"/>'
        f'<path id="cuerpo-etiqueta" d="{egg}" fill="{body_fill}" stroke="{ink}" stroke-width="30"/>'
        f'<circle id="ojal" cx="500" cy="322" r="24" fill="{bg}" stroke="{ink}" stroke-width="20"/>'
        f'<ellipse cx="398" cy="618" rx="32" ry="18" fill="{cheek}"/>'
        f'<ellipse cx="612" cy="618" rx="32" ry="18" fill="{cheek}"/>'
        f'<ellipse id="ojo-izq" cx="430" cy="548" rx="22" ry="34" fill="{ink}"/>'
        f'<ellipse id="ojo-der" cx="574" cy="540" rx="22" ry="34" fill="{ink}"/>'
        f'<path id="ceja-izq" d="M398 486 L458 488" stroke="{ink}" stroke-width="18" fill="none"/>'
        f'<path id="ceja-der" d="M540 466 Q578 440 616 460" stroke="{ink}" stroke-width="18" fill="none"/>'
        f'<path id="boca" d="M452 650 Q510 684 560 636" stroke="{ink}" stroke-width="18" fill="none"/>'
        "</g>"
    )


def concepto3():
    save("logos/concepto-3-tiqui/simbolo.svg",
         svg(1000, 1000, concepto3_simbolo(), "La Receta del Precio — Concepto 3: Tiqui", COBALTO))
    body = f'<g transform="translate(20 40) scale(.52)">{concepto3_simbolo()}</g>'
    body += tp("la receta", "Fraun-It-XB.ttf", 150, 560, 290, "#FFFFFF", tracking=-10)
    body += tp("del precio", "Fraun-It-XB.ttf", 150, 560, 440, LIMA, tracking=-10)
    save("logos/concepto-3-tiqui/lockup.svg",
         svg(1300, 600, body, "La Receta del Precio — Concepto 3 lockup", COBALTO, (60, 18, 1205, 557)))


# =================================================================
# FINAL — LA TAJADA refinada
# =================================================================
def final_simbolo(ink=CACAO, accent=MARGEN, bg=None, cx=500, cy=500, scale=1.0):
    """Símbolo final centrado ópticamente en (cx, cy).

    Refinamientos vs concepto: porción de 1/6 exacta (60°) que arranca
    justo en el eje vertical (el corte continúa la línea del asta),
    separación mayor para que la porción no se pegue en tamaños chicos
    ni en versiones a una tinta, esquinas suavizadas como corte de
    cuchillo y remate del asta en diagonal (corte de espátula).
    """
    r, stem_w = 200, 150
    a0, a1, push = -90, -30, 56           # porción de 60° = 1/6 de torta
    tcx, tcy = 0, 0                       # geometría local
    p0, p1 = pt(tcx, tcy, r, a1), pt(tcx, tcy, r, a0)
    sx0, sx1 = -r, -r + stem_w
    bottom, cut = 360, 46                 # remate en diagonal
    body = (
        f"M0 0 L{f(p0[0])} {f(p0[1])} A{r} {r} 0 1 1 {f(p1[0])} {f(p1[1])} Z "
        f"M{sx0} 0 H{sx1} V{bottom - cut} L{sx0} {bottom} Z"
    )
    mid = (a0 + a1) / 2
    dx, dy = pt(0, 0, push, mid)
    q0, q1 = (p0[0] + dx, p0[1] + dy), (p1[0] + dx, p1[1] + dy)
    sl = f"M{f(dx)} {f(dy)} L{f(q1[0])} {f(q1[1])} A{r} {r} 0 0 1 {f(q0[0])} {f(q0[1])} Z"
    # bbox local: x [-200, 201], y [-248, 360] -> centro óptico
    ox, oy = 0, 56
    t = f"translate({f(cx - ox * scale)} {f(cy - oy * scale)}) scale({scale})"
    rj = 'stroke-linejoin="round" stroke-width="10"'
    return (
        f'<g id="la-tajada" transform="{t}">'
        f'<path id="torta-p" d="{body}" fill="{ink}" stroke="{ink}" {rj}/>'
        f'<path id="porcion-ganancia" d="{sl}" fill="{accent}" stroke="{accent}" {rj}/>'
        "</g>"
    )


def final():
    T = "La Receta del Precio"
    # símbolo solo (fondo transparente)
    save("logos/final/lrdp-simbolo-color.svg", svg(1000, 1000, final_simbolo(), T))
    save("logos/final/lrdp-simbolo-negativo.svg",
         svg(1000, 1000, final_simbolo(ink=HARINA), T, CACAO))
    save("logos/final/lrdp-simbolo-mono-cacao.svg",
         svg(1000, 1000, final_simbolo(ink=CACAO, accent=CACAO), T))
    save("logos/final/lrdp-simbolo-mono-blanco.svg",
         svg(1000, 1000, final_simbolo(ink="#FFFFFF", accent="#FFFFFF"), T))
    # avatar TikTok: el punto más lejano del símbolo queda al 63 % del radio
    # (zona segura 72 %): no se corta en el círculo ni lo tapa el anillo de "live".
    save("logos/final/lrdp-avatar-tiktok.svg",
         svg(1024, 1024, final_simbolo(ink=HARINA, cx=512, cy=512, scale=0.88), T, CACAO))
    save("logos/final/lrdp-avatar-tiktok-claro.svg",
         svg(1024, 1024, final_simbolo(cx=512, cy=512, scale=0.88), T, HARINA))

    # lockup horizontal
    def lockup_h(ink, accent, bg, name):
        body = final_simbolo(ink=ink, accent=accent, cx=250, cy=300, scale=0.62)
        body += tp("La Receta", "Bric-XB-Cond.ttf", 168, 470, 285, ink, tracking=-12)
        wd = width("del ", "Fraun-It-SB.ttf", 168)
        body += tp("del", "Fraun-It-SB.ttf", 168, 474, 445, accent)
        body += tp("Precio", "Bric-XB-Cond.ttf", 168, 474 + wd, 445, ink, tracking=-12)
        save(f"logos/final/{name}", svg(1280, 600, body, T, bg, (36, 21, 1090, 557)))

    lockup_h(CACAO, MARGEN, None, "lrdp-lockup-horizontal.svg")
    lockup_h(HARINA, MARGEN, CACAO, "lrdp-lockup-horizontal-negativo.svg")

    # lockup vertical
    body = final_simbolo(cx=500, cy=380, scale=0.72)
    body += tp("La Receta", "Bric-XB-Cond.ttf", 150, 500, 810, CACAO, tracking=-12, anchor="middle")
    w1 = width("del ", "Fraun-It-SB.ttf", 150)
    w2 = width("Precio", "Bric-XB-Cond.ttf", 150, -12)
    x0 = 500 - (w1 + w2) / 2
    body += tp("del", "Fraun-It-SB.ttf", 150, x0, 950, MARGEN)
    body += tp("Precio", "Bric-XB-Cond.ttf", 150, x0 + w1, 950, CACAO, tracking=-12)
    save("logos/final/lrdp-lockup-vertical.svg", svg(1000, 1040, body, T, None, (160, 71, 680, 971)))

    # wordmark solo
    w_a = width("La Receta ", "Bric-XB-Cond.ttf", 140, -12)
    w_b = width("del ", "Fraun-It-SB.ttf", 140)
    body = tp("La Receta", "Bric-XB-Cond.ttf", 140, 40, 150, CACAO, tracking=-12)
    body += tp("del", "Fraun-It-SB.ttf", 140, 40 + w_a, 150, MARGEN)
    body += tp("Precio", "Bric-XB-Cond.ttf", 140, 40 + w_a + w_b, 150, CACAO, tracking=-12)
    w_c = width("Precio", "Bric-XB-Cond.ttf", 140, -12)
    save("logos/final/lrdp-wordmark.svg", svg(int(80 + w_a + w_b + w_c), 200, body, T, None, (3, 8, 991, 184)))


if __name__ == "__main__":
    print("Generando SVG…")
    concepto1()
    concepto2()
    concepto3()
    final()
