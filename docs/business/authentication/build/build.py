import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from lib import *

ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); A=os.path.join(ROOT,'assets'); F=os.path.join(ROOT,'fig')
OUT=sys.argv[1]
doc=Document()
sec=doc.sections[0]; sec.page_width=Inches(8.27); sec.page_height=Inches(11.69)
for m in ('left_margin','right_margin','top_margin','bottom_margin'): setattr(sec,m,Inches(1))
sec.header_distance=Inches(0.35); sec.footer_distance=Inches(0.35)
TW=6.27

# base styles
st=doc.styles['Normal']; st.font.name='Lato'; st.font.size=Pt(11); st.font.color.rgb=NAVY
st.element.rPr.rFonts.set(qn('w:eastAsia'),'Lato')
for name,size,col,b,a in (('Heading 1',16,BLUE,16,4),('Heading 2',14,NAVY,12,4),('Heading 3',12,NAVY,10,3)):
    s=doc.styles[name]; s.font.name='Lato'; s.font.size=Pt(size); s.font.bold=True; s.font.color.rgb=col; s.font.italic=False
    rpr=s.element.get_or_add_rPr(); rf=rpr.find(qn('w:rFonts'))
    if rf is None: rf=OxmlElement('w:rFonts'); rpr.insert(0,rf)
    for k in ('w:ascii','w:hAnsi','w:cs','w:eastAsia'): rf.set(qn(k),'Lato')
    for k in ('w:asciiTheme','w:hAnsiTheme','w:eastAsiaTheme','w:cstheme'):
        if rf.get(qn(k)) is not None: del rf.attrib[qn(k)]
    s.paragraph_format.space_before=Pt(b); s.paragraph_format.space_after=Pt(a); s.paragraph_format.keep_with_next=True

# header: Confidential (left) + logo (right)
def hf_table(container,cols,ws):
    t=container.add_table(rows=1,cols=cols,width=Inches(TW)); borders(t,'FFFFFF',0,'nil'); widths(t,ws); cell_margins(t,0,0,0,0); return t
h=sec.header; h.paragraphs[0].text=''
ht=hf_table(h,2,[3.9,2.37])
p=ht.cell(0,0).paragraphs[0]; r=p.add_run('Confidential'); font(r,8,color=GRAY)
ht.cell(0,0).vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
p=ht.cell(0,1).paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; p.add_run().add_picture(os.path.join(A,'logo-dark.png'),width=Inches(0.95))
# footer: disclaimer | page | icon
f=sec.footer; f.paragraphs[0].text=''
ft=hf_table(f,3,[4.6,0.6,1.07])
p=ft.cell(0,0).paragraphs[0]; r=p.add_run('Confidential document between Appro Onboarding Solutions FZ-LLC and the receiving bank — not to be shared outside both organisations.'); font(r,7,color=GRAY)
p=ft.cell(0,1).paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run(); fc=OxmlElement('w:fldChar'); fc.set(qn('w:fldCharType'),'begin'); r._r.append(fc)
r2=p.add_run(); it=OxmlElement('w:instrText'); it.set(qn('xml:space'),'preserve'); it.text=' PAGE '; r2._r.append(it)
r3=p.add_run(); fc2=OxmlElement('w:fldChar'); fc2.set(qn('w:fldCharType'),'end'); r3._r.append(fc2)
for rr in (r,r2,r3): font(rr,8,color=NAVY)
p=ft.cell(0,2).paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.RIGHT; p.add_run().add_picture(os.path.join(A,'icon-4circles.png'),width=Inches(0.55))
for c in ft.rows[0].cells: c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER

# ---------- helpers ----------
def H1(t,newpage=False):
    p=doc.add_paragraph(style='Heading 1')
    if newpage: p.paragraph_format.page_break_before=True
    r=p.add_run(t); font(r,16,True,BLUE); rule(doc,'FDBA23',1.0,6)
def H2(t):
    p=doc.add_paragraph(style='Heading 2'); r=p.add_run(t); font(r,14,True,NAVY)
def H3(t):
    p=doc.add_paragraph(style='Heading 3'); r=p.add_run(t); font(r,12,True,NAVY)
def P(t,after=6,size=11,italic=False,keep=False):
    p=doc.add_paragraph(); rich(p,t,size,italic=italic); spacing(p,0,after,1.15,keep); return p
def B(items,size=11):
    for t in items:
        p=doc.add_paragraph(style='List Bullet'); rich(p,t,size); spacing(p,0,3,1.15)
def N(items,size=11):
    for t in items:
        p=doc.add_paragraph(style='List Number'); rich(p,t,size); spacing(p,0,3,1.15)
def FIG(name):
    p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.CENTER; spacing(p,6,10)
    p.add_run().add_picture(os.path.join(F,name+'.png'),width=Inches(TW))
SHOTS=[]
def NUM(i,lead,body=''):
    p=doc.add_paragraph(); pf=p.paragraph_format; pf.left_indent=Inches(0.3); pf.first_line_indent=Inches(-0.3)
    pf.tab_stops.add_tab_stop(Inches(0.3)); spacing(p,0,4,1.15)
    r=p.add_run(f'{i}.\t'); font(r,11,True,BLUE)
    if body: r=p.add_run(lead); font(r,11,True,NAVY); r=p.add_run(body); font(r,11)
    else: rich(p,lead)
def SHOT(title,section):
    n=len(SHOTS)+1; SHOTS.append((n,title,section))
    t=doc.add_table(rows=1,cols=1); borders(t,'3B7EF6',6,'dashed'); widths(t,[TW]); cell_margins(t,200,200,200,200)
    c=t.cell(0,0); shade(c,'EDF2FF'); no_split(t.rows[0])
    tr=t.rows[0]._tr.get_or_add_trPr(); hgt=OxmlElement('w:trHeight'); hgt.set(qn('w:val'),str(int(1.9*1440))); hgt.set(qn('w:hRule'),'atLeast'); tr.append(hgt)
    c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
    p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(f'Screenshot {n}'); font(r,11,True,BLUE)
    p2=c.add_paragraph(); p2.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p2.add_run(title); font(r,11,True,NAVY)
    q=doc.add_paragraph(); spacing(q,0,8)

# ---------- COVER ----------
p=doc.add_paragraph(); spacing(p,30,2); r=p.add_run('CONFIDENTIAL'); font(r,9,True,GRAY)
rule(doc,'FDBA23',1.0,14)
p=doc.add_paragraph(); spacing(p,0,4); r=p.add_run('Bank Portal Authentication'); font(r,26,True,NAVY)
p=doc.add_paragraph(); spacing(p,0,10); r=p.add_run('Signing in with a portal password and with single sign-on'); font(r,16,True,BLUE)
p=doc.add_paragraph(); spacing(p,0,3); r=p.add_run('Appro Onboarding Solutions FZ-LLC'); font(r,11,color=NAVY)
for line in ('Prepared by: Appro Product','Date: 28/10/2026','Version 1.0 · Draft for review'):
    p=doc.add_paragraph(); spacing(p,0,3); r=p.add_run(line); font(r,11,color=GRAY)
rule(doc,'1A214D',1.0,14,keep=False)

p=doc.add_paragraph(); spacing(p,12,6); r=p.add_run('About this document'); font(r,14,True,NAVY)
P('This document explains, for the bank’s business, operations and IT teams, how staff sign in to the Bank Portal: with a portal password, or with single sign-on through the bank’s own identity provider. It sets out what each person sees, the rules behind each outcome, what the bank controls, and what to put in place before single sign-on is switched on.')
P('It describes the agreed product behaviour. Screens are shown in section order and listed in Appendix B.')

p=doc.add_paragraph(); spacing(p,12,6); r=p.add_run('Contents'); font(r,14,True,NAVY)
CONTENTS=['1. Executive summary','2. Key terms','3. How sign-in works','4. Signing in with a portal password','5. Signing in with single sign-on','6. Managing single sign-on: Sign-in Settings','7. Accounts from the bank’s directory','8. Security policy by account type','9. Roles and responsibilities','10. Before you switch on single sign-on','11. Planned enhancements','Appendix A. Messages','Appendix B. Screenshot index']
for c_ in CONTENTS:
    p=doc.add_paragraph(); spacing(p,0,2); r=p.add_run(c_); font(r,11,color=NAVY)

# ---------- 1 ----------
H1('1. Executive summary',newpage=True)
P('The Bank Portal offers two ways to sign in. Every bank has the **portal password** route. A bank that connects its own identity provider can switch on **single sign-on** for the staff in its directory. Five rules govern both routes.')
_i=1
for lead,body in (
 ('One setting per bank. ','Single sign-on is On or Off for the whole bank, never per user.'),
 ('The account decides the route. ','Portal accounts sign in with a password. Directory accounts sign in with single sign-on. The portal reads the account before it evaluates any password, and tells a person who pressed the wrong button which one to use.'),
 ('Password rules never block single sign-on. ','Expiry, history and lockout apply to portal passwords only. A directory account has no portal password, so none of these rules can stop it.'),
 ('Every change needs two people. ','Turning single sign-on on or off, and changing the connection details, both go through Maker-Checker approval.'),
 ('The login page does not confirm that an account exists. ','A wrong password and an unknown email return the same message, on the same field, in the same time.')):
    NUM(_i,lead,body); _i+=1
H2('At a glance')
table(doc,['','Portal password','Single sign-on'],[
 ['Who uses it','Portal accounts, created by the bank’s Super Admin through Add User','Directory accounts, created automatically from the bank’s directory'],
 ['Button on the login page','Login','Login with SSO — shown only while single sign-on is On'],
 ['How identity is proven','Password, then a one-time code sent to the registered email','At the bank’s identity provider, including its multi-factor authentication if the bank has set it up'],
 ['Password rules','Portal password policy (section 4.4)','The bank’s own directory policy'],
 ['Who controls access','Bank Super Admin, in the portal','Bank directory administrator; entitlements by the Super Admin in the portal'],
 ['Availability','Always','While the bank has single sign-on switched On'],
],[1.6,2.33,2.34])

# ---------- 2 ----------
H1('2. Key terms')
table(doc,['Term','Meaning in this document'],[
 ['Portal account','A user created in the portal by the bank’s Super Admin. Signs in with a portal password. Shown with Source = Portal.'],
 ['Directory account','A user created automatically from the bank’s directory. Signs in with single sign-on and has no portal password. Shown with Source = Directory.'],
 ['Identity provider','The bank’s own sign-in service, which holds its staff directory and checks their corporate credentials.'],
 ['Single sign-on (SSO)','Signing in to the portal with corporate credentials, verified by the bank’s identity provider rather than by the portal.'],
 ['Sign-in Settings','The portal screen where the bank switches single sign-on On or Off and maintains the connection to its identity provider.'],
 ['Maker / Checker','The person who submits a change, and the different person who approves or rejects it.'],
 ['Status','Active or Inactive. The only gate for any sign-in. A password event — expiry, lockout — never changes it.'],
 ['Entitlements','What a user may see and do in the portal: channel, approval level, product type, access to personal data.'],
],[1.6,4.67])

# ---------- 3 ----------
H1('3. How sign-in works',newpage=True)
P('The portal reads the account record first, then decides. Figure 1 shows every combination of account and button, and what the person sees.')
FIG('fig1')
H2('What the page discloses, and what it does not')
B(['A person whose email is unknown, or who enters the wrong password for a portal account, gets the same message — identical text, field and timing. The page never confirms that an account exists.',
   'A person who enters an email that belongs to a directory account is told to use single sign-on, or that single sign-on is switched off. This is deliberate: it sends staff to the right route instead of leaving them at a generic refusal.',
   'The two buttons never read each other. Login with SSO never reads the email or password typed on the page, and the password route never calls the bank’s identity provider.'])

# ---------- 4 ----------
H1('4. Signing in with a portal password',newpage=True)
P('For portal accounts. Two factors protect every sign-in: the password, then a one-time code sent to the registered email address.')
FIG('fig2')
H2('4.1 The login page')
table(doc,['Component','Behaviour'],[
 ['Email Address','Mandatory. The account’s registered email.'],
 ['Password','Mandatory. Masked by default; the eye icon shows or hides it.'],
 ['Forgot Password','Starts a password reset (section 4.5).'],
 ['Login','Validates the email and password, then sends the one-time code.'],
 ['Login with SSO','Shown only while the bank has single sign-on switched On. Appears or disappears on the next page load after approval, with no manual refresh.'],
],[1.6,4.67])
SHOT('Login page — password route and Login with SSO','4.1')
H2('4.2 One-time code')
B(['A unique 6-digit code is generated and emailed to the registered address after the password is accepted.',
   'The code is valid for **10 minutes**. A 60-second countdown runs before **Resend OTP** becomes available.',
   'Resending issues a new code and cancels the previous one.',
   'A wrong or expired code is refused, and the person is asked to try again.',
   'After **more than 5 wrong codes in a row in a day**, Verify and Login and Resend OTP are disabled for **1 hour**, with a countdown shown under the code field.'])
SHOT('One-time code screen','4.2')
H2('4.3 Failed attempts and lockout')
B(['**5 failed sign-in attempts within an hour** lock the account.',
   'Fewer than 5 failures are cleared at the start of the next hour.',
   'Lockout and expiry are recorded against the password only. They never change the account’s Status, and they never affect single sign-on.'])
H2('4.4 Password policy')
P('Applies to portal accounts only.',keep=True)
table(doc,['Rule','Requirement'],[
 ['Length','At least 10 characters'],
 ['Composition','At least one uppercase letter (A–Z), one lowercase letter (a–z), one number and one special character'],
 ['Not allowed','Dictionary words · repetitive characters such as “aaaaaaa” or “1234abcd” · context-specific terms such as the company, service or username'],
 ['Expiry','60 days'],
 ['Reuse','None of the last 6 passwords'],
 ['Lockout','5 failed attempts'],
 ['Dormant accounts','Disabled after 30 days without a sign-in'],
 ['Protection','Encrypted in transit and hashed when stored'],
 ['Session','Signed out after 5 minutes of inactivity'],
],[1.6,4.67])
H2('4.5 Expired or locked password')
P('The person is told their password has expired and to reset it using “Forgot password?”. They are not shown the generic refusal, so they know the way back in.')
SHOT('Portal account with an expired password','4.5')
H2('4.6 Forgot password')
B(['The page always answers “If this username exists, a reset email has been sent.” — whatever was entered.',
   'A directory account has no portal password, so no reset email is sent for it.'])
H2('4.7 Session and logout')
B(['After **4 minutes 30 seconds** without activity a warning counts down 30 seconds. **Keep working** continues the session; **Log out** ends it at once. At zero the person is signed out.',
   'After an automatic sign-out the person signs in again. No previous session data is kept.',
   'Log Out in the left menu asks “Are you sure you want to Logout?”. Cancel keeps the session; Logout returns to the login page.'])

# ---------- 5 ----------
H1('5. Signing in with single sign-on',newpage=True)
P('For directory accounts, while the bank has single sign-on switched On. The person proves who they are to the bank’s own identity provider. The portal never sees or stores their corporate password.')
FIG('fig3')
H2('5.1 What the portal checks')
P('Exactly two things: that the email belongs to a **directory account**, and that its Status is **Active**. Nothing about a portal password is read — expiry, history and lockout cannot block or interrupt a single sign-on.')
H2('5.2 A directory account on the password route')
P('If a directory account enters its email and a password on the Login form, the portal does not evaluate the password. It tells the person: “This account now signs in with single sign-on. Select “Login with SSO” to continue.”')
SHOT('Directory account on the password route','5.2')
H2('5.3 When single sign-on is switched off')
B(['Login with SSO is hidden.',
   'A directory account on the password route is told: “Single sign-on is currently switched off for your organisation. Please contact your administrator.”',
   'There is **no password fallback**. Directory accounts cannot sign in at all until single sign-on is switched back On. Their records and roles are kept.',
   'Portal accounts are unaffected.'])
SHOT('Login while single sign-on is switched off','5.3')

# ---------- 6 ----------
H1('6. Managing single sign-on: Sign-in Settings',newpage=True)
P('**Navigation:** Users Management → Sign-in Settings. **Permissions:** View Sign-in Settings; Edit Sign-in Settings (Maker).')
P('One setting per bank. The screen holds the single sign-on switch and the connection to the bank’s identity provider. There is no per-user sign-in method.')
H2('6.1 The screen')
table(doc,['Component','What it shows'],[
 ['Single sign-on','The On / Off switch for the whole bank. Default for a new bank: Off. Locked while a request is waiting for approval.'],
 ['Status line','Under the switch: On or Off, then who last changed it and when (DD/MM/YYYY HH:MM). Replaced by “Pending Checker approval” while a request is open.'],
 ['Connection status','Connected when On · Paused when Off · Pending Checker approval while a request is open.'],
 ['Tenant ID','From the bank’s identity provider. Must be a valid identifier before it can be submitted.'],
 ['Client ID','From the bank’s identity provider. Same validation as Tenant ID.'],
 ['Redirect URI','Generated by Appro. The bank registers it with its identity provider. Read-only, with a copy button.'],
 ['Client secret','Write-only. Stored encrypted and never displayed after saving — the screen shows only that it is set, when and by whom. Minimum 8 characters; leave blank to keep the current secret.'],
],[1.6,4.67])
SHOT('Sign-in Settings — view','6.1')
SHOT('Connection details — edit','6.1')
H2('6.2 Making a change')
B(['**Switch:** operating the switch opens a confirmation. It asks for an optional reason, which is passed to the Checker. Nothing changes on the Maker’s click.',
   '**Turning Off** adds a warning: “Staff who sign in with single sign-on will not be able to sign in at all until it is turned on again — they have no password to fall back to.”',
   '**Connection details:** Edit opens the values. Submit for approval is enabled only when at least one value has changed and every changed value is valid. An invalid value never reaches the Checker.',
   'On submission the Maker sees “Your request for updated information is created successfully!” and the screen shows the pending state.'])
SHOT('Connection details — invalid value','6.2')
SHOT('Turn off single sign-on — confirmation','6.2')
SHOT('Sign-in Settings — pending Checker approval','6.2')
H2('6.3 Approval')
FIG('fig4')
P('The Checker sees the request summary, the Maker’s reason, and each changed value as **NEW** beside the **CURRENT** value. The client secret is masked on both lines — its value is never shown to anyone. Unchanged connection values are listed so the Checker sees the full connection. Nothing on the review screen is editable.')
SHOT('Request details — single sign-on switch','6.3')
SHOT('Request details — connection details','6.3')
H2('6.4 What On and Off mean')
table(doc,['','On','Off'],[
 ['Login with SSO','Shown','Hidden'],
 ['Directory accounts','Sign in with single sign-on','Cannot sign in. Records and roles kept.'],
 ['Portal accounts','Sign in with a password','Sign in with a password'],
 ['Directory sync and role publishing','Running','Paused'],
 ['Switching back On','—','Access returns at once. Directory sync resumes at its next cycle.'],
],[1.9,2.15,2.22])

# ---------- 7 ----------
H1('7. Accounts from the bank’s directory',newpage=True)
P('The bank’s directory owns who a person is. The portal owns what they may see and do.')
FIG('fig5')
H2('7.1 Roles')
B(['Creating or editing a role in Role Management publishes it to the bank’s directory automatically — there is no separate publish step.',
   'Each role shows **Published** with a timestamp, or **Failed** with a **Retry** button.',
   'A published role that still has users assigned cannot be deleted. Unassign all users first.',
   'Manage portal roles in the portal only. The portal keeps the bank’s directory in step with its own list of roles.'])
SHOT('Role Management — publish status','7.1')
H2('7.2 Entitlements')
P('A new directory account can sign in at once but sees no data until the Super Admin assigns entitlements. Nothing is inherited automatically from the role.',keep=True)
table(doc,['Entitlement','Default for a new directory account'],[
 ['Approval Level','None'],['Max Limit Approved Amount','0'],['Channel','None — no access to channel-based screens'],['Product Type','None'],['View PII Data','Not allowed'],
],[2.6,3.67])
P('The fields offered follow the person’s department, as held in the directory: **Credit** adds Max Limit Approved Amount; **Sales** adds Staff ID; every other department uses the standard fields. A role change from the directory replaces the role but keeps channels and entitlements.')
H2('7.3 What the bank can change on each account type')
table(doc,['','Directory account','Portal account'],[
 ['Name, Department, Phone, Email, Role, Lock Status','Read-only — follow the directory','Editable'],
 ['Approval Level, Max Limit, Channel, Product Type, View PII Data','Editable — Edit Entitlements','Editable'],
 ['Edit and Delete','Hidden','Available'],
 ['Created by','Directory sync','Super Admin, through Add User'],
],[2.4,1.9,1.97])
SHOT('User Details — directory account','7.3')
H2('7.4 User Management list')
B(['A **Source** column shows Directory or Portal, with filters All / Directory / Portal. Export includes Source.',
   'Add User is always available and always creates a portal account, whatever the single sign-on setting.',
   'Deactivated directory accounts stay in the list and in search, because the directory may reactivate them.'])
SHOT('User Management list — Source column','7.4')
H2('7.5 Leavers and removal')
B(['A person disabled in the directory becomes **Inactive** in the portal at the next sync and cannot sign in. The record is kept.',
   'If the directory reactivates them, they return to **Active** with channels and entitlements intact.',
   'A person deleted in the directory is **permanently purged** from the portal 30 days later.',
   '**Purging removes the person’s audit trail entries.** The bank’s compliance team must accept this before single sign-on is switched on.'])

# ---------- 8 ----------
H1('8. Security policy by account type',newpage=True)
table(doc,['Policy','Portal account','Directory account'],[
 ['Password complexity, expiry, history','Enforced by the portal','Not applicable — no portal password. Set by the bank’s directory.'],
 ['Failed sign-in lockout','Enforced by the portal','Not applicable — handled by the bank’s identity provider'],
 ['Dormant account disable','Enforced by the portal','Not applicable — status follows the directory'],
 ['Multi-factor authentication','One-time code by email','The bank’s identity provider, if configured there'],
 ['Session timeout','Enforced by the portal','Enforced by the portal — same rules'],
 ['Roles and permissions','Enforced by the portal','Enforced by the portal — role from the directory, permissions in the portal'],
],[2.0,2.0,2.27])

# ---------- 9 ----------
H1('9. Roles and responsibilities')
table(doc,['Activity','Bank directory administrator','Bank Super Admin','Bank Checker','Appro'],[
 ['Register the portal with the identity provider, including the Redirect URI','Does','—','—','Generates the Redirect URI'],
 ['Enter and maintain Tenant ID, Client ID, client secret','Provides values','Submits','Approves','—'],
 ['Switch single sign-on On or Off','—','Submits','Approves','—'],
 ['Set up the directory sync connection','—','—','—','Does, at onboarding'],
 ['Create and edit portal roles','—','Does','—','—'],
 ['Assign staff to portal roles','Does','—','—','—'],
 ['Assign entitlements to directory accounts','—','Does','—','—'],
 ['Create portal accounts','—','Does, through Add User','—','—'],
 ['Disable and remove leavers','Does','—','—','—'],
 ['Multi-factor authentication for single sign-on','Does, in the identity provider','—','—','—'],
],[2.05,1.15,1.05,0.92,1.1],size=9)

# ---------- 10 ----------
H1('10. Before you switch on single sign-on')
_j=1
for t in (
 '**Compliance acceptance.** The bank’s compliance team accepts that a permanently removed directory account takes its audit trail entries with it (section 7.5).',
 '**Redirect URI registered.** The bank’s IT team registers the Redirect URI shown on Sign-in Settings with the identity provider.',
 '**Connection approved.** Tenant ID, Client ID and client secret are entered by a Maker and approved by a Checker.',
 '**Directory sync in place.** Appro has completed the directory sync connection for the bank.',
 '**Roles and people ready.** Portal roles are published, staff are assigned to them in the directory, and entitlements are assigned in the portal.',
 '**Administrators on portal accounts.** Keep the bank’s Super Admin and Checker as portal accounts. Portal accounts are unaffected by the single sign-on switch, so administration stays possible if single sign-on is switched off or the identity provider is unavailable.',
 '**Staff told.** Directory staff use Login with SSO. They have no portal password, and Forgot password does not apply to them.'):
    NUM(_j,t); _j+=1

# ---------- 11 ----------
H1('11. Planned enhancements')
P('The following are agreed in scope for a later release and are **not yet available**. Timing will be confirmed separately.')
table(doc,['Enhancement','What changes'],[
 ['One email, one sign-in method','A portal account whose email appears in the bank’s directory converts to single sign-on at its first successful single sign-on. The portal password is removed; roles, entitlements and history are kept.'],
 ['Break-glass accounts','The bank’s Super Admin and Checker accounts created at onboarding always keep password sign-in, even if the directory holds the same email — so the bank can never be locked out of the portal.'],
 ['Sign-in method on screen','User Management shows each account’s sign-in method and portal password status, in the list, on User Details and in the export.'],
 ['Add User checks','Add User refuses an email that already signs in with single sign-on, or that exists in the bank’s directory.'],
],[1.9,4.37])

# ---------- Appendix A ----------
H1('Appendix A. Messages',newpage=True)
P('Sign-in messages appear in line under the field, with the field outlined in red. No pop-ups.',keep=True)
H2('Password route')
table(doc,['Situation','Message'],[
 ['Wrong password, or email unknown','“Your Email or Password is incorrect!”'],
 ['Password expired or account locked','“Your password has expired. Reset it using “Forgot password?” to continue.”'],
 ['Invitation sent, password never set','“No password has been set yet. Check your email for the invitation link.”'],
 ['Account inactive','“Username is inactive. Please contact the Administrator!”'],
 ['Directory account, single sign-on On','“This account now signs in with single sign-on. Select “Login with SSO” to continue.”'],
 ['Directory account, single sign-on Off','“Single sign-on is currently switched off for your organisation. Please contact your administrator.”'],
 ['Wrong one-time code','“The OTP verification code is not correct, please try again!”'],
 ['Expired one-time code','“The OTP verification code is expired, please try again!”'],
 ['More than 5 wrong codes in a day','“You have entered the wrong OTP Verification Code more than 5 times in a row of a day, please try again later {countdown}!”'],
 ['Forgot password, any input','“If this username exists, a reset email has been sent.”'],
 ['Manual logout','“Are you sure you want to Logout?”'],
],[2.2,4.07])
H2('Single sign-on route')
table(doc,['Situation','Message'],[
 ['Email not registered as a directory account','“User is not registered. Contact your bank’s directory administrator.”'],
 ['Sign-in returns while single sign-on is Off','“Single sign-on is currently switched off for your organisation. Please contact your administrator.”'],
],[2.2,4.07])
H2('Administration')
table(doc,['Situation','Message'],[
 ['Sign-in Settings request submitted','“Your request for updated information is created successfully!”'],
 ['Role published','“Role ‘{roleName}’ published to directory successfully.”'],
 ['Role publish failed','“Could not publish role ‘{roleName}’ to the directory. Please try again or contact support.”'],
 ['Service check failed after publishing','“Service verification failed. Directory users may not receive this role until resolved.”'],
 ['Delete a role that has users','“Cannot delete role ‘{roleName}’ — {N} users assigned. Unassign all users first.”'],
 ['Entitlements saved','“User entitlements updated successfully.”'],
],[2.2,4.07])

# ---------- Appendix B ----------
H1('Appendix B. Screenshot index')
table(doc,['#','Screen','Section'],[[str(n),t,s] for n,t,s in SHOTS],[0.5,4.6,1.17])

p=doc.add_paragraph(); spacing(p,24,4); r=p.add_run('End of document'); font(r,11,True,NAVY)
p=doc.add_paragraph(); spacing(p,0,2); r=p.add_run('Prepared by Appro Product  |  Appro Onboarding Solutions FZ-LLC'); font(r,10,color=GRAY)
p=doc.add_paragraph(); r=p.add_run('28/10/2026'); font(r,10,color=GRAY)

# list styles font
for sn in ('List Bullet','List Number'):
    s=doc.styles[sn]; s.font.name='Lato'; s.font.size=Pt(11); s.font.color.rgb=NAVY
doc.save(OUT); print('saved',OUT,'screens',len(SHOTS))
