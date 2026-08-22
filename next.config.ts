import type { NextConfig } from "next";

/**
 * Security headers — including the Content-Security-Policy — are applied
 * per-request by src/proxy.ts (Next 16's successor to middleware). Keeping
 * them there lets the CSP carry a fresh nonce on every response; a static
 * header in this file could not.
 */
const nextConfig: NextConfig = {};

export default nextConfig;
