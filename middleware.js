import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Allow access to login and authentication routes
    if (pathname.startsWith("/api/auth") || pathname === "/login") {
        return NextResponse.next();
    }

    // If no token and trying to access a protected route, redirect to login
    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

// Protect specific pages
export const config = {
    matcher: ["/", "/dashboard", "/homepage/family", "/homepage/grupos", "/homepage/product", "/homepage/subfamilia"],
};
