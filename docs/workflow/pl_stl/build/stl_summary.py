"""PL Salary Transfer (STL/FSTL) — agreed flow summary, one page.

Band A: the journey decision model (one toggle, four customer cases).
Band B: the fulfilment chain — "create the CASA along the way" — annotated with
the real Middleware endpoints and product codes verified against
REEM Middleware API Specification v4.5 (03/11).
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '_build'))
from wflib import Flow, MAIL  # noqa: E402

f = Flow('pl-stl-summary')

# ---------------------------------------------------------------- title block
f.label(None, 'Reem Finance — Personal Loan · Salary Transfer (STL / FSTL) — '
        'Agreed Flow Summary', 40, 14, 1600, 30, fs=16, align='left', bold=True)
f.label(None, 'v0.1 · 03 Nov 2026 · PO design decisions 28/10–03/11 · every API name and '
        'product code verified against REEM Middleware API Specification v4.5',
        40, 44, 1600, 20, fs=10, align='left', color='#595959')

# ---------------------------------------------------------------- band A
f.label(None, 'A — CUSTOMER JOURNEY · one toggle, four cases', 40, 94, 800, 22,
        fs=12, align='left', bold=True)

f.round('start', 'Start', 40, 172, d=50)
f.node('j1', 'EID scan → Pre-dedupe / Dedupe<br><b>NTB or ETB?</b>',
       130, 150, 230, 100, badge='J1')
f.node('j2', '<b>BE classification (silent, before the toggle renders)</b><br>'
       'has CASA? — /api/T24/getCustProdListingNest<br>'
       'salary credit in T / T-1? — /api/T24/getCustAccountTransactions<br>'
       'AECB IBAN match — confirmatory',
       420, 135, 360, 130, kind='purple', badge='J2', fs=10,
       extra='align=left;spacing=8;')
f.node('j3', '<b>Salary-transfer toggle</b> — stays in the details screen<br>'
       '(no screen-1 gate · no eject-to-home)',
       840, 150, 300, 100, kind='green', badge='J3')
f.diamond('case', 'Which<br>case?', 1210, 125, 150, 150)

f.edge('start', 'j1')
f.edge('j1', 'j2')
f.edge('j2', 'j3')
f.edge('j3', 'case')

# case cards --------------------------------------------------------------
CW, CH, CY = 450, 200, 390
cases = [
    ('c1', 120, 'step',
     '<b>C1 — NTB · no Reem relationship</b><br><br>'
     'Toggle ON → <b>FSTL</b> — ask: expected 1st salary credit date<br>'
     'Toggle OFF → <b>NSTL</b> — ask: salary IBAN (external)<br><br>'
     '<i>Fulfilment: create CIF + CASA + IBAN</i>'),
    ('c2', 610, 'step',
     '<b>C2 — ETB · has CASA · salary already credits (T / T-1)</b><br><br>'
     'Toggle ON → <b>STL confirmed</b> — ask nothing, all data with bank<br>'
     'Copy: “Salary already credits to Reem — STL pricing applied”<br><br>'
     '<i>Fulfilment: loan to existing CASA — no letter, no hold</i>'),
    ('c3', 1100, 'step',
     '<b>C3 — ETB · has CASA · no qualifying salary credit</b><br><br>'
     'Toggle ON → <b>FSTL</b> — ask: expected 1st salary credit date<br>'
     'Toggle OFF → <b>NSTL</b> — ask: salary IBAN (external)<br><br>'
     '<i>Fulfilment: reuse existing CASA — letter carries existing IBAN</i>'),
    ('c4', 1590, 'yellow',
     '<b>C4 — ETB · no CASA (loan / card-only customer)</b><br><br>'
     'Toggle ON → <b>FSTL</b> — ask: expected 1st salary credit date<br>'
     'Toggle OFF → <b>NSTL</b> — ask: salary IBAN (external)<br><br>'
     '<i>Fulfilment: <b>create CASA along the way</b> — AGREED 03/11; '
     'no eject-to-home (a second application would invalidate this one, RF-1718)</i>'),
]
for key, x, kind, text in cases:
    f.node(key, text, x, CY, CW, CH, kind=kind, badge=key.upper(), fs=10,
           extra='align=left;spacing=10;')
    cx = x + CW / 2
    f.edge('case', key, exit=(0.5, 1), entry=(0.5, 0),
           points=[(1285, 340), (cx, 340)])

f.note(None, '<b>Asked vs derived:</b> expected 1st salary credit date — asked on FSTL only · '
       'salary IBAN — asked on NSTL only · grace period / 1st EMI date — <b>derived</b> from '
       'the salary credit date, never asked · NTB/ETB, has-CASA, qualifying credit — detected '
       'by BE, never asked', 520, 630, 1520, 46, fs=9)

# ---------------------------------------------------------------- band B
f.label(None, 'B — FULFILMENT · create the CASA along the way (FSTL)', 40, 722, 1000, 22,
        fs=12, align='left', bold=True)

FW, FH, FY = 250, 140, 770
chain = [
    ('f1', 40, 'green',
     '<b>Offer accepted —<br>application submitted</b><br><br>'
     'pricing locked to case + toggle',
     'applies: all cases'),
    ('f2', 330, 'pink',
     '<b>Create CIF</b><br>/api/T24/createCustomerProfile',
     'applies: C1 (NTB) — ETB skips'),
    ('f3', 620, 'pink',
     '<b>Create salary CASA + IBAN — one call</b><br>'
     '/api/T24/createLoanRepaymentAccount<br>'
     'productId = REFN.RET.CURR.ACCOUNT<br>'
     'returns aaaId · arrangementId · accountId · <b>IBAN</b>',
     'applies: C1 ON · C4 — C2 / C3 skip (existing CASA reused)'),
    ('f4', 910, 'pink',
     '<b>Create loan on T24</b><br>/api/T24/createLoan<br>'
     'settlement: payinAccount / payoutAccount = salary CASA',
     'applies: all — funds held on FSTL only; C2 &amp; NSTL disburse immediately'),
    ('f5', 1200, 'step',
     '<b>Salary-transfer letter</b><br>generated with the account IBAN '
     '(new C1/C4 · existing C3) — upload mandatory in-journey',
     'applies: FSTL — reminders D7·10·13·26 · cut-off D28 · expiry D30'),
    ('f6', 1490, 'step',
     '<b>Ops validate letter</b><br>Sales / Ops queue — employer letter checked '
     'against application data',
     'applies: FSTL'),
    ('f7', 1780, 'purple',
     '<b>Salary watcher (BE)</b><br>/api/T24/getCustAccountTransactions<br>'
     'poll the salary CASA until the first salary credit lands',
     'applies: FSTL'),
    ('f8', 2070, 'green',
     '<b>Release funds</b><br>STL pricing confirmed — loan active',
     'applies: FSTL — C2 releases at F4'),
]
prev = None
for key, x, kind, text, chip in chain:
    f.node(key, text, x, FY, FW, FH, kind=kind, badge=key.upper(), fs=10)
    f.label(None, chip, x, FY + FH + 6, FW, 40, fs=8, color='#595959', align='left')
    if prev:
        f.edge(prev, key)
    prev = key
f.round('done', 'Complete', 2360, 805, d=70)
f.edge('f8', 'done')

f._add(None, '', MAIL, 1416, FY + 8, 26, 17)   # letter icon on F5
f.hand(1706, FY + 8)                           # manual queue on F6 (top-right)

f.edge('c1', 'f1', label='submit', lbold=True, exit=(0.1, 1), entry=(0.5, 0))

f.node(None, '<b>Order agreed:</b> account + IBAN are created BEFORE the loan — '
       'createLoan needs a valid T24 settlement account and the letter needs the IBAN. '
       'Sanity check: /api/T24/getIbanStatus on the new IBAN before the letter is issued.',
       620, 964, 540, 64, kind='yellow', fs=9, extra='align=left;spacing=8;')

f.node('nstl', '<b>NSTL (toggle OFF — C1 / C3)</b> · existing PL flow unchanged: repayment '
       'account — /api/T24/createLoanRepaymentAccount · productId = <b>REFN.CA.GEN</b> → '
       '/api/T24/createLoan → DDA e-sign on the external salary IBAN → immediate disbursal '
       '(no hold, no letter)', 330, 1056, 1130, 72, fs=10, extra='align=left;spacing=10;')
f.edge('f1', 'nstl', label='toggle OFF', dashed=True, exit=(0.08, 1), entry=(0, 0.5),
       points=[(60, 1092)])

f.note(None, '<b><font color="#B20000">Open with Middleware / T24 — not found in spec '
       'v4.5</font></b><br>'
       '• Standing-order creation API — FSTL repayment method (INT-1) has no endpoint<br>'
       '• Debit-card creation for the new CASA — only NI CardDetailsEnquiry (read) exists<br>'
       '• Fund-hold / release mechanics — createLoan has settlement fields, no hold flag<br>'
       '• /api/T24/repay is Tabby-SME-scoped — retail PL repayment posting TBC<br>'
       '• WPS rails exist (createInwardWps / createOutwardWps) — option for salary detection',
       1520, 1010, 600, 150, fs=9)

# ---------------------------------------------------------------- legend + footer
LY = 1260
f.node(None, 'Appro BE logic', 40, LY, 120, 30, kind='purple', fs=9)
f.node(None, 'External (T24 via MW)', 170, LY, 140, 30, kind='pink', fs=9)
f.node(None, 'Customer / RF app', 320, LY, 130, 30, kind='green', fs=9)
f.node(None, 'Agreed decision', 460, LY, 120, 30, kind='yellow', fs=9)
f.node(None, 'Step', 590, LY, 80, 30, kind='step', fs=9)
f.node(None, 'Manual queue', 680, LY, 110, 30, kind='step', fs=9)
f.hand(682, LY + 2)
f.label(None, 'Companion to Reem_Finance_Personal_Loan_Workflow_v1.0 — this page summarises '
        'the STL overlay only; the base PL flow (rule engine, queues, DBR, DDA mechanics) is '
        'unchanged.', 40, LY + 50, 1400, 20, fs=9, align='left', color='#595959')

out = os.path.join(os.path.dirname(__file__), '..',
                   'Reem_Finance_PL_STL_Flow_Summary_v0.1.drawio')
f.save(os.path.abspath(out))
