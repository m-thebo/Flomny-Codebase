// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value; // Read the token from cookies
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users trying to access protected routes
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Redirect authenticated users trying to access auth routes
  if (token && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next(); // Allow the request
}

// Define the routes where middleware should run
export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
