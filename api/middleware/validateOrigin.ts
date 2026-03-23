/**
 * Validate request origin for security
 */

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://onyx-suite.vercel.app',
    'https://aliseus.vercel.app', // Production domain
];

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
    // Allow requests with no origin (e.g., same-origin, mobile apps)
    if (!origin) {
        return true;
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
        return true;
    }

    return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers
 */
export function getCorsHeaders(origin: string | null | undefined): Record<string, string> {
    const headers: Record<string, string> = {
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400', // 24 hours
    };

    if (origin && isOriginAllowed(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
        headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return headers;
}

/**
 * Validate origin and return appropriate response
 */
export function validateOrigin(origin: string | null | undefined): {
    valid: boolean;
    headers: Record<string, string>;
} {
    const valid = isOriginAllowed(origin);
    const headers = getCorsHeaders(origin);

    return { valid, headers };
}
