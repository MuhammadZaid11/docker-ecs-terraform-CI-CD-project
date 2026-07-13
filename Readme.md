# GitLab CI/CD Pipeline for a MERN Application on AWS

A reference implementation of a CI/CD pipeline (GitLab CI) for deploying a MERN (MongoDB, Express, React, Node) application to AWS. This repository contains application code, Dockerfiles, and Terraform (HCL) infrastructure-as-code to provision AWS resources and automate build, test, image publish, and deployment stages.

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local development](#local-development)
- [GitLab CI/CD pipeline overview](#gitlab-cicd-pipeline-overview)
- [Environment & CI variables](#environment--ci-variables)
- [Terraform notes (infra)](#terraform-notes-infra)
- [Docker notes](#docker-notes)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview
This project demonstrates how to build a robust CI/CD workflow for a MERN app using:
- GitLab CI for pipeline orchestration
- Docker images for frontend/backend
- Terraform for provisioning AWS infrastructure (ECR, ECS/EC2, networking, optional RDS)
- AWS as the deployment target

The pipeline builds code, runs tests, builds and pushes Docker images to an image registry, and uses Terraform to create/update infrastructure and deploy the latest images.

## Architecture
- Source: GitLab repository (this project)
- CI: GitLab CI pipeline with stages: build, test, image-build, image-push, infra-plan, infra-apply, deploy
- Container registry: AWS ECR (or GitLab Container Registry)
- Compute: AWS ECS (Fargate) or EC2-based deployment (Terraform scripts are provided to provision resources — adapt to your preferred target)
- Database: MongoDB (self-managed on EC2, managed MongoDB Atlas, or hosted on RDS if using a compatible engine) — adjust according to terraform code in `infra/` if present

## Repository layout
- `backend/` — Node/Express API (server)
- `frontend/` — React app
- `Dockerfile` / `backend/Dockerfile` / `frontend/Dockerfile` — image definitions
- `infra/` — Terraform HCL files for AWS resources
- `.gitlab-ci.yml` — GitLab CI pipeline definition (example)
- `README.md` — This file

(If any of these paths differ in your repo, update sections accordingly.)

## Tech stack
- Node.js / npm
- React
- Express
- MongoDB
- Docker
- Terraform (HCL)
- GitLab CI
- AWS (ECR, ECS, EC2, IAM, VPC, optionally RDS/S3/DynamoDB)

## Prerequisites
- Git
- Node.js (v14+ or as required by project)
- npm or yarn
- Docker (for local image builds)
- Terraform (for infra provisioning)
- AWS CLI (for testing locally)
- A GitLab repository and CI runner (GitLab.com or self-hosted)
- AWS account with programmatic access (AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY)

## Local development
1. Clone the repo
   git clone https://github.com/MuhammadZaid11/GitLab-CI-CD-Pipeline-for-a-MERN-Application-on-AWS.git
2. Backend
   - cd backend
   - copy `.env.example` to `.env` and set values (PORT, MONGO_URI, JWT secrets, etc.)
   - npm install
   - npm run dev
3. Frontend
   - cd frontend
   - copy `.env.example` to `.env` and set REACT_APP_API_URL
   - npm install
   - npm start

You can run services separately, or use Docker Compose if a compose file is included.

## GitLab CI/CD pipeline overview
A typical pipeline contains these stages:
- lint/test: run linters and unit tests for frontend and backend
- build: compile frontend (create production build)
- docker-build: build Docker images for backend and frontend
- docker-push: tag and push images to registry (ECR or GitLab Container Registry)
- infra-plan: run `terraform plan` to preview changes
- infra-apply: run `terraform apply` (usually protected; run manually or on main branch)
- deploy: update services (ECS service update or remote deploy script)

Example .gitlab-ci.yml snippet (conceptual):
```yaml
stages:
  - test
  - build
  - image
  - infra
  - deploy

variables:
  AWS_REGION: "us-east-1"

test:
  stage: test
  script:
    - cd backend && npm ci && npm test
    - cd frontend && npm ci && npm test

docker-build:
  stage: image
  image: docker:latest
  services: 
    - docker:dind
  script:
    - docker build -t $ECR_REPO_URI/backend:$CI_COMMIT_SHORT_SHA backend
    - docker build -t $ECR_REPO_URI/frontend:$CI_COMMIT_SHORT_SHA frontend

docker-push:
  stage: image
  image: docker:latest
  services:
    - docker:dind
  script:
    - $(aws ecr get-login --no-include-email --region $AWS_REGION)
    - docker push $ECR_REPO_URI/backend:$CI_COMMIT_SHORT_SHA
    - docker push $ECR_REPO_URI/frontend:$CI_COMMIT_SHORT_SHA

terraform-plan:
  stage: infra
  image: hashicorp/terraform:light
  script:
    - cd infra
    - terraform init -backend-config="bucket=$TF_STATE_BUCKET" ...
    - terraform plan -out=tfplan

terraform-apply:
  stage: infra
  when: manual
  image: hashicorp/terraform:light
  script:
    - cd infra
    - terraform apply -input=false tfplan

deploy:
  stage: deploy
  script:
    - ./scripts/deploy.sh $ECR_REPO_URI backend $CI_COMMIT_SHORT_SHA
```
Adjust the snippet to match your repo structure and AWS target.

## Environment & CI variables
Set the following in GitLab CI/CD Settings > CI/CD > Variables (masked/protected where appropriate):
- AWS_ACCESS_KEY_ID — AWS API key
- AWS_SECRET_ACCESS_KEY — AWS secret
- AWS_REGION — e.g., us-east-1
- ECR_REPO_URI — account-id.dkr.ecr.region.amazonaws.com/your-repo
- TF_STATE_BUCKET — S3 bucket name if using remote state
- TF_VAR_db_password, TF_VAR_db_username — terraform input variables (if used)
- DOCKER_USERNAME/DOCKER_PASSWORD — if using external registry
- Any application-specific secrets (JWT_SECRET, MONGO_URI, etc.)

Use GitLab CI/CD protected variables for production branches.

## Terraform notes (infra)
- `infra/` contains HCL to provision AWS resources. Before running:
  - Create and configure an S3 bucket (and optionally a DynamoDB table) for Terraform state locking (recommended for team use)
  - Set backend configuration via environment variables or `backend.tfvars`
- Typical terraform flow:
  - terraform init
  - terraform validate
  - terraform plan -out=tfplan
  - terraform apply tfplan
- Inspect and adapt the Terraform files to match naming, VPC, subnet, and security rules appropriate for your account and security posture.

## Docker notes
- Build locally:
  - docker build -t mern-backend:local ./backend
  - docker run -p 5000:5000 --env-file backend/.env mern-backend:local
- Multi-stage Dockerfiles are recommended for smaller image sizes.
- Tag images with commit SHA or semantic tags in CI for traceability.

## Troubleshooting
- IAM permissions: ensure CI AWS credentials have permissions to push to ECR, create/update ECS (or EC2), and manage required Terraform resources.
- Terraform state: if plan/apply fails due to state conflicts, check S3 backend and DynamoDB locking.
- Docker in CI: enable docker:dind and pass privileged where required (or use BuildKit or GitLab’s Container Registry to avoid dind).
- Networking: if containers cannot access DB, verify security groups, subnets, and that environment variables (hostnames) are correct.

## Contributing
Contributions are welcome. Suggested workflow:
1. Fork the repo
2. Create a branch: `feature/your-feature`
3. Run tests and linting locally
4. Open a PR with a clear description

Please include Terraform and Docker changes in small, reviewable commits.

## License
This project is provided under the MIT License. See LICENSE for details.
