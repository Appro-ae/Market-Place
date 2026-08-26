from common import *
import json, datetime as dt
F=json.load(open('fixtable.json'))
days=[dt.date.fromisoformat(x) for x in A['days']]
R,K=A['raised'],A['closed']; cR,cK=A['cumR'],A['cumK']
P=['Distribution Portal','Admin Portal','Bank Portal','Channel']

def arrival():
    n=len(days); mx=max(max(R),max(K),1)
    L,T,PH,W_=34,16,180,900; bw=W_/n; gw=bw*0.38
    h=T+PH+42; s=[f'<svg viewBox="0 0 {L+W_+16} {h}">']
    step=5 if mx<=25 else 10
    t=0
    while t<=mx:
        y=T+PH-t/mx*PH
        s.append(f'<line x1="{L}" y1="{y:.1f}" x2="{L+W_}" y2="{y:.1f}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{L-6}" y="{y+4:.1f}" text-anchor="end" class="ax">{t}</text>'); t+=step
    for i,d in enumerate(days):
        x=L+i*bw
        hr=R[i]/mx*PH; hk=K[i]/mx*PH
        s.append(f'<rect x="{x+bw*0.08:.1f}" y="{T+PH-hr:.1f}" width="{gw:.1f}" height="{hr:.1f}" fill="{RED}"/>')
        s.append(f'<rect x="{x+bw*0.08+gw:.1f}" y="{T+PH-hk:.1f}" width="{gw:.1f}" height="{hk:.1f}" fill="{BLUE}"/>')
        if d.weekday()==0 or i==0 or i==len(days)-1:
            s.append(f'<text x="{x+bw/2:.1f}" y="{T+PH+16}" text-anchor="middle" class="tiny">{d.day}</text>')
    s.append(f'<line x1="{L}" y1="{T+PH}" x2="{L+W_}" y2="{T+PH}" stroke="{NAVY}" stroke-width="1.5"/>')
    s.append(f'<text x="{L+W_/2}" y="{h-8}" text-anchor="middle" class="axs">August 2026</text></svg>')
    return ''.join(s)

def cumulative():
    n=len(days); mx=max(cR[-1],1)
    L,T,PH,W_=42,16,190,560
    h=T+PH+40; s=[f'<svg viewBox="0 0 {L+W_+20} {h}">']
    step=50 if mx>150 else 25
    t=0
    while t<=mx:
        y=T+PH-t/mx*PH
        s.append(f'<line x1="{L}" y1="{y:.1f}" x2="{L+W_}" y2="{y:.1f}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{L-6}" y="{y+4:.1f}" text-anchor="end" class="ax">{t}</text>'); t+=step
    def pts(a): return ' '.join(f'{L+i*(W_/(n-1)):.1f},{T+PH-v/mx*PH:.1f}' for i,v in enumerate(a))
    area=pts(cR)+' '+' '.join(f'{L+i*(W_/(n-1)):.1f},{T+PH-v/mx*PH:.1f}' for i,v in reversed(list(enumerate(cK))))
    s.append(f'<polygon points="{area}" fill="{RED}" opacity="0.13"/>')
    s.append(f'<polyline points="{pts(cR)}" fill="none" stroke="{RED}" stroke-width="2.5"/>')
    s.append(f'<polyline points="{pts(cK)}" fill="none" stroke="{BLUE}" stroke-width="2.5"/>')
    gap=cR[-1]-cK[-1]
    ymid=T+PH-(cR[-1]+cK[-1])/2/mx*PH
    s.append(f'<text x="{L+W_-6}" y="{ymid:.1f}" text-anchor="end" class="val" fill="{RED}">gap {gap}</text>')
    for i,d in enumerate(days):
        if d.weekday()==0 or i==0 or i==n-1:
            s.append(f'<text x="{L+i*(W_/(n-1)):.1f}" y="{T+PH+16}" text-anchor="middle" class="tiny">{d.day}</text>')
    s.append(f'<line x1="{L}" y1="{T+PH}" x2="{L+W_}" y2="{T+PH}" stroke="{NAVY}" stroke-width="1.5"/>')
    s.append(f'<text x="{L+W_/2}" y="{h-6}" text-anchor="middle" class="axs">August 2026</text></svg>')
    return ''.join(s)

def cycle():
    lbl=['0–2 days','3–7 days','8–14 days','15–30 days','31+ days']
    v=A['cyc_bands']; cols=[BLUE,BLUE,NAVY,NAVY,RED]; mx=max(v)
    L,W_=96,300; sc=W_/mx*0.86; bh,gp=24,16
    h=10+len(v)*(bh+gp); s=[f'<svg viewBox="0 0 {L+W_+60} {h}">']; y=6
    for i,n in enumerate(v):
        s.append(f'<text x="{L-8}" y="{y+17}" text-anchor="end" class="axb2">{lbl[i]}</text>')
        s.append(f'<rect x="{L}" y="{y}" width="{n*sc:.1f}" height="{bh}" fill="{cols[i]}"/>')
        s.append(f'<text x="{L+n*sc+8:.1f}" y="{y+17}" class="val">{n}</text>'); y+=bh+gp
    s.append(f'<line x1="{L}" y1="0" x2="{L}" y2="{h-10}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)

def rel_ageing():
    rows=[(p,A['per_portal'][p]['ageing']) for p in P]
    mx=max(sum(r[1]) for r in rows) or 1
    L,W_=180,720; sc=W_/mx*0.9; bh,gp=26,20
    h=14+len(rows)*(bh+gp)+26; s=[f'<svg viewBox="0 0 {L+W_+70} {h}">']
    t=0; step=5
    while t<=mx:
        x=L+t*sc; s.append(f'<line x1="{x:.1f}" y1="14" x2="{x:.1f}" y2="{h-26}" stroke="{LAV}" stroke-width="1"/>')
        s.append(f'<text x="{x:.1f}" y="{h-8}" text-anchor="middle" class="ax">{t}</text>'); t+=step
    y=22; cols=[BLUE,YEL,RED]
    for p,b in rows:
        s.append(f'<text x="{L-8}" y="{y+18}" text-anchor="end" class="axb2">{p}</text>')
        if sum(b)==0:
            s.append(f'<text x="{L+6}" y="{y+18}" class="axs">no open defects</text>'); y+=bh+gp; continue
        x=L
        for i,n in enumerate(b):
            if not n: continue
            w=n*sc
            s.append(f'<rect x="{x:.1f}" y="{y}" width="{w:.1f}" height="{bh}" fill="{cols[i]}"/>')
            if w>24: s.append(f'<text x="{x+w/2:.1f}" y="{y+18}" text-anchor="middle" class="inbar" fill="#ffffff">{n}</text>')
            x+=w
        s.append(f'<text x="{x+10:.1f}" y="{y+18}" class="val">{sum(b)}</text>')
        y+=bh+gp
    s.append(f'<line x1="{L}" y1="14" x2="{L}" y2="{h-26}" stroke="{NAVY}" stroke-width="1.5"/></svg>')
    return ''.join(s)
