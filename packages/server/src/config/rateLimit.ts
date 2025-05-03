import { RateLimitConfig } from '../interfaces/RateLimit'

/**
 * Rate limit configuration for different endpoints and user roles
 */
export const rateLimitConfig: RateLimitConfig = {
    // Authentication endpoints
    auth: {
        // Login/signup endpoints (10 requests per minute per IP)
        register: {
            windowMs: 60 * 1000, // 1 minute
            max: 10,
            message: 'Too many registration attempts, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        },
        resetPassword: {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 5,
            message: 'Too many password reset attempts, please try again after an hour',
            standardHeaders: true,
            legacyHeaders: false
        }
    },
    // API key endpoints (30 requests per minute per user)
    apiKey: {
        create: {
            windowMs: 60 * 1000, // 1 minute
            max: 30,
            message: 'Too many API key creation attempts, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        },
        verify: {
            windowMs: 60 * 1000, // 1 minute
            max: 30,
            message: 'Too many API key verification attempts, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        }
    },
    // API endpoints
    api: {
        // Default rate limits for regular users
        default: {
            windowMs: 60 * 1000, // 1 minute
            max: 100, // 100 requests per minute
            message: 'Too many requests, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        },
        // Rate limits for admin users (higher limits)
        admin: {
            windowMs: 60 * 1000, // 1 minute
            max: 300, // 300 requests per minute
            message: 'Too many requests, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        },
        // Different rate limits based on operation type
        read: {
            windowMs: 60 * 1000, // 1 minute
            max: 200, // 200 read requests per minute
            message: 'Too many read requests, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        },
        write: {
            windowMs: 60 * 1000, // 1 minute
            max: 50, // 50 write requests per minute
            message: 'Too many write requests, please try again after a minute',
            standardHeaders: true,
            legacyHeaders: false
        }
    },
    // Trusted services (bypass rate limiting)
    trustedServices: [
        '127.0.0.1',
        'localhost'
        // Add other trusted IPs or service identifiers here
    ]
}

/**
 * Get rate limit configuration based on endpoint type and user role
 * @param type Endpoint type (auth, apiKey, api)
 * @param subtype Endpoint subtype (register, resetPassword, create, verify, etc.)
 * @param role User role (default, admin)
 * @returns Rate limit configuration
 */
export const getRateLimitConfig = (
    type: keyof RateLimitConfig,
    subtype: string,
    role: string = 'default'
): any => {
    if (type === 'auth' && subtype in rateLimitConfig.auth) {
        return rateLimitConfig.auth[subtype as keyof typeof rateLimitConfig.auth]
    }

    if (type === 'apiKey' && subtype in rateLimitConfig.apiKey) {
        return rateLimitConfig.apiKey[subtype as keyof typeof rateLimitConfig.apiKey]
    }

    if (type === 'api') {
        if (role === 'admin' && 'admin' in rateLimitConfig.api) {
            return rateLimitConfig.api.admin
        }

        if (subtype in rateLimitConfig.api) {
            return rateLimitConfig.api[subtype as keyof typeof rateLimitConfig.api]
        }

        return rateLimitConfig.api.default
    }

    // Default to the most restrictive rate limit
    return rateLimitConfig.api.default
}

/**
 * Check if IP is in the trusted services list
 * @param ip IP address to check
 * @returns True if IP is trusted, false otherwise
 */
export const isTrustedService = (ip: string): boolean => {
    return rateLimitConfig.trustedServices.includes(ip)
}