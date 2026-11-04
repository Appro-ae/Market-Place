"""Normalize the real journey screenshots for the deck: auto-trim the ragged
screenshot borders, mask uniform rounded corners, add a hairline navy frame.

    python3 build/clean_shots.py
"""
import os
from PIL import Image, ImageChops, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(os.path.dirname(HERE), 'assets')
NAVY = (0x1a, 0x21, 0x4d, 255)


def trim(im, tol=18, passes=2):
    """Crop uniform-ish borders (outer frame, then inner background edge)."""
    for _ in range(passes):
        rgb = im.convert('RGB')
        corner = rgb.getpixel((2, 2))
        bg = Image.new('RGB', rgb.size, corner)
        diff = ImageChops.difference(rgb, bg).convert('L')
        mask = diff.point(lambda p: 255 if p > tol else 0)
        box = mask.getbbox()
        if not box:
            break
        pad = 2
        box = (max(0, box[0] - pad), max(0, box[1] - pad),
               min(rgb.width, box[2] + pad), min(rgb.height, box[3] + pad))
        if box == (0, 0, rgb.width, rgb.height):
            break
        im = im.crop(box)
    return im


def polish(src, dst, radius_frac=0.055, passes=2, target_ratio=0.42):
    im = trim(Image.open(src), passes=passes).convert('RGB')
    # letterbox to the common ratio with the screenshot's own background colour
    w, h = im.size
    bg = im.getpixel((3, h // 2))
    if w / h < target_ratio:
        nw = int(h * target_ratio)
        canvas = Image.new('RGB', (nw, h), bg)
        canvas.paste(im, ((nw - w) // 2, 0))
        im = canvas
    elif w / h > target_ratio:
        nh = int(w / target_ratio)
        canvas = Image.new('RGB', (w, nh), bg)
        canvas.paste(im, (0, (nh - h) // 2))
        im = canvas
    w, h = im.size
    r = int(w * radius_frac)
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    mask = Image.new('L', (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=r, fill=255)
    out.paste(im, (0, 0), mask)
    d = ImageDraw.Draw(out)
    d.rounded_rectangle([1, 1, w - 2, h - 2], radius=r, outline=NAVY, width=4)
    out.save(dst)
    print(os.path.basename(dst), out.size, 'ratio', round(w / h, 3))


polish(os.path.join(A, 'real_details_toggle_on.png'), os.path.join(A, 'shot_on.png'), passes=1)
polish(os.path.join(A, 'real_details_nstl_iban.png'), os.path.join(A, 'shot_off.png'), passes=2)
