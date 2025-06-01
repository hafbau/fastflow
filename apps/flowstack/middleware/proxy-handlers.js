/**
 * Proxy Handlers
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const { rebrandText, getCustomBranding } = require('../utils/rebranding');

/**
 * Create optimized API proxy middleware
 * @param {string} target - Target URL
 * @returns {Function} - Proxy middleware
 */
function createApiProxy(target) {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[API Proxy] ${req.method} ${req.url} -> ${target}${req.url}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`[API Proxy Response] ${proxyRes.statusCode} for ${req.url}`);
            // Set custom header
            proxyRes.headers['x-powered-by'] = 'FlowStack';
            
            // For API responses, we can safely rebrand JSON
            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                let body = '';
                const originalWrite = res.write.bind(res);
                const originalEnd = res.end.bind(res);
                
                res.write = function(chunk) {
                    if (chunk) body += chunk;
                    return true;
                };
                
                res.end = function(chunk) {
                    if (chunk) body += chunk;
                    
                    try {
                        body = rebrandText(body);
                    } catch (error) {
                        console.error('[API Proxy] Rebranding error:', error);
                    }
                    
                    originalWrite(body);
                    originalEnd();
                };
            }
        },
        onError: (err, req, res) => {
            console.error(`[API Proxy Error] ${err.message} for ${req.url}`);
            res.status(500).json({ error: 'Proxy error', message: err.message });
        }
    });
}

/**
 * Create UI proxy middleware with minimal interference
 * @param {string} target - Target URL
 * @returns {Function} - Proxy middleware
 */
function createUiProxy(target) {
    const { PORT } = require('../config');
    const proxyUrl = `http://localhost:${PORT}`;
    
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true, // Enable WebSocket support
        logLevel: 'warn', // Less verbose for UI
        onProxyReq: (proxyReq, req, res) => {
            // Log only non-asset requests
            if (!req.url.includes('.js') && !req.url.includes('.css') && !req.url.includes('.ts')) {
                console.log(`[UI Proxy] ${req.method} ${req.url}`);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'] || '';
            
            // ONLY process the main HTML document, nothing else
            // This is crucial - we don't want to mess with Vite's module loading
            if (contentType.includes('text/html') && !req.url.includes('.')) {
                let body = '';
                const originalWrite = res.write.bind(res);
                const originalEnd = res.end.bind(res);
                
                res.write = function(chunk) {
                    if (chunk) body += chunk;
                    return true;
                };
                
                res.end = function(chunk) {
                    if (chunk) body += chunk;
                    
                    // Only process if it looks like the main HTML document
                    if (body.includes('<!DOCTYPE html>') || body.includes('<!doctype html>')) {
                        console.log('[UI Proxy] Processing main HTML document');
                        
                        // Rebrand HTML content
                        body = rebrandText(body);
                        
                        // Update page title
                        body = body.replace(
                            /<title>.*?<\/title>/,
                            '<title>FlowStack - Build AI Agents, Visually</title>'
                        );
                        
                        // Inject our custom branding
                        body = body.replace('</head>', getCustomBranding(proxyUrl) + '</head>');
                    }
                    
                    originalWrite(body);
                    originalEnd();
                };
            }
            // For everything else (JS, CSS, assets), pass through unchanged
        },
        onError: (err, req, res) => {
            console.error(`[UI Proxy Error] ${err.message} for ${req.url}`);
        }
    });
}

/**
 * Create WebSocket proxy middleware
 * @param {string} target - Target URL
 * @returns {Function} - Proxy middleware
 */
function createWebSocketProxy(target) {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        ws: true,
        logLevel: 'warn',
        onProxyReqWs: (proxyReq, req, socket, options, head) => {
            proxyReq.setHeader('origin', target);
        }
    });
}

module.exports = {
    createApiProxy,
    createUiProxy,
    createWebSocketProxy
}; 