import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { PIN_OK_COOKIE } from "@/lib/auth/constants";
import { isSupabaseConfigured, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Runs on every matched request: refreshes the Supabase session, guards both the
// parent area and (now that progress lives in Supabase) child mode, and drops the
// PIN unlock when the user enters child mode.
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isChild = pathname.startsWith("/child");
  const isParent = pathname.startsWith("/parent");
  const isLogin = pathname === "/parent/login";
  const toLogin = () => NextResponse.redirect(new URL("/parent/login", request.url));

  // Without Supabase configured (dev:demo / e2e) child mode runs on localStorage
  // and needs no session; the parent area still funnels to the login page.
  if (!isSupabaseConfigured) {
    if (isParent && !isLogin) return toLogin();
    const response = NextResponse.next({ request });
    if (isChild && request.cookies.has(PIN_OK_COOKIE)) response.cookies.delete(PIN_OK_COOKIE);
    return response;
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

  // Child progress is read/written under the parent's session, so child mode now
  // requires a signed-in parent. Entering child mode also drops the PIN unlock.
  if (isChild) {
    if (!user) return toLogin();
    if (request.cookies.has(PIN_OK_COOKIE)) response.cookies.delete(PIN_OK_COOKIE);
    return response;
  }

  if (isParent) {
    if (!user && !isLogin) return toLogin();
    if (user && isLogin) return NextResponse.redirect(new URL("/parent", request.url));
  }

  return response;
}
