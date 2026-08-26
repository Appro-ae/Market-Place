import json, html as H
A = json.load(open('agg.json'))
LOGO = open('logo.txt').read()
NAVY='#1a214d'; BLUE='#3b7ef6'; YEL='#fdba23'; LAV='#edf2ff'; RED='#d92d20'
IMP='#5b6ba8'; DEV='#9dc0ff'; PALE='#dbe7ff'
STAGE_COL=[BLUE,YEL,NAVY,IMP,DEV,'#ffffff']
def esc(s): return H.escape(str(s))
CSS_BASE = """
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Lato,'Segoe UI',sans-serif;background:#edf2ff;color:#1a214d;padding:34px 40px 48px}
.wrap{max-width:1420px;margin:0 auto}
.topbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.logo{height:38px;display:block}
.badge{background:#fdba23;color:#1a214d;font-weight:900;font-size:11.5px;letter-spacing:1.4px;padding:8px 18px;border-radius:20px}
h1{font-size:36px;font-weight:900;letter-spacing:-1px;margin-bottom:6px}
.deck{font-size:15px;font-weight:700;color:#3b7ef6;margin-bottom:8px}
.card{background:#ffffff;border-radius:16px;padding:22px 24px}
.ctitle{color:#3b7ef6;font-weight:900;font-size:15.5px;margin-bottom:4px}
.csub{font-size:11.5px;opacity:.62;margin-bottom:12px;line-height:1.45}
svg{width:100%;height:auto;display:block}
.ax{font-size:11.5px;fill:#1a214d;opacity:.72;font-family:Lato,sans-serif}
.axb{font-size:13px;font-weight:900;fill:#1a214d;font-family:Lato,sans-serif}
.axb2{font-size:12px;font-weight:900;fill:#1a214d;font-family:Lato,sans-serif}
.axs{font-size:10.5px;fill:#1a214d;opacity:.6;font-family:Lato,sans-serif}
.tiny{font-size:10px;fill:#1a214d;opacity:.6;font-family:Lato,sans-serif}
.val{font-size:12.5px;font-weight:900;fill:#1a214d;font-family:Lato,sans-serif}
.inbar{font-size:12px;font-weight:900;font-family:Lato,sans-serif}
.legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:12px;font-size:11.5px}
.lg{display:flex;align-items:center;gap:6px}
.sw{width:10px;height:10px;border-radius:50%}
.sw.o{background:#ffffff;border:1.5px solid #1a214d;width:8px;height:8px}
table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
th{background:#3b7ef6;color:#ffffff;text-align:left;padding:11px 12px;font-weight:900;font-size:12px}
th.num{text-align:right}
th:first-child{border-radius:8px 0 0 8px} th:last-child{border-radius:0 8px 8px 0}
td{padding:10px 12px;border-bottom:1px solid #edf2ff;vertical-align:top}
td.num{text-align:right;font-weight:700}
td a{color:#3b7ef6;font-weight:700;text-decoration:none}
td a.parent{opacity:.6;font-weight:400}
.wsname{font-weight:900}
.oldred{font-weight:900;color:#d92d20}
.pill{display:inline-block;padding:3px 11px;border-radius:11px;font-size:11px;font-weight:900;background:#fdba23;color:#1a214d}
.foot{margin-top:22px;font-size:11.5px;opacity:.6;line-height:1.6}
@media print{body{padding:12px}.card,.kpi{break-inside:avoid}}
"""
def topbar(badge):
    return (f'<div class="topbar">\n <div class="brand"><img class="logo" src="{LOGO}" alt="Appro"></div>\n'
            f' <div class="badge">{badge}</div>\n</div>\n')
