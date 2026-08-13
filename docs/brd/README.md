# BRD — Application Revert in Super Portal (Reem Finance)

Business Requirements Document for the **Revert** function added to the Super Portal
Application Enquiry screen, alongside the existing Cancel Application capability.

## Files

| File | Purpose |
|---|---|
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx` | The deliverable — editable Word document |
| `Appro_RF_Application_Revert_in_Super_Portal_v1.0.pdf` | Read-only copy for review and circulation |
| `build_brd.js` | Generator script — the source of truth for the document content |

## Regenerating the document

The `.docx` is produced from `build_brd.js`. Edit the script rather than the Word file
when the content changes, so the two do not drift apart.

```bash
npm install docx
node build_brd.js Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx

# optional: refresh the PDF copy
soffice --headless --convert-to pdf --outdir . \
  Appro_RF_Application_Revert_in_Super_Portal_v1.0.docx
```

## Scope summary

Revert returns a **Rejected** application to the queue status it held immediately before
the rejection decision. Eligibility and the target status are derived from the audit trail
step written at the point of rejection:

- Credit / Compliance / Risk queue rejections revert to their own queue status.
- Credit-driven System auto-rejections (DBR safety net, failed all segmentations,
  approved limit below Min Boundary) revert to **Awaiting Credit Approval**.
- Pre-dedupe failures, "no applicable product" terminations and AML rejections are
  **not** revertible — no owning queue exists to return them to.

Section 5 also covers a change to the decisioning flow: the DBR safety-net rule routes to
the Credit Queue instead of auto-rejecting, so the decision has a named owner and becomes
revertible under the standard rule.

Twelve open questions are tracked in Appendix 4, including a terminology check on whether
the "Existing DBR" in the agreed scope is the delivered **Finance DBR** safety net.
