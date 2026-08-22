import { NextResponse, type NextRequest } from "next/server";

/**
 * Request proxy (Next 16's successor to middleware.ts).
 *
 * Applies the security header set to every response and — in production — a
 * Content-Security-Policy. The policy is route-aware because the two halves of
 * the site render differently:
 *
 *  - `/app/*` and `/api/*` are server-rendered per request. Next.js reads the
 *    CSP from the forwarded request headers and applies that nonce to the
 *    inline scripts it emits, so these routes get a strict nonce policy with
 *    no 'unsafe-inline' for scripts.
 *  - The marketing pages (`/`, `/capabilities`, `/sign-in`, …) are prerendered
 *    to static HTML at build time, before any request exists, so their inline
 *    RSC bootstrap scripts can never carry a per-request nonce. They get a
 *    policy that still pins script/style/img/font origins to 'self' (blocking
 *    any externally-hosted payload) but allows inline scripts, since that
 *    content is fixed at build time and contains no user-controlled HTML.
 *
 * Development is exempt from CSP on purpose: the dev server's HMR and
 * react-refresh tooling require inline evaluation and a websocket, and a
 * strict policy would only break tooling without protecting anything on
 * localhost. Every other header applies in both modes.
 */

function nonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function baseDirectives(): string[] {
  return [
    "default-src 'self'",
    // Tailwind ships a static stylesheet; 'unsafe-inline' covers style
    // attributes in rendered markup. Runtime animation (motion) writes via
    // CSSOM, which CSP does not restrict.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];
}

/** Dynamic routes: strict nonce policy, no 'unsafe-inline' for scripts. */
function dynamicCsp(n: string, isProd: boolean): string {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${n}'`,
    ...baseDirectives().slice(1),
  ];
  if (isProd) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

/** Prerendered marketing routes: origins pinned, inline scripts allowed. */
function staticCsp(isProd: boolean): string {
  const directives = ["script-src 'self' 'unsafe-inline'", ...baseDirectives().slice(1)];
  if (isProd) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

function isDynamicRoute(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/") || pathname.startsWith("/api/");
}

export function proxy(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const requestHeaders = new Headers(request.headers);

  const headers: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-DNS-Prefetch-Control": "off",
  };

  if (isProd) {
    let csp: string;
    if (isDynamicRoute(request.nextUrl.pathname)) {
      const n = nonce();
      csp = dynamicCsp(n, isProd);
      // Next.js extracts the nonce from the forwarded CSP header and applies
      // it to the inline scripts it renders for this request.
      requestHeaders.set("Content-Security-Policy", csp);
    } else {
      csp = staticCsp(isProd);
    }
    headers["Content-Security-Policy"] = csp;
  }

  // HSTS only over HTTPS — sending it on plain-http localhost would pin the
  // browser to a scheme the dev server doesn't speak.
  if (request.nextUrl.protocol === "https:") {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  // Everything except build output and static brand assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
