import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { PIN_OK_COOKIE } from "@/lib/auth/constants";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Runs on every matched request: refreshes the Supabase session cookie, guards
// the /parent area, and drops the PIN unlock when the user enters child mode.
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Entering child mode invalidates the parent PIN unlock, so coming back to
  // /parent re-prompts ("PIN re-entry when entered from child mode").
  if (pathname.startsWith("/child")) {
    const response = NextResponse.next({ request });
    if (request.cookies.has(PIN_OK_COOKIE)) response.cookies.delete(PIN_OK_COOKIE);
    return response;
  }

  // Without Supabase configured (dev:demo / e2e) there is no session to refresh.
  // Let /parent/login render; send any deeper /parent request there too.
  if (!isSupabaseConfigured) {
    if (pathname.startsWith("/parent") && pathname !== "/parent/login") {
      return NextResponse.redirect(new URL("/parent/login", request.url));
    }
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // IMPORTANT: getUser() refreshes the token; do not run logic between creating
  // the client and this call (Supabase SSR guidance).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Unauthenticated requests to the parent area go to the login page.
  if (!user && pathname.startsWith("/parent") && pathname !== "/parent/login") {
    return NextResponse.redirect(new URL("/parent/login", request.url));
  }

  // A signed-in parent never needs to see the login page.
  if (user && pathname === "/parent/login") {
    return NextResponse.redirect(new URL("/parent", request.url));
  }

  return response;
}
