# US — Credit Queue: Employer Name edit with ALOC & Rule Engine re-run (RF-3309)

User story for **RF-3309** — a new **Employer Name** section in the Credit Queue *Edit Application*
pop-up. On save the system overrides the finalized Employer Name, re-runs the employer
classification (ALOC / N-ALOC, MOD / MOI / Pensioner), recalculates the related fields, re-runs
the Rule Engine and displays the recalculated results. Scope **Credit Card + Personal Loan**,
Credit Queue L1–L3. Mirrors the existing Credit Queue edit stories (RF-1492, RF-2682) and the
governance shapes of RF-3305.

`RF-3309_US_Edit_Employer_Name.md` is the source text of the Jira description (images inline
here; on the ticket they are attachments with the same file names).

## Files

| File | Purpose |
|---|---|
| `RF-3309_US_Edit_Employer_Name.md` | User story text (pasted into RF-3309) |
| `build_screens.js` | Generator — writes the `ec*.html` composites and renders the PNGs |
| `ec1.html` → `SC1_Role_Permission_Credit_Queue_Edit_Employer_Name.png` | Role Management › Manually Queue › Credit Queue L1 with the new *Edit Employer Name* permission (annotated) |
| `ec2.html` → `SC2_Credit_Queue_Application_Details_Edit_Button.png` | Credit Queue application details — Edit entry point (annotated) |
| `ec3.html` → `SC3_Edit_Application_Popup_Employer_Name.png` | Edit Application pop-up with the new Employer Name section (annotated) |
| `ec4.html` → `SC4_Edit_Employer_Name_Confirmation_Popup.png` | Confirmation pop-up before the re-run |
| `ec5.html` → `SC5_Application_Details_Employer_Name_Updated.png` | Application Details › Employment Information after the update (annotated) |
| `ec6.html` → `SC6_Application_Enquiry_History_Edit_Employer_Name.png` | Application Enquiry history with the *Edit Information* step (annotated) |
| `ecflow.html` → `Flow_Edit_Employer_Name.png` | End-to-end flow (draw.io style) |
| `assets/ia_*.png` | Impact-analysis reference crops |
| `fonts/` | Plus Jakarta Sans (400–700) used by the composites |

The screens are composites over the **real UAT captures** already used for RF-3305
(`../SC5_Role_Permission_Revert_Queue.png`, `../SC6_Revert_Queue_Approve_Reject.png`,
`../SC2_Application_Enquiry_Revert_Button.png`) — the UAT portal is not reachable from the
remote session, so the existing captures are the base and only the new elements are drawn.

## Regenerating

```bash
cd docs/brd/RF-3309
npm install playwright            # once; Chromium is pre-installed at /opt/pw-browsers/chromium
node build_screens.js             # writes ec*.html and renders the PNGs at deviceScaleFactor 2
```

## Open points (asked in chat, defaults written into the AC)

1. Input control — Empaneled Company typeahead + "Others" free text (default) vs. the Customer
   Journey BVE list vs. free text only.
2. Mandatory reason saved as EMPLOYER NAME CHANGE REASON comment (default: yes).
3. MOD / MOI / Pensioner re-classified together with ALOC (default: yes, same RF-424 step).
4. Length of Service not re-run (default: not re-run).
5. Rule Engine re-run counter — RF-1492 struck it out, RF-2682 reinstated it (default: RF-2682).
6. IEM030 "alphabetic only" blocks digits / & / hyphen in employer names (default: keep, as the
   ticket asks for Customer Journey consistency — recommendation to widen both).
7. Product-tab treatment of the new permission (default: mirror the live *Edit Length of Service*).
8. Downstream consumers marked TBC in AC5 (document templates, T24 CIF, EastNets).
