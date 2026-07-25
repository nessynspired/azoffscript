import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Refreshes the Supabase auth session on every request and protects /portal/*.
 * Public routes: /, /login. Everything else under /portal requires a session.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // env not configured — let the app surface the error rather than crash middleware
    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { session } } = await supabase.auth.getSession();
  const pathname = request.nextUrl.pathname;
  const isPortal = pathname.startsWith("/portal");
  const isLogin = pathname === "/login";
  const isRoot = pathname === "/";
  const isShare = pathname === "/share";

  if (isPortal && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    // Preserve any shared content so it survives the login redirect
    const sharedText = request.nextUrl.searchParams.get("text");
    if (sharedText) redirectUrl.searchParams.set("text", sharedText);
    return NextResponse.redirect(redirectUrl);
  }

  // Share target: if not logged in, send to login but preserve the shared content
  if (isShare && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", "/share");
    return NextResponse.redirect(redirectUrl);
  }

  // Logged-in users visiting the public site or login → go straight to the portal
  if (session && (isLogin || isRoot)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/portal/lobby";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
