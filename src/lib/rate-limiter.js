/**
 * Rate Limiter - In-Memory Implementation
 * Limits requests per identifier (IP or userId)
 */

// Map structure: { identifier: { count: number, resetAt: timestamp } }
const rateLimitMap = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) {
            rateLimitMap.delete(key);
        }
    }
}, 5 * 60 * 1000);

/**
 * Check and apply rate limit for an identifier
 * 
 * @param {string} identifier - Unique key (IP, userId, etc.)
 * @param {number} limit - Max requests allowed in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{allowed: boolean, remaining: number, resetAt: number, retryAfter?: number}}
 */
export function rateLimit(identifier, limit = 10, windowMs = 60000) {
    const now = Date.now();
    let entry = rateLimitMap.get(identifier);

    // Reset if window expired
    if (!entry || now > entry.resetAt) {
        entry = {
            count: 0,
            resetAt: now + windowMs
        };
    }

    entry.count++;
    rateLimitMap.set(identifier, entry);

    const allowed = entry.count <= limit;
    const remaining = Math.max(0, limit - entry.count);
    const retryAfter = allowed ? undefined : Math.ceil((entry.resetAt - now) / 1000);

    return {
        allowed,
        remaining,
        resetAt: entry.resetAt,
        retryAfter
    };
}

/**
 * Get client IP from request
 * Handles proxied requests (Netlify, Vercel, etc.)
 * 
 * @param {Request} request
 * @returns {string}
 */
export function getClientIP(request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') || // Cloudflare
        '127.0.0.1';
}

/**
 * Rate limit middleware for API routes
 * Returns Response if rate limited, null otherwise
 * 
 * @param {Request} request
 * @param {object} options
 * @returns {Response|null}
 */
export function checkRateLimit(request, options = {}) {
    const {
        limit = 10,
        windowMs = 60000,
        keyGenerator = getClientIP
    } = options;

    const key = typeof keyGenerator === 'function'
        ? keyGenerator(request)
        : keyGenerator;

    const result = rateLimit(key, limit, windowMs);

    if (!result.allowed) {
        return new Response(
            JSON.stringify({
                error: 'Muitas requisições. Tente novamente em breve.',
                retryAfter: result.retryAfter
            }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': String(result.retryAfter),
                    'X-RateLimit-Limit': String(limit),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(result.resetAt)
                }
            }
        );
    }

    return null;
}

/**
 * Preset rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    parseFile: { limit: 10, windowMs: 60000 },      // 10/min
    analyzeCandidate: { limit: 5, windowMs: 60000 }, // 5/min (uses Gemini)
    generateJob: { limit: 5, windowMs: 60000 },      // 5/min (uses Gemini)
    generateReport: { limit: 10, windowMs: 60000 }   // 10/min
};
