#!/usr/bin/env python3
"""
build_adf_from_html.py — rebuild a Jira description as ADF (Atlassian Document Format) from
Jira's *rendered* HTML, optionally applying tracked edits, so the BA's tables, in-cell
bullets, colours and smart links survive a programmatic update.

Typical use
  python3 build_adf_from_html.py --html snapshot.html --edits edits.json --out v5 --show-edits
  python3 build_adf_from_html.py --html live.html --accept --out v5-clean   # after BA acceptance

Inputs
  --html    renderedFields.description from getJiraIssue (expand=renderedFields), saved to a file
  --edits   JSON list of operations applied to the HTML string before conversion:
              {"op":"replace","find":"…","with":"…","count":1}
              {"op":"replace_between","start":"…","end":"…","find":"…","with":"…","count":5}
              {"op":"wrap_region","start":"…","end":"…","tag":"del","after":"…html…"}
            Inside `with` / `after`, mark inserted text as <ins>…</ins> and removed text as
            <del>…</del>. Any HTML the renderer emits (<b>, <tt>, <font color>, <ul><li>,
            <tr><td>, <br/>) is accepted in the replacement strings.
  --accept  strip struck text and the highlight colour (turns tracked changes into clean text)

Outputs (all prefixed by --out)
  .adf.json (compact, paste into editJiraIssue fields.description with contentFormat adf)
  .adf.pretty.json, .edited.html, .preview.html, .chunk_N.txt, .summary.json
"""
import argparse
import hashlib
import json
import re
import sys

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:  # pragma: no cover
    sys.exit("beautifulsoup4 is required: pip3 install beautifulsoup4")

DEFAULT_INS = "#6554c0"   # purple — inserted / changed
DEFAULT_DEL = "#97a0af"   # grey  — removed (with strikethrough)
BLOCKS = {"p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table", "div", "tbody", "thead",
          "blockquote", "pre", "hr"}


def die(msg):
    print("ABORT: " + msg, file=sys.stderr)
    sys.exit(1)


# ----------------------------------------------------------------------------- edits
def apply_edits(html, ops):
    for i, op in enumerate(ops, 1):
        kind = op.get("op", "replace")
        try:
            if kind == "replace":
                want = op.get("count", 1)
                n = html.count(op["find"])
                if n != want:
                    die(f"op {i} replace: expected {want} occurrence(s), found {n}: {op['find'][:140]!r}")
                html = html.replace(op["find"], op["with"])
            elif kind == "replace_between":
                a = html.index(op["start"])
                b = html.index(op["end"], a)
                seg = html[a:b]
                n = seg.count(op["find"])
                want = op.get("count", n)
                if n == 0 or n != want:
                    die(f"op {i} replace_between: expected {want} occurrence(s), found {n}: {op['find'][:140]!r}")
                html = html[:a] + seg.replace(op["find"], op["with"]) + html[b:]
            elif kind == "wrap_region":
                a = html.index(op["start"])
                b = html.index(op["end"], a) + len(op["end"])
                tag = op.get("tag", "del")
                html = html[:a] + f"<{tag}>" + html[a:b] + f"</{tag}>" + op.get("after", "") + html[b:]
            else:
                die(f"op {i}: unknown op {kind!r}")
        except ValueError as e:
            die(f"op {i} {kind}: marker not found ({e})")
        except KeyError as e:
            die(f"op {i} {kind}: missing key {e}")
    return html


# ----------------------------------------------------------------------------- html → adf
class Converter:
    def __init__(self, ins_color, del_color, accept=False, allow_image_loss=False, strip_old=False):
        self.ins = ins_color.lower()
        self.dele = del_color.lower()
        self.accept = accept
        self.strip_old = strip_old
        self.allow_image_loss = allow_image_loss
        self.images_dropped = 0

    # --- marks
    def marks_for(self, ctx):
        if ctx.get("del"):
            m = [{"type": "strike"}, {"type": "textColor", "attrs": {"color": self.dele}}]
            if ctx.get("strong"):
                m.append({"type": "strong"})
            return m
        color = self.ins if ctx.get("ins") else ctx.get("color")
        if self.accept and color and color.lower() == self.ins:
            color = None                      # accepted change: keep the text, drop the highlight
        if ctx.get("code"):
            m = [{"type": "code"}]
            if ctx.get("link"):
                m.append({"type": "link", "attrs": {"href": ctx["link"]}})
            return m
        m = []
        if ctx.get("strong"):
            m.append({"type": "strong"})
        if ctx.get("em"):
            m.append({"type": "em"})
        if ctx.get("underline"):
            m.append({"type": "underline"})
        if ctx.get("strike"):
            m.append({"type": "strike"})
        if ctx.get("subsup"):
            m.append({"type": "subsup", "attrs": {"type": ctx["subsup"]}})
        if ctx.get("link"):
            m.append({"type": "link", "attrs": {"href": ctx["link"]}})
        if color:
            m.append({"type": "textColor", "attrs": {"color": color.lower()}})
        return m

    def text_node(self, text, ctx):
        n = {"type": "text", "text": text}
        m = self.marks_for(ctx)
        if m:
            n["marks"] = m
        return n

    @staticmethod
    def is_macro(t):
        return isinstance(t, Tag) and t.name == "span" and "jira-issue-macro" in (t.get("class") or [])

    def removed(self, ctx):
        """In --accept mode, text that was struck or carries the removal colour is dropped.
        In --strip-old-strikes mode only pre-existing strikes (earlier rounds) are dropped;
        this round's <del> runs stay visible."""
        if self.accept:
            return ctx.get("del") or ctx.get("strike") or (ctx.get("color") or "").lower() == self.dele
        if self.strip_old and not ctx.get("del"):
            return bool(ctx.get("strike")) or (ctx.get("color") or "").lower() == self.dele
        return False

    # --- inline
    def inline(self, children, ctx, out):
        kids = list(children)
        for idx, c in enumerate(kids):
            prev = kids[idx - 1] if idx > 0 else None
            nxt = kids[idx + 1] if idx + 1 < len(kids) else None
            if self.removed(ctx) and not (isinstance(c, Tag) and c.name == "br"):
                continue
            if isinstance(c, NavigableString):
                t = str(c)
                if t.strip() == "" and "\n" in t:
                    continue
                if nxt is not None and self.is_macro(nxt):
                    t = re.sub(r"\n[ \t]*$", "", t)
                if prev is not None and (self.is_macro(prev) or (isinstance(prev, Tag) and prev.name == "br")):
                    t = re.sub(r"^\n", "", t)
                if t == "":
                    continue
                out.append(self.text_node(t, ctx))
            elif isinstance(c, Tag):
                n = c.name
                if n == "br":
                    out.append({"type": "hardBreak"})
                elif self.is_macro(c):
                    a = c.find("a", href=True)
                    key = (c.get("data-jira-key") or (a.get_text(strip=True) if a else "")).strip()
                    # Jira auto-links ticket keys typed as plain text; inside tracked changes
                    # (or text already carrying the highlight colour) keep them as text.
                    if (ctx.get("del") or ctx.get("ins") or ctx.get("strike")
                            or (ctx.get("color") or "").lower() in (self.ins, self.dele)):
                        out.append(self.text_node(key, ctx))
                    else:
                        url = a["href"] if a else key
                        out.append({"type": "inlineCard", "attrs": {"url": url}})
                elif n == "img":
                    self.images_dropped += 1
                elif n == "a":
                    href = c.get("href")
                    if not href:
                        continue  # <a name="…"> anchor
                    # unresolved smart links render as <a title="smart-link">https://…/browse/KEY</a>
                    if c.get("title") == "smart-link" or c.get_text(strip=True) == href:
                        if ctx.get("del") or ctx.get("ins"):
                            out.append(self.text_node(href.rsplit("/", 1)[-1], ctx))
                        else:
                            out.append({"type": "inlineCard", "attrs": {"url": href}})
                    else:
                        self.inline(c.children, {**ctx, "link": href}, out)
                elif n in ("b", "strong"):
                    self.inline(c.children, {**ctx, "strong": True}, out)
                elif n in ("i", "em"):
                    self.inline(c.children, {**ctx, "em": True}, out)
                elif n == "u":
                    self.inline(c.children, {**ctx, "underline": True}, out)
                elif n in ("s", "strike"):
                    self.inline(c.children, {**ctx, "strike": True}, out)
                elif n in ("tt", "code"):
                    self.inline(c.children, {**ctx, "code": True}, out)
                elif n == "sub":
                    self.inline(c.children, {**ctx, "subsup": "sub"}, out)
                elif n == "sup":
                    self.inline(c.children, {**ctx, "subsup": "sup"}, out)
                elif n == "font":
                    self.inline(c.children, {**ctx, "color": c.get("color")}, out)
                elif n == "ins":
                    self.inline(c.children, {**ctx, "ins": True}, out)
                elif n == "del":
                    self.inline(c.children, {**ctx, "del": True}, out)
                elif n == "span":
                    self.inline(c.children, ctx, out)
                elif n in BLOCKS:
                    die(f"block element <{n}> found in inline context; restructure the edit")
                else:
                    self.inline(c.children, ctx, out)
        return out

    # --- blocks
    def blocks(self, children, ctx):
        out, run = [], []

        def flush():
            nonlocal run
            if run:
                inl = self.inline(run, ctx, [])
                if inl:
                    out.append({"type": "paragraph", "content": inl})
                run = []

        for c in children:
            if isinstance(c, Tag) and c.name in BLOCKS:
                flush()
                out.extend(self.block(c, ctx))
            elif isinstance(c, Tag) and c.name in ("ins", "del") and any(
                    isinstance(g, Tag) and g.name in BLOCKS for g in c.children):
                flush()
                out.extend(self.blocks(c.children, {**ctx, c.name: True}))
            else:
                run.append(c)
        flush()
        return out

    def block(self, t, ctx):
        n = t.name
        if n == "p":
            inl = self.inline(t.children, ctx, [])
            return [{"type": "paragraph", "content": inl}] if inl else [{"type": "paragraph"}]
        if n in ("h1", "h2", "h3", "h4", "h5", "h6"):
            return [{"type": "heading", "attrs": {"level": int(n[1])}, "content": self.inline(t.children, ctx, [])}]
        if n in ("ul", "ol"):
            items = []
            for li in t.find_all("li", recursive=False):
                content = self.blocks(li.children, ctx)
                if not content or content[0]["type"] != "paragraph":
                    content.insert(0, {"type": "paragraph"})
                items.append({"type": "listItem", "content": content})
            node = {"type": "bulletList" if n == "ul" else "orderedList", "content": items}
            if n == "ol":
                node["attrs"] = {"order": 1}
            return [node]
        if n in ("div", "tbody", "thead"):
            return self.blocks(t.children, ctx)
        if n == "table":
            rows = []
            for tr in t.find_all("tr"):
                cells = []
                for cell in tr.find_all(["th", "td"], recursive=False):
                    content = self.blocks(cell.children, ctx) or [{"type": "paragraph"}]
                    cells.append({"type": "tableHeader" if cell.name == "th" else "tableCell",
                                  "attrs": {}, "content": content})
                rows.append({"type": "tableRow", "content": cells})
            return [{"type": "table", "attrs": {"isNumberColumnEnabled": False, "layout": "default"}, "content": rows}]
        if n == "blockquote":
            return [{"type": "blockquote", "content": self.blocks(t.children, ctx) or [{"type": "paragraph"}]}]
        if n == "pre":
            return [{"type": "codeBlock", "attrs": {}, "content": [{"type": "text", "text": t.get_text()}]}]
        if n == "hr":
            return [{"type": "rule"}]
        die(f"unexpected block <{n}>")

    def convert(self, soup):
        if not self.allow_image_loss:
            imgs = [i for i in soup.find_all("img") if not any(
                self.is_macro(p) for p in i.parents if isinstance(p, Tag))]
            if imgs:
                die(f"{len(imgs)} image(s) in the description cannot be rebuilt as ADF media; "
                    "edit those parts in Jira by hand or pass --allow-image-loss")
        return {"version": 1, "type": "doc", "content": self.blocks(soup.contents, {})}


# ----------------------------------------------------------------------------- validation
INLINE_TYPES = {"text", "hardBreak", "inlineCard"}
ALLOWED_MARKS = {"strong", "em", "underline", "strike", "subsup", "link", "textColor", "code"}


def validate(node, path="doc"):
    t = node["type"]
    if t == "text":
        assert node["text"] != "", path + ": empty text"
        types = [m["type"] for m in node.get("marks", [])]
        assert all(x in ALLOWED_MARKS for x in types), path + f": unknown mark in {types}"
        if "code" in types:
            assert set(types) <= {"code", "link"}, path + ": code combined with other marks"
        return
    for i, c in enumerate(node.get("content", [])):
        validate(c, f"{path}/{t}[{i}]")
    if t in ("paragraph", "heading"):
        assert all(c["type"] in INLINE_TYPES for c in node.get("content", [])), path + ": block inside inline container"
    if t == "listItem":
        assert node["content"] and node["content"][0]["type"] == "paragraph", path + ": list item must start with a paragraph"
    if t in ("tableCell", "tableHeader"):
        assert node["content"], path + ": empty cell"


# ----------------------------------------------------------------------------- rendering
def render_text(doc, ins_color, del_color):
    """Plain-text rendering with [+inserted+] and [-removed-] markers (for review)."""
    def mk(n):
        t = n["text"]
        ms = {m["type"]: m for m in n.get("marks", [])}
        if "strike" in ms and ms.get("textColor", {}).get("attrs", {}).get("color") == del_color:
            return "[-" + t + "-]"
        if ms.get("textColor", {}).get("attrs", {}).get("color") == ins_color:
            return "[+" + t + "+]"
        if "code" in ms:
            return "`" + t + "`"
        return t

    def txt(node):
        ty = node.get("type")
        if ty == "text":
            return mk(node)
        if ty == "inlineCard":
            return "<<" + node["attrs"]["url"].rsplit("/", 1)[-1] + ">>"
        if ty == "hardBreak":
            return "⏎"
        inner = "".join(txt(c) for c in node.get("content", []))
        if ty == "heading":
            return "\n## " + inner + "\n"
        if ty == "paragraph":
            return inner + "\n"
        if ty == "listItem":
            return " • " + inner
        if ty in ("tableCell", "tableHeader"):
            return inner.rstrip("\n") + " | "
        if ty in ("tableRow", "table"):
            return inner + "\n"
        return inner
    return txt(doc)


def count_nodes(node, t):
    return (1 if node.get("type") == t else 0) + sum(count_nodes(c, t) for c in node.get("content", []))


def is_empty(node):
    t = node.get("type")
    if t in ("text", "inlineCard", "hardBreak"):
        return t == "text" and node["text"].strip() == ""
    return all(is_empty(c) for c in node.get("content", []))


def prune_empty(node, keep_one=False):
    """After --accept, drop the containers whose text was entirely removed: empty list items,
    lists, table rows, tables and stray empty paragraphs (a cell keeps one empty paragraph)."""
    t = node.get("type")
    if "content" not in node:
        return node
    kids = [prune_empty(c, keep_one=(t in ("tableCell", "tableHeader")))
            for c in node["content"]]
    kept = []
    for c in kids:
        ct = c.get("type")
        if ct in ("listItem", "bulletList", "orderedList", "tableRow", "table", "blockquote") and is_empty(c):
            continue
        if ct == "paragraph" and is_empty(c) and t != "listItem":
            continue
        kept.append(c)
    if not kept and keep_one:
        kept = [{"type": "paragraph"}]
    if t == "listItem" and (not kept or kept[0]["type"] != "paragraph"):
        kept.insert(0, {"type": "paragraph"})
    node["content"] = kept
    return node


# ----------------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--html", required=True, help="rendered HTML snapshot of the description")
    ap.add_argument("--edits", help="JSON list of edit operations")
    ap.add_argument("--out", required=True, help="output prefix, e.g. v5 or /path/v5")
    ap.add_argument("--ins-color", default=DEFAULT_INS)
    ap.add_argument("--del-color", default=DEFAULT_DEL)
    ap.add_argument("--accept", action="store_true", help="strip struck text and highlight colour (clean version)")
    ap.add_argument("--strip-old-strikes", action="store_true",
                    help="drop text struck in earlier rounds (already reviewed) but keep this round's <del> runs; "
                         "use when Jira answers CONTENT_LIMIT_EXCEEDED")
    ap.add_argument("--allow-image-loss", action="store_true")
    ap.add_argument("--chunk-size", type=int, default=20000)
    ap.add_argument("--show-edits", action="store_true", help="print the blocks that carry tracked changes")
    args = ap.parse_args()

    html = open(args.html, encoding="utf-8").read()
    # pre-existing underline/strike from the renderer must not be confused with tracked changes
    html = re.sub(r"<(/?)ins\b", r"<\1u", html)
    html = re.sub(r"<(/?)del\b", r"<\1s", html)

    if args.edits:
        ops = json.load(open(args.edits, encoding="utf-8"))
        html = apply_edits(html, ops)

    soup = BeautifulSoup(html, "html.parser")
    # --accept is handled inside the converter: struck / removal-coloured runs are dropped,
    # highlight-coloured runs are emitted without the colour (see Converter.inline/marks_for).
    conv = Converter(args.ins_color, args.del_color, accept=args.accept, allow_image_loss=args.allow_image_loss,
                     strip_old=args.strip_old_strikes)
    doc = conv.convert(soup)
    if args.accept or args.strip_old_strikes:
        doc = prune_empty(doc)
    validate(doc)

    compact = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    open(args.out + ".adf.json", "w", encoding="utf-8").write(compact)
    open(args.out + ".adf.pretty.json", "w", encoding="utf-8").write(json.dumps(doc, ensure_ascii=False, indent=1))
    open(args.out + ".edited.html", "w", encoding="utf-8").write(html)
    css = ("<style>body{font-family:Arial,sans-serif;font-size:13px;max-width:1100px;margin:20px auto;color:#172b4d}"
           "table{border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ccc;padding:5px 8px;vertical-align:top}"
           "th{background:#f4f5f7}ins{color:%s;text-decoration:none;font-weight:600}del{color:%s}img{display:none}"
           ".aui-lozenge{font-size:10px;background:#eee;padding:1px 4px;border-radius:3px}</style>" % (args.ins_color, args.del_color))
    open(args.out + ".preview.html", "w", encoding="utf-8").write(
        '<!doctype html><html><head><meta charset="utf-8">' + css + "</head><body>" + html + "</body></html>")

    nchunks = max(1, -(-len(compact) // args.chunk_size))
    size = -(-len(compact) // nchunks)
    for k in range(nchunks):
        open(f"{args.out}.chunk_{k+1}.txt", "w", encoding="utf-8").write(compact[k * size:(k + 1) * size])

    summary = {
        "bytes": len(compact.encode("utf-8")),
        "chars": len(compact),
        "md5": hashlib.md5(compact.encode("utf-8")).hexdigest(),
        "chunks": nchunks,
        "counts": {t: count_nodes(doc, t) for t in ("heading", "paragraph", "table", "tableRow", "listItem",
                                                     "inlineCard", "hardBreak", "text")},
        "ins_runs": compact.count(args.ins_color.lower()),
        "del_runs": compact.count(args.del_color.lower()),
        "images_dropped": conv.images_dropped,
        "ins_color": args.ins_color.lower(),
        "del_color": args.del_color.lower(),
    }
    open(args.out + ".summary.json", "w", encoding="utf-8").write(json.dumps(summary, indent=1))
    print(json.dumps(summary, indent=1))

    if args.show_edits:
        text = render_text(doc, args.ins_color.lower(), args.del_color.lower())
        print("\n=== blocks with tracked changes ===")
        for block in re.split(r"\n(?=## |\n)", text):
            if "[+" in block or "[-" in block:
                print(block.strip() + "\n---")


if __name__ == "__main__":
    main()
