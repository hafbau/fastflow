#!/bin/bash

echo "🔍 Verifying FlowStack Deployment Status"
echo "========================================"

# Check if changes are committed
echo "1. Checking Git status..."
git status --short

# Check latest commit
echo -e "\n2. Latest commit:"
git log -1 --oneline

# Check if image needs building
echo -e "\n3. Docker image status:"
docker images leadevs/fastflow --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}"

# Check GitHub Actions status
echo -e "\n4. Recent GitHub Actions (if gh CLI is available):"
if command -v gh &> /dev/null; then
    gh run list --workflow="Docker Build & Push" --limit=3
else
    echo "GitHub CLI not installed. Check https://github.com/FlowiseAI/Flowise/actions"
fi

echo -e "\n5. To force ECS update after new image is pushed:"
echo "aws ecs update-service --cluster prod-flowstack-cluster --service fastflow-service --force-new-deployment --region us-east-1"

echo -e "\n6. Key files changed that need to be in the new image:"
echo "- core/packages/server/src/DataSource.ts (SSL handling)"
echo "- Dockerfile (canvas dependencies)"

echo -e "\n7. Current Terraform environment variables for SSL:"
grep -A2 -B2 "DATABASE_SSL" terraform/main.tf | head -10