#!/usr/bin/env python3
"""Recorte por croma magenta con despill. Uso: key.py entrada.png salida.png [--pad 12]
Estima el color de fondo desde los bordes, calcula alfa suave y des-premultiplica el fleco."""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
pad = 12
if "--pad" in sys.argv:
    pad = int(sys.argv[sys.argv.index("--pad") + 1])

im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
h, w, _ = im.shape
border = np.concatenate([im[:6].reshape(-1, 3), im[-6:].reshape(-1, 3), im[:, :6].reshape(-1, 3), im[:, -6:].reshape(-1, 3)])
key = np.median(border, axis=0)  # ~ (255,0,255)

# "magentidad": cuánto se parece cada píxel a la mezcla del fondo
R, G, B = im[..., 0], im[..., 1], im[..., 2]
mag = (np.minimum(R, B) - G) / 255.0
k_mag = (min(key[0], key[2]) - key[1]) / 255.0
p = np.clip(mag / max(k_mag, 1e-3), 0, 1)       # proporción de fondo en el píxel
p = np.where(p < 0.04, 0.0, p)
alpha = 1.0 - np.clip((p - 0.10) / 0.80, 0, 1)   # rampa suave: p<=0.1 opaco, p>=0.9 transparente
alpha = np.where(p > 0.92, 0.0, alpha)

# des-premultiplicar el color de fondo (despill)
a = np.clip(alpha, 1e-3, 1)[..., None]
out = (im - (1 - a) * key) / a
out = np.clip(out, 0, 255)
# reducir magenta residual en bordes semitransparentes
edge = (alpha > 0) & (alpha < 1)
lim = G + 0.2 * (np.minimum(R, B) - G)
for ch in (0, 2):
    out[..., ch] = np.where(edge, np.minimum(out[..., ch], np.maximum(lim, out[..., 1]) + 12), out[..., ch])

rgba = np.dstack([out, alpha * 255]).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")
bbox = img.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox()
if bbox:
    l, t, r, b = bbox
    img = img.crop((max(0, l - pad), max(0, t - pad), min(w, r + pad), min(h, b + pad)))
img.save(dst)
print(f"{dst}: {img.size[0]}x{img.size[1]} key={key.astype(int).tolist()}")
