import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // `app_metadata` can only be set by the service role (see the admin script
  // that tagged the manager account), never by the user themselves — unlike
  // `user_metadata`, which a signed-up guest can edit on their own account.
  // Checking role here, not just "is any user logged in", closes the gap
  // that would otherwise let any guest who signs up reach /dashboard.
  const isManager = user?.app_metadata?.role === "manager";

  // MANAGER PORTAL
  if (pathname.startsWith("/dashboard") && !isManager) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname === "/login" && isManager) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // GUEST ACCOUNT
  if (pathname === "/account" && !user) {
    return NextResponse.redirect(new URL("/account/login", request.url));
  }

  if (
    (pathname === "/account/login" || pathname === "/account/signup") &&
    user
  ) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/account",
    "/account/login",
    "/account/signup",
  ],
};
