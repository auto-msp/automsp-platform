# Deployment

How to take this repository from a local dev store to a production deployment.
The honest baseline: this app runs today with zero external services, and
every unconfigured capability says so in the UI. Production means turning those
"not configured" surfaces on, one at a time, with real credentials.

## 1. Environment contract

`.env.example` is the contract — copy it, fill it, never commit real values.

| Variable | Required in prod | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection. Unset ⇒ the app silently uses the local JSON store, which is not acceptable in production. |
| `AUTOMSP_VAULT_KEY` | **Yes** | Base64 32-byte key for the credentials vault. Without it the app falls back to a gitignored dev key file. |
| `AUTOMSP_SCHEDULER` | Multi-instance only | `off` disables the in-process scheduler on that instance. Unset = enabled. Exactly one instance must hold it. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical URL for SEO/sitemap. |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_GENERATIVE_AI_API_KEY` | Optional | Exactly one enables AI surfaces; none ⇒ honest "not configured". |
| `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` | Optional | Enables subscriptions/invoices on the billing page. |

Secrets rules that never change: never log them, never expose them to the
client, never commit them. Integration credentials live in the encrypted vault
(`AUTOMSP_VAULT_KEY`), rows store only a reference.

## 2. Database

```bash
pnpm prisma migrate deploy        # apply committed migrations
```

Then, in staging first, apply `docs/rls-policies.sql` (defense-in-depth tenant
isolation) and run its verification queries as the real `automsp_app` role.

The policy script is verified on embedded Postgres: `pnpm verify:rls` runs the
full migration set plus the policies against PGlite (WASM Postgres 16) and
asserts org-scoped reads, cross-org INSERT rejection, FK-child scoping, and
deny-all on unset context — all seven checks passed 2026-08-22. That proves
the SQL is valid and the policies enforce isolation on a real Postgres engine;
it does not prove your staging database's role/pooler behaviour, so the
staging pass remains mandatory before production.

Operational notes:

- Connect the app as the `automsp_app` role created by the RLS script, not as
  the schema owner.
- The connection pool must `SET LOCAL automsp.org_id` per transaction and
  reset it (`DISCARD ALL`) before returning connections to the pool.
- The JSON dev store and a Postgres deployment share nothing; do not point a
  production instance at a database whose contents you do not control.

### Supabase Postgres (recommended)

1. Create a Supabase project, then create the `automsp_app` role and apply
   `docs/rls-policies.sql` in the SQL editor (staging first).
2. Set `DATABASE_URL` to the **session pooler** connection string (port 5432,
   region pooler host), not the direct connection — serverless/elastic
   deployments exhaust direct connections quickly:

   ```
   postgresql://automsp_app:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
   ```

3. Run migrations from your machine or CI (which may use the direct
   connection), never from the pooled app role:
   `DATABASE_URL=<direct-url> pnpm prisma migrate deploy`.
4. Supabase's shared pooler runs PgBouncer in transaction mode; the RLS
   contract requires `SET LOCAL automsp.org_id` per transaction and
   `DISCARD ALL` on return. Verify this against staging behaviour before
   production — see §2 above.
5. Health check: after deploy, `GET /api/health` must report
   `"store": "postgres"`. If it reports `json-file`, `DATABASE_URL` did not
   reach the process.

## 3. Build & run

```bash
pnpm build
pnpm start
```

- `GET /api/health` reports the active store adapter (`postgres` vs
  `json-file`) — a production smoke test should assert `postgres`.
- Security headers, including the Content-Security-Policy, are applied by
  `src/proxy.ts` per request. The policy is route-aware: `/app/*` and `/api/*`
  get a strict nonce CSP (fresh nonce per response, no `unsafe-inline` for
  scripts); prerendered marketing pages get an origin-pinned policy that
  allows their build-time inline scripts. CSP is active in production builds
  only; dev is exempt because HMR requires inline evaluation. If you add a
  third-party script or font origin, extend the policy there — do not weaken
  the dynamic-route policy to `unsafe-inline` for scripts.
- HSTS is emitted only on HTTPS requests; terminate TLS at the edge (or use a
  platform that does) before pointing real traffic at the app.

## 4. Scheduler

The automation scheduler starts from Next's `instrumentation.ts` hook in the
server process. It is an in-process poller with no shared lock, so on
multi-instance deployments it must run in exactly ONE instance.

The switch is `AUTOMSP_SCHEDULER` (see `.env.example`): unset or any value
other than `off/0/false/no/disabled` = enabled. Set `AUTOMSP_SCHEDULER=off`
on every instance except one (or run a dedicated scheduling instance).
`GET /api/health` reports `"scheduler": "enabled" | "disabled"` per instance,
so you can verify exactly one instance holds it. The engine's idempotency key
dedupes double-fired executions, but duplicate scheduler instances would still
duplicate failure notifications — which is why the switch exists instead of
"run it everywhere".

## 5. Rate limiting

`src/server/rate-limit.ts` has two backends behind one interface:

- **In-memory** sliding window — used when `DATABASE_URL` is unset (local
  dev, single instance).
- **Shared store** — when `DATABASE_URL` is set, buckets persist in the
  `rate_limit_buckets` table, so every instance behind one database shares
  the same windows. This is what makes the public funnel safe under
  horizontal scale.

The shared backend is read-modify-write, not an atomic increment: N truly
concurrent requests can overshoot the limit by up to N-1. For a friction
layer on a public funnel that is acceptable; if you need hard guarantees,
put a gateway limiter (Cloudflare, nginx, an API gateway) in front. The
public funnel (`POST /api/audit-requests`) is the only endpoint using it
today; authenticated endpoints rely on session auth plus the sign-in
throttle.

## 6. Pre-launch checklist

- [ ] `DATABASE_URL` + `AUTOMSP_VAULT_KEY` set; `/api/health` reports `postgres`
- [ ] Migrations applied; RLS script applied and verified in staging
- [ ] Multi-instance: `AUTOMSP_SCHEDULER=off` on all but one instance;
      `/api/health` shows exactly one `"scheduler": "enabled"`
- [ ] CSP verified in a real browser (console shows no blocked inline script)
- [ ] Sign-in throttle works; funnel rate limit returns 429 with `Retry-After`
- [ ] Backups configured for Postgres; vault key stored in the secret manager
- [ ] Monitoring/alerting on `/api/health` and error rates
- [ ] One full tenant-isolation pass in staging (two orgs, cross-read attempts)
