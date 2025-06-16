# Makefile for Docker image building and pushing to ECR

# Variables
APP_NAME = realworld-apps
AWS_REGION ?= us-east-1
ECR_REPOSITORY = $(APP_NAME)
IMAGE_TAG ?= latest

# AWS account ID (will be determined dynamically)
AWS_ACCOUNT_ID = $(shell aws sts get-caller-identity --query 'Account' --output text)

# ECR repository URI
ECR_REGISTRY = $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(ECR_REPOSITORY)

# Docker image name with tag
DOCKER_IMAGE = $(ECR_REGISTRY):$(IMAGE_TAG)

.PHONY: help build push create-repo login-ecr build-and-push

help:
	@echo "Available commands:"
	@echo "  make build              - Build Docker image locally"
	@echo "  make create-repo        - Create ECR repository if it doesn't exist"
	@echo "  make login-ecr          - Login to AWS ECR"
	@echo "  make push               - Push Docker image to ECR"
	@echo "  make build-and-push     - Build and push Docker image to ECR"
	@echo ""
	@echo "Environment variables:"
	@echo "  AWS_REGION              - AWS region (default: ap-southeast-1)"
	@echo "  IMAGE_TAG               - Docker image tag (default: latest)"
	@echo "  AWS_ACCESS_KEY_ID       - AWS access key ID"
	@echo "  AWS_SECRET_ACCESS_KEY   - AWS secret access key"

# Build Docker image locally
build:
	@echo "Building Docker image..."
	docker buildx build -t $(APP_NAME):$(IMAGE_TAG) .

# Create ECR repository if it doesn't exist
create-repo:
	@echo "Checking if ECR repository exists..."
	@aws ecr describe-repositories --repository-names $(ECR_REPOSITORY) --region $(AWS_REGION) > /dev/null 2>&1 || \
	(echo "Creating ECR repository $(ECR_REPOSITORY)..." && \
	aws ecr create-repository --repository-name $(ECR_REPOSITORY) --region $(AWS_REGION)) || \
	(echo "Failed to create repository. Make sure you have the correct AWS credentials and permissions." && exit 1)
	@echo "Repository $(ECR_REPOSITORY) is ready."

# Login to AWS ECR
login-ecr:
	@echo "Logging in to AWS ECR..."
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(shell aws sts get-caller-identity --query 'Account' --output text).dkr.ecr.$(AWS_REGION).amazonaws.com

# Tag and push Docker image to ECR
push: login-ecr create-repo
	@echo "Tagging Docker image..."
	docker tag $(APP_NAME):$(IMAGE_TAG) $(DOCKER_IMAGE)
	@echo "Pushing Docker image to ECR..."
	docker push $(DOCKER_IMAGE)

# Build and push Docker image to ECR
build-and-push: build push
	@echo "Docker image built and pushed to ECR successfully!"
