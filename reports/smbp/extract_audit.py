#!/usr/bin/env python3
"""Given spilled getJiraIssue(+changelog) JSON files, emit one audit verdict line per ticket.

Criterion 3 (sharpened): a summary/description edit by a non-developer disqualifies the fix
only if it lands AFTER the ticket first reached a developer (mid-flight redefinition), not at
triage time before assignment.
"""
import json, sys, glob

DEVS = {
 '712020:c2a391b8-b1e5-42bb-9e9c-91bb7d24586c':'tanghalong','63bce3990a1b5442166a3d21':'longlh',
 '63e355a0c2b1cb6b3473dc4c':'khoehd','712020:24847883-770b-4c91-a45a-ddff2c07621e':'toan',
 '712020:64c3eeff-75f1-486a-bd37-1d52056c7412':'nam','712020:0d960272-5e65-4945-9bce-70be70ca8043':'minhhoang',
 '712020:f82f417d-1c4e-4d17-b0cb-4f69a6dac4ed':'quan','712020:6c94ea85-2e20-4e82-852f-18a2a98fcf41':'tung'}

def verdict(node):
    key = node['key']
    hist = sorted(node.get('changelog',{}).get('histories',[]), key=lambda h:h['created'])
    first_dev_touch = None          # when the ticket first reached a developer
    for h in hist:
        for it in h['items']:
            if it.get('field')=='assignee' and it.get('to') in DEVS:
                first_dev_touch = first_dev_touch or h['created']
    rewrites = []
    for h in hist:
        actor = h['author'].get('accountId','')
        if actor in DEVS:           # a developer editing their own ticket is not a scope rewrite
            continue
        for it in h['items']:
            if it.get('field') in ('summary','description'):
                after = first_dev_touch is not None and h['created'] > first_dev_touch
                rewrites.append((h['created'][:16], h['author'].get('displayName','?'),
                                 it['field'], 'AFTER' if after else 'triage'))
    mid = [r for r in rewrites if r[3]=='AFTER']
    # group mid-flight rewrites by actor to judge "substantial"
    who = {}
    for r in mid: who.setdefault(r[1], []).append(r[2])
    fail = any(len(v)>=2 or 'summary' in v for v in who.values())
    note = '; '.join(f"{a}: {v.count('summary')}x summary + {v.count('description')}x desc after dev touch"
                     for a,v in who.items()) or 'no post-assignment scope edit'
    return key, ('FAIL' if fail else 'PASS'), note

rows=[]
for fn in sys.argv[1:]:
    try: d=json.load(open(fn))
    except Exception: continue
    for n in d.get('issues',{}).get('nodes',[]):
        if 'changelog' in n: rows.append(verdict(n))
for k,v,note in sorted(set(rows)):
    print(f"{k}\t{v}\t{note}")
