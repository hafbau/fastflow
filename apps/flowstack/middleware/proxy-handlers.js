/**
 * Proxy Handlers
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const { getClientRebranding, rebrandText } = require('../rebranding');
const { networkRebranding } = require('../rebranding/modules/network-rebranding');

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
        selfHandleResponse: true, // We need this to properly handle the response
        onProxyReq: (proxyReq, req, res) => {
            // Reverse route mapping for core compatibility
            const originalUrl = req.url;
            req.url = networkRebranding.reverseRoute(req.url);
            
            console.log(`[API Proxy] ${req.method} ${originalUrl} -> ${target}${req.url}`);
            
            // Fix body parsing for POST/PUT requests
            if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
                const bodyData = JSON.stringify(req.body);
                proxyReq.setHeader('Content-Type', 'application/json');
                proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
                proxyReq.write(bodyData);
            }
            
            // Update the proxy path with the reversed route
            proxyReq.path = req.url;
        },
        onProxyRes: (proxyRes, req, res) => {
            console.log(`[API Proxy Response] ${proxyRes.statusCode} for ${req.url}`);
            
            // Copy all headers first, but exclude content-length as we might modify the body
            Object.keys(proxyRes.headers).forEach((key) => {
                if (key.toLowerCase() !== 'content-length') {
                    res.setHeader(key, proxyRes.headers[key]);
                }
            });
            
            // Headers are now handled by network-rebranding module
            
            // List of API endpoints that should not be rebranded (data integrity)
            const noRebrandEndpoints = [
                '/api/v1/marketplaces',
                '/api/v1/nodes',
                '/api/v1/chatflows',  // Core endpoint name
                '/api/v1/prediction',  // Core endpoint for execute
                '/api/v1/chatflows-streaming',
                '/api/v1/chatflows-pool',
                '/api/v1/node-icon',
                '/api/v1/templates',
                '/api/v1/tools',
                '/api/v1/workspaceuser',
                '/api/v1/organizationuser',
                '/api/v1/user'
            ];
            
            // Check if this endpoint should skip rebranding
            const shouldSkipRebrand = noRebrandEndpoints.some(endpoint => 
                req.url.includes(endpoint)
            );
            
            // For API responses, we can safely rebrand JSON (with exceptions)
            const contentType = proxyRes.headers['content-type'] || '';
            if (contentType.includes('application/json')) {
                const chunks = [];
                
                proxyRes.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                proxyRes.on('end', () => {
                    let body = Buffer.concat(chunks).toString('utf8');
                    
                    // Add debug logging for workspaceuser endpoint
                    if (req.url.includes('workspaceuser')) {
                        console.log(`[API Proxy Debug] workspaceuser endpoint response:`, body.substring(0, 200));
                        console.log(`[API Proxy Debug] shouldSkipRebrand:`, shouldSkipRebrand);
                        try {
                            const parsed = JSON.parse(body);
                            console.log(`[API Proxy Debug] Response type:`, Array.isArray(parsed) ? 'array' : typeof parsed);
                            console.log(`[API Proxy Debug] Response structure:`, JSON.stringify(parsed, null, 2).substring(0, 300));
                        } catch (e) {
                            console.log(`[API Proxy Debug] Failed to parse response as JSON`);
                        }
                    }
                    
                    // Add debug logging for workflows endpoint
                    if (req.url.includes('workflows')) {
                        console.log(`[API Proxy Debug] workflows endpoint response:`, body.substring(0, 500));
                        try {
                            const parsed = JSON.parse(body);
                            console.log(`[API Proxy Debug] Response type:`, Array.isArray(parsed) ? 'array' : typeof parsed);
                            if (typeof parsed === 'object' && !Array.isArray(parsed)) {
                                console.log(`[API Proxy Debug] Response keys:`, Object.keys(parsed));
                                console.log(`[API Proxy Debug] Response structure:`, JSON.stringify(parsed, null, 2).substring(0, 500));
                            }
                        } catch (e) {
                            console.log(`[API Proxy Debug] Failed to parse response as JSON`);
                        }
                    }
                    
                    try {
                        // Only rebrand if it's valid JSON and not in the skip list
                        const jsonData = JSON.parse(body);
                        
                        // List of endpoints that should return arrays
                        const arrayEndpoints = [
                            'workspaceuser',
                            'workflows',
                            'chatflows',  // Both FlowStack and core names
                            'agentflows',
                            'marketplaces',
                            'tools',
                            'credentials',
                            'variables',
                            'apikey',
                            'documentstore',
                            'assistants',
                            'templates',
                            'nodes',
                            'components',
                            'users',
                            'organizations'
                        ];
                        
                        // Check if this endpoint should return an array
                        const shouldReturnArray = arrayEndpoints.some(endpoint => 
                            req.url.toLowerCase().includes(endpoint)
                        );
                        
                        // Special handling for endpoints that should return arrays
                        if (shouldReturnArray && !Array.isArray(jsonData)) {
                            // If the response is an error or not an array, return empty array
                            if (jsonData.error || jsonData.message || proxyRes.statusCode >= 400) {
                                console.log(`[API Proxy] ${req.url} returned error/non-array, returning empty array`);
                                body = JSON.stringify([]);
                            } else if (typeof jsonData === 'object' && jsonData !== null) {
                                // Check if the response has a 'data' property that contains the actual array
                                if (jsonData.data && Array.isArray(jsonData.data)) {
                                    console.log(`[API Proxy] ${req.url} returned object with data array, extracting array`);
                                    body = JSON.stringify(jsonData.data);
                                } else if (jsonData.workflows && Array.isArray(jsonData.workflows)) {
                                    // Some endpoints might return the array under a different property name
                                    console.log(`[API Proxy] ${req.url} returned object with workflows array, extracting array`);
                                    body = JSON.stringify(jsonData.workflows);
                                } else {
                                    // If it's a single object, wrap it in an array
                                    console.log(`[API Proxy] ${req.url} returned object, wrapping in array`);
                                    body = JSON.stringify([jsonData]);
                                }
                            }
                        } else if (!shouldSkipRebrand) {
                            // For non-data endpoints, we can safely rebrand
                            body = rebrandText(body);
                        } else {
                            // For data endpoints, we preserve the structure but might rebrand specific fields
                            // This ensures the data structure remains intact
                            console.log(`[API Proxy] Skipping rebrand for data endpoint: ${req.url}`);
                        }
                        
                        // Always apply route mapping to ensure URLs in responses match FlowStack routes
                        body = networkRebranding.applyRouteMapping(body);
                    } catch (error) {
                        // Not valid JSON or rebranding error, pass through as-is
                        console.error('[API Proxy] JSON parse/rebrand error:', error.message);
                    }
                    
                    // Set the correct content-length header
                    res.setHeader('content-length', Buffer.byteLength(body));
                    res.end(body);
                });
                
                proxyRes.on('error', (err) => {
                    console.error('[API Proxy] Stream error:', err);
                    res.statusCode = 500;
                    res.end(JSON.stringify({ error: 'Proxy stream error' }));
                });
            } else {
                // For non-JSON responses, just pipe through
                proxyRes.pipe(res);
            }
        },
        onError: (err, req, res) => {
            console.error(`[API Proxy Error] ${err.message} for ${req.url}`);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Proxy error', message: err.message });
            }
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
        ws: true, // Enable WebSocket support for Vite HMR
        logLevel: 'warn', // Less verbose for UI
        selfHandleResponse: true, // We need to handle the response ourselves for HTML modification
        onProxyReq: (proxyReq, req, res) => {
            // Log only non-asset requests
            if (!req.url.includes('.js') && !req.url.includes('.css') && !req.url.includes('.ts') && !req.url.includes('/@')) {
                console.log(`[UI Proxy] ${req.method} ${req.url}`);
            }
        },
        onProxyReqWs: (proxyReq, req, socket, options, head) => {
            // Handle WebSocket upgrade requests
            console.log('[UI Proxy] WebSocket upgrade request for:', req.url);
            // Set the origin header to match the target
            proxyReq.setHeader('origin', target);
        },
        onProxyRes: (proxyRes, req, res) => {
            const contentType = proxyRes.headers['content-type'] || '';
            
            // Copy headers
            Object.keys(proxyRes.headers).forEach((key) => {
                if (key !== 'content-length' && key !== 'content-encoding') { // Don't copy these as we might modify content
                    res.setHeader(key, proxyRes.headers[key]);
                }
            });
            
            // Only process HTML responses
            if (contentType.includes('text/html')) {
                const chunks = [];
                
                proxyRes.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                proxyRes.on('end', () => {
                    let body = Buffer.concat(chunks).toString('utf8');
                    
                    // Only process if it looks like the main HTML document
                    if (body.includes('<!DOCTYPE html>') || body.includes('<!doctype html>')) {
                        console.log('[UI Proxy] Processing main HTML document');
                        
                        // Apply text rebranding
                        body = rebrandText(body);
                        
                        // Apply route mapping to ensure API calls use FlowStack routes
                        body = networkRebranding.applyRouteMapping(body);
                        
                        // Update page title
                        body = body.replace(
                            /<title>.*?<\/title>/,
                            '<title>FlowStack - Build AI Agents, Visually</title>'
                        );
                        
                        // Inject client-side rebranding scripts and styles
                        const rebrandingScripts = getClientRebranding(proxyUrl);
                        const headEndIndex = body.indexOf('</head>');
                        if (headEndIndex !== -1) {
                            body = body.slice(0, headEndIndex) + rebrandingScripts + body.slice(headEndIndex);
                        }
                    }
                    
                    // Set correct content length
                    res.setHeader('content-length', Buffer.byteLength(body));
                    res.end(body);
                });
                
                proxyRes.on('error', (err) => {
                    console.error('[UI Proxy] Stream error:', err);
                    if (!res.headersSent) {
                        res.statusCode = 500;
                        res.end('Proxy stream error');
                    }
                });
            } else {
                // For non-HTML responses, just pipe through
                proxyRes.pipe(res);
            }
        },
        onError: (err, req, res) => {
            console.error(`[UI Proxy Error] ${err.message} for ${req.url}`);
            // Handle WebSocket errors differently
            if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
                console.log('[UI Proxy] WebSocket connection reset, this is normal during HMR');
                return;
            }
            // Don't kill the connection on errors
            if (res && !res.headersSent && res.writeHead) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Proxy error');
            }
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