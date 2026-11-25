#!/usr/bin/env python3
"""Quita el «piso» de la ficha bajo las patas. Por columna: el suelo está justo debajo del último píxel de perro
(más oscuro que el fondo crema, por el sombreado de la plastilina). Todo lo que queda debajo se descarta.
Uso: clean-ground.py sprite.png [umbral_luminancia=224] [margen_px=7]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
p = sys.argv[1]; thr = float(sys.argv[2]) if len(sys.argv) > 2 else 14; margin = int(sys.argv[3]) if len(sys.argv) > 3 else 7
im = Image.open(p).convert("RGBA"); a = np.asarray(im).astype(float); h, w, _ = a.shape
rgb = a[..., :3]; al = a[..., 3] / 255; lum = rgb.mean(-1)
bg = np.array([253.0, 244.0, 232.0])
dist = np.sqrt(((rgb - bg) ** 2).sum(-1))
k = 5; pad = np.pad(lum, k // 2, mode="edge"); win = np.lib.stride_tricks.sliding_window_view(pad, (k, k)); std = win.std(axis=(-1, -2))
newal = a[..., 3].copy()
# 1) fondo crema liso de la ficha (color casi exacto del fondo, sin textura), en el 40 % inferior
rows = np.arange(h)[:, None] > h * 0.40
kill = (dist < thr) & (std < 2.0) & rows
newal = np.where(kill, 0, newal)
# 1b) franja lisa y clara del piso bajo las patas (sombra crema de la ficha)
base = np.arange(h)[:, None] > h * 0.85
newal = np.where(base & (std < 3.5) & (lum > 228), 0, newal)
# 2) bajo el último píxel «oscuro» de cada columna (sombreado de las patas) no hay perro
DARK = float(sys.argv[4]) if len(sys.argv) > 4 else 214
dog = (lum < DARK) & (newal > 120)
for x in range(w):
    col = np.nonzero(dog[int(h * 0.55):, x])[0]
    if len(col): newal[int(h * 0.55) + col.max() + margin:, x] = 0
# 3) en la franja inferior solo sobrevive lo cercano a píxeles CON textura de plastilina (las patas); el piso liso de la ficha no tiene
tex = ((std > 3.2) | (lum < 205)) & (newal > 120) & (np.arange(h)[:, None] > h * 0.62)
texm = Image.fromarray((tex * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(13))
near = np.asarray(texm) > 0
band = np.arange(h)[:, None] > h * 0.84
newal = np.where(band & ~near, 0, newal)
# componente más grande, suavizado de borde
keep = newal > 20; lab = np.zeros((h, w), int); n = 0; best = (0, 0)
for sy, sx in zip(*np.nonzero(keep)):
    if lab[sy, sx]: continue
    n += 1; st = [(sy, sx)]; lab[sy, sx] = n; c = 0
    while st:
        y, x = st.pop(); c += 1
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and keep[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; st.append((yy, xx))
    if c > best[0]: best = (c, n)
newal = np.where(lab == best[1], newal, 0)
# rellenar agujeritos aislados (brillos del pelaje que se confundieron con el fondo)
solid = newal > 20; inv = ~solid; lab3 = np.zeros((h, w), int); n3 = 0
for sy, sx in zip(*np.nonzero(inv)):
    if lab3[sy, sx]: continue
    n3 += 1; st = [(sy, sx)]; lab3[sy, sx] = n3; comp = [(sy, sx)]; touches = False
    while st:
        y, x = st.pop()
        if y in (0, h - 1) or x in (0, w - 1): touches = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < h and 0 <= xx < w and inv[yy, xx] and not lab3[yy, xx]: lab3[yy, xx] = n3; st.append((yy, xx)); comp.append((yy, xx))
    if not touches and len(comp) < 120:
        for (yy, xx) in comp: newal[yy, xx] = 255
m = Image.fromarray(newal.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
out = Image.fromarray(rgb.astype(np.uint8)).convert("RGBA"); out.putalpha(m)
bb = out.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox(); out = out.crop(bb); out.save(p); print(p, out.size)
