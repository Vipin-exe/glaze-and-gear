import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;

    // Only allow users with ADMIN role to access the admin panel
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      // User is logged in but not an admin, redirect them away or return 403
      return new NextResponse(
        "403 Forbidden - You are not authorized to view the admin panel.", 
        { status: 403 }
      );
    }
  },
  {
    callbacks: {
      // the `authorized` callback returns true if a token exists,
      // forcing NextAuth to require login for paths matching `matcher`.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  // Protect all routes under /admin
  matcher: ["/admin/:path*"],
};
