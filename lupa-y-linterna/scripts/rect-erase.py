#!/usr/bin/env python3
"""Borra rectángulos (en % del sprite) y recorta: rect-erase.py sprite.png "x0,y0,x1,y1;..." """
import sys
import numpy as np
from PIL import Image
p = sys.argv[1]; im = Image.open(p).convert("RGBA"); a = np.asarray(im).copy(); h, w, _ = a.shape
for r in sys.argv[2].split(";"):
    x0, y0, x1, y1 = [float(v) for v in r.split(",")]; a[int(y0 / 100 * h):int(y1 / 100 * h), int(x0 / 100 * w):int(x1 / 100 * w), 3] = 0
out = Image.fromarray(a); bb = out.getchannel("A").point(lambda v: 255 if v > 24 else 0).getbbox(); out.crop(bb).save(p); print(p, out.crop(bb).size)
