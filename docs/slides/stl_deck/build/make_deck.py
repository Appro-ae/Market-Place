"""Appro-standard PPTX — Salary Transfer (CC + PL) design update, 4 slides.

Yellow-led template per the Appro branding guidelines (2026-05-18): light-lavender
cover with the navy corner circle, white content slides with the yellow-pill
two-tone title, confidentiality header/footer, 4-circle brand icon, Lato only,
5-colour palette only. Logo: width-only placement (aspect preserved); the white
wordmark is used top-right where it sits on the navy corner circle (contrast rule).

    python3 build/make_deck.py
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from lxml import etree

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REPO = '/home/user/Market-Place'
BRDA = os.path.join(REPO, 'docs/brd/stl_cc_pl/assets')
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
    # drop the <p:style> block too — its effectRef re-applies the theme shadow in renderers
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
         wrap=True, leading=None):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    first = True
    for line in (lines if isinstance(lines, list) else [lines]):
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = align
        if leading:
            p.line_spacing = leading
        if isinstance(line, list):          # [(txt, size, bold, color), ...] runs
            for t, s, b, c in line:
                lato(p.add_run(), 0, 0)     # placeholder never used
        else:
            r = p.add_run()
            r.text = line
            lato(r, size, bold, color)
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
    tb = slide.shapes.add_textbox(Inches(x), Inches(y + 0.045), Inches(w), Inches(0.28))
    tf = tb.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = t
    lato(r, 11, True, tcol)


def brand_icon(slide, x=0.3, y=7.08, color=BLUE):
    for xi in (x, x + 0.24, x + 0.48, x + 0.82):
        c = slide.shapes.add_shape(MSO_SHAPE.OVAL, Inches(xi), Inches(y),
                                   Inches(0.18), Inches(0.18))
        c.fill.solid()
        c.fill.fore_color.rgb = color
        c.line.fill.background()
        no_shadow(c)


def content_slide(title1, title2, page):
    s = prs.slides.add_slide(BLANK)
    rect(s, -0.1, -0.1, 13.55, 7.7, WHITE, None, radius=0.0)          # white bg
    circ = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(11.5), Inches(-2.2),
                              Inches(4.5), Inches(4.5))               # navy corner circle
    circ.fill.solid()
    circ.fill.fore_color.rgb = NAVY
    circ.line.fill.background()
    no_shadow(circ)
    text(s, 0.25, 0.04, 11.0, 0.18, HEADER, 7, False, NAVY)
    s.shapes.add_picture(LOGO_WHITE, Inches(11.55), Inches(0.33), width=Inches(1.5))
    rect(s, 0.25, 0.54, 1.794, 0.30, YELLOW, None, radius=0.5)        # fixed pill
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
    import struct
    b = open(path, 'rb').read(33)
    pw, ph = struct.unpack('>II', b[16:24])
    slide.shapes.add_picture(path, Inches(x), Inches(y), width=Inches(w),
                             height=Inches(w * ph / pw))
    return w * ph / pw


# ================= Slide 1 — cover (light lavender, navy circle) =================
s = prs.slides.add_slide(BLANK)
rect(s, -0.1, -0.1, 13.55, 7.7, LAVEND, None, radius=0.0)
circ = s.shapes.add_shape(MSO_SHAPE.OVAL, Inches(10.3), Inches(4.5), Inches(6.0), Inches(6.0))
circ.fill.solid(); circ.fill.fore_color.rgb = NAVY
circ.line.fill.background(); no_shadow(circ)
s.shapes.add_picture(LOGO_NAVY, Inches(0.8), Inches(1.2), width=Inches(2.2))
text(s, 0.8, 2.05, 4.5, 0.35, 'Onboarding Powerhouse', 14, True, NAVY)
text(s, 0.8, 2.65, 7.6, 1.5, 'Salary Transfer —\nCredit Card & Personal Loan'.split('\n'),
     28, True, NAVY, leading=1.05)
text(s, 0.8, 4.15, 7.4, 0.9,
     'Design update: one toggle, four customer cases,\nthe account created along the way'.split('\n'),
     18, False, BLUE, leading=1.1)
text(s, 0.8, 5.35, 6.0, 0.3, 'Appro Onboarding Solutions FZ-LLC', 11, False, NAVY)
text(s, 0.8, 7.1, 4.0, 0.25, 'V1.0  ·  04 November 2026', 11, False, NAVY)

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
h2 = pic(s, os.path.join(BRDA, 'PL_FSTL_Fulfilment.png'), 1.15, 5.52, 4.7)
section_label(s, 6.9, 1.15, 3.4, 'BACKEND LOGIC UPDATES', BLUE)
card(s, 6.9, 1.65, 5.9, 2.5, 'Decision & data rules',
     ['Classification before render: own-account salary credit in T / T-1 (primary), bureau IBAN match '
      '(confirmatory), products list for has-account.',
      'No IBAN question on FSTL/STL — the salaried IBAN and the disbursement choice belong to NSTL only.',
      'Grace is derived from the salary date and adjusted once, on the offer, within pricing-matrix bounds.'])
card(s, 6.9, 4.3, 5.9, 2.5, 'Fulfilment rules',
     ['Order rule: the account and IBAN exist before the loan or card — the settlement fields and the '
      'letter need them; one core call returns both.',
      'Release condition: letter validated AND the first salary credit detected by the account-'
      'transactions watcher — never one alone.',
      'Repayment: STL/FSTL by standing instruction from the Reem account — no DDA; NSTL keeps the DDA.'])

# ================= Slide 4 — journey, portal & open questions =================
s = content_slide('Customer ', 'Journey & Open Questions', 4)
shots = [('SC1_Details_Salary_Toggle_FSTL.png', 'Toggle + salary date\n(FSTL — C1/C3/C4)'),
         ('SC2_Details_C2_Nothing_Asked.png', 'C2 detected —\nnothing asked'),
         ('SC4_Offer_Grace_Period.png', 'Grace on the offer,\nsalary-aligned default')]
for i, (f, cap) in enumerate(shots):
    x = 0.5 + i * 1.52
    pic(s, os.path.join(BRDA, f), x, 1.2, 1.38)
    text(s, x - 0.06, 4.24, 1.5, 0.5, cap.split('\n'), 8.5, False, NAVY, PP_ALIGN.CENTER)
card(s, 0.5, 4.95, 4.58, 1.95, 'Super Portal',
     ['Application Details adds: Salary Type · Case C1–C4 · Grace Days · 1st Instalment Date · Letter status.',
      'One structured audit entry per salary-transfer event.',
      'Letter validated in the Sales/Ops queue; release by Disbursement Maker–Checker.'], 'lavender')
section_label(s, 5.4, 1.15, 4.6, 'OPEN QUESTIONS FOR REEM BANK', BLUE)
card(s, 5.4, 1.65, 7.4, 3.9, 'Appro proposal sits in BRD §10 — confirming it is enough to proceed',
     ['1.  Funds hold / release mechanism at booking — CORE',
      '2.  Debit card for the account created along the way — CARDS',
      '3.  Standing instruction for STL repayment — CORE',
      '4.  Confirm: no security cheque, any variant — CREDIT POLICY',
      '5.  Arabic copy: toggle, letter, five client emails — BUSINESS',
      '6.  Letter validation SLA in the 28-day window — OPERATIONS',
      '7.  C2 with toggle OFF — repayment account — BUSINESS'], 'white', bsize=11.5, leading=1.3)
card(s, 5.4, 5.75, 7.4, 1.15, 'Where everything lives',
     ['Workflows v2.0 / v1.7 (draw.io masters + renders) · clickable prototype v6 · '
      'BRD_Salary_Transfer_CC_PL_V1.0 (Word + PDF + screens pack) · one-page summary slide.'],
     'lavender', bsize=10.5)

prs.save(OUT)
print('written', OUT)
