#!/usr/bin/env python3
"""Hoja de contactos: contact.py salida.png img1 img2 ... (cada una a 270x480)"""
import sys
from PIL import Image
out, *ims = sys.argv[1:]
w, h = 360, 640
sheet = Image.new("RGB", (w * len(ims), h), (20, 20, 20))
for i, f in enumerate(ims):
    sheet.paste(Image.open(f).convert("RGB").resize((w, h)), (i * w, 0))
sheet.save(out)
