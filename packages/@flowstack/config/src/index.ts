/**
 * FlowStack Configuration
 * 
 * This module will extend and override core configuration.
 * For now, it's a placeholder that will be populated as you add customizations.
 */

export const config = {
    // Brand configuration
    brand: {
        name: 'FlowStack',
        tagline: 'Your AI Flow Automation Platform',
        logo: '/assets/flowstack-logo.png'
    },
    
    // Feature flags
    features: {
        // Add your custom feature flags here
        customDashboard: false,
        advancedAnalytics: false,
        teamCollaboration: false
    },
    
    // API configuration overrides
    api: {
        // Custom API endpoints or overrides
    },
    
    // UI configuration
    ui: {
        theme: 'light',
        primaryColor: '#6366f1',
        // Add more UI customizations
    }
};

export default config; 