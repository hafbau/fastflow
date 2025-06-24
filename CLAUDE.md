# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowStack is a commercial product built on top of the open-source Flowise project (a drag & drop UI to build customized LLM flows). It uses Git subtrees to manage upstream updates while maintaining custom features and branding.

## Critical Development Rules

1. **NEVER modify files in /core directly** - This contains upstream Flowise code managed via git subtree
2. **Use the proxy pattern** - All customizations go through the FlowStack proxy server
3. **Maintain separation** - Keep FlowStack code separate from upstream code
4. **Use patches sparingly** - Only for critical fixes that can't be done via proxy

## Architecture

```
User → FlowStack Proxy (3001) → ├─ API → Core Server (3000)
                                └─ UI  → Core UI (8080)
```

The proxy server (`/apps/flowstack/proxy-server.js`) handles:
- Rebranding (text/visual/network masking)
- Request routing and proxying
- Static asset serving with custom branding
- WebSocket/SSE forwarding

## Essential Commands

```bash
# Development
pnpm dev              # Start all services (proxy + core)
pnpm dev:core         # Start only core Flowise
pnpm dev:proxy        # Start only FlowStack proxy

# Building
pnpm build:all        # Build everything
pnpm build            # Build FlowStack packages
pnpm build:core       # Build core Flowise

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm format           # Format with Prettier
pnpm test             # Run tests

# Maintenance
pnpm sync:upstream    # Pull latest changes from upstream Flowise
pnpm check:conflicts  # Check for conflicts between core and customizations
pnpm patch:create     # Create a patch for core modifications
pnpm patch:apply      # Apply existing patches
pnpm clean            # Clean build artifacts
pnpm nuke             # Complete reset (clean + remove node_modules)

# Deployment
./scripts/build-docker.sh    # Build Docker image
./scripts/deploy-to-ecr.sh   # Deploy to AWS ECR
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
cd core/packages/server && pnpm test path/to/test.test.ts

# Test environment setup
./scripts/test-environment.sh
```

## Repository Structure

```
/core/                  # Upstream Flowise (DO NOT MODIFY)
  /packages/
    /server/           # Backend API server
    /ui/               # React frontend
    /components/       # Reusable components & nodes

/apps/flowstack/       # Main proxy server
/packages/@flowstack/  # Custom packages
/scripts/              # Build and maintenance scripts
/patches/              # Git patches for critical changes
/terraform/            # AWS infrastructure
```

## Development Workflow

1. Start development: `pnpm dev`
2. Make changes in `/apps/flowstack/` or `/packages/@flowstack/`
3. For UI changes, modify the proxy's rebranding rules
4. For API changes, add proxy middleware
5. Test thoroughly: `pnpm test`
6. Lint and format: `pnpm lint:fix && pnpm format`
7. Build: `pnpm build:all`

## Environment Setup

Required environment files:
- `/apps/flowstack/.env` - Proxy configuration
- `/core/packages/server/.env` - Core server config (copy from .env.example)
- `/core/packages/ui/.env` - UI config (usually not needed)

Key variables:
- `UPSTREAM_API_URL` - Core API server URL (default: http://localhost:3000)
- `UPSTREAM_UI_URL` - Core UI server URL (default: http://localhost:8080)
- `PORT` - Proxy server port (default: 3001)

## Customization Approach

1. **Proxy-level changes** (preferred):
   - Rebranding rules in `/apps/flowstack/proxy-server.js`
   - Custom middleware for API modifications
   - Static asset overrides

2. **Package overrides**:
   - Create packages in `/packages/@flowstack/`
   - Use TypeScript path aliases to override core imports

3. **Patches** (last resort):
   - Create with `pnpm patch:create`
   - Document why the patch is necessary
   - Keep patches minimal and focused

## Database

- Default: PostgreSQL
- Migrations: `cd core/packages/server && pnpm migration:create`
- Reset: `./scripts/reset-db.sh`

## Debugging

- Logs: `./scripts/log-monitor.sh`
- Docker networking: `./scripts/diagnose-docker-network.sh`
- Enable debug mode: Set `DEBUG=*` in environment

## Docker Development

### Local Docker Development

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f flowstack

# Reset database
docker-compose run --rm db-reset

# Stop services
docker-compose down

# Complete cleanup (including volumes)
docker-compose down -v
```

### Docker Build

```bash
# Build locally
docker build -t flowstack:local .

# Build with specific platform
docker buildx build --platform linux/amd64,linux/arm64 -t flowstack:local .

# Run standalone container
docker run -p 3000:3000 \
  -e DATABASE_TYPE=postgres \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PORT=5432 \
  -e DATABASE_NAME=flowstack \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=password \
  flowstack:local
```

### Container Architecture

The Docker container resolves the port conflict between Flowise (default 3000) and FlowStack proxy:

```
External Port 3000 → FlowStack Proxy (3000) → Flowise Core (3001)
```

- **Port 3000**: FlowStack proxy (externally exposed)
- **Port 3001**: Core Flowise server (internal only, configured via PORT=3001)
- **Port 8080**: Core Flowise UI dev server (development only)

Supervisord manages all processes, starting them in order:
1. flowise-core (priority 1) - starts on port 3001
2. flowstack-proxy (priority 2) - starts on port 3000

This design avoids port conflicts by running Flowise on a different internal port.

### Supervisord's Role

Supervisord is critical for running FlowStack in Docker because it manages multiple services in a single container:

1. **Process Management**
   - Manages 4 services: env-test, flowise-core, flowstack-proxy, log-monitor
   - Handles startup order via priorities (0=env-test, 1=flowise-core, 2=proxy/monitor)
   - Centralizes logging to Docker's stdout/stderr

2. **Automatic Recovery**
   - Auto-restarts crashed services (especially critical for flowise-core)
   - Configured with `startretries=999` for near-infinite restart attempts
   - Ensures high availability without external orchestration

3. **Environment Propagation**
   - Passes all Docker environment variables to child processes
   - Allows runtime configuration without rebuilding images
   - Critical for database credentials and API keys

4. **Why Not Alternatives?**
   - Multiple containers: Would require Kubernetes/Compose orchestration
   - Shell scripts: No automatic restart or process monitoring
   - systemd: Not available in Alpine containers
   - Single process: Would lose proxy functionality or require significant refactoring

Supervisord enables FlowStack to maintain a single-container deployment while running multiple interdependent services reliably.

## Continuous Deployment (CD)

### GitHub Actions Workflows

1. **Docker Build & Push** (`docker-image.yml`)
   - Triggers: Push to main/develop or manual
   - Builds multi-platform images
   - Pushes to Docker Hub: `leadevs/fastflow:latest`

2. **Terraform Deploy** (`terraform-deploy.yml`)
   - Triggers: After Docker build or push to main
   - Auto-deploys infrastructure changes
   - Stages: dev (non-main) and prod (main)

3. **Node CI** (`main.yml`)
   - Runs tests, linting, and builds
   - Includes E2E testing with Cypress
   - Validates Docker build

### Manual Deployment

```bash
# Deploy to AWS ECR and update ECS
./scripts/deploy-to-ecr.sh

# Build Docker image
./scripts/build-docker.sh

# Deploy specific version
docker tag flowstack:local leadevs/fastflow:v1.0.0
docker push leadevs/fastflow:v1.0.0
```

## Infrastructure as Code (IaC)

### Terraform Setup

FlowStack uses Terraform to provision AWS infrastructure:

```bash
# Initialize Terraform
cd terraform
terraform init

# Plan changes
terraform plan -var="region=us-east-1" -var="stage=prod"

# Apply infrastructure
export TF_VAR_db_password="SecurePassword123!"
terraform apply -var="region=us-east-1" -var="stage=prod"

# Destroy infrastructure (careful!)
terraform destroy -var="region=us-east-1" -var="stage=prod"
```

### AWS Resources Created

1. **Networking**
   - VPC with public/private subnets (2 AZs)
   - Internet Gateway and NAT Gateways
   - Security groups for ALB, ECS, RDS, EFS

2. **Compute**
   - ECS Fargate cluster
   - Service with 2 tasks (1 vCPU, 8GB RAM each)
   - Auto-scaling capabilities

3. **Storage**
   - RDS PostgreSQL 15.7 (20GB-100GB)
   - EFS for persistent file storage
   - Both encrypted at rest

4. **Load Balancing**
   - Application Load Balancer
   - Health checks on `/api/v1/ping`
   - Target group for ECS tasks

5. **Monitoring**
   - CloudWatch Log Groups
   - 7-day retention
   - Metrics for all services

### Environment Configuration

Production environment variables are managed through:
- AWS Parameter Store (for secrets)
- ECS Task Definition (for non-sensitive config)

Key variables:
```env
# Database (from Parameter Store)
DATABASE_TYPE=postgres
DATABASE_HOST=${RDS_ENDPOINT}
DATABASE_PORT=5432
DATABASE_NAME=flowstack
DATABASE_USER=flowstack_admin
DATABASE_PASSWORD=${SECURE_PASSWORD}
DATABASE_SSL=true

# Application
FLOWISE_USERNAME=admin@example.com
FLOWISE_PASSWORD=${SECURE_PASSWORD}
APIKEY_PATH=/root/.fastflow
SECRETKEY_PATH=/root/.fastflow
LOG_PATH=/root/.fastflow/logs
BLOB_STORAGE_PATH=/root/.fastflow/storage
```

### Deployment Stages

1. **Development**
   - Branch: Any non-main branch
   - Infrastructure: Minimal (1 task, smaller RDS)
   - URL: `http://{ALB_DNS_NAME}`

2. **Production**
   - Branch: main
   - Infrastructure: Full HA (2 tasks, Multi-AZ RDS)
   - URL: `http://{ALB_DNS_NAME}`

## Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 8080 are free
2. **Build failures**: Run `pnpm nuke` then `pnpm install`
3. **Proxy not reflecting changes**: Restart with `pnpm dev`
4. **Database errors**: Check PostgreSQL is running and credentials are correct
5. **Docker build failures**: Ensure Docker daemon is running and has sufficient resources
6. **Terraform state locks**: Check S3 backend and DynamoDB lock table
7. **ECS deployment stuck**: Check CloudWatch logs for task failures
8. **Container health check failures**: Verify database connectivity and environment variables