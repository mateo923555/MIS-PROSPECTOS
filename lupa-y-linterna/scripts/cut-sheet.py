#!/usr/bin/env python3
"""Recorta vistas de una ficha (fondo crema liso) a PNG con transparencia.
Uso: cut-sheet.py ficha.png prefijo "x0,y0,x1,y1;x0,y0,x1,y1;..." [--flip]  -> prefijo_0..N.png
Pinta el fondo conectado a los bordes del recorte, se queda con el componente más grande y suaviza el borde."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

src, prefix, boxes = sys.argv[1], sys.argv[2], sys.argv[3]
flip = "--flip" in sys.argv
SH = int(sys.argv[sys.argv.index("--shadow") + 1]) if "--shadow" in sys.argv else 0
THR = int(sys.argv[sys.argv.index("--thr") + 1]) if "--thr" in sys.argv else 21
im = Image.open(src).convert("RGB")
M = (255, 0, 255)
for i, b in enumerate(boxes.split(";")):
    x0, y0, x1, y1 = [int(v) for v in b.split(",")]
    crop = im.crop((x0, y0, x1, y1)); w, h = crop.size
    work = crop.copy()
    for x in range(0, w, 6):
        for y in (0, h - 1):
            if work.getpixel((x, y)) != M: ImageDraw.floodfill(work, (x, y), M, thresh=THR)
    for y in range(0, h, 6):
        for x in (0, w - 1):
            if work.getpixel((x, y)) != M: ImageDraw.floodfill(work, (x, y), M, thresh=THR)
    a = np.asarray(work).astype(int)
    fg = ~((abs(a[..., 0] - 255) < 3) & (a[..., 1] < 3) & (abs(a[..., 2] - 255) < 3))
    # componente conexo más grande
    lab = np.zeros(fg.shape, int); n = 0; best = (0, 0)
    for sy, sx in zip(*np.nonzero(fg)):
        if lab[sy, sx]: continue
        n += 1; st = [(sy, sx)]; lab[sy, sx] = n; cnt = 0
        while st:
            y, x = st.pop(); cnt += 1
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                yy, xx = y + dy, x + dx
                if 0 <= yy < h and 0 <= xx < w and fg[yy, xx] and not lab[yy, xx]: lab[yy, xx] = n; st.append((yy, xx))
        if cnt > best[0]: best = (cnt, n)
    keep = lab == best[1]
    # sombra de piso de la ficha: en el 16 % inferior, descartar lo que se parece al fondo (más claro que el pelaje)
    bgc = np.median(np.asarray(crop).astype(int)[:4].reshape(-1, 3), axis=0)
    dist = np.sqrt(((np.asarray(crop).astype(int) - bgc) ** 2).sum(-1))
    low = np.arange(h)[:, None] > h * 0.84
    keep = keep & ~(low & (dist < SH))
    ys, xs = np.nonzero(keep)
    m = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.0))
    out = crop.convert("RGBA"); out.putalpha(m)
    out = out.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if flip: out = ImageOps.mirror(out)
    out.save(f"{prefix}_{i}.png"); print(prefix, i, out.size)
