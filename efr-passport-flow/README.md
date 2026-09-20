# EFR — Passport Onboarding Flow

Passport variant of the Appro B2C onboarding prototype. This replaces the
Emirates ID (EID) capture step with a **single passport data-page capture**,
mapping the eKYC step to the EFR passport commands.

## Files

| File | What it is |
| --- | --- |
| `Appro-Passport-Onboarding.html` | Standalone, self-contained prototype (the "Appro — Customer Journey" flow). Open directly in a browser — all assets are inlined. |
| `Appro-Canvas-Passport.html` | The full design Canvas with the passport prototype embedded as the "Prototype". |

## What changed vs. the EID flow

- **Two capture screens → one.** The old *Front of EID* + *Back of EID* camera
  screens are merged into a single **"Scan passport / Passport data page"**
  screen that flows straight to the selfie/liveness step.
- **All EID wording → Passport.** Landing copy, the KYC method chooser
  ("Scan Passport"), the ready screen ("Get your passport ready"), camera
  captions, upload rows, and the completion/status summaries.
- **Document artwork.** The scanned-document graphic is now a UAE passport
  biodata page (photo, fields, MRZ), and the "get ready" guide is a passport
  illustration instead of the Emirates ID card.
- **Manual upload.** The duplicate *Emirates ID — Front / Back* upload rows are
  removed; the existing single **Passport** upload row is kept.

## ML AIP Resume Journey (passport)

`Appro-ML-AIP-Passport-Journey.html` is the main Citi Home Finance mortgage
(AIP) prototype with **face-resume** sign-in, converted to the passport flow.
It is a single, self-contained file (open directly) that carries this project's
own brand: the Citi logo and the full Lato / Inter / Tajawal font families are
embedded, so no external assets are needed.

- Single passport capture screen (`kyc → Passport ready → Scan passport → selfie`).
- All EID wording → Passport across the whole journey: landing, KYC chooser,
  ready screen, camera, and the face-resume hub ("Identity verified — Face +
  Passport", "Passport scanned").
- The "Passport ready" Do/Don't sample grid and the in-camera document are
  redrawn as a UAE passport data page (photo + fields + MRZ, EN/AR).
- Fixes to make the prototype render standalone: the appro/Citi logo and the
  landing brand-orb are inlined (the offline export had left the logo pointing
  at a missing `assets/citi-logo.png`), and the now-unused raster EID sample is
  dropped from the bundle.

`Appro-ML-AIP-Resume-Journey-Canvas.html` is the design Canvas with this
passport journey embedded.

## EFR command mapping

The passport journey uses the EFR passport commands in place of the EID ones:

| Step | EID journey | Passport journey |
| --- | --- | --- |
| Scan + confirm rightful holder | EFR **1.2** (`ConfirmEnhancedIdentity`) | EFR **1.16** |
| Confirm data elements vs. UAE gov source | EFR **1.12** (`ConfirmDataElementEnhanced`) | EFR **1.18** |

(Ref: Aladdin — *EFR — Integrate with EFR 1.16 and 1.18*, passport journey
`EFR 1.16 → CF 1.3 → EFR 1.18`.)

> The prototype is a visual UX mockup and does not itself call EFR; the mapping
> above documents which commands the passport step corresponds to.
