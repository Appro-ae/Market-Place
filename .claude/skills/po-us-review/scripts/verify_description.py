#!/usr/bin/env python3
"""
verify_description.py — check that a Jira description update landed as built.

  python3 verify_description.py --live live.html --expected v5.edited.html \
      --summary v5.summary.json --phrases "Department Rule" "Yes when [Department] = Sale"

  --live      rendered HTML fetched AFTER the update (getJiraIssue expand=renderedFields)
  --expected  the .edited.html written by build_adf_from_html.py
  --summary   the .summary.json written by build_adf_from_html.py (colour run counts)
  --phrases   text that must be present in the live description

Exit code 1 when structure counts differ or a phrase is missing.
"""
import argparse
import json
import re
import sys

TAGS = ("table", "tr", "li", "h2", "h3", "h4", "p")


def counts(h):
    return {t: len(re.findall(r"<%s[\s>]" % t, h)) for t in TAGS}


def normalise(h):
    """Text-only view of the rendered HTML for phrase checks.

    Renderer artifacts handled: literal brackets become <span class="error">&#91;N&#93;</span>,
    a leading asterisk is mangled into bold toggles, macros add whitespace. Tags are stripped,
    asterisks dropped and whitespace collapsed; phrases are normalised the same way.
    """
    h = h.replace("&#91;", "[").replace("&#93;", "]").replace("&amp;", "&").replace("&quot;", '"')
    h = re.sub(r"<[^>]+>", "", h)
    h = h.replace("*", "")
    return re.sub(r"\s+", " ", h)


def normalise_phrase(p):
    return re.sub(r"\s+", " ", p.replace("*", ""))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--live", required=True)
    ap.add_argument("--expected", required=True)
    ap.add_argument("--summary")
    ap.add_argument("--phrases", nargs="*", default=[])
    args = ap.parse_args()

    live = open(args.live, encoding="utf-8").read()
    exp = open(args.expected, encoding="utf-8").read()
    ok = True

    cl, ce = counts(live), counts(exp)
    print("structure  live:", cl)
    print("structure  expected:", ce)
    if cl != ce:
        ok = False
        print("MISMATCH in structure counts")

    colours = {c.lower(): 0 for c in re.findall(r'color="(#[0-9a-fA-F]{6})"', live)}
    for c in re.findall(r'color="(#[0-9a-fA-F]{6})"', live):
        colours[c.lower()] += 1
    print("colours    live:", colours)
    print("strike     live (<del>):", live.count("<del"))

    if args.summary:
        s = json.load(open(args.summary, encoding="utf-8"))
        got_ins = colours.get(s["ins_color"], 0)
        got_del = live.count("<del")
        print(f"ins runs   built {s['ins_runs']} / live {got_ins}")
        print(f"del runs   built {s['del_runs']} / live {got_del}")
        if got_ins != s["ins_runs"] or got_del != s["del_runs"]:
            ok = False
            print("MISMATCH in tracked-change counts")

    nl = normalise(live)
    for p in args.phrases:
        present = normalise_phrase(p) in nl
        print(("OK   " if present else "MISS "), p)
        ok = ok and present

    print("RESULT:", "PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
