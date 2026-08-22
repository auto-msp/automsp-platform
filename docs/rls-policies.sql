-- ─────────────────────────────────────────────────────────────────────────────
-- AutoMSP — PostgreSQL Row-Level Security policies (DRAFT)
--
-- STATUS: NOT APPLIED, NOT VERIFIED.
-- This file was written as the design deliverable for the "RLS policies"
-- roadmap item. It has NOT been executed against a live database in this
-- environment (no PostgreSQL instance is available here), so treat it as a
-- reviewed design, not as a tested migration. Apply it in staging, run the
-- verification queries at the bottom, and only then promote to production.
--
-- Defense-in-depth context: tenant isolation is ALREADY enforced in the
-- application layer — every service function in src/server/* filters on
-- organizationId, and the E2E suites assert cross-tenant reads/writes are
-- blocked. RLS makes that guarantee hold even if an application query ever
-- forgets the filter.
--
-- Model:
--   * The application connects as role `automsp_app` (never as the schema
--     owner or a superuser).
--   * Each request/transaction sets the tenant context:
--         SET LOCAL automsp.org_id = '<organization id>';
--     (`SET LOCAL` scopes the setting to the transaction; the pool must
--     reset it — e.g. `DISCARD ALL` on release — before reuse.)
--   * Policies compare organization_id to that setting. With RLS enabled and
--     no matching policy, access is denied by default.
--   * Migrations run as a separate maintenance role with BYPASSRLS so this
--     file's FORCE clause cannot lock the migrator out.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE ROLE automsp_app LOGIN;

CREATE SCHEMA IF NOT EXISTS automsp;

CREATE OR REPLACE FUNCTION automsp.current_org_id() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('automsp.org_id', true), '')
$$;

-- ── Tables that carry organization_id directly ──────────────────────────────
-- 26 tables (verified against prisma/schema.prisma, slice 7).

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'organization_members', 'teams', 'clients', 'projects', 'opportunities',
    'audits', 'systems', 'automations', 'agents', 'knowledge_sources',
    'integration_connections', 'executions', 'approvals', 'incidents',
    'metrics', 'reports', 'notifications', 'subscriptions', 'invoices',
    'usage_records', 'ai_runs', 'agent_runs', 'eval_suites', 'eval_runs',
    'audit_logs', 'api_keys'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO automsp_app
         USING (organization_id = automsp.current_org_id())
         WITH CHECK (organization_id = automsp.current_org_id())',
      t || '_tenant_isolation', t);
  END LOOP;
END $$;

-- organizations: a session may only see its own org row.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
CREATE POLICY organizations_self_read ON organizations
  FOR SELECT TO automsp_app
  USING (id = automsp.current_org_id());

-- ── Child tables (no organization_id column; reach the tenant via FK) ───────

-- automation_versions → automations
ALTER TABLE automation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY automation_versions_tenant_isolation ON automation_versions
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM automations a
    WHERE a.id = automation_versions.automation_id
      AND a.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM automations a
    WHERE a.id = automation_versions.automation_id
      AND a.organization_id = automsp.current_org_id()));

-- workflow_nodes / workflow_edges → automation_versions → automations
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['workflow_nodes', 'workflow_edges']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO automsp_app
         USING (EXISTS (
           SELECT 1 FROM automation_versions v
           JOIN automations a ON a.id = v.automation_id
           WHERE v.id = %I.version_id
             AND a.organization_id = automsp.current_org_id()))
         WITH CHECK (EXISTS (
           SELECT 1 FROM automation_versions v
           JOIN automations a ON a.id = v.automation_id
           WHERE v.id = %I.version_id
             AND a.organization_id = automsp.current_org_id()))',
      t || '_tenant_isolation', t, t, t);
  END LOOP;
END $$;

-- agent_versions → agents; agent_tools → agent_versions → agents
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY agent_versions_tenant_isolation ON agent_versions
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM agents g WHERE g.id = agent_versions.agent_id
      AND g.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM agents g WHERE g.id = agent_versions.agent_id
      AND g.organization_id = automsp.current_org_id()));

ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools FORCE ROW LEVEL SECURITY;
CREATE POLICY agent_tools_tenant_isolation ON agent_tools
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM agent_versions v
    JOIN agents g ON g.id = v.agent_id
    WHERE v.id = agent_tools.version_id
      AND g.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM agent_versions v
    JOIN agents g ON g.id = v.agent_id
    WHERE v.id = agent_tools.version_id
      AND g.organization_id = automsp.current_org_id()));

-- documents → knowledge_sources; document_chunks → documents → knowledge_sources
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
CREATE POLICY documents_tenant_isolation ON documents
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM knowledge_sources s WHERE s.id = documents.source_id
      AND s.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM knowledge_sources s WHERE s.id = documents.source_id
      AND s.organization_id = automsp.current_org_id()));

ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;
CREATE POLICY document_chunks_tenant_isolation ON document_chunks
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM documents d
    JOIN knowledge_sources s ON s.id = d.source_id
    WHERE d.id = document_chunks.document_id
      AND s.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM documents d
    JOIN knowledge_sources s ON s.id = d.source_id
    WHERE d.id = document_chunks.document_id
      AND s.organization_id = automsp.current_org_id()));

-- execution_steps / execution_logs → executions
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['execution_steps', 'execution_logs']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO automsp_app
         USING (EXISTS (
           SELECT 1 FROM executions e WHERE e.id = %I.execution_id
             AND e.organization_id = automsp.current_org_id()))
         WITH CHECK (EXISTS (
           SELECT 1 FROM executions e WHERE e.id = %I.execution_id
             AND e.organization_id = automsp.current_org_id()))',
      t || '_tenant_isolation', t, t, t);
  END LOOP;
END $$;

-- eval_cases → eval_suites; eval_results → eval_runs → eval_suites
ALTER TABLE eval_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_cases FORCE ROW LEVEL SECURITY;
CREATE POLICY eval_cases_tenant_isolation ON eval_cases
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM eval_suites s WHERE s.id = eval_cases.suite_id
      AND s.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM eval_suites s WHERE s.id = eval_cases.suite_id
      AND s.organization_id = automsp.current_org_id()));

ALTER TABLE eval_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE eval_results FORCE ROW LEVEL SECURITY;
CREATE POLICY eval_results_tenant_isolation ON eval_results
  FOR ALL TO automsp_app
  USING (EXISTS (
    SELECT 1 FROM eval_runs r
    JOIN eval_suites s ON s.id = r.suite_id
    WHERE r.id = eval_results.run_id
      AND s.organization_id = automsp.current_org_id()))
  WITH CHECK (EXISTS (
    SELECT 1 FROM eval_runs r
    JOIN eval_suites s ON s.id = r.suite_id
    WHERE r.id = eval_results.run_id
      AND s.organization_id = automsp.current_org_id()));

-- ── Deliberately NOT RLS-protected (no tenant column by design) ─────────────
-- users, sessions, auth_attempts  — identity layer; sessions are keyed by an
--   unguessable token hash and looked up before any tenant context exists.
-- audit_requests                   — public funnel intake, pre-tenant by design.
-- services, integrations           — global platform catalogs.
-- Access to these stays controlled by the application layer and by granting
-- automsp_app only the column-level privileges it needs (future hardening).

-- ── Verification (run in staging after applying) ────────────────────────────
-- As automsp_app, with two seeded orgs A and B:
--
--   BEGIN;
--   SET LOCAL automsp.org_id = '<org A id>';
--   SELECT count(*) FROM automations;              -- only org A rows
--   SELECT count(*) FROM executions
--     WHERE organization_id = '<org B id>';        -- must be 0
--   INSERT INTO automations (id, organization_id, name, status)
--     VALUES ('x', '<org B id>', 'smuggle', 'draft');  -- must FAIL
--   ROLLBACK;
--
--   -- unset context ⇒ deny-all default:
--   SELECT count(*) FROM automations;              -- must be 0
