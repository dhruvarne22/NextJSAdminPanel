// ─────────────────────────────────────────────────────────────────────────────
// middleware.ts  →  MUST be placed at the PROJECT ROOT (next to package.json)
//                   NOT inside /app/
// ─────────────────────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";

export const COOKIE_NAME = "vardaan_admin_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Always allow the login page through ──────────────────────────────────
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // ── Check session cookie ─────────────────────────────────────────────────
  const token  = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";

  if (!secret) {
    // Misconfigured — block access with a clear message
    return new NextResponse(
      "ADMIN_SESSION_SECRET is not set in .env.local",
      { status: 500 }
    );
  }

  if (token !== secret) {
    // Not authenticated → redirect to login, preserving destination
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// ── Apply middleware ONLY to /admin routes ────────────────────────────────────
export const config = {
  matcher: "/admin/:path*",
};