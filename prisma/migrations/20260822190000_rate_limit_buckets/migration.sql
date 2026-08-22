-- Post-roadmap hardening: shared rate-limit buckets. Lets the public-endpoint
-- limiter coordinate across multiple instances when DATABASE_URL is set; the
-- in-memory limiter remains the fallback for single-instance/dev deployments.

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "reset_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets"("reset_at");
