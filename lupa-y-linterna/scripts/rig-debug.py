#!/usr/bin/env python3
"""Dibuja las articulaciones de src/shared/rigs.json sobre los sprites para ajustarlas a ojo."""
import json, sys
from PIL import Image, ImageDraw
rigs = json.load(open("src/shared/rigs.json"))
tiles = []
FILES = {"t_front": "t_0", "t_tq": "t_1", "m_front": "m_0", "m_tq": "m_1"}
for name, r in rigs.items():
    im = Image.open(f"public/art/dogs/{FILES[name]}.png").convert("RGBA"); bg = Image.new("RGBA", im.size, (78, 135, 133, 255)); bg.alpha_composite(im)
    s = 1.6; bg = bg.convert("RGB").resize((int(im.width * s), int(im.height * s))); d = ImageDraw.Draw(bg); w, h = bg.size
    P = lambda x, y: (x / 100 * w, y / 100 * h)
    ax, at = r["split"]["axis"], r["split"]["at"]
    if ax == "y": d.line((0, at / 100 * h, w, at / 100 * h), fill=(255, 0, 255), width=2)
    else: d.line((at / 100 * w, 0, at / 100 * w, h), fill=(255, 0, 255), width=2)
    px, py = P(*r["pivot"]); d.ellipse((px - 7, py - 7, px + 7, py + 7), outline=(255, 255, 0), width=3)
    for ex, ey, rx, ry in r["eyes"]:
        cx, cy = P(ex, ey); d.ellipse((cx - rx / 100 * w, cy - ry / 100 * h, cx + rx / 100 * w, cy + ry / 100 * h), outline=(0, 255, 255), width=2)
    for e in r.get("ears", []):
        d.polygon([P(*p) for p in e["poly"]], outline=(255, 90, 0)); qx, qy = P(*e["pivot"]); d.ellipse((qx - 5, qy - 5, qx + 5, qy + 5), fill=(255, 90, 0))
    tiles.append(bg)
W = sum(t.width for t in tiles); H = max(t.height for t in tiles)
out = Image.new("RGB", (W, H), (20, 20, 20)); x = 0
for t in tiles: out.paste(t, (x, 0)); x += t.width
out.save(sys.argv[1] if len(sys.argv) > 1 else "/tmp/rigdebug.png")
