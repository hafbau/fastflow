# FlowStack Docker Development Setup

This guide explains how to use the Docker development environment for FlowStack.

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.dev.example .env.dev
   ```

2. **Start all services:**
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access FlowStack:**
   - Main Application: http://localhost:3000
   - Core API (debug): http://localhost:3001
   - UI Dev Server: http://localhost:8080
   - Adminer (DB UI): http://localhost:8081
   - Node.js Debugger: chrome://inspect -> localhost:9229

## Services Overview

### Core Services (Always Running)

1. **postgres** - PostgreSQL database
   - Port: 5432
   - User: flowstack_admin
   - Password: devpassword (or set in .env.dev)
   - Database: flowstack

2. **flowstack-dev** - Main development container
   - Ports: 3000 (proxy), 3001 (API), 8080 (UI), 9229 (debugger)
   - Hot reload enabled for all source code
   - Runs `pnpm dev` by default

3. **redis** - Redis cache/queue
   - Port: 6379
   - Used for testing distributed features

4. **adminer** - Database management UI
   - Port: 8081
   - Pre-configured for PostgreSQL connection

### Optional Services (Use Profiles)

1. **mailhog** - Email testing
   ```bash
   docker-compose -f docker-compose.dev.yml --profile email up -d
   ```
   - SMTP: localhost:1025
   - Web UI: http://localhost:8025

2. **docs** - Documentation server
   ```bash
   docker-compose -f docker-compose.dev.yml --profile docs up -d
   ```
   - Port: 8082
   - Serves /docs directory

### Utility Services

1. **db-reset** - Reset database
   ```bash
   docker-compose -f docker-compose.dev.yml run --rm db-reset
   ```

2. **db-seed** - Seed database
   ```bash
   # First create scripts/seed-data.sql with your data
   docker-compose -f docker-compose.dev.yml run --rm db-seed
   ```

## Development Workflow

### Starting Development

```bash
# Start all core services
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f flowstack-dev

# Enter container shell
docker-compose -f docker-compose.dev.yml exec flowstack-dev bash
```

### Hot Reload

The development setup includes hot reload for:
- TypeScript files (server)
- React components (UI)
- Proxy server changes

Changes to source files are automatically detected and reloaded.

### Debugging

1. **Node.js Debugging:**
   - Port 9229 is exposed for debugging
   - Use Chrome DevTools or VS Code debugger
   - Connect to `localhost:9229`

2. **View Logs:**
   ```bash
   # All services
   docker-compose -f docker-compose.dev.yml logs -f
   
   # Specific service
   docker-compose -f docker-compose.dev.yml logs -f flowstack-dev
   ```

3. **Database Inspection:**
   - Use Adminer at http://localhost:8081
   - Or connect with any PostgreSQL client to localhost:5432

### Running Commands

```bash
# Run pnpm commands
docker-compose -f docker-compose.dev.yml exec flowstack-dev pnpm test

# Run database migrations
docker-compose -f docker-compose.dev.yml exec flowstack-dev pnpm -C core/packages/server migration:run

# Install new dependencies
docker-compose -f docker-compose.dev.yml exec flowstack-dev pnpm add <package>
```

## Troubleshooting

### Port Conflicts

If ports are already in use, update `.env.dev`:
```env
EXTERNAL_PORT=3010  # Change proxy port
```

### Database Issues

```bash
# Reset database
docker-compose -f docker-compose.dev.yml run --rm db-reset

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Build Issues

```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml build --no-cache

# Clean volumes and restart
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Performance Issues

1. Ensure Docker has sufficient resources (8GB RAM recommended)
2. Exclude node_modules from file watchers in your IDE
3. Use `.dockerignore` to exclude unnecessary files

## VS Code Integration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Docker: Attach to Node",
      "remoteRoot": "/app",
      "localRoot": "${workspaceFolder}",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

## Environment Variables

Key development variables in `docker-compose.dev.yml`:

- `NODE_ENV=development` - Enables development features
- `DEBUG=*` - Enables all debug logs
- `CHOKIDAR_USEPOLLING=true` - Enables file watching in Docker
- `NODE_OPTIONS=--inspect=0.0.0.0:9229` - Enables debugging

## Best Practices

1. **Use profiles** for optional services to save resources
2. **Mount source code** for hot reload during development
3. **Use separate volumes** for development data
4. **Keep containers running** and exec into them for commands
5. **Check logs frequently** during development

## Next Steps

- Review [CLAUDE.md](../CLAUDE.md) for development guidelines
- Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for production setup
- See [scripts/](../scripts/) for additional development tools