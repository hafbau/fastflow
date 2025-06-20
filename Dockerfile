# Multi-stage Dockerfile for FlowStack
# Builds both core Flowise and FlowStack proxy layer

FROM node:20-alpine AS deps
RUN apk add --update --no-cache libc6-compat python3 py3-setuptools make g++ git curl wget

# Install pnpm manually by downloading binary for the correct architecture
ENV SHELL=/bin/sh
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -fsSL https://github.com/pnpm/pnpm/releases/download/v9.0.4/pnpm-linux-${ARCH} -o /usr/local/bin/pnpm && \
    chmod +x /usr/local/bin/pnpm

# Install dependencies only when needed
WORKDIR /usr/src
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY turbo.json ./
COPY core/package.json ./core/package.json
COPY core/pnpm-lock.yaml ./core/pnpm-lock.yaml
COPY core/pnpm-workspace.yaml ./core/pnpm-workspace.yaml
COPY core/packages/*/package.json ./core/packages/*/
COPY apps/*/package.json ./apps/*/
COPY packages/*/package.json ./packages/*/

# Copy scripts directory if it exists (for patch:apply)
COPY scripts ./scripts

# Install dependencies for the monorepo
RUN pnpm install --frozen-lockfile || true

# Copy apps directory and install dependencies for the proxy app specifically
COPY apps ./apps
WORKDIR /usr/src/apps/flowstack
RUN pnpm install --prod

# Build stage
FROM node:20-alpine AS builder
RUN apk add --update --no-cache libc6-compat python3 py3-setuptools make g++ git curl wget
# needed for pdfjs-dist
RUN apk add --no-cache build-base cairo-dev pango-dev

# Install pnpm manually by downloading binary for the correct architecture
ENV SHELL=/bin/sh
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -fsSL https://github.com/pnpm/pnpm/releases/download/v9.0.4/pnpm-linux-${ARCH} -o /usr/local/bin/pnpm && \
    chmod +x /usr/local/bin/pnpm

WORKDIR /usr/src
COPY --from=deps /usr/src/node_modules ./node_modules
COPY --from=deps /usr/src/apps/flowstack/node_modules ./apps/flowstack/node_modules
COPY . .

# Install all dependencies for the entire workspace
WORKDIR /usr/src
RUN pnpm install --no-frozen-lockfile || echo "Dependencies installed with warnings"

# Production image
FROM node:20-alpine AS runner
RUN apk add --update --no-cache libc6-compat
# Install runtime dependencies
RUN apk add --no-cache chromium curl supervisor postgresql-client wget

# Install pnpm manually by downloading binary for the correct architecture
ENV SHELL=/bin/sh
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="x64"; elif [ "$ARCH" = "aarch64" ]; then ARCH="arm64"; fi && \
    curl -fsSL https://github.com/pnpm/pnpm/releases/download/v9.0.4/pnpm-linux-${ARCH} -o /usr/local/bin/pnpm && \
    chmod +x /usr/local/bin/pnpm

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_OPTIONS=--max-old-space-size=8192

WORKDIR /usr/src

# Copy built application
COPY --from=builder /usr/src ./

# Copy custom start scripts
COPY scripts/start-flowise.sh /usr/local/bin/start-flowise
COPY scripts/start-flowise-wrapper.sh /usr/local/bin/start-flowise-wrapper
RUN chmod +x /usr/local/bin/start-flowise
RUN chmod +x /usr/local/bin/start-flowise-wrapper

# Copy supervisord configuration
RUN mkdir -p /etc/supervisor/conf.d
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create log directories
RUN mkdir -p /var/log/supervisor

# Ensure execution permissions
RUN chmod +x /usr/src/core/packages/server/bin/run || true

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/ping || exit 1

EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
