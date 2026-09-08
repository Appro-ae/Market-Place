#!/usr/bin/env python3
"""Build wire.html: the AMP-2548 wireframes updated to the approved v7 story (Sale Agent Code),
one <div class="shot"> per screen so Playwright can screenshot each block."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
pack = open(os.path.join(HERE, "pack.html"), encoding="utf-8").read()
style = pack[pack.index("<style"):pack.index("</style>") + 8]

SIDE_USERS = """
      <div class="pside">
        <div class="plogo"><span class="pdot"></span> Bank Portal</div>
        <ul class="pmenu">
          <li><span class="mi"></span>Channel Management</li><li class="chev"><span class="mi"></span>Communication Setup</li><li class="chev"><span class="mi"></span>Product Setup</li>
          <li><span class="mi"></span>Conditional Offer</li><li class="chev"><span class="mi"></span>Master List</li><li class="chev"><span class="mi"></span>Credit Decision</li>
          <li class="chev"><span class="mi"></span>Limit Assignment</li><li><span class="mi"></span>Collateral Management</li><li class="chev"><span class="mi"></span>Enquiry</li>
          <li class="chev"><span class="mi"></span>Manual Queue</li><li class="open"><span class="mi"></span><b>Users Management</b></li><li class="active-red">User Management</li>
          <li class="chev"><span class="mi"></span>Assignment Management</li>
        </ul>
      </div>"""

SIDE_ENQ = """
      <div class="pside">
        <div class="plogo"><span class="pdot"></span> Bank Portal</div>
        <ul class="pmenu">
          <li><span class="mi"></span>Channel Management</li><li class="chev"><span class="mi"></span>Communication Setup</li><li class="chev"><span class="mi"></span>Product Setup</li>
          <li><span class="mi"></span>Conditional Offer</li><li class="chev"><span class="mi"></span>Master List</li><li class="chev"><span class="mi"></span>Credit Decision</li>
          <li class="chev"><span class="mi"></span>Limit Assignment</li><li><span class="mi"></span>Collateral Management</li><li class="open"><span class="mi"></span><b>Enquiry</b></li><li class="active-red">Application Enquiry</li>
          <li class="chev"><span class="mi"></span>Manual Queue</li><li class="chev"><span class="mi"></span>Users Management</li><li class="chev"><span class="mi"></span>Assignment Management</li>
        </ul>
      </div>"""

W1 = f"""
<div id="w1" class="shot" style="width:1180px;">
    <div class="frame">{SIDE_USERS}
      <div class="pmain">
        <div class="ptitle">Edit User</div>
        <div class="pcrumb">Users &nbsp;›&nbsp; User Management &nbsp;›&nbsp; <b>Edit User</b></div>
        <div class="pcard">
          <div class="dgrid two">
            <div class="dfield"><div class="dl">First Name</div><div class="winput">Alice</div></div>
            <div class="dfield"><div class="dl">Last Name</div><div class="winput">Rahman</div></div>
            <div class="dfield"><div class="dl">Email ID</div><div class="winput">alice.rahman@bank.com</div></div>
            <div class="dfield"><div class="dl">Department</div><div class="winput"><b>Sale</b> &nbsp;<span style="color:#6a6a6a;">— switches on the two fields below</span></div></div>
            <div class="dfield"><div class="dl">Sale Agent Code <span class="chip chip-new">NEW</span></div><div class="winput lock">STF-042 &nbsp;🔒 read-only once approved via Maker/Checker</div><div class="err" style="color:#6a6a6a;">Sales Code / Agent Code / Employee ID · free text 1–24 · unique in the bank (IEM001)</div></div>
            <div class="dfield"><div class="dl">Reporting Manager <span class="chip chip-new">NEW</span></div><div class="winput newf"><b>Jane Smith</b> ✕ &nbsp; <b>John Doe</b> ✕ &nbsp;▾ &nbsp;<span style="color:#6a6a6a;">type to search active Sale users · one or more</span></div><div class="err">IEM002 — a circular reporting chain is blocked at any depth</div></div>
            <div class="dfield"><div class="dl">Role</div><div class="winput">Sales Officer</div></div>
            <div class="dfield"><div class="dl">Status</div><div class="winput">Active</div></div>
          </div>
          <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;"><span class="pbtn">Cancel</span><span class="pbtn red">Save Changes → Maker request</span></div>
          <p class="note">Sale Agent Code and Reporting Manager appear only when Department = Sale. Uniqueness, format (IEM005) and cycle checks run at save and again at Checker approval.</p>
        </div>
      </div>
    </div>
</div>"""

W2 = """
<div id="w2" class="shot" style="width:600px;">
        <div class="frame noside"><div class="pmain">
          <div class="ptitle" style="font-size:14px;">User Details</div>
          <div class="pcard"><div class="dgrid two">
            <div class="dfield"><div class="dl">Full Name</div><div class="dv">Alice Rahman</div></div>
            <div class="dfield"><div class="dl">Department</div><div class="dv">Sale</div></div>
            <div class="dfield newf"><div class="dl">Sale Agent Code</div><div class="dv"><b>STF-042</b> &nbsp;<span style="color:#6a6a6a;">("—" when not assigned)</span></div></div>
            <div class="dfield newf"><div class="dl">Reporting Manager</div><div class="dv"><b>Jane Smith, John Doe</b> &nbsp;<span style="color:#6a6a6a;">("None" when empty)</span></div></div>
          </div></div>
          <p class="note">Read-only. Both fields are shown only for Sale users.</p>
        </div></div>
</div>"""

W3 = """
<div id="w3" class="shot" style="width:640px;">
        <div class="frame noside"><div class="pmain">
          <div class="psearch"><span class="pselect">Search: name · email · <b>Sale Agent Code</b> · <b>RM</b></span><span class="pbtn">Filter ▾</span><span class="pbtn" style="margin-left:auto;">Export</span></div>
          <div class="tbl-wrap"><table class="ptable">
            <thead><tr><th>User Name</th><th>Email</th><th>Department</th><th class="newcol">Sale Agent Code ⇅</th><th class="newcol">Reporting Manager ⇅</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Fatima</td><td>fatima@bank.com</td><td>Sale</td><td class="newcell">STF-001</td><td class="newcell">—</td><td>Active</td></tr>
              <tr><td>Jane Smith</td><td>jane.smith@bank.com</td><td>Sale</td><td class="newcell">STF-010</td><td class="newcell">Fatima</td><td>Active</td></tr>
              <tr><td>Alice Rahman</td><td>alice.rahman@bank.com</td><td>Sale</td><td class="newcell">STF-042</td><td class="newcell">Jane Smith, John Doe</td><td>Active</td></tr>
              <tr><td>Khalid</td><td>khalid@bank.com</td><td>Credit Operations</td><td class="newcell">—</td><td class="newcell">—</td><td>Active</td></tr>
            </tbody></table></div>
          <p class="note">Both columns sortable, in the filter panel, in search scope and in the export. Non-Sale users show "—" and keep full visibility through their existing enquiry permissions.</p>
        </div></div>
</div>"""

W4 = f"""
<div id="w4" class="shot" style="width:1180px;">
    <div class="frame">{SIDE_ENQ}
      <div class="pmain">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
          <div><div class="ptitle">Application Enquiry</div><div class="pcrumb">Enquiry &nbsp;›&nbsp; <b>Application Enquiry</b></div></div>
          <span class="scopepill">Logged in: Jane Smith · Sale manager · own + subtree (Alice Rahman) · 3 of 7 rows</span>
        </div>
        <span class="ptab">Mortgage Loan</span>
        <div class="pcard tabbed">
          <div class="psearch"><span class="pselect">Application ID ▾</span><span class="pinput">Search</span><span class="pbtn" style="margin-left:auto;">Customized Table</span></div>
          <div class="tbl-wrap"><table class="ptable">
            <thead><tr><th>Application ID</th><th>Customer Name</th><th>Application Type</th><th>Relationship Type</th><th>Status</th><th>CIF</th><th>Previous Application Code</th><th>Channel</th><th class="newcol">Sale Staff</th></tr></thead>
            <tbody>
              <tr><td>RAK_APPRO_202600000202</td><td>Customer B</td><td><span class="pchip single">Single</span></td><td>ETB</td><td>In Progress</td><td>–</td><td>–</td><td>RAKBANK</td><td class="newcell">Jane Smith</td></tr>
              <tr><td>RAK_APPRO_202600000203</td><td>Customer C</td><td><span class="pchip single">Single</span></td><td>NTB</td><td>Awaiting Customer Selection</td><td>–</td><td>–</td><td>RAKBANK</td><td class="newcell">Alice Rahman</td></tr>
              <tr><td>RAK_APPRO_202600000204</td><td>Customer D</td><td><span class="pchip joint">Joint(1)</span></td><td>ETB</td><td>Completed</td><td>–</td><td>–</td><td>RAKBANK</td><td class="newcell">Alice Rahman</td></tr>
            </tbody></table></div>
          <p class="note">Sale Staff column ON by default for every user (Customize Table). Sale staff see their own cases, Sale managers their subtree, every other department sees all rows. Untagged applications show "—" and are visible to non-Sale users only.</p>
        </div>
      </div>
    </div>
</div>"""

W5 = """
<div id="w5" class="shot" style="width:600px;">
        <div class="frame noside"><div class="pmain">
          <div class="ptitle" style="font-size:14px;">Application Details</div>
          <div class="pcrumb">Enquiry › Application Enquiry › <b>Application Details</b></div>
          <div class="pcard"><div class="dgrid two">
            <div class="dfield"><div class="dl">Application ID</div><div class="dv">RAK_APPRO_202600000203</div></div>
            <div class="dfield"><div class="dl">Application Status</div><div class="dv">Awaiting Customer Selection</div></div>
            <div class="dfield newf"><div class="dl">Sale Staff (Sale Agent Code)</div><div class="dv"><b>Alice Rahman</b> (STF-042)</div></div>
            <div class="dfield"><div class="dl">Product Type</div><div class="dv">Mortgage Loan</div></div>
          </div></div>
          <div class="pcard" style="margin-top:8px;"><div style="font-size:10px;font-weight:900;margin-bottom:6px;">Audit trail</div>
            <div class="tbl-wrap"><table class="ptable"><thead><tr><th>No</th><th>Step</th><th>Step Details</th><th>Action By</th></tr></thead>
            <tbody><tr><td>1</td><td class="newcell">Assigned to Alice Rahman via UTM</td><td class="newcell">Sale Agent Code STF-042 · source UTM · at submission</td><td>System</td></tr>
            <tr><td>2</td><td>Finalize Income by ECB</td><td>Finalized Income is success</td><td>System</td></tr></tbody></table></div>
          </div>
        </div></div>
</div>"""

W6 = """
<div id="w6" class="shot" style="width:600px;">
        <div class="frame noside"><div class="pmain">
          <div class="ptitle" style="font-size:14px;">Checker Queue › Request #RQ-1042</div>
          <div class="pcrumb">Module: User Management · Type: Update · Status: <b>Pending Review</b> · Updated by: Maker name</div>
          <div class="pcard"><div class="tbl-wrap"><table class="ptable">
            <thead><tr><th>Field</th><th>Old Value</th><th>New Value</th></tr></thead>
            <tbody>
              <tr><td>First Name</td><td>Alice</td><td>Alice</td></tr>
              <tr><td>Department</td><td>Sale</td><td>Sale</td></tr>
              <tr><td class="newcell">Sale Agent Code</td><td class="newcell">—</td><td class="newcell"><b>STF-042</b> (first-time assignment)</td></tr>
              <tr><td class="newcell">Reporting Manager</td><td class="newcell">Jane Smith</td><td class="newcell"><b>Jane Smith, John Doe</b></td></tr>
            </tbody></table></div>
            <div style="margin-top:8px;display:flex;gap:8px;justify-content:flex-end;"><span class="pbtn">Reject</span><span class="pbtn dark">Approve → re-validates IEM001 / IEM002</span></div>
          </div>
        </div></div>
</div>"""

W7 = """
<div id="w7" class="shot" style="width:460px;">
        <div class="modal"><h4>Referral code <span style="font-weight:400;color:#6a6a6a;">(optional)</span></h4>
          <p style="margin-top:4px;">Enter the code given by your sales representative, or continue without one.</p>
          <div class="dfield" style="margin-top:10px;"><div class="dl">Sale Agent Code</div><div class="winput newf">STF-042 &nbsp;<b>✓ Code applied</b></div></div>
          <p style="margin-top:6px;color:#6a6a6a;font-size:10.5px;">Unknown code: "Code not recognised — check with your salesperson or continue without".</p>
          <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;"><span class="pbtn">Continue without</span><span class="pbtn dark">Apply code</span></div>
        </div>
</div>"""

W8 = """
<div id="w8" class="shot" style="width:460px;">
        <div class="modal"><h4>Cannot move Jane Smith out of Sale</h4>
          <p><b>IEM003</b> — This user is the Reporting Manager for <b>2</b> active user(s). Reassign their reports before changing the department.</p>
          <p style="margin-top:6px;color:#6a6a6a;">Deactivating a Sale user with tagged cases is allowed: the cases keep their tag and stay visible to the Reporting Manager(s) and to non-Sale users.</p>
          <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end;"><span class="pbtn">Close</span><span class="pbtn dark">Go to reports</span></div>
        </div>
</div>"""

W9 = """
<div id="w9" class="shot" style="width:460px;">
        <div class="pcard" style="font-size:10.5px;color:var(--p-ink);line-height:1.6;">
          <b>Subject:</b> [Bank Portal] Unmatched Sale Agent Code for RAK_APPRO_202600000209<br>
          <b>To:</b> Queue / Ops admin<br><br>
          Dear Admin, the sale_agent_code <b>"stf-0042"</b> received on 07/09/2026 10:41:12 does not match any active Sale Agent Code. The application goes to sales round-robin where a pool is configured; otherwise it stays untagged and visible to non-Sale users. Please investigate.<br>
          <span class="note">The same ET51 pattern fires when the round-robin pool is empty for the channel / product.</span>
        </div>
</div>"""

extra = """
<style>
  body{background:#ffffff;padding:20px;}
  .shot{background:#ffffff;padding:8px;margin:0 0 24px 0;}
  .shot .frame{margin-bottom:0;}
  .modal{box-shadow:none;}
</style>"""

html = "<!doctype html><html><head><meta charset='utf-8'>" + style + extra + "</head><body>" + \
    W1 + W2 + W3 + W4 + W5 + W6 + W7 + W8 + W9 + "</body></html>"
open(os.path.join(HERE, "wire.html"), "w", encoding="utf-8").write(html)
print("wire.html", len(html), "chars; Staff ID mentions:", html.count("Staff ID"))
