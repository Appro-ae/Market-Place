from dash2 import *
import json
da=A['dev_age']; order=sorted(da.items(), key=lambda x:-x[1]['total'])
tot=sum(v['total'] for _,v in order); over=sum(v['bands'][3] for _,v in order)
worst=order[0]
h=[]
h.append('<div class="card" style="margin-bottom:20px"><div class="ctitle">Open defect ageing by developer</div>'
 f'<div class="csub">All {tot} open defects currently assigned to the eight named developers, by days since the defect was raised · not limited to Release 3.1</div>'
 '<table><thead><tr><th>Developer</th><th class="num">0–5 days</th><th class="num">6–14 days</th>'
 '<th class="num">15–30 days</th><th class="num">31+ days</th><th class="num">Total</th><th class="num">Oldest</th><th>Read</th></tr></thead><tbody>')
for nm,v in order:
    if v['total']==0:
        h.append(f'<tr class="empty"><td class="wsname">{nm}<div class="sq">{v["squad"]}</div></td>'
                 '<td class="num">—</td><td class="num">—</td><td class="num">—</td><td class="num">—</td>'
                 '<td class="num">0</td><td class="num">—</td><td class="ax2">no open defects</td></tr>'); continue
    cells=''
    for i,n in enumerate(v['bands']):
        cells += f'<td class="num zero">0</td>' if n==0 else f'<td class="num"><span class="cell b{i}">{n}</span></td>'
    old=f'<span class="oldred">{v["oldest"]}d</span>' if v['oldest']>30 else f'{v["oldest"]}d'
    h.append(f'<tr><td class="wsname">{nm}<div class="sq">{v["squad"]}</div></td>{cells}'
             f'<td class="num tot">{v["total"]}</td><td class="num">{old}</td>'
             f'<td class="ax2">{v["overmonth"]}% of their queue is over a month old</td></tr>')
h.append('</tbody></table>'
 f'<div class="pm"><span class="pmtag">PM</span><span class="pmtxt">{over} of the {tot} are over a month old, and '
 f'{worst[1]["bands"][3]} of those sit with {worst[0]} alone.</span></div></div>')

h.append('<div class="rel"><div><div class="relt">Release 3.1 — 31 August 2026</div>'
 '<div class="rels">28 scope items across AMP-2564 and AMP-3305 · defect position from 24 August</div></div>'
 '<div class="relnums">'
 f'<div class="rn"><div class="rnv">{A["open_defects"]}</div><div class="rnl">Open defects</div></div>'
 f'<div class="rn"><div class="rnv">{A["high"]}</div><div class="rnl">High &amp; Blocker</div></div>'
 f'<div class="rn"><div class="rnv">{A["rel_raised_since_cut"]}</div><div class="rnl">Raised since 24 Aug</div></div>'
 f'<div class="rn"><div class="rnv">{A["days_to_release"]}</div><div class="rnl">Days to release</div></div>'
 '</div></div>')

maxage=max(A['per_portal'][p]['oldest'] for p in P)
h.append(f'<div class="card" style="margin-bottom:20px"><div class="ctitle">Release 3.1 defect ageing by portal</div>'
 f'<div class="csub">{A["open_defects"]} open defects · every defect over a month old sits in Distribution Portal · oldest is {maxage} days</div>{rel_ageing()}'
 f'<div class="legend"><span class="lg"><span class="sw" style="background:{BLUE}"></span>0–5 days</span>'
 f'<span class="lg"><span class="sw" style="background:{YEL}"></span>6–30 days</span>'
 f'<span class="lg"><span class="sw" style="background:{RED}"></span>31+ days</span></div></div>')

h.append('<div class="foot">Data pulled live from Jira on 26 August 2026. Raised = Bug created in project AMP between 1 and 26 August. '
 'Closed = Bug with a resolution date in the window (Done, Cancelled or UAT Validated). '
 'Fixes per developer start from Jira status history: <code>status changed from "To Do" to "UAT TESTING" by &lt;developer&gt; '
 'DURING ("2026-08-01","2026-08-27")</code> — the transition the developer performs personally when submitting a fix to test. '
 'This replaces the earlier assignee-field method, which mis-credited handoffs performed by others and missed Nguyen Thi Thuy Phuong as a tester. '
 '<b>Verification applied to all 144 raw transitions:</b> the developer must also have performed the reassignment themselves (3 excluded), '
 'the ticket must not have ended Cancelled (10 excluded), and titles marked not-a-bug are dropped (2 excluded: AMP-3003, AMP-3013). '
 'Per your instruction, Cancelled outcomes are excluded and a first-pass rate is reported alongside the fix count; '
 'a fix is first-pass when the ticket was never rejected from UAT Testing back to To Do. '
 '<b>Full changelog audit completed on all 141 fix tickets.</b> A BA edit disqualifies a fix only when it lands '
 'after the ticket reached the developer — triage-time edits before assignment do not count. '
 '11 tickets failed that test (AMP-2496, 2922, 2970, 2996, 3001, 3031, 3070, 3188, 3200, 3216, 3218), '
 'seven of them Toan\'s, which is why his verified count sits well below his raw transition count. '
 'Developers are Tang Ha Long, LongLH and KhoeHD (Bank) and Toan, Nam, Minh, Quan and Tung (Channel / Admin / DP); '
 'testers receiving handoffs are Hien Nguyen, Mansoor ahmad and Nguyen Thi Thuy Phuong — <b>Faeeq Ajaz is now also receiving and rejecting '
 'developer handoffs in volume and should be confirmed as a tester.</b> '
 'Release 3.1 scope is the 28 items listed under Release 3.1 in each CR\'s release-items table. '
 'Per your Bank-team rule, a Bank Portal defect held by a developer outside the Bank squad is reported under Channel: AMP-3298 (phamhoang.nam) '
 'shows as Channel; AMP-3171 stays Bank Portal because Nguyen Thi Thuy Phuong is a BA.</div>')
h.append('</div></body></html>')
open('d2_part2.html','w').write('\n'.join(h))
print('d2 part2 ok')
