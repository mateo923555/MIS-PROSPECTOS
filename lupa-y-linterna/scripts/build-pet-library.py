#!/usr/bin/env python3
"""Organiza las poses de Teresa y Timoteo: copia originales, recorta el magenta y registra el origen.
Uso: build-pet-library.py  (lee public/art/drive221/_registro-revision.tsv y _lista-drive.json)"""
import csv, json, os, re, shutil, subprocess, sys
import numpy as np
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D221 = os.path.join(ROOT, "public/art/drive221")
BLOB = "/root/.claude/projects/-home-user-MIS-PROSPECTOS/91308091-e0bd-5aa9-a810-7ff73d46276a/tool-results/mcp-Google_Drive-blob-"
files = json.load(open(os.path.join(D221, "_lista-drive.json")))
rows = list(csv.reader(open(os.path.join(D221, "_registro-revision.tsv")), delimiter="\t"))[1:]
os.makedirs(os.path.join(D221, "originales"), exist_ok=True)

def categoria(d):
    d = d.lower()
    if "sin collar" in d or "collar verde y chapita" in d: return None
    for k, c in [("caminando", "caminata"), ("trot", "carrera"), ("galope", "carrera"), ("corriendo", "carrera"), ("olfate", "olfateo"),
                 ("reverencia", "juego"), ("acechando", "juego"), ("salt", "salto"), ("vuelo", "salto"), ("en el aire", "salto"),
                 ("durmiendo", "descanso"), ("dormid", "descanso"), ("echad", "descanso"), ("sentad", "sentado"),
                 ("ladrando", "habla"), ("aullando", "habla"), ("bostez", "emocion"), ("sorprend", "emocion"), ("feliz", "emocion"), ("riendo", "emocion"),
                 ("triste", "emocion"), ("asust", "emocion"), ("enojad", "emocion"), ("tímido", "emocion"),
                 ("señal", "accion"), ("rasc", "accion"), ("girando", "accion"), ("persiguiendo", "accion"), ("pared", "accion"), ("panza", "accion"), ("estirándose", "accion"),
                 ("mirando", "mirada"), ("inclinad", "mirada"), ("curios", "mirada"), ("reojo", "mirada"), ("ojos cerrados", "parpadeo")]:
        if k in d: return c
    return "base"

def facing(d):
    d = d.lower()
    if "izquierda" in d: return "izq"
    if "derecha" in d: return "der"
    return "frente"

man = []; counters = {}
for r in rows:
    idx, did, blob, who, desc, q = int(r[0]), r[1], r[2], r[3], r[4], r[5]
    title = files[idx]["title"]
    src = BLOB + blob + ".png"
    shutil.copy(src, os.path.join(D221, "originales", title))
    if who not in ("T", "M") or q.startswith(("DESCARTAR", "descartar", "duplicado", "casi-duplicado", "DEFECTO")) or "ok" not in q.lower() and "RIESGO" not in q:
        man.append(dict(idx=idx, drive_id=did, original=title, personaje={"T": "teresa", "M": "timoteo"}.get(who, "-"), descripcion=desc, estado="DESCARTADA", motivo=q)); continue
    cat = categoria(desc)
    if cat is None:
        man.append(dict(idx=idx, drive_id=did, original=title, personaje="teresa" if who == "T" else "timoteo", descripcion=desc, estado="DESCARTADA", motivo=q)); continue
    nm = "teresa" if who == "T" else "timoteo"
    key = (nm, cat, facing(desc)); counters[key] = counters.get(key, 0) + 1
    slug = f"{nm}_{cat}_{facing(desc)}_{counters[key]:02d}"
    out_dir = os.path.join(ROOT, "public/art/mascotas", nm, cat); os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, slug + ".png")
    subprocess.run([sys.executable, os.path.join(ROOT, "scripts/key.py"), os.path.join(D221, "originales", title), out, "--pad", "6"], check=True, capture_output=True)
    man.append(dict(idx=idx, drive_id=did, original=title, personaje=nm, categoria=cat, direccion=facing(desc), archivo=os.path.relpath(out, ROOT + "/public"), descripcion=desc, estado="OK", calidad=q))
json.dump(man, open(os.path.join(ROOT, "public/art/mascotas/_manifest.json"), "w"), ensure_ascii=False, indent=1)
ok = [m for m in man if m["estado"] == "OK"]
print("procesadas", len(man), "ok", len(ok), "descartadas", len(man) - len(ok))
