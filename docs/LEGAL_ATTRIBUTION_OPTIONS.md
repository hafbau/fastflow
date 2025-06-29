# FlowStack Legal Attribution Options

## Apache 2.0 License Requirements

The Apache 2.0 license requires:
1. **Include the license** - You must include a copy of the Apache License
2. **Provide attribution** - You must give credit to the original authors
3. **State changes** - You must indicate if you've modified the software
4. **No trademark use** - You can't use Flowise trademarks without permission

## Your Attribution Options (From Most to Least Conspicuous)

### Option 1: Minimal Footer Attribution
```html
<!-- In a subtle footer -->
<footer>
  <div class="legal-links">
    <a href="/terms">Terms</a> | 
    <a href="/privacy">Privacy</a> | 
    <a href="/licenses">Open Source</a>
  </div>
</footer>
```

### Option 2: Dedicated Legal/Licenses Page
Create a `/licenses` or `/legal/third-party` page:

```html
<!-- /licenses page -->
<h1>Third-Party Software</h1>
<p>FlowStack incorporates the following open-source software:</p>

<h3>Flowise</h3>
<p>Copyright (c) FlowiseAI</p>
<p>Licensed under Apache License 2.0</p>
<p><a href="https://github.com/FlowiseAI/Flowise/blob/main/LICENSE">View License</a></p>

<h3>Modifications</h3>
<p>FlowStack has modified the original software to include:</p>
<ul>
  <li>Enterprise authentication system</li>
  <li>Multi-workspace support</li>
  <li>Custom branding and UI enhancements</li>
</ul>
```

### Option 3: Terms of Service Integration
Embed attribution within your Terms of Service:

```markdown
## 7. Third-Party Components

FlowStack's platform incorporates open-source components, including software 
originally developed by FlowiseAI and licensed under the Apache License 2.0. 
These components have been modified and enhanced to provide FlowStack's 
enterprise features.

For a complete list of open-source components and their licenses, please 
visit [flowstack.com/legal/open-source](/legal/open-source).
```

### Option 4: About/Credits Dialog
```javascript
// Accessible via Help menu or keyboard shortcut
function showCreditsDialog() {
  return (
    <Dialog>
      <DialogTitle>About FlowStack</DialogTitle>
      <DialogContent>
        <Typography>Version 1.0.0</Typography>
        <Typography variant="caption">
          Built with open-source technologies.
          <Link href="/licenses">View licenses</Link>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
```

### Option 5: README/Documentation Attribution
In your public documentation or README:

```markdown
## Technology Stack

FlowStack leverages best-in-class open-source technologies to deliver 
enterprise-grade AI workflow capabilities. See our [technology credits](/credits) 
for details about the open-source projects that power FlowStack.
```

### Option 6: Package Metadata
In your `package.json`:

```json
{
  "name": "flowstack",
  "description": "Enterprise AI Workflow Platform",
  "license": "Proprietary",
  "licenseSources": {
    "flowise": {
      "license": "Apache-2.0",
      "copyright": "Copyright (c) FlowiseAI",
      "modifications": "Extended with enterprise features"
    }
  }
}
```

### Option 7: API Response Headers
Include attribution in API metadata:

```javascript
app.use((req, res, next) => {
  res.setHeader('X-Powered-By', 'FlowStack');
  res.setHeader('X-License-Info', 'https://flowstack.com/licenses');
  next();
});
```

### Option 8: Source Code Comments
In your main application file:

```javascript
/**
 * FlowStack - Enterprise AI Workflow Platform
 * 
 * This software incorporates code from Flowise (https://github.com/FlowiseAI/Flowise)
 * Copyright (c) FlowiseAI, licensed under Apache License 2.0
 * 
 * Modifications Copyright (c) 2024 FlowStack Inc.
 */
```

## Creative Compliance Strategies

### 1. **Progressive Disclosure**
```javascript
// Start with minimal visible attribution
<span className="attribution-hint" title="Built with open source">ⓘ</span>

// Click reveals more
<Popover>
  <p>FlowStack incorporates open-source software.</p>
  <a href="/licenses">Learn more</a>
</Popover>
```

### 2. **Contextual Attribution**
Only show attribution in relevant contexts:

```javascript
// In settings/admin pages
if (userRole === 'admin') {
  showMenuItem('System Information', '/system/licenses');
}

// In developer tools/API docs
apiDocs.addSection('Attribution', '/api/licenses');
```

### 3. **Keyboard Shortcut Access**
```javascript
// Ctrl+Alt+L opens licenses
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.altKey && e.key === 'l') {
    window.open('/licenses', '_blank');
  }
});
```

### 4. **Machine-Readable Attribution**
```html
<!-- In page <head> -->
<link rel="license" href="/licenses.json">
<meta name="opensource-components" content="/api/licenses">

<!-- robots.txt -->
Sitemap: https://flowstack.com/licenses.xml
```

### 5. **Build-Time Attribution**
Generate attribution during build:

```javascript
// webpack.config.js
plugins: [
  new WebpackPlugin({
    generateLicenseFile: true,
    outputFilename: 'third-party-licenses.txt'
  })
]
```

## Compliance Best Practices

### Do's ✅
- **Include full Apache 2.0 license text** somewhere accessible
- **Credit FlowiseAI** as the original author
- **List your modifications** in general terms
- **Make attribution discoverable** (even if not prominent)
- **Keep records** of all open-source components used

### Don'ts ❌
- **Don't hide attribution completely** (must be reasonably findable)
- **Don't claim sole authorship** of the entire platform
- **Don't use Flowise trademarks** without permission
- **Don't remove copyright notices** from source files

## Recommended Approach

For maximum legal safety with minimal visibility:

1. **Primary**: Dedicated `/licenses` page with full attribution
2. **Secondary**: Brief mention in Terms of Service
3. **Tertiary**: Link in footer to "Open Source" or "Third Party Software"
4. **API**: Include license URL in API responses
5. **Downloadable**: Provide `/licenses.json` and `/licenses.txt` endpoints

## Sample Implementation

```javascript
// Minimal footer component
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="/privacy">Privacy</Link>
        <span className="separator">•</span>
        <Link to="/terms">Terms</Link>
        <span className="separator">•</span>
        <Link to="/licenses" className="subtle-link">
          <span className="sr-only">Open Source Licenses</span>
          <LicenseIcon size={14} />
        </Link>
      </div>
    </footer>
  );
}

// Full licenses page
function LicensesPage() {
  return (
    <div className="licenses-page">
      <h1>Open Source Software</h1>
      <p>FlowStack is built using open source software.</p>
      
      <section>
        <h2>Core Platform</h2>
        <div className="license-entry">
          <h3>Flowise</h3>
          <p>Copyright (c) FlowiseAI</p>
          <p>Licensed under <a href="/licenses/apache-2.0.txt">Apache License 2.0</a></p>
          <details>
            <summary>Modifications</summary>
            <ul>
              <li>Added enterprise authentication</li>
              <li>Implemented multi-tenancy</li>
              <li>Enhanced UI/UX</li>
              <li>Added custom integrations</li>
            </ul>
          </details>
        </div>
      </section>
      
      <section>
        <h2>Additional Components</h2>
        {/* List other open source dependencies */}
      </section>
    </div>
  );
}
```

## Legal Safety Checklist

- [ ] Apache 2.0 license text is accessible
- [ ] Attribution to FlowiseAI is present
- [ ] Modifications are documented
- [ ] Attribution is findable by reasonable effort
- [ ] No false claims of sole authorship
- [ ] No unauthorized trademark use
- [ ] Copyright notices preserved in source

## Remember

The key is **reasonable discoverability**. Courts generally look for:
- Good faith effort to provide attribution
- Attribution that a reasonable person could find
- No intent to deceive about the software's origins

You have significant flexibility in WHERE and HOW you provide attribution, as long as it's genuinely accessible to those who look for it. 