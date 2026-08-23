-- Sandbox mode: new workspaces start gated; flipping off is an explicit owner action.
ALTER TABLE "organizations" ADD COLUMN "sandbox_mode" BOOLEAN NOT NULL DEFAULT true;
