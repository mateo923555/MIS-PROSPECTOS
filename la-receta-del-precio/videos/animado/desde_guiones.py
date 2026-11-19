"""Convierte los guiones de videos/guiones.py en guiones animados para Doña Marga.

Uso: python3 desde_guiones.py            -> escribe v01.json … v35.json
     python3 desde_guiones.py --probar   -> muestra planos y números de cada video

Planos (mismo patrón en todos los videos, con variedad):
  B = primer plano (gancho y remate)      A = plano medio con tarjeta
  C = pantalla de datos + Doña Marga en círculo      D = plano lateral
Gancho siempre en B, promesa en A, los pasos rotan C/D/A (arranca distinto según el
video), remate en B con el sello del dato, cierre en A.
"""
import importlib.util
import json
import os
import re
import sys

AQUI = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("guiones", os.path.join(AQUI, "..", "guiones.py"))
g = importlib.util.module_from_spec(spec)
spec.loader.exec_module(g)

# ---------------------------------------------------------------- números en palabras
U = "cero uno dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince dieciséis diecisiete dieciocho diecinueve veinte veintiuno veintidós veintitrés veinticuatro veinticinco veintiséis veintisiete veintiocho veintinueve".split()
D = {3: "treinta", 4: "cuarenta", 5: "cincuenta", 6: "sesenta", 7: "setenta", 8: "ochenta", 9: "noventa"}
C = {1: "ciento", 2: "doscientos", 3: "trescientos", 4: "cuatrocientos", 5: "quinientos", 6: "seiscientos",
     7: "setecientos", 8: "ochocientos", 9: "novecientos"}


def _menor_mil(n):
    if n < 30:
        return U[n]
    if n < 100:
        d, u = divmod(n, 10)
        return D[d] + ("" if u == 0 else " y " + U[u])
    if n == 100:
        return "cien"
    c, r = divmod(n, 100)
    return C[c] + ("" if r == 0 else " " + _menor_mil(r))


def _apocope(s):
    return re.sub(r"veintiuno$", "veintiún", re.sub(r"\buno$", "un", s))


def palabras(n, apocope=False):
    n = int(n)
    if n == 0:
        return "cero"
    partes = []
    mill, r = divmod(n, 1_000_000)
    if mill:
        partes.append("un millón" if mill == 1 else _apocope(palabras(mill)) + " millones")
    miles, r = divmod(r, 1000)
    if miles:
        partes.append("mil" if miles == 1 else _apocope(_menor_mil(miles)) + " mil")
    if r:
        partes.append(_menor_mil(r))
    s = " ".join(partes)
    return _apocope(s) if apocope else s


def _num(txt):
    return int(txt.replace(".", ""))


def _dec(ent, dec):
    s = palabras(_num(ent))
    if dec:
        s += " coma " + (" ".join(palabras(int(c)) for c in dec) if dec.startswith("0") else palabras(int(dec)))
    return s


EMOJI = r"[\U0001F000-\U0001FFFF☀-➿️]"


def hablar(t):
    t = re.sub(EMOJI, "", t)
    t = t.replace("[fecha]", "tal fecha").replace("$X", "tanto").replace("[", "").replace("]", "")
    t = re.sub(r"[x×] ?3\b", "por tres", t)
    t = t.replace("c/u", "cada uno").replace(" vs ", " contra ")
    t = re.sub(r"\$ ?(\d+),(\d+)", lambda m: ("un peso" if m[1] == "1" else palabras(_num(m[1]), True) + " pesos")
               + " con " + palabras(int(m[2])), t)
    t = re.sub(r"\$ ?(\d{1,3}(?:\.\d{3})+|\d+)", lambda m: palabras(_num(m[1]), True) + " pesos", t)
    t = re.sub(r"(\d+(?:\.\d{3})*)(?:,(\d+))? ?%", lambda m: _dec(m[1], m[2]) + " por ciento", t)
    t = re.sub(r"(\d+(?:\.\d{3})*),(\d+)", lambda m: _dec(m[1], m[2]), t)
    t = re.sub(r"(\d+(?:\.\d{3})*) ?g\b", lambda m: palabras(_num(m[1])) + " gramos", t)
    t = re.sub(r"(\d+(?:\.\d{3})*) ?h\b", lambda m: palabras(_num(m[1])) + (" hora" if m[1] == "1" else " horas"), t)
    t = re.sub(r"(\d{1,3}(?:\.\d{3})+|\d+)", lambda m: palabras(_num(m[1])), t)
    t = (t.replace("÷", " dividido ").replace("×", " por ").replace(" = ", ", igual a ").replace("=", " igual a ")
         .replace("−", " menos ").replace(" + ", " más ").replace("→", " a ").replace("(", ", ").replace(")", ","))
    t = t.replace("“", "").replace("”", "").replace("…", "...")
    t = re.sub(r"\s+,", ",", t)
    t = re.sub(r",\s*([,.:;])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


def limpio(t):
    return re.sub(r"\s+", " ", re.sub(EMOJI, "", t)).strip()


# ---------------------------------------------------------------- qué números mostrar
VAL = r"\$ ?\d{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:,\d+)? ?%"
STOP = r"(y|pero|e|con|es|son|el|la|los|las|un|una|de|a|en|por|sobre)"


def tarjeta(texto):
    """Acción de pantalla para un golpe: 'calc' (una cuenta), 'rows' (montos) o None."""
    t = limpio(texto).replace("“", "").replace("”", "")
    for f in re.split(r"(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚ¿¡])", t):
        if "=" in f or "÷" in f:
            label, expr = ("", f)
            if ":" in f.split("=")[0]:
                label, expr = f.split(":", 1)
            expr = expr.strip().rstrip(".")
            if len(expr) <= 48:
                return {"tipo": "calc", "label": label.strip(), "linea": expr}
    rows = []
    for f in re.split(r"(?<=[.!?;])\s+(?=[A-ZÁÉÍÓÚ¿¡])", t):
        fin = 0
        for m in re.finditer(VAL, f):
            antes = re.split(r"[:;,(]|\.(?!\d)", f[fin:m.start()])[-1].strip()
            if not antes and ":" in f[:m.start()]:
                cand = f[:m.start()].rsplit(":", 1)[0]
                if not re.search(r"\d", cand):
                    antes = re.split(r"[;,(]|\.(?!\d)", cand)[-1].strip()
            antes = re.sub(r"^(?:%s\s+)+" % STOP, "", antes, flags=re.I)
            antes = re.sub(r"(?:\s+%s)+$" % STOP, "", antes, flags=re.I)
            label = " ".join(antes.split()[-5:]).strip(" .:")
            rows.append({"label": label[:1].upper() + label[1:], "valor": re.sub(r"\$ ?", "$ ", m.group(0))})
            fin = m.end()
    rows = rows[:4]
    return {"tipo": "rows", "rows": rows} if rows else None


# ---------------------------------------------------------------- armado
PROMESAS = ["Quedate: el número del final duele.", "Mirá el número del final.", "Al final te doy la cuenta exacta.",
            "Esperá el final.", "El final te va a sorprender."]
CTAS = ["El método completo está en mi ebook, La Receta del Precio. El link, en mi perfil.",
        "¿Querés hacerlo con tus números? Está todo en mi ebook. Link en mi perfil.",
        "Esto y mucho más, paso a paso, en mi ebook. Te dejo el link en mi perfil."]


def primera(t):
    return re.split(r"(?<=[.!?])\s+", t.strip())[0]


def guion(i, v):
    beats = v["beats"][:3]
    n = len(beats)
    prom = PROMESAS[i % len(PROMESAS)]
    cta = CTAS[i % len(CTAS)]
    ciclo = ["C", "D", "A"]
    ciclo = ciclo[i % 3:] + ciclo[:i % 3]
    S = [dict(say=hablar(v["hook"]), sub=limpio(v["hook"]), ceja=True, plano="B", rapidez=1.2, gancho=True,
              accion={"tipo": "hook", "texto": v["hook_txt"]}),
         dict(say=hablar(prom), sub=prom, plano="A",
              accion={"tipo": "promesa", "texto": "Quedate hasta el final"})]
    prev, k = "A", 0
    for j, b in enumerate(beats, 1):
        card = tarjeta(b)
        if card:
            plano = ciclo[k % 3]
            if plano == prev:
                k += 1
                plano = ciclo[k % 3]
            k += 1
        else:
            plano = "D" if prev != "D" else "B"
        acc = [{"tipo": "paso", "k": f"{j}/{n}"}] + ([card] if card else [])
        S.append(dict(say=hablar(b), sub=limpio(b), plano=plano, accion=acc))
        prev = plano
    pay = []
    dato = v.get("dato")
    if not dato:
        m = re.search(VAL, v["payoff"])
        if m:
            dato = ("EN ESTE EJEMPLO", re.sub(r"\$ ?", "$ ", m.group(0)))
    if dato:
        pay.append({"tipo": "big", "label": dato[0], "valor": dato[1]})
    pf = primera(v["payoff"])
    S.append(dict(say=hablar(pf), sub=limpio(pf), ceja=True, plano="B", rapidez=1.3, pausa=.6, accion=pay))
    S.append(dict(say=hablar(cta), sub=cta, plano="A",
                  accion={"tipo": "cta", "texto": "@larecetadelprecio", "boton": "Link en mi perfil",
                          "ref": "Ebook + cuaderno de 11 hojas + 2 bonos"}))
    return dict(id=f"V{i:02d}", titulo=v["portada"].replace("*", "").replace("\n", " "), segmentos=S)


if __name__ == "__main__":
    if "--probar" in sys.argv:
        for i, v in enumerate(g.G, 1):
            print(f"\n== V{i:02d}")
            for s in guion(i, v)["segmentos"]:
                acc = s["accion"] if isinstance(s["accion"], list) else [s["accion"]]
                print(f"  [{s['plano']}]", [a for a in acc if a["tipo"] in ("calc", "rows", "big")])
        sys.exit()
    for i, v in enumerate(g.G, 1):
        with open(os.path.join(AQUI, f"v{i:02d}.json"), "w") as fh:
            json.dump(guion(i, v), fh, ensure_ascii=False, indent=1)
    print("   v01.json … v35.json")
