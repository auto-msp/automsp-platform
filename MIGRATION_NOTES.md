# Domain migration notes

Scope: every case-insensitive occurrence of `automsp.us` and `automsp.store` in tracked text files
(excluding `.git`, `node_modules`, lockfiles, build output and binaries).

Mapping applied:

- `portal`, `bos`, `bos-dev`, `crm`, `erp`, `mautic`, `nextcloud`, `pbx`, `analytics` -> `*.automsp.cloud`
- `coder`, `octogent`, `openclaw`, `paperclip`, `mission-control`, `qr`, `db`, `evolution`,
  `search-council`, `voicebox`, `voice`, `omniroute`, `structurizr`, `portainer`, `npm`, `cloudpanel`,
  `adguard`, `invoice`, `harness`, `jarvis`, `n8n`, `build` -> `*.coreitx.us.kg`

## Result

Total occurrences found: 5. Occurrences replaced: 0.

None of the 5 occurrences is a hostname with one of the listed subdomains, so nothing in the mapping
applied. The lockfiles (`package-lock.json`, `pnpm-lock.yaml`) contain no occurrences.

## Occurrences deliberately left unchanged

| File | Line | Text | Reason |
|------|------|------|--------|
| `.env.example` | 49 | `EMAIL_FROM=AutoMSP <hello@automsp.us>` | Email address at a protected domain; rule says never change addresses. |
| `scripts/seed-operator.mjs` | 89 | `operator@automsp.us` | Email address (local-dev seed user); not changed. |
| `scripts/seed-operator.mjs` | 90 | `analyst@automsp.us` | Email address (local-dev seed user); not changed. |
| `scripts/seed-operator.mjs` | 94 | `operator@automsp.us` in console message | Email address; not changed. |
| `src/components/app/app-shell.tsx` | 110 | `← automsp.us` (link text, href is `/`) | Bare domain used as display text; bare domains are not changed. |

## Follow-ups for the owner (not done here)

- `hello@automsp.us` is the configured sender in `.env.example`. If `automsp.us` / `automsp.store`
  lapse on 2026-11-04, outbound mail from that address and the seed accounts will need a decision
  on a new sender domain (mail DNS/SPF/DKIM are outside this repo).
- The sidebar link text in `app-shell.tsx` still shows the old bare domain. Changing it to the
  canonical `automsp.cloud` is a one-line copy edit but was out of the stated mapping.
