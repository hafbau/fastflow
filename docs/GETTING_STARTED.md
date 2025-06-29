# Getting Started with FlowStack

This guide will help you get FlowStack running quickly.

## Prerequisites

- Node.js 18.15.0+ or 20+ (you're currently on 21.7.3 which should work)
- pnpm 9+

## Quick Start

### Option 1: Separate Terminals (Recommended for Development)

**Terminal 1 - Start Core Flowise Services:**
```bash
cd core
pnpm install
pnpm dev
```

**Terminal 2 - Start FlowStack Proxy:**
```bash
cd /Users/hafizsuara/Projects/flowstack
pnpm dev
```

### Option 2: Using Core Directly (Fastest to Test)

```bash
cd core
pnpm install
pnpm dev
```

Then access Flowise directly at:
- UI: http://localhost:8080
- API: http://localhost:3000

## What Each Command Does

### `cd core && pnpm dev`
- Starts the original Flowise server on port 3000
- Starts the original Flowise UI on port 8080
- This is the upstream project running as-is

### `pnpm dev` (from root)
- Builds your custom FlowStack packages
- Starts the FlowStack proxy server on port 3001
- The proxy forwards requests to core services

## Expected Ports

- **3000**: Core Flowise API server
- **3001**: FlowStack proxy server (your entry point)
- **8080**: Core Flowise UI

## Troubleshooting

### If you get "command not found" errors:
```bash
# Install dependencies first
pnpm install
```

### If core fails to build:
The core has complex dependencies. You can run it directly without building:
```bash
cd core/packages/server
pnpm dev
```

### If ports are already in use:
```bash
# Kill processes on ports
npx kill-port 3000 3001 8080
```

## Next Steps

1. **Test the Setup**: Once both are running, visit http://localhost:3001
2. **Verify Core Works**: Also test http://localhost:8080 directly
3. **Start Customizing**: Begin adding your customizations in `packages/@flowstack/`

## Understanding the Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   Browser       │───▶│ FlowStack    │───▶│ Core Flowise    │
│                 │    │ Proxy :3001  │    │ Services        │
│                 │    │              │    │ :3000, :8080    │
└─────────────────┘    └──────────────┘    └─────────────────┘
```

- **Browser** → FlowStack Proxy (port 3001)
- **FlowStack Proxy** → Core Flowise Services (ports 3000, 8080)
- Your customizations live in the proxy layer

This setup allows you to:
- ✅ Use core Flowise unchanged
- ✅ Add your customizations in the proxy
- ✅ Pull upstream updates safely
- ✅ Gradually add more custom features 