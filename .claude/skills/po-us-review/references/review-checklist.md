# Review checklist — what to test a user story against

Use this as a question list, not a form. Each item names the gap, why it bites, and what a
closed item looks like. Items marked (AMP-2548) were real findings in the reporting-hierarchy
cycle; they show how the gap surfaces in practice.

## How to run a finding through the research pattern

| Step | What you write | Example (AMP-2548 R1) |
| --- | --- | --- |
| Rationale | Which input requirement this serves and what breaks if it is wrong | Staff must see only own cases; a wrong matching key hides their pipeline |
| Business base | What a live deployment or the market does (ticket key, status) | ADIB-6681: Department = 'Sale' users filtered on Employee ID; ADIB-35 Employee ID free text, unique |
| Hypothesis | The rule the story should state | Attribution key = Staff ID canonical form, immutable after approval |
| Evidence | What the story, baselines and precedents actually say | AC1 allowed editing Staff ID while AC4 made attribution immutable → orphaned cases |
| Conclusion | The fix, its priority, who decides | Make Staff ID read-only once approved + reassignment function; P1 |

## A. Traceability

- **Every input requirement maps to an AC.** Build the R-list first and map each R to the
  AC(s) that implement it. "Partially covered" means the mechanism is named but a decision or
  a data element is missing.
- **Every referenced ticket exists and is what the story says it is.** Open it. Record the
  status. (AMP-2548: ACP-229 did not exist; ACP-228 was a cancelled audit-trail story; AMP-3323
  was cited as defining a parameter it never mentions.)
- **Claims about baselines are read, not trusted.** A baseline screen "has no such column",
  a Confluence page "does not allow custom parameters", a story "does not define X" — verify
  from the source and quote it.
- **Decisions are made, not deferred.** "May require a separate ticket", "to be confirmed with
  the Channel team", "define at migration" inside an AC are undecided items. Either the
  decision is written in, or the dependency ticket is raised and linked as blocking, with an
  owner and date.

## B. Data model and identifiers

- **The matching key exists on the record that is filtered on.** A visibility filter on
  "Assigned To" needs an Assigned To attribute on the application and a matching attribute
  on the user. (AMP-2548 v1 had neither.)
- **One identifier, one term.** When the same value has several names (sale code, agent
  code, staff ID, employee ID, referral code, promo code), decide one term for the story and
  say how each channel carries it. Different names in the URL, the customer pop-up and the
  user record produced three "mappings" that did not exist.
- **Capture mechanism at origination.** How does the value reach the application: URL
  parameter, customer entry, QR, round-robin, backfill? Each path needs: where it is stored,
  raw value kept, resolved value, source, precedence when several occur, and the rule for an
  unmatched or empty value.
- **Format, normalisation, uniqueness.** Free text is still bounded: length, allowed
  characters, stored as text (leading zeros), display value vs canonical key (case and
  separators), uniqueness on the key, server-side validation at every entry point. Align the
  limit with the customer-facing entry (pop-up max length, client sanitiser) or the value can
  never be typed.
- **Immutability and correction path.** If the key is immutable, define how a typo is
  corrected and how open cases move (reassignment function, audited). Immutability without a
  reassignment function makes a deactivation guard impossible to satisfy (AMP-2548 P1-B).
- **No personal data as an identifier** that travels in URLs, QR codes or audit trails.

## C. Visibility and permissions

- **Who sees what, as a matrix.** Personas × screens with the exact rule per cell. Include
  the persona that has no assignments and no reports; they must not land on an empty screen
  unless that is the intent.
- **Scope driver is explicit.** Role, permission, department, hierarchy or a flag? If a
  department name drives the rule, say whether it is hardcoded or configured, and how a user
  moving in or out of it is handled.
- **Override or exception path.** Ops, credit, admin, MIS: either they are out of scope of the
  filter by rule, or a permission exists. Do not create a permission nobody needs.
- **Evaluation point.** Scope must be evaluated server-side from the current user record on
  each request. Token or session caching produced "changes apply only after re-login" in the
  precedent (ADIB-6743) and "deactivated session still active" in SMBP (ACP-550).
- **Default filters are identical for restricted and unrestricted users** (ADIB-6811: sales
  users saw 30 days only on first load).
- **Untagged and historical records** have an explicit audience.

## D. Lifecycle and edge cases

- Circular references at any depth; self-reference.
- Deactivating, deleting or moving a user who is a manager (orphaned subtree), who owns open
  cases (orphaned pipeline), or whose department changes (fields hidden, filters change).
- Mid-flight changes: does visibility follow the current hierarchy or the one at creation?
- Empty pools and unmatched values: never silent. Alert, report view or fallback, decided.
- Migration: pre-existing data, existing users missing the new mandatory attribute, backfill
  rule and its audit entry; no automatic backfill that assigns credit nobody earned.
- Concurrency: two pending maker requests that both pass save-time validation; re-validate
  at checker approval.

## E. Screens and messages

- The new attribute is visible somewhere: list column (Customize Table default per persona),
  detail field, audit-trail first entry, export.
- Naming is consistent across list, detail, impact table and mockup after every rename.
- Message codes (IEM/IM/CM) are unused in the message registry before they are assigned.
- Mockup attached, file name matches the current concept, tabs referenced by the ACs exist.
- Sample values in tables obey the story's own rules (a sample user in Credit Operations
  cannot carry a field that only exists for Sales).

## F. Integration and cross-portal

- Parameter names are identical across products and channels (ADIB-5268 broke on
  `saleAgentCode` vs `salesagentCode`).
- Each portal's responsibility is stated: who captures, who stores, who matches, who displays.
- Permissions on different portals are named differently and not assumed to be shared.
- Precedence rules when two capture paths occur in one journey (first wins vs latest
  successful wins) are written and audited.

## G. Non-functional

- Recursive traversals have a stated depth (unlimited is fine if said) and a note on
  performance for large trees.
- Exports follow the same scope as the screen.
- Notification templates that address the assigned user are audited for CC rules.

## H. Story hygiene

- Context of Business, User Story and ACs do not contradict each other (direct reports vs
  full subtree; "first wins" vs "latest wins"; "no fallback" vs "round-robin fallback").
- Impact Analysis covers every touched module, not only the one the BA started with.
- The mockup tab table, references list and legend are updated with every version.
- The BA's change-log comment lists every finding with Done / Not Done; verify each claim in
  the description, not in the comment.

## Coverage vocabulary

| Round | Values | Meaning |
| --- | --- | --- |
| First review | Covered / Partially covered / Not covered | Mechanism present and decided / present but incomplete or undecided / absent |
| Re-review | Done / Done — fix required / Not Done | Closed as asked / closed but the fix introduced a defect / still open |
| Priority | P1 / P2 / P3 | Blocks Ready for Dev / must close before dev starts / can follow as a linked ticket |
