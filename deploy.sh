#!/bin/bash

# Mobile App Deployment Script
# This script deploys the Hajj mobile application

set -e  # Exit on any error

echo "================================================"
echo "   Hajj Mobile App Deployment"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Add SSH keys for git pull
echo -e "${YELLOW}Step 1: Adding SSH keys...${NC}"
ssh-add -D
ssh-add ~/.ssh/id_rsa_all
echo -e "${GREEN}✓ SSH keys added${NC}"

# Step 2: Pull latest code from repository
echo -e "${YELLOW}Step 2: Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code pulled successfully${NC}"

# Step 3: Install dependencies
echo -e "${YELLOW}Step 3: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 4: Build the application
echo -e "${YELLOW}Step 4: Building application...${NC}"
npm run build
echo -e "${GREEN}✓ Application built successfully${NC}"

# Step 5: Show build info
echo -e "${YELLOW}Step 5: Deployment summary${NC}"
echo "Build directory: dist/"
ls -lh dist/ | head -10

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}   Deployment completed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "  - Nginx will serve the files from: dist/"
echo "  - Clear browser cache to see changes"
echo ""
