# FlowStack Rebranding System

## Overview

The FlowStack rebranding system is a modular, production-ready solution for white-labeling Flowise while maintaining Apache 2.0 license compliance. It's designed for enterprise deployment with performance and maintainability in mind.

## Architecture

```
rebranding/
├── index.js                    # Main orchestrator
├── modules/
│   ├── text-rebranding.js     # Text content replacement
│   ├── visual-rebranding.js   # CSS and client-side visuals
│   ├── network-rebranding.js  # HTTP headers and routes
│   ├── legal-attribution.js   # License compliance
│   └── deep-rebranding.js     # Advanced techniques
└── README.md                   # This file
```

## Quick Start

### 1. Update your proxy server

```javascript
const { applyRebranding } = require('./rebranding');

// In your Express app setup
applyRebranding(app, {
    attributionMode: 'minimal',  // or 'icon_only', 'subtle', etc.
    features: {
        deepNetworkMasking: true,
        consoleFiltering: true,
        storageInterception: true,
        serviceWorker: false,  // Enable with caution
        routeMasking: true
    }
});
```

### 2. Update your proxy middleware

```javascript
const { getClientRebranding, rebrandText } = require('./rebranding');

// In your UI proxy handler
const customBranding = getClientRebranding(baseUrl);

// Inject into HTML responses
html = html.replace('</head>', customBranding + '</head>');

// Process text content
text = rebrandText(text);
```

## Configuration

### Attribution Modes

- **`hidden`**: Only machine-readable attribution (risky)
- **`icon_only`**: Small ⓘ icon linking to licenses
- **`minimal`**: "Open Source" text link (recommended)
- **`subtle`**: "Built with open source"
- **`standard`**: "Powered by open source technology"

### Feature Flags

```javascript
{
    deepNetworkMasking: true,    // Advanced header/route masking
    consoleFiltering: true,      // Filter console.log output
    storageInterception: true,   // Filter localStorage/sessionStorage
    serviceWorker: false,        // Service worker interception
    routeMasking: true          // Transform API routes
}
```

## Modules

### Text Rebranding
- Replaces all Flowise references with FlowStack
- Handles JSON responses recursively
- Configurable replacement patterns

### Visual Rebranding
- Injects custom CSS with brand colors
- Replaces logos dynamically
- Updates favicon and meta tags

### Network Rebranding
- Modifies HTTP headers
- Masks API routes (e.g., /chatflows → /workflows)
- Intercepts responses at network level

### Legal Attribution
- Provides multiple attribution display modes
- Creates /licenses endpoint
- Machine-readable formats (JSON, SPDX)
- Apache 2.0 compliant

### Deep Rebranding
- Console log filtering
- Storage API interception
- Service worker support
- Metadata scrubbing

## Legal Compliance

The system ensures Apache 2.0 compliance by:

1. Always including machine-readable attribution
2. Providing accessible license information at `/licenses`
3. Documenting modifications clearly
4. Not removing copyright notices from source

## Performance Considerations

- Text replacements use pre-compiled regex patterns
- Middleware is applied early in the request chain
- Service worker is disabled by default for stability
- Client-side scripts are minimal and efficient

## Testing

Before deploying to enterprise clients:

1. **Visual Check**
   - No "Flowise" visible in UI
   - Logos properly replaced
   - Brand colors applied

2. **Network Check**
   - Headers show "FlowStack Platform"
   - API routes are masked
   - Console logs are filtered

3. **Legal Check**
   - `/licenses` endpoint works
   - Attribution is visible (per chosen mode)
   - Machine-readable licenses available

## Environment Variables

```bash
# Set attribution level
ATTRIBUTION_MODE=minimal

# Enable/disable features
DEEP_NETWORK_MASKING=true
CONSOLE_FILTERING=true
```

## Troubleshooting

### Attribution not showing
- Check that legal endpoints are registered
- Verify attribution mode is set correctly
- Ensure JavaScript is enabled

### Logos not updating
- Clear browser cache
- Check static asset middleware order
- Verify logo files exist in public/assets

### Console still shows "Flowise"
- Ensure console filtering is enabled
- Check that deep rebranding middleware is applied
- Some browser extensions may bypass filters

## Best Practices

1. **For Enterprise Deployment**
   - Use 'minimal' or 'icon_only' attribution
   - Enable all features except service worker
   - Test thoroughly in production environment

2. **For Development**
   - Use 'standard' attribution for clarity
   - Disable console filtering for debugging
   - Monitor performance impact

3. **For Legal Safety**
   - Never use 'hidden' attribution mode
   - Keep license endpoint accessible
   - Document all modifications

## Support

For issues or questions about the rebranding system, please refer to the main FlowStack documentation or contact the development team. 