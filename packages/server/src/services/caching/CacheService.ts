import { RedisClientType, createClient } from 'redis'
import LRUCache from 'lru-cache'
import { appConfig } from '../../AppConfig'
import logger from '../../utils/logger'

/**
 * Cache options interface
 */
interface CacheOptions {
    /** TTL in seconds for in-memory cache */
    memoryTtl?: number;
    /** TTL in seconds for Redis cache */
    redisTtl?: number;
    /** Max number of items in memory cache */
    memoryMaxItems?: number;
    /** Whether to use Redis as L2 cache */
    useRedis?: boolean;
}

/**
 * Default cache options
 */
const DEFAULT_OPTIONS: CacheOptions = {
    memoryTtl: 300, // 5 minutes
    redisTtl: 1800, // 30 minutes
    memoryMaxItems: 1000,
    useRedis: appConfig.redis && appConfig.redis.enabled
}

/**
 * Cache service for multi-level caching
 * Provides a unified caching layer with memory (LRU) and Redis backends
 */
class CacheService {
    /** In-memory LRU cache */
    private memoryCache: any;
    /** Redis client */
    private redisClient: RedisClientType | null = null;
    /** Whether Redis is connected */
    private redisConnected: boolean = false;
    /** Default cache options */
    private defaultOptions: CacheOptions;

    /**
     * Constructor
     * @param options Cache options
     */
    constructor(options: CacheOptions = {}) {
        this.defaultOptions = { ...DEFAULT_OPTIONS, ...options };
        
        // Initialize in-memory cache
        this.memoryCache = new (LRUCache as any)({
            max: this.defaultOptions.memoryMaxItems,
            ttl: this.defaultOptions.memoryTtl! * 1000 // Convert to milliseconds
        });
        
        // Initialize Redis client if enabled
        if (this.defaultOptions.useRedis) {
            this.initRedis();
        }
    }

    /**
     * Initialize Redis client
     */
    private async initRedis(): Promise<void> {
        try {
            if (!appConfig.redis || !appConfig.redis.url) {
                logger.warn('[CacheService] Redis URL not configured, disabling Redis cache');
                return;
            }
            
            this.redisClient = createClient({
                url: appConfig.redis.url
            });
            
            this.redisClient.on('error', (err) => {
                logger.error(`[CacheService] Redis error: ${err}`);
                this.redisConnected = false;
            });
            
            this.redisClient.on('connect', () => {
                logger.info('[CacheService] Redis connected');
                this.redisConnected = true;
            });
            
            await this.redisClient.connect();
        } catch (error) {
            logger.error(`[CacheService] Failed to initialize Redis: ${error}`);
            this.redisClient = null;
        }
    }

    /**
     * Get value from cache
     * 
     * @param key Cache key
     * @param options Cache options for this operation
     * @returns Cached value or null if not found
     */
    async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
        const opts = { ...this.defaultOptions, ...options };
        
        // Try memory cache first
        const memoryValue = this.memoryCache.get(key) as T | undefined;
        if (memoryValue !== undefined) {
            return memoryValue;
        }
        
        // Try Redis if available
        if (opts.useRedis && this.redisClient && this.redisConnected) {
            try {
                const redisValue = await this.redisClient.get(key);
                if (redisValue) {
                    const value = JSON.parse(redisValue) as T;
                    
                    // Populate memory cache
                    this.memoryCache.set(key, value);
                    return value;
                }
            } catch (error) {
                logger.error(`[CacheService] Redis get error for key ${key}: ${error}`);
            }
        }
        
        return null;
    }

    /**
     * Set value in cache
     * 
     * @param key Cache key
     * @param value Value to cache
     * @param options Cache options for this operation
     */
    async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
        const opts = { ...this.defaultOptions, ...options };
        
        // Set in memory cache
        this.memoryCache.set(key, value, {
            ttl: opts.memoryTtl! * 1000 // Convert to milliseconds
        });
        
        // Set in Redis if available
        if (opts.useRedis && this.redisClient && this.redisConnected) {
            try {
                const serializedValue = JSON.stringify(value);
                await this.redisClient.set(key, serializedValue, {
                    EX: opts.redisTtl
                });
            } catch (error) {
                logger.error(`[CacheService] Redis set error for key ${key}: ${error}`);
            }
        }
    }

    /**
     * Delete value from cache
     * 
     * @param key Cache key
     */
    async delete(key: string): Promise<void> {
        // Delete from memory cache
        this.memoryCache.delete(key);
        
        // Delete from Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                await this.redisClient.del(key);
            } catch (error) {
                logger.error(`[CacheService] Redis delete error for key ${key}: ${error}`);
            }
        }
    }

    /**
     * Delete multiple values from cache based on pattern
     * 
     * @param pattern Key pattern (e.g., "user:*:permissions")
     */
    async deletePattern(pattern: string): Promise<void> {
        // Delete from memory cache using iterable entries
        for (const key of this.memoryCache.keys()) {
            if (this.matchesPattern(key, pattern)) {
                this.memoryCache.delete(key);
            }
        }
        
        // Delete from Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                const keys = await this.redisClient.keys(pattern);
                if (keys.length > 0) {
                    await this.redisClient.del(keys);
                }
            } catch (error) {
                logger.error(`[CacheService] Redis delete pattern error for pattern ${pattern}: ${error}`);
            }
        }
    }

    /**
     * Check if key matches pattern
     * Simple pattern matching supporting only * wildcard
     * 
     * @param key Cache key
     * @param pattern Pattern with * wildcards
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
     * Clear entire cache
     */
    async clear(): Promise<void> {
        // Clear memory cache
        this.memoryCache.clear();
        
        // Clear Redis if available
        if (this.redisClient && this.redisConnected) {
            try {
                await this.redisClient.flushDb();
            } catch (error) {
                logger.error(`[CacheService] Redis flush error: ${error}`);
            }
        }
    }

    /**
     * Close connections
     */
    async close(): Promise<void> {
        if (this.redisClient && this.redisConnected) {
            await this.redisClient.quit();
            this.redisConnected = false;
        }
    }
}

// Create a singleton instance
const cacheService = new CacheService();
export default cacheService;

// Export the class for direct instantiation if needed
export { CacheService, CacheOptions }; 