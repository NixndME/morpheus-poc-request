#!/bin/bash

# =============================================================================
# Morpheus POC License Request Tool - Local Testing Script
# Run this on your Mac to test the full stack locally
# =============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Morpheus POC License Request Tool - Local Test        ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}Cleaning up...${NC}"
    docker-compose down
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Parse arguments
REBUILD=false
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --rebuild|-r) REBUILD=true ;;
        --help|-h)
            echo "Usage: ./test-local.sh [options]"
            echo ""
            echo "Options:"
            echo "  -r, --rebuild    Force rebuild of Docker images"
            echo "  -h, --help       Show this help message"
            exit 0
            ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Stop any existing containers
echo -e "${YELLOW}Stopping existing containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start
if [ "$REBUILD" = true ]; then
    echo -e "${YELLOW}Building images (forced rebuild)...${NC}"
    docker-compose build --no-cache
else
    echo -e "${YELLOW}Building images...${NC}"
    docker-compose build
fi

echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to start...${NC}"
sleep 5

# Check health
echo -e "${YELLOW}Checking health...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend is healthy${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ Backend failed to start${NC}"
        docker-compose logs app
        exit 1
    fi
    sleep 2
done

# Show status
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ All services started successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}Frontend:${NC}        http://localhost:3001"
echo -e "  ${YELLOW}API:${NC}             http://localhost:3001/api/poc-requests"
echo -e "  ${YELLOW}Health:${NC}          http://localhost:3001/health"
echo -e "  ${YELLOW}Admin Password:${NC}  morpheupassword"
echo ""
echo -e "  ${YELLOW}Database:${NC}"
echo -e "    Host: localhost:5432"
echo -e "    DB:   morpheus_poc"
echo -e "    User: admin"
echo -e "    Pass: localdev123"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop...${NC}"
echo ""

# Show logs
docker-compose logs -f
