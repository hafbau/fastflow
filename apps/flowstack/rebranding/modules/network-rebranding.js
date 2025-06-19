/**
 * Network Rebranding Module
 * Handles HTTP headers, routes, and network-level modifications
 */

const { textRebranding } = require('./text-rebranding');

// Route mappings to mask Flowise-specific endpoints
const ROUTE_MAPPINGS = {
    '/api/v1/chatflows': '/api/v1/workflows',
    '/api/v1/prediction': '/api/v1/execute',
    '/api/v1/chatflows-streaming': '/api/v1/workflows-streaming',
    '/api/v1/node-icon': '/api/v1/component-icon',
    '/api/v1/chatflows-pool': '/api/v1/workflows-pool'
};

/**
 * Apply network rebranding to Express app
 * @param {Express} app - Express application
 * @param {Object} config - Configuration options
 */
function apply(app, config) {
    // 1. Header modification middleware
    app.use((req, res, next) => {
        // Modify request headers
        if (config.features.routeMasking) {
            const originalUrl = req.url;
            for (const [flowise, flowstack] of Object.entries(ROUTE_MAPPINGS)) {
                if (req.url.includes(flowise)) {
                    req.url = req.url.replace(flowise, flowstack);
                    req.originalUrl = req.originalUrl.replace(flowise, flowstack);
                }
            }
        }
        
        // Override response headers
        const originalSetHeader = res.setHeader;
        res.setHeader = function(name, value) {
            // Remove telltale headers
            if (name.toLowerCase() === 'x-powered-by') {
                return originalSetHeader.call(this, name, 'FlowStack Platform');
            }
            if (name.toLowerCase() === 'server') {
                return originalSetHeader.call(this, name, 'FlowStack/1.0');
            }
            return originalSetHeader.call(this, name, value);
        };
        
        // Add custom headers
        res.setHeader('X-Platform', 'FlowStack Enterprise');
        
        next();
    });
    
    // 2. Response modification middleware
    app.use((req, res, next) => {
        const originalJson = res.json;
        const originalSend = res.send;
        
        // Intercept JSON responses
        res.json = function(data) {
            const processed = textRebranding.processJSON(data);
            return originalJson.call(this, processed);
        };
        
        // Intercept text responses
        res.send = function(data) {
            if (typeof data === 'string') {
                data = textRebranding.process(data);
            }
            return originalSend.call(this, data);
        };
        
        next();
    });
}

/**
 * Get route mappings for external use
 * @returns {Object} Route mappings
 */
function getRouteMappings() {
    return { ...ROUTE_MAPPINGS };
}

/**
 * Create a route reversal function for responses
 * @param {String} url - URL to reverse
 * @returns {String} Original URL
 */
function reverseRoute(url) {
    let result = url;
    for (const [flowise, flowstack] of Object.entries(ROUTE_MAPPINGS)) {
        if (result.includes(flowstack)) {
            result = result.replace(flowstack, flowise);
        }
    }
    return result;
}

/**
 * Apply forward route mapping to text content (Core → FlowStack)
 * This ensures URLs in content match the FlowStack routes
 * @param {String} text - Text content to process
 * @returns {String} Text with mapped routes
 */
function applyRouteMapping(text) {
    if (!text || typeof text !== 'string') return text;
    
    let result = text;
    for (const [flowise, flowstack] of Object.entries(ROUTE_MAPPINGS)) {
        // Use regex to ensure we only replace API routes, not random text
        const regex = new RegExp(`(["'/])(${flowise.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
        result = result.replace(regex, `$1${flowstack}`);
    }
    return result;
}

module.exports = {
    networkRebranding: {
        apply,
        getRouteMappings,
        reverseRoute,
        applyRouteMapping
    }
}; 