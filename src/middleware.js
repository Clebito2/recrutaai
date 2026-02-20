/**
 * Security Middleware
 * Validates API requests and protects sensitive endpoints
 */

import { NextResponse } from 'next/server';

export function middleware(request) {
    const response = NextResponse.next();

    // Add security headers to all responses
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // Content Security Policy (Basic)
    response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https://firebasestorage.googleapis.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com;");

    // For API routes, add additional protection
    if (request.nextUrl.pathname.startsWith('/api/')) {
        // Check for valid origin (prevent CSRF)
        const origin = request.headers.get('origin');
        const host = request.headers.get('host');

        // In production, validate that requests come from the same origin
        if (process.env.NODE_ENV === 'production') {
            if (origin && !origin.includes(host)) {
                return new NextResponse(
                    JSON.stringify({ error: 'Invalid origin' }),
                    { status: 403, headers: { 'Content-Type': 'application/json' } }
                );
            }
        }

        // Add rate limiting headers (for monitoring, actual limiting would need Redis/DB)
        response.headers.set('X-RateLimit-Limit', '100');
        response.headers.set('X-RateLimit-Remaining', '99');

        // Don't cache API responses
        response.headers.set('Cache-Control', 'no-store, max-age=0');
    }

    return response;
}

export const config = {
    matcher: [
        // Match all API routes
        '/api/:path*',
        // Match all pages except static files
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
