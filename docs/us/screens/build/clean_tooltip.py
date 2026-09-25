"""Remove the OS hover tooltip (and its drop shadow) from the Rule Engine capture.

Nothing is invented. Every pixel the tooltip covered is restored from an element
that demonstrably continues across the occluded span, measured from the capture:

  * the dropdown panel is opaque, so its interior is flat white;
  * the panel's edge is a 1px #D9DADC border plus a ~4px shadow, sampled from a
    clean row (y=200) and a clean column (x=350);
  * the page behind it carries two full-width horizontal rules, read off a clean
    column to the right of the tooltip (x=700) - #D0E2F0 at y288-289 and
    #D9DADC at y306-307, both verified to span x634-799 uncovered.

The value input's glyphs (y>=318, x<=434) are left alone; the tooltip's shadow
over them reads 247-254 and is below the visible threshold.
"""
from PIL import Image

src = Image.open('../SC2_Rule_Engine_Values_Current.png').convert('RGB')
out = src.copy()
px, po = src.load(), out.load()

PANEL_R, PANEL_B = 581, 306          # panel interior: x315-581, y35-306
BORDER = (217, 218, 220)
WHITE = (255, 255, 255)
REF_COL, REF_ROW = 700, 200          # clean page column / clean panel row

def mul(a, b, c):
    return tuple(a[i] * b[i] * c[i] // (255 * 255) for i in range(3))

for y in range(260, 331):
    for x in range(384, 635):
        if x <= PANEL_R and y <= PANEL_B:
            po[x, y] = WHITE                                   # opaque panel interior
        elif (x == PANEL_R + 1 and y <= PANEL_B + 1) or (y == PANEL_B + 1 and x <= PANEL_R + 1):
            po[x, y] = BORDER                                  # panel edge
        else:
            if y >= 318 and x <= 434:
                continue                                       # keep the value input
            # the panel's right shadow stops at its own bottom shadow edge
            fx = px[x, REF_ROW] if (PANEL_R + 2 <= x <= PANEL_R + 5 and y <= PANEL_B + 5) else WHITE
            # the panel's bottom shadow stops at its own right shadow edge
            fy = px[350, y] if (PANEL_B + 2 <= y <= PANEL_B + 5 and x <= PANEL_R + 5) else WHITE
            po[x, y] = mul(px[REF_COL, y], fx, fy)

out.save('SC2_clean.png')
print('SC2_clean.png written', out.size)
