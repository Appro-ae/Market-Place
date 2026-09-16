# BRD — Application Revert in Super Portal (Reem Bank)

Business Requirements Document for the **Revert** function on the Super Portal Application
Enquiry screen, alongside the existing Cancel Application capability.

Structured to match the Application Cancellation in Super Portal BRD: cover → Feature
Overview → End-to-End Flow (numbered sections) → Impact Analysis → Out of Scope → Open
Questions → Summary → Thank You. No Jira ticket references appear in the document.

**V2.0** is a redesign against the project knowledge pack and the live UAT build
(`super-portal-container.rfpilot.dev`, 15–16 September 2026). What changed from V1.1:

| Area | V1.1 | V2.0 |
|---|---|---|
| Holding state | New `User Initiated Revert` application status | **`Revert_App` flag**, status stays `Rejected` — no mobile-app impact |
| Permissions | One `Revert Application` permission | **Nine**, granted per product tab, matching the real Role Management tree |
| Target status | Queue only | Queue **and approval level** the application was rejected from |
| Auto-rejections | Three treated as designed | R4 designed; **R5/R6 flagged for verification** — the drop-point matrix and the limit-assignment rule contradict each other |
| DBR naming | Open question | **Financial DBR** identified as the safety-net rule; `Existing DBR` confirmed as a different term |
| Impact analysis | Short section | **Full IA1–IA12**, covering product, language, permission, audit, queue, status, notification, documents, services, resume, reporting and message impacts |
| Screens | 3 generic mockups | **7 screens** rebuilt against the real portal UI |

## Files

| File | Purpose |
|---|---|
| `Appro_RF_Application_Revert_in_Super_Portal_v2.0.docx` | The deliverable — editable Word document |
| `Appro_RF_Application_Revert_in_Super_Portal_v2.0.pdf` | Read-only copy for review and circulation |
| `build_brd.js` | Generator — the source of truth for the document content |
| `portal.css`, `shell.js` | Shared styling and sidebar for the screen mockups |
| `s1_role_enquiry.html` → `sc1.png` | SC1 — Enquiry › Application Enquiry › `[Product] Revert Application` |
| `s2_enquiry_revert.html` → `sc2.png` | SC2 — Application Enquiry with Revert beside Cancel Application |
| `s3_popup.html` → `sc3.png` | SC3 — Revert confirmation popup |
| `s4_role_queue.html` → `sc4.png` | SC4 — Manually Queue › Revert Queue permissions, per product |
| `s5_queue_list.html` → `sc5.png` | SC5 — Revert Queue list view |
| `s6_queue_detail.html` → `sc6.png` | SC6 — Revert Queue application details with Approve / Reject |
| `s7_decision.html` → `sc7.png` | SC7 — Approve and Reject confirmation popups |
| `sc2_clean.png` | Un-annotated SC2, used as the backdrop behind the SC3 popup |

## Regenerating

Edit `build_brd.js` rather than the Word file, so the two do not drift apart.

```bash
npm install docx
node build_brd.js Appro_RF_Application_Revert_in_Super_Portal_v2.0.docx
soffice --headless --convert-to pdf --outdir . Appro_RF_Application_Revert_in_Super_Portal_v2.0.docx
```

Screen mockups (needs `playwright`; regenerate `sc2_clean.png` before `sc3.png`):

```bash
node -e "const{chromium}=require('playwright');(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({deviceScaleFactor:2});
  for(const [f,o,h] of [['s1_role_enquiry.html','sc1.png',900],['s4_role_queue.html','sc4.png',900],
                        ['s2_enquiry_revert.html','sc2.png',940],['s2_enquiry_revert.html#clean','sc2_clean.png',940],
                        ['s3_popup.html','sc3.png',940],['s5_queue_list.html','sc5.png',720],
                        ['s6_queue_detail.html','sc6.png',940],['s7_decision.html','sc7.png',560]]){
    await p.setViewportSize({width:1600,height:h});
    await p.goto('file://'+process.cwd()+'/'+f); await p.waitForTimeout(450);
    await p.screenshot({path:o});
  } await b.close();})()"
```

## The business case, in one line

A rejection blocks the customer from reapplying for 30 days — and that block has reached
across products. When Credit rejects on a parameter that was wrong or has since been
corrected, Revert is the only remedy inside that window.

## The three questions that gate the estimate

1. **Can a terminated Camunda process instance be resumed**, or must a new one be started at
   the queue task? Everything else in this change is a screen, a permission, a flag and an
   audit entry — this one decides whether it is small or significant.
2. **Do the segmentation and Min-Boundary failures terminate outright, or already drop to
   Credit Queue L1?** The drop-point matrix and the limit-assignment rule disagree. If they
   already queue, they need no rule here and scope reduces to the DBR case alone.
3. **Is the rule to re-route the Financial DBR safety net?** The agreed scope says "Existing
   DBR", which is a different defined term — an input to the DBR Room calculation, not a
   rejection trigger.

Fifteen open questions are listed in the document; these three are the ones that change the
shape of the work.
