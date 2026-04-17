import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { UserRole } from "@/server/auth";

const ROLE_HOME: Record<UserRole, string> = {
  BUSINESS: "/cabinet/business",
  CLIENT: "/cabinet/client",
  EMPLOYEE: "/cabinet/employee",
  FREELANCER: "/cabinet/freelancer",
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as UserRole;

    // Prevent wrong role accessing wrong cabinet
    if (pathname.startsWith("/cabinet/business") && role !== "BUSINESS") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
    if (pathname.startsWith("/cabinet/employee") && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
    if (pathname.startsWith("/cabinet/client") && role !== "CLIENT") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }
    if (pathname.startsWith("/cabinet/freelancer") && role !== "FREELANCER") {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: ["/cabinet/:path*"],
};
