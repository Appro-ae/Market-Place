from dash2 import *
CSS = CSS_BASE + """
.window{font-size:12.5px;opacity:.7;margin-bottom:24px;line-height:1.5}
.kpis{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-bottom:20px;max-width:620px}
.kpi{background:#ffffff;border-radius:16px;padding:18px;border-left:7px solid #3b7ef6}
.kpi.r{border-left-color:#d92d20}
.kpinum{font-size:33px;font-weight:900;line-height:1;letter-spacing:-1.5px}
.kpilbl{font-size:11.5px;margin-top:8px;opacity:.75;line-height:1.35}
.grid2{display:grid;grid-template-columns:1.45fr 1fr;gap:16px;margin-bottom:20px}
.grid2b{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px}
td{vertical-align:middle}
td.tot{font-size:15px} td.big{font-size:16px}
.sq{font-weight:400;font-size:11px;opacity:.6;margin-top:3px}
.progcell{width:26%}
.alloc{font-size:10.5px;font-weight:900;background:#edf2ff;padding:3px 8px;border-radius:9px}
.alloc.half{background:#fdba23}
.prog{height:14px;border-radius:7px;background:#edf2ff;overflow:hidden}
.prog span{display:block;height:100%;background:#1a214d}
.empty td{opacity:.45}
.cell{display:inline-block;min-width:30px;padding:3px 9px;border-radius:9px;font-weight:900}
.b0{background:#dbe7ff} .b1{background:#9dc0ff} .b2{background:#fdba23} .b3{background:#d92d20;color:#fff}
.zero{opacity:.3} .ax2{font-size:11.5px;opacity:.68}
.pm{margin-top:12px;display:flex;gap:9px;align-items:baseline;font-size:12px;line-height:1.5}
.pmtag{background:#1a214d;color:#fff;font-size:9.5px;font-weight:900;letter-spacing:.9px;padding:2px 7px;border-radius:8px}
.pmtxt{font-weight:700}
.rel{background:#1a214d;color:#fff;border-radius:16px;padding:20px 24px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
.relt{font-weight:900;font-size:19px;letter-spacing:-.4px}
.rels{font-size:12.5px;opacity:.8;margin-top:5px}
.relnums{display:flex;gap:34px}
.rnv{font-size:28px;font-weight:900;line-height:1}
.rnl{font-size:11px;opacity:.75;margin-top:5px}
"""
h=[]
h.append('<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>Defect &amp; Developer Performance</title>')
h.append('<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">')
h.append(f'<style>{CSS}</style></head>\n<body><div class="wrap">')
h.append(topbar('DEFECT &amp; DEVELOPER PERFORMANCE · 1–26 AUG 2026'))
h.append('<h1>Defect &amp; Developer Performance</h1>')
h.append('<div class="deck">Project AMP · all defects · Bank squad: Tang Ha Long, LongLH, KhoeHD &nbsp;|&nbsp; Channel / Admin / DP squad: Toan, Nam, Minh, Quan, Tung</div>')
h.append(f'<div class="window">Window: <b>1–26 August 2026</b>, {F["working"]} working days · a fix is counted when the developer personally moves the bug '
 'To&nbsp;Do&nbsp;→&nbsp;UAT&nbsp;Testing, read from Jira status history, then verified against the full fix-verification standard</div>')
h.append('<div class="kpis">'
 f'<div class="kpi r"><div class="kpinum">{A["tot_raised"]}</div><div class="kpilbl">Defects raised</div></div>'
 f'<div class="kpi"><div class="kpinum">{A["tot_closed"]}</div><div class="kpilbl">Defects closed</div></div></div>')

up=sum(1 for i in range(len(A['days'])) if A['raised'][i]>A['closed'][i])
best=max(range(len(A['days'])), key=lambda i:A['closed'][i]-A['raised'][i])
import datetime as dt
bd=dt.date.fromisoformat(A['days'][best])
h.append('<div class="grid2">')
h.append(f'<div class="card"><div class="ctitle">Arrival vs closure, per day</div>'
 f'<div class="csub">Red is raised, blue is closed · arrival exceeded closure on {up} of the {len(A["days"])} days</div>{arrival()}'
 f'<div class="legend"><span class="lg"><span class="sw" style="background:{RED}"></span>Raised</span>'
 f'<span class="lg"><span class="sw" style="background:{BLUE}"></span>Closed</span></div>'
 f'<div class="pm"><span class="pmtag">PM</span><span class="pmtxt">Only {len(A["days"])-up} days closed at least as many as they took in; '
 f'the best single day was {bd.strftime("%-d %B")}.</span></div></div>')
h.append(f'<div class="card"><div class="ctitle">Cumulative gap</div>'
 f'<div class="csub">The shaded area is backlog the team has not recovered</div>{cumulative()}'
 f'<div class="legend"><span class="lg"><span class="sw" style="background:{RED}"></span>Raised</span>'
 f'<span class="lg"><span class="sw" style="background:{BLUE}"></span>Closed</span></div>'
 f'<div class="pm"><span class="pmtag">PM</span><span class="pmtxt">The lines have not reconverged all month; the gap is now '
 f'{A["cumR"][-1]-A["cumK"][-1]} defects wide and widening into the release.</span></div></div>')
h.append('</div>')

h.append('<div class="grid2b"><div class="card"><div class="ctitle">Fixes per developer</div>'
 f'<div class="csub">{F["total"]} verified fixes from {F["total_raw"]} raw To&nbsp;Do&nbsp;→&nbsp;UAT&nbsp;Testing transitions · '
 f'full changelog audit on all 141 tickets · '
 'rate = fixes / available days (18 working days × allocation) · first-pass = not previously rejected back to To Do</div>'
 '<table><thead><tr><th>Developer</th><th>Alloc</th><th class="num">Fixes</th><th>Share</th>'
 '<th class="num">%</th><th class="num">First&nbsp;pass</th><th class="num">Per day</th></tr></thead><tbody>')
mx=max(r['fixes'] for r in F['rows']) or 1
for r in F['rows']:
    cls=' class="empty"' if r['fixes']==0 else ''
    al=f'<span class="alloc half">50%</span>' if r['alloc']==0.5 else '<span class="alloc">100%</span>'
    bar=f'<div class="prog"><span style="width:{100*r["fixes"]/mx:.0f}%"></span></div>' if r['fixes'] else ''
    fp=f'{r["fpr"]}%' if r['fixes'] else '—'
    h.append(f'<tr{cls}><td class="wsname">{r["dev"]}<div class="sq">{r["squad"]}</div></td><td>{al}</td>'
             f'<td class="num tot">{r["fixes"]}</td><td class="progcell">{bar}</td><td class="num">{r["share"]}%</td>'
             f'<td class="num">{fp}</td><td class="num big">{r["rate"]}</td></tr>')
h.append('</tbody></table></div>')
h.append(f'<div class="card"><div class="ctitle">Time from raised to closed</div>'
 f'<div class="csub">{A["cyc_n"]} closed defects · median {A["cyc_median"]} days · the 31+ band is what threatens a release date</div>{cycle()}'
 f'<div class="legend"><span class="lg"><span class="sw" style="background:{BLUE}"></span>Within a week</span>'
 f'<span class="lg"><span class="sw" style="background:{NAVY}"></span>Within a month</span>'
 f'<span class="lg"><span class="sw" style="background:{RED}"></span>Over a month</span></div></div></div>')
open('d2_part1.html','w').write('\n'.join(h))
print('d2 part1 ok')
