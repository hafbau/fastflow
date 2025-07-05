# FlowStack Deployment Instructions (DockerHub)

## Building and Deploying to DockerHub

### Option 1: GitHub Actions (Recommended)
The project uses GitHub Actions to automatically build and push to DockerHub.

1. **Automatic Deployment** (on push to main/develop):
   - Push your changes to `main` or `develop` branch
   - GitHub Actions will automatically build and push to `leadevs/fastflow:latest`

2. **Manual Deployment** (via GitHub Actions):
   - Go to GitHub Actions tab
   - Select "Docker Build & Push" workflow
   - Click "Run workflow"
   - Choose Node version (default: 20)
   - Set tag version (default: latest)
   - Click "Run workflow"

### Option 2: Local Build and Push

1. **Build the image locally**:
   ```bash
   # Using docker-compose
   ./scripts/build-docker.sh
   
   # Or build directly
   docker build -t leadevs/fastflow:latest .
   ```

2. **Login to DockerHub**:
   ```bash
   docker login
   # Enter your DockerHub username and password
   ```

3. **Push to DockerHub**:
   ```bash
   docker push leadevs/fastflow:latest
   ```

### Option 3: Multi-platform Build (for ARM64 support)
```bash
# Setup buildx (one time)
docker buildx create --name mybuilder --use

# Build and push multi-platform image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --push \
  -t leadevs/fastflow:latest .
```

## After Pushing to DockerHub

The ECS service will automatically pull the new image on the next deployment or task refresh.

### Force ECS to Update

After pushing a new image to DockerHub with the same tag (e.g., `latest`):

```bash
# Force new deployment in ECS
aws ecs update-service \
  --cluster prod-flowstack-cluster \
  --service fastflow-service \
  --force-new-deployment \
  --region us-east-1
```

Or through Terraform:
```bash
cd terraform
terraform apply -var="region=us-east-1" -var="stage=prod" -replace="aws_ecs_service.flowstack"
```

## Important Notes

- **DockerHub Repository**: `leadevs/fastflow`
- **Default Tag**: `latest`
- **Supported Platforms**: linux/amd64, linux/arm64
- **No ECR**: This project uses DockerHub, not AWS ECR

## Required Secrets (for GitHub Actions)

Make sure these secrets are set in your GitHub repository:
- `DOCKERHUB_USERNAME`: Your DockerHub username
- `DOCKERHUB_TOKEN`: Your DockerHub access token (not password)