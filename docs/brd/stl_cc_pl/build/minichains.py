"""Standalone FSTL fulfilment chain figures for the BRD (house drawio style).

    python3 minichains.py && render via render_any.js
"""
import os, sys
WF = '/home/user/Market-Place/docs/workflow'
sys.path.insert(0, os.path.join(WF, '_build'))
from wflib import Flow, MAIL

HERE = os.path.dirname(os.path.abspath(__file__))


def pl():
    F = Flow('pl-fstl-mini')
    y1, y2, w, h = 40, 230, 230, 80
    xs = [40, 330, 620, 910]
    F.node('a', '<b>15.1</b> CIF Creation (T24 Core)<br><i>C1 only — ETB skips</i>', xs[0], y1, w, h, 'pink', fs=10)
    F.node('b', '<b>15.2</b> Salary CASA + IBAN — one call returns account + IBAN<br><i>C1 ON · C4</i>', xs[1], y1, w, h, 'pink', fs=10)
    F.node('c', '<b>15.3</b> Loan Creation — settlement = salary CASA · <b>funds held</b>', xs[2], y1, w, h, 'pink', fs=10)
    F.node('d', '<b>15.4</b> Salary-transfer letter with IBAN — upload in-journey', xs[3], y1, w, h, fs=10)
    F._add(None, '', MAIL, xs[3] + w - 30, y1 + 6, 26, 17)
    F.node('e', '<b>15.5</b> Ops validate letter (Sales Queue)', xs[3], y2, w, h, 'purple', fs=10)
    F.hand(xs[3] + 4, y2 + 4)
    F.node('f', '<b>15.6</b> Salary credit watcher — poll until 1st salary credit', xs[2], y2, w, h, 'purple', fs=10)
    F.node('g', '<b>15.7</b> Release funds — STL pricing confirmed', xs[1], y2, w, h, 'green', fs=10)
    F.round('z', 'Complete', xs[0] + 75, y2 + 5, 70)
    F.term('t', xs[3] + w + 60, y2 + 22, label='Auto Terminate', icons=False,
           note='no letter by day 28 — expiry day 30')
    F.edge('a', 'b'); F.edge('b', 'c'); F.edge('c', 'd')
    F.edge('d', 'e', exit=(0.5, 1), entry=(0.5, 0))
    F.edge('e', 'f'); F.edge('f', 'g'); F.edge('g', 'z')
    F.edge('e', 't', label='day 28 / 30', dashed=True)
    F.note(None, '<b>C2 (salary already credits):</b> settles to the existing CASA, funds release at creation — letter, hold and watcher do not apply. <b>NSTL:</b> chain unchanged (repayment account · loan · DDA · immediate disbursal).',
           40, 360, 1100, 54, fs=9, dashed=False)
    F.save(os.path.join(HERE, '.pl_mini.drawio'))


def cc():
    F = Flow('cc-fstl-mini')
    y1, y2, w, h = 40, 230, 230, 80
    xs = [40, 330, 620, 910]
    F.node('a', '<b>17.1</b> Salary CASA + IBAN (T24 Core) — one call<br><i>C1 ON · C4</i>', xs[0], y1, w, h, 'pink', fs=10)
    F.node('b', '<b>17.2</b> Card Creation (NI) — card <b>INACTIVE</b>', xs[1], y1, w, h, 'pink', fs=10)
    F.node('c', '<b>17.3</b> Salary-transfer letter with IBAN — upload in-journey', xs[2], y1, w, h, fs=10)
    F._add(None, '', MAIL, xs[2] + w - 30, y1 + 6, 26, 17)
    F.node('d', '<b>17.4</b> Ops validate letter (Sales Queue)', xs[3], y1, w, h, 'purple', fs=10)
    F.hand(xs[3] + 4, y1 + 4)
    F.node('e', '<b>17.5</b> Salary credit watcher — poll until 1st salary credit', xs[3], y2, w, h, 'purple', fs=10)
    F.node('f', '<b>17.6</b> Activate card — STL pricing &amp; limit confirmed', xs[2], y2, w, h, 'green', fs=10)
    F.round('z', 'Complete', xs[1] + 75, y2 + 5, 70)
    F.term('t', xs[3] + w + 60, y1 + 22, label='Auto Terminate', icons=False,
           note='no letter by day 28 — expiry day 30')
    F.edge('a', 'b'); F.edge('b', 'c'); F.edge('c', 'd')
    F.edge('d', 'e', exit=(0.5, 1), entry=(0.5, 0))
    F.edge('e', 'f'); F.edge('f', 'z')
    F.edge('d', 't', label='day 28 / 30', dashed=True)
    F.note(None, '<b>Before the fork:</b> CIF (T24/NI), account (NI) run as today for every case. <b>C2:</b> card ACTIVE at creation with STL pricing. <b>NSTL:</b> card created active, as today.',
           40, 360, 1100, 54, fs=9, dashed=False)
    F.save(os.path.join(HERE, '.cc_mini.drawio'))


pl()
cc()
