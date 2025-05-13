import { Request, Response, NextFunction } from 'express'
import { rateLimit, RateLimitRequestHandler } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import Redis from 'ioredis'
import { Mutex } from 'async-mutex'
import { RateLimitInfo, RateLimitOptions } from '../../interfaces/RateLimit'
import { isTrustedService, getRateLimitConfig } from '../../config/rateLimit'
import logger from '../../utils/logger'

/**
 * Rate Limiter Service
 * Provides rate limiting functionality using Redis for distributed rate limiting
 */
export class RateLimitService {
    private static instance: RateLimitService
    private redisClient: Redis
    private rateLimiters: Map<string, RateLimitRequestHandler> = new Map()
    private mutex: Mutex = new Mutex()
    private rateLimitEvents: RateLimitInfo[] = []
    private eventFlushInterval: NodeJS.Timeout | null = null
    private rateLimitStats: {
        totalRequests: number;
        blockedRequests: number;
        endpointStats: Record<string, {
            total: number;
            blocked: number;
        }>;
        ipStats: Record<string, {
            total: number;
            blocked: number;
        }>;
    } = {
        totalRequests: 0,
        blockedRequests: 0,
        endpointStats: {},
        ipStats: {}
    }

    /**
     * Constructor
     */
    private constructor() {
        // Initialize Redis client
        if (process.env.REDIS_URL) {
            this.redisClient = new Redis(process.env.REDIS_URL)
        } else {
            this.redisClient = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
                username: process.env.REDIS_USERNAME || undefined,
                password: process.env.REDIS_PASSWORD || undefined,
                tls:
                    process.env.REDIS_TLS === 'true'
                        ? {
                              cert: process.env.REDIS_CERT ? Buffer.from(process.env.REDIS_CERT, 'base64') : undefined,
                              key: process.env.REDIS_KEY ? Buffer.from(process.env.REDIS_KEY, 'base64') : undefined,
                              ca: process.env.REDIS_CA ? Buffer.from(process.env.REDIS_CA, 'base64') : undefined
                          }
                        : undefined
            })
        }

        // Set up event flush interval (every 5 minutes)
        this.eventFlushInterval = setInterval(() => this.flushEvents(), 5 * 60 * 1000)
    }

    /**
     * Get singleton instance
     * @returns RateLimitService instance
     */
    public static getInstance(): RateLimitService {
        if (!RateLimitService.instance) {
            RateLimitService.instance = new RateLimitService()
        }
        return RateLimitService.instance
    }

    /**
     * Create a rate limiter for a specific endpoint
     * @param key Unique key for the rate limiter
     * @param options Rate limit options
     * @returns Rate limiter middleware
     */
    private async createRateLimiter(key: string, options: RateLimitOptions): Promise<RateLimitRequestHandler> {
        const release = await this.mutex.acquire()
        try {
            // Create Redis store for distributed rate limiting
            const store = new RedisStore({
                prefix: `rl:${key}:`,
                // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
                sendCommand: (...args: string[]) => this.redisClient.call(...args),
                // Implement sliding window algorithm with Redis
                resetExpiryOnChange: true,
                // Add some expiry buffer to handle clock drift between nodes
                expiry: Math.ceil(options.windowMs / 1000) + 10
            })

            // Create rate limiter with the provided options
            const limiter = rateLimit({
                windowMs: options.windowMs,
                max: options.max,
                message: options.message,
                // standardHeaders: options.standardHeaders || 'draft-6',
                standardHeaders: 'draft-6',
                legacyHeaders: options.legacyHeaders,
                store,
                // Skip rate limiting for trusted services
                skip: (req) => isTrustedService(req.ip || ''),
                // Handle rate limit info for monitoring and analytics
                handler: (req, res, next, options) => {
                    const info = {
                        ip: req.ip || 'unknown',
                        userId: (req as any).user?.id,
                        endpoint: req.originalUrl,
                        timestamp: new Date(),
                        remaining: 0,
                        limit: options.max as number,
                        reset: new Date(Date.now() + options.windowMs),
                        blocked: true
                    };
                    this.recordRateLimitEvent(info)
                    res.status(429).send(options.message)
                },
                // Track successful requests for analytics
                // onLimitReached: (req, res, options) => {
                //     logger.warn(`Rate limit reached for ${req.ip} on ${req.originalUrl}`)
                // },
                // Add custom headers for more detailed rate limit info
                keyGenerator: (req) => {
                    // Use user ID if available, otherwise use IP
                    return (req as any).user?.id || req.ip
                },
                // Add custom headers for more detailed rate limit info
                // draft_polli_ratelimit_headers: true
            })

            // Store the limiter for future use
            this.rateLimiters.set(key, limiter)
            return limiter
        } finally {
            release()
        }
    }

    /**
     * Get a rate limiter for a specific endpoint
     * @param type Endpoint type (auth, apiKey, api)
     * @param subtype Endpoint subtype (register, resetPassword, create, verify, etc.)
     * @param role User role (default, admin)
     * @returns Rate limiter middleware
     */
    public async getRateLimiter(
        type: string,
        subtype: string,
        role: string = 'default'
    ): Promise<RateLimitRequestHandler> {
        const key = `${type}:${subtype}:${role}`

        // Return existing rate limiter if available
        if (this.rateLimiters.has(key)) {
            return this.rateLimiters.get(key)!
        }

        // Get rate limit configuration
        const config = getRateLimitConfig(type as any, subtype, role)

        // Create new rate limiter
        return this.createRateLimiter(key, config)
    }

    /**
     * Record a rate limit event for monitoring and analytics
     * @param info Rate limit info
     */
    public recordRateLimitEvent(info: RateLimitInfo): void {
        this.rateLimitEvents.push(info)

        // Update statistics
        this.rateLimitStats.totalRequests++
        
        if (info.blocked) {
            this.rateLimitStats.blockedRequests++
        }
        
        // Update endpoint stats
        if (!this.rateLimitStats.endpointStats[info.endpoint]) {
            this.rateLimitStats.endpointStats[info.endpoint] = {
                total: 0,
                blocked: 0
            }
        }
        this.rateLimitStats.endpointStats[info.endpoint].total++
        if (info.blocked) {
            this.rateLimitStats.endpointStats[info.endpoint].blocked++
        }
        
        // Update IP stats
        if (!this.rateLimitStats.ipStats[info.ip]) {
            this.rateLimitStats.ipStats[info.ip] = {
                total: 0,
                blocked: 0
            }
        }
        this.rateLimitStats.ipStats[info.ip].total++
        if (info.blocked) {
            this.rateLimitStats.ipStats[info.ip].blocked++
        }

        // Flush events if there are too many
        if (this.rateLimitEvents.length > 1000) {
            this.flushEvents()
        }
    }

    /**
     * Flush rate limit events to storage
     */
    private flushEvents(): void {
        if (this.rateLimitEvents.length === 0) {
            return
        }

        // Log rate limit events
        logger.info(`Flushing ${this.rateLimitEvents.length} rate limit events`)

        // TODO: Store events in database or send to monitoring service
        // For now, just log blocked requests
        const blockedEvents = this.rateLimitEvents.filter((event) => event.blocked)
        if (blockedEvents.length > 0) {
            logger.warn(`${blockedEvents.length} requests were blocked by rate limiting`)
        }

        // Clear events
        this.rateLimitEvents = []
    }

    /**
     * Create middleware for rate limiting authentication endpoints
     * @param subtype Authentication endpoint subtype (register, resetPassword)
     * @returns Rate limiter middleware
     */
    public async authRateLimiter(subtype: string): Promise<(req: Request, res: Response, next: NextFunction) => void> {
        const limiter = await this.getRateLimiter('auth', subtype)
        return limiter
    }

    /**
     * Create middleware for rate limiting API key endpoints
     * @param subtype API key endpoint subtype (create, verify)
     * @returns Rate limiter middleware
     */
    public async apiKeyRateLimiter(
        subtype: string
    ): Promise<(req: Request, res: Response, next: NextFunction) => void> {
        const limiter = await this.getRateLimiter('apiKey', subtype)
        return limiter
    }

    /**
     * Create middleware for rate limiting API endpoints
     * @param subtype API endpoint subtype (default, read, write)
     * @returns Rate limiter middleware
     */
    public async apiRateLimiter(
        subtype: string = 'default'
    ): Promise<(req: Request, res: Response, next: NextFunction) => void> {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Determine user role
            const role = (req as any).user?.role || 'default'

            // Get appropriate rate limiter based on role
            const limiter = await this.getRateLimiter('api', subtype, role)
            return limiter(req, res, next)
        }
    }

    /**
     * Create middleware for dynamic rate limiting based on request properties
     * @returns Rate limiter middleware
     */
    public dynamicRateLimiter(): (req: Request, res: Response, next: NextFunction) => void {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Skip rate limiting for trusted services
            if (isTrustedService(req.ip || '')) {
                return next()
            }

            // Determine endpoint type and subtype
            let type = 'api'
            let subtype = 'default'
            let role = (req as any).user?.role || 'default'

            // Check if it's an authentication endpoint
            if (req.path.startsWith('/users/register')) {
                type = 'auth'
                subtype = 'register'
            } else if (req.path.startsWith('/users/reset-password')) {
                type = 'auth'
                subtype = 'resetPassword'
            }
            // Check if it's an API key endpoint
            else if (req.path.startsWith('/apikey') && req.method === 'POST') {
                type = 'apiKey'
                subtype = 'create'
            } else if (req.path.startsWith('/verify/apikey')) {
                type = 'apiKey'
                subtype = 'verify'
            }
            // For other API endpoints, determine if it's a read or write operation
            else if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
                subtype = 'read'
            } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
                subtype = 'write'
            }

            // Get appropriate rate limiter
            const limiter = await this.getRateLimiter(type, subtype, role)
            return limiter(req, res, next)
        }
    }

    /**
     * Clean up resources
     */
    /**
     * Get rate limiting statistics
     * @returns Rate limiting statistics
     */
    public async getRateLimitStats(): Promise<any> {
        return {
            ...this.rateLimitStats,
            // Add top 10 most blocked IPs
            topBlockedIPs: Object.entries(this.rateLimitStats.ipStats)
                .sort((a, b) => b[1].blocked - a[1].blocked)
                .slice(0, 10)
                .map(([ip, stats]) => ({ ip, ...stats })),
            // Add top 10 most blocked endpoints
            topBlockedEndpoints: Object.entries(this.rateLimitStats.endpointStats)
                .sort((a, b) => b[1].blocked - a[1].blocked)
                .slice(0, 10)
                .map(([endpoint, stats]) => ({ endpoint, ...stats }))
        }
    }

    /**
     * Get rate limiting events
     * @param limit Maximum number of events to return
     * @returns Rate limiting events
     */
    public async getRateLimitEvents(limit: number = 100): Promise<RateLimitInfo[]> {
        // Return the most recent events
        return this.rateLimitEvents
            .slice(-limit)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    /**
     * Clear rate limiting events
     */
    public async clearRateLimitEvents(): Promise<void> {
        this.rateLimitEvents = []
    }

    /**
     * Clean up resources
     */
    public async cleanup(): Promise<void> {
        if (this.eventFlushInterval) {
            clearInterval(this.eventFlushInterval)
            this.eventFlushInterval = null
        }

        await this.flushEvents()

        if (this.redisClient) {
            await this.redisClient.quit()
        }
    }
}

// Export singleton instance
export default RateLimitService.getInstance()