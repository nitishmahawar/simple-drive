import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    if (request.nextUrl.pathname.startsWith("/drive")) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  } else {
    if (
      request.nextUrl.pathname === "/sign-in" ||
      request.nextUrl.pathname === "/sign-up"
    ) {
      return NextResponse.redirect(new URL("/drive", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/drive/:path*", "/sign-in", "/sign-up"],
};
