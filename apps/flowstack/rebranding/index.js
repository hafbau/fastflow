/**
 * FlowStack Rebranding System
 * 
 * Production-ready rebranding implementation for enterprise clients
 * Modular, maintainable, and legally compliant
 */

const { textRebranding } = require('./modules/text-rebranding');
const { visualRebranding } = require('./modules/visual-rebranding');
const { networkRebranding } = require('./modules/network-rebranding');
const { legalAttribution } = require('./modules/legal-attribution');
const { deepRebranding } = require('./modules/deep-rebranding');

/**
 * Main rebranding configuration
 */
const REBRANDING_CONFIG = {
    // Attribution level: 'hidden', 'icon_only', 'minimal', 'subtle', 'standard'
    attributionMode: process.env.ATTRIBUTION_MODE || 'minimal',
    
    // Feature flags for enterprise deployment
    features: {
        deepNetworkMasking: true,
        consoleFiltering: true,
        storageInterception: true,
        serviceWorker: false,  // Disabled by default for stability
        routeMasking: true
    },
    
    // Performance settings
    performance: {
        cacheEnabled: true,
        cacheTTL: 3600000, // 1 hour
        lazyLoadDelay: 1000
    }
};

/**
 * Apply all rebranding strategies to Express app
 * @param {Express} app - Express application instance
 * @param {Object} options - Override default configuration
 */
function applyRebranding(app, options = {}) {
    const config = { ...REBRANDING_CONFIG, ...options };
    
    // 1. Network layer rebranding (headers, routes)
    networkRebranding.apply(app, config);
    
    // 2. Legal compliance endpoints
    legalAttribution.setupEndpoints(app, config);
    
    // 3. Deep rebranding middleware (if enabled)
    if (config.features.deepNetworkMasking) {
        deepRebranding.applyMiddleware(app, config);
    }
    
    // 4. Service worker (if enabled)
    if (config.features.serviceWorker) {
        deepRebranding.setupServiceWorker(app);
    }
    
    console.log('[FlowStack] Rebranding system initialized:', {
        attribution: config.attributionMode,
        features: Object.keys(config.features).filter(f => config.features[f])
    });
}

/**
 * Get HTML injection for client-side rebranding
 * @param {String} baseUrl - Base URL for the application
 * @param {Object} options - Override default configuration
 * @returns {String} HTML to inject into pages
 */
function getClientRebranding(baseUrl, options = {}) {
    const config = { ...REBRANDING_CONFIG, ...options };
    
    // Combine all client-side rebranding
    const parts = [
        visualRebranding.getStyles(),
        visualRebranding.getScripts(baseUrl),
        legalAttribution.getHTML(config.attributionMode),
        config.features.consoleFiltering ? deepRebranding.getConsoleFilter() : '',
        config.features.storageInterception ? deepRebranding.getStorageFilter() : ''
    ];
    
    return parts.filter(Boolean).join('\n');
}

/**
 * Process text content for rebranding
 * @param {String} text - Text to rebrand
 * @returns {String} Rebranded text
 */
function rebrandText(text) {
    return textRebranding.process(text);
}

/**
 * Health check for rebranding system
 * @returns {Object} System status
 */
function getSystemStatus() {
    return {
        status: 'operational',
        config: REBRANDING_CONFIG,
        modules: {
            text: 'active',
            visual: 'active',
            network: 'active',
            legal: 'active',
            deep: REBRANDING_CONFIG.features.deepNetworkMasking ? 'active' : 'disabled'
        },
        attribution: REBRANDING_CONFIG.attributionMode
    };
}

module.exports = {
    applyRebranding,
    getClientRebranding,
    rebrandText,
    getSystemStatus,
    config: REBRANDING_CONFIG
}; 