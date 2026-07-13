// Global toast + inline-error helpers for the Appro Customer Portal
// Usage anywhere: window.toast.success('Saved'), window.toast.error('Failed', 'detail'), window.toast.info(...), window.toast.warning(...)

const ToastBus = (function () {
  let listeners = [];
  let queue = [];
  return {
    subscribe(fn) { listeners.push(fn); fn(queue); return () => { listeners = listeners.filter(l => l !== fn); }; },
    push(t) {
      const toast = { id: Date.now() + '-' + Math.random().toString(16).slice(2, 6), kind: 'info', duration: 4200, ...t };
      queue = [...queue, toast];
      listeners.forEach(l => l(queue));
      return toast.id;
    },
    dismiss(id) { queue = queue.filter(t => t.id !== id); listeners.forEach(l => l(queue)); },
  };
})();

// Public API
window.toast = {
  show: (kind, title, detail, opts) => ToastBus.push({ kind, title, detail, ...(opts || {}) }),
  success: (title, detail, opts) => ToastBus.push({ kind: 'success', title, detail, ...(opts || {}) }),
  error:   (title, detail, opts) => ToastBus.push({ kind: 'error', title, detail, duration: 6000, ...(opts || {}) }),
  warning: (title, detail, opts) => ToastBus.push({ kind: 'warning', title, detail, ...(opts || {}) }),
  info:    (title, detail, opts) => ToastBus.push({ kind: 'info', title, detail, ...(opts || {}) }),
  dismiss: (id) => ToastBus.dismiss(id),
};

function ToastItem({ t, onClose }) {
  const { useEffect, useState } = React;
  const [leaving, setLeaving] = useState(false);
  const close = () => { setLeaving(true); setTimeout(onClose, 220); };
  useEffect(() => {
    if (!t.duration) return;
    const timer = setTimeout(close, t.duration);
    return () => clearTimeout(timer);
  }, []);

  const palette = {
    success: { bg: '#fff', bar: 'var(--success)', tint: 'var(--success-tint)', icon: 'check', ic: 'var(--success)' },
    error:   { bg: '#fff', bar: 'var(--danger)',  tint: 'var(--danger-tint)',  icon: 'x',     ic: 'var(--danger)' },
    warning: { bg: '#fff', bar: 'var(--warning)', tint: 'var(--warning-tint)', icon: 'alert', ic: '#8a6c00' },
    info:    { bg: '#fff', bar: 'var(--appro-blue)', tint: 'var(--appro-blue-100)', icon: 'info', ic: 'var(--appro-blue)' },
  }[t.kind] || {};

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 0, width: 360, maxWidth: '90vw',
      background: palette.bg, borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 12px 32px rgba(12,25,49,.18)', border: '1px solid var(--ink-200)',
      transform: leaving ? 'translateX(120%)' : 'translateX(0)',
      opacity: leaving ? 0 : 1,
      transition: 'transform .24s cubic-bezier(.4,0,.2,1), opacity .2s',
      fontFamily: 'var(--font-ui)',
    }}>
      <div style={{ width: 4, alignSelf: 'stretch', background: palette.bar, flexShrink: 0 }}/>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: palette.tint, color: palette.ic, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, margin: '13px 0 0 13px' }}>
        <Icon name={palette.icon} size={15} stroke={3}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '12px 8px 13px 12px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.35 }}>{t.title}</div>
        {t.detail && <div style={{ fontSize: 12, color: 'var(--ink-600)', marginTop: 3, lineHeight: 1.45, wordBreak: 'break-word' }}>{t.detail}</div>}
        {t.action && (
          <button onClick={() => { t.action.onClick && t.action.onClick(); close(); }} style={{
            marginTop: 8, background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
            color: palette.ic, fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>{t.action.label} <Icon name="arrow" size={12}/></button>
        )}
      </div>
      <button onClick={close} aria-label="Dismiss" style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--ink-400)', padding: '12px 12px 0 4px', flexShrink: 0 }}>
        <Icon name="x" size={14}/>
      </button>
    </div>
  );
}

function ToastHost() {
  const { useState, useEffect } = React;
  const [items, setItems] = useState([]);
  useEffect(() => ToastBus.subscribe(setItems), []);
  return (
    <div style={{
      position: 'fixed', top: 18, right: 18, zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {items.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem t={t} onClose={() => ToastBus.dismiss(t.id)}/>
        </div>
      ))}
    </div>
  );
}

// Small inline field-error helper (red text + optional ring handled by caller)
function FieldError({ children }) {
  if (!children) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 11.5, color: 'var(--danger)', fontFamily: 'var(--font-ui)' }}>
      <Icon name="alert" size={12}/> {children}
    </div>
  );
}

Object.assign(window, { ToastHost, FieldError });
