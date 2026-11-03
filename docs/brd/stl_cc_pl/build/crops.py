"""STL BRD figure crops from the workflow renders and the real portal capture.

    python3 crops.py
"""
import os
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, '..', 'assets')
WF = '/home/user/Market-Place/docs/workflow'
CAP = '/home/user/Market-Place/.claude/skills/rb-knowledge-base/screens/SC2_Application_Enquiry_Revert_Button.png'


def crop_png(src, px_w, box, out, scale=1.0, xoff=0, trim=False):
    """box in diagram coords (x0,y0,x1,y1); render border 16, scale 2, left offset xoff.
    trim=True shaves uniform near-white margins off the result."""
    doc = pymupdf.open(src)
    page = doc[0]
    k = px_w / page.rect.width
    s, b = 2, 16
    x0, y0, x1, y1 = box
    r = pymupdf.Rect((x0 + b + xoff) * s / k, (y0 + b) * s / k,
                     (x1 + b + xoff) * s / k, (y1 + b) * s / k)
    pix = page.get_pixmap(clip=r, matrix=pymupdf.Matrix(k * scale, k * scale))
    if trim:
        w, h, n = pix.width, pix.height, pix.n
        buf = pix.samples
        stride = w * n

        def row_white(j):
            row = buf[j * stride:(j + 1) * stride]
            return all(v > 246 for v in row[::7])

        def col_white(i):
            return all(buf[j * stride + i * n] > 246 and buf[j * stride + i * n + 1] > 246
                       for j in range(0, h, 6))
        top = 0
        while top < h - 1 and row_white(top):
            top += 1
        bot = h - 1
        while bot > top and row_white(bot):
            bot -= 1
        left = 0
        while left < w - 1 and col_white(left):
            left += 1
        right = w - 1
        while right > left and col_white(right):
            right -= 1
        pad = 10
        clip = pymupdf.IRect(max(0, left - pad), max(0, top - pad),
                             min(w, right + pad), min(h, bot + pad))
        pix = page.get_pixmap(
            clip=pymupdf.Rect(r.x0 + clip.x0 / (k * scale), r.y0 + clip.y0 / (k * scale),
                              r.x0 + clip.x1 / (k * scale), r.y0 + clip.y1 / (k * scale)),
            matrix=pymupdf.Matrix(k * scale, k * scale))
    pix.save(out)
    doc.close()
    print(os.path.basename(out))


def crop_capture(box_px, out, scale=0.9):
    doc = pymupdf.open(CAP)
    page = doc[0]
    k = 3840 / page.rect.width
    x0, y0, x1, y1 = box_px
    r = pymupdf.Rect(x0 / k, y0 / k, x1 / k, y1 / k)
    page.get_pixmap(clip=r, matrix=pymupdf.Matrix(k * scale, k * scale)).save(out)
    doc.close()
    print(os.path.basename(out))


# PL v2 render: canvas 7400 wide + ops_note at -300 → xoff 300; PNG 15228 px
crop_png(os.path.join(WF, 'personal_loan/assets/pl_v2.png'), 15228,
         (5930, 460, 7120, 1280), os.path.join(A, 'PL_FSTL_Fulfilment.png'), scale=0.9, xoff=300,
         trim=True)
# CC v1.7 render: PNG 13498 px
crop_png(os.path.join(WF, 'cc_ntb/assets/cc_v17.png'), 13498,
         (4990, 460, 6090, 1280), os.path.join(A, 'CC_FSTL_Fulfilment.png'), scale=0.9, xoff=300,
         trim=True)
# one-page flow summary as the overview figure + hero band
import shutil
shutil.copy(os.path.join(WF, 'pl_stl/assets/pl_stl_summary.png'), os.path.join(A, 'Flow_STL_End_to_End.png'))
print('Flow_STL_End_to_End.png')
crop_png(os.path.join(WF, 'pl_stl/assets/pl_stl_summary.png'), 4902,
         (90, 85, 2080, 620), os.path.join(A, 'cover_hero.png'), scale=0.85, xoff=0)
os.replace(os.path.join(A, 'cover_hero.png'), os.path.join(A, 'cover_hero_stl.png'))
print('cover_hero_stl.png')

# real portal capture crops
crop_capture((2650, 820, 3800, 2010), os.path.join(A, 'SC9_Portal_Application_Details.png'))
crop_capture((230, 820, 2600, 2010), os.path.join(A, 'SC10_Portal_Audit_Trail.png'), scale=0.75)
