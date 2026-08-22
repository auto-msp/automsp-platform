-- Slice 4: agent tool execution. Adds the agent_runs table (multi-turn tool
-- runs), links approvals to agent runs (kind = "agent_tool"), and links
-- ai_runs to the agent run that produced the model call.

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "agent_id" TEXT NOT NULL,
    "agent_version_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "messages" JSONB NOT NULL,
    "invocations" JSONB NOT NULL,
    "pending_tool_calls" JSONB NOT NULL,
    "final_text" TEXT,
    "error" TEXT,
    "turns" INTEGER NOT NULL DEFAULT 0,
    "max_turns" INTEGER NOT NULL DEFAULT 6,
    "source" TEXT NOT NULL DEFAULT 'playground',
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "approvals" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'workflow',
ADD COLUMN "agent_run_id" TEXT;

-- AlterTable
ALTER TABLE "ai_runs" ADD COLUMN "agent_run_id" TEXT;

-- CreateIndex
CREATE INDEX "agent_runs_organization_id_created_at_idx" ON "agent_runs"("organization_id", "created_at");

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_agent_version_id_fkey" FOREIGN KEY ("agent_version_id") REFERENCES "agent_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_agent_run_id_fkey" FOREIGN KEY ("agent_run_id") REFERENCES "agent_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_agent_run_id_fkey" FOREIGN KEY ("agent_run_id") REFERENCES "agent_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
