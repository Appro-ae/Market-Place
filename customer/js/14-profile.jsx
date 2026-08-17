// Appro Customer (Tenant) Portal — My Profile / Account (personal, signed-in user).
// Greenfield screen introduced with GAS-6xx (Account Profile). Unlike Settings (which is
// ORG-level: legal entity, contacts, webhooks), this screen is the PERSONAL account of the
// signed-in user, bound to the /me CurrentUser contract (CustomerPortal.yaml → CurrentUser:
// userId, customerId, tenantId, role, email, fullName, permissions[], jurisdiction, kycState).
//
// It is the design answer to two defects:
//   • GAS-135 — Account Profile name shows wrongly  (the name was a hard-coded constant,
//     not bound to the signed-in identity).
//   • GAS-218 — GET /me returns null email/fullName/permissions (contract violation). The
//     screen renders every contract field blank-safe: a missing field shows "—/Not provided",
//     never a broken blank, and NEVER a fabricated value (mirrors the dashboard AC8 rule).
const { useState: useProfState } = React;

/* ---------------- Current-user resolver (the prototype's first real identity) ----------------
   Auth used to be a bare boolean flag and the topbar name was a hard-coded string. We now
   capture the login email (Root stores portal.userEmail) and resolve the signed-in person by
   matching it against the tenant user seed (TUR_USERS0) to obtain fullName, role, dept, env,
   status. Contract-shaped fields (org, tenant, jurisdiction, kycState) are attached. If the
   email is unknown we fall back to the demo Admin; the null-field case is previewable so the
   blank-safe rendering (GAS-218) can be demonstrated. */
const PROF_ORG = { org: 'Nuqud Pay', orgId: 'org_mb_8f2a', tenantId: 'TEN-1004', jurisdiction: 'United Arab Emirates' };
const PROF_KYC = { incomplete: 'Not started', review: 'In review', verified: 'Verified' };
function profInitials(name) {
  if (!name) return '—';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '—';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}
function getCurrentUser() {
  // GAS-218 preview: ?me=null renders the contract-violation state (all identity fields null).
  let nullPreview = false;
  try { nullPreview = new URLSearchParams(window.location.search).get('me') === 'null'; } catch (e) {}
  const email = (() => { try { return localStorage.getItem('portal.userEmail') || 'amira@nuqud.ae'; } catch (e) { return 'amira@nuqud.ae'; } })();
  const seed = (typeof TUR_USERS0 !== 'undefined' ? TUR_USERS0 : []);
  const row = seed.find(u => u.email === email) || seed[0] || { name: 'Amira Saleh', email: 'amira@nuqud.ae', roles: ['Admin'], env: ['Sandbox', 'Production'], dept: 'Engineering', status: true };
  const verif = (() => { try { return localStorage.getItem('portal.verif') || 'verified'; } catch (e) { return 'verified'; } })();
  const role = (row.roles && row.roles[0]) || 'Viewer';
  const permissions = (typeof tur_build === 'function') ? Object.entries(tur_build(role)).filter(([, v]) => v).map(([k]) => k) : [];
  const base = {
    userId: '15756019-63d9-4734-955b-5c900c4d5341',
    customerId: '15756019-63d9-4734-955b-5c900c4d5341',
    tenantId: PROF_ORG.tenantId,
    role,
    email: row.email,
    fullName: row.name,
    permissions,
    jurisdiction: PROF_ORG.jurisdiction,
    kycState: PROF_KYC[verif] || 'Verified',
    // display-only extras (not part of the /me contract)
    org: PROF_ORG.org, orgId: PROF_ORG.orgId,
    dept: row.dept, env: row.env || [], status: row.status !== false, activated: row.activated !== false,
  };
  if (nullPreview) return { ...base, email: null, fullName: null, permissions: null, jurisdiction: null, dept: null, __null: true };
  return base;
}
window.getCurrentUser = getCurrentUser;

/* ---------------- atoms ---------------- */
function Avatar({ name, size = 40, seedNull }) {
  const initials = seedNull ? '?' : profInitials(name);
  return <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.36, fontFamily: 'var(--font-ui)', color: '#fff', background: seedNull ? 'var(--ink-300)' : 'linear-gradient(135deg,#3B7EF6,#00AEEF)' }}>{initials}</div>;
}
// Blank-safe field: renders "—  Not provided" (muted) when the contract value is null/blank.
function PField({ label, value, mono }) {
  const blank = value === null || value === undefined || value === '';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 0', borderBottom: '1px solid var(--ink-100)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
      {blank
        ? <div style={{ fontSize: 13.5, color: 'var(--ink-400)', fontStyle: 'italic' }}>—&nbsp;&nbsp;Not provided</div>
        : <div style={{ fontSize: 13.5, color: 'var(--ink-800)', fontWeight: 500, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-ui)', wordBreak: 'break-word' }}>{value}</div>}
    </div>
  );
}
function ProfCardHead({ icon, title, sub, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 6 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--appro-blue-50)', color: 'var(--appro-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={icon} size={17} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------------- Change-password modal (policy checklist; OTP flow per CM9 is the full design) ---------------- */
const PW_RULES = [
  { t: 'At least 12 characters', ok: p => p.length >= 12 },
  { t: 'One uppercase letter (A–Z)', ok: p => /[A-Z]/.test(p) },
  { t: 'One lowercase letter (a–z)', ok: p => /[a-z]/.test(p) },
  { t: 'One number (0–9)', ok: p => /[0-9]/.test(p) },
  { t: 'One symbol (! @ # $ % ^ &)', ok: p => /[!@#$%^&]/.test(p) },
];
function ChangePasswordModal({ onClose }) {
  const [cur, setCur] = useProfState('');
  const [nw, setNw] = useProfState('');
  const [cf, setCf] = useProfState('');
  const [show, setShow] = useProfState(false);
  const allOk = PW_RULES.every(r => r.ok(nw)) && nw === cf && cur.length > 0;
  const field = (val, set, ph) => (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input type={show ? 'text' : 'password'} value={val} onChange={e => set(e.target.value)} placeholder={ph}
        style={{ width: '100%', boxSizing: 'border-box', padding: '11px 40px 11px 13px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)' }} />
      <button onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)' }}><Icon name={show ? 'eyeoff' : 'eye'} size={16} /></button>
    </div>
  );
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,25,49,.55)', zIndex: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 16, width: 460, maxWidth: '94vw', padding: 26, fontFamily: 'var(--font-ui)', boxShadow: '0 24px 60px rgba(12,25,49,.28)' }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#0C1931', marginBottom: 4, fontFamily: 'var(--font-display)' }}>Change password</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginBottom: 18 }}>My Profile › Change password</div>
        {field(cur, setCur, 'Current password')}
        {field(nw, setNw, 'New password')}
        {field(cf, setCf, 'Confirm new password')}
        <div style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-100)', borderRadius: 10, padding: '10px 12px', marginBottom: 18 }}>
          {PW_RULES.map((r, i) => {
            const ok = r.ok(nw);
            return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: nw ? (ok ? '#00875A' : '#DC2626') : 'var(--ink-500)', padding: '2px 0' }}>
              <Icon name={ok ? 'check' : 'x'} size={13} stroke={3} />{r.t}</div>;
          })}
          {cf && nw !== cf && <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#DC2626', padding: '2px 0' }}><Icon name="x" size={13} stroke={3} />Passwords do not match</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={() => { if (!allOk) return; onClose(); window.toast && window.toast.success('Password updated', 'For your security you may be asked to sign in again.'); }} style={allOk ? {} : { opacity: .5, pointerEvents: 'none' }}>Save changes</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- The screen ---------------- */
function AccountProfile() {
  const u = getCurrentUser();
  const [edit, setEdit] = useProfState(false);
  const [pwOpen, setPwOpen] = useProfState(false);
  const [name, setName] = useProfState(u.fullName || '');
  const [dept, setDept] = useProfState(u.dept || '');
  const [lang, setLang] = useProfState('English');
  const [openGroup, setOpenGroup] = useProfState('Build');

  const roleColor = (typeof TUR_ROLE_DEFS0 !== 'undefined' && (TUR_ROLE_DEFS0.find(r => r.name === u.role) || {}).color) || '#3B7EF6';
  const depts = (typeof TUR_DEPTS !== 'undefined') ? TUR_DEPTS : ['Engineering', 'Product', 'Finance', 'Operations', 'Security'];
  const grantedSet = new Set(u.permissions || []);
  const groups = (typeof TUR_GROUPS !== 'undefined') ? TUR_GROUPS : [];

  const saveProfile = () => { setEdit(false); window.toast && window.toast.success('Profile updated', 'Your account details were saved.'); };

  return (
    <div style={{ padding: 28, background: 'var(--ink-100)', minHeight: '100%' }}>
      {u.__null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', borderRadius: 10, padding: '11px 14px', marginBottom: 18, fontSize: 12.5, fontFamily: 'var(--font-ui)' }}>
          <Icon name="info" size={16} /><span><b>Contract-violation preview (GAS-218).</b> <code>GET /me</code> returned null identity fields — the screen degrades to a blank-safe state instead of showing wrong or fabricated values.</span>
        </div>
      )}

      {/* Identity header */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(12,25,49,.06)', padding: 22, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <Avatar name={u.fullName} size={64} seedNull={u.__null} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0C1931', fontFamily: 'var(--font-display)' }}>{u.fullName || <span style={{ color: 'var(--ink-400)', fontStyle: 'italic', fontWeight: 500 }}>Name not provided</span>}</div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: roleColor, padding: '3px 10px', borderRadius: 7 }}>{u.role}</span>
            <TURUserStatus on={u.status} />
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-600)', marginTop: 4 }}>{u.email || <span style={{ color: 'var(--ink-400)', fontStyle: 'italic' }}>Email not provided</span>} · {u.org}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn variant="secondary" icon="lock" onClick={() => setPwOpen(true)}>Change password</Btn>
          {!edit && <Btn variant="primary" onClick={() => setEdit(true)}>Edit profile</Btn>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, alignItems: 'start' }}>
        {/* Basic details (personal, partly editable) */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(12,25,49,.06)', padding: 22 }}>
          <ProfCardHead icon="users" title="Basic details" sub="Your personal account information"
            right={edit ? null : null} />
          {!edit ? (
            <div>
              <PField label="Full name" value={u.fullName} />
              <PField label="Email address" value={u.email} />
              <PField label="Department" value={u.dept} />
              <PField label="Preferred language" value={lang} />
              <PField label="Environment scope" value={(u.env && u.env.length) ? u.env.join(' + ') : null} />
            </div>
          ) : (
            <div style={{ marginTop: 6 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', margin: '10px 0 5px' }}>Full name</label>
              <input value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)' }} />
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', margin: '14px 0 5px' }}>Email address</label>
              <input value={u.email || ''} disabled style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)', background: 'var(--ink-50)', color: 'var(--ink-500)' }} />
              <div style={{ fontSize: 11, color: 'var(--ink-400)', marginTop: 4 }}>Email is managed by your administrator and cannot be changed here.</div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', margin: '14px 0 5px' }}>Department</label>
              <select value={dept} onChange={e => setDept(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff' }}>
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em', margin: '14px 0 5px' }}>Preferred language</label>
              <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--ink-200)', fontSize: 14, fontFamily: 'var(--font-ui)', background: '#fff' }}>
                {['English', 'العربية (Arabic)'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
                <Btn variant="secondary" onClick={() => { setEdit(false); setName(u.fullName || ''); setDept(u.dept || ''); }}>Cancel</Btn>
                <Btn variant="primary" icon="check" onClick={saveProfile}>Save</Btn>
              </div>
            </div>
          )}
        </div>

        {/* Organisation & compliance (read-only, from /me) */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(12,25,49,.06)', padding: 22 }}>
          <ProfCardHead icon="globe" title="Organisation & compliance" sub="Read-only — sourced from your session" />
          <PField label="Organisation" value={u.org} />
          <PField label="Organisation ID" value={u.orgId} mono />
          <PField label="Tenant ID" value={u.tenantId} mono />
          <PField label="Jurisdiction" value={u.jurisdiction} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '.04em' }}>KYC / KYB state</div>
            <StatusPill kind={u.kycState === 'Verified' ? 'active' : u.kycState === 'In review' ? 'review' : 'pending'}>{u.kycState}</StatusPill>
          </div>
        </div>
      </div>

      {/* Roles & permissions (read-only, reflects /me permissions) */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 3px rgba(12,25,49,.06)', padding: 22, marginTop: 18 }}>
        <ProfCardHead icon="lock" title="Role & permissions"
          sub={u.permissions === null ? 'Permissions unavailable — see the banner above' : 'What you can do in this workspace — read-only. Set by your administrator.'}
          right={<span style={{ fontSize: 12, fontWeight: 700, color: '#fff', background: roleColor, padding: '4px 11px', borderRadius: 7 }}>{u.role}</span>} />
        {u.permissions === null ? (
          <div style={{ fontSize: 13, color: 'var(--ink-400)', fontStyle: 'italic', padding: '14px 0' }}>—&nbsp;&nbsp;Not provided (the <code>permissions</code> array was null; permission-gated widgets fall back to safe defaults).</div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {groups.map(g => {
              const cells = (typeof TUR_GC !== 'undefined' && TUR_GC[g.g]) ? TUR_GC[g.g] : [];
              const granted = cells.filter(c => grantedSet.has(c.key)).length;
              const isOpen = openGroup === g.g;
              return (
                <div key={g.g} style={{ border: '1px solid var(--ink-100)', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                  <button onClick={() => setOpenGroup(isOpen ? '' : g.g)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: isOpen ? 'var(--ink-50)' : '#fff', border: 0, cursor: 'pointer', fontFamily: 'var(--font-ui)', textAlign: 'left' }}>
                    <Icon name={g.icon} size={16} />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: '#0C1931' }}>{g.g}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{granted} of {cells.length}</span>
                    <Icon name="chevron" size={14} stroke={2.5} />
                  </button>
                  {isOpen && (
                    <div style={{ padding: '4px 14px 12px' }}>
                      {g.subs.map(sb => (
                        <div key={sb.s} style={{ padding: '8px 0', borderTop: '1px solid var(--ink-100)' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-700)', marginBottom: 6 }}>{sb.s}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {sb.perms.map(p => {
                              const on = grantedSet.has(g.g + '::' + sb.s + '::' + p);
                              return <span key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: on ? '#0C1931' : 'var(--ink-400)', background: on ? '#E6F9F2' : 'var(--ink-50)', border: '1px solid ' + (on ? '#B6ECD8' : 'var(--ink-100)'), padding: '4px 9px', borderRadius: 7 }}>
                                <Icon name={on ? 'check' : 'x'} size={12} stroke={3} />{p}</span>;
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
}
window.AccountProfile = AccountProfile;
