# BRD — Application Revert in Super Portal (Reem Finance)

Business Requirements Document for the **Revert** function added to the Super Portal
Application Enquiry screen, alongside the existing Cancel Application capability.

Structured to match the Application Cancellation in Super Portal BRD: cover →
Feature Overview (applicable products, restricted scenarios) → End-to-End Flow
(numbered sections 1–8) → Thank You. No Jira ticket references appear in the document.

**V1.1** adds the maker-checker governance layer, modelled on the delivered
Application Cancellation flow: the requester is the Maker, the application is held in a
new `User Initiated Revert` status, and a Checker approves or rejects the request in a new
Revert Queue before the application is returned to its previous status.

## Files

| File | Purpose |
|---|---|
| `Appro_RF_Application_Revert_in_Super_Portal_v1.1.docx` | The deliverable — editable Word document |
| `Appro_RF_Application_Revert_in_Super_Portal_v1.1.pdf` | Read-only copy for review and circulation |
| `build_brd.js` | Generator script — the source of truth for the document content |
| `mock_role.html` → `sc1.png` | SC1 — Add Role, Enquiry > Application Enquiry > 'Revert Application' (Maker) |
| `mock_screen.html` → `sc2.png` | SC2 — Application Enquiry with Revert beside Cancel Application |
| `mock_popup.html` → `sc3.png` | SC3 — Revert confirmation popup with the Revert Reason |
| `mock_queue_role.html` → `sc4.png` | SC4 — Add Role, Manually Queue > Revert Queue (Checker) |
| `mock_queue_detail.html` → `sc5.png` | SC5 — Revert Queue application details with Approve / Reject |
| `mock_decision.html` → `sc6.png` | SC6 — Approve and Reject confirmation popups |
| `sc_clean.png` | Un-annotated screen used as the backdrop behind the SC3 popup |

## Regenerating

Edit `build_brd.js` rather than the Word file, so the two do not drift apart.

```bash
npm install docx
node build_brd.js Appro_RF_Application_Revert_in_Super_Portal_v1.1.docx

# refresh the PDF copy
soffice --headless --convert-to pdf --outdir . \
  Appro_RF_Application_Revert_in_Super_Portal_v1.1.docx
```

Regenerating the screen mockups (needs `playwright`):

```bash
node -e "const{chromium}=require('playwright');(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({deviceScaleFactor:2});
  for(const [f,o,h] of [['mock_screen.html','sc2.png',940],['mock_screen.html#clean','sc_clean.png',940],
                        ['mock_popup.html','sc3.png',940],['mock_role.html','sc1.png',800],
                        ['mock_queue_role.html','sc4.png',800],['mock_queue_detail.html','sc5.png',940],
                        ['mock_decision.html','sc6.png',560]]){
    await p.setViewportSize({width:1600,height:h});
    await p.goto('file://'+process.cwd()+'/'+f); await p.waitForTimeout(450);
    await p.screenshot({path:o});
  } await b.close();})()"
```

`sc3.png` uses `sc_clean.png` as its background, so regenerate `sc_clean.png` first.

## Scope summary

Revert returns a **Rejected** application to the queue status it held immediately before
the rejection — subject to Checker approval. Eligibility and the target status are derived
from the audit trail step written at the point of rejection:

- Credit / Compliance / Risk queue rejections revert to their own queue status.
- Credit-driven system auto-rejections (DBR safety net, failed all segmentations,
  approved limit below Min Boundary) revert to **Awaiting Credit Approval**.
- Pre-dedupe failures, "no applicable product" terminations and AML rejections are
  **not** revertible — no owning queue exists to return them to.

Section 6 also covers a change to the decisioning flow: the DBR safety-net rule routes to
the Credit Queue instead of auto-rejecting, so the decision has a named owner and becomes
revertible under the standard rule.

### Where Revert deliberately differs from Cancellation

The cancellation timeout **auto-approves** — an un-actioned request ends in the
cancellation the requester asked for. The revert timeout is proposed to do the opposite
and let the request **lapse**, leaving the application Rejected, because auto-approving
would reopen a rejected case without the second pair of eyes the Checker exists to
provide. This is flagged in section 4.6 for confirmation.

Other open points are flagged inline as TBC callouts throughout the document, including a
terminology check on whether the "Existing DBR" in the agreed scope is the delivered
**Finance DBR** safety net.
