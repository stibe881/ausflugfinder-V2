#!/bin/bash
# Run this on docker01 to clean up disk space and redeploy

echo "=== Docker Cleanup and Redeploy ==="
echo ""

echo "1. Checking disk space before cleanup..."
df -h

echo ""
echo "2. Stopping all containers..."
docker-compose down

echo ""
echo "3. Removing unused Docker resources..."
docker system prune -af --volumes

echo ""
echo "4. Checking disk space after cleanup..."
df -h

echo ""
echo "5. Rebuilding Docker image (with --no-cache)..."
docker-compose build --no-cache

echo ""
echo "6. Starting services..."
docker-compose up -d

echo ""
echo "7. Verifying services are running..."
docker-compose ps

echo ""
echo "8. Checking for startup errors..."
docker-compose logs app | head -50

echo ""
echo "Done!"
