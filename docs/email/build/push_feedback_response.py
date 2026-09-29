"""Reply to the Reem Bank review of BRD Push Notification V1.1 (Fadel Mansour 1-15, Shurafa PDF comments).

    python3 docs/email/build/push_feedback_response.py

Writes docs/email/Email_Push_Notification_BRD_Feedback_Response.html (paste-ready, Outlook-safe)
and the .txt twin. Answers in THEIR numbering; every item classified (skill: bank stakeholder
feedback). Commercial items use the PO's standard position (MVP 1.1 email thread).
[bracketed] values are for the PO to fill before sending.
"""
import html, os, re

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   'Email_Push_Notification_BRD_Feedback_Response')

TAGS = {  # label: (background, text)
    'Covered': ('#E6F4EA', '#1E6B34'),
    'Revised BRD': ('#E8F0FE', '#1A4FB8'),
    'Configuration': ('#E0F2F1', '#00695C'),
    'Dependency – Avanza': ('#FFF4E5', '#9A4B00'),
    'Decision – Reem Bank': ('#F3E8FF', '#6B21A8'),
    'Commercial · next phase': ('#ECEFF4', '#1A214D'),
}

COMMERCIAL = [
    'The original scope of work covers Email and SMS only. Updates to Email and SMS for new features are '
    'already part of the product.',
    'Push notification is new and specific to each bank, so it is delivered as a product customisation. To fit '
    'the timeline, it is kept to an MVP that gets the feature live — for example, push content is not managed in '
    'Super Portal in this phase. Bringing it to Super Portal is a next-phase enhancement, and we will estimate '
    'that effort as well.',
    'From a system-design perspective, the solution is built to be scalable, so it can be upgraded on top of this '
    'customisation after release.',
    'As we have agreed on dedicated development team support, future updates are no longer handled as CRs. The '
    'development team will enhance the feature based on launch feedback, after the MVP version is signed off.',
]

FADEL = [
    ('1', 'Push notification configuration – avoid future CRs', ['Configuration', 'Commercial · next phase'],
     'The MVP keeps push content fixed per notification, as agreed at kickoff (our email of 15/09). To keep '
     'changes light, these are held as backend configuration and changed by Appro on the Bank’s request, '
     'without a code release: enable / disable per Push ID, English and Arabic content, P02 reminder frequency '
     'and maximum count, offer validity used by P03, and retry interval and attempts. Self-service configuration '
     'in Super Portal and new Push IDs follow in the next phase, per the commercial position above.',
     'New “Configuration” section: what is configurable now, how, and what follows next phase.'),
    ('2', 'Complete end-to-end push notification journey', ['Revised BRD', 'Dependency – Avanza'],
     'Agreed. Appro owns: the eligibility check at send time (application still active, event still valid), '
     'building and sending the push, the delivery result, and — on tap — the landing screen and the fallback '
     'when the application is no longer active. The Super App owns: device registration and token validity, '
     'notification permission, changed or multiple devices, login and session. All ten scenarios you listed go '
     'into the BRD with owner and behaviour; the Super App rows are to be confirmed by Avanza.',
     'Extended flow + scenario table (scenario · owner · behaviour).'),
    ('3', 'Deep-linking defined per notification', ['Revised BRD', 'Dependency – Avanza'],
     'Agreed. A table per Push ID: trigger, destination screen, logged in, logged out, application no longer '
     'active and fallback screen. Logged out: the Super App asks the customer to log in, then routes to the '
     'destination screen (Shurafa’s comment on page 3). Application no longer active: the application status '
     'screen. Avanza to confirm the Super App keeps the destination through login.',
     'Deep-link table for all Push IDs.'),
    ('4', 'Reminder logic and suppression rules', ['Covered', 'Revised BRD', 'Configuration'],
     'Already in the development specification: P02 stops once the customer selects an offer, or the application '
     'is expired, cancelled or rejected. The BRD will state this explicitly with your full set — offer accepted, application completed, offer rejected, '
     'cancelled or withdrawn, rejected, expired, product booked or issued — and the P02 frequency and maximum '
     'count become configurable (item 1).',
     'Reminder and suppression rules, stated explicitly.'),
    ('5', 'Duplicate notification prevention', ['Covered', 'Revised BRD', 'Dependency – Avanza'],
     'Already in the development specification: one push per Push ID per trigger occurrence per application. '
     'The BRD will state it, plus an idempotency rule — '
     'each business event carries one request ID and every retry reuses it, so a system retry, event replay, '
     'timeout or reprocessing never produces a second notification. Avanza to confirm the middleware '
     'de-duplicates on the request ID.',
     'New business rule on duplicates and idempotency.'),
    ('6', 'Arabic content before sign-off', ['Decision – Reem Bank'],
     'Agreed: English and Arabic are one requirement and are tested together in UAT. [We have not yet received '
     'the approved Arabic titles and bodies.] Please share them against the final English wording (item 7) and '
     'we will add them to the BRD.',
     'Arabic column in the content table.'),
    ('7', 'Customer communication wording', ['Decision – Reem Bank'],
     'Accepted for P01, P04 and P09 as you proposed — all within the 40 / 100 character limits and with no '
     'personal data on the lock screen. P05: Shurafa notes the customer has no place to upload documents, so '
     'we propose “One more document is needed” / “Tap to see which document is needed and how to share it.”, '
     'to be finalised once the Bank confirms how the customer provides the document.',
     'Updated content table.'),
    ('8', 'Push timing and customer experience', ['Revised BRD', 'Decision – Reem Bank'],
     'Event pushes are transactional and are sent immediately. The non-urgent ones — the P02 reminder and P03 '
     '(offer expired) — are released only within a configurable sending window in UAE time. Please confirm the '
     'window; we propose 09:00–21:00.',
     'Timing rules and sending window.'),
    ('9', 'Audit trail and operational visibility', ['Revised BRD', 'Dependency – Avanza', 'Commercial · next phase'],
     'Agreed that the Contact Centre must be able to verify a push. Each push is recorded against the application '
     'and shown to authorised users in Application Enquiry › Audit Trail as a simple entry: Push ID, date and '
     'time, attempts, final status (sent / failed) and failure reason. Delivery to the device, opened / clicked '
     'and deep-link success are Super App events that Appro cannot see (our email of 15/09); Avanza to confirm '
     'what the Super App can report. A dedicated notification report in Super Portal follows in the next phase.',
     'Audit trail entry per push (business-readable, no technical IDs).'),
    ('10', 'Retry rules finalised', ['Revised BRD', 'Dependency – Avanza'],
     'Agreed to document production values. Proposed: retry every 5 minutes, up to 3 attempts; a timeout counts '
     'as a failed attempt; the same request ID is reused on every retry; after the last attempt the push is '
     'recorded as failed and the journey continues. Which error codes are retryable depends on Avanza’s '
     'error-code list, still pending.',
     'Retry baseline values.'),
    ('11', 'Avanza / technical TBCs closed before sign-off', ['Dependency – Avanza'],
     'Agreed. The open items are listed in section 4 of the BRD and have been raised with Avanza. We accept the '
     'sign-off condition for items that affect the journey, interface, security, mapping, retry or error '
     'handling. Timeline: SIT sign-off (09 Oct) and UAT handover (10 Oct) hold only if Avanza closes these by '
     '[date]; any slip moves them day for day.',
     'Sign-off condition added.'),
    ('12', 'Security, privacy and logging', ['Revised BRD', 'Dependency – Avanza', 'Decision – Reem Bank'],
     'Agreed. Added: HTTPS / TLS on the middleware call (the specification currently shows http:// — raised with '
     'Avanza), bearer-token authentication, mobile number and CIF masked in Appro logs, push logs visible to '
     'authorised support users only, and no personal data in the title, body or error logs (extends BR2). Log '
     'retention follows the Bank’s policy — please confirm the period.',
     'Security and privacy requirements.'),
    ('13', 'Push failure must not impact the journey', ['Covered'],
     'Agreed and retained as mandatory: a push that is not sent never blocks, delays or changes the application '
     '(section 5). Added as a UAT acceptance criterion (item 14).',
     '—'),
    ('14', 'Acceptance criteria / UAT', ['Revised BRD'],
     'Agreed. A UAT section with your 20 criteria, each tagged Appro or Super App / Avanza, so Expleo can prepare '
     'test cases. Criteria that depend on the Super App — notification disabled, invalid token, multiple devices, '
     'logged-out routing — are tested end to end with Avanza.',
     'New UAT acceptance section.'),
    ('15', 'Future-proofing', ['Commercial · next phase'],
     'Agreed on the principle. MVP 1.1 covers the 10 agreed Push IDs. The framework is scalable: new Push IDs, '
     'products and journeys are added on the same framework without redesign, delivered by the dedicated '
     'development team after the MVP sign-off, based on launch feedback — not as CRs.',
     'Design principle statement.'),
]

SHURAFA = [
    ('S1', 'p.3', 'Login first and then route to the application journey.', ['Revised BRD', 'Dependency – Avanza'],
     'Agreed. On tap, the Super App asks the customer to log in, then routes to the Appro journey screen for the '
     'event (item 3).'),
    ('S2', 'p.3', 'Keep room for further enhancement in the future without CR.', ['Commercial · next phase'],
     'Noted — per the commercial position, future enhancements are handled by the dedicated development team, '
     'not as CRs, and the design is scalable.'),
    ('S3', 'p.3', 'Control push content and push notifications from Super Portal in the future, without CR.',
     ['Configuration', 'Commercial · next phase'],
     'In the MVP, content sits in backend configuration and changes without a release (item 1). Managing content '
     'and sending notifications from Super Portal are next-phase enhancements, with no CR.'),
    ('S4', 'p.4', 'Product scope: and any other product introduced in later phases.', ['Commercial · next phase'],
     'Noted — the framework supports additional products in later phases (item 15).'),
    ('S5', 'p.4', 'BR1: unchanged in this release, but expected to be able to … in the future.',
     ['Covered', 'Commercial · next phase'],
     'Email templates are already managed by the Bank in Super Portal › Communication Setup; this release leaves '
     'them unchanged. Your comment ends mid-sentence — could you share the capability you expect?'),
    ('S6', 'p.5', 'P05 “Upload it” — the customer has no place to upload documents.', ['Decision – Reem Bank'],
     'Agreed to change (item 7). Please confirm how the customer provides the document today, so the wording '
     'and the destination screen match.'),
    ('S7', 'p.5', 'P04 — what status will we show, a rejection screen?', ['Revised BRD'],
     'P04 opens the application status screen in the Appro journey, which shows the application’s current '
     'status. The lock-screen text stays neutral (item 7) and never shows the decision.'),
    ('S8', 'p.5', 'P10 “Tap for details” — where will it take him?', ['Revised BRD'],
     'P10 opens the loan details screen. The destination for every Push ID is in the new deep-link table '
     '(item 3).'),
    ('S9', 'p.5', 'P03 (30 days) — to be changed; customer can apply five times.',
     ['Configuration', 'Decision – Reem Bank'],
     'Noted. P03 follows the offer validity period, which becomes configurable (item 1) — please confirm the new '
     'value. The limit of five applications belongs to the re-apply rule (MVP 1.1 “Re-apply after rejection”); '
     'P03’s text “You can reapply whenever you’re ready” stays valid under it.'),
]

NEXT = [
    ('Reem Bank', 'Approve the wording (item 7) and share the Arabic content (item 6); confirm the sending window '
     '(item 8), log retention (item 12), the offer validity and re-apply limit (S9) and the P05 document channel (S6).'),
    ('Avanza', 'Close the specification items (item 11) and confirm the Super App behaviour for login, routing, '
     'devices and permissions (items 2–3) and what delivery or open data it can report (item 9).'),
    ('Appro', 'Circulate the revised BRD V1.2 by [date], with Avanza’s answers folded in as they arrive.'),
]

F = "font-family:Arial,Helvetica,sans-serif"
TD = "padding:8px 9px;border:1px solid #D8D8D8;vertical-align:top;"
TH = "background:#1A214D;color:#ffffff;font-weight:bold;padding:8px 9px;border:1px solid #1A214D;"


def pill(t):
    bg, fg = TAGS[t]
    return (f'<span style="display:inline-block;background:{bg};color:{fg};font-size:11px;font-weight:bold;'
            f'padding:2px 7px;border-radius:9px;margin:0 3px 3px 0;white-space:nowrap;">{html.escape(t)}</span>')


def e(s):
    s = html.escape(s)
    return re.sub(r'\[([^\]]+)\]', r'<span style="background:#FFF2CC;">[\1]</span>', s)


def build_html():
    legend = ''.join(pill(t) for t in TAGS)
    rows_f = ''.join(
        f'<tr><td style="{TD}width:22px;font-weight:bold;">{n}</td>'
        f'<td style="{TD}width:165px;font-weight:bold;">{e(title)}</td>'
        f'<td style="{TD}width:118px;">{"".join(pill(t) for t in tags)}</td>'
        f'<td style="{TD}">{e(resp)}'
        + (f'<br><span style="color:#6b6b6b;font-style:italic;">In the revised BRD: {e(brd)}</span>' if brd != '—' else '')
        + '</td></tr>'
        for n, title, tags, resp, brd in FADEL)
    rows_s = ''.join(
        f'<tr><td style="{TD}width:22px;font-weight:bold;">{n}</td>'
        f'<td style="{TD}width:165px;"><b>{pg}</b> — {e(c)}</td>'
        f'<td style="{TD}width:118px;">{"".join(pill(t) for t in tags)}</td>'
        f'<td style="{TD}">{e(resp)}</td></tr>'
        for n, pg, c, tags, resp in SHURAFA)
    bullets = ''.join(f'<tr><td style="padding:3px 8px 3px 0;vertical-align:top;">•</td><td style="padding:3px 0;">{e(b)}</td></tr>'
                      for b in COMMERCIAL)
    nxt = ''.join(f'<tr><td style="{TD}width:90px;font-weight:bold;">{o}</td><td style="{TD}">{e(t)}</td></tr>' for o, t in NEXT)
    head = (f'<tr><td style="{TH}">#</td><td style="{TH}">{{c1}}</td><td style="{TH}">Classification</td>'
            f'<td style="{TH}">Appro response</td></tr>')
    label = lambda t: (f'<tr><td style="padding:0 0 8px 0;font-size:12px;letter-spacing:1.2px;color:#6b6b6b;'
                       f'font-weight:bold;">{t}</td></tr>')
    return f'''<!doctype html>
<html><head><meta charset="utf-8"><title>Push Notification BRD - response to Reem Bank review</title></head>
<body style="margin:0;padding:24px;background:#ffffff;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="760" style="width:760px;border-collapse:collapse;{F};font-size:14px;line-height:1.5;color:#1a1a1a;">
<tr><td style="padding:0 0 18px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td style="height:4px;background:#3278FF;font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
<tr><td style="padding:0 0 14px 0;">Dear Mr. Fadel and Shurafa,</td></tr>
<tr><td style="padding:0 0 14px 0;">Thank you both for the detailed review. We share the objective: a push notification feature that is complete, customer-friendly and manageable. Please find our response below, item by item in your numbering, followed by Shurafa’s comments on the BRD.</td></tr>
<tr><td style="padding:0 0 18px 0;">Each item is classified so the scope stays transparent:<br><div style="margin-top:6px;">{legend}</div></td></tr>
{label('COMMERCIAL POSITION')}
<tr><td style="padding:0 0 18px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tr><td style="border-left:4px solid #1A214D;background:#F4F6FA;padding:12px 16px;">
As shared in our email “RE: Requirement Confirmation MVP 1.1 – Push Notification”, items marked <b>Commercial · next phase</b> follow this position:
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:6px;">{bullets}</table>
</td></tr></table></td></tr>
{label('RESPONSE TO MR. FADEL’S COMMENTS')}
<tr><td style="padding:0 0 20px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.45;">{head.replace('{c1}', 'Topic')}{rows_f}</table></td></tr>
{label('RESPONSE TO SHURAFA’S COMMENTS ON THE BRD')}
<tr><td style="padding:0 0 20px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.45;">{head.replace('{c1}', 'Comment')}{rows_s}</table></td></tr>
{label('NEXT STEPS')}
<tr><td style="padding:0 0 16px 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;font-size:12.5px;line-height:1.45;">{nxt}</table></td></tr>
<tr><td style="padding:0 0 16px 0;">Business sign-off of the revised BRD remains the gate for development and the Expleo handover. We are happy to walk through the revised version on a short call.</td></tr>
<tr><td>Thanks and Best regards,<br>Hailey</td></tr>
</table></body></html>
'''


def build_txt():
    L = ['Dear Mr. Fadel and Shurafa,', '',
         'Thank you both for the detailed review. We share the objective: a push notification feature that is '
         'complete, customer-friendly and manageable. Please find our response below, item by item in your '
         'numbering, followed by Shurafa’s comments on the BRD.', '',
         'COMMERCIAL POSITION (as shared in “RE: Requirement Confirmation MVP 1.1 – Push Notification”)']
    L += [f'• {b}' for b in COMMERCIAL] + ['', 'RESPONSE TO MR. FADEL’S COMMENTS']
    for n, title, tags, resp, brd in FADEL:
        L += [f'{n}. {title} [{" · ".join(tags)}]', f'   {resp}'] + ([f'   In the revised BRD: {brd}'] if brd != '—' else []) + ['']
    L += ['RESPONSE TO SHURAFA’S COMMENTS ON THE BRD']
    for n, pg, c, tags, resp in SHURAFA:
        L += [f'{n} ({pg}) {c} [{" · ".join(tags)}]', f'   {resp}', '']
    L += ['NEXT STEPS'] + [f'• {o}: {t}' for o, t in NEXT] + [
        '', 'Business sign-off of the revised BRD remains the gate for development and the Expleo handover. '
        'We are happy to walk through the revised version on a short call.', '', 'Thanks and Best regards,', 'Hailey']
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    open(OUT + '.html', 'w', encoding='utf8').write(build_html())
    open(OUT + '.txt', 'w', encoding='utf8').write(build_txt())
    print('written', OUT + '.html', 'and .txt ·', len(FADEL), 'Fadel items ·', len(SHURAFA), 'Shurafa comments')
