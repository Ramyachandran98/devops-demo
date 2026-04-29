# GitHub Actions Kubernetes Deployment Setup

## Prerequisites

The `kubernetes-deploy.yml` workflow now automatically deploys to your cluster. To enable it, choose one option:

### Option 1: Local Kubernetes (Docker Desktop / Minikube)

For self-hosted runners with local Kubernetes:

```bash
# Get your kubeconfig
cat ~/.kube/config | base64

# Add to GitHub Secrets as KUBE_CONFIG
# Then update the workflow to use it
```

Update workflow step:
```yaml
- name: Configure kubectl
  run: |
    mkdir -p $HOME/.kube
    echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config
    chmod 600 $HOME/.kube/config
```

### Option 2: Cloud Kubernetes (AWS EKS, GCP GKE, Azure AKS)

#### AWS EKS Example:
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Update kubeconfig
  run: |
    aws eks update-kubeconfig --name my-cluster --region us-east-1
```

#### GCP GKE Example:
```yaml
- name: Set up Cloud SDK
  uses: google-github-actions/setup-gcloud@v1
  with:
    service_account_key: ${{ secrets.GCP_SA_KEY }}

- name: Get GKE credentials
  run: |
    gcloud container clusters get-credentials my-cluster --zone us-central1-a
```

### Option 3: Self-Hosted Runner

If using a self-hosted runner on your Kubernetes node:

1. Set up GitHub self-hosted runner with kubectl installed
2. Workflow will use local kubeconfig automatically

## GitHub Secrets to Add

For your chosen option, add these to GitHub repo settings (Settings → Secrets and variables → Actions):

- `KUBE_CONFIG` (base64 encoded kubeconfig)
- `AWS_ACCESS_KEY_ID` (if using AWS)
- `AWS_SECRET_ACCESS_KEY` (if using AWS)
- `GCP_SA_KEY` (if using GCP)

## How It Works

1. **Push to main branch** → Workflow triggers
2. **Builds Docker images** with commit SHA
3. **Tags as latest**
4. **Applies all K8s manifests** to your cluster
5. **Waits for deployments** to be ready (5 min timeout)
6. **Verifies** all pods and services are running

## Verify Deployment

After workflow completes:

```bash
# Check pods
kubectl get pods

# Check services
kubectl get svc

# Check logs
kubectl logs -l app=user-service
kubectl logs -l app=product-service
kubectl logs -l app=order-service

# Port forward for local testing
kubectl port-forward svc/order-service 3003:3003
curl http://localhost:3003/health
```

## Troubleshooting

If deployment fails:
- Check GitHub Actions logs for error messages
- Verify kubeconfig is correct
- Ensure your cluster is reachable from GitHub (or self-hosted runner)
- Check that images are using `imagePullPolicy: Never` for local testing
