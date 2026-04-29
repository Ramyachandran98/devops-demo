# Quick Reference for Microservices

## 🚀 Quick Start Commands

### Docker Compose (Recommended for local dev)
```bash
docker-compose up --build
```

### Individual Services (Node.js)
```bash
# Terminal 1
cd services/user-service && npm start

# Terminal 2
cd services/product-service && npm start

# Terminal 3
cd services/order-service && npm start
```

## 📋 API Quick Reference

### User Service (port 3001)
```bash
# Get all users
curl http://localhost:3001/users

# Get specific user
curl http://localhost:3001/users/1

# Create user
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# Health check
curl http://localhost:3001/health
```

### Product Service (port 3002)
```bash
# Get all products
curl http://localhost:3002/products

# Get specific product
curl http://localhost:3002/products/101

# Create product
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"stock":10}'

# Health check
curl http://localhost:3002/health
```

### Order Service (port 3003)
```bash
# Get all orders
curl http://localhost:3003/orders

# Get specific order (returns user + product details)
curl http://localhost:3003/orders/1001

# Create order
curl -X POST http://localhost:3003/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"productId":101,"quantity":2}'

# Health check
curl http://localhost:3003/health
```

## 🐳 Docker Commands

### Build individual images
```bash
docker build -t user-service:latest ./services/user-service
docker build -t product-service:latest ./services/product-service
docker build -t order-service:latest ./services/order-service
```

### Run individual containers
```bash
docker run -p 3001:3001 user-service:latest
docker run -p 3002:3002 product-service:latest
docker run -p 3003:3003 \
  -e USER_SERVICE_URL=http://user-service:3001 \
  -e PRODUCT_SERVICE_URL=http://product-service:3002 \
  order-service:latest
```

## ☸️ Kubernetes Commands

### Deploy all services
```bash
kubectl apply -f k8s/user-service-deployment.yaml
kubectl apply -f k8s/product-service-deployment.yaml
kubectl apply -f k8s/order-service-deployment.yaml
```

### Check status
```bash
kubectl get pods
kubectl get svc
kubectl get deployments
```

### View logs
```bash
kubectl logs -l app=user-service
kubectl logs -l app=product-service
kubectl logs -l app=order-service
```

### Port forward for local testing
```bash
kubectl port-forward svc/user-service 3001:3001 &
kubectl port-forward svc/product-service 3002:3002 &
kubectl port-forward svc/order-service 3003:3003 &
```

### Delete deployments
```bash
kubectl delete -f k8s/
```

## 📦 Project Structure Explained

- **services/** - 3 independent microservices
  - Each has its own app.js, package.json, and Dockerfile
  - User Service: Manages users
  - Product Service: Manages products
  - Order Service: Orchestrates between the two

- **k8s/** - Kubernetes manifests
  - Each service has deployment + service definitions
  - 2 replicas per service for high availability
  - Health checks configured

- **.github/workflows/** - CI/CD pipelines
  - ci-cd.yml: Tests and builds on push
  - kubernetes-deploy.yml: K8s deployment workflow

- **docker-compose.yml** - Local orchestration
  - All services run with proper networking

## 🔍 Service Communication

- **Order Service** calls User Service at: `http://user-service:3001`
- **Order Service** calls Product Service at: `http://product-service:3002`
- Services communicate via HTTP REST APIs
- In Docker Compose: service names resolve automatically
- In Kubernetes: uses Service DNS names within cluster

## 📝 Environment Variables

Each service can be configured:
- `PORT` - Service port (default: 3001/3002/3003)
- Order Service also needs:
  - `USER_SERVICE_URL`
  - `PRODUCT_SERVICE_URL`

## ✅ Testing Workflow

1. Start services: `docker-compose up --build`
2. Create a user: POST to /users
3. Create a product: POST to /products
4. Create an order with the user and product IDs
5. Get order details: GET /orders/{id} (returns enriched data)
