import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes — no auth needed (login, legal, aur Google OAuth callback)
// /auth/callback ko zaruri public rakhna hai warna Google login ke baad middleware block karega
const PUBLIC_ROUTES = ["/", "/login", "/legal", "/auth"];

// Admin-only routes (prefix match)
const ADMIN_ROUTES = ["/admin", "/agents"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // Special case: keep /legal and / fully public, /login too
    return NextResponse.next();
  }

  const role = request.cookies.get("govassist_role")?.value;

  // Not logged in → redirect to login
  if (!role) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Citizen trying to access admin-only routes → redirect to /chat
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && role !== "admin") {
    const chatUrl = new URL("/chat", request.url);
    return NextResponse.redirect(chatUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except Next.js internals and static assets
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
