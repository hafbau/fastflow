/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
    auth: {
        register: RateLimitOptions;
        resetPassword: RateLimitOptions;
        [key: string]: RateLimitOptions;
    };
    apiKey: {
        create: RateLimitOptions;
        verify: RateLimitOptions;
        [key: string]: RateLimitOptions;
    };
    api: {
        default: RateLimitOptions;
        admin: RateLimitOptions;
        read: RateLimitOptions;
        write: RateLimitOptions;
        [key: string]: RateLimitOptions;
    };
    trustedServices: string[];
}

/**
 * Rate limit options interface
 */
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
}

/**
 * Rate limit info interface for monitoring and analytics
 */
export interface RateLimitInfo {
    ip: string;
    userId?: string;
    endpoint: string;
    timestamp: Date;
    remaining: number;
    limit: number;
    reset: Date;
    blocked: boolean;
}