import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

function keyAllowed(key: string) {
  const expected = process.env.DASHBOARD_KEY?.trim() ?? "";
  if (!expected || key.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(key), Buffer.from(expected));
}

/** Hide the guest book unless the address includes the private path. */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/dashboard") {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  if (pathname.startsWith("/dashboard/")) {
    let key = pathname.slice("/dashboard/".length);
    try {
      key = decodeURIComponent(key);
    } catch {
      return NextResponse.rewrite(new URL("/", request.url));
    }
    if (!keyAllowed(key)) return NextResponse.rewrite(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
