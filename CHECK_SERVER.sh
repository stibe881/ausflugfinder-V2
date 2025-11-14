#!/bin/bash
# Run this on docker01 server to check logs

echo "Checking Docker services..."
docker-compose ps

echo ""
echo "Checking recent logs (last 50 lines)..."
docker-compose logs app | tail -50

echo ""
echo "Searching for Auth Logout logs..."
docker-compose logs app | grep -E "(Auth Logout|Error Handler|Cookie|logout)" || echo "No logout logs found"

echo ""
echo "Searching for errors..."
docker-compose logs app | grep -i "error" | tail -20 || echo "No errors found"
