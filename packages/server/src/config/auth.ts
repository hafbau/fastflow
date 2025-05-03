/**
 * Authentication Configuration
 * 
 * This file contains configuration options for the authentication system.
 */

export interface AuthConfig {
    // Supabase Auth
    supabase: {
        enabled: boolean
        // Whether to use Supabase Auth as the primary authentication method
        primary: boolean
    }
    
    // API Key Authentication
    apiKey: {
        enabled: boolean
        // Whether API keys must be associated with a Supabase user
        requireUserAssociation: boolean
        // Storage type for API keys: 'json' or 'database'
        storageType: 'json' | 'database'
    }
    
    // Basic Auth
    basicAuth: {
        enabled: boolean
        // Username and password from environment variables
        username: string | null
        password: string | null
    }
    
    // Internal Request Authentication
    internalRequest: {
        enabled: boolean
        // Whether to require authentication for internal requests
        requireAuth: boolean
    }
    
    // Feature Flags for Authentication
    featureFlags: {
        // Whether to enable the migration tools
        enableMigrationTools: boolean
        // Whether to enable the transition UI
        enableTransitionUI: boolean
    }
}

/**
 * Get authentication configuration
 * @returns {AuthConfig}
 */
export const getAuthConfig = (): AuthConfig => {
    return {
        supabase: {
            enabled: process.env.ENABLE_SUPABASE_AUTH !== 'false',
            primary: process.env.SUPABASE_AUTH_PRIMARY === 'true'
        },
        apiKey: {
            enabled: process.env.ENABLE_API_KEY_AUTH !== 'false',
            requireUserAssociation: process.env.API_KEY_REQUIRE_USER === 'true',
            storageType: (process.env.APIKEY_STORAGE_TYPE?.toLowerCase() as 'json' | 'database') || 'json'
        },
        basicAuth: {
            enabled: !!process.env.FASTFLOW_USERNAME && !!process.env.FASTFLOW_PASSWORD,
            username: process.env.FASTFLOW_USERNAME || null,
            password: process.env.FASTFLOW_PASSWORD || null
        },
        internalRequest: {
            enabled: process.env.ENABLE_INTERNAL_REQUEST !== 'false',
            requireAuth: process.env.INTERNAL_REQUEST_REQUIRE_AUTH === 'true'
        },
        featureFlags: {
            enableMigrationTools: process.env.ENABLE_AUTH_MIGRATION_TOOLS === 'true',
            enableTransitionUI: process.env.ENABLE_AUTH_TRANSITION_UI === 'true'
        }
    }
}

// Default configuration
export const authConfig = getAuthConfig()