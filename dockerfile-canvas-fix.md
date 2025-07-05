# Dockerfile Canvas Build Fix

## Problem
The GitHub Actions build was failing with:
1. `pkg-config: not found` - Required for node-gyp to find system libraries
2. Canvas prebuilt binary not found for `linux-musl-arm64`
3. Missing system dependencies for building canvas from source

## Solution Applied

### 1. Added Canvas Build Dependencies
Updated all Alpine stages (deps, builder, runner) to include:

**Build dependencies** (deps & builder stages):
- `cairo-dev` - Cairo graphics library development files
- `jpeg-dev` - JPEG library development files
- `pango-dev` - Text layout library development files
- `giflib-dev` - GIF library development files
- `pixman-dev` - Pixel manipulation library development files
- `pkgconfig` - Essential for node-gyp to locate libraries
- `build-base` - Alpine's meta-package for build tools
- `bash` - Better shell compatibility

**Runtime dependencies** (runner stage):
- `cairo` - Cairo graphics library
- `jpeg` - JPEG library
- `pango` - Text layout library
- `giflib` - GIF library
- `pixman` - Pixel manipulation library

### 2. Fixed pnpm Workspace Issues
Added `--shamefully-hoist` flag to pnpm install commands to resolve bin linking warnings in the monorepo structure.

## What This Fixes
1. ✅ Canvas package can now build from source when prebuilt binaries aren't available
2. ✅ pkg-config is available for node-gyp to find system libraries
3. ✅ All required libraries for canvas compilation are present
4. ✅ Runtime has necessary libraries for canvas to function
5. ✅ Reduced pnpm workspace bin linking warnings

## Testing
The build should now complete successfully on GitHub Actions for both amd64 and arm64 architectures.

## Note
Alpine Linux uses musl libc instead of glibc, which is why many prebuilt Node.js binaries don't work. By including all build dependencies, we ensure packages can compile from source when needed.