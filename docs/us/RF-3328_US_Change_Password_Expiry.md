# RF-3328 — [PROD] Change Password (Password expiry case)

Jira: https://scvaladdin.atlassian.net/browse/RF-3328 · Story · Medium · label PROD · KhoeHD
Created 24 Sep 2026, Format B (system/backend). Jira description is in sync with this file.

### Context of Business

When an IT Admin reactivates a bank staff user whose password has expired (after 30 days), the
system does not notify the user to change their password. The user logs in on the old credentials,
the password is still expired, and the overnight deactivation job deactivates the account again the
next day. The Admin reactivates, and the cycle repeats — a daily lockout loop blocking Super Portal
access in Production, reported as RF-3265 (PILOT-041).

Interim workaround: staff change their own password from Profile, an existing feature in every
Super Portal, which clears the expiry. This story closes the loop properly.

Delivered as a Product upgrade — the flow is required across all current Super Portals, built once
and rolled out, with SMBP upgraded to the same behaviour.

### User Story Details

**Scope:** Change Password / password-expiry flow for bank staff users on **all current Super
Portals**, plus the equivalent upgrade to SMBP. Portal users only — not customer-journey users.

**In-scope scenarios**
* **S1** — Admin reactivates; user changes password from the emailed link.
* **S2** — Admin reactivates; user ignores the email and logs in with the expired password.
* **S3** — User changes password from Profile instead (the current workaround).

**Not in scope**
* Password policy itself — complexity, history, minimum age, expiry period.
* Deactivation batch job schedule.
* Customer-journey password flows.

### AC1 — Email notification on reactivation
* Reactivation of a password-expiry-deactivated user sends that user an **Email (Bank)** with a
  link to change their password.
* Template newly added in Communication Setup, Email Type = Bank.
* One email per reactivation; a repeat reactivation re-issues the link and invalidates the previous.

### AC2 — Change Password link
* Opens the Change Password screen for that user; validity follows the existing Set / Reset
  Password link policy — **period to be confirmed** (see RF-1801).
* Expired or used link shows the existing expired-link screen with a request-new option.
* New password validated against the portal's published password policy.

### AC3 — Deactivation stops once the password is changed
* A successful change resets last-password-updated, so the batch job (RF-53) no longer deactivates
  the account next day.
* S2 — unchanged behaviour, but the user has been told why and given the means to prevent it.
* Audit trail records reactivation, notification and password change with Action by.

### AC4 — Profile change password remains available
* Profile → Change Password (RF-67) keeps working with the same effect as AC3 — it is the workaround
  in use today and must not regress.

### Impact Analysis

| Area | Impact |
|---|---|
| **User Management / Authentication** | Reactivation raises a notification and a change-password token; all through user-service. |
| **Communication Setup** | One template newly added, Email Type = Bank. Merge fields must resolve. |
| **Batch job / scheduler** | No schedule change. Job reads last-password-updated, which AC3 resets. |
| **Audit trail** | New steps for notification sent and password changed, with Action by. |
| **Product upgrade — other portals and SMBP** | Built once, rolled out to each portal; SMBP upgraded to match. Rollout list and sequencing to be confirmed. |

### Dependencies

| Ticket | Relationship |
|---|---|
| RF-3265 | PILOT-041 — the Production symptom. Its root cause states a flow change is required; this story is that change. |
| RF-53 | Batch job deactivating on last-password-updated age — what AC3 must stop re-triggering. |
| RF-67 | Existing Profile > Change Password — the workaround, must not regress (AC4). |
| RF-52 | Forgot Password — shares the token/email-link mechanism reused in AC2. |
| RF-1801 | Known defect: Set New Password link lands on expired-link screen. Resolve or AC2 inherits it. |
| RF-2303 | Pre-expiry notification email under the preset password policy — align so notifications don't conflict. |

---

## Open with the PO

1. **Link validity period** for AC2 — not stated; deliberately left to confirm rather than invented.
2. **Rollout list** — which portals beyond Reem Bank, and SMBP sequencing.
3. **Sprint / CR** — not added to Sprint 17 or CR Part 8; the brief says "next release".
