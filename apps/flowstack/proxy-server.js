/**
 * FlowStack Proxy Server
 * 
 * This server acts as a pass-through proxy to the core Flowise server
 * with custom branding and modifications.
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configuration
const config = require('./config');

// Middleware
const { setupStaticAssets } = require('./middleware/static-assets');
const { createApiProxy, createUiProxy, createWebSocketProxy } = require('./middleware/proxy-handlers');

const app = express();

// Enable CORS with credentials
app.use(cors(config.CORS_OPTIONS));

// Parse JSON bodies
app.use(express.json());

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Setup static asset routes
setupStaticAssets(app);

// Proxy API requests to core server
app.use('/api', createApiProxy(config.CORE_SERVER_URL));

// Proxy socket.io connections
app.use('/socket.io', createWebSocketProxy(config.CORE_SERVER_URL));

// Create a simple pass-through proxy for all Vite dev server assets
// This needs to handle ALL Vite routes without modification
const viteProxy = createProxyMiddleware({
    target: config.CORE_UI_URL,
    changeOrigin: true,
    ws: true,
    logLevel: 'warn',
    // Don't modify anything for these paths
    pathFilter: (path) => {
        // Pass through Vite-specific paths unchanged
        return path.startsWith('/@') || 
               path.startsWith('/node_modules') ||
               path.startsWith('/src') ||
               path.endsWith('.ts') ||
               path.endsWith('.tsx') ||
               path.endsWith('.jsx') ||
               path.includes('.js?');
    }
});

// Apply Vite proxy first
app.use(viteProxy);

// Proxy all other requests to UI with our custom handling
app.use('/', createUiProxy(config.CORE_UI_URL));

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const server = app.listen(config.PORT, () => {
    console.log(`
    🚀 FlowStack Proxy Server Running
    ================================
    Proxy Port: ${config.PORT}
    Core API: ${config.CORE_SERVER_URL}
    Core UI: ${config.CORE_UI_URL}
    
    Access FlowStack at: http://localhost:${config.PORT}
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});                                                                                                                                                                                                                                                                                                                                                                                                                     