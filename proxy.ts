import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes — skip auth
  const publicPaths = ["/", "/login", "/register", "/api/auth", "/api/webhooks"];
  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  if (isPublic) {
    return NextResponse.next();
  }

  // Static assets — skip auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Validate session by calling the auth API endpoint internally.
  // We avoid importing `auth` directly because the Drizzle adapter
  // relies on Node-only modules that break in the Edge proxy bundler.
  try {
    const sessionRes = await fetch(
      new URL("/api/auth/get-session", request.url),
      {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await sessionRes.json();

    if (!session || !session.user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Admin routes require admin role
    if (pathname.startsWith("/admin")) {
      if (session.user.role !== "admin") {
        return NextResponse.redirect(new URL("/generator", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // If the auth API call fails, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and API auth routes
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
