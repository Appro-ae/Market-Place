// Appro Marketplace — front-end API client.
// If window.APPRO_API_BASE is set (see index.html), the portals talk to the real
// backend. If it's empty, everything falls back to the built-in mock data, so the
// static demo keeps working with no server.
(function () {
  const BASE = (typeof window !== 'undefined' && window.APPRO_API_BASE) ? String(window.APPRO_API_BASE).replace(/\/$/, '') : '';
  const TOKEN_KEY = 'appro.jwt';

  function enabled() { return !!BASE; }
  function token() { try { return localStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch {} }

  async function req(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    const t = token();
    if (t) headers.Authorization = 'Bearer ' + t;
    const res = await fetch(BASE + path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const err = new Error((data && data.error) || ('HTTP ' + res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  const api = {
    enabled,
    base: () => BASE,
    token,
    setToken,
    logout() { setToken(''); },
    async login(email, password) {
      const data = await req('POST', '/auth/login', { email, password });
      setToken(data.token);
      try { localStorage.setItem('appro.user', JSON.stringify(data.user)); } catch {}
      return data.user;
    },
    me: () => req('GET', '/me'),
    // catalogue
    products: () => req('GET', '/api/products'),
    product: (id) => req('GET', '/api/products/' + encodeURIComponent(id)),
    // admin
    tenants: () => req('GET', '/api/tenants'),
    stats: () => req('GET', '/api/stats'),
    // subscriptions
    subscriptions: () => req('GET', '/api/subscriptions'),
    subscribe: (product_id, environment) => req('POST', '/api/subscriptions', { product_id, environment }),
    setSubscriptionStatus: (id, status) => req('PATCH', '/api/subscriptions/' + id, { status }),
    unsubscribe: (id) => req('DELETE', '/api/subscriptions/' + id),
    // keys
    keys: () => req('GET', '/api/keys'),
    createKey: (name, environment) => req('POST', '/api/keys', { name, environment }),
    revokeKey: (id) => req('POST', '/api/keys/' + id + '/revoke'),
  };

  window.approApi = api;
})();
