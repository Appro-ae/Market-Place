"""Reem Finance NSTL NTB CC workflow — v1.6, rebuilt as native draw.io from the PO's
latest image (28/10). PO fixes built in: every step badge sits ON its box (top-left
corner), and step 11 is "Biometric & MPIN verification".

    python3 build/cc_ntb.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_build'))
from wflib import Flow

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = Flow('RF-NSTL-NTB-CC-v1.6')

W.label(None, 'Reem Finance NSTL NTB CC workflow', 40, 10, 760, 40, fs=28, color='#1500FF',
        align='left', bold=True)
W.legend(4030, 35)

W.lane('fe', 'Front End', 0, 100, 5060, 380)
W.lane('be', 'BackEnd', 0, 480, 5060, 760)
W.lane('tp', 'Bank Touch points', 0, 1240, 5060, 260)

# ---------------- FRONT END ----------------
FY = 250
W.round('start', 'Start', 70, FY + 10, 50, lane='fe')
W.node('s1', 'RF App Login', 170, FY, 150, 70, 'green', lane='fe', badge='1')
W.node('s2', 'Select Banking Products', 370, FY, 150, 70, 'green', lane='fe', badge='2')
W.node('s3', 'Product Selection as Credit Card', 570, FY, 150, 70, lane='fe', badge='3')
W.node('s4', 'Select Employment Type + Self-declared income', 770, FY, 150, 70, lane='fe', badge='4')
W.node('s5', 'Submit Bureau &amp; PIA, FTS &amp; Marketing consent &amp; T&amp;C', 970, FY, 155, 70, lane='fe', badge='5')
W.node('s6', 'Scan Front EID', 1180, FY, 140, 70, lane='fe', badge='6')
W.node('s7', 'Scan Back EID', 1370, FY, 140, 70, lane='fe', badge='7')
W.node('s8', 'EFR liveliness Check', 1560, FY, 145, 70, lane='fe', badge='8')
W.node('s9', 'KYC Additional Information', 1900, FY, 150, 70, lane='fe', badge='9')
W.node('s11', 'Biometric &amp; MPIN verification', 3000, FY, 150, 70, lane='fe', badge='11')
W.icons(3165, FY - 35, lane='fe')
W.diamond('d_ok', '', 3230, FY + 15, 40, 40, lane='fe')
W.node('s12', 'Approval In Principle, Select Card limit', 3340, FY, 150, 70, lane='fe', badge='12')
W.node('s121', 'Customer declares additional income', 3340, FY + 130, 150, 60, lane='fe', badge='12.1')
W.node('s13', 'Personalize Card', 3560, FY, 140, 70, lane='fe', badge='13')
W.node('s14', 'KFS Signing', 3760, FY, 140, 70, lane='fe', badge='14')
W.node('s15', 'Successfully Submit Application', 3760, FY + 130, 140, 70, lane='fe', badge='15')

W.term('t_geo', 600, 130, label='Geofencing Check', lane='fe')
W.term('t_scan', 1340, 128, label=None, lane='fe')
W.label(None, '<b>If user fails to correctly scan 10 times</b>', 1285, 90, 150, 34, lane='fe', fs=9)
W.label(None, 'Retry EID Scan', 1175, 170, 120, 16, lane='fe', fs=9)
W.term('t_holder', 1605, 128, label=None, lane='fe')
W.label(None, '<b>If righful holder check fails</b>', 1550, 92, 150, 30, lane='fe', fs=9)
W.node('email_risk', 'Email Risk assessment (Lexis nexis)', 1900, 120, 150, 55, 'yellow', lane='fe')
W.note('kyc_note', '1. Home Address<br>2.Additional Nationality declaration<br>3. Business Email /Personal Email',
       1700, 120, 185, 55, lane='fe')
W.term('t_kyc', 2095, FY + 85, label=None, lane='fe')
W.node('s91', 'IBAN Field', 1900, FY + 140, 150, 60, lane='fe', badge='9.1', extra='dashed=1;')
W.term('t_aip', 3385, 130, label='Auto Terminate', icons=False, lane='fe')

W.edge('start', 's1'); W.edge('s1', 's2'); W.edge('s2', 's3'); W.edge('s3', 's4')
W.edge('s4', 's5'); W.edge('s5', 's6'); W.edge('s6', 's7'); W.edge('s7', 's8')
W.edge('s8', 's9')
W.edge('s3', 't_geo')
W.edge('s6', 't_scan', exit=(0.5, 0), points=[(1250, 205)])
W.edge('s7', 't_scan', exit=(0.5, 0), points=[(1440, 205)])
W.edge('s8', 't_holder', exit=(0.5, 0))
W.edge('s9', 'email_risk')
W.edge('s9', 't_kyc', exit=(1, 0.8))
W.edge('s9', 's91', dashed=True)
W.edge('s11', 'd_ok'); W.edge('d_ok', 's12')
W.edge('s12', 't_aip', dashed=True)
W.edge('s12', 's121', dashed=True)
W.edge('s121', 'd_ok', dashed=True, points=[(3250, 475)])
W.edge('s12', 's13'); W.edge('s13', 's14'); W.edge('s14', 's15')

# ---------------- BACKEND: pre-dedupe / dedupe / EastNets ----------------
W.node('ops_note', '1. Credit team will upload Occupation list<br>4/5/7/9. Credit team will share in Credit Criteria<br>8. IT to develop API',
       -300, 740, 250, 90, 'step', fs=10, extra='align=left;')
W.note('pd_note', '1. Existing Application Check (Appro)<br>2. Watchlist (AML Trace Table Mapping)<br>3. Sourcing Profile Check (Occupation)<br>4. Minimum Age check<br>5. Nationality restriction<br>6. EID expiration Check<br>7. CB Hotlist Check<br>8. CB blacklist<br>9. AECB score only check',
       560, 580, 210, 170, lane='be')
W.node('aecb_score', 'AECB Score Check', 950, 600, 140, 60, 'pink', lane='be')
W.node('cb_api', 'CB Blacklist API', 700, 760, 140, 60, 'pink', lane='be')
W.node('predupe', 'Pre-Dedupe Check', 950, 760, 150, 60, 'purple', lane='be', badge='7.1')
W.label(None, '<b>1.Check ETB/NTB</b>', 950, 838, 150, 18, lane='be', fs=9)
W.term('t_pd', 1195, 772, label=None, lane='be')
W.label(None, '<b>Fail</b>', 1118, 762, 60, 16, lane='be', fs=9)
W.node('dedupe', 'Dedupe Check', 1340, 690, 150, 60, 'purple', lane='be', badge='8.0')
W.diamond('d_rel', 'Relation Type?', 1570, 680, 90, 80, lane='be', fs=9)
W.term('t_freeze', 1745, 830, label='Freeze/Block Check', lane='be')
W.label(None, 'ETB &amp;<br>in freeze and block status', 1630, 788, 150, 30, lane='be', fs=8)
W.node('cep', 'Check Existing Product (CC)', 1540, 950, 150, 60, 'purple', lane='be', badge='8.1')
W.label(None, 'ETB &amp;<br>No freeze / block', 1455, 872, 120, 30, lane='be', fs=8)
W.term('t_cep', 1795, 962, label='Failed', lane='be',
       note='(*) Other cases: Applicant applied for CC but they already have all CC products with T24')
W.node('tpq1', 'Transaction Posting Queue', 1960, 950, 150, 60, 'purple', lane='be')
W.label(None, 'Status = Failed after 5 times retrigger automatically', 1945, 800, 175, 55,
        lane='be', fs=9, color='#009900', bold=True)
W.node('aecb', 'AECB', 2160, 680, 150, 70, lane='be', badge='8.2')
W.node('aecb_rep', 'AECB full report', 2160, 560, 150, 55, 'pink', lane='be')
W.note('stp_note', '<b>(*) STP/NSTP classification:<br>- KYC Status = "Compliance Review" -&gt; NSTP<br>- KYC Status = "Approved" -&gt; STP</b>',
       2170, 800, 245, 60, lane='be', dashed=False)
W.node('eastnets', 'EastNets', 2440, 680, 150, 70, lane='be', badge='8.3')
W.diamond('d_kyc', '', 2475, 890, 50, 50, lane='be')
W.node('cq', 'Compliance Queue', 2430, 1000, 150, 60, 'purple', lane='be')
W.hand(2434, 1004, lane='be')
W.icons(2590, 965, lane='be')
W.node('en_cb', 'EastNets API callback', 2430, 1105, 150, 55, 'pink', lane='be')
W.diamond('d_dec', 'make decision', 2680, 995, 80, 80, lane='be', fs=9)
W.term('t_dec', 2702, 1125, label='Failed', lane='be', icons=False)
W.node('cra', 'Credit Risk assessment', 2720, 680, 150, 70, lane='be', badge='8.4')
W.node('aecb_sal', 'AECB Salary', 2950, 680, 150, 70, 'purple', lane='be', badge='8.5')
W.node('iban_api', 'IBAN Verification API', 1900, 560, 150, 60, 'pink', lane='be')
W.node('fts_sal', 'FTS Salary', 2140, 1105, 150, 60, 'purple', lane='be', badge='9.2')

W.edge('s7', 'predupe', color='#0000FF', points=[(1440, 560)])
W.edge('predupe', 's8', label='PASS', exit=(0.5, 0), entry=(0.5, 1),
       points=[(1025, 560), (1632, 560)])
W.edge('predupe', 'aecb_score', color='#0000FF')
W.edge('predupe', 'cb_api', color='#0000FF')
W.edge('cb_api', 'predupe')
W.edge('predupe', 't_pd')
W.edge('dedupe', 'd_rel')
W.edge('d_rel', 'aecb', label='NTB')
W.edge('d_rel', 't_freeze', exit=(0.5, 1), points=[(1615, 845)])
W.edge('d_rel', 'cep', exit=(0.5, 1))
W.edge('cep', 't_cep', label='<b>Fail</b>')
W.edge('cep', 'aecb', label='Pass', exit=(1, 0.2), entry=(0, 0.8), points=[(1750, 735)])
W.edge('eastnets', 'tpq1', exit=(0, 1), entry=(0.5, 0), points=[(2420, 780), (2035, 780)])
W.edge('tpq1', 'eastnets', color='#0000FF', exit=(1, 0.5), entry=(0.3, 1), points=[(2490, 980)])
W.edge('aecb', 'aecb_rep', color='#0000FF')
W.edge('aecb', 'eastnets')
W.edge('eastnets', 'd_kyc')
W.edge('d_kyc', 'cq', label='NSTP', lcolor='#CC00CC', lbold=True)
W.edge('cq', 'en_cb')
W.edge('en_cb', 'd_dec')
W.edge('d_dec', 't_dec', label='reject')
W.edge('d_dec', 'cra', label='approve&nbsp;&nbsp;<font color="#CC00CC"><b>STP</b></font>',
       entry=(0.5, 1), points=[(2880, 1035), (2880, 800)])
W.edge('d_kyc', 'cra', label='<font color="#CC00CC"><b>STP</b></font>', exit=(1, 0.5),
       entry=(0.3, 1), points=[(2770, 915)])
W.edge('cra', 'aecb_sal')
W.edge('s91', 'iban_api', color='#0000FF', dashed=True)
W.edge('iban_api', 'fts_sal', color='#0000FF', dashed=True, entry=(0.5, 0),
       points=[(1975, 1070), (2215, 1070)])

# ---------------- BACKEND: income + decisioning ----------------
W.label(None, 'Finalized Monthly Income', 3180, 565, 220, 20, lane='be', fs=11,
        color='#E700E7', bold=True)
W.node('inc', '', 3180, 600, 300, 320, 'container', lane='be', badge='10')
W.node('inc1', '3M SAL Credit AECB (3months /24 months SAL CREDIT)', 3205, 625, 250, 60, lane='be')
W.node('inc2', 'AECB EMP History', 3205, 715, 250, 60, lane='be')
W.node('inc3', 'Self-declared income', 3205, 805, 250, 60, lane='be')
W.node('mohre', 'MOHRE', 3545, 680, 130, 60, lane='be', badge='10.1')
W.node('calc', 'Calculate Finalized Income', 3545, 800, 150, 60, lane='be', badge='10.2')
W.node('minin', 'Min income check &lt;5k', 3545, 920, 150, 60, lane='be', badge='10.3')
W.term('t_min', 3595, 1045, label='Auto Terminate', lane='be', icons=False)
W.node('re', 'Rule Engine', 3830, 790, 170, 90, 'purple', lane='be', badge='10.5')
W.node('rq', 'Risk Queue', 3780, 985, 140, 60, 'purple', lane='be')
W.hand(3784, 989, lane='be')
W.node('crq', 'Credit Queue', 3980, 985, 140, 60, 'purple', lane='be')
W.hand(3984, 989, lane='be')
W.node('sq', 'Sales Queue', 4180, 985, 140, 60, 'purple', lane='be')
W.hand(4184, 989, lane='be')
W.term('t_rq', 3832, 1085, label='Failed', lane='be')
W.term('t_crq', 4032, 1085, label='Failed', lane='be')
W.term('t_sq', 4232, 1085, label='Failed', lane='be')
W.note('rq_note', '1. Review application failed by Risk Criteria', 3925, 1062, 92, 52, lane='be', fs=8)
W.note('risk_note', '<i>(*) Risk classification will be evaluated for reporting purposes only and will not influence the decision-making process; therefore, this step will be excluded from the workflow.<br>(**) Risk classification and Lexis Nexis report will be generated before Rule Engine Step<br>(***) Risk classification regarding Emailage module will be applicable for both Personal Email and Business Email</i>',
       3740, 1155, 560, 78, lane='be', dashed=False)

W.edge('aecb_sal', 'inc')
W.edge('inc', 'mohre')
W.edge('mohre', 'calc')
W.edge('fts_sal', 'calc', exit=(1, 0.5), entry=(0, 0.5), points=[(3510, 1135), (3510, 830)])
W.edge('calc', 'minin')
W.edge('minin', 't_min', exit=(0.5, 1))
W.edge('minin', 're', exit=(1, 0.5), entry=(0, 0.7))
W.edge('re', 's11', label='<font color="#00B050"><b>APPROVED</b></font>',
       exit=(0.3, 0), entry=(0.5, 1), points=[(3880, 530), (3075, 530)])
W.edge('re', 'rq', label='<b>Refer</b>', color='#0000FF', exit=(0.2, 1))
W.edge('re', 'crq', label='<b>Refer</b>', color='#0000FF', exit=(0.5, 1))
W.edge('re', 'sq', label='<b>Reject</b>', exit=(0.9, 1), points=[(4250, 930)])
W.edge('crq', 're', label='Rerun RE', dashed=True, exit=(0.8, 0), entry=(0.85, 1))
W.edge('rq', 'crq'); W.edge('crq', 'rq')
W.edge('crq', 'sq'); W.edge('sq', 'crq')
W.edge('rq', 't_rq'); W.edge('crq', 't_crq'); W.edge('sq', 't_sq')

# ---------------- BACKEND: fulfilment ----------------
W.node('ucrn', 'Update Customer Register Number (EastNets Add KYC Input API)', 4300, 560, 170, 80, 'pink', lane='be')
W.node('cif1', 'CIF Creation (T24 Core)', 4530, 565, 150, 60, 'pink', lane='be', badge='15.1')
W.node('cif2', 'CIF Creation (NI)', 4530, 675, 150, 60, 'pink', lane='be', badge='15.2')
W.node('acct', 'Account Creation (NI)', 4530, 785, 150, 60, 'pink', lane='be', badge='15.3')
W.node('card', 'Card Creation (NI)', 4530, 895, 150, 60, 'pink', lane='be', badge='15.4')
W.node('tpq2', 'Transaction Posting Queue', 4760, 720, 150, 60, 'purple', lane='be')
W.round('complete', 'Complete', 4950, 700, 70, lane='be', badge='16')
W.icons(5000, 672, lane='be')

W.edge('s15', 'cif1', points=[(3830, 540), (4605, 540)])
W.edge('cif1', 'ucrn')
W.edge('cif1', 'cif2', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('cif2', 'acct', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('acct', 'card', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('tpq2', 'cif1', label='<font color="#FF6666">Fail/Retry</font>', dashed=True,
       exit=(0.5, 0), entry=(1, 0.5), points=[(4835, 595)])
W.edge('tpq2', 'cif2', label='<font color="#FF6666">Fail/Retry</font>', dashed=True, entry=(1, 0.5))
W.edge('acct', 'tpq2', label='<font color="#FF6666">Fail/Retry</font>', dashed=True, exit=(1, 0.5))
W.edge('tpq2', 'card', label='<font color="#FF6666">Fail/Retry</font>', dashed=True,
       exit=(0.5, 1), entry=(1, 0.5), points=[(4835, 925)])
W.edge('card', 'complete', label='<font color="#00B050"><b>Pass</b></font>',
       exit=(0.5, 1), entry=(0.5, 1), points=[(4605, 1000), (4985, 1000)])

# ---------------- BANK TOUCH POINTS ----------------
W.node('efr_ms', 'EFR microservice', 700, 1300, 150, 60, 'pink', lane='tp')
W.note('efr_note', '<i>(*) Note: The EFR microservice is treated as a single block. For the input of the Pre-dedupe check, it will utilize the response from the EFR OCR step, rather than the responses from steps 1.2 or 1.12.</i>',
       700, 1375, 230, 85, lane='tp', dashed=False)
W.node('dedupe_api', 'Dedupe API (Customer Check Core)', 1340, 1300, 150, 60, 'pink', lane='tp')
W.node('cep_api', 'Check Existing Product API (T24)', 1540, 1270, 150, 60, 'pink', lane='tp')
W.node('aecb_ms', 'AECB Microservice', 2160, 1300, 150, 60, 'pink', lane='tp')
W.node('fts_ms', 'FTS Microservice', 2820, 1300, 150, 60, 'pink', lane='tp')
W.node('fts_cb', 'FTS Callback', 3030, 1300, 150, 60, 'pink', lane='tp')

W.edge('efr_ms', 'predupe', color='#0000FF', exit=(0.5, 0), entry=(0.3, 1))
W.edge('dedupe', 'dedupe_api', color='#0000FF', exit=(0.3, 1), entry=(0.5, 0))
W.edge('dedupe_api', 'dedupe', color='#0000FF')
W.edge('cep', 'cep_api', color='#0000FF', exit=(0.3, 1), entry=(0.5, 0))
W.edge('aecb_ms', 'aecb', color='#0000FF', exit=(0.5, 0), entry=(0.7, 1))
W.edge('fts_ms', 'fts_cb', color='#0000FF')
W.edge('fts_cb', 'fts_ms', color='#0000FF')
W.edge('fts_cb', 'fts_sal', color='#0000FF', exit=(0.5, 0), entry=(0.5, 1))

W.save(os.path.join(ROOT, 'Reem_Finance_NSTL_NTB_CC_Workflow_v1.6.drawio'))
