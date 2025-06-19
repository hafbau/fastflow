/**
 * Deep Rebranding Module
 * Advanced rebranding techniques for enterprise deployment
 */

/**
 * Apply deep rebranding middleware
 * @param {Express} app - Express application
 * @param {Object} config - Configuration options
 */
function applyMiddleware(app, config) {
    // Advanced response interception
    app.use((req, res, next) => {
        // Metadata scrubbing
        const originalWrite = res.write;
        const originalEnd = res.end;
        
        res.write = function(chunk, encoding) {
            if (chunk && typeof chunk === 'string') {
                // Remove HTML comments with Flowise references
                chunk = chunk.replace(/<!--[\s\S]*?flowise[\s\S]*?-->/gi, '');
            }
            return originalWrite.call(this, chunk, encoding);
        };
        
        res.end = function(chunk, encoding) {
            if (chunk && typeof chunk === 'string') {
                // Remove meta tags that might reference Flowise
                chunk = chunk
                    .replace(/<meta[^>]*name="author"[^>]*content="[^"]*flowise[^"]*"[^>]*>/gi, '')
                    .replace(/<meta[^>]*name="generator"[^>]*content="[^"]*flowise[^"]*"[^>]*>/gi, '');
            }
            return originalEnd.call(this, chunk, encoding);
        };
        
        next();
    });
}

/**
 * Get console filtering script
 * @returns {String} JavaScript code
 */
function getConsoleFilter() {
    return `
    <script>
        // Console log filtering
        (function() {
            const originalLog = console.log;
            const originalWarn = console.warn;
            const originalError = console.error;
            
            const filterText = (text) => {
                if (typeof text === 'string') {
                    return text
                        .replace(/flowise/gi, 'flowstack')
                        .replace(/FlowiseAI/g, 'FlowStack');
                }
                return text;
            };
            
            console.log = function(...args) {
                originalLog.apply(console, args.map(filterText));
            };
            
            console.warn = function(...args) {
                originalWarn.apply(console, args.map(filterText));
            };
            
            console.error = function(...args) {
                originalError.apply(console, args.map(filterText));
            };
        })();
    </script>`;
}

/**
 * Get storage filtering script
 * @returns {String} JavaScript code
 */
function getStorageFilter() {
    return `
    <script>
        // Storage sanitization
        (function() {
            const originalSetItem = Storage.prototype.setItem;
            const originalGetItem = Storage.prototype.getItem;
            
            Storage.prototype.setItem = function(key, value) {
                const sanitizedKey = key.replace(/flowise/gi, 'flowstack');
                const sanitizedValue = typeof value === 'string' 
                    ? value.replace(/flowise/gi, 'flowstack') 
                    : value;
                return originalSetItem.call(this, sanitizedKey, sanitizedValue);
            };
            
            Storage.prototype.getItem = function(key) {
                const sanitizedKey = key.replace(/flowise/gi, 'flowstack');
                const value = originalGetItem.call(this, sanitizedKey);
                return value ? value.replace(/flowise/gi, 'flowstack') : value;
            };
        })();
    </script>`;
}

/**
 * Setup service worker endpoint
 * @param {Express} app - Express application
 */
function setupServiceWorker(app) {
    app.get('/flowstack-sw.js', (req, res) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.send(`
// FlowStack Service Worker
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then(response => {
            // Only process text/html and application/json
            const contentType = response.headers.get('content-type');
            if (!contentType || (!contentType.includes('text') && !contentType.includes('json'))) {
                return response;
            }
            
            return response.text().then(text => {
                const modifiedText = text
                    .replace(/flowise/gi, 'flowstack')
                    .replace(/FlowiseAI/g, 'FlowStack');
                
                return new Response(modifiedText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers
                });
            });
        })
    );
});`);
    });
}

module.exports = {
    deepRebranding: {
        applyMiddleware,
        getConsoleFilter,
        getStorageFilter,
        setupServiceWorker
    }
}; 