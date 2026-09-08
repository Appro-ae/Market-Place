#!/usr/bin/env python3
"""Turn the supplied Appro wordmark (navy on a flat white background) into the two
brand versions with transparency, so the same artwork sits correctly on light and dark slides.

Shapes are never altered: the alpha channel is taken from the artwork's own coverage
(navy = opaque, white = transparent) and only the ink colour differs between versions.
"""
import json
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "upload_3.png")          # navy wordmark on white
NAVY = (0x1a, 0x21, 0x4d)
WHITE = (0xff, 0xff, 0xff)

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

# luminance of the darkest ink in the file = full coverage
lum = [[0.299 * px[x, y][0] + 0.587 * px[x, y][1] + 0.114 * px[x, y][2] for x in range(w)] for y in range(h)]
lo = min(min(r) for r in lum)
span = 255.0 - lo

alpha = Image.new("L", (w, h))
ap = alpha.load()
for y in range(h):
    row = lum[y]
    for x in range(w):
        a = (255.0 - row[x]) / span
        ap[x, y] = 255 if a >= 1 else (0 if a <= 0 else int(round(a * 255)))


def write(name, rgb):
    out = Image.new("RGBA", (w, h), rgb + (0,))
    out.putalpha(alpha)
    path = os.path.join(HERE, name)
    out.save(path)
    op = sum(1 for p in out.getdata() if p[3] > 128)
    print(f"{name}: {w}x{h} ratio {w/h:.3f}  ink pixels {op}")
    return path


write("logo-dark.png", NAVY)
write("logo-white.png", WHITE)
json.dump({"ratio": round(w / h, 4), "w": w, "h": h},
          open(os.path.join(HERE, "logo.json"), "w"), indent=1)
print("logo.json written; native ratio", round(w / h, 4))
