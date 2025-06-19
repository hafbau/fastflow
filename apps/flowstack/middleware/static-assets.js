/**
 * Static Assets Middleware
 */

const express = require('express');
const path = require('path');

/**
 * Configure static asset routes
 * @param {express.Application} app - Express app instance
 */
function setupStaticAssets(app) {
    // Serve static assets
    app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

    // Serve custom favicon - this needs to be early in the middleware chain
    app.get('/favicon.ico', (req, res) => {
        console.log('[Static Assets] Serving FlowStack favicon');
        res.sendFile(path.join(__dirname, '..', 'assets', 'favicon.ico'));
    });

    app.get('/favicon-16x16.png', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'assets', 'favicon-16x16.png'));
    });

    app.get('/favicon-32x32.png', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'assets', 'favicon-32x32.png'));
    });

    // Intercept ALL requests that might be for Flowise logos
    app.use((req, res, next) => {
        const path = req.path.toLowerCase();
        
        // Check if this is a request for any Flowise logo/favicon
        if (path.includes('flowise') && (path.endsWith('.png') || path.endsWith('.svg') || path.endsWith('.ico'))) {
            console.log(`[Static Assets] Intercepting Flowise asset: ${req.path}`);
            
            // For SVG requests, return as JavaScript module
            if (path.endsWith('.svg')) {
                res.setHeader('Content-Type', 'application/javascript');
                res.send(`export default "/assets/flowstack_logo.png";`);
                return;
            }
            
            // For other image types, return our logo
            res.sendFile(path.join(__dirname, '..', 'assets', 'flowstack_logo.png'));
            return;
        }
        
        next();
    });

    // Handle SVG module imports - serve as JavaScript modules
    app.use((req, res, next) => {
        // Check if this is a request for Flowise SVG files (with or without query params)
        if (req.path.includes('flowise_white.svg') || req.path.includes('flowise_dark.svg')) {
            res.setHeader('Content-Type', 'application/javascript');
            res.send(`export default "/assets/flowstack_logo.png";`);
            return;
        }
        next();
    });

    // Serve FlowStack logo for any Flowise logo request
    app.get('/assets/images/*flowise*.png', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'assets', 'flowstack_logo.png'));
    });

    // Catch specific logo patterns
    app.get('**/flowise_logo*.png', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'assets', 'flowstack_logo.png'));
    });

    app.get('/assets/images/*flowise*.svg', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'assets', 'flowstack_logo.png'));
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ok', 
            service: 'FlowStack Proxy',
            version: '1.0.0'
        });
    });
    
    // Redirect /login to /signin for better UX
    app.get('/login', (req, res) => {
        res.redirect('/signin');
    });
}

module.exports = { setupStaticAssets }; 