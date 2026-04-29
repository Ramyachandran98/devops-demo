#!/bin/bash

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Microservices Testing Script ===${NC}\n"

# Start services in background
echo -e "${YELLOW}Starting services...${NC}"
cd services/user-service && npm install && npm start > /tmp/user-service.log 2>&1 &
USER_PID=$!
echo -e "${GREEN}✓ User Service started (PID: $USER_PID)${NC}"

cd ../product-service && npm install && npm start > /tmp/product-service.log 2>&1 &
PRODUCT_PID=$!
echo -e "${GREEN}✓ Product Service started (PID: $PRODUCT_PID)${NC}"

cd ../order-service && npm install && npm start > /tmp/order-service.log 2>&1 &
ORDER_PID=$!
echo -e "${GREEN}✓ Order Service started (PID: $ORDER_PID)${NC}"

# Wait for services to start
sleep 3

echo -e "\n${YELLOW}Testing endpoints...${NC}\n"

# Test User Service
echo -e "${BLUE}User Service (port 3001)${NC}"
curl -s http://localhost:3001/health | jq '.'
curl -s http://localhost:3001/users | jq '.'

echo ""

# Test Product Service
echo -e "${BLUE}Product Service (port 3002)${NC}"
curl -s http://localhost:3002/health | jq '.'
curl -s http://localhost:3002/products | jq '.'

echo ""

# Test Order Service
echo -e "${BLUE}Order Service (port 3003)${NC}"
curl -s http://localhost:3003/health | jq '.'
curl -s http://localhost:3003/orders | jq '.'

echo ""

# Cleanup
echo -e "${YELLOW}Cleaning up...${NC}"
kill $USER_PID $PRODUCT_PID $ORDER_PID 2>/dev/null
wait $USER_PID $PRODUCT_PID $ORDER_PID 2>/dev/null

echo -e "${GREEN}✓ All services stopped${NC}"
