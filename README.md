# DevOps Demo Project

A complete CI/CD pipeline demo with Node.js, Docker, Kubernetes, and GitHub Actions.

## Project Structure

```
.
├── app.js                          # Node.js HTTP server
├── package.json                    # Node.js dependencies
├── Dockerfile                      # Docker configuration
├── k8s/
│   ├── deployment.yaml            # Kubernetes Deployment
│   └── service.yaml               # Kubernetes Service
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
└── README.md
```

## Quick Start

### 1. Prerequisites
- Node.js 18+
- Docker
- Minikube (for local Kubernetes)
- GitHub account and git configured

### 2. Local Testing

**Test the Node.js app locally:**
```bash
npm install
npm start
# Server runs on http://localhost:3000
# Returns: "Hello from Minikube 🚀"
```

### 3. Build Docker Image

**Build locally:**
```bash
docker build -t my-dockerhub-username/devops-demo:latest .
```

**Test Docker image:**
```bash
docker run -p 3000:3000 my-dockerhub-username/devops-demo:latest
# Access at http://localhost:3000
```

### 4. Deploy to Kubernetes (Minikube)

**Start Minikube:**
```bash
minikube start
eval $(minikube docker-env)  # Use Minikube's Docker daemon
```

**Apply Kubernetes manifests:**
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

**Verify deployment:**
```bash
kubectl get pods
kubectl get svc
```

**Access the service:**
```bash
minikube service devops-demo-service
# Or get the NodePort URL:
kubectl port-forward svc/devops-demo-service 8080:80
# Access at http://localhost:8080
```

### 5. GitHub Actions CI/CD Setup

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/devops-demo.git
   git push -u origin main
   ```

2. **Configure GitHub Secrets:**
   - Go to Repository → Settings → Secrets and variables → Actions
   - Add `DOCKER_USERNAME`: your Docker Hub username
   - Add `DOCKER_PASSWORD`: your Docker Hub personal access token

3. **Trigger the pipeline:**
   - Make any commit push to main branch
   - GitHub Actions will automatically:
     - Build the Docker image
     - Login to Docker Hub
     - Push the image with tag `latest`

4. **Pull and deploy from Kubernetes:**
   ```bash
   # Update the deployment to use latest image
   kubectl set image deployment/devops-demo-deployment \
     devops-demo=your-username/devops-demo:latest --record
   ```

## Environment Variables

The app doesn't require environment variables but uses these defaults:
- Host: 0.0.0.0 (accessible from outside)
- Port: 3000

## Notes

- Kubernetes Service uses `NodePort` type for easy local testing
- Image pull policy is set to `Always` to fetch latest from registry
- The app responds with "Hello from Minikube 🚀" to all routes
- Replace `my-dockerhub-username` with your actual Docker Hub username everywhere

## Troubleshooting

**Image not pulling from Docker Hub:**
- Ensure DOCKER_USERNAME and DOCKER_PASSWORD secrets are set correctly
- Verify Docker image exists in your Docker Hub repository

**Pod stuck in ImagePullBackOff:**
- Check if image exists: `docker pull your-username/devops-demo:latest`
- Verify Minikube can reach Docker Hub (network connectivity)

**Service not accessible:**
- Check service status: `kubectl describe svc devops-demo-service`
- Use port-forward as alternative: `kubectl port-forward svc/devops-demo-service 8080:80`

## License

MIT
