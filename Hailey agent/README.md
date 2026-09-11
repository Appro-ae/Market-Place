# Hailey agent — Reem Bank customer journey videos

Three screen-recorded journeys, cleaned up for advertising use. The tester's
placeholder data has been replaced in the pixels: same recordings, same timing,
same fonts and baselines — only the on-screen values differ.

| # | Journey | Length | Notes |
|---|---------|--------|-------|
| 1 | Personal Loan | 3:05 | Address replaced |
| 2 | Credit Card | 3:01 | Address + IBAN replaced, iOS "Low Battery" alert removed, battery indicator normalised, email + mobile replaced |
| 3 | Account Opening | 2:21 | Address replaced, email + mobile replaced |

## Data used

| Field | 1 — Personal Loan | 2 — Credit Card | 3 — Account Opening |
|-------|-------------------|-----------------|---------------------|
| Home address | — | Marasi Drive | Sheikh Zayed Road |
| Apartment / Villa | 1204 | 1802 | 906 |
| Building / Community | Marina Gate 2 | Executive Towers | Burj Views |
| Area | Dubai Marina | Business Bay | Downtown Dubai |
| City / Emirate | Dubai | Dubai | Dubai |
| Salaried IBAN | — | AE72 0331 0024 6195 7430 852 | — |
| Personal email | — | Khaled.Mohammed@gmail.com | Khaled.Mohammed@gmail.com |
| Mobile | — | +971 52 641 9370 | +971 52 641 9370 |

All addresses are real Dubai locations. The IBAN is format-valid and passes the
IBAN mod-97 check.

## Encoding

720x1558, 30 fps, H.264 CRF 12, original audio stream copied. Median PSNR
against the source recordings is 47-49 dB on untouched frames, i.e. visually
identical outside the edited fields.
