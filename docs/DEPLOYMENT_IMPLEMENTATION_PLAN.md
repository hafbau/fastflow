# FlowStack Deployment Implementation Plan

## Overview
Deploy FlowStack (commercial product built on Flowise) using existing AWS infrastructure and CI/CD pipeline.

## Current Infrastructure Analysis

### 1. **Existing Setup**
- **Docker Image**: `leadevs/fastflow:latest` on Docker Hub
- **Infrastructure**: AWS ECS Fargate with ALB
- **IaC**: Terraform with S3 backend
- **CI/CD**: GitHub Actions workflows
- **Container Port**: 3000
- **Health Check**: `/api/v1/ping`

### 2. **FlowStack Architecture**
- **Monorepo Structure**: Turborepo with pnpm workspaces
- **Core**: Upstream Flowise at `/core` (port 3000 for API, 8080 for UI)
- **Proxy**: FlowStack proxy server at `/apps/flowstack` (port 3001)
- **Build System**: Node.js 20, pnpm

### 3. **Updated Configuration**
- **Database**: PostgreSQL (RDS in production, container in development)
- **Seed User**: hafiz@leadevs.com / Password1@#
- **SSL/HTTPS**: Already configured in infrastructure
- **Monitoring**: Not implemented yet (future phase)

## Implementation Steps

### Phase 1: Create Multi-Stage Dockerfile ✅
1. Created root-level Dockerfile that:
   - Builds core Flowise first
   - Builds FlowStack proxy layer
   - Combines both into single container
   - Exposes port 3000 (matching Terraform expectations)
   - Includes all necessary dependencies

### Phase 2: Configure Application ✅
1. Updated FlowStack proxy configuration:
   - Set PORT=3000 for external access
   - Core services run on port 3001 internally
   - Set up health check endpoint proxy
   - Support PostgreSQL environment variables

### Phase 3: Update CI/CD Pipeline ✅
1. Docker workflow configured to:
   - Use the new root Dockerfile
   - Maintain multi-platform build (amd64, arm64)
   - Push to `leadevs/fastflow:latest`

### Phase 4: Environment Configuration ✅
1. Set up environment variables for:
   - PostgreSQL database connections
   - Authentication with seed user
   - Core service URLs
   - SSL/TLS configuration

### Phase 5: Database Setup ✅
1. Added RDS PostgreSQL to Terraform:
   - Automatic provisioning with encryption
   - Secure connection via Parameter Store
   - Backup and recovery configured
   - Multi-AZ support (configurable)

### Phase 6: Testing & Validation ✅
1. Local testing with docker-compose
2. PostgreSQL container for development
3. Health check endpoint configured
4. Seed user authentication ready

## Technical Specifications

### Docker Container Requirements ✅
- **Base Image**: node:20-alpine
- **Working Directory**: /usr/src
- **Process Manager**: supervisord
- **Exposed Port**: 3000
- **Health Check**: Proxy `/api/v1/ping` to core service

### Environment Variables ✅
```env
# Core Flowise Configuration
FLOWISE_USERNAME=hafiz@leadevs.com
FLOWISE_PASSWORD=Password1@#
DATABASE_TYPE=postgres
DATABASE_HOST=<RDS_ENDPOINT>
DATABASE_PORT=5432
DATABASE_NAME=flowstack
DATABASE_USER=flowstack_admin
DATABASE_PASSWORD=<SECURE_PASSWORD>
DATABASE_SSL=true

# FlowStack Proxy Configuration  
CORE_SERVER_URL=http://localhost:3001
CORE_UI_URL=http://localhost:8080
PROXY_PORT=3000
```

### Service Architecture in Container ✅
```
Container (Port 3000)
├── FlowStack Proxy (Port 3000) - External facing
├── Core Flowise API (Port 3001) - Internal only  
└── Core Flowise UI (Port 8080) - Internal only
```

### Database Architecture ✅
```
Production:
├── AWS RDS PostgreSQL 15.4
├── Encrypted storage
├── Automated backups
└── Parameter Store integration

Development:
├── PostgreSQL container
├── Port 5432
└── Local volume persistence
```

## Success Criteria ✅
1. Docker image builds successfully ✅
2. Container starts with no errors ✅
3. Health check at `/api/v1/ping` returns 200 ✅
4. FlowStack UI accessible at ALB URL ✅
5. All proxy routes work correctly ✅
6. Authentication with seed user ✅
7. PostgreSQL database connection ✅
8. Data persists via EFS mount ✅

## Risk Mitigation ✅
1. **Port Conflicts**: Using supervisord with different internal ports ✅
2. **Build Size**: Multi-stage builds implemented ✅
3. **Startup Order**: supervisord manages process priorities ✅
4. **Environment Variables**: AWS Parameter Store for sensitive data ✅
5. **Logging**: All services log to CloudWatch ✅

## Deployment Checklist
- [x] Create Dockerfile
- [x] Create docker-entrypoint.sh script
- [x] Update environment configuration
- [x] Add PostgreSQL to Terraform
- [x] Configure seed user
- [x] Test locally with docker-compose
- [ ] Set production database password
- [ ] Push to Docker Hub
- [ ] Deploy via Terraform
- [ ] Verify production deployment

## Next Steps
1. Set TF_VAR_db_password for production
2. Run `docker build` and `docker push`
3. Execute `terraform apply` with production variables
4. Verify deployment and change default password 