#!/usr/bin/env python3
"""Estadísticas de cuadros para la verificación narrativa.
  frame_stats.py dark  img x0 y0 x1 y1 [thr=50]   -> fracción de píxeles con luminancia < thr
  frame_stats.py diff  imgA imgB x0 y0 x1 y1      -> diferencia absoluta media (0-255)
  frame_stats.py sat   img x0 y0 x1 y1            -> saturación media (0-255)
  frame_stats.py coral img x0 y0 x1 y1            -> fracción de píxeles coral/rojos"""
import sys
import numpy as np
from PIL import Image
cmd = sys.argv[1]
def load(p, box):
    im = Image.open(p).convert("RGB").crop(tuple(int(v) for v in box)); return np.asarray(im).astype(float)
if cmd == "dark":
    a = load(sys.argv[2], sys.argv[3:7]); thr = float(sys.argv[7]) if len(sys.argv) > 7 else 50
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]; print(float((lum < thr).mean()))
elif cmd == "diff":
    a = load(sys.argv[2], sys.argv[4:8]); b = load(sys.argv[3], sys.argv[4:8]); print(float(np.abs(a - b).mean()))
elif cmd == "sat":
    a = load(sys.argv[2], sys.argv[3:7]) / 255; mx = a.max(-1); mn = a.min(-1)
    s = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0); print(float(s.mean() * 255))
elif cmd == "coral":
    a = load(sys.argv[2], sys.argv[3:7]); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    print(float(((R > 170) & (G < 135) & (B < 125) & (R - G > 55)).mean()))
