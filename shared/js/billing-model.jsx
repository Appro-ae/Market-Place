// Shared billing model + compute — ported from Billing v3 references, framework-agnostic.
// Exposes window.BILLING with state, derive helpers and formatting.
(function () {
  let SID = 0, PID = 0, KID = 0, SUBQ = 0;
  const nid = k => k === 's' ? 'SVC' + (++SID) : k === 'p' ? 'PRD' + (++PID) : 'PKG' + (++KID);

  const PRICING_TYPES = ['Committed volume', 'Usage band', 'Pay-as-you-go', 'On request'];
  const PERIODS = ['Per year', 'Per month'];
  const BILLING_FREQ = ['Annual', 'Monthly', 'Per usage'];
  const OVERFLOW = [['payg', 'Pay-as-you-go overage'], ['renew', 'Auto-renew block'], ['upgrade', 'Upgrade / change plan'], ['block', 'Block at limit (hard cap)']];
  const ovfLabel = c => ({ payg: 'Pay-as-you-go overage', renew: 'Auto-renew block', upgrade: 'Upgrade / change plan', block: 'Block at limit (hard cap)' }[c] || '—');
  const SUB_STATUS = ['Active', 'Trial', 'Pending', 'Paused', 'Cancelled'];
  const statusInfo = st => ({
    Active: { bill: true, meter: true, cls: 'active' }, Trial: { bill: false, meter: true, cls: 'review' },
    Pending: { bill: false, meter: false, cls: 'pending' }, Paused: { bill: false, meter: false, cls: 'revoked' },
    Cancelled: { bill: false, meter: false, cls: 'error' },
  }[st] || { bill: false, meter: false, cls: 'revoked' });

  const mkPkg = o => Object.assign({ id: nid('k'), name: '', pricingType: 'Committed volume', txns: 0, bands: [], period: 'Per year', unitPrice: 0, overflow: 'payg', overageRate: 0, overageCap: 0, maxRenewals: 0, upgradeTo: 'tenant', graceBuffer: 0, blockBehaviour: 'Reject requests', setup: 0, billing: 'Annual', active: true }, o);
  const mkProd = o => Object.assign({ id: nid('p'), name: '', descriptor: '', uom: 'Transaction', billable: true, active: true, packages: [] }, o);
  const mkSvc = o => Object.assign({ id: nid('s'), name: '', code: '', active: true, minCharge: 0, activation: '2026-06-15', products: [] }, o);

  const state = { services: [], tenants: [], subs: [] };

  (function seed() {
    const aecb = mkSvc({ name: 'AECB', code: 'AECB', minCharge: 25000 });
    const csi = mkProd({ name: 'Credit Score (Individual)', descriptor: 'Individuals', uom: 'Report' });
    csi.packages = [
      mkPkg({ name: 'Package 1', pricingType: 'On request', unitPrice: 4.00 }),
      mkPkg({ name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 3.50, overflow: 'payg', overageRate: 5.00 }),
      mkPkg({ name: 'Package 3', pricingType: 'Committed volume', txns: 100000, unitPrice: 3.00, overflow: 'renew', maxRenewals: 2 }),
    ];
    aecb.products = [csi];

    const mohre = mkSvc({ name: 'MOHRE', code: 'MOHRE', minCharge: 10000 });
    const eiv = mkProd({ name: 'Employment Income Verification', descriptor: 'Individuals', uom: 'Check' });
    eiv.packages = [mkPkg({ name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 6.15, overflow: 'payg', overageRate: 7.00 })];
    mohre.products = [eiv];

    const uaep = mkSvc({ name: 'UAE Pass', code: 'UAEP', minCharge: 12000 });
    const gdi = mkProd({ name: 'Government Digital Identity', descriptor: 'Individuals', uom: 'Check' });
    gdi.packages = [mkPkg({ name: 'Per transaction', pricingType: 'On request', unitPrice: 2.00 })];
    const gds = mkProd({ name: 'Government Digital Signing', descriptor: 'Individuals', uom: 'Signature' });
    gds.packages = [mkPkg({ name: 'Per transaction', pricingType: 'On request', unitPrice: 2.50 })];
    uaep.products = [gdi, gds];

    state.services.push(aecb, mohre, uaep);
    state.services.push(mkSvc({ name: 'Sanctions Screening', code: 'SANC', active: false }));

    state.tenants = [{ id: 'T1', name: 'Tenant 1' }, { id: 'T2', name: 'Tenant 2' }, { id: 'T3', name: 'Tenant 3' }];
    const sub = o => Object.assign({ id: 'SUB' + (++SUBQ), activation: '2026-06-15', status: 'Active', trialEnds: '' }, o);
    state.subs = [
      sub({ tenantId: 'T1', serviceId: aecb.id, productId: csi.id, packageId: csi.packages[2].id }),
      sub({ tenantId: 'T1', serviceId: mohre.id, productId: eiv.id, packageId: eiv.packages[0].id }),
      sub({ tenantId: 'T1', serviceId: uaep.id, productId: gds.id, packageId: gds.packages[0].id }),
      sub({ tenantId: 'T2', serviceId: aecb.id, productId: csi.id, packageId: csi.packages[1].id }),
      sub({ tenantId: 'T2', serviceId: mohre.id, productId: eiv.id, packageId: eiv.packages[0].id }),
      sub({ tenantId: 'T2', serviceId: uaep.id, productId: gdi.id, packageId: gdi.packages[0].id }),
      sub({ tenantId: 'T3', serviceId: aecb.id, productId: csi.id, packageId: csi.packages[1].id, status: 'Pending' }),
      sub({ tenantId: 'T3', serviceId: mohre.id, productId: eiv.id, packageId: eiv.packages[0].id }),
    ];
  })();

  // ===== Master Product Catalogue (Product → Package) =====
  const PC = [];
  const pcProd = (name, uom, active, pkgs) => { const p = mkProd({ name, uom, active }); p.packages = pkgs.map(mkPkg); PC.push(p); return p; };
  pcProd('Credit Score (Individual)', 'Report', true, [{ name: 'Package 1', pricingType: 'On request', unitPrice: 4.00 }, { name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 3.50, overflow: 'payg', overageRate: 4.50 }]);
  pcProd('Credit Score (Company)', 'Report', true, [{ name: 'Package 1', pricingType: 'On request', unitPrice: 6.60 }, { name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 4.18, overflow: 'payg', overageRate: 5.00 }, { name: 'Package 3', pricingType: 'Committed volume', txns: 100000, unitPrice: 3.52, overflow: 'renew', maxRenewals: 2 }]);
  pcProd('Credit Full Report (Individual)', 'Report', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 30000, unitPrice: 6.60, overflow: 'payg', overageRate: 8.00 }]);
  pcProd('Credit Full Report (Company)', 'Report', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 30000, unitPrice: 7.20, overflow: 'payg', overageRate: 9.00 }]);
  pcProd('Credit Analytics Report (Individual)', 'Report', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 20000, unitPrice: 8.00, overflow: 'payg', overageRate: 10.00 }]);
  pcProd('Credit Analytics Report (Company)', 'Report', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 20000, unitPrice: 9.00, overflow: 'payg', overageRate: 11.00 }]);
  pcProd('Employment Income Verification', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 6.15, overflow: 'payg', overageRate: 7.00 }]);
  pcProd('Financial Statement Analyzer', 'Report', true, [{ name: 'Usage tiers', pricingType: 'Usage band', period: 'Per month', bands: [{ from: 0, to: 10000, rate: 3.00 }, { from: 10000, to: 50000, rate: 2.40 }, { from: 50000, to: null, rate: 2.00 }], unitPrice: 3.00 }]);
  pcProd('Identity Verification', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 100000, unitPrice: 1.20, overflow: 'payg', overageRate: 1.50 }]);
  pcProd('Biographic Verification', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 100000, unitPrice: 1.50, overflow: 'payg', overageRate: 1.90 }]);
  pcProd('Business Verification', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 20000, unitPrice: 4.00, overflow: 'payg', overageRate: 5.00 }]);
  pcProd('Location Intelligence', 'Hit', true, [{ name: 'Pay-as-you-go', pricingType: 'Pay-as-you-go', unitPrice: 0.30 }]);
  pcProd('Text Analytics (Name Indexer)', 'Check', true, [{ name: 'Pay-as-you-go', pricingType: 'Pay-as-you-go', unitPrice: 0.20 }]);
  pcProd('Email Risk Assessment', 'Check', true, [{ name: 'Usage tiers', pricingType: 'Usage band', period: 'Per month', bands: [{ from: 0, to: 100000, rate: 0.05 }, { from: 100000, to: 500000, rate: 0.04 }, { from: 500000, to: null, rate: 0.03 }], unitPrice: 0.05 }]);
  pcProd('ID Document Data Extraction', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 80000, unitPrice: 0.90, overflow: 'payg', overageRate: 1.20 }]);
  pcProd('Government Digital Identity', 'Check', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 2.00, overflow: 'payg', overageRate: 2.50 }]);
  pcProd('Government Digital Signing', 'Signature', true, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 50000, unitPrice: 2.50, overflow: 'payg', overageRate: 3.00 }]);
  pcProd('AML & Sanctions Screening', 'Hit', false, [{ name: 'Package 2', pricingType: 'Committed volume', txns: 40000, unitPrice: 1.10, overflow: 'block', graceBuffer: 500 }]);
  state.productCatalog = PC;

  const fmtUSD = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtUSD0 = n => n == null ? '—' : '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtInt = n => Number(n).toLocaleString('en-US');
  const totalOf = k => (k.pricingType === 'On request' || k.pricingType === 'Pay-as-you-go' || k.pricingType === 'Usage band') ? null : k.unitPrice * k.txns;

  const svcById = id => state.services.find(s => s.id === id);
  function pkgById(id) { for (const s of state.services) for (const p of s.products) { const k = p.packages.find(x => x.id === id); if (k) return { svc: s, prod: p, pkg: k }; } return null; }
  function findPkg(s, id) { for (const p of s.products) { const k = p.packages.find(x => x.id === id); if (k) return k; } return null; }
  const tenantSubs = tid => state.subs.filter(x => tid === 'all' || x.tenantId === tid);

  const USAGE_F = [1.08, 0.72, 1.25, 0.55, 0.95, 1.4, 0.83, 0.6, 1.12, 0.9, 0.78, 1.05];
  const FAILS = [10, 15, 20, 5, 0, 8, 40, 2, 12, 5, 7, 3];

  function computeBilling(s, k, usage) {
    const committed = k.pricingType === 'Committed volume' ? k.txns : 0;
    const unit = k.unitPrice, ovf = k.overflow;
    let blocked = false, blockedTxns = 0, overflowTxns = 0, overflowCharge = 0, rebuyBlocks = 0, served = usage, detail = '', base;
    if (k.pricingType === 'Usage band') {
      base = 0; (k.bands || []).forEach(b => { const to = b.to == null ? Infinity : b.to; base += Math.max(0, Math.min(usage, to) - b.from) * b.rate; });
      detail = 'graduated · ' + (k.bands || []).length + ' tiers';
    } else base = committed ? unit * committed : unit * usage;
    if (committed && usage > committed) {
      if (ovf === 'payg') {
        let extra = usage - committed;
        if (k.overageCap > 0) { const bb = Math.min(extra, k.overageCap); blockedTxns = extra - bb; extra = bb; served = committed + bb; }
        overflowTxns = extra; overflowCharge = extra * (k.overageRate || 0);
        detail = '+' + fmtInt(overflowTxns) + ' @ ' + fmtUSD(k.overageRate) + '/unit';
      } else if (ovf === 'renew') {
        const need = Math.ceil(usage / committed); const blocks = k.maxRenewals > 0 ? Math.min(need, 1 + k.maxRenewals) : need;
        rebuyBlocks = blocks - 1; served = Math.min(usage, blocks * committed); blockedTxns = usage - served;
        overflowCharge = rebuyBlocks * unit * committed; detail = 'auto-renewed ' + rebuyBlocks + ' block(s)';
      } else if (ovf === 'upgrade') {
        overflowTxns = usage - committed; let tu = unit, tn = 'tenant choice';
        if (k.upgradeTo && k.upgradeTo !== 'tenant') { const tp = findPkg(s, k.upgradeTo); if (tp) { tu = tp.unitPrice; tn = tp.name; } }
        overflowCharge = overflowTxns * tu; detail = 'upgraded → ' + tn;
      } else if (ovf === 'block') {
        const grace = k.graceBuffer || 0; served = Math.min(usage, committed + grace); blockedTxns = usage - served; blocked = blockedTxns > 0;
        detail = blocked ? fmtInt(blockedTxns) + ' rejected at cap' : 'within grace';
      }
    }
    const subtotal = base + overflowCharge + (k.setup || 0);
    const charge = Math.max(s.minCharge || 0, subtotal);
    return { committed, unit, ovf, usage, success: served, base, overflowTxns, overflowCharge, rebuyBlocks, blockedTxns, blocked, detail, subtotal, charge, minApplied: charge > subtotal + 0.001, ovfActive: overflowTxns > 0 || rebuyBlocks > 0 || blockedTxns > 0, setup: k.setup || 0 };
  }
  function deriveSub(sub, idx) {
    const ref = pkgById(sub.packageId); if (!ref) return null;
    const s = ref.svc, k = ref.pkg, si = statusInfo(sub.status);
    const committed = k.pricingType === 'Committed volume' ? k.txns : 0;
    const f = USAGE_F[idx % USAGE_F.length];
    let usage = 0;
    if (si.meter && s.active) {
      if (k.pricingType === 'Usage band') { const tops = (k.bands || []).map(b => b.to).filter(x => x != null); const topT = tops.length ? Math.max(...tops) : 0; usage = Math.round((topT ? topT * 1.3 : 20000) * f); }
      else usage = committed ? Math.round(committed * f) : Math.round(20000 * f);
    }
    const b = computeBilling(s, k, usage);
    const billable = s.active && si.bill;
    if (!billable) { b.base = 0; b.overflowCharge = 0; b.charge = 0; b.minApplied = false; b.overflowTxns = 0; b.rebuyBlocks = 0; b.blockedTxns = 0; b.blocked = false; b.ovfActive = false; }
    return Object.assign({ subId: sub.id, tenant: state.tenants.find(t => t.id === sub.tenantId), svc: s, name: s.name, prod: ref.prod, pkg: k, btype: k.pricingType, period: k.period, activation: sub.activation, status: sub.status, dispStatus: s.active ? sub.status : 'Service off', statusCls: s.active ? si.cls : 'revoked', active: billable, failed: FAILS[idx % FAILS.length], minCharge: s.minCharge || 0 }, b);
  }
  const deriveTenant = tid => tenantSubs(tid).map((x, i) => deriveSub(x, i)).filter(Boolean);

  window.BILLING = {
    state, PRICING_TYPES, PERIODS, BILLING_FREQ, OVERFLOW, SUB_STATUS, ovfLabel, statusInfo,
    mkPkg, mkProd, mkSvc, svcById, pkgById, findPkg, tenantSubs, deriveSub, deriveTenant, computeBilling, totalOf,
    fmtUSD, fmtUSD0, fmtInt,
  };
})();
