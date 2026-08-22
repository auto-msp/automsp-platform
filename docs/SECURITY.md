# Security

Security is a product feature, not a checklist. Standing rules:

1. **Tenant isolation at the database layer.** UI checks never stand alone.
2. **Validate every external input server-side** (Zod at the boundary).
3. **Human approval for consequential AI actions** — external sends, financial
   movements, permission changes, deletions.
4. **Secrets are never exposed to the client and never logged.** Integration
   credentials live in an encrypted vault; rows store a `credential_ref`.
5. **Least privilege.** Agents carry scoped permissions (`read_crm`,
   `send_email`, …) per version; high-risk scopes require approval policy.
6. **No data mixing.** One organization's documents, embeddings, and executions
   are never visible to another.
7. **Auditability.** Immutable-style audit log: actor, action, resource,
   before/after, timestamp, session metadata.
8. **Honest failure.** Errors say what happened and what to do next
   ("HubSpot connection expired. Reconnect to resume this automation.").

Never log: passwords, API keys, OAuth secrets, tokens, credentials.
Never commit secrets — `.env.example` lists the contract, real values stay local.

## Implemented controls (slice 7)

- **Content-Security-Policy** — applied per request by `src/proxy.ts`,
  route-aware. Dynamic routes (`/app/*`, `/api/*`) get a strict nonce policy
  (`script-src 'self' 'nonce-…'`, no `unsafe-inline` for scripts); Next.js
  reads the forwarded CSP header and stamps the nonce onto the inline scripts
  it renders. Prerendered marketing pages get a policy that still pins
  script/style/img/font origins to `'self'` but allows inline scripts, because
  their HTML is fixed at build time and cannot carry a per-request nonce.
  Both policies set `frame-ancestors 'none'` and `object-src 'none'`. Dev
  builds are exempt so HMR keeps working; every other header applies in both
  modes. HSTS is emitted on HTTPS requests only.
- **Public-endpoint rate limiting** — `src/server/rate-limit.ts`, sliding
  window per client address, applied to `POST /api/audit-requests`
  (10/10 min, 429 + `Retry-After`). In-memory: correct for one instance, needs
  a shared store before horizontal scale (see `docs/DEPLOYMENT.md`).
- **Sign-in brute-force throttle** — 8 consecutive failures lock the email for
  15 minutes; identical error text whether or not the account exists (no
  enumeration).
- **Automated tests** — `pnpm test` (Vitest): billing rollups and the
  honest-not-configured path, ROI null-safety, pipeline math, the funnel →
  audit intake, cross-tenant isolation at the service layer, and the full
  role/permission matrix (including "no customer role gets commercial.*").
- **RLS design** — `docs/rls-policies.sql` (DRAFT: written, not yet applied or
  verified against a live database; application-layer org filtering is the
  enforced control today).
