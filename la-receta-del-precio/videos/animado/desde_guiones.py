"""Convierte los guiones de videos/guiones.py en guiones animados para Doña Marga.

Uso: python3 desde_guiones.py            -> escribe v02.json … v35.json (V01 es a mano)
     python3 desde_guiones.py --probar   -> muestra cómo lee la voz cada línea

Pantalla: gancho → una tarjeta por golpe (con los números resaltados y "2/4") →
remate con el dato de la portada como sello → cierre.
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
    # "uno" delante de sustantivo o de "mil": veintiuno -> veintiún, y uno -> y un
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


def _dec(ent, dec, apocope=False):
    s = palabras(_num(ent), apocope)
    if dec:
        s += " coma " + (" ".join(palabras(int(c)) for c in dec) if dec.startswith("0") else palabras(int(dec)))
    return s


def hablar(t):
    t = re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", t)
    t = t.replace("[fecha]", "tal fecha").replace("$X", "tanto").replace("[", "").replace("]", "")
    t = re.sub(r"[x×] ?3\b", "por tres", t)
    t = t.replace("c/u", "cada uno").replace(" vs ", " contra ")
    # $ con decimales: $1,20 -> un peso con veinte
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
    t = re.sub(r",\s*([,.:;])", r"\1", t)
    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------------- armado
def limpio(t):
    return re.sub(r"\s+", " ", re.sub(r"[\U0001F000-\U0001FFFF☀-➿️]", "", t)).strip()


def guion(i, v):
    n = len(v["beats"])
    S = [dict(say=hablar(v["hook"]), sub=limpio(v["hook"]), ceja=True,
              accion={"tipo": "hook", "texto": v["hook_txt"]}),
         dict(say=hablar(v["promesa"]), sub=limpio(v["promesa"]),
              accion={"tipo": "pizarra", "k": "QUEDATE HASTA EL FINAL", "texto": limpio(v["promesa"])})]
    for k, b in enumerate(v["beats"], 1):
        S.append(dict(say=hablar(b), sub=limpio(b),
                      accion={"tipo": "pizarra", "k": f"{k}/{n}", "texto": b}))
    pay = [{"tipo": "pizarra", "k": "LA RESPUESTA", "texto": v["payoff"], "fuerte": True}]
    if v.get("dato"):
        pay.append({"tipo": "big", "label": v["dato"][0], "valor": v["dato"][1], "top": 780})
    S.append(dict(say=hablar(v["payoff"]), sub=limpio(v["payoff"]), ceja=True, accion=pay))
    venta = v["slot"] == 5
    S.append(dict(say=hablar(v["cta"]), sub=limpio(v["cta"]),
                  accion={"tipo": "cta", "texto": "@larecetadelprecio",
                          "boton": "Link en mi perfil" if venta else "Seguime · @larecetadelprecio",
                          "ref": v.get("ref") if venta else None}))
    return dict(id=f"V{i:02d}", titulo=v["portada"].replace("*", "").replace("\n", " "), segmentos=S)


if __name__ == "__main__":
    if "--probar" in sys.argv:
        for v in g.G:
            for t in [v["hook"], v["promesa"], *v["beats"], v["payoff"]]:
                if re.search(r"\d|\$|%|÷|×", t):
                    print("·", hablar(t))
        sys.exit()
    for i, v in enumerate(g.G, 1):
        if i == 1:
            continue
        with open(os.path.join(AQUI, f"v{i:02d}.json"), "w") as fh:
            json.dump(guion(i, v), fh, ensure_ascii=False, indent=1)
    print("   v02.json … v35.json")
