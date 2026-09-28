"""RF-3306 description as ADF: the PO's live text carried over verbatim, the
Avanza spec v0.1 mapping added in purple (post-review rule). Her inline file
card (mediaInline, media id 6c0ed05c-...) and the two smart links are kept in
their exact positions."""
import json, sys
P = '#6554c0'
def t(s, *marks):
    n = {"type": "text", "text": s}
    if marks: n["marks"] = [m if isinstance(m, dict) else {"type": m} for m in marks]
    return n
pur = {"type": "textColor", "attrs": {"color": P}}
def pt(s, *m): return t(s, pur, *m)                      # purple text
def para(*c): return {"type": "paragraph", "content": list(c)}
def h3(s): return {"type": "heading", "attrs": {"level": 3}, "content": [t(s)]}
def ul(*items): return {"type": "bulletList", "content": [{"type": "listItem", "content": [para(*i)]} for i in items]}
def code(s, lang="json"): return {"type": "codeBlock", "attrs": {"language": lang}, "content": [t(s)]}
def cell(*c, h=False): return {"type": "tableHeader" if h else "tableCell", "content": [para(*c)]}
def table(head, rows, purple=False):
    hc = [cell(pt(x, "strong") if purple else t(x, "strong"), h=True) for x in head]
    body = [{"type": "tableRow", "content": [cell(pt(c) if purple else t(c)) for c in r]} for r in rows]
    return {"type": "table", "attrs": {"isNumberColumnEnabled": False, "layout": "default"},
            "content": [{"type": "tableRow", "content": hc}] + body}
link = lambda s, u: t(s, {"type": "link", "attrs": {"href": u}})
card = lambda u: {"type": "inlineCard", "attrs": {"url": u}}
TBC = "TBC by Avanza"

trigger = [
 ["P01","P0","CC · PL","AIP given (at least one offer displayed), or Credit Queue approves / overrides the application","Your %%PRODUCT_TYPE%% offer is ready","Tap to review your offer and continue your application.","Offer selection","ET15/NT06 · ET9"],
 ["P01 (CASA)","P0","CASA","Account application approved in principle","Your account is approved","Tap to continue and complete your account opening.","Resume application","ET15/NT06 (CASA)"],
 ["P02","P0","CC · PL · CASA","Scheduled reminder once per day for 15 days, starting after the first offer is displayed","Your offer expires in %%COUNTING_DOWN%% days","Complete your application before your approval expires.","Offer selection","ET13 · NT02"],
 ["P05","P0","CC · PL · CASA","Credit or Sales team returns the case requesting documents from the customer","We need a document from you","Upload it to keep your application moving.","Document upload","NT12"],
 ["P06","P0","CC · PL","Cooling-off end date reached (start + 5 days, configurable) with no customer action; application returns to Approved In Principle","Your application is active again","Your cooling-off period has ended. Tap to continue or cancel.","Application Ready to Continue screen, then KFS","ET55/NT24"],
 ["P09","P0","PL","Customer's bank rejects the Direct Debit Authority","Action needed on your direct debit","Your bank didn't accept the authority. Tap to see next steps.","DDA screen / next steps","ET41/NT17"],
 ["P04","P1","CC · PL · CASA","Queue user rejects (Credit, Sale, Risk or Compliance), Rule Engine filtration fails, or minimum income not met","Update on your application","Tap to view the status of your %%PRODUCT_TYPE%% application.","Application status","ET22/NT10 · ET8/NT11 · ET12 · ET19/NT07/NT08 · ET21/NT19"],
 ["P08","P1","PL","Customer's bank accepts the Direct Debit Authority","Direct debit is set up","Your bank approved your direct debit. Tap to view your loan.","Loan details","ET40/NT21"],
 ["P10","P1","PL","Disbursement Checker approves and releases the disbursement","Your loan is on its way","Funds will reach your account shortly. Tap for details.","Loan details","ET42/NT18"],
 ["P11","P1","CC · PL · CASA","Card issued (CC, CASA) or loan approved (PL)","Your %%PRODUCT_TYPE%% is ready","Tap to see what happens next.","Product screen (card / loan / account)","ET37 · ET38 · NT13"],
 ["P03","P2","CC · PL · CASA","Offer validity (30 days) elapses with no acceptance","Your offer has expired","You can reapply whenever you're ready.","SDK start (new application)","ET14/NT03"],
]

req_sample = """{
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
}"""
resp_sample = """{ "messageId": "0:1790341509514173%d5881a7ad5881a7a", "error": { "code": "000", "message": "Processed Ok" } }"""

doc = {"type": "doc", "version": 1, "content": [
 para(pt("Updated 28/09 — changes since the last review are highlighted in purple.", "em")),
 h3("Context of Business"),
 para(t("Customers are currently informed of asynchronous journey decisions by Email and In-app notification only. When the customer is outside the Super App (e.g. waiting for a credit decision, a DDA response or the end of the cooling-off period), there is no device-level alert and the application stalls until the customer returns.")),
 para(t("This story adds Push Notification as an additional channel at the agreed trigger events. The backend sends the push request to the Super App Push Notification API, following the same integration pattern as the existing SMS/Email integration. On tap, the customer is taken into the Appro SDK at the corresponding screen to resume the journey.")),
 para(t("Scope:", "strong"), t(" Credit Card, Personal Loan, CASA · iOS and Android")),
 h3("User Story"),
 para(t("As a", "strong"), t(" system,"), {"type": "hardBreak"},
      t("I want", "strong"), t(" to send a Push Notification to the customer at each agreed onboarding trigger event,"), {"type": "hardBreak"},
      t("So that", "strong"), t(" the customer is alerted to decisions and required actions and returns to the journey at the right screen.")),
 h3("Trigger Point"),
 para(t("Push is fired at the same trigger point as the existing Email / In-app notification templates listed under Source templates. Existing Email and In-app notifications remain unchanged.")),
 table(["Push ID","Priority","Applies to","Trigger event","Title (EN, ≤40 chars)","Body (EN, ≤100 chars)","Deep-link screen","Source templates"], trigger),
 para(t("Language:", "strong"), t(" Push is sent in English or Arabic, based on the language currently used by the customer. Arabic Title / Body for all Push IDs to be provided and confirmed by RB Business: TBC")),
 h3("Acceptance Criteria"),
 para(t("AC1. Build push content", "strong")),
 ul([t("When the application reaches a trigger event and the product matches Applies to, the system builds one push request for that application.")],
    [t("%%PRODUCT_TYPE%%", "code"), t(" and "), t("%%COUNTING_DOWN%%", "code"), t(" are replaced with actual values before sending. No placeholder is ever shown to the customer.")],
    [t("Title ≤ 40 characters and Body ≤ 100 characters after replacement.")],
    [t("Content is fixed per Push ID; not configurable via Super Portal in this release.")]),
 para(t("AC2. Integrate with Super App Push Notification API", "strong")),
 para(link("Push Notification API", "https://scvaladdin.atlassian.net/wiki/spaces/ALADDIN/pages/1008304195/RF+Sign+Off+API+Documents")),
 para({"type": "mediaInline", "attrs": {"type": "file", "id": "6c0ed05c-e96f-422d-8c1b-481cdf20f9d2", "collection": ""}}, t("   ")),
 para(pt("Mapped to Reem Payments API – Push Notifications Specification v0.1 (Avanza, 25/09/2026). Items the spec does not yet answer are marked "), pt(TBC, "strong"), pt(".")),
 ul([pt("Method: POST")],
    [pt("Endpoint: http://<MW URL>/api/notifications/push — MW URL per environment (SIT / UAT / PROD) and HTTPS: "), pt(TBC, "strong")],
    [pt("Authentication: Bearer token — token issuance (endpoint, grant, expiry): "), pt(TBC, "strong")]),
 para(pt("Headers", "strong")),
 table(["Parameter","Type","Required","Description","Values / Data Source"], [
   ["stan","String","Mandatory","Unique system audit trace number in each request","Generated by Appro, unique per request. Format / length: "+TBC],
   ["Authorization","String","Mandatory","Authorization header","Bearer <token>"],
   ["Content-Type","String","Mandatory","Request format","application/json"],
   ["channel_id","String","Mandatory","Channel id of the calling system","Value assigned to Appro: "+TBC],
 ], purple=True),
 para(pt("Request body", "strong")),
 table(["Parameter","Type","Required","Description","Values / Data Source"], [
   ["requestId","String","Mandatory","Unique message id","Generated by Appro, unique per push. Same or new id on retry: "+TBC],
   ["timestamp","String","Mandatory","Request date-time","ISO 8601 UTC with milliseconds, e.g. 2026-09-28T06:49:02.366Z (per spec sample)"],
   ["type","String","Mandatory","Notification type","Fixed: APPRO_NOTIFICATION"],
   ["action.id","String","Mandatory","Push identifier","Push ID from the Trigger Point table, e.g. P01. P01 (CASA) is sent as P01 with action.value = CASA"],
   ["action.type","String","Mandatory","NONE / POPUP / APPRO_JOURNEY","APPRO_JOURNEY for every Push ID, so a tap opens the Appro SDK. Behaviour of NONE / POPUP, and how the Super App hands action.id / action.value to the Appro SDK on tap: "+TBC],
   ["action.value","String","Mandatory","Product","CREDIT_CARD / PERSONAL_LOAN / CASA, from the application. NA is not used — every push belongs to an application"],
   ["recipient.mobilePhone","String","Mandatory","Customer mobile number","Customer's mobile number from the application. Format (country code, '+', spaces): "+TBC],
   ["recipient.customerId","String","Conditional","Customer CIF — required if ETB","ETB: customer CIF. NTB: not sent. Whether mobilePhone alone reaches an NTB customer: "+TBC],
   ["recipient.email","String","Optional","Customer email","Not sent. Purpose: "+TBC],
   ["content.title","String","Mandatory","Push title","Per Push ID table, in the customer's current language"],
   ["content.body","String","Mandatory","Push body","Per Push ID table, in the customer's current language"],
   ["content.message","String","Optional","Notification message","Sent empty (\"\"), as in the spec sample. Purpose vs body: "+TBC],
   ["content.language","String","Mandatory","Language — en / ar","Customer's current language. Case (en vs EN in the sample) and type (listed as Date Timestamp): "+TBC],
 ], purple=True),
 para(pt("Request sample (spec v0.1, values mapped):")),
 code(req_sample),
 para(pt("Response", "strong")),
 table(["Parameter","Type","Description","Values / Handling"], [
   ["messageId","String","Message id returned by the middleware","Recorded in the audit trail"],
   ["error.code","String","Result code","\"000\" = Processed Ok. Full code list and which codes are retryable: "+TBC],
   ["error.message","String","Result description","Recorded in the audit trail"],
 ], purple=True),
 para(pt("Response sample (spec v0.1):")),
 code(resp_sample),
 para(t("AC3. Handle response and retry", "strong")),
 ul([t("If HTTP Code = 20x"), pt(" and error.code = \"000\" (Processed Ok)"), t(" → push sent successfully → log audit trail (Step Status = Success) → proceed.")],
    [t("Else → system retries automatically after X mins, up to N attempts. X and N are configurable.")],
    [pt("Else covers a timeout, any non-20x HTTP status and any error.code other than \"000\". Full error.code list, and any code that should not be retried: "), pt(TBC, "strong")],
    [t("If still not "), pt("successful"), t(" after the last attempt → log audit trail (Step Status = Failed) → ignore and proceed. Push failure does not block, delay or change the application status.")],
    [t("The system tracks API delivery result only; customer actions on the notification (open, dismiss, ignore) are not tracked.")]),
 para(t("AC4. Duplicate and reminder control", "strong")),
 ul([t("Maximum one push per Push ID per trigger occurrence per application. Consolidated templates (e.g. P04) must not generate more than one push for the same decision.")],
    [t("P02 is sent once per day for 15 days from the first offer display, and stops immediately once the customer selects an offer or the application is expired, cancelled or rejected.")]),
 h3("Audit Trail"),
 ul([t("[Application ID] = <current Application ID>")],
    [t("[Step] = Push Notification")],
    [t("[Step Details] = Send Push <Push ID>"), pt(" · stan <stan> · requestId <requestId> · messageId <messageId> or error.code <code>")],
    [t("[Start Time] = <request sent date time>")],
    [t("[End Time] = <response or last timeout date time>")],
    [t("[Attempt No.] = <n of N>")],
    [t("[Step Status] = Success / Failed")],
    [t("[Action by] = {System}")],
    [t("Application status: not changed")]),
 h3("Business Rules"),
 ul([t("BR1. Push is additional; existing Email and In-app notifications are unchanged.")],
    [t("BR2. No personal data in Title / Body (no name, Application ID, IBAN or amounts).")],
    [t("BR3. OTP content (ET17, ET18, ET35, NT04, NT05) is never sent as push.")],
    [t("BR4. Bank / internal-user templates are never sent as push.")]),
 h3("Reference"),
 para(card("https://scvaladdin.atlassian.net/browse/RF-2015"), t(" ")),
 para(card("https://scvaladdin.atlassian.net/browse/RF-3253"), t(" ")),
]}

# ---- census before push (skill: code + textColor makes Jira reject the whole edit) ----
bad=[]; media=0; cards=0; purple=0
def walk(n):
    global media, cards, purple
    if isinstance(n, dict):
        if n.get("type") == "mediaInline": media += 1
        if n.get("type") == "inlineCard": cards += 1
        ms = {m["type"] for m in n.get("marks", [])}
        if "textColor" in ms: purple += 1
        if "code" in ms and len(ms) > 1: bad.append(n.get("text"))
        for v in n.values(): walk(v)
    elif isinstance(n, list):
        for v in n: walk(v)
walk(doc)
out = json.dumps(doc, ensure_ascii=False, separators=(",", ":"))
open(sys.argv[1], "w").write(out)
print(f"media={media} inlineCards={cards} purple_runs={purple} illegal_code_combos={bad} bytes={len(out.encode())}")
