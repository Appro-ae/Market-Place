from common import *
from movecard import card as movecard, CSS_MOVE
P=['Distribution Portal','Admin Portal','Bank Portal','Channel']
PDESC={'Distribution Portal':'The operating platform — offline banks, offline products and offer setup.',
'Admin Portal':'Campaign links and collateral visibility.',
'Bank Portal':'What the bank configures and operates — products, conditional offers, roles and calculation performance.',
'Channel':'What the customer sees — journey changes and the Appro website.'}
GOAL={'Bank Portal':'Complete the Auto Loan flow — except DOL, which lands in Release 3.2.'}
FDESC={
 'Offline Product':'Insurance and upsell products that are not integrated: list and detail pages, product fetching, and how they appear on the customer journey and offer screens.',
 'Offer Management':'View and edit the offer setup list.',
 'Offline Bank':'Lets an operator set up a bank and its products manually, so offers can be issued for banks not yet integrated.',
 'UTM Management':'Create and manage UTM-tagged links so campaign traffic can be attributed by source.',
 'Collateral Management':"Hides Appro-specific collateral content and email templates from other channels.",
 'Product Setup':'Manual-bank product setup for Personal Loan and Auto Loan: view, create and edit a product.',
 'Conditional Offer':'Bank-side conditional offer: the configuration screen and the re-calculation that runs after an adjustment.',
 'Grace Period & First EMI Day':'Adds grace-period handling and the first EMI day into the instalment calculations.',
 'Tuning Performance':'Moves formula execution from brm-service to queue-service and improves the variable calculation step.',
 'Grace Period & Salary Date':'Adds grace period and salary date to the Personal Loan, Auto Loan and Mortgage Loan journeys.',
 'Conditional Offer on journey':"Surfaces the bank's conditional offer inside the customer journey.",
 'Website & tracking':'Appro website routes traffic to offline banks, shutting down the five integrated banks it replaces.'}
U='https://scvaladdin.atlassian.net/browse/'

def readiness():
    crs=list(A['per_cr'].items()); mx=max(v['n'] for _,v in crs)
    L,W_,rh,gap=250,300,54,36; sc=W_/max(mx,1)*0.75
    h=24+len(crs)*(rh+gap)+30; s=[f'<svg viewBox="0 0 {L+W_+60} {h}">']
    step=10 if mx<=25 else 20
    t=0
    while t<=mx:
        x=L+t*sc; s.append(f'<line x1="{x:.1f}" y1="24" x2="{x:.1f}" y2="{h-32}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{x:.1f}" y="{h-14}" text-anchor="middle" class="ax">{t}</text>'); t+=step
    y=42
    for cr,v in crs:
        s.append(f'<text x="{L-8}" y="{y+22}" text-anchor="end" class="axb">{cr}</text>')
        s.append(f'<text x="{L-8}" y="{y+40}" text-anchor="end" class="ax">{esc(A_CR[cr])}</text>')
        x=L
        for i,n in enumerate(v['mix']):
            if not n: continue
            w=n*sc; col=STAGE_COL[i]
            extra='' if i<5 else f' stroke="{NAVY}" stroke-width="1.5"'
            s.append(f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{rh}" fill="{col}"{extra}/>'); x+=w
        s.append(f'<text x="{x+8:.1f}" y="{y+rh/2+5:.0f}" class="val">{v["n"]}</text>')
        y+=rh+gap
    s.append(f'<line x1="{L}" y1="24" x2="{L}" y2="{h-32}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)

def defects_by_portal():
    rows=[(p,A['per_portal'][p]['defects'],A['per_portal'][p]['high']) for p in P]
    mx=max([r[1] for r in rows]+[1]); L,W_=192,300; sc=W_/mx*0.9
    bh,gp=20,24; h=14+len(rows)*(bh+gp)+26; s=[f'<svg viewBox="0 0 {L+W_+90} {h}">']
    step=5 if mx<=20 else 10
    t=0
    while t<=mx:
        x=L+t*sc; s.append(f'<line x1="{x:.1f}" y1="14" x2="{x:.1f}" y2="{h-26}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{x:.1f}" y="{h-8}" text-anchor="middle" class="ax">{t}</text>'); t+=step
    y=26
    for p,n,hi in rows:
        s.append(f'<text x="{L-8}" y="{y+15}" text-anchor="end" class="axb2">{p}</text>')
        x=L
        if hi: s.append(f'<rect x="{x:.1f}" y="{y}" width="{hi*sc:.1f}" height="{bh}" fill="{YEL}"/>'); x+=hi*sc
        if n-hi: s.append(f'<rect x="{x:.1f}" y="{y}" width="{(n-hi)*sc:.1f}" height="{bh}" fill="{NAVY}"/>'); x+=(n-hi)*sc
        s.append(f'<text x="{x+8:.1f}" y="{y+15}" class="val">{n}</text>')
        y+=bh+gp
    s.append(f'<line x1="{L}" y1="14" x2="{L}" y2="{h-26}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)

def ageing():
    rows=[(p,A['per_portal'][p]['ageing']) for p in P]
    mx=max([sum(r[1]) for r in rows]+[1]); L,W_=150,190; sc=W_/mx*0.9
    bh,gp=21,23; h=14+len(rows)*(bh+gp)+26; s=[f'<svg viewBox="0 0 {L+W_+80} {h}">']
    step=5 if mx<=20 else 10
    t=0
    while t<=mx:
        x=L+t*sc; s.append(f'<line x1="{x:.1f}" y1="14" x2="{x:.1f}" y2="{h-26}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{x:.1f}" y="{h-8}" text-anchor="middle" class="ax">{t}</text>'); t+=step
    y=24; cols=[BLUE,YEL,RED]
    for p,b in rows:
        s.append(f'<text x="{L-8}" y="{y+15}" text-anchor="end" class="axb2">{p}</text>')
        if sum(b)==0:
            s.append(f'<text x="{L+6}" y="{y+15}" class="axs">no open defects</text>'); y+=bh+gp; continue
        x=L
        for i,n in enumerate(b):
            if not n: continue
            w=n*sc
            s.append(f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{bh}" fill="{cols[i]}"/>')
            if w>22: s.append(f'<text x="{x+w/2:.1f}" y="{y+15}" text-anchor="middle" class="inbar" fill="#ffffff">{n}</text>')
            x+=w
        s.append(f'<text x="{x+8:.1f}" y="{y+15}" class="val">{sum(b)}</text>')
        y+=bh+gp
    s.append(f'<line x1="{L}" y1="14" x2="{L}" y2="{h-26}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)

def owner_bars():
    rows=A['owner_load']; mx=max([n for _,n in rows]+[1])
    L,W_=170,170; sc=W_/mx*0.85; bh,gp=20,18
    h=14+len(rows)*(bh+gp)+10; s=[f'<svg viewBox="0 0 {L+W_+60} {h}">']; y=14
    for nm,n in rows:
        s.append(f'<text x="{L-8}" y="{y+15}" text-anchor="end" class="axb2">{esc(nm)}</text>')
        s.append(f'<rect x="{L}" y="{y}" width="{n*sc:.1f}" height="{bh}" fill="{YEL}"/>')
        s.append(f'<text x="{L+n*sc+8:.1f}" y="{y+15}" class="val">{n}</text>'); y+=bh+gp
    s.append(f'<line x1="{L}" y1="8" x2="{L}" y2="{h-10}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)

def mixbar(mix,total):
    out=[]
    for i,n in enumerate(mix):
        if not n: continue
        cls=['s-val','s-uat','s-twb','s-imp','s-dev','s-ns'][i]
        out.append(f'<span class="{cls}" style="width:{100*n/total:.4f}%"></span>')
    return '<div class="prog">'+''.join(out)+'</div>'

A_CR={'AMP-2564':'Channel / Admin / Distribution Portal','AMP-3305':'Bank Portal'}
CSS = CSS_BASE + """
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:20px}
.kpi{background:#ffffff;border-radius:16px;padding:18px;border-left:7px solid #3b7ef6}
.kpi.y{border-left-color:#fdba23} .kpi.n{border-left-color:#1a214d} .kpi.r{border-left-color:#d92d20}
.kpinum{font-size:36px;font-weight:900;line-height:1;letter-spacing:-1.5px}
.kpilbl{font-size:12px;margin-top:8px;opacity:.75;line-height:1.35}
.grid3{display:grid;grid-template-columns:1.3fr 1.05fr .75fr;gap:16px;margin-bottom:20px}
.grid2{display:grid;grid-template-columns:2.15fr 1fr;gap:16px;margin-bottom:20px}
.progcell{width:32%;padding-top:14px}
.prog{display:flex;height:16px;border-radius:8px;overflow:hidden;background:#edf2ff}
.prog span{display:block;height:100%}
.s-val{background:#3b7ef6} .s-uat{background:#fdba23} .s-twb{background:#1a214d}
.s-imp{background:#5b6ba8} .s-dev{background:#9dc0ff}
.s-ns{background:#ffffff;box-shadow:inset 0 0 0 1.5px #edf2ff}
.pctcell{font-size:14px}
.cdesc{font-weight:400;font-size:11.5px;opacity:.68;margin-top:4px;line-height:1.45}
.goal{font-weight:700;font-size:11.5px;margin-top:7px;line-height:1.5;display:flex;gap:8px;align-items:baseline}
.goaltag{background:#fdba23;color:#1a214d;font-size:9.5px;font-weight:900;letter-spacing:.9px;padding:2px 7px;border-radius:8px;white-space:nowrap}
.fdesc{font-size:11.5px;opacity:.78;line-height:1.5;max-width:430px}
.catrow td{background:#edf2ff;font-weight:900;font-size:13px;border-bottom:none;padding:12px}
.fcount{font-weight:700;font-size:11px;background:#ffffff;opacity:.75;padding:2px 9px;border-radius:9px;margin-left:8px}
.wsname.sub{font-weight:700;padding-left:26px}
.keys{margin-top:6px;line-height:1.9;max-width:270px}
.kx{font-size:10px;font-weight:700;background:#edf2ff;color:#1a214d;padding:2px 6px;border-radius:6px;text-decoration:none;white-space:nowrap}
.crtag{font-size:10.5px;font-weight:700;background:#edf2ff;padding:3px 9px;border-radius:10px;white-space:nowrap}
.sumcell{max-width:330px;line-height:1.4}
.held{font-size:10.5px;opacity:.6;margin-top:3px;font-weight:400}
.hero{display:flex;align-items:baseline;gap:14px;margin-bottom:14px}
.heronum{font-size:44px;font-weight:900;letter-spacing:-1.5px;line-height:1}
.herotxt{font-size:13px;opacity:.75;line-height:1.45}
.alert{background:#fdba23;border-radius:16px;padding:16px 22px;margin-bottom:20px;font-size:13px;font-weight:700;line-height:1.5}"""+CSS_MOVE+"""
"""
pp=A['per_portal']; maxage=max(A['per_portal'][p]['oldest'] for p in P)
band3 = '31–60 days' if maxage<=60 else '31+ days'
h=[]
h.append('<!DOCTYPE html>\n<html lang="en"><head><meta charset="utf-8"><title>Release 3.1 — Programme Status</title>')
h.append('<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap" rel="stylesheet">')
h.append(f'<style>{CSS}</style></head>\n<body><div class="wrap">')
h.append(topbar('RELEASE 3.1 · 31 AUG 2026'))
h.append('<h1>Release 3.1 — Programme Status</h1>')
h.append('<div class="deck">AMP-2564 · Channel / Admin / Distribution Portal &nbsp;|&nbsp; AMP-3305 · Bank Portal</div>')
h.append('<div class="csub" style="margin-bottom:22px">Refreshed live from Jira on 26 August 2026 · scope taken from the Release 3.1 tables in each CR</div>')

fresh=len([b for b in A['high_list'] if b['age']<=2])
h.append(f'<div class="alert">Since yesterday High &amp; Blocker has gone 10 → {A["high"]}, and {fresh} of the {A["high"]} were raised in the last 48 hours — almost all on Offline Bank (AMP-1957/1958/1959/1960) in Distribution Portal, with 5 working days to release.</div>')

h.append('<div class="kpis">')
for cls,num,lbl in [('y',A['days_to_release'],'Days to release'),('',28,'Release 3.1 items across both tickets'),
                    ('n',A['open_defects'],'Open defects on Release 3.1 items'),
                    ('r',A['high'],'High &amp; Blocker open'),('',f"{A['prog']}%",'Programme-weighted completion')]:
    h.append(f'<div class="kpi {cls}"><div class="kpinum">{num}</div><div class="kpilbl">{lbl}</div></div>')
h.append('</div>')
h.append(movecard())

LEG6=('<div class="legend">'
 f'<span class="lg"><span class="sw" style="background:{BLUE}"></span>UAT Validated</span>'
 f'<span class="lg"><span class="sw" style="background:{YEL}"></span>In UAT testing</span>'
 f'<span class="lg"><span class="sw" style="background:{NAVY}"></span>Tested with bugs</span>'
 f'<span class="lg"><span class="sw" style="background:{IMP}"></span>Implemented</span>'
 f'<span class="lg"><span class="sw" style="background:{DEV}"></span>In development</span>'
 '<span class="lg"><span class="sw o"></span>Not yet in test</span></div>')

h.append('<div class="grid3">')
h.append(f'<div class="card"><div class="ctitle">Scope readiness by release ticket</div>'
         f'<div class="csub">28 Release 3.1 items · number at the end of each bar is that ticket\'s 3.1 scope</div>{readiness()}{LEG6}</div>')
h.append(f'<div class="card"><div class="ctitle">Open defects by portal</div>'
         f'<div class="csub">{A["open_defects"]} defects on Release 3.1 items · yellow segment is High &amp; Blocker</div>{defects_by_portal()}'
         f'<div class="legend"><span class="lg"><span class="sw" style="background:{YEL}"></span>High / Blocker</span>'
         f'<span class="lg"><span class="sw" style="background:{NAVY}"></span>Medium / Low</span></div></div>')
old=sum(1 for p in P for i,n in enumerate(pp[p]['ageing']) if i==2 for _ in range(n))
h.append(f'<div class="card"><div class="ctitle">Defect ageing</div>'
         f'<div class="csub">{A["open_defects"]} defects by portal · {old} older than 30 days, all in Distribution Portal · oldest {maxage}d</div>{ageing()}'
         f'<div class="legend"><span class="lg"><span class="sw" style="background:{BLUE}"></span>0–5 days</span>'
         f'<span class="lg"><span class="sw" style="background:{YEL}"></span>6–30 days</span>'
         f'<span class="lg"><span class="sw" style="background:{RED}"></span>{band3}</span></div></div>')
h.append('</div>')

h.append('<div class="grid2"><div class="card"><div class="ctitle">Portal position</div>'
         '<div class="csub">Features grouped into the portal they ship to</div><table>'
         '<thead><tr><th>Portal</th><th>Release</th><th class="num">Items</th><th class="num">Progress</th>'
         '<th class="num">Defects</th><th class="num">High</th></tr></thead><tbody>')
for p in ['Channel','Distribution Portal','Admin Portal','Bank Portal']:
    v=pp[p]; g=f'<div class="goal"><span class="goaltag">GOAL</span>{GOAL[p]}</div>' if p in GOAL else ''
    hi=f'<span class="pill">{v["high"]}</span>' if v['high'] else '0'
    h.append(f'<tr><td class="wsname">{p}<div class="cdesc">{PDESC[p]}</div>{g}</td>'
             f'<td><span class="crtag">{v["cr"]}</span></td><td class="num">{v["items"]}</td>'
             f'<td class="num pctcell">{v["pct"]}%</td><td class="num">{v["defects"]}</td><td class="num">{hi}</td></tr>')
h.append('</tbody></table></div>')
h.append(f'<div class="card"><div class="ctitle">High &amp; Blocker load by owner</div>'
         f'<div class="csub">{A["high"]} High &amp; Blocker on Release 3.1 items · full names, none unassigned</div>{owner_bars()}</div></div>')
open('d1_part1.html','w').write('\n'.join(h))
print('part1 written', len('\n'.join(h)))
