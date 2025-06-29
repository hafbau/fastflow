# FlowStack Rebranding Strategy

## The Golden Rule: Don't Modify Core

**Why?** Every change to core makes upstream updates harder. Instead, rebrand at the proxy/UI layer.

## What Needs Rebranding

### 1. **Visible Elements** (High Priority)
- Browser title/favicon
- Logo/branding assets
- UI headers and footers
- Login/signup pages
- Email notifications
- Error messages
- Documentation URLs

### 2. **API Responses** (Medium Priority)
- Server headers
- Error responses
- System messages
- Metadata

### 3. **Internal References** (Low Priority)
- Code comments
- Variable names
- Database fields

## Implementation Approach

### Phase 1: Proxy-Level Rebranding (Week 1)

#### 1. HTML Response Modification
```javascript
// apps/flowstack/proxy-server.js
app.use('/', createProxyMiddleware({
    target: CORE_UI_URL,
    selfHandleResponse: true,
    onProxyRes: (proxyRes, req, res) => {
        let body = '';
        proxyRes.on('data', (chunk) => { body += chunk; });
        proxyRes.on('end', () => {
            // Replace all Flowise mentions
            body = body
                .replace(/Flowise/g, 'FlowStack')
                .replace(/flowise/g, 'flowstack')
                .replace(/flowiseai\.com/g, 'getflowstack.ai')
                .replace(/Build LLM Apps Easily/g, 'Build AI Agents, Visually');
            
            // Update page title
            body = body.replace(
                /<title>.*?<\/title>/,
                '<title>FlowStack - Build AI Agents, Visually</title>'
            );
            
            // Inject custom CSS for visual changes
            body = body.replace('</head>', `
                <style>
                    /* Hide original logo */
                    img[src*="flowise"] { display: none; }
                    
                    /* Custom branding */
                    .MuiToolbar-root::before {
                        content: 'FlowStack';
                        font-size: 24px;
                        font-weight: bold;
                        color: #1976d2;
                    }
                </style>
                </head>
            `);
            
            res.end(body);
        });
    }
}));
```

#### 2. API Response Modification
```javascript
// Intercept JSON responses
app.use('/api/*', (req, res, next) => {
    const originalJson = res.json;
    res.json = function(data) {
        // Recursively replace Flowise references
        const modifiedData = JSON.parse(
            JSON.stringify(data)
                .replace(/Flowise/g, 'FlowStack')
                .replace(/flowise/g, 'flowstack')
        );
        originalJson.call(this, modifiedData);
    };
    next();
});
```

#### 3. Static Asset Replacement
```javascript
// Serve custom logo
app.get('/assets/images/flowise_logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets/flowstack_logo.png'));
});

// Serve custom favicon
app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'assets/flowstack_favicon.ico'));
});
```

### Phase 2: Custom UI Pages (Week 2)

Replace key pages with FlowStack branded versions:

```
flowstack/
├── apps/
│   ├── flowstack-ui/          # Your branded UI
│   │   ├── public/
│   │   │   ├── index.html     # FlowStack branded
│   │   │   └── assets/
│   │   │       ├── logo.svg
│   │   │       └── favicon.ico
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Login.tsx   # Custom login
│   │       │   ├── Register.tsx
│   │       │   └── Dashboard.tsx
│   │       └── config/
│   │           └── branding.ts
│   └── flowstack-proxy/
│       └── rebranding/
│           ├── replacements.json
│           └── assets/
```

### Phase 3: Complete UI Replacement (Week 3-4)

Build your own UI completely, using core only as an API.

## Branding Configuration

```typescript
// apps/flowstack-ui/src/config/branding.ts
export const BRANDING = {
    company: {
        name: 'FlowStack',
        domain: 'getflowstack.ai',
        tagline: 'Build AI Agents, Visually',
        description: 'The most powerful platform for building AI workflows'
    },
    colors: {
        primary: '#1976d2',
        secondary: '#dc004e',
        background: '#f5f5f5'
    },
    legal: {
        copyright: `© ${new Date().getFullYear()} FlowStack, Inc.`,
        termsUrl: 'https://getflowstack.ai/terms',
        privacyUrl: 'https://getflowstack.ai/privacy'
    }
};
```

## Legal Considerations

### 1. **Apache 2.0 Compliance**
- ✅ You can rebrand for commercial use
- ✅ You can modify the software
- ⚠️  You must include attribution
- ⚠️  You must state changes

### 2. **Attribution Example**
```html
<!-- In your footer or about page -->
<div class="attribution">
    FlowStack is built on top of Flowise, 
    an open-source project by FlowiseAI.
    <a href="/licenses">View licenses</a>
</div>
```

### 3. **License File**
```markdown
# FlowStack Licensing

FlowStack is a commercial product built on open-source foundations.

## Base Software
- Flowise (Apache 2.0) - https://github.com/FlowiseAI/Flowise
- [List other dependencies]

## Modifications
- Custom authentication system
- Enterprise workspace management
- FlowStack branding and UI
- [List your changes]

## FlowStack Proprietary Code
© 2024 FlowStack, Inc. All rights reserved.
```

## Smart Rebranding Checklist

### Immediate (Do Now):
- [ ] Create FlowStack logo/favicon
- [ ] Set up proxy rebranding rules
- [ ] Update browser title
- [ ] Replace login page
- [ ] Add attribution footer

### Short Term (Week 1-2):
- [ ] Build custom dashboard
- [ ] Create branded error pages
- [ ] Set up custom domain
- [ ] Update email templates
- [ ] Create marketing site

### Long Term (Month 1-2):
- [ ] Complete UI replacement
- [ ] Custom documentation
- [ ] Branded API endpoints
- [ ] White-label options

## Quick Start Script

```javascript
// rebranding-config.js
module.exports = {
    replacements: {
        'Flowise': 'FlowStack',
        'flowise': 'flowstack',
        'FlowiseAI': 'FlowStack',
        'flowiseai.com': 'getflowstack.ai',
        'Build LLM Apps Easily': 'Build AI Agents, Visually'
    },
    
    // Files/paths to never modify
    exclude: [
        'node_modules/**',
        'core/**',  // Never modify core!
        '*.lock',
        '.git/**'
    ],
    
    // Custom assets
    assets: {
        logo: './assets/flowstack-logo.svg',
        favicon: './assets/flowstack-favicon.ico',
        ogImage: './assets/flowstack-og.png'
    }
};
```

## The 80/20 Rule

**80% of branding impact comes from:**
1. Logo and colors
2. Login/signup pages
3. Dashboard header
4. Browser title/favicon
5. Domain name

**Focus on these first!** 