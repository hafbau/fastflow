# FlowStack Rebranding Implementation Guide

## Clean Architecture Overview

I've reorganized the rebranding system into a clean, modular architecture:

```
apps/flowstack/
├── rebranding/                  # All rebranding logic
│   ├── index.js                # Main orchestrator
│   ├── modules/
│   │   ├── text-rebranding.js  # Text replacements
│   │   ├── visual-rebranding.js # CSS/client-side
│   │   ├── network-rebranding.js # Headers/routes
│   │   ├── legal-attribution.js  # Compliance
│   │   └── deep-rebranding.js   # Advanced features
│   └── README.md
├── config/
│   └── brand-colors.js         # Brand color definitions
└── proxy-server.js             # Your main server

# Files to remove/deprecate:
- apps/flowstack/utils/rebranding.js (old)
- apps/flowstack/utils/deep-rebranding.js
- apps/flowstack/middleware/enhanced-rebranding.js
- apps/flowstack/components/LegalAttribution.js
```

## Implementation Steps

### 1. Update your proxy-server.js

```javascript
const express = require('express');
const { applyRebranding } = require('./rebranding');

const app = express();

// Apply rebranding system BEFORE other middleware
applyRebranding(app, {
    attributionMode: 'minimal',  // For enterprise: use 'minimal' or 'icon_only'
    features: {
        deepNetworkMasking: true,
        consoleFiltering: true,
        storageInterception: true,
        serviceWorker: false,    // Keep disabled for stability
        routeMasking: true
    }
});

// Your existing middleware...
```

### 2. Update proxy-handlers.js

```javascript
const { getClientRebranding, rebrandText } = require('../rebranding');

function createUiProxy(targetUrl) {
    return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        ws: true,
        selfHandleResponse: true,
        onProxyRes: async (proxyRes, req, res) => {
            let body = '';
            
            proxyRes.on('data', (chunk) => {
                body += chunk.toString();
            });
            
            proxyRes.on('end', () => {
                // Only process HTML
                if (proxyRes.headers['content-type']?.includes('text/html')) {
                    // Apply text rebranding
                    body = rebrandText(body);
                    
                    // Inject client-side rebranding
                    const baseUrl = `http://localhost:${PORT}`;
                    const rebrandingScripts = getClientRebranding(baseUrl);
                    body = body.replace('</head>', rebrandingScripts + '</head>');
                }
                
                res.writeHead(proxyRes.statusCode, proxyRes.headers);
                res.end(body);
            });
        }
    });
}
```

### 3. Clean Up Old Files

Remove these deprecated files:
```bash
rm apps/flowstack/utils/rebranding.js
rm apps/flowstack/utils/deep-rebranding.js
rm apps/flowstack/middleware/enhanced-rebranding.js
rm apps/flowstack/components/LegalAttribution.js
```

## What Each Module Does

### Core Modules

1. **text-rebranding.js**
   - Simple text replacement engine
   - Handles both strings and JSON objects
   - Pre-compiled regex for performance

2. **visual-rebranding.js**
   - CSS injection for brand colors
   - Client-side logo replacement
   - Favicon updates

3. **network-rebranding.js**
   - HTTP header modification
   - Route masking (/chatflows → /workflows)
   - Response interception

4. **legal-attribution.js**
   - Multiple attribution display modes
   - License endpoints (/licenses, /api/licenses.json)
   - Apache 2.0 compliance

5. **deep-rebranding.js**
   - Console log filtering
   - localStorage/sessionStorage filtering
   - Service worker (optional)
   - Metadata scrubbing

## Configuration Options

### For Enterprise Launch

```javascript
{
    attributionMode: 'minimal',    // Subtle "Open Source" link
    features: {
        deepNetworkMasking: true,  // Hide Flowise in headers
        consoleFiltering: true,    // Clean console logs
        storageInterception: true, // Clean storage keys
        serviceWorker: false,      // Disabled for stability
        routeMasking: true        // Mask API endpoints
    }
}
```

### For Development

```javascript
{
    attributionMode: 'standard',   // More visible attribution
    features: {
        deepNetworkMasking: false, // See real headers
        consoleFiltering: false,   // See all logs
        storageInterception: false,// See real storage
        serviceWorker: false,
        routeMasking: false       // Use original routes
    }
}
```

## Testing Checklist

- [ ] Visit your app at http://localhost:4000
- [ ] No "Flowise" visible anywhere in UI
- [ ] Logo shows FlowStack logo
- [ ] Open DevTools Network tab - headers show "FlowStack Platform"
- [ ] Check console - no Flowise references
- [ ] Visit /licenses - page loads with attribution
- [ ] Check /api/licenses.json - returns valid JSON
- [ ] Attribution appears per your chosen mode

## Production Readiness

The system is production-ready with:

1. **Performance**
   - Pre-compiled regex patterns
   - Minimal client-side overhead
   - Efficient middleware chain

2. **Reliability**
   - Service worker disabled by default
   - Graceful fallbacks
   - No breaking changes to core

3. **Compliance**
   - Apache 2.0 compliant
   - Machine-readable attribution
   - Clear modification documentation

4. **Maintainability**
   - Modular architecture
   - Clear separation of concerns
   - Comprehensive documentation

## Quick Reference

```javascript
// Main functions you'll use:
const { 
    applyRebranding,      // Apply to Express app
    getClientRebranding,  // Get HTML to inject
    rebrandText,          // Process text content
    getSystemStatus       // Health check
} = require('./rebranding');

// Check system status
console.log(getSystemStatus());
```

This clean, modular system replaces all the overlapping files with a coherent, enterprise-ready solution. 