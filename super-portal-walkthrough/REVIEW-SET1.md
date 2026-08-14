# Set 1 review — what to fix before the cut

32 files received, **all verified 3840 × 2160**, chrome consistent, address bar
neutral, sidebar states correct on 2 / 29 / 30, no annotation added. The capture
craft is good and the handoff note is honest about its gaps.

What follows is what I found reviewing the frames **against the narration**,
which is the test the handoff couldn't apply.

> The zip contains `shots/` only — the `shots-no-chrome/` folder and
> `_contact-sheet.png` described in the handoff §1 aren't in it. Not blocking,
> but send `shots-no-chrome/` if it exists; it gives me a cleaner composite.

---

## 1. Must re-shoot — real client names on screen

### Shot 2 — three channels, two of them real clients

The frame shows **Emirates NBD**, **Appro** and **PRYPCO** side by side. Two
live client names, in the one slide that holds on screen for ~14 seconds.

**This cannot be fixed in post.** Painting out two channel cards means
reconstructing the grid; it will look like what it is.

**The fix is easy at capture:** the page has a *"Search by channel name…"*
field. Type the channel name, capture with a **single card in frame**. That also
fixes a second problem — the caption reads *"The channel is active in Dubai,
with Mortgage Loan assigned and enabled"*, singular, which doesn't parse against
three cards.

### Shot 1 — tenant name in the hero, and the wrong product

Two issues, both needing a re-shoot:

1. The badge top-left reads **"Sanctum Super Portal"** — a tenant identity, in
   36 px type, held for 12 seconds. **This is not in the leak register.**
2. The carousel caught the **Credit Card** panel. The handoff calls the
   narration generic here; it isn't. The opening line is *"Every **mortgage**
   application the bank receives arrives here."* A credit-card hero under that
   sentence contradicts the voice in the first ten seconds of the video.

Re-shoot on the **Mortgage Loan** carousel panel, with the badge showing
whatever generic wording you settle on.

---

## 2. Narration conflicts — decide re-shoot vs re-cut

Each of these has a frame that says something different from the voice. The
voice is fixed, so either the screen changes or the line goes.

| Shot | Voice says | Frame shows | Options |
|---|---|---|---|
| **14** Deviation | *"Deviation allows a defined, formula-bound breach of policy — discretion always on the record"* | **"Currently, there are no deviations added"** | Configure one deviation on Mortgage Loan and re-shoot **(recommended — it's a config, not a write to live policy)**, or I drop the line |
| **21** Find any application | *"Any application by ID, Emirates ID, email or phone"* | Search dropdown has **one** option, Application ID | I re-cut the line to *"Any application by ID"* — cheap, no re-shoot |
| **22** Narrowed | Caption: *"Two records for one email address… nationality and originating channel"* | **One** row, searched by ID; columns are Relationship Type and Previous Application Code, no nationality | Caption rewrite. I'll draft it against the actual frame |
| **24** Credit indicators | *"The bureau picture in full — exposure, contracts, payment delays, every cheque bounce"* | Joint-application summary. No bureau panel exists in this build. Several fields render `—` or `*****` | Weakest frame in the set. Either drop the sentence, or drop shot 24 entirely and hold shot 23 longer |
| **16** *missing* | *"Confirmed — the new policy now decides live applications"* | — | **Take the agent's offer.** They said 2 minutes. Worth it — the voice names this moment |
| **28** *missing* | *"The letter is generated the moment an offer is accepted — emailed, filed, and itself an audit entry"* | — | Needs an application driven to acceptance. If that's not happening, I cut the line |

**On 16 and 28:** both are described explicitly by the voice. Dropping them
means editing the narration, which means regenerating those passages. That's
possible, but you asked to keep the voice exactly as-is — so re-shooting is the
option that honours that.

Good news: dropping shots doesn't break the closing line. All eleven module
kickers still have at least one surviving slide, so *"Eleven modules, one
platform"* stays true.

---

## 3. The leak register is incomplete — don't rely on it as a checklist

It covers 12 shots (2, 3, 7, 10, 14, 17, 18, 20, 21, 29, 31, 33). Spot-checking
found leaks by its own criteria in frames it doesn't list:

- **Shot 22** — `APPRO_APPRO_202600008716` twice (search field and row) and
  `Appro` in the Channel column. Not registered.
- **Shot 1** — `Sanctum Super Portal`. Not registered.
- **Shot 29** — registered as containing `PRYPCO`, but reviewing the frame it
  **does not appear**; the queue list is fully covered by the Application
  Details view. That one's a false positive, which is the harmless direction.

I'll do my own full pass at composite time rather than working from the register.

---

## 4. `Appro` as the channel name — my recommendation: keep it

The spec asked for `Bank`; the environment rendered `Appro`. I'd accept `Appro`
and not re-shoot for this.

The Appro wordmark is already the sidebar logo on every frame, the login footer
reads *"Powered by appro"*, and the title card carries *"prepared by Appro"*.
Appro is the vendor and is meant to be visible throughout. A channel reading
`Appro` is coherent with all of that, and it's **not a client identity**, which
is what the CPO's instruction was actually about.

Changing it would mean patching ten locations including a generated sentence in
the shot 15 dialog — real work, for a frame that already reads correctly.

If you'd rather hold to `Bank`, say so and I'll do the post work; it's your
call, not a blocker either way.

**Title card:** with the channel as `Appro`, `Bank Super Portal` no longer
matches anything on screen. I'd set the card to just **Super Portal**.

---

## 5. Fixable in post — no re-shoot needed

I'll handle these at composite:

- `APPRO_APPRO_…` application ID prefixes → neutral prefix (shots 21, 22, 23, 24, 27, 29, 30)
- `SANC_ML_1786608491597` product code, shot 3 — the `SANC_` prefix is the tenant
- `@appro.ae` addresses in shots 3, 7, 31, 32 — cosmetic, and arguably fine to
  leave since Appro is the vendor. Tell me your preference.

---

## 6. What Set 2 should contain

**Re-shoots (blocking):**
1. **Shot 2** — single channel in frame, via the search filter
2. **Shot 1** — Mortgage Loan carousel panel, generic badge wording

**Re-shoots (recommended, in priority order):**
3. **Shot 16** — publish and capture the toast; the agent offered
4. **Shot 14** — one deviation configured on Mortgage Loan
5. **Shot 28** — only if an application can be driven to acceptance

**No re-shoot needed:** everything else. 24 of the 32 frames are usable as
delivered.

Confirm the `Appro` / `Bank` question and whether 28 is achievable, and I can
start assembling against what's already here.
