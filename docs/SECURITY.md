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
