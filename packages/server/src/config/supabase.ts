/**
 * Supabase configuration for different environments
 */

export interface SupabaseConfig {
    url: string
    anonKey: string
    serviceRoleKey: string
}

/**
 * Get Supabase configuration for the current environment
 * @returns {SupabaseConfig}
 */
export const getSupabaseConfig = (): SupabaseConfig => {
    return {
        url: process.env.SUPABASE_URL || '',
        anonKey: process.env.SUPABASE_ANON_KEY || '',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    }
}

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
export const isSupabaseConfigured = (): boolean => {
    const config = getSupabaseConfig()
    return !!(config.url && config.anonKey)
}

/**
 * Development environment configuration
 */
export const devConfig: SupabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

/**
 * Test environment configuration
 */
export const testConfig: SupabaseConfig = {
    url: process.env.TEST_SUPABASE_URL || process.env.SUPABASE_URL || '',
    anonKey: process.env.TEST_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

/**
 * Production environment configuration
 */
export const prodConfig: SupabaseConfig = {
    url: process.env.PROD_SUPABASE_URL || process.env.SUPABASE_URL || '',
    anonKey: process.env.PROD_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
}

/**
 * Get configuration for a specific environment
 * @param {string} env - Environment name (dev, test, prod)
 * @returns {SupabaseConfig}
 */
export const getConfigForEnvironment = (env: string): SupabaseConfig => {
    switch (env.toLowerCase()) {
        case 'dev':
        case 'development':
            return devConfig
        case 'test':
        case 'testing':
            return testConfig
        case 'prod':
        case 'production':
            return prodConfig
        default:
            return devConfig
    }
}