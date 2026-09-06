#!/usr/bin/env python3
"""
shrink_adf.py — reduce the size of an ADF description without losing content, for when
Jira answers CONTENT_LIMIT_EXCEEDED (the limit is on the stored document, not on the text:
a 80 KB compact document passed, 92 KB failed, with only 28.7k characters of text).

  python3 shrink_adf.py in.adf.json --out out.adf.json [--strike-only] [--drop-strikes-from prev.adf.json]
                                     [--del-color #97a0af] [--chunk-size 20000]

Always applied (lossless):
  - adjacent text nodes with identical marks are merged
  - empty "attrs": {} on table cells / headers are removed
Options:
  --strike-only            keep the strikethrough on removed text but drop its grey colour mark
  --drop-strikes-from P    remove struck runs that were already struck in a previous version P
                           (i.e. accept the previous round's deletions, keep this round's)
Writes <out>, <out>.chunk_N.txt and prints sizes before/after.
"""
import argparse
import hashlib
import json


def is_struck(n):
    return n.get("type") == "text" and any(m["type"] == "strike" for m in n.get("marks", []))


def struck_texts(doc):
    acc = set()

    def walk(n):
        if is_struck(n):
            acc.add(n["text"])
        for c in n.get("content", []):
            walk(c)
    walk(doc)
    return acc


def transform(node, opts, old_struck):
    t = node.get("type")
    if t in ("tableCell", "tableHeader") and node.get("attrs") == {}:
        node.pop("attrs")
    if "content" in node:
        new = []
        for c in node["content"]:
            c = transform(c, opts, old_struck)
            if c is None:
                continue
            if is_struck(c):
                if opts.drop_old and c["text"] in old_struck:
                    # drop the run and a separator space that may precede it
                    if new and new[-1].get("type") == "text" and new[-1]["text"] == " " and not new[-1].get("marks"):
                        new.pop()
                    continue
                if opts.strike_only:
                    c["marks"] = [m for m in c["marks"] if not (m["type"] == "textColor" and m["attrs"]["color"].lower() == opts.del_color.lower())]
            # merge with previous text node when marks are identical
            if new and c.get("type") == "text" and new[-1].get("type") == "text" and new[-1].get("marks") == c.get("marks"):
                new[-1]["text"] += c["text"]
                continue
            new.append(c)
        # a paragraph that lost all its content stays valid as an empty paragraph
        node["content"] = new
        if t in ("listItem",) and (not new or new[0]["type"] != "paragraph"):
            node["content"].insert(0, {"type": "paragraph"})
        if t in ("tableCell", "tableHeader") and not new:
            node["content"] = [{"type": "paragraph"}]
    return node


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("adf")
    ap.add_argument("--out", required=True)
    ap.add_argument("--strike-only", action="store_true")
    ap.add_argument("--drop-strikes-from", dest="prev")
    ap.add_argument("--del-color", default="#97a0af")
    ap.add_argument("--chunk-size", type=int, default=20000)
    args = ap.parse_args()
    args.drop_old = bool(args.prev)

    doc = json.load(open(args.adf, encoding="utf-8"))
    before = len(json.dumps(doc, ensure_ascii=False, separators=(",", ":")))
    old = struck_texts(json.load(open(args.prev, encoding="utf-8"))) if args.prev else set()
    doc = transform(doc, args, old)
    if args.drop_old:
        # containers emptied by the dropped runs (struck tables, bullets) disappear too
        import os
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from build_adf_from_html import prune_empty, validate
        doc = prune_empty(doc)
        validate(doc)
    compact = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
    open(args.out, "w", encoding="utf-8").write(compact)
    n = max(1, -(-len(compact) // args.chunk_size))
    size = -(-len(compact) // n)
    base = args.out[:-len(".adf.json")] if args.out.endswith(".adf.json") else args.out
    for k in range(n):
        open(f"{base}.chunk_{k+1}.txt", "w", encoding="utf-8").write(compact[k * size:(k + 1) * size])
    print(json.dumps({"chars_before": before, "chars_after": len(compact), "chunks": n,
                      "md5": hashlib.md5(compact.encode("utf-8")).hexdigest(),
                      "strike_only": args.strike_only, "dropped_old_strikes": args.drop_old}, indent=1))


if __name__ == "__main__":
    main()
