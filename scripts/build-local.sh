#!/bin/bash

# Build FlowStack Docker image locally for testing

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Building FlowStack locally...${NC}"

# Build Docker image
echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t flowstack:latest .

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to build Docker image${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Successfully built FlowStack locally!${NC}"
echo -e "${GREEN}📍 Image: flowstack:latest${NC}"

# Test the image locally
echo -e "${YELLOW}🧪 Testing locally (optional - press Ctrl+C to skip)...${NC}"
echo -e "${YELLOW}Run: docker run -p 3000:3000 --rm flowstack:latest${NC}"