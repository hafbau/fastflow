/**
 * Services Factory
 * 
 * This module provides factory functions for creating services with proper initialization.
 * It ensures TypeORM connections are properly initialized before services are used.
 */

import { getInitializedDataSource } from '../DataSource'
import logger from '../utils/logger'

// Cache for singleton services
const serviceInstances = new Map<string, any>()

/**
 * Factory function to create a service instance
 * @param ServiceClass - The service class to instantiate
 * @param singleton - Whether to cache the service instance (default: true)
 * @returns A promise that resolves to the service instance
 */
export async function createService<T>(ServiceClass: new (...args: any[]) => T, singleton: boolean = true): Promise<T> {
    const serviceName = ServiceClass.name
    
    // Return cached instance if it exists and singleton is true
    if (singleton && serviceInstances.has(serviceName)) {
        return serviceInstances.get(serviceName)
    }
    
    try {
        // Ensure data source is initialized before creating the service
        const dataSource = await getInitializedDataSource()
        
        // Create the service instance
        const instance = new ServiceClass()
        
        // Cache the instance if singleton is true
        if (singleton) {
            serviceInstances.set(serviceName, instance)
        }
        
        // Initialize the service if it has an init method
        if (typeof (instance as any).init === 'function') {
            await (instance as any).init(dataSource)
        }
        
        return instance
    } catch (error) {
        logger.error(`Failed to create service ${serviceName}:`, error)
        throw error
    }
}

/**
 * Clears the service instance cache
 * Useful for testing or when reinitializing the application
 */
export function clearServiceCache(): void {
    serviceInstances.clear()
}