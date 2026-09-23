# RF-3327 — [CR][PROD] Request Approval Package (Part 8)

**Created in Jira 23 Sep 2026** · https://scvaladdin.atlassian.net/browse/RF-3327

| Field | Value |
|---|---|
| Issue type | CR (`10777`) |
| Summary | `[CR][PROD] Request Approval Package (Part 8)` |
| Priority | Low *(house default — Parts 5 & 7 both Low)* |
| Reporter | Huyen |
| Assignee | Umair Asif |
| Labels | none *(house default)* |
| Scope | All 10 RF Sprint 17 items — PO decision, 23 Sep |
| Links | `relates to` RF-3249 (Part 7), RF-3226 (Part 6), RF-3143 (Part 5) |

Structure follows RF-3249 (Part 7) and RF-3143 (Part 5): intro line → release
tag → release notes (two dated .docx) → Camunda file named for this CR's own key
→ package table. **Business Impact** is a new section, placed after the logistics
block and before the package table so the bank reads the "why" immediately before
the "what".

---

## Two fields must be completed before circulation

Neither is derivable from Jira — both are build/deployment facts:

| Field | Current placeholder | Source |
|---|---|---|
| Release tag | `rf-prod-0.0.5 (to be confirmed before circulation)` | Umair / build. Part 5 = `rf-prod-0.0.3`, Part 7 = `rf-prod-0.0.4`, so 0.0.5 is the expected next value but is **not confirmed**. |
| Release note dates | `...-DD-MM-2026.docx` (both files) | The agreed deployment date. |

The `API & Variables & SQL` column is `TBC` on nine rows — that value is a
per-ticket build fact supplied by the developer. Part 5 used `No`, `API`,
`Variables: <name>`, `Data: <change>` and SDK versions.

---

## Package contents (10 items, RF Sprint 17)

| No | Ticket | Status at CR creation | Remark |
|---|---|---|---|
| 1 | RF-3141 | Open | In-app chat |
| 2 | RF-3146 | READY IN SIT | Generic KFS at start of journey |
| 3 | RF-3298 | READY IN SIT | Camunda 8.7 upgrade |
| 4 | RF-3299 | READY IN SIT | Spring Boot 4 / JDK 21 upgrade |
| 5 | RF-3305 | DEV IN PROGRESS | Application Revert |
| 6 | RF-3306 | READY TO DEVELOP | Push notification |
| 7 | RF-3307 | DEV IN PROGRESS | Re-enable NI Debit card |
| 8 | RF-3308 | DEV IN PROGRESS | CASA Thank You screen |
| 9 | RF-3309 | Open | Credit Queue Employer Name edit |
| 10 | RF-3323 | Open | Emailage null data handling |

**Readiness position, recorded for the file.** No Sprint 17 item had passed SIT
or UAT at the time this CR was created; four were not yet built. Every prior CR
shipped UAT-signed-off work — RF-3143 states *"Jira list — 67 items, UAT sign-off
complete"* in the ticket itself. This was raised before creation and the PO
directed that all 10 items be included as a normal CR. The description carries no
pending-UAT caveat, per that decision.

Two items in the package are estate-wide infrastructure upgrades — RF-3298
(Camunda 8.7, the engine owning every live application's process instance) and
RF-3299 (Spring Boot 4 / JDK 21 across all services). They share one rollback
decision with eight feature tickets. Worth revisiting if the deployment window
is tight.

---

## CR linkage chain — repaired

Parts 6 and 7 carried zero issue links and were detached from the series. Fixed
in the same pass.

**Before**

```
Part 1 ─ Part 2 ─ Part 3 ─ 22-May ─ Part 4 ─ Part 5        Part 6 ✕      Part 7 ✕
```

**After**

```
Part 1 ─ Part 2 ─ Part 3 ─ 22-May ─ Part 4 ─ Part 5 ─ Part 6 ─ Part 7 ─ Part 8
                                              └──────────┴────────┴────────┘
```

| CR | Key | Links before | Links after |
|---|---|---|---|
| Part 8 | RF-3327 | — (new) | 3 → Parts 7, 6, 5 |
| Part 7 | RF-3249 | **0** | 3 → Parts 8, 6, 5 |
| Part 6 | RF-3226 | **0** | 3 → Parts 8, 7, 5 |
| Part 5 | RF-3143 | 3 | 6 → Parts 8, 7, 6, 4, 3, 22-May |

Six `Relates` links created. Link depth mirrors house precedent: Part 5 reached
back three hops (Parts 3, 4, 22-May), so Part 8 reaching back to Parts 7, 6 and 5
is consistent.

---

## Open item

RF Sprint 18 (8 Sep – 6 Oct) carries the goal *"We will cover 2 new CRs in this
sprint."* Part 6 and Part 7 are both still at `Open`. Worth reconciling whether
Part 8 is one of the two Sprint 18 CRs, and what closes out 6 and 7.
