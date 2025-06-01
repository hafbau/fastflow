# FlowStack - Commercial Product Built on Flowise

FlowStack is a commercial product built on top of the open-source Flowise project. It uses Git subtrees to manage upstream updates while maintaining custom features and branding.

## 🏗️ Project Structure

```
flowstack/
├── core/                    # Upstream Flowise code (via git subtree)
├── packages/               # Your custom packages
│   └── @flowstack/
│       ├── config/         # Configuration overrides
│       ├── theme/          # Branding and theming
│       ├── overrides/      # Component overrides
│       ├── extensions/     # Extensions to core functionality
│       └── features/       # New features not in core
├── apps/
│   └── flowstack/          # Main application (proxy server)
├── patches/                # Git patches for critical core changes
└── scripts/                # Build and maintenance scripts
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development environment:**
   ```bash
   pnpm dev
   # or use the setup script for first-time setup
   ./scripts/dev-setup.sh
   ```

3. **Access the application:**
   - FlowStack: http://localhost:3001 (your branded version)
   - Core API: http://localhost:3000 (proxied)
   - Core UI: http://localhost:8080 (proxied)

## 📦 Available Scripts

### Development
- `pnpm dev` - Start all services in development mode
- `pnpm build` - Build all packages
- `pnpm test` - Run tests
- `pnpm lint` - Lint code
- `pnpm format` - Format code with Prettier

### Upstream Management
- `pnpm sync:upstream` - Pull latest changes from upstream Flowise
- `pnpm check:conflicts` - Check for conflicts between core and customizations
- `pnpm patch:create <name> [description]` - Create a patch from core modifications
- `pnpm patch:apply` - Apply all patches (runs automatically on install)

## 🔄 Working with Upstream Updates

### Syncing with Upstream
```bash
# Pull latest changes from upstream
pnpm sync:upstream

# Or specify a branch
./scripts/sync-upstream.sh develop
```

### Handling Conflicts
1. Run `pnpm check:conflicts` to identify potential issues
2. Review and update your overrides if needed
3. Test thoroughly after updates

### Creating Patches
If you must modify core files:
```bash
# Make your changes to core files
# Then create a patch
node scripts/create-patch.js my-critical-fix "Description of the fix"
```

## 🎨 Customization Strategy

### 1. Configuration Override
```typescript
// packages/@flowstack/config/src/index.ts
import { coreConfig } from 'core/packages/server/src/config';

export const config = {
  ...coreConfig,
  brand: {
    name: 'FlowStack',
    // your customizations
  }
};
```

### 2. Component Override
```typescript
// packages/@flowstack/overrides/components/Button.tsx
import { Button as CoreButton } from 'core/packages/ui/src/components';

export const Button = (props) => {
  return <CoreButton {...props} className="flowstack-button" />;
};
```

### 3. New Features
Add completely new features in `packages/@flowstack/features/` without touching core.

## 🏭 Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@flowstack/config
```

## 📝 Best Practices

1. **Never modify core directly** - Use overrides, extensions, or patches
2. **Document all customizations** - Keep track of why you override specific parts
3. **Test after upstream syncs** - Ensure your customizations still work
4. **Use feature flags** - Make it easy to toggle between core and custom features
5. **Keep patches minimal** - Only patch when absolutely necessary
