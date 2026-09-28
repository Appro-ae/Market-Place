# RF-3306 — [Enhancement] Push notification

Jira: https://scvaladdin.atlassian.net/browse/RF-3306 · Story · Medium · KhoeHD · RF Sprint 17
Updated 28 Sep 2026 against Avanza's Reem Payments API – Push Notifications Specification v0.1 (25 Sep 2026).
Jira description is in sync with this file. In Jira, the changes since the PO review are purple: the AC2
mapping, the AC3 success rule and the Audit Trail Step Details. Items the spec does not answer are marked
**TBC by Avanza** and are raised in `docs/email/Email_Middleware_Push_Notification_Specification.html`.

### Context of Business

Customers are currently informed of asynchronous journey decisions by Email and In-app notification only. When the customer is outside the Super App (e.g. waiting for a credit decision, a DDA response or the end of the cooling-off period), there is no device-level alert and the application stalls until the customer returns.

This story adds Push Notification as an additional channel at the agreed trigger events. The backend sends the push request to the Super App Push Notification API, following the same integration pattern as the existing SMS/Email integration. On tap, the customer is taken into the Appro SDK at the corresponding screen to resume the journey.

**Scope:** Credit Card, Personal Loan, CASA · iOS and Android

### User Story

**As a** system,  
**I want** to send a Push Notification to the customer at each agreed onboarding trigger event,  
**So that** the customer is alerted to decisions and required actions and returns to the journey at the right screen.

### Trigger Point

Push is fired at the same trigger point as the existing Email / In-app notification templates listed under Source templates. Existing Email and In-app notifications remain unchanged.

| Push ID | Priority | Applies to | Trigger event | Title (EN, ≤40 chars) | Body (EN, ≤100 chars) | Deep-link screen | Source templates |
|---|---|---|---|---|---|---|---|
| P01 | P0 | CC · PL | AIP given (at least one offer displayed), or Credit Queue approves / overrides the application | Your %%PRODUCT_TYPE%% offer is ready | Tap to review your offer and continue your application. | Offer selection | ET15/NT06 · ET9 |
| P01 (CASA) | P0 | CASA | Account application approved in principle | Your account is approved | Tap to continue and complete your account opening. | Resume application | ET15/NT06 (CASA) |
| P02 | P0 | CC · PL · CASA | Scheduled reminder once per day for 15 days, starting after the first offer is displayed | Your offer expires in %%COUNTING_DOWN%% days | Complete your application before your approval expires. | Offer selection | ET13 · NT02 |
| P05 | P0 | CC · PL · CASA | Credit or Sales team returns the case requesting documents from the customer | We need a document from you | Upload it to keep your application moving. | Document upload | NT12 |
| P06 | P0 | CC · PL | Cooling-off end date reached (start + 5 days, configurable) with no customer action; application returns to Approved In Principle | Your application is active again | Your cooling-off period has ended. Tap to continue or cancel. | Application Ready to Continue screen, then KFS | ET55/NT24 |
| P09 | P0 | PL | Customer's bank rejects the Direct Debit Authority | Action needed on your direct debit | Your bank didn't accept the authority. Tap to see next steps. | DDA screen / next steps | ET41/NT17 |
| P04 | P1 | CC · PL · CASA | Queue user rejects (Credit, Sale, Risk or Compliance), Rule Engine filtration fails, or minimum income not met | Update on your application | Tap to view the status of your %%PRODUCT_TYPE%% application. | Application status | ET22/NT10 · ET8/NT11 · ET12 · ET19/NT07/NT08 · ET21/NT19 |
| P08 | P1 | PL | Customer's bank accepts the Direct Debit Authority | Direct debit is set up | Your bank approved your direct debit. Tap to view your loan. | Loan details | ET40/NT21 |
| P10 | P1 | PL | Disbursement Checker approves and releases the disbursement | Your loan is on its way | Funds will reach your account shortly. Tap for details. | Loan details | ET42/NT18 |
| P11 | P1 | CC · PL · CASA | Card issued (CC, CASA) or loan approved (PL) | Your %%PRODUCT_TYPE%% is ready | Tap to see what happens next. | Product screen (card / loan / account) | ET37 · ET38 · NT13 |
| P03 | P2 | CC · PL · CASA | Offer validity (30 days) elapses with no acceptance | Your offer has expired | You can reapply whenever you're ready. | SDK start (new application) | ET14/NT03 |

**Language:** Push is sent in English or Arabic, based on the language currently used by the customer. Arabic Title / Body for all Push IDs to be provided and confirmed by RB Business: TBC

### Acceptance Criteria

**AC1. Build push content**

* When the application reaches a trigger event and the product matches Applies to, the system builds one push request for that application.
* `%%PRODUCT_TYPE%%` and `%%COUNTING_DOWN%%` are replaced with actual values before sending. No placeholder is ever shown to the customer.
* Title ≤ 40 characters and Body ≤ 100 characters after replacement.
* Content is fixed per Push ID; not configurable via Super Portal in this release.

**AC2. Integrate with Super App Push Notification API**

[Push Notification API](https://scvaladdin.atlassian.net/wiki/spaces/ALADDIN/pages/1008304195/RF+Sign+Off+API+Documents)

Attachment on the ticket: `Reem_Payments_API_PushNotifications_Specification_v0.1.docx`

Mapped to Reem Payments API – Push Notifications Specification v0.1 (Avanza, 25/09/2026). Items the spec does not yet answer are marked **TBC by Avanza**.

* Method: POST
* Endpoint: http://&lt;MW URL>/api/notifications/push — MW URL per environment (SIT / UAT / PROD) and HTTPS: **TBC by Avanza**
* Authentication: Bearer token — token issuance (endpoint, grant, expiry): **TBC by Avanza**

**Headers**

| Parameter | Type | Required | Description | Values / Data Source |
|---|---|---|---|---|
| stan | String | Mandatory | Unique system audit trace number in each request | Generated by Appro, unique per request. Format / length: TBC by Avanza |
| Authorization | String | Mandatory | Authorization header | Bearer &lt;token> |
| Content-Type | String | Mandatory | Request format | application/json |
| channel_id | String | Mandatory | Channel id of the calling system | Value assigned to Appro: TBC by Avanza |

**Request body**

| Parameter | Type | Required | Description | Values / Data Source |
|---|---|---|---|---|
| requestId | String | Mandatory | Unique message id | Generated by Appro, unique per push. Same or new id on retry: TBC by Avanza |
| timestamp | String | Mandatory | Request date-time | ISO 8601 UTC with milliseconds, e.g. 2026-09-28T06:49:02.366Z (per spec sample) |
| type | String | Mandatory | Notification type | Fixed: APPRO_NOTIFICATION |
| action.id | String | Mandatory | Push identifier | Push ID from the Trigger Point table, e.g. P01. P01 (CASA) is sent as P01 with action.value = CASA |
| action.type | String | Mandatory | NONE / POPUP / APPRO_JOURNEY | APPRO_JOURNEY for every Push ID, so a tap opens the Appro SDK. Behaviour of NONE / POPUP, and how the Super App hands action.id / action.value to the Appro SDK on tap: TBC by Avanza |
| action.value | String | Mandatory | Product | CREDIT_CARD / PERSONAL_LOAN / CASA, from the application. NA is not used — every push belongs to an application |
| recipient.mobilePhone | String | Mandatory | Customer mobile number | Customer's mobile number from the application. Format (country code, '+', spaces): TBC by Avanza |
| recipient.customerId | String | Conditional | Customer CIF — required if ETB | ETB: customer CIF. NTB: not sent. Whether mobilePhone alone reaches an NTB customer: TBC by Avanza |
| recipient.email | String | Optional | Customer email | Not sent. Purpose: TBC by Avanza |
| content.title | String | Mandatory | Push title | Per Push ID table, in the customer's current language |
| content.body | String | Mandatory | Push body | Per Push ID table, in the customer's current language |
| content.message | String | Optional | Notification message | Sent empty (""), as in the spec sample. Purpose vs body: TBC by Avanza |
| content.language | String | Mandatory | Language — en / ar | Customer's current language. Case (en vs EN in the sample) and type (listed as Date Timestamp): TBC by Avanza |

Request sample (spec v0.1, values mapped):

```json
{
  "requestId": "<unique id>",
  "timestamp": "2026-09-28T06:49:02.366Z",
  "type": "APPRO_NOTIFICATION",
  "action": { "id": "P01", "type": "APPRO_JOURNEY", "value": "CREDIT_CARD" },
  "recipient": { "mobilePhone": "9715XXXXXXXX", "customerId": "<CIF, if ETB>" },
  "content": {
    "title": "Your Credit Card offer is ready",
    "body": "Tap to review your offer and continue your application.",
    "message": "",
    "language": "en"
  }
}
```

**Response**

| Parameter | Type | Description | Values / Handling |
|---|---|---|---|
| messageId | String | Message id returned by the middleware | Recorded in the audit trail |
| error.code | String | Result code | "000" = Processed Ok. Full code list and which codes are retryable: TBC by Avanza |
| error.message | String | Result description | Recorded in the audit trail |

Response sample (spec v0.1):

```json
{ "messageId": "0:1790341509514173%d5881a7ad5881a7a", "error": { "code": "000", "message": "Processed Ok" } }
```

**AC3. Handle response and retry**

* If HTTP Code = 20x and error.code = "000" (Processed Ok) → push sent successfully → log audit trail (Step Status = Success) → proceed.
* Else → system retries automatically after X mins, up to N attempts. X and N are configurable.
* Else covers a timeout, any non-20x HTTP status and any error.code other than "000". Full error.code list, and any code that should not be retried: **TBC by Avanza**
* If still not successful after the last attempt → log audit trail (Step Status = Failed) → ignore and proceed. Push failure does not block, delay or change the application status.
* The system tracks API delivery result only; customer actions on the notification (open, dismiss, ignore) are not tracked.

**AC4. Duplicate and reminder control**

* Maximum one push per Push ID per trigger occurrence per application. Consolidated templates (e.g. P04) must not generate more than one push for the same decision.
* P02 is sent once per day for 15 days from the first offer display, and stops immediately once the customer selects an offer or the application is expired, cancelled or rejected.

### Audit Trail

* [Application ID] = &lt;current Application ID>
* [Step] = Push Notification
* [Step Details] = Send Push &lt;Push ID> · stan &lt;stan> · requestId &lt;requestId> · messageId &lt;messageId> or error.code &lt;code>
* [Start Time] = &lt;request sent date time>
* [End Time] = &lt;response or last timeout date time>
* [Attempt No.] = &lt;n of N>
* [Step Status] = Success / Failed
* [Action by] = {System}
* Application status: not changed

### Business Rules

* BR1. Push is additional; existing Email and In-app notifications are unchanged.
* BR2. No personal data in Title / Body (no name, Application ID, IBAN or amounts).
* BR3. OTP content (ET17, ET18, ET35, NT04, NT05) is never sent as push.
* BR4. Bank / internal-user templates are never sent as push.

### Reference

[RF-2015](https://scvaladdin.atlassian.net/browse/RF-2015)

[RF-3253](https://scvaladdin.atlassian.net/browse/RF-3253)
