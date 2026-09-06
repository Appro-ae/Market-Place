#!/usr/bin/env python3
"""
build_review_comment_adf.py — build the PO's coloured review-table comment as ADF.

  python3 build_review_comment_adf.py spec.json --out comment.adf.json [--show]
  python3 build_review_comment_adf.py --example > spec.json

Spec (JSON):
{
  "mention": {"accountId": "712020:…", "text": "@Kha Pham Thuc"},
  "title": "Re-review per checklist — after your 03/09 update",
  "intro": ["paragraph …", "paragraph …"],
  "columns": ["Ref", "Requirement", "Mapping with AMP-2548", "Review Status", "Remaining Gap & Feedback to BA", "Priority"],
  "status_column": 3,
  "rows": [{"cells": ["R1", "Staff sees own applications only", "…", "Done — fix required", "…", "P1"]}],
  "sections": [{"heading": "Other points to close in the same pass:", "numbered": ["…", "…"]}],
  "closing": ["→ Fix R1 defect + R5 decisions (P1) first, then we move this to Ready for Dev."],
  "cc": [{"accountId": "…", "text": "@Antofelix Rajan"}],
  "cc_suffix": " — you can give further feedback if any"
}
Cell and paragraph strings accept **bold** spans. Status text drives the cell colour:
Done → green, Done — fix required / flagged / Partially → yellow, Not Done / Not covered → red.
Post with addCommentToJiraIssue: commentBody = file content (JSON string), contentFormat = "adf".
"""
import argparse
import json
import re
import sys

NAVY, WHITE = "#1a214d", "#ffffff"
GREEN, YELLOW, RED = "#abf5d1", "#fdba23", "#ffbdad"

EXAMPLE = {
    "mention": {"accountId": "<BA accountId from lookupJiraAccountId>", "text": "@BA Name"},
    "title": "Re-review per checklist — after your <date> update",
    "intro": ["Good rework — <what was adopted>. Status per requirement below. **Not Ready for Dev yet — close the yellow/red items first.**"],
    "columns": ["Ref", "Requirement", "Mapping with <KEY> (updated)", "Review Status", "Remaining Gap & Feedback to BA", "Priority"],
    "status_column": 3,
    "rows": [
        {"cells": ["R1", "Staff sees own applications only", "AC1 Staff ID + AC4 attribution + AC5 pre-filter", "Done — fix required", "Design defect: … Fix: …", "P1"]},
        {"cells": ["R2", "Manager sees team applications", "AC6 subtree + AC8 lifecycle", "Done", "One edge left: …", "P2"]},
        {"cells": ["R5", "Unassigned & historical cases", "AC4 untagged rule + IA2 options", "Not Done", "Decisions not made: …", "P1"]}
    ],
    "sections": [{"heading": "Other points to close in the same pass:", "numbered": ["…", "…"]}],
    "closing": ["→ Fix R1 defect + R5 decisions (P1) first, then we move this to Ready for Dev."],
    "cc": [{"accountId": "<CPO accountId>", "text": "@CPO Name"}],
    "cc_suffix": ""
}


def status_color(text):
    t = (text or "").strip().lower()
    if t.startswith("not") or "not covered" in t:
        return RED
    if "fix required" in t or "flag" in t or "partial" in t or t.startswith("open"):
        return YELLOW
    if t.startswith("done") or t.startswith("covered") or t.startswith("confirmed"):
        return GREEN
    return None


def inline(text, extra_marks=None):
    """Turn a string with **bold** spans into ADF text nodes."""
    nodes = []
    for i, part in enumerate(re.split(r"\*\*(.+?)\*\*", text)):
        if part == "":
            continue
        marks = list(extra_marks or [])
        if i % 2 == 1:
            marks.append({"type": "strong"})
        n = {"type": "text", "text": part}
        if marks:
            n["marks"] = marks
        nodes.append(n)
    return nodes


def para(content):
    return {"type": "paragraph", "content": content}


def cell(text, header=False, background=None, bold=False):
    if header:
        content = [para([{"type": "text", "text": text, "marks": [{"type": "strong"}, {"type": "textColor", "attrs": {"color": WHITE}}]}])]
        return {"type": "tableHeader", "attrs": {"background": NAVY}, "content": content}
    marks = [{"type": "strong"}] if bold else None
    node = {"type": "tableCell", "content": [para(inline(text, marks))]}
    if background:
        node["attrs"] = {"background": background}
    return node


def build(spec):
    content = []
    first = []
    if spec.get("mention"):
        first += [{"type": "mention", "attrs": {"id": spec["mention"]["accountId"], "text": spec["mention"]["text"]}},
                  {"type": "text", "text": " "}]
    first += [{"type": "text", "text": spec.get("title", ""), "marks": [{"type": "strong"}]}]
    content.append(para(first))
    for p in spec.get("intro", []):
        content.append(para(inline(p)))

    cols = spec["columns"]
    sc = spec.get("status_column")
    rows = [{"type": "tableRow", "content": [cell(c, header=True) for c in cols]}]
    for r in spec["rows"]:
        cells = []
        for i, text in enumerate(r["cells"]):
            if i == sc:
                cells.append(cell(text, background=status_color(text), bold=True))
            elif i == 0 or i == len(cols) - 1:
                cells.append(cell(text, bold=True))
            else:
                cells.append(cell(text))
        rows.append({"type": "tableRow", "content": cells})
    content.append({"type": "table", "attrs": {"isNumberColumnEnabled": False, "layout": "default"}, "content": rows})

    for s in spec.get("sections", []):
        if s.get("heading"):
            content.append(para(inline("**" + s["heading"] + "**")))
        if s.get("numbered"):
            content.append({"type": "orderedList", "attrs": {"order": 1},
                            "content": [{"type": "listItem", "content": [para(inline(x))]} for x in s["numbered"]]})
        if s.get("bullets"):
            content.append({"type": "bulletList",
                            "content": [{"type": "listItem", "content": [para(inline(x))]} for x in s["bullets"]]})
    for p in spec.get("closing", []):
        content.append(para(inline("**" + p + "**")))
    if spec.get("cc"):
        line = [{"type": "text", "text": "cc: "}]
        for i, m in enumerate(spec["cc"]):
            if i:
                line.append({"type": "text", "text": ", "})
            line.append({"type": "mention", "attrs": {"id": m["accountId"], "text": m["text"]}})
        if spec.get("cc_suffix"):
            line.append({"type": "text", "text": spec["cc_suffix"]})
        content.append(para(line))
    return {"version": 1, "type": "doc", "content": content}


def show(doc):
    def txt(n):
        t = n.get("type")
        if t == "text":
            return n["text"]
        if t == "mention":
            return n["attrs"]["text"]
        inner = "".join(txt(c) for c in n.get("content", []))
        if t == "paragraph":
            return inner + "\n"
        if t in ("tableCell", "tableHeader"):
            bg = n.get("attrs", {}).get("background")
            return inner.rstrip("\n") + (f" ({bg})" if bg and bg != NAVY else "") + " | "
        if t in ("tableRow", "table"):
            return inner + "\n"
        if t == "listItem":
            return " • " + inner
        return inner
    return txt(doc)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("spec", nargs="?")
    ap.add_argument("--out")
    ap.add_argument("--show", action="store_true")
    ap.add_argument("--example", action="store_true")
    args = ap.parse_args()
    if args.example:
        print(json.dumps(EXAMPLE, ensure_ascii=False, indent=2))
        return
    if not args.spec:
        ap.error("spec.json is required (or --example)")
    spec = json.load(open(args.spec, encoding="utf-8"))
    doc = build(spec)
    out = json.dumps(doc, ensure_ascii=False)
    if args.out:
        open(args.out, "w", encoding="utf-8").write(out)
        print(f"wrote {args.out} ({len(out)} chars, {len(spec['rows'])} rows)")
    else:
        print(out)
    if args.show:
        print("\n" + show(doc))


if __name__ == "__main__":
    main()
