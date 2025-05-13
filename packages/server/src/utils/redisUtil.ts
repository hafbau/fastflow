import { appConfig } from '../AppConfig'

/**
 * Redis configuration interface
 */
export interface RedisConfig {
    url: string;
    enabled: boolean;
}

/**
 * Get Redis configuration
 * @returns Redis configuration or null if not configured
 */
export function getRedisConfig(): RedisConfig | null {
    if (!appConfig.redis || !appConfig.redis.url) {
        return null;
    }
    
    return {
        url: appConfig.redis.url,
        enabled: appConfig.redis.enabled !== false
    };
}

/**
 * Check if Redis is configured and enabled
 * @returns Whether Redis is available
 */
export function isRedisAvailable(): boolean {
    const config = getRedisConfig();
    return config !== null && config.enabled;
} 