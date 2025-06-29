# Advanced FlowStack Rebranding Guide

## Making Flowise Less Conspicuous - Advanced Techniques

### 1. **Network Layer Obfuscation**

#### Headers Modification
```javascript
// Remove telltale headers
delete headers['x-powered-by'];
delete headers['server'];
// Add custom headers
headers['x-platform'] = 'FlowStack Enterprise';
```

#### Route Masking
Transform API endpoints to hide Flowise patterns:
- `/api/v1/chatflows` → `/api/v1/workflows`
- `/api/v1/prediction` → `/api/v1/execute`
- `/api/v1/chatflows-streaming` → `/api/v1/workflows-streaming`

### 2. **Client-Side Interception**

#### Console Log Filtering
Intercept and modify console output to remove Flowise references:
```javascript
const originalLog = console.log;
console.log = function(...args) {
    const filtered = args.map(arg => 
        typeof arg === 'string' ? arg.replace(/flowise/gi, 'flowstack') : arg
    );
    originalLog.apply(console, filtered);
};
```

#### Storage Sanitization
Override localStorage/sessionStorage to filter Flowise references automatically.

### 3. **Service Worker Strategy**
Deploy a service worker to intercept ALL network requests and responses:
- Modify response bodies in-flight
- Cache rebranded content
- Handle offline scenarios with FlowStack branding

### 4. **Advanced DOM Techniques**

#### Shadow DOM Attribution
Hide required attribution in less discoverable shadow DOM:
```javascript
const shadow = host.attachShadow({ mode: 'closed' });
// Attribution is technically present but harder to find
```

#### Dynamic Content Monitoring
Use MutationObserver to catch and rebrand dynamically added content.

### 5. **Build-Time Transformations**

#### Webpack Plugin
```javascript
// webpack.config.js
module.exports = {
    plugins: [
        new ReplacePlugin({
            patterns: [
                { match: /flowise/gi, replacement: 'flowstack' },
                { match: /FlowiseAI/g, replacement: 'FlowStack' }
            ]
        })
    ]
};
```

#### Source Map Manipulation
Remove or modify source maps that might reveal original code structure.

### 6. **Database & Backend Masking**

#### Table/Column Aliasing
```sql
-- Create views with FlowStack naming
CREATE VIEW flowstack_workflows AS SELECT * FROM chatflows;
CREATE VIEW flowstack_executions AS SELECT * FROM predictions;
```

#### Environment Variables
```bash
# Instead of FLOWISE_* variables
FLOWSTACK_JWT_SECRET=...
FLOWSTACK_DATABASE_PATH=...
PLATFORM_SESSION_SECRET=...
```

### 7. **Error Handling & Logging**

#### Custom Error Messages
```javascript
try {
    // code
} catch (error) {
    // Sanitize error messages
    error.message = error.message.replace(/flowise/gi, 'the system');
    throw error;
}
```

#### Stack Trace Filtering
Filter stack traces to remove file paths containing 'flowise'.

### 8. **Asset Pipeline**

#### CDN Rewriting
If using CDN, implement edge workers to rewrite responses:
```javascript
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const response = await fetch(request);
    const text = await response.text();
    const modified = text.replace(/flowise/gi, 'flowstack');
    return new Response(modified, response);
}
```

### 9. **Legal Compliance Strategies**

#### Minimal Attribution
Instead of "Powered by Flowise", use:
- "Built on open source technology"
- "Enterprise platform with community roots"
- Place in Terms of Service: "This platform incorporates open source components"

#### License Page
Create `/licenses` endpoint with full attribution but not in main UI.

### 10. **Production Deployment**

#### Docker Image Customization
```dockerfile
FROM node:18-alpine
LABEL maintainer="FlowStack Inc."
LABEL platform="FlowStack Enterprise"
# Remove Flowise references from image metadata
```

#### Reverse Proxy Configuration
```nginx
# nginx.conf
location / {
    proxy_pass http://localhost:3000;
    proxy_hide_header X-Powered-By;
    proxy_set_header X-Platform "FlowStack";
    
    # Response body substitution
    sub_filter 'flowise' 'flowstack';
    sub_filter_once off;
}
```

### 11. **Browser Extension Approach**
Create a companion browser extension that:
- Modifies page content in real-time
- Handles edge cases the proxy might miss
- Provides additional branding overlays

### 12. **WebAssembly Obfuscation**
Compile critical rebranding logic to WebAssembly:
- Harder to inspect
- Better performance
- Can handle complex transformations

## Implementation Priority

1. **Essential (Do First)**
   - Network header modification
   - Basic route masking
   - Console log filtering
   - Error message sanitization

2. **Important (Week 1)**
   - Service worker deployment
   - Storage sanitization
   - Shadow DOM attribution
   - Database aliasing

3. **Nice to Have (Month 1)**
   - WebAssembly components
   - CDN edge workers
   - Browser extension
   - Build-time transformations

## Testing Checklist

- [ ] View page source - no "flowise" visible
- [ ] Inspect network tab - headers sanitized
- [ ] Check console logs - filtered properly
- [ ] Review error messages - generic/branded
- [ ] Examine localStorage - keys renamed
- [ ] Test API responses - endpoints masked
- [ ] Verify attribution - present but subtle

## Maintenance Considerations

1. **Update Strategy**: Automate rebranding during upstream merges
2. **Performance Impact**: Monitor proxy overhead
3. **Debugging**: Maintain source maps privately
4. **Documentation**: Keep internal docs with original terms

## Remember

While these techniques make Flowise less conspicuous, always:
1. Comply with Apache 2.0 license
2. Include attribution somewhere accessible
3. Don't claim you built the core technology
4. Be transparent with enterprise customers about the stack 