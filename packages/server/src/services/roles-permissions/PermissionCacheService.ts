
import Redis from 'ioredis'
import logger from '../../utils/logger'
import { getRedisConfig } from '../../utils/redisUtil'

/**
 * Permission cache service
 * 
 * Provides caching for permission checks with memory LRU cache and optional Redis
 * second-level cache for distributed deployments.
 */
class PermissionCacheService {
    private memoryCache: Map<string, any>;
    private memoryCacheTTL: Map<string, number>;
    private redisClient: any = null;
    private redisConnected: boolean = false;
    private maxCacheSize: number;
    private defaultTTL: number;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(maxSize = 1000, ttlSeconds = 300) {
        this.memoryCache = new Map();
        this.memoryCacheTTL = new Map();
        this.maxCacheSize = maxSize;
        this.defaultTTL = ttlSeconds * 1000; // Convert to milliseconds
        
        // Set up cache cleanup interval
        this.setupCleanupInterval();
        
        // Try to initialize Redis
        this.initRedis();
    }

    /**
     * Initialize Redis client if Redis is configured
     */
    private async initRedis(): Promise<void> {
        try {
            const redisConfig = getRedisConfig();
            console.log('redisConfig', redisConfig);
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
                
            this.redisClient.on('error', (err: Error) => {
                logger.error(`[PermissionCacheService] Redis error: ${err}`);
                this.redisConnected = false;
            });
            
            this.redisClient.on('connect', () => {
                logger.info('[PermissionCacheService] Redis connected');
                this.redisConnected = true;
            });
            
            await this.redisClient.connect();
        } catch (error) {
            logger.error(`[PermissionCacheService] Failed to initialize Redis: ${error}`);
            this.redisClient = null;
        }
    }

    /**
     * Set up interval to clean expired cache entries
     */
    private setupCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            const now = Date.now();
            for (const [key, expiry] of this.memoryCacheTTL.entries()) {
                if (expiry <= now) {
                    this.memoryCache.delete(key);
                    this.memoryCacheTTL.delete(key);
                }
            }
        }, 60000); // Clean up every minute
    }

    /**
     * Get permission result from cache
     * @param userId User ID
     * @param resourceType Resource type
     * @param resourceId Resource ID
     * @param action Permission action
     * @returns Cached permission result or null if not in cache
     */
    async getPermission(
        userId: string,
        resourceType: string,
        resourceId: string | null,
        action: string
    ): Promise<boolean | null> {
        const key = this.generateCacheKey(userId, resourceType, resourceId, action);
        
        // Try memory cache first
        if (this.memoryCache.has(key)) {
            const expiry = this.memoryCacheTTL.get(key) || 0;
            if (expiry > Date.now()) {
                return this.memoryCache.get(key);
            } else {
                // Clear expired entry
                this.memoryCache.delete(key);
                this.memoryCacheTTL.delete(key);
            }
        }
        
        // Try Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                const value = await this.redisClient.get(key);
                if (value !== null) {
                    const result = value === 'true';
                    
                    // Update memory cache
                    this.setMemoryCache(key, result);
                    
                    return result;
                }
            } catch (error) {
                logger.error(`[PermissionCacheService] Redis get error: ${error}`);
                console.error('Redis get error', error);
            }
        }
        
        return null;
    }

    /**
     * Cache permission result
     * @param userId User ID
     * @param resourceType Resource type
     * @param resourceId Resource ID
     * @param action Permission action
     * @param result Permission result
     * @param ttlSeconds TTL in seconds (optional)
     */
    async cachePermission(
        userId: string,
        resourceType: string,
        resourceId: string | null,
        action: string,
        result: boolean,
        ttlSeconds?: number
    ): Promise<void> {
        const key = this.generateCacheKey(userId, resourceType, resourceId, action);
        
        // Set in memory cache
        this.setMemoryCache(key, result, ttlSeconds);
        
        // Set in Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                await this.redisClient.set(key, result.toString(), {
                    EX: ttlSeconds || Math.floor(this.defaultTTL / 1000)
                });
            } catch (error) {
                logger.error(`[PermissionCacheService] Redis set error: ${error}`);
            }
        }
    }

    /**
     * Store value in memory cache
     */
    private setMemoryCache(key: string, value: any, ttlSeconds?: number): void {
        // Check if we need to clean up to stay within size limit
        if (this.memoryCache.size >= this.maxCacheSize) {
            // Get the oldest entry by finding the lowest TTL
            let oldestKey: string | null = null;
            let oldestTime = Infinity;
            
            for (const [k, expiry] of this.memoryCacheTTL.entries()) {
                if (expiry < oldestTime) {
                    oldestTime = expiry;
                    oldestKey = k;
                }
            }
            
            if (oldestKey) {
                this.memoryCache.delete(oldestKey);
                this.memoryCacheTTL.delete(oldestKey);
            }
        }
        
        // Set the value in cache with expiry
        const ttlMs = (ttlSeconds || this.defaultTTL / 1000) * 1000;
        const expiry = Date.now() + ttlMs;
        
        this.memoryCache.set(key, value);
        this.memoryCacheTTL.set(key, expiry);
    }

    /**
     * Generate cache key for permission check
     */
    private generateCacheKey(
        userId: string,
        resourceType: string,
        resourceId: string | null,
        action: string
    ): string {
        return `perm:${userId}:${resourceType}:${resourceId || '*'}:${action}`;
    }

    /**
     * Invalidate all permissions for a user
     */
    async invalidateUserPermissions(userId: string): Promise<void> {
        // Clear from memory cache
        const pattern = `perm:${userId}:*`;
        for (const key of this.memoryCache.keys()) {
            if (this.matchesPattern(key, pattern)) {
                this.memoryCache.delete(key);
                this.memoryCacheTTL.delete(key);
            }
        }
        
        // Clear from Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(keys);
                }
            } catch (error) {
                logger.error(`[PermissionCacheService] Redis delete pattern error: ${error}`);
            }
        }
    }

    /**
     * Invalidate permissions for a specific resource
     */
    async invalidateResourcePermissions(
        resourceType: string,
        resourceId: string
    ): Promise<void> {
        // Clear from memory cache
        const pattern = `perm:*:${resourceType}:${resourceId}:*`;
        for (const key of this.memoryCache.keys()) {
            if (this.matchesPattern(key, pattern)) {
                this.memoryCache.delete(key);
                this.memoryCacheTTL.delete(key);
            }
        }
        
        // Clear from Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(keys);
                }
            } catch (error) {
                logger.error(`[PermissionCacheService] Redis delete pattern error: ${error}`);
            }
        }
    }

    /**
     * Check if key matches pattern
     * Simple pattern matching supporting only * wildcard
     */
    private matchesPattern(key: string, pattern: string): boolean {
        // Convert the pattern to a regex
        const regexPattern = pattern
            .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape regex special chars except *
            .replace(/\*/g, '.*'); // Convert * to regex .*
        
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(key);
    }

    /**
     * Clear the entire cache
     */
    async clearAll(): Promise<void> {
        // Clear memory cache
        this.memoryCache.clear();
        this.memoryCacheTTL.clear();
        
        // Clear Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                await this.redisClient.del(await this.redisClient.keys('perm:*'));
            } catch (error) {
                logger.error(`[PermissionCacheService] Redis clear error: ${error}`);
            }
        }
    }

    /**
     * Clean up resources
     */
    async close(): Promise<void> {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        if (this.redisClient && this.redisConnected) {
            await this.redisClient.quit();
            this.redisConnected = false;
        }
    }
}

// Create singleton instance
const permissionCacheService = new PermissionCacheService();
export default permissionCacheService; 