#!/bin/bash

# Deploy FlowStack Docker image to ECR

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-"223131393841"}
STAGE=${STAGE:-"prod"}
ECR_REPO_NAME="${STAGE}-flowstack"
IMAGE_TAG=${IMAGE_TAG:-"latest"}

echo -e "${YELLOW}🚀 Starting FlowStack ECR deployment...${NC}"

# Get ECR login token
echo -e "${YELLOW}📝 Logging into ECR...${NC}"
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to login to ECR${NC}"
    exit 1
fi

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t ${ECR_REPO_NAME}:${IMAGE_TAG} .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

# Tag image for ECR
echo -e "${YELLOW}🏷️  Tagging image for ECR...${NC}"
docker tag ${ECR_REPO_NAME}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}

# Push image to ECR
echo -e "${YELLOW}📤 Pushing image to ECR...${NC}"
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to push Docker image to ECR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Successfully deployed FlowStack to ECR!${NC}"
echo -e "${GREEN}📍 Image URI: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}:${IMAGE_TAG}${NC}"

# Force ECS to update with new image
echo -e "${YELLOW}🔄 Updating ECS service...${NC}"
aws ecs update-service \
    --cluster ${STAGE}-ecs-cluster \
    --service ${STAGE}-fastflow-service \
    --force-new-deployment \
    --region ${AWS_REGION}

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to update ECS service${NC}"
    exit 1
fi

echo -e "${GREEN}✅ ECS service update initiated!${NC}"
echo -e "${YELLOW}⏳ The deployment will take a few minutes to complete.${NC}"