# FlowStack Deployment Guide

## Prerequisites

1. Docker installed locally for testing
2. Docker Hub account with access to `leadevs/fastflow` repository
3. AWS account with configured credentials
4. GitHub repository with Actions enabled

## Default Seed User

The system comes with a default admin user:
- **Email**: hafiz@leadevs.com
- **Password**: Password1@#

**⚠️ IMPORTANT**: Change this password immediately after first login in production!

## Local Testing

### 1. Build and Test Locally

```bash
# Copy environment template
cp env.example .env

# Edit .env with your configuration
nano .env

# Start PostgreSQL and FlowStack
docker-compose up -d

# View logs
docker-compose logs -f flowstack
```

### 2. Verify the Application

- Open http://localhost:3000 in your browser
- Check health endpoint: `curl http://localhost:3000/api/v1/ping`
- Login with: hafiz@leadevs.com / Password1@#

## Production Deployment

### 1. Set Database Password

```bash
# Set a strong database password for Terraform
export TF_VAR_db_password="YourStrongPasswordHere123!@#"
```

### 2. Push to Docker Hub

```bash
# Login to Docker Hub
docker login

# Build and push the image
docker build -t leadevs/fastflow:latest .
docker push leadevs/fastflow:latest
```

### 3. Deploy Infrastructure with Terraform

```bash
cd terraform

# Initialize Terraform (if not already done)
terraform init

# Plan the deployment (includes RDS PostgreSQL)
terraform plan -var="region=us-east-1" -var="stage=prod"

# Apply the changes
terraform apply -var="region=us-east-1" -var="stage=prod"
```

### 4. Access Your Deployment

After successful deployment:
1. Get the ALB URL from Terraform output:
   ```bash
   terraform output external_url
   ```
2. Access FlowStack at the provided URL
3. Login with the seed user credentials

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| FLOWISE_USERNAME | Admin username | hafiz@leadevs.com |
| FLOWISE_PASSWORD | Admin password | Password1@# |
| DATABASE_TYPE | Database type | postgres |
| DATABASE_HOST | PostgreSQL host | localhost |
| DATABASE_PORT | PostgreSQL port | 5432 |
| DATABASE_NAME | Database name | flowstack |
| DATABASE_USER | Database user | flowstack_admin |
| DATABASE_PASSWORD | Database password | ChangeMe123!@# |
| DATABASE_SSL | Enable SSL for database | false (true for RDS) |

### Optional Variables

- **LLM Providers**: OPENAI_API_KEY, ANTHROPIC_API_KEY, etc.
- **Vector Databases**: PINECONE_API_KEY, WEAVIATE_URL, etc.
- **Other Services**: SERPAPI_API_KEY, ZAPIER_NLA_API_KEY, etc.

## Database Configuration

### Local Development (Docker Compose)

PostgreSQL runs as a separate container with:
- Host: postgres
- Port: 5432
- Database: flowstack
- User: flowstack_admin
- Password: ChangeMe123!@#

### Production (AWS RDS)

RDS PostgreSQL is automatically provisioned with:
- Engine: PostgreSQL 15.4
- Instance Class: db.t3.micro (configurable)
- Storage: 20GB with autoscaling to 100GB
- Automated backups: 7 days retention
- Encryption: Enabled
- Multi-AZ: Configurable

## Troubleshooting

### Container Won't Start

1. Check logs:
   ```bash
   docker logs <container-id>
   ```

2. Verify supervisord is running both services:
   ```bash
   docker exec <container-id> supervisorctl status
   ```

3. Check database connectivity:
   ```bash
   docker exec <container-id> pg_isready -h $DATABASE_HOST -p $DATABASE_PORT
   ```

### Database Connection Issues

1. Verify PostgreSQL is running:
   ```bash
   docker-compose ps postgres
   ```

2. Check database logs:
   ```bash
   docker-compose logs postgres
   ```

3. For RDS, check security groups allow connection from ECS tasks

### Health Check Failing

1. Ensure Flowise core is running on port 3001 internally
2. Verify proxy is forwarding requests correctly
3. Check `/var/log/flowise-core.out.log` in the container
4. Verify database connection is established

### Port Conflicts

The container runs:
- FlowStack Proxy on port 3000 (external facing)
- Flowise Core API on port 3001 (internal only)
- Flowise Core UI on port 8080 (internal only)
- PostgreSQL on port 5432 (local development only)

### AWS Deployment Issues

1. Check CloudWatch logs:
   ```bash
   aws logs tail /ecs/prod --follow
   ```

2. Verify ECS service status:
   ```bash
   aws ecs describe-services --cluster prod-ecs-cluster --services prod-fastflow-service
   ```

3. Check RDS status:
   ```bash
   aws rds describe-db-instances --db-instance-identifier prod-flowstack-db
   ```

## Security Considerations

1. **Change default credentials** immediately after deployment
2. **Use strong database passwords** - never use defaults in production
3. **Enable SSL for RDS** - already configured in Terraform
4. **Use secrets management** - AWS Parameter Store is configured for database credentials
5. **Enable HTTPS** on the ALB (SSL certificate already configured)
6. **Restrict security groups** to necessary IPs only
7. **Regular updates** - rebuild and redeploy for security patches
8. **Enable RDS encryption** - already enabled in Terraform

## Monitoring

1. **CloudWatch Logs**: All container logs are sent to CloudWatch
2. **ALB Metrics**: Monitor request counts, latency, and errors
3. **ECS Metrics**: Track CPU and memory usage
4. **RDS Metrics**: Monitor database performance, connections, and storage
5. **Health Checks**: ALB performs regular health checks on `/api/v1/ping`

## Updating FlowStack

To update your deployment:

1. Make changes to the code
2. Rebuild the Docker image
3. Push to Docker Hub
4. ECS will automatically deploy the new version

```bash
# Quick update script
docker build -t leadevs/fastflow:latest .
docker push leadevs/fastflow:latest
# ECS will pick up the new image automatically
```

## Database Migrations

Flowise handles database migrations automatically on startup. If you need to run manual migrations:

```bash
# Connect to container
docker exec -it <container-id> sh

# Run migrations
cd /usr/src/core
pnpm typeorm migration:run
``` 