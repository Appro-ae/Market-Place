# BRD — Application Revert in Super Portal (Reem Finance)

Business Requirements Document for the **Revert** function added to the Super Portal
Application Enquiry screen, alongside the existing Cancel Application capability.

Structured to match the Application Cancellation in Super Portal BRD: cover →
Feature Overview (applicable products, restricted scenarios) → End-to-End Flow
(numbered sections 1–7) → Thank You. No Jira ticket references appear in the document.

## Files

| File | Purpose |
|---|---|
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx` | The deliverable — editable Word document |
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.pdf` | Read-only copy for review and circulation |
| `build_brd.js` | Generator script — the source of truth for the document content |
| `mock_role.html` → `sc1.png` | SC1 — Add Role screen with the new 'Revert Application' permission |
| `mock_screen.html` → `sc2.png` | SC2 — Application Enquiry with the Revert button beside Cancel Application |
| `mock_popup.html` → `sc3.png` | SC3 — Revert confirmation popup |
| `sc_clean.png` | Un-annotated screen used as the backdrop behind the SC3 popup |

## Regenerating

Edit `build_brd.js` rather than the Word file, so the two do not drift apart.

```bash
npm install docx
node build_brd.js Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx

# refresh the PDF copy
soffice --headless --convert-to pdf --outdir . \
  Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx
```

Regenerating the screen mockups (needs `playwright`):

```bash
node -e "const{chromium}=require('playwright');(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1600,height:940},deviceScaleFactor:2});
  for(const [f,o,h] of [['mock_screen.html','sc2.png',940],['mock_screen.html#clean','sc_clean.png',940],
                        ['mock_popup.html','sc3.png',940],['mock_role.html','sc1.png',800]]){
    await p.setViewportSize({width:1600,height:h});
    await p.goto('file://'+process.cwd()+'/'+f); await p.waitForTimeout(400);
    await p.screenshot({path:o});
  } await b.close();})()"
```

`sc3.png` uses `sc_clean.png` as its background, so regenerate `sc_clean.png` first.

## Scope summary

Revert returns a **Rejected** application to the queue status it held immediately before
the rejection. Eligibility and the target status are derived from the audit trail step
written at the point of rejection:

- Credit / Compliance / Risk queue rejections revert to their own queue status.
- Credit-driven system auto-rejections (DBR safety net, failed all segmentations,
  approved limit below Min Boundary) revert to **Awaiting Credit Approval**.
- Pre-dedupe failures, "no applicable product" terminations and AML rejections are
  **not** revertible — no owning queue exists to return them to.

Section 5 also covers a change to the decisioning flow: the DBR safety-net rule routes to
the Credit Queue instead of auto-rejecting, so the decision has a named owner and becomes
revertible under the standard rule.

Open points are flagged inline as TBC callouts throughout the document, including a
terminology check on whether the "Existing DBR" in the agreed scope is the delivered
**Finance DBR** safety net.
