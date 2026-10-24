# Security and DPDP review

Scope: static review of the tracked source in `main` (235 files). No dynamic testing, no dependency
audit (`npm audit` was not run), no review of production configuration. Secret findings list file
path and type only; no secret values appear in this report.

## Secrets

No committed secrets were found.

| Path | Type | Verdict |
|------|------|---------|
| `.env.example` (line 11, commented) | Database URL with a password field | Placeholder (`user:<placeholder>@localhost`), not a real credential |
| `prisma.config.ts` (line 9) | Database URL with a password field | Local-dev fallback placeholder, not a real credential |
| `docs/DEPLOYMENT.md` (line 60) | Database URL with a password field | Documentation template with `<region>` placeholder |
| `src/server/db/prisma-store.ts` (line 206) | Credential-like assignment | False positive (auth-type enum mapping) |

`.env.example` has blank values for every key except `NEXT_PUBLIC_SITE_URL` and `EMAIL_FROM`.
`.gitignore` excludes `.env*` (except the example), `.data/`, and `*.pem`. No private keys, cloud keys,
or provider tokens matched the scan patterns. Git history was not scanned (shallow clone).

## Findings by severity

### High

1. **Server-side request forgery and credential exposure in outbound HTTP tool and workflow step**
   (`src/server/ai/tools.ts` around line 185, `src/server/engine/executor.ts` around line 270).
   The agent HTTP tool and the workflow `http` node call `fetch` on a URL that an agent or workflow
   author controls. Only the `http:`/`https:` scheme is checked. There is no block on loopback,
   link-local (cloud metadata), or private ranges, no host allow-list, and redirects are followed.
   When a vault credential is selected, the decrypted secret is attached as a header to whatever host
   was requested, so a prompt-injected agent could send a tenant's stored credential to an attacker
   host. Recommended: resolve the host and reject private/loopback/link-local addresses, set
   `redirect: "manual"`, and bind each integration credential to an allow-listed host pattern.
   Not fixed: needs a product decision on the allow-list model.

### Medium

2. **Session replay and autocapture on all pages, no consent gate** (`src/components/mixpanel-analytics.tsx`,
   mounted from `src/app/layout.tsx`). When `NEXT_PUBLIC_MIXPANEL_TOKEN` is set, Mixpanel runs with
   `autocapture: true` and `record_sessions_percent: 100` on every route, including the authenticated
   `/app/*` workspace that shows customer data. Replays and autocapture can capture personal data
   typed or displayed on screen. For DPDP purposes there is no consent notice or opt-in, and no
   masking configuration. Recommended: disable replay on `/app/*`, enable masking, and gate analytics
   on consent. Not fixed: behavioural change.
3. **Plaintext personal data in a local JSON file** (`src/server/audit-requests.ts`). Every audit
   request (name, work email, phone, company, free text) is also written to
   `.data/audit-requests.json` as a redundant receipt, unencrypted and with no retention or erasure
   path. Recommended: drop the file receipt once Postgres is the system of record, or add retention
   and erasure. Not fixed.
4. **Rate-limit key trusts client-supplied `X-Forwarded-For`** (`src/server/rate-limit.ts`, `clientIp`).
   The first forwarded address is used. If the app is not behind a proxy that overwrites the header,
   a caller can rotate it and bypass the 10-requests-per-10-minutes limit on the public
   `/api/audit-requests` endpoint. Recommended: take the address added by the trusted proxy
   (last hop) or a platform-provided IP. Not fixed: depends on deployment topology.

### Low

5. **Account lockout can be triggered by others; sign-up reveals registered emails**
   (`src/server/auth/actions.ts`). Lockout is keyed on email only (8 failures, 15 minutes), so anyone
   can lock a known user out. Sign-up returns "An account with this email already exists".
   Sign-in itself uses a uniform error. Not fixed.
6. **Long-lived sessions without rotation** (`src/server/auth/session.ts`): 30-day fixed expiry,
   token not rotated on privilege change. Cookie flags are good (httpOnly, sameSite=lax, secure in
   production). Not fixed.
7. **Container and deploy hardening** (`Dockerfile`, `scripts/deploy.sh`): the runtime image runs as
   root, and the deploy script runs from `/root` and serves on port 80 under pm2. Dockerfile installs
   with pnpm while `package-lock.json` is also committed (two lockfiles can drift). Not fixed.
8. **Default demo password in the seed script** (`scripts/seed-operator.mjs`): falls back to a fixed
   documented password and prints it. Local-dev only by design.

### Informational (checked, no issue found)

- Inputs: public audit form and auth forms are validated with zod, with length limits and a honeypot.
- No raw SQL in application code (only in `scripts/verify-rls.mjs`, constant strings). No `eval`,
  `child_process`, or `new Function`.
- Redirects: all `redirect()` targets are constants or server-generated ids; no user-supplied
  redirect parameters.
- Passwords use scrypt with per-user salt and constant-time comparison; session tokens are stored
  hashed. Vault uses AES-256-GCM and keeps plaintext secrets out of results.
- CSP, HSTS, frame, and referrer headers are set in `src/proxy.ts`.
- Failed sign-in audit entries store only a failure count, not the email address.
- Workflow execution logs (`execution_logs`) are stored in the datastore; they were not reviewed
  for whether step inputs containing personal data are written verbatim.

## Fixes applied in this change (low risk)

| File | Change |
|------|--------|
| `src/server/notifications.ts` | Notification `href` values (settable by agent tools and workflow steps) are now limited to same-origin relative paths; `javascript:`, `data:`, absolute and `//host` URLs are dropped. |
| `src/components/marketing/faq-section.tsx`, `src/app/(marketing)/pricing/page.tsx` | JSON-LD blocks now use the existing `JsonLd` helper, which escapes `<` and `>`, instead of raw `JSON.stringify` in `dangerouslySetInnerHTML`. Content was static, so this is hardening. |
| `src/app/api/audit-requests/route.ts` | The failure path now logs only the error class, not the full error object, which could echo submitted personal data. |
| `scripts/seed-operator.mjs` | Refuses to run when `NODE_ENV=production`. |

## DPDP notes

- Personal data collected: audit-request form fields and account details (name, email, phone,
  company). Items 2 and 3 above are the main exposure points.
- Not found in the code reviewed: a consent record for analytics, a data-erasure or export flow, or
  a retention schedule. Confirm these exist elsewhere or add them.
