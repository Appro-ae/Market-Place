from dash1 import *
P2=['Channel','Distribution Portal','Admin Portal','Bank Portal']
h=[]
h.append('<div class="card" style="margin-bottom:20px"><div class="ctitle">Feature progress</div>'
 '<div class="csub">Every Release 3.1 feature, grouped by portal, with the tickets that make it up · progress is weighted on '
 'delivery stage: UAT Validated 100%, in UAT testing 75%, tested with bugs 50%, implemented 40%, in development 25%, not yet in test 0%</div>')
h.append(f'<div class="hero"><span class="heronum">{A["prog"]}%</span><span class="herotxt">'
 f'Weighted completion across the 28 Release 3.1 items — up from 59% yesterday.<br>'
 f'Distribution Portal still carries 16 of the 28 items at {A["per_portal"]["Distribution Portal"]["pct"]}%; '
 f'Admin Portal slipped to {A["per_portal"]["Admin Portal"]["pct"]}% when AMP-3231 went back to tested-with-bugs.</span></div>')
h.append('<table><thead><tr><th>Feature</th><th>What it delivers</th><th class="num">Items</th>'
         '<th>Delivery stage mix</th><th class="num">Progress</th></tr></thead><tbody>')
for p in P2:
    fk=[k for k in A['feats'] if k.startswith(p+'||')]
    items=[s for s in A['scope'].values() if s['portal']==p]
    n=len(items)
    from common import A as _A
    mixp=[0]*6
    for k in fk:
        for i,v in enumerate(A['feats'][k]['mix']): mixp[i]+=v
    g=f'<div class="goal"><span class="goaltag">GOAL</span>{GOAL[p]}</div>' if p in GOAL else ''
    h.append(f'<tr class="catrow"><td colspan="2">{p} <span class="fcount">{len(fk)} features</span>{g}</td>'
             f'<td class="num">{n}</td><td class="progcell">{mixbar(mixp,n)}</td>'
             f'<td class="num pctcell">{A["per_portal"][p]["pct"]}%</td></tr>')
    for k in sorted(fk, key=lambda x:-A['feats'][x]['items']):
        f=k.split('||')[1]; v=A['feats'][k]
        chips=' '.join(f'<a class="kx" href="{U}{kk}">{kk}</a>' for kk in v['keys'])
        h.append(f'<tr><td class="wsname sub">{f}<div class="keys">{chips}</div></td>'
                 f'<td class="fdesc">{esc(FDESC.get(f,""))}</td><td class="num">{v["items"]}</td>'
                 f'<td class="progcell">{mixbar(v["mix"],v["items"])}</td>'
                 f'<td class="num pctcell">{v["pct"]}%</td></tr>')
h.append('</tbody></table>'+LEG6+'</div>')

h.append(f'<div class="card"><div class="ctitle">High &amp; Blocker defects — full list ({A["high"]})</div>'
 '<div class="csub">Parent = the scope item the defect is linked to · ageing owner = who it sits with now, and how long · age in red beyond 5 days</div>'
 '<table><thead><tr><th>Key</th><th>Portal</th><th>Feature</th><th>Summary</th><th>Parent</th>'
 '<th>Status</th><th>Priority</th><th class="num">Age</th><th>Ageing owner</th></tr></thead><tbody>')
for b in A['high_list']:
    age=f'<span class="oldred">{b["age"]}d</span>' if b['age']>5 else f'{b["age"]}d'
    rule=' <span class="crtag">bank-team rule</span>' if b['rule'] else ''
    h.append(f'<tr><td><a href="{U}{b["key"]}">{b["key"]}</a></td><td>{b["portal"]}{rule}</td><td>{esc(b["feature"])}</td>'
             f'<td class="sumcell">{esc(b["summary"])}</td><td><a class="parent" href="{U}{b["parent"]}">{b["parent"]}</a></td>'
             f'<td>{b["status"]}</td><td><span class="pill">{b["priority"]}</span></td><td class="num">{age}</td>'
             f'<td>{esc(b["owner"])}<div class="held">holding {b["age"]}d</div></td></tr>')
h.append('</tbody></table></div>')

h.append('<div class="foot">Data pulled live from Jira on 26 August 2026. Scope = the 28 items listed under Release 3.1 '
 '(31 August 2026) in the release-items tables of AMP-2564 (21) and AMP-3305 (7); Release 3.2 items are excluded. '
 'Open defect = Bug in To Do / In Progress / Ready To Clarify / UAT Testing traced to a scope item through its issue links; '
 'Done, Cancelled and UAT Validated excluded. Portal categories come from the Category column of each CR\'s own release-items table, '
 'normalised through Super Portal → Bank Portal. Per your Bank-team rule, a Bank Portal defect held by a developer outside the Bank squad '
 'is reported under Channel: AMP-3298 (held by phamhoang.nam) shows as Channel, while AMP-3171 stays under Bank Portal because '
 'Nguyen Thi Thuy Phuong is a BA, not a developer. AMP-2079 (consolidated testing catch-all) is excluded from categorisation. '
 '<b>Discrepancies found this run:</b> AMP-3305\'s Release 3.1 table is headed "8 items" but lists 7 rows; AMP-3323 is linked to AMP-2564 '
 'and labelled P1 but does not appear in the CR table, while AMP-3237 is in the table but is not returned by the CR\'s own P1 filter; '
 'AMP-2564\'s Package Timeline gives Release 3.2 as 4 September while its own 3.2 table heading says 7 September. '
 'The oldest open defect is 61 days, so the third ageing band is shown as 31+ rather than the standard 31–60.</div>')
h.append('</div></body></html>')
open('d1_part2.html','w').write('\n'.join(h))
print('part2 written')
