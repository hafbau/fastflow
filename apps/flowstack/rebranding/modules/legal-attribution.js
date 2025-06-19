/**
 * Legal Attribution Module
 * Handles Apache 2.0 license compliance
 */

/**
 * Setup legal compliance endpoints
 * @param {Express} app - Express application
 * @param {Object} config - Configuration options
 */
function setupEndpoints(app, config) {
    // JSON format for machines
    app.get('/api/licenses.json', (req, res) => {
        res.json({
            components: [{
                name: 'Flowise',
                version: 'latest',
                license: 'Apache-2.0',
                copyright: 'Copyright (c) FlowiseAI',
                source: 'https://github.com/FlowiseAI/Flowise',
                modifications: [
                    'Enterprise authentication and authorization',
                    'Multi-workspace architecture',
                    'Custom UI/UX enhancements',
                    'Performance optimizations'
                ]
            }],
            notice: 'This software includes components under various open source licenses.',
            lastUpdated: new Date().toISOString()
        });
    });
    
    // Plain text format
    app.get('/api/licenses.txt', (req, res) => {
        res.type('text/plain');
        res.send(`OPEN SOURCE SOFTWARE NOTICE

This product includes software developed by third parties under open source licenses.

================================================================================
Flowise
Copyright (c) FlowiseAI
License: Apache License 2.0
Source: https://github.com/FlowiseAI/Flowise

Modifications by FlowStack Inc.:
- Enterprise authentication and authorization
- Multi-workspace architecture
- Custom UI/UX enhancements
- Performance optimizations
================================================================================

For the full text of licenses, visit: https://flowstack.com/licenses`);
    });
    
    // HTML license page
    app.get('/licenses', (req, res) => {
        res.send(getLicensePage());
    });
}

/**
 * Get attribution HTML based on mode
 * @param {String} mode - Attribution display mode
 * @returns {String} HTML string
 */
function getHTML(mode) {
    // Always include machine-readable attribution
    let html = `
    <link rel="license" href="/api/licenses.json" />
    <meta name="opensource-components" content="/licenses" />`;
    
    switch (mode) {
        case 'hidden':
            // Only machine-readable
            break;
            
        case 'icon_only':
            html += `
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const attr = document.createElement('div');
                    attr.innerHTML = '<span style="position:fixed;bottom:10px;right:10px;cursor:pointer;opacity:0.5;font-size:12px;z-index:1000;" onclick="window.open(\\'/licenses\\', \\'_blank\\')" title="Open Source Licenses">ⓘ</span>';
                    document.body.appendChild(attr);
                });
            </script>`;
            break;
            
        case 'minimal':
            html += `
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const attr = document.createElement('div');
                    attr.innerHTML = '<a href="/licenses" style="position:fixed;bottom:10px;right:10px;font-size:11px;opacity:0.7;text-decoration:none;color:#666;z-index:1000;">Open Source</a>';
                    document.body.appendChild(attr);
                });
            </script>`;
            break;
            
        case 'subtle':
            html += `
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const attr = document.createElement('div');
                    attr.innerHTML = '<span style="position:fixed;bottom:10px;right:10px;font-size:11px;opacity:0.6;color:#666;z-index:1000;">Built with <a href="/licenses" style="color:inherit;">open source</a></span>';
                    document.body.appendChild(attr);
                });
            </script>`;
            break;
            
        case 'standard':
            html += `
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const attr = document.createElement('div');
                    attr.innerHTML = '<div style="position:fixed;bottom:10px;right:10px;font-size:12px;opacity:0.7;color:#666;z-index:1000;">Powered by open source • <a href="/licenses">Licenses</a></div>';
                    document.body.appendChild(attr);
                });
            </script>`;
            break;
    }
    
    return html;
}

/**
 * Generate the license page HTML
 * @returns {String} HTML page
 */
function getLicensePage() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Open Source Licenses - FlowStack</title>
    <style>
        body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2563eb; }
        .license-box { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        a { color: #2563eb; }
    </style>
</head>
<body>
    <h1>Open Source Software Notice</h1>
    <p>This product includes software developed by third parties under open source licenses.</p>
    
    <div class="license-box">
        <h2>Flowise</h2>
        <p><strong>Copyright:</strong> © FlowiseAI</p>
        <p><strong>License:</strong> Apache License 2.0</p>
        <p><strong>Source:</strong> <a href="https://github.com/FlowiseAI/Flowise">https://github.com/FlowiseAI/Flowise</a></p>
        <h3>Modifications</h3>
        <ul>
            <li>Enterprise authentication and authorization</li>
            <li>Multi-workspace architecture</li>
            <li>Custom UI/UX enhancements</li>
            <li>Performance optimizations</li>
        </ul>
    </div>
    
    <p><a href="/">Back to FlowStack</a></p>
</body>
</html>`;
}

module.exports = {
    legalAttribution: {
        setupEndpoints,
        getHTML
    }
}; 