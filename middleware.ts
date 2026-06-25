import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on /parent (auth guard) and /child (drop the PIN unlock). Skip static
  // assets, image optimization, and favicon.
  matcher: ["/parent/:path*", "/child/:path*"],
};
