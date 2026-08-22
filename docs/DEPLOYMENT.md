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
isolation) and run its verification queries. The file is marked DRAFT — it has
not been executed in this repository's environment; treat staging verification
as mandatory before production.

Operational notes:

- Connect the app as the `automsp_app` role created by the RLS script, not as
  the schema owner.
- The connection pool must `SET LOCAL automsp.org_id` per transaction and
  reset it (`DISCARD ALL`) before returning connections to the pool.
- The JSON dev store and a Postgres deployment share nothing; do not point a
  production instance at a database whose contents you do not control.

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
server process. On multi-instance deployments run exactly ONE instance with
the scheduler enabled (or move scheduling to a dedicated worker) — the engine
is idempotent per run key, but duplicate scheduling is wasted work and noisy
logs. There is no env switch for this yet; that is a known gap for the first
multi-instance deployment.

## 5. Rate limiting

`src/server/rate-limit.ts` is an in-memory sliding window — correct for a
single instance. Before scaling horizontally, move the buckets to a shared
store (Redis or the database) or put a gateway limiter in front. The public
funnel (`POST /api/audit-requests`) is the only endpoint using it today;
authenticated endpoints rely on session auth plus the sign-in throttle.

## 6. Pre-launch checklist

- [ ] `DATABASE_URL` + `AUTOMSP_VAULT_KEY` set; `/api/health` reports `postgres`
- [ ] Migrations applied; RLS script applied and verified in staging
- [ ] CSP verified in a real browser (console shows no blocked inline script)
- [ ] Sign-in throttle works; funnel rate limit returns 429 with `Retry-After`
- [ ] Backups configured for Postgres; vault key stored in the secret manager
- [ ] Monitoring/alerting on `/api/health` and error rates
- [ ] One full tenant-isolation pass in staging (two orgs, cross-read attempts)
