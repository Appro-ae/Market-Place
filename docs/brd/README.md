# BRD + US — Application Revert in Super Portal (Reem Bank)

Client-facing deliverables for the **Revert** function: returning a **Rejected** application
to the queue (and level) it was rejected from, with maker–checker governance via a new
**Revert Queue**. Scope **Credit Card + Personal Loan** — CASA has no credit decisioning;
Mortgage Loan / Auto Loan are not yet on the platform.

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
| `rc1.html` → `rc1.png` | SC1 — Add Role: Enquiry › Application Enquiry › `[Product] Revert Application` |
| `rc2.html` → `rc2.png` | SC2 — Application Enquiry with **Revert** beside Cancel Application (annotated) |
| `rc3.html` → `rc3.png` | SC3 — Revert confirmation popup with mandatory Revert Reason |
| `rc4.html` → `rc4.png` | SC4 — Queue menu with the new Revert Queue entry |
| `rc5.html` → `rc5.png` | SC5 — Add Role: Manually Queue › Revert Queue permissions |
| `rcflow.html` → `rcflow.png` | Feature-overview flow diagram (draw.io style) |

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
  for(const [f,w,h] of [['rc1',1920,1080],['rc2',1920,1080],['rc3',760,560],
                        ['rc4',470,430],['rc5',1920,1080],['rcflow',1400,520]]){
    const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});
    await p.goto('file://'+process.cwd()+'/'+f+'.html');await p.waitForTimeout(500);
    await p.screenshot({path:f+'.png'});await p.close();
  } await b.close();})()"
```

## The business case, in one line

A rejection blocks the customer from reapplying for 30 days (pre-dedupe check); when the
rejection was wrong or the blocking parameter has since been corrected, reverting the same
application back into its queue is the only remedy inside that window.

## The questions that gate the estimate

1. **Can the terminated workflow (Camunda) process instance be resumed**, or must a new one
   start at the queue task? Everything else is a screen, a permission, a flag and an audit
   entry — this decides small vs. significant.
2. **Do "fail all segmentations" / "limit < Min Boundary" terminate outright, or already
   drop to Credit Queue L1?** The drop-point matrix and the rule documentation disagree; if
   they already queue, the system change reduces to the DBR case alone.
3. **Is the re-routed rule the Financial DBR safety net?** The agreed scope says "Existing
   DBR > 50%", which is a different defined term (an input to DBR-Room, not a rejection
   trigger).

Thirteen open questions are tabled in the BRD and mirrored in the US.
