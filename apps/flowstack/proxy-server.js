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

// Rebranding System
const { applyRebranding } = require('./rebranding');

// Middleware
const { setupStaticAssets } = require('./middleware/static-assets');
const { createApiProxy, createUiProxy } = require('./middleware/proxy-handlers');

const app = express();

// Apply rebranding system FIRST - before any other middleware
applyRebranding(app, {
    attributionMode: 'minimal',  // Use 'minimal' for enterprise, 'icon_only' for even less visibility
    features: {
        deepNetworkMasking: true,
        consoleFiltering: true,
        storageInterception: true,
        serviceWorker: false,    // Keep disabled for stability
        routeMasking: true
    }
});

// Enable CORS with credentials
app.use(cors(config.CORS_OPTIONS));

// Parse JSON bodies
app.use(express.json());

// Setup static asset routes - after rebranding but before proxies
setupStaticAssets(app);

// Debug logging middleware (but skip asset requests)
app.use((req, res, next) => {
    if (!req.url.includes('.js') && !req.url.includes('.css') && !req.url.includes('.ts') && !req.url.includes('/@')) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    }
    next();
});

// Proxy API requests to core server
app.use('/api', createApiProxy(config.CORE_SERVER_URL));

// Proxy socket.io connections
app.use('/socket.io', createProxyMiddleware({
    target: config.CORE_SERVER_URL,
    changeOrigin: true,
    ws: true
}));

// Proxy Vite-specific paths directly without any modification
const viteSpecificPaths = [
    '/@vite',
    '/@react-refresh',
    '/@fs',
    '/@id',
    '/node_modules',
    '/src'
];

// Create a simple pass-through proxy for Vite paths - NO WebSocket here
const vitePassthrough = createProxyMiddleware({
    target: config.CORE_UI_URL,
    changeOrigin: true,
    ws: false, // Disable WebSocket for Vite asset paths
    logLevel: 'silent' // Reduce noise
});

// Apply to each Vite-specific path
viteSpecificPaths.forEach(path => {
    app.use(path, vitePassthrough);
});

// Also handle .ts, .tsx, .jsx files
app.use((req, res, next) => {
    if (req.path.endsWith('.ts') || 
        req.path.endsWith('.tsx') || 
        req.path.endsWith('.jsx') ||
        req.path.includes('.js?')) {
        vitePassthrough(req, res, next);
    } else {
        next();
    }
});

// Handle SCSS/CSS files specifically to prevent WebSocket issues
app.use((req, res, next) => {
    if (req.path.endsWith('.scss') || req.path.endsWith('.css')) {
        // Use vitePassthrough for style files without WebSocket
        vitePassthrough(req, res, next);
    } else {
        next();
    }
});

// Proxy all other requests to UI with our custom branding
// This will handle WebSocket upgrades for HMR
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