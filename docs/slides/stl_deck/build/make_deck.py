"""Appro-standard PPTX — Salary Transfer (CC + PL) design update, 4 slides.

Yellow-led template per the Appro branding guidelines: white content slides with the
yellow-pill two-tone title, navy corner circle, confidentiality header/footer, 4-circle
brand icon, Lato only, 5-colour palette only. Logo: width-only placement; white wordmark
top-right where it sits on the navy corner circle (contrast rule).

Slide 1 reproduces the PO's "The journey decides the salary flow, not the customer"
decision slide with the REAL journey screen; slides 2-4 carry the cases, the workflow +
backend chips, and the real screens + open questions.

    python3 build/make_deck.py
"""
import os
import struct
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.oxml.ns import qn
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REPO = '/home/user/Market-Place'
BRDA = os.path.join(REPO, 'docs/brd/stl_cc_pl/assets')
DECKA = os.path.join(ROOT, 'assets')
LOGO_NAVY = os.path.join(REPO, 'docs/brd/push_notification/assets/appro_wordmark_navy.png')
LOGO_WHITE = os.path.join(REPO, 'docs/proposal/manual_cif/build/assets/appro_wordmark_white.png')
OUT = os.path.join(ROOT, 'Appro_RF_Salary_Transfer_Deck_V1.0.pptx')

NAVY = RGBColor(0x1a, 0x21, 0x4d)
BLUE = RGBColor(0x3b, 0x7e, 0xf6)
YELLOW = RGBColor(0xfd, 0xba, 0x23)
LAVEND = RGBColor(0xed, 0xf2, 0xff)
WHITE = RGBColor(0xff, 0xff, 0xff)

HEADER = 'APPRO – INTERNAL & APPROVED DOMAINS | Controlled Distribution'
FOOTER = ('This document is classified as INTERNAL & WHITELISTED | '
          'Sharing allowed only with approved external domains')

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
BLANK = prs.slide_layouts[6]


def no_shadow(shape):
    spPr = shape._element.spPr
    for el in spPr.findall(qn('a:effectLst')):
        spPr.remove(el)
    etree.SubElement(spPr, qn('a:effectLst'))
    sp = shape._element
    for st in sp.findall(qn('p:style')):
        sp.remove(st)


def lato(run, size, bold=False, color=NAVY, italic=False):
    run.font.name = 'Lato'
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color


def text(slide, x, y, w, h, lines, size=11, bold=False, color=NAVY, align=PP_ALIGN.LEFT,
         wrap=True, leading=None, italic=False, anchor=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if anchor:
        tf.vertical_anchor = anchor
    first = True
    for line in (lines if isinstance(lines, list) else [lines]):
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        if leading:
            p.line_spacing = leading
        if not isinstance(line, str):            # runs: [(txt, size, bold, color), ...]
            for t, s2, b2, c2 in line:
                r = p.add_run()
                r.text = t
                lato(r, s2, b2, c2, italic)
        else:
            r = p.add_run()
            r.text = line
            lato(r, size, bold, color, italic)
    return tb


def rect(slide, x, y, w, h, fill, line_color=None, radius=0.12, line_w=0.75):
    sh = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y),
                                Inches(w), Inches(h))
    try:
        sh.adjustments[0] = radius
    except Exception:
        pass
    sh.fill.solid()
    sh.fill.fore_color.rgb = fill
    if line_color is None:
        sh.line.fill.background()
    else:
        sh.line.color.rgb = line_color
        sh.line.width = Pt(line_w)
    no_shadow(sh)
    return sh


def oval(slide, x, y, d, fill):
    c = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    c.fill.solid()
    c.fill.fore_color.rgb = fill
    c.line.fill.background()
    no_shadow(c)
    return c


def arrow(slide, x1, y1, x2, y2, color=BLUE, w=1.75):
    conn = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, Inches(x1), Inches(y1),
                                      Inches(x2), Inches(y2))
    conn.line.color.rgb = color
    conn.line.width = Pt(w)
    ln = conn.line._get_or_add_ln()
    tail = etree.SubElement(ln, qn('a:tailEnd'))
    tail.set('type', 'triangle')
    tail.set('w', 'med')
    tail.set('len', 'med')
    for st in conn._element.findall(qn('p:style')):
        conn._element.remove(st)
    return conn


def pill(slide, x, y, t, filled=True):
    sh = rect(slide, x, y, 0.72, 0.3, BLUE if filled else WHITE,
              None if filled else NAVY, radius=0.5)
    text(slide, x, y + 0.045, 0.72, 0.22, t, 10, True, WHITE if filled else NAVY,
         PP_ALIGN.CENTER)
    return sh


def card(slide, x, y, w, h, title, body, style='white', tsize=12, bsize=10, leading=1.12):
    fill = WHITE if style == 'white' else LAVEND
    border = NAVY if style == 'white' else BLUE
    rect(slide, x, y, w, h, fill, border)
    text(slide, x + 0.15, y + 0.1, w - 0.3, 0.3, title, tsize, True, BLUE)
    tb = slide.shapes.add_textbox(Inches(x + 0.15), Inches(y + 0.42), Inches(w - 0.3),
                                  Inches(h - 0.52))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    first = True
    for line in (body if isinstance(body, list) else [body]):
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.line_spacing = leading
        p.space_after = Pt(3)
        r = p.add_run()
        r.text = line
        lato(r, bsize, False, NAVY)


def section_label(slide, x, y, w, t, color=BLUE):
    tcol = NAVY if color == YELLOW else WHITE
    rect(slide, x, y, w, 0.35, color, None, radius=0.5)
    text(slide, x, y + 0.045, w, 0.28, t, 11, True, tcol, PP_ALIGN.CENTER)


def brand_icon(slide, x=0.3, y=7.08, color=BLUE):
    for xi in (x, x + 0.24, x + 0.48, x + 0.82):
        oval(slide, xi, y, 0.18, color)


def content_slide(title1, title2, page):
    s = prs.slides.add_slide(BLANK)
    rect(s, -0.1, -0.1, 13.55, 7.7, WHITE, None, radius=0.0)
    circ = oval(s, 11.5, -2.2, 4.5, NAVY)                   # navy corner circle
    text(s, 0.25, 0.04, 11.0, 0.18, HEADER, 7, False, NAVY)
    s.shapes.add_picture(LOGO_WHITE, Inches(11.55), Inches(0.33), width=Inches(1.5))
    rect(s, 0.25, 0.54, 1.794, 0.30, YELLOW, None, radius=0.5)
    tb = s.shapes.add_textbox(Inches(0.3), Inches(0.40), Inches(11.0), Inches(0.55))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.LEFT
    r1 = p.add_run(); r1.text = title1; lato(r1, 20, True, NAVY)
    r2 = p.add_run(); r2.text = title2; lato(r2, 20, True, BLUE)
    brand_icon(s)
    text(s, 1.5, 7.16, 10.0, 0.2, FOOTER, 7, False, NAVY, PP_ALIGN.CENTER)
    text(s, 12.8, 7.16, 0.4, 0.2, str(page), 8, False, NAVY, PP_ALIGN.RIGHT)
    return s


def pic(slide, path, x, y, w):
    b = open(path, 'rb').read(33)
    pw, ph = struct.unpack('>II', b[16:24])
    slide.shapes.add_picture(path, Inches(x), Inches(y), width=Inches(w),
                             height=Inches(w * ph / pw))
    return w * ph / pw


# ========== Slide 1 — the journey decides the salary flow, not the customer ==========
s = content_slide('The journey ', 'decides the salary flow, not the customer', 1)

# question cards (navy)
rect(s, 0.5, 1.3, 3.25, 1.35, NAVY, None)
oval(s, 0.68, 1.46, 0.34, YELLOW)
text(s, 0.68, 1.5, 0.34, 0.26, '1', 13, True, NAVY, PP_ALIGN.CENTER)
text(s, 1.14, 1.42, 2.5, 0.75, 'Is the salary already credited at the bank?', 12.5, True, WHITE, leading=1.05)
text(s, 0.68, 2.2, 2.92, 0.4, 'Read from the bank’s ETL salary credits for an existing customer.',
     9, False, WHITE, leading=1.05)

rect(s, 0.5, 3.5, 3.25, 1.35, NAVY, None)
oval(s, 0.68, 3.66, 0.34, YELLOW)
text(s, 0.68, 3.7, 0.34, 0.26, '2', 13, True, NAVY, PP_ALIGN.CENTER)
text(s, 1.14, 3.62, 2.5, 0.75, 'Will the customer move the salary?', 12.5, True, WHITE, leading=1.05)
text(s, 0.68, 4.4, 2.92, 0.4, 'The “Transfer my salary to Reem Bank” toggle.',
     9, False, WHITE, leading=1.05)

# connectors + YES/NO pills
arrow(s, 2.12, 2.65, 2.12, 3.5, NAVY)
pill(s, 1.76, 2.92, 'NO', filled=False)
arrow(s, 3.75, 1.97, 5.15, 1.97, BLUE)
pill(s, 4.09, 1.82, 'YES')
arrow(s, 3.75, 4.17, 5.15, 4.17, BLUE)
pill(s, 4.09, 4.02, 'YES')
arrow(s, 3.3, 4.85, 5.15, 5.45, NAVY)
pill(s, 4.09, 5.0, 'NO', filled=False)

# outcome cards
rect(s, 5.15, 1.3, 4.3, 1.5, LAVEND, BLUE)
text(s, 5.35, 1.42, 3.9, 0.35, [[('STL', 16, True, BLUE), ('   Salary transfer', 12, True, NAVY)]])
text(s, 5.35, 1.82, 3.95, 0.9,
     [[('Journey: ', 9.5, True, NAVY), ('“Salary account verified” replaces the transfer question; treated as STL.', 9.5, False, NAVY)],
      [('Bank: ', 9.5, True, NAVY), ('account validated, salary-transfer pricing, disbursed.', 9.5, False, NAVY)]],
     leading=1.1)

rect(s, 5.15, 3.0, 4.3, 1.6, NAVY, None)
text(s, 5.35, 3.13, 3.9, 0.35, [[('FSTL', 16, True, YELLOW), ('   Future salary transfer', 12, True, WHITE)]])
text(s, 5.35, 3.55, 3.95, 0.95,
     [[('Journey: ', 9.5, True, WHITE), ('customer opts in and signs the salary-transfer letter in the journey.', 9.5, False, WHITE)],
      [('Bank: ', 9.5, True, WHITE), ('held with flags until the salary lands, then disbursed.', 9.5, False, WHITE)]],
     leading=1.1)

rect(s, 5.15, 4.8, 4.3, 1.5, LAVEND, BLUE)
text(s, 5.35, 4.92, 3.9, 0.35, [[('NSTL', 16, True, BLUE), ('   No salary transfer', 12, True, NAVY)]])
text(s, 5.35, 5.32, 3.95, 0.9,
     [[('Journey: ', 9.5, True, NAVY), ('salary stays at the current bank; no transfer letter.', 9.5, False, NAVY)],
      [('Bank: ', 9.5, True, NAVY), ('priced and processed as a non-salary-transfer product.', 9.5, False, NAVY)]],
     leading=1.1)

text(s, 0.5, 6.5, 8.9, 0.3,
     'The salary flag travels with every application to the bank’s Ops and Fulfillment queues.',
     10, False, NAVY, italic=True)

# real journey screen (toggle ON)
ph = pic(s, os.path.join(DECKA, 'shot_on.png'), 9.85, 1.15, 2.32)
text(s, 9.6, 1.15 + ph + 0.06, 2.85, 0.4,
     [[('Question 2 in the journey. ', 9.5, True, NAVY), ('Toggle ON sets FSTL.', 9.5, False, NAVY)]],
     align=PP_ALIGN.CENTER)

# ================= Slide 2 — business context & client cases =================
s = content_slide('Business ', 'Context & Client Cases', 2)
text(s, 0.5, 1.02, 10.6, 0.6,
     'Salary-transfer pricing needs the salary at Reem Bank. Today the journey knows only NSTL — '
     'detected salaries, future transfers and clients without an account all fall out. The backend now '
     'classifies every applicant before the screen renders and asks only what it cannot derive.',
     11.5, False, NAVY, leading=1.15)
CASES = [
    ('C1 — New to bank',
     ['Toggle ON → FSTL · asks the 1st salary credit date.',
      'Fulfilment: CIF + account + IBAN created, then the loan or card.']),
    ('C2 — Salary already credits to Reem (detected)',
     ['Toggle stays visible, relabelled · asks nothing — date, account and IBAN are already with the bank.',
      'Releases at creation — no letter, no hold.']),
    ('C3 — Has an account, salary elsewhere',
     ['Toggle ON → FSTL · asks the 1st salary credit date.',
      'Existing account reused — the letter carries its IBAN.']),
    ('C4 — Reem client without an account',
     ['Toggle ON → FSTL · asks the 1st salary credit date.',
      'Account created along the way at fulfilment — previously a dead end.']),
]
pos = [(0.5, 1.75), (6.9, 1.75), (0.5, 3.35), (6.9, 3.35)]
for (t, b), (x, y) in zip(CASES, pos):
    card(s, x, y, 5.9, 1.45, t, b, 'lavender' if t.startswith('C4') else 'white')
card(s, 0.5, 5.0, 12.3, 1.1, 'Design anchor',
     ['A parallel application invalidates the one in progress — so the customer is never sent out of the '
      'journey to open an account first. NSTL (toggle OFF) keeps today’s flow untouched: salaried IBAN, '
      'direct debit, immediate disbursal.'], 'white', bsize=11)
text(s, 0.5, 6.3, 12.3, 0.4,
     'Asked on the journey: expected 1st salary credit date (FSTL only) · salaried IBAN + disbursement '
     'account (NSTL only) · everything else is detected or derived.', 10, True, BLUE)

# ================= Slide 3 — workflow & backend updates =================
s = content_slide('Workflow ', '& Backend Updates', 3)
card(s, 0.5, 1.15, 6.0, 1.62, 'Personal Loan — workflow v2.0',
     ['Salary-type fork after acceptance → FSTL chain 15.1–15.7:',
      'CIF → account + IBAN (one call) → loan booked with funds held → letter → Ops validate → '
      'salary watcher → release. NSTL/DDA chain unchanged.'])
card(s, 0.5, 2.92, 6.0, 1.45, 'Credit Card — workflow v1.7',
     ['Fork after Account Creation (NI) → chain 17.1–17.6:',
      'account + IBAN → card created INACTIVE → letter → validate → watcher → activate with STL '
      'pricing & limit.'])
h = pic(s, os.path.join(BRDA, 'Flow_STL_Statuses.png'), 0.5, 4.62, 6.0)
text(s, 0.5, 4.62 + h + 0.06, 6.0, 0.3,
     'New portal statuses — letter reminders D7 · 10 · 13 · 26, cut-off D28, offer expiry D30',
     9, False, NAVY, PP_ALIGN.CENTER)
pic(s, os.path.join(BRDA, 'PL_FSTL_Fulfilment.png'), 1.15, 5.52, 4.7)

section_label(s, 6.9, 1.15, 3.4, 'BACKEND LOGIC — THE FIVE RULES', BLUE)
CHIPS = [
    ('Detect before render', 'T/T-1 salary credit on own account · bureau IBAN match · products list for has-account'),
    ('Account + IBAN first', 'one core call returns both — before the loan or card is booked'),
    ('Hold & release', 'letter validated AND first salary credit detected — never one alone'),
    ('Repayment', 'standing instruction from the Reem account · DDA stays NSTL-only'),
    ('Nothing asked twice', 'no IBAN on FSTL/STL · grace derived, tuned once on the offer'),
]
cy = 1.72
for i, (lead, rest) in enumerate(CHIPS):
    rect(s, 6.9, cy, 5.9, 0.82, LAVEND, BLUE, radius=0.22)
    oval(s, 7.08, cy + 0.25, 0.32, BLUE)
    text(s, 7.08, cy + 0.29, 0.32, 0.26, str(i + 1), 12, True, WHITE, PP_ALIGN.CENTER)
    text(s, 7.55, cy + 0.1, 5.1, 0.62,
         [[(lead + '  ', 12.5, True, NAVY), ('— ' + rest, 10.5, False, NAVY)]],
         leading=1.08, anchor=MSO_ANCHOR.MIDDLE)
    cy += 0.95

# ================= Slide 4 — journey screens & open questions =================
s = content_slide('Customer ', 'Journey & Open Questions', 4)
text(s, 0.5, 1.08, 4.6, 0.3, 'The live details screen (step 5/8)', 11, True, BLUE)
ph1 = pic(s, os.path.join(DECKA, 'shot_on.png'), 0.6, 1.45, 1.62)
pic(s, os.path.join(DECKA, 'shot_off.png'), 2.72, 1.45, 1.62)
text(s, 0.36, 1.45 + ph1 + 0.1, 2.1, 0.6,
     ['Toggle ON — salary credit', 'date sets the 1st instalment'], 8.5, False, NAVY, PP_ALIGN.CENTER, leading=1.1)
text(s, 2.48, 1.45 + ph1 + 0.1, 2.1, 0.6,
     ['Toggle OFF — salaried IBAN', 'for the direct debit (as today)'], 8.5, False, NAVY, PP_ALIGN.CENTER, leading=1.1)
card(s, 0.5, 6.0, 4.3, 1.0, 'FSTL adds one step — the letter',
     ['The salary-transfer letter is uploaded inside the journey; Ops validate it before '
      'release. Reminders D7 · 10 · 13 · 26 — cut-off D28.'], 'lavender', bsize=9.5)

section_label(s, 5.4, 1.15, 4.6, 'OPEN QUESTIONS FOR REEM BANK', BLUE)
card(s, 5.4, 1.65, 7.4, 3.75, 'Appro proposal sits in BRD §10 — confirming it is enough to proceed',
     ['1.  Funds hold / release mechanism at booking — CORE',
      '2.  Debit card for the account created along the way — CARDS',
      '3.  Standing instruction for STL repayment — CORE',
      '4.  Confirm: no security cheque, any variant — CREDIT POLICY',
      '5.  Arabic copy: toggle, letter, five client emails — BUSINESS',
      '6.  Letter validation SLA in the 28-day window — OPERATIONS',
      '7.  C2 with toggle OFF — repayment account — BUSINESS'], 'white', bsize=12, leading=1.5)
card(s, 5.4, 5.6, 7.4, 1.3, 'Super Portal',
     ['Application Details adds Salary Type · Case C1–C4 · Grace Days · 1st Instalment Date · Letter '
      'status; one audit entry per salary-transfer event; letter validated in the Sales/Ops queue, '
      'release by Disbursement Maker–Checker.'], 'lavender', bsize=10.5)

# ================= Appendix — the three workflows, one per slide =================
BRDA = os.path.join(REPO, 'docs/brd/stl_cc_pl/assets')
APPX = [
    dict(t='A — Personal Loan workflow v2.0 (STL integrated)',
         img=os.path.join(REPO, 'docs/workflow/personal_loan/assets/pl_v2.png'),
         chain=os.path.join(BRDA, 'PL_FSTL_Fulfilment.png'),
         chg=('What v2.0 adds to the base journey',
              ['•  Salary-transfer toggle + STL / FSTL / NSTL classification on the details step; '
               'salaried IBAN asked only when the toggle is OFF (NSTL).',
               '•  Repayment account + IBAN created before the loan; booking held, salary-transfer '
               'letter uploaded inside the journey.',
               '•  Release when the letter is validated AND the first salary lands — chain 15.1–15.7, '
               'zoomed below.']),
         cap='Full journey map (zoom in, or open the editable master: '
             'Reem_Finance_Personal_Loan_Workflow_v2.0.drawio) · DDA / NSTL base journey unchanged'),
    dict(t='B — Credit Card workflow v1.7 (STL integrated)',
         img=os.path.join(REPO, 'docs/workflow/cc_ntb/assets/cc_v17.png'),
         chain=os.path.join(BRDA, 'CC_FSTL_Fulfilment.png'),
         chg=('What v1.7 adds to the base journey',
              ['•  Same toggle + classification; the salary-type fork sits after Account Creation (NI).',
               '•  Card issued INACTIVE with the salary-credit watcher on — chain 17.1–17.6, zoomed below.',
               '•  Card activates when the letter is validated AND the first salary credit arrives.']),
         cap='Full journey map (zoom in, or open the editable master: '
             'Reem_Finance_CC_Workflow_v1.7.drawio) · NSTL base journey unchanged'),
    dict(t='C — Salary Transfer agreed flow on one page',
         img=os.path.join(REPO, 'docs/workflow/pl_stl/assets/pl_stl_summary.png'),
         chain=None, chg=None,
         cap='The journey decision model (one toggle, four cases) and the fulfilment chain with the core '
             'service steps — APIs verified against MW spec v4.5 · master: '
             'Reem_Finance_PL_STL_Flow_Summary_v0.1.drawio'),
]
from PIL import Image as PILImage

page = 5
for ap in APPX:
    s = content_slide('Appendix ', ap['t'], page)
    im = PILImage.open(ap['img'])
    pw, phh = im.size
    if ap['chain']:
        # Panorama: full-width reference map on top, zoomed FSTL chain + change card below.
        w = 12.5
        h = w * phh / pw
        s.shapes.add_picture(ap['img'], Inches(0.4 + (12.53 - w) / 2), Inches(1.22),
                             width=Inches(w), height=Inches(h))
        y = 1.22 + h + 0.14
        section_label(s, 0.5, y, 5.0, 'NEW — FSTL FULFILMENT CHAIN (ZOOM)', BLUE)
        cy = y + 0.44
        ch = min(1.95, 6.58 - cy)
        cw2, ch2 = PILImage.open(ap['chain']).size
        cw = ch * cw2 / ch2
        s.shapes.add_picture(ap['chain'], Inches(0.5), Inches(cy), width=Inches(cw), height=Inches(ch))
        tt, lines = ap['chg']
        cx = 0.5 + cw + 0.3
        card(s, cx, cy, 12.9 - cx, ch, tt, lines, 'lavender', bsize=9.5)
    else:
        ratio = phh / pw
        w, maxh = 12.5, 5.4
        h = w * ratio
        if h > maxh:
            h = maxh
            w = h / ratio
        s.shapes.add_picture(ap['img'], Inches(0.4 + (12.53 - w) / 2), Inches(1.2 + (5.4 - h) / 2),
                             width=Inches(w), height=Inches(h))
    text(s, 0.5, 6.72, 12.3, 0.35, ap['cap'], 9.5, False, NAVY, PP_ALIGN.CENTER, italic=True)
    page += 1

prs.save(OUT)
print('written', OUT)
