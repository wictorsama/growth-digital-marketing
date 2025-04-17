# Variables - update these for your environment
$AWS_REGION = "us-east-1"
$AWS_ACCOUNT_ID = "<your-aws-account-id>"
$ECR_REPO_NAME = "application-service"
$IMAGE_TAG = "latest"
$ECS_CLUSTER = "<your-ecs-cluster-name>"
$ECS_SERVICE = "<your-ecs-service-name>"

# Build Docker image
docker build -t $ECR_REPO_NAME:$IMAGE_TAG ../application

# Authenticate Docker to AWS ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Tag the image for ECR
docker tag $ECR_REPO_NAME:$IMAGE_TAG "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"

# Push the image to ECR
docker push "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:$IMAGE_TAG"

# Update ECS service to use the new image (assumes service uses latest tag)
aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment --region $AWS_REGION

Write-Host "Deployment script completed. Check your ECS service for rollout status."