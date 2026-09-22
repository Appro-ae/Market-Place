# BRD + US — Application Revert in Super Portal (Reem Bank)

Client-facing deliverables for the **Revert** function: returning a **Rejected** application
to Credit Queue L1, with maker–checker governance via a new **Revert Queue**. Scope
**Credit Card + Personal Loan**, **Credit-root-cause rejections only** (rejected by Credit,
or auto-rejected by the System for credit reasons — both DBR safety nets park to Credit
Queue instead of auto-rejecting). Compliance / Risk / Sale rejections are out of scope.

**V1.0** mimics the *Application Cancellation in Super Portal* deliverable one-for-one:
same cover, section structure, table style (`#156082` headers, thin grey borders), screen
tables, flow-diagram style, confidentiality footer and THANK YOU page. The appro logo,
footer circles and contact strip are the genuine assets extracted from that reference PDF
(`assets/`). No Jira ticket references appear in the document.

The companion **user story** mirrors the cancellation US (RF-2365) and is pre-populated
into **RF-3305**; `RF-3305_US_Application_Revert.md` is the source text.

## Files

| File | Purpose |
|---|---|
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx` | The BRD — editable Word deliverable |
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.pdf` | Read-only copy for circulation |
| `RF-3305_US_Application_Revert.md` | User story text (already pasted into RF-3305) |
| `build_brd.js` | Generator — the source of truth for the document content |
| `assets/` | appro logo block / navy wordmark / header logo / footer circles / contact strip |
| `rc1.html` → `SC1_Role_Permission_Application_Enquiry.png` | SC1 — Add Role: Enquiry › Application Enquiry › `[Product] Revert Application` |
| `rc2.html` → `SC2_Application_Enquiry_Revert_Button.png` | SC2 — Application Enquiry with **Revert** beside Cancel Application (annotated) |
| `rc3.html` → `SC3_Revert_Confirmation_Popup.png` | SC3 — Revert confirmation popup with mandatory Revert Reason |
| `rc4.html` → `SC4_Queue_Menu_Revert_Queue.png` | SC4 — Queue menu with the new Revert Queue entry |
| `rc5.html` → `SC5_Role_Permission_Revert_Queue.png` | SC5 — Add Role: Manually Queue › Revert Queue permissions |
| `rc6.html` → `SC6_Revert_Queue_Approve_Reject.png` | SC6 — Revert Queue application details with Approve / Reject |
| `rcflow.html` → `Flow_Application_Revert.png` | Feature-overview flow diagram (draw.io style) |

The `rc*` screens are composites over **real UAT portal captures**
(`super-portal-container.rfpilot.dev`), so typography (Plus Jakarta Sans), colours and
layout are the actual Reem Bank design — only the new Revert elements are drawn in.

## Regenerating

Edit `build_brd.js` rather than the Word file, so the two do not drift apart.

```bash
npm install docx playwright
node build_brd.js
soffice --headless --convert-to pdf --outdir . Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx
```

Screens (each `rc*.html` is self-contained; render at deviceScaleFactor 2):

```bash
node -e "const{chromium}=require('playwright');(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  for(const [f,o,w,h] of [
      ['rc1','SC1_Role_Permission_Application_Enquiry',1920,1080],
      ['rc2','SC2_Application_Enquiry_Revert_Button',1920,1080],
      ['rc3','SC3_Revert_Confirmation_Popup',760,560],
      ['rc4','SC4_Queue_Menu_Revert_Queue',470,430],
      ['rc5','SC5_Role_Permission_Revert_Queue',1920,1080],
      ['rc6','SC6_Revert_Queue_Approve_Reject',1920,1080],
      ['rcflow','Flow_Application_Revert',1400,520]]){
    const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
    await p.goto('file://'+process.cwd()+'/'+f+'.html');await p.waitForTimeout(500);
    await p.screenshot({path:o+'.png'});await p.close();
  } await b.close();})()"
```

## The business case, in one line

A rejection blocks the customer from reapplying for 30 days (pre-dedupe check); when the
rejection was wrong or the blocking parameter has since been corrected, reverting the same
application back into Credit Queue is the only remedy inside that window.

## What remains open

1. **Workflow engine (parked for engineering):** can the terminated Camunda process
   instance be resumed, or must a new one start at the queue task? This decides small vs.
   significant.
2. **Timeout period [X]** — 5 days proposed, configurable in database, same as cancellation.
3. **Revert_App flag** with status remaining "Rejected" (zero mobile impact) — default
   design, pending formal confirmation.

All other scope points are PO-decided and written into the BRD/US as spec.
