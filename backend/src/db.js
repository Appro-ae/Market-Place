// In-memory data store for the Appro API Marketplace.
// Pure JavaScript — no native modules — so it boots on any host (Railway, Render,
// Replit, etc.) with zero build steps. Data is seeded on boot and persists for the
// life of the process (resets on redeploy, which is ideal for a demo).
const store = {
  tenants: [],
  users: [],
  products: [],
  subscriptions: [],
  apiKeys: [],
};

module.exports = store;
