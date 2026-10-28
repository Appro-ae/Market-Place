"""Reem Finance CASA workflow — v1.0 as native draw.io, rebuilt from the PO's latest
image (28/10). Step badges sit ON their boxes per the PO's instruction.

    python3 build/casa.py
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '_build'))
from wflib import Flow

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W = Flow('RF-CASA-v1.0')

W.label(None, 'Reem Finance CASA workflow', 40, 10, 620, 40, fs=28, color='#1500FF',
        align='left', bold=True)
W.legend(3160, 35)

W.lane('fe', 'Front End', 0, 100, 4560, 380)
W.lane('be', 'BackEnd', 0, 480, 4560, 760)
W.lane('tp', 'Bank Touch points', 0, 1240, 4560, 260)

# ---------------- FRONT END ----------------
FY = 250
W.round('start', 'Start', 70, FY + 10, 50, lane='fe')
W.node('s1', 'RF App Login', 170, FY, 150, 70, 'green', lane='fe', badge='1')
W.node('s2', 'Select Banking Products', 370, FY, 150, 70, 'green', lane='fe', badge='2')
W.node('s3', 'Product Selection as CASA', 570, FY, 150, 70, 'green', lane='fe', badge='3')
W.node('s4', 'Select Employment Type + Self-declared income', 770, FY, 150, 70, lane='fe', badge='4')
W.node('s5', 'Submit Bureau Consent, PIA, Marketing consent &amp; T&amp;C', 970, FY, 155, 70, lane='fe', badge='5')
W.node('s6', 'Scan Front EID', 1180, FY, 140, 70, lane='fe', badge='6')
W.node('s7', 'Scan Back EID', 1370, FY, 140, 70, lane='fe', badge='7')
W.node('s8', 'EFR liveliness Check', 1560, FY, 145, 70, lane='fe', badge='8')
W.node('s9', 'KYC Additional Information', 1900, FY, 150, 70, lane='fe', badge='9')
W.node('s10', 'FATCA/CRS', 2250, FY, 140, 70, lane='fe', badge='10')
W.node('s11', 'Biometric &amp; MPIN verification', 2600, FY, 150, 70, lane='fe', badge='11')
W.icons(2765, FY - 35, lane='fe')
W.diamond('d_ok', '', 2850, FY + 15, 40, 40, lane='fe')
W.node('s13', 'Welcome Screen + Personalize Card', 2960, FY, 150, 70, lane='fe', badge='13')
W.node('s14', 'KFS Signing', 3170, FY, 140, 70, lane='fe', badge='14')
W.node('s16', 'Thank you screen', 4160, FY, 140, 70, lane='fe', badge='16')

W.term('t_geo1', 600, 130, label='Geofencing Check', lane='fe')
W.term('t_geo2', 800, 130, label=None, lane='fe')
W.label(None, '<b>If geofencing check</b>', 745, 96, 150, 16, lane='fe', fs=9)
W.term('t_scan', 1430, 128, label=None, lane='fe')
W.label(None, 'Retry EID Scan', 1240, 170, 120, 16, lane='fe', fs=9)
W.term('t_holder', 1605, 128, label=None, lane='fe')
W.label(None, '<b>If righful holder check fails</b>', 1550, 92, 150, 30, lane='fe', fs=9)
W.node('email_risk', 'Email Risk assessment (Lexis nexis)', 1900, 120, 150, 55, 'yellow', lane='fe')
W.label('kyc_note', '1.Additional Nationality declaration<br>2. US Citizenship<br>3. Tax Resident in/out of UAE<br>(*) Yes for US citizenship or Tax Resident of OECD Countries, then Country and TIN Number Declaration',
        1835, FY + 90, 220, 90, lane='fe', fs=8, align='left')

W.edge('start', 's1'); W.edge('s1', 's2'); W.edge('s2', 's3'); W.edge('s3', 's4')
W.edge('s4', 's5'); W.edge('s5', 's6'); W.edge('s6', 's7'); W.edge('s7', 's8')
W.edge('s8', 's9')
W.edge('s3', 't_geo1')
W.edge('s4', 't_geo2')
W.edge('s6', 't_scan', exit=(0.5, 0), points=[(1250, 205)])
W.edge('s7', 't_scan', exit=(0.5, 0), points=[(1440, 205)])
W.edge('s8', 't_holder', exit=(0.5, 0))
W.edge('s9', 'email_risk')
W.edge('s9', 's10', label='US Green card holder = Yes or<br>Tax Resident of OECD countries',
       lcolor='#FF0000', lpos=-0.5)
W.edge('s9', 's11', label='US Green card holder = No or not Tax Resident of OECD countries',
       lcolor='#FF0000', exit=(0.5, 1), entry=(0.5, 1), points=[(1975, 450), (2675, 450)])
W.edge('s10', 's11')
W.edge('s11', 'd_ok'); W.edge('d_ok', 's13'); W.edge('s13', 's14')

# ---------------- BACKEND ----------------
W.node('ops_note', '1. Credit team will upload Occupation list<br>4/5/7/9. Credit team will share in Credit Criteria<br>8. IT to develop API',
       -300, 740, 250, 90, 'step', fs=10, extra='align=left;')
W.note('pd_note', '1. Existing Application Check (Appro)<br>2. Watchlist (AML Trace Table Mapping)<br>3. Sourcing Profile Check (Occupation)<br>4. Minimum Age check<br>5. Nationality restriction<br>6. EID expiration Check<br>7. CB Hotlist Check<br>8. CB blacklist',
       560, 590, 210, 155, lane='be')
W.node('cb_api', 'CB Blacklist API', 700, 760, 140, 60, 'pink', lane='be')
W.node('predupe', 'Pre-Dedupe Check', 950, 760, 150, 60, 'purple', lane='be', badge='7.1')
W.label(None, '<b>1.Check ETB/NTB</b>', 950, 838, 150, 18, lane='be', fs=9)
W.term('t_pd', 1195, 772, label=None, lane='be')
W.label(None, '<b>Fail</b>', 1118, 762, 60, 16, lane='be', fs=9)
W.node('dedupe', 'Dedupe Check', 1340, 690, 150, 60, 'purple', lane='be', badge='8.0')
W.diamond('d_rel', 'Relation Type?', 1570, 680, 90, 80, lane='be', fs=9)
W.term('t_freeze', 1745, 830, label='Freeze/Block Check', lane='be')
W.label(None, 'ETB &amp;<br>in freeze and block status', 1630, 788, 150, 30, lane='be', fs=8)
W.node('cep', 'Check Existing Product (CASA)', 1540, 950, 150, 60, 'purple', lane='be', badge='8.1')
W.label(None, 'ETB &amp;<br>No freeze / block', 1455, 872, 120, 30, lane='be', fs=8)
W.term('t_cep', 1795, 962, label='Failed', lane='be',
       note='Other cases (*): Applicant applied for either Current or Saving account but they both have Current and Saving accounts with T24')
W.node('aecb_rep', 'AECB Full Report', 2160, 680, 150, 70, lane='be', badge='8.2')
W.node('uslogic', 'US logic checks', 2450, 680, 150, 70, lane='be', badge='8.3')
W.diamond('d_pass', 'Pass?', 2485, 840, 60, 60, lane='be', fs=9)
W.node('cq1', 'Compliance Queue', 2420, 990, 150, 60, 'purple', lane='be')
W.hand(2424, 994, lane='be')
W.node('saleq', 'Sale Queue', 2660, 990, 140, 60, 'purple', lane='be')
W.hand(2664, 994, lane='be')
W.note('sale_note', '<i>(*) Note: Sale Queue will be able to upload W8/W9 documents (FATCA/CRS)</i>',
       2640, 1065, 190, 45, lane='be', dashed=False)
W.diamond('d_appr', 'Approve?', 2455, 1105, 70, 70, lane='be', fs=9)
W.term('t_appr', 2680, 1122, label='Failed', lane='be')
W.node('eastnets', 'EastNets', 2950, 680, 150, 70, lane='be', badge='8.4')
W.node('tpq1', 'Transaction Posting Queue', 2830, 950, 150, 60, 'purple', lane='be')
W.label(None, 'Status = Failed after 5 times retrigger automatically', 2620, 800, 175, 55,
        lane='be', fs=9, color='#009900', bold=True)
W.diamond('d_stp', '', 3180, 690, 50, 50, lane='be')
W.note('stp_note', '<font color="#CC00CC"><b>(*) STP/NSTP classification:<br>- KYC Status = "Compliance Review" -&gt; NSTP<br>- KYC Status = "Approved" -&gt; STP</b></font>',
       3270, 660, 250, 60, lane='be', dashed=False)
W.node('cq2', 'Compliance Queue', 3130, 860, 150, 60, 'purple', lane='be')
W.hand(3134, 864, lane='be')
W.icons(3060, 825, lane='be')
W.node('en_cb', 'EastNets API callback', 3130, 985, 150, 55, 'pink', lane='be')
W.diamond('d_dec', 'make decision', 3390, 982, 80, 80, lane='be', fs=9)
W.term('t_dec', 3600, 1004, label='Failed', lane='be')

W.edge('s7', 'predupe', color='#0000FF', points=[(1440, 560)])
W.edge('predupe', 's8', label='Pass', exit=(0.5, 0), entry=(0.5, 1),
       points=[(1025, 560), (1632, 560)])
W.edge('predupe', 'cb_api', color='#0000FF')
W.edge('cb_api', 'predupe')
W.edge('predupe', 't_pd')
W.edge('dedupe', 'd_rel')
W.edge('d_rel', 'aecb_rep', label='NTB')
W.edge('d_rel', 't_freeze', exit=(0.5, 1), points=[(1615, 845)])
W.edge('d_rel', 'cep', exit=(0.5, 1))
W.edge('cep', 't_cep', label='<b>Fail</b>')
W.edge('cep', 'aecb_rep', label='Pass', exit=(1, 0.2), entry=(0, 0.8), points=[(1750, 735)])
W.edge('aecb_rep', 'uslogic')
W.edge('uslogic', 'd_pass')
W.edge('d_pass', 'eastnets', label='Pass', exit=(1, 0.5), entry=(0.5, 1),
       points=[(3025, 870)])
W.edge('d_pass', 'cq1', label='Fail')
W.edge('cq1', 'saleq'); W.edge('saleq', 'cq1')
W.edge('cq1', 'd_appr')
W.edge('d_appr', 't_appr', label='Reject')
W.edge('d_appr', 'eastnets', label='Approve', exit=(0, 0.5), entry=(0, 0.8),
       points=[(2880, 1140), (2880, 736)])
W.edge('eastnets', 'tpq1', exit=(0, 1), entry=(0.5, 0), points=[(2930, 790), (2905, 790)])
W.edge('tpq1', 'eastnets', label='<font color="#FF6666">Fail/Retry</font>', color='#FF0000',
       dashed=True, exit=(1, 0.5), entry=(0.7, 1), points=[(3055, 980)])
W.edge('eastnets', 'd_stp')
W.edge('d_stp', 'd_ok', label='<font color="#CC00CC"><b>STP</b></font>', exit=(0.5, 0),
       entry=(1, 0.5), points=[(3205, 520), (2890, 520)])
W.edge('d_stp', 'cq2', label='NSTP', lcolor='#CC00CC', lbold=True, exit=(0.5, 1))
W.edge('cq2', 'en_cb')
W.edge('en_cb', 'd_dec')
W.edge('d_dec', 't_dec', label='Reject')
W.edge('d_dec', 'd_ok', label='Approve', lpos=-0.5, exit=(0.5, 0), entry=(0.5, 1),
       points=[(3430, 560), (2870, 560)])

# ---------------- FULFILMENT ----------------
W.node('ucrn', 'Update Customer Register Number (EastNets Add KYC Input API)', 3550, 560, 170, 80, 'pink', lane='be', badge='15.2')
W.node('cif1', 'CIF Creation (T24 Core)', 3780, 560, 150, 60, 'pink', lane='be', badge='15.1')
W.node('acct_t24', 'Account Creation +IBAN Generation (T24)', 3780, 670, 150, 60, 'pink', lane='be', badge='15.3')
W.node('cif_ni', 'CIF Creation (NI)', 3780, 780, 150, 60, 'pink', lane='be', badge='15.4')
W.node('acct_ni', 'Account Creation (NI)', 3780, 890, 150, 60, 'pink', lane='be', badge='15.5')
W.node('debit', 'Debit Card Creation (NI)', 3780, 1000, 150, 60, 'pink', lane='be', badge='15.6')
W.node('tpq2', 'Transaction Posting Queue', 4090, 640, 150, 60, 'purple', lane='be')
W.round('complete', 'Complete', 4300, 690, 70, lane='be', badge='17')
W.icons(4355, 662, lane='be')

W.edge('s14', 'cif1', points=[(3240, 540), (3855, 540)])
W.edge('cif1', 'ucrn')
W.edge('cif1', 'acct_t24', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('acct_t24', 'cif_ni', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('cif_ni', 'acct_ni', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('acct_ni', 'debit', label='<font color="#00B050"><b>Pass</b></font>')
W.edge('cif_ni', 'complete', label='<font color="#00B050"><b>Pass</b></font>',
       exit=(1, 0.5), entry=(0.5, 1), points=[(4335, 850)])
for tgt, yy in [('cif1', 590), ('acct_t24', 700), ('cif_ni', 810), ('acct_ni', 920), ('debit', 1030)]:
    W.edge('tpq2', tgt, label='<font color="#FF6666">Fail/Retry</font>', dashed=True,
           exit=(0.5, 1) if yy > 700 else (0, 0.5), entry=(1, 0.5), points=[(4020, yy)])
W.edge('s16', 'complete', exit=(0.5, 1), entry=(0.5, 0), points=[(4230, 600), (4335, 600)])

# ---------------- BANK TOUCH POINTS ----------------
W.node('efr_ms', 'EFR microservice', 700, 1300, 150, 60, 'pink', lane='tp')
W.note('efr_note', '<i>(*) Note: The EFR microservice is treated as a single block. For the input of the Pre-dedupe check, it will utilize the response from the EFR OCR step, rather than the responses from steps 1.2 or 1.12.</i>',
       700, 1375, 230, 85, lane='tp', dashed=False)
W.node('dedupe_api', 'Dedupe API (T24)', 1340, 1300, 150, 60, 'pink', lane='tp')
W.node('cep_api', 'Check Existing Product API (T24)', 1540, 1265, 150, 60, 'pink', lane='tp')
W.node('aecb_rep_tp', 'AECB Full Report', 1900, 1340, 150, 60, 'pink', lane='tp')
W.node('en_kyc_api', 'EastNets Add KYC Input API', 2600, 1300, 150, 60, 'pink', lane='tp')

W.edge('efr_ms', 'predupe', color='#0000FF', exit=(0.5, 0), entry=(0.3, 1))
W.edge('dedupe', 'dedupe_api', color='#0000FF', exit=(0.3, 1), entry=(0.5, 0))
W.edge('dedupe_api', 'dedupe', color='#0000FF')
W.edge('cep', 'cep_api', color='#0000FF', exit=(0.3, 1), entry=(0.5, 0))
W.edge('dedupe_api', 'en_kyc_api')
W.edge('en_kyc_api', 'eastnets', color='#0000FF', exit=(0.5, 0), entry=(0.3, 1))
W.edge('aecb_rep_tp', 'aecb_rep', color='#0000FF', exit=(0.5, 0), entry=(0.5, 1))
W.edge('aecb_rep_tp', 'tpq2', dashed=True, exit=(1, 0.5), entry=(0.5, 1),
       points=[(4165, 1370), (4165, 760)])

W.save(os.path.join(ROOT, 'Reem_Finance_CASA_Workflow_v1.0.drawio'))
