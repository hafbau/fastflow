# FlowStack Project Structure & Update Strategy

## Overview
This document outlines the recommended structure for managing a commercial product based on an open source project using Git subtrees.

## Directory Structure

```
flowstack/
├── @core/                      # Git subtree of upstream project
│   └── [upstream structure]    # Untouched upstream code
│
├── packages/                   # Your monorepo packages
│   ├── @flowstack/config      # Shared configuration
│   ├── @flowstack/extensions  # Extensions to core functionality
│   ├── @flowstack/features    # New features not in core
│   ├── @flowstack/theme       # Branding and theming
│   └── @flowstack/overrides   # Selective overrides
│
├── apps/                       # Your applications
│   └── main/                   # Main application
│       ├── src/
│       └── package.json
│
├── scripts/                    # Build and maintenance scripts
│   ├── sync-upstream.sh       # Update from upstream
│   ├── apply-overrides.js     # Apply your customizations
│   └── check-conflicts.js     # Detect potential conflicts
│
├── patches/                    # Git patches for critical core changes
│   └── core-modifications/
│
├── .gitignore
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # or yarn.workspaces
└── turbo.json                 # or nx.json, rush.json
```

## Update Strategy

### 1. Initial Setup
```bash
# Add upstream as a git subtree
git subtree add --prefix=@core https://github.com/upstream/repo.git main --squash

# Set up your monorepo
pnpm init
```

### 2. Override Pattern
Instead of modifying core files directly, use these patterns:

#### Component Override Example:
```typescript
// packages/@flowstack/overrides/components/Button.tsx
import { Button as CoreButton } from '@core/components';

export const Button = (props) => {
  // Your customizations
  return <CoreButton {...props} className="your-brand" />;
};
```

#### Configuration Extension:
```typescript
// packages/@flowstack/config/index.ts
import { coreConfig } from '@core/config';

export const config = {
  ...coreConfig,
  // Your overrides
  brandName: 'FlowStack',
  features: {
    ...coreConfig.features,
    customFeature: true
  }
};
```

### 3. Dependency Management
```json
// packages/@flowstack/extensions/package.json
{
  "name": "@flowstack/extensions",
  "dependencies": {
    "@core/lib": "workspace:*",
    "@flowstack/config": "workspace:*"
  }
}
```

### 4. Build Pipeline
```javascript
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "@core/*#build": {
      "cache": false  // Don't cache core builds during development
    }
  }
}
```

### 5. Update Process
```bash
#!/bin/bash
# scripts/sync-upstream.sh

# Fetch latest from upstream
git subtree pull --prefix=@core https://github.com/upstream/repo.git main --squash

# Run conflict checker
node scripts/check-conflicts.js

# Run tests
pnpm test

# Apply any necessary patches
node scripts/apply-overrides.js
```

## Best Practices

### 1. Never Modify Core Directly
- Use wrappers, composers, or overrides
- If absolutely necessary, use patches

### 2. Maintain Clear Boundaries
```
@core/*        → Never touch
@flowstack/*   → Your code
patches/*      → Documented modifications
```

### 3. Use Aliasing for Smooth Migration
```javascript
// apps/main/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@components/*": ["@flowstack/overrides/components/*", "@core/components/*"],
      "@config": ["@flowstack/config"],
      "@features/*": ["@flowstack/features/*"]
    }
  }
}
```

### 4. Version Locking Strategy
```javascript
// scripts/lock-versions.js
// Lock specific @core package versions when stable
const lockFile = {
  "@core": "subtree-ref-abc123",
  "lastSync": "2024-01-15",
  "patches": ["critical-fix-001.patch"]
};
```

### 5. Testing Strategy
- Test @core functionality (smoke tests)
- Test @flowstack extensions
- Test integration between both
- Test after each upstream sync

## Common Patterns

### Feature Flags
```typescript
// packages/@flowstack/features/flags.ts
export const features = {
  useCustomAuth: true,
  useCoreBilling: false,
  customDashboard: true
};
```

### Conditional Imports
```typescript
// apps/main/src/App.tsx
import { features } from '@flowstack/features/flags';

const Dashboard = features.customDashboard 
  ? lazy(() => import('@flowstack/features/dashboard'))
  : lazy(() => import('@core/dashboard'));
```

### Theme Injection
```typescript
// packages/@flowstack/theme/provider.tsx
import { ThemeProvider as CoreThemeProvider } from '@core/theme';
import { customTheme } from './theme';

export const ThemeProvider = ({ children }) => (
  <CoreThemeProvider theme={customTheme}>
    {children}
  </CoreThemeProvider>
);
```

## Troubleshooting

### Circular Dependencies
- Keep @core dependencies flowing one direction
- Use dependency injection for reverse needs

### Build Performance
- Use turborepo/nx caching
- Parallelize @core and @flowstack builds
- Consider using references instead of builds for development

### Update Conflicts
1. Run conflict checker before updates
2. Have a rollback strategy
3. Maintain a patch log
4. Consider feature branches for major updates 