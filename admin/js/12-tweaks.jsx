// Admin Console — Tweaks panel. Three expressive controls that reshape the whole console's feel.
// Applies via CSS-variable + scoped-stylesheet overrides so it cascades across the inline-styled UI.
(function () {
  const { useState, useEffect } = React;

  const ACCENTS = {
    'appro':   { label: 'Appro Blue', dot: '#3B7EF6', v: { b:'#3B7EF6', b600:'#2563EB', b700:'#1D4ED8', b400:'#6196FA', b300:'#C4D8FC', b100:'#E6F1F8', b50:'#F6FCFF' } },
    'indigo':  { label: 'Indigo',     dot: '#6366F1', v: { b:'#6366F1', b600:'#4F46E5', b700:'#4338CA', b400:'#818CF8', b300:'#C7CBFF', b100:'#EEF0FF', b50:'#F7F8FF' } },
    'emerald': { label: 'Emerald',    dot: '#0EA371', v: { b:'#0EA371', b600:'#059669', b700:'#047857', b400:'#34D399', b300:'#A7E8CE', b100:'#E6F7F0', b50:'#F4FCF9' } },
    'copper':  { label: 'Copper',     dot: '#D97706', v: { b:'#D97706', b600:'#B45309', b700:'#92400E', b400:'#F59E0B', b300:'#FBD9A0', b100:'#FCF1DE', b50:'#FEFAF2' } },
  };

  const CHROMES = {
    'midnight': { label: 'Midnight', swatch: '#0C1931', bg: '#0C1931', line: 'rgba(255,255,255,.08)' },
    'graphite': { label: 'Graphite', swatch: '#181A20', bg: '#15171D', line: 'rgba(255,255,255,.07)' },
    'oceanic':  { label: 'Oceanic',  swatch: '#06283D', bg: 'linear-gradient(185deg,#0A3049 0%,#061F30 100%)', line: 'rgba(140,200,235,.12)' },
    'porcelain':{ label: 'Porcelain',swatch: '#F4F6FA', bg: '#F5F7FB', line: 'var(--ink-200)', light: true },
  };

  const TYPES = {
    'corporate': { label: 'Corporate', display: "'Montserrat','Gotham',sans-serif", ui: "'Lato','Inter',sans-serif", note: 'Trusted · institutional' },
    'editorial': { label: 'Editorial', display: "'Playfair Display',Georgia,serif", ui: "'Inter',system-ui,sans-serif", note: 'Refined · high-contrast' },
    'modern':    { label: 'Modern',    display: "'Space Grotesk',sans-serif", ui: "'Inter',system-ui,sans-serif", note: 'Technical · geometric' },
  };

  const DEFAULTS = { accent: 'appro', chrome: 'midnight', type: 'corporate' };
  const LS_KEY = 'admin.tweaks';
  const load = () => { try { return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(LS_KEY) || '{}')) }; } catch (e) { return { ...DEFAULTS }; } };

  function ensureFonts() {
    if (document.getElementById('tw-fonts')) return;
    const l = document.createElement('link');
    l.id = 'tw-fonts'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }

  function apply(t) {
    ensureFonts();
    const root = document.documentElement.style;
    const a = ACCENTS[t.accent] || ACCENTS.appro;
    root.setProperty('--appro-blue', a.v.b);
    root.setProperty('--appro-blue-600', a.v.b600);
    root.setProperty('--appro-blue-700', a.v.b700);
    root.setProperty('--appro-blue-400', a.v.b400);
    root.setProperty('--appro-blue-300', a.v.b300);
    root.setProperty('--appro-blue-100', a.v.b100);
    root.setProperty('--appro-blue-50', a.v.b50);

    const ty = TYPES[t.type] || TYPES.corporate;
    root.setProperty('--font-display', ty.display);
    root.setProperty('--font-ui', ty.ui);
    root.setProperty('--font-body', ty.ui);

    // Chrome (sidebar shell) — inline bg is hardcoded, so override with a scoped stylesheet.
    const ch = CHROMES[t.chrome] || CHROMES.midnight;
    let s = document.getElementById('tw-chrome');
    if (!s) { s = document.createElement('style'); s.id = 'tw-chrome'; document.head.appendChild(s); }
    const darkText = ch.light ? '#0C1931' : '#fff';
    const subText = ch.light ? 'rgba(12,25,49,.55)' : 'rgba(255,255,255,.55)';
    s.textContent = `
      .layout > aside { background: ${ch.bg} !important; border-right: 1px solid ${ch.line}; color: ${darkText} !important; }
      .layout > aside img { filter: ${ch.light ? 'invert(1) hue-rotate(180deg) saturate(1.4)' : 'none'}; }
      .layout > aside a, .layout > aside button { color: ${ch.light ? 'rgba(12,25,49,.7)' : 'rgba(255,255,255,.74)'}; }
    `;
    // accent shadow on the active nav item follows accent
    root.setProperty('--tw-accent-shadow', `0 8px 20px ${hexA(a.v.b, .32)}`);
  }
  function hexA(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }

  // Apply persisted tweaks immediately (before panel mounts) so the feel is stable on load.
  apply(load());

  function Segment({ label, note, options, value, onChange, renderSwatch }) {
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-800)', marginBottom: 2, fontFamily: 'var(--font-ui)' }}>{label}</div>
        {note && <div style={{ fontSize: 11, color: 'var(--ink-500)', marginBottom: 9 }}>{note}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {options.map(([k, o]) => {
            const on = value === k;
            return (
              <button key={k} onClick={() => onChange(k)} style={{
                display: 'flex', alignItems: 'center', gap: 9, padding: '10px 11px', cursor: 'pointer',
                border: `1.5px solid ${on ? 'var(--appro-blue)' : 'var(--ink-200)'}`,
                background: on ? 'var(--appro-blue-50)' : '#fff', borderRadius: 10, textAlign: 'left',
                fontFamily: 'var(--font-ui)',
              }}>
                {renderSwatch(o)}
                <span style={{ fontSize: 12.5, fontWeight: on ? 700 : 500, color: 'var(--ink-800)', lineHeight: 1.15 }}>{o.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function AdminTweaks() {
    const [open, setOpen] = useState(false);
    const [avail, setAvail] = useState(false);
    const [t, setT] = useState(load);

    useEffect(() => { apply(t); localStorage.setItem(LS_KEY, JSON.stringify(t)); }, [t]);
    useEffect(() => {
      const onMsg = (e) => {
        const d = e.data || {};
        if (d.type === '__activate_edit_mode') { setOpen(true); setAvail(true); }
        if (d.type === '__deactivate_edit_mode') setOpen(false);
      };
      window.addEventListener('message', onMsg);
      try { window.parent && window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}
      return () => window.removeEventListener('message', onMsg);
    }, []);

    // Floating opener so the panel is reachable even without the host toolbar.
    const opener = (
      <button onClick={() => setOpen(o => !o)} title="Tweaks" style={{
        position: 'fixed', right: 20, bottom: 20, zIndex: 4000, width: 48, height: 48, borderRadius: '50%',
        background: 'var(--appro-blue)', color: '#fff', border: 0, cursor: 'pointer',
        boxShadow: '0 10px 28px rgba(12,25,49,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Icon name="settings" size={22}/></button>
    );

    if (!open) return opener;

    const set = (k) => (v) => setT(s => ({ ...s, [k]: v }));
    return (
      <>
        {opener}
        <div style={{ position: 'fixed', right: 20, bottom: 80, zIndex: 4000, width: 320, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
          background: '#fff', borderRadius: 16, border: '1px solid var(--ink-200)', boxShadow: '0 24px 60px rgba(12,25,49,.28)',
          fontFamily: 'var(--font-ui)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--ink-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1931', fontFamily: 'var(--font-display)' }}>Tweaks</div>
              <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>Reshape the console's feel</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: 'var(--ink-100)', border: 0, width: 28, height: 28, borderRadius: 8, cursor: 'pointer', color: 'var(--ink-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="x" size={15}/></button>
          </div>
          <div style={{ padding: 18 }}>
            <Segment label="Accent identity" note="Recolors actions, links & active nav across the console."
              options={Object.entries(ACCENTS)} value={t.accent} onChange={set('accent')}
              renderSwatch={(o) => <span style={{ width: 18, height: 18, borderRadius: 6, background: o.dot, flexShrink: 0 }}/>} />
            <Segment label="Sidebar mood" note="Sets the tone of the navigation shell."
              options={Object.entries(CHROMES)} value={t.chrome} onChange={set('chrome')}
              renderSwatch={(o) => <span style={{ width: 18, height: 18, borderRadius: 6, background: o.swatch, border: '1px solid rgba(0,0,0,.1)', flexShrink: 0 }}/>} />
            <Segment label="Type personality" note="Swaps the display + UI typefaces."
              options={Object.entries(TYPES)} value={t.type} onChange={set('type')}
              renderSwatch={(o) => <span style={{ width: 18, height: 18, borderRadius: 6, background: 'var(--ink-100)', color: 'var(--ink-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, fontFamily: o.display }}>Aa</span>} />
            <button onClick={() => setT({ ...DEFAULTS })} style={{ width: '100%', marginTop: 4, background: 'transparent', border: '1px solid var(--ink-200)', borderRadius: 9, padding: '9px', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-600)', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>Reset to defaults</button>
          </div>
        </div>
      </>
    );
  }

  window.AdminTweaks = AdminTweaks;
})();
