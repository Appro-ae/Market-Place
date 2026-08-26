from common import esc, NAVY, BLUE, YEL, RED, LAV
import json, datetime as dt
M = json.load(open('movement.json'))
_pd = dt.date.fromisoformat(M['prev_date']).strftime('%-d %B %Y') if M else ''

CSS_MOVE = """
.move{background:#ffffff;border-radius:16px;padding:22px 24px;margin-bottom:20px}
.movehead{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
.moverow{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:18px}
.mv{background:#edf2ff;border-radius:12px;padding:12px 14px}
.mvl{font-size:11px;opacity:.7;line-height:1.3}
.mvn{font-size:22px;font-weight:900;letter-spacing:-.6px;margin-top:6px;display:flex;align-items:baseline;gap:8px}
.mvd{font-size:12.5px;font-weight:900;padding:2px 8px;border-radius:9px}
.d-good{background:#3b7ef6;color:#fff} .d-bad{background:#d92d20;color:#fff}
.d-flat{background:#ffffff;color:#1a214d;opacity:.55}
.mvp{font-size:10.5px;opacity:.55;margin-top:4px}
.mvsplit{display:grid;grid-template-columns:1.15fr 1fr;gap:20px}
.mvh{font-size:12px;font-weight:900;color:#3b7ef6;margin-bottom:8px;letter-spacing:.2px}
.mvtab{width:100%;border-collapse:collapse;font-size:12px}
.mvtab td{padding:6px 8px;border-bottom:1px solid #edf2ff}
.mvtab td.n{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}
.chip{font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:9px;white-space:nowrap}
.c-fwd{background:#3b7ef6;color:#fff} .c-bck{background:#d92d20;color:#fff}
.mvnone{font-size:12px;opacity:.6;padding:6px 0}
"""

def card():
    if not M: return ''
    h = ['<div class="move">']
    h.append('<div class="movehead"><div><div class="ctitle">Movement since ' + _pd + '</div>'
             '<div class="csub">What changed in the last 24 hours — a backward status move is the signal a percentage hides</div></div></div>')
    h.append('<div class="moverow">')
    for k in M['kpi']:
        h.append(f'<div class="mv"><div class="mvl">{k["label"]}</div>'
                 f'<div class="mvn">{k["now"]}<span class="mvd d-{k["cls"]}">{k["delta"]}</span></div>'
                 f'<div class="mvp">was {k["prev"]}</div></div>')
    h.append('</div>')
    h.append('<div class="mvsplit"><div>')
    h.append('<div class="mvh">Status moves</div>')
    if M['moves']:
        h.append('<table class="mvtab">')
        for x in M['moves']:
            chip = 'c-bck' if x['dir'] == 'backward' else 'c-fwd'
            h.append(f'<tr><td><a href="https://scvaladdin.atlassian.net/browse/{x["key"]}">{x["key"]}</a>'
                     f' <span class="chip {chip}">{x["dir"]}</span></td>'
                     f'<td>{esc(x["feature"])}</td>'
                     f'<td style="opacity:.75">{x["frm"]} → <b>{x["to"]}</b></td></tr>')
        h.append('</table>')
    else:
        h.append('<div class="mvnone">No scope item changed status.</div>')
    h.append('</div><div>')
    h.append('<div class="mvh">Portal movement</div><table class="mvtab">')
    for p in M['portal']:
        h.append(f'<tr><td>{p["portal"]}</td>'
                 f'<td class="n">{p["pct_now"]}% <span class="mvd d-{p["pct_cls"]}">{p["pct_d"]}</span></td>'
                 f'<td class="n">{p["def_now"]} def <span class="mvd d-{p["def_cls"]}">{p["def_d"]}</span></td>'
                 f'<td class="n">{p["hi_now"]} high <span class="mvd d-{p["hi_cls"]}">{p["hi_d"]}</span></td></tr>')
    h.append('</table>')
    if M['fixes']:
        h.append('<div class="mvh" style="margin-top:14px">Fix transitions added</div><table class="mvtab">')
        for f in M['fixes']:
            h.append(f'<tr><td>{esc(f["dev"])}</td><td class="n">{f["delta"]}</td><td class="n">{f["raw"]} total</td></tr>')
        h.append('</table>')
    h.append('</div></div></div>')
    return ''.join(h)
