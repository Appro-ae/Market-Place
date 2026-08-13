# Swap list — re-skinning the walkthrough for a new bank

Everything below is bank-, market- or environment-specific in the Emirates NBD
cut. Give me the new bank name and I will regenerate the deck and script with
these replaced; the ones marked **ASK** are the ones I cannot infer from a bank
name alone.

## A. Always changes (driven by the bank name)

| Where | Emirates NBD value | Notes |
|---|---|---|
| Title card subtitle | `Emirates NBD` | Under the `Super Portal` pill |
| Title card logo | Emirates NBD wordmark | **ASK** — need the new bank's logo asset |
| Portal sidebar logo | Emirates NBD lockup (Arabic + Latin) | Same asset, small |
| Channel name | `Emirates NBD` | Slide 2 card + `Channel: Emirates NBD` chip on slide 3 |
| Narration, line 1 | "Every mortgage application **{{BANK}}** receives…" | |
| Narration, boundary line | "…put **{{BANK}}** outside its own appetite" | |
| Narration, closing | "**{{BANK}}** sets the policy, prices the product…" | |
| Demo URL in browser chrome | `enbd.uat.smbp-v2.aladdinweb.dev` | **ASK** — new tenant subdomain |
| Login username | `antofelix@appro.ae` | **ASK** — or keep the Appro demo user |

## B. Changes only if the market changes (UAE → elsewhere)

Keep as-is for another **UAE** bank. All of these need review for any other market.

| Item | Emirates NBD value | If market changes |
|---|---|---|
| City / emirate | `Emirate: Dubai` | New city + field label |
| Property Location factor | Abu Dhabi, Ajman, Dubai, Fujairah, RAK, Sharjah, Umm Al Quwain | Replace with local regions |
| Rate benchmark | `EIBOR` — source `GENERIC`, type `6M EIBOR` | SAIBOR / QIBOR / SOFR etc. — **also in narration** ("EIBOR rates") |
| Credit bureau | `AECB` | Local bureau — **also on slide 27** |
| National ID | `Emirates ID` / `EID front and back` | **also in narration** twice (slides 21, 27) |
| Nationality segments | `Resident Expat`, `UAE National`, `Core Arab Salaried` | **also on slide 25** |
| Product name | `Salaried UAEN` (+ `Salaried UAEN Variable`, `… STL Resale 10Y / 5Y / 3Y / 2Y`) | |
| Currency | AED glyph on all amounts | |
| Landing tagline | `THE BETTER WAY TO BANK` | Bank's own line |

## C. Demo data on screen (change if the numbers should differ)

| Screen | Values shown |
|---|---|
| Landing hero | Rate from `0.90% p.a.` · Tenure `25 yrs` · Up to `9,999,999` |
| Product Details | Min `200,000` · Max `9,999,999` · Age limit `65` · Tenor `12`–`300` months · Min salary `1,000` · Sub-type `CONVENTIONAL` · Status `Activated` |
| Pricing scheme window | `21/07/2026` → `31/12/2027` |
| Pricing matrix step 1 | Type `Variable` · Base `0.9000` · Floor `3.2400` · Ceiling `11.0000` · Stress `2.0000` · Early settlement `1.0500%` · Bank processing `0.2500%` · Overpayment `1.0000%` · Valuation fee `3000` · Property insurance `Monthly` |
| Pricing matrix step 2 | STL `Yes/No` · Property status `Completed / Under Construction / Off-Plan` · Transaction type `Primary Purchase / Buyout / Equity / Resale / Primary Purchase + Equity / Buyout + Equity` |
| Limit setup | `63` calculated variables — **also in narration and slide 17 title** |
| Higher Offer | up to `ten` messages — **also in narration** |
| Credit indicators | `24` months of history |
| Manual queue | `Credit Queue L2` / `L3` |

## D. Never changes

- The product being walked through: **Mortgage Loan**
- The 34-slide order and the 11-module arc
- Caption band layout, `n / 34` counter, kicker vocabulary
- `Confidential — prepared by Appro` footer and the Appro logo on the title card
- Maker/Checker language throughout
- Narration voice, pace (~112 wpm) and the 5:42 runtime

## E. Watch-outs

1. **"Eleven modules, one platform"** in the closing line is a count of the
   kickers in §3 of the master script. Add or drop a module and this number,
   spoken and on screen, has to move with it.
2. **`63 calculated variables`** appears in three places (slide 17 title, the
   narration, and the UI screenshot). All three must agree.
3. **`n / 34`** is burnt into every caption. Any slide added or cut re-numbers
   the whole deck.
4. The caption band sits flush to the bottom edge — in the source cut the
   kicker line is clipped by a few pixels. Worth lifting ~20 px on the rebuild.
5. Narration runs continuously across slide changes; several sentences straddle
   a cut. Re-time slides to the narration, not the reverse.
