#!/usr/bin/env python3
"""Recorta vistas de una ficha (fondo crema liso) a PNG con transparencia.
Uso: cut-sheet.py ficha.png prefijo "x0,y0,x1,y1;x0,y0,x1,y1;..." [--flip]  -> prefijo_0..N.png
Pinta el fondo conectado a los bordes del recorte, se queda con el componente más grande y suaviza el borde."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

src, prefix, boxes = sys.argv[1], sys.argv[2], sys.argv[3]
flip = "--flip" in sys.argv
SMOOTH = "--smooth" in sys.argv
SMOOTH_STD = float(sys.argv[sys.argv.index("--smooth") + 1]) if SMOOTH else 0
KEEPCOLS = sys.argv[sys.argv.index("--keepcols") + 1] if "--keepcols" in sys.argv else ""
FLOOR = float(sys.argv[sys.argv.index("--floor") + 1]) if "--floor" in sys.argv else 87
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
    if SMOOTH:
        arr = np.asarray(crop).astype(float); lum = arr.mean(-1)
        k = 7; pad = np.pad(lum, k // 2, mode="edge"); win = np.lib.stride_tricks.sliding_window_view(pad, (k, k)); std = win.std(axis=(-1, -2))
        bgc2 = np.median(np.asarray(crop).astype(int)[:4].reshape(-1, 3), axis=0); dist2 = np.sqrt(((arr - bgc2) ** 2).sum(-1))
        lowrows = np.arange(h)[:, None] > h * 0.50
        keep = keep & ~(lowrows & (std < SMOOTH_STD) & (dist2 < 70))
        floor = np.arange(h)[:, None] > h * 0.86
        keep = keep & ~(floor & (std < SMOOTH_STD * 1.8) & (dist2 < 95))
        # reconectar: quedarse otra vez con el componente más grande
        lab2 = np.zeros(keep.shape, int); n2 = 0; best2 = (0, 0)
        for sy, sx in zip(*np.nonzero(keep)):
            if lab2[sy, sx]: continue
            n2 += 1; st = [(sy, sx)]; lab2[sy, sx] = n2; c2 = 0
            while st:
                y, x = st.pop(); c2 += 1
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and keep[yy, xx] and not lab2[yy, xx]: lab2[yy, xx] = n2; st.append((yy, xx))
            if c2 > best2[0]: best2 = (c2, n2)
        keep = lab2 == best2[1]
    # sombra de piso de la ficha: en el 16 % inferior, descartar lo que se parece al fondo (más claro que el pelaje)
    bgc = np.median(np.asarray(crop).astype(int)[:4].reshape(-1, 3), axis=0)
    dist = np.sqrt(((np.asarray(crop).astype(int) - bgc) ** 2).sum(-1))
    low = np.arange(h)[:, None] > h * 0.84
    keep = keep & ~(low & (dist < SH))
    if KEEPCOLS:
        yy0, xx0 = np.nonzero(keep); by0, by1, bx0, bx1 = yy0.min(), yy0.max() + 1, xx0.min(), xx0.max() + 1
        fl = np.arange(h)[:, None] > by0 + FLOOR / 100.0 * (by1 - by0)
        cols = np.zeros(w, bool)
        for rng in KEEPCOLS.split(","):
            a0, a1 = [float(v) for v in rng.split("-")]; cols[int(bx0 + a0 / 100 * (bx1 - bx0)):int(bx0 + a1 / 100 * (bx1 - bx0))] = True
        keep = keep & ~(fl & ~cols[None, :])
    ys, xs = np.nonzero(keep)
    m0 = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(5))
    m = m0.filter(ImageFilter.GaussianBlur(1.0))
    # relleno de color desde el interior: sin halo claro del fondo en el borde
    inner = np.asarray(m0.filter(ImageFilter.MinFilter(3))).astype(float) / 255
    src = np.asarray(crop).astype(float)
    num = np.stack([np.asarray(Image.fromarray((src[..., c] * inner).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float) for c in range(3)], -1)
    den = np.asarray(Image.fromarray((inner * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(float)[..., None] / 255
    fill = np.clip(num / np.maximum(den, 1e-3), 0, 255)
    edge = (np.asarray(m).astype(float) / 255 < 0.98)[..., None]
    rgb = np.where(edge & (den > 0.05), fill, src).astype(np.uint8)
    out = Image.fromarray(rgb).convert("RGBA"); out.putalpha(m)
    out = out.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    if flip: out = ImageOps.mirror(out)
    out.save(f"{prefix}_{i}.png"); print(prefix, i, out.size)
