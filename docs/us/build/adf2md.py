"""ADF -> GitHub markdown, for the repo mirror of a Jira description.

Usage: python3 adf2md.py <adf.json> <out.md> "<header markdown>"
Covers the node set our US generators emit: heading, paragraph, bulletList,
table, codeBlock, hardBreak, mediaInline (file card), inlineCard (smart link);
marks strong / em / code / link. Colour is dropped: GitHub cannot render it,
so the header line says where the purple changes are."""
import json, sys

MEDIA = {"6c0ed05c-e96f-422d-8c1b-481cdf20f9d2":
         "Reem_Payments_API_PushNotifications_Specification_v0.1.docx"}

def inline(nodes):
    out = []
    for n in nodes:
        t = n["type"]
        if t == "text":
            s, ms = n["text"], {m["type"]: m for m in n.get("marks", [])}
            if not s.strip():
                out.append(s); continue
            if "code" in ms: s = f"`{s}`"
            else: s = s.replace("|", "\\|").replace("<", "&lt;")
            if "strong" in ms: s = f"**{s}**"
            if "em" in ms: s = f"_{s}_"
            if "link" in ms: s = f"[{s}]({ms['link']['attrs']['href']})"
            out.append(s)
        elif t == "hardBreak": out.append("  \n")
        elif t == "mediaInline":
            out.append(f"Attachment on the ticket: `{MEDIA.get(n['attrs']['id'], n['attrs']['id'])}`")
        elif t == "inlineCard":
            u = n["attrs"]["url"]; out.append(f"[{u.rsplit('/', 1)[-1]}]({u})")
        elif t == "mention": out.append(n["attrs"].get("text", "@user"))
    return "".join(out).strip()

def block(n):
    t = n["type"]
    if t == "heading": return "#" * n["attrs"]["level"] + " " + inline(n["content"])
    if t == "paragraph": return inline(n.get("content", []))
    if t == "bulletList":
        return "\n".join("* " + inline(li["content"][0]["content"]) for li in n["content"])
    if t == "codeBlock":
        return f"```{n['attrs'].get('language', '')}\n{n['content'][0]['text']}\n```"
    if t == "table":
        rows = [[inline(c["content"][0].get("content", [])).replace("**", "") if r_i == 0
                 else inline(c["content"][0].get("content", []))
                 for c in r["content"]] for r_i, r in enumerate(n["content"])]
        head = "| " + " | ".join(rows[0]) + " |"
        sep = "|" + "|".join("---" for _ in rows[0]) + "|"
        return "\n".join([head, sep] + ["| " + " | ".join(r) + " |" for r in rows[1:]])
    raise ValueError(f"unhandled node {t}")

doc = json.load(open(sys.argv[1]))
body = [block(n) for n in doc["content"]]
if body and body[0].startswith("_Updated"):      # Jira-only purple note; the header replaces it
    body = body[1:]
open(sys.argv[2], "w").write(sys.argv[3].rstrip() + "\n\n" + "\n\n".join(b for b in body if b) + "\n")
print("ok", len(body), "blocks")
