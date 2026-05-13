// Copy this file to `supabase-config.js` and fill in your values.
// `supabase-config.js` is gitignored — it's per-clone, not per-repo.
//
// Where to find these:
//   - url:     Supabase Dashboard → Project Settings → API → Project URL
//   - anonKey: Supabase Dashboard → Project Settings → API → Project API Keys
//              → "anon public" (the publishable key, NOT the service_role one)
//
// The anon key is safe to ship to browsers — RLS gates everything on the server.
// Never put `service_role` keys in this file; those bypass RLS.

window.SB_CONFIG = {
  url: "https://YOUR_PROJECT_REF.supabase.co",
  anonKey: "YOUR_ANON_KEY",
};
