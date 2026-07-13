module "ecr_backend" {
  source    = "../../modules/ecr"
  repo_name = "mern-backend"
}

module "ecr_frontend" {
  source    = "../../modules/ecr"
  repo_name = "mern-frontend"
}

module "vpc" {
  source               = "../../modules/vpc"
  project_name         = var.project_name
  vpc_cidr             = "10.0.0.0/16"
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
  azs                  = ["us-east-1a", "us-east-1b"]
}

module "security" {
  source       = "../../modules/security"
  project_name = var.project_name
  vpc_id       = module.vpc.vpc_id
}

module "alb" {
  source            = "../../modules/alb"
  project_name      = var.project_name
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  alb_sg_id         = module.security.alb_sg_id
  backend_port      = 5000
  frontend_port     = 80
}

module "ecs_cluster" {
  source       = "../../modules/ecs_cluster"
  project_name = var.project_name
}

# MongoDB URI stored securely — you'll set the actual value via AWS CLI or console, not in code
resource "aws_secretsmanager_secret" "mongo_uri" {
  name = "${var.project_name}/mongo-uri"
}

module "ecs_backend" {
  source             = "../../modules/ecs_service"
  service_name       = "mern-backend"
  cluster_id         = module.ecs_cluster.cluster_id
  image_url          = "${module.ecr_backend.repository_url}:latest"
  container_port     = 5000
  private_subnet_ids = module.vpc.private_subnet_ids
  ecs_sg_id          = module.security.ecs_sg_id
  target_group_arn   = module.alb.backend_tg_arn
  aws_region         = var.aws_region
  secret_arn         = aws_secretsmanager_secret.mongo_uri.arn
  enable_secrets_policy = true
  secrets = [{
    name      = "MONGO_URI"
    valueFrom = aws_secretsmanager_secret.mongo_uri.arn
  }]
}

module "ecs_frontend" {
  source             = "../../modules/ecs_service"
  service_name       = "mern-frontend"
  cluster_id         = module.ecs_cluster.cluster_id
  image_url          = "${module.ecr_frontend.repository_url}:latest"
  container_port     = 80
  private_subnet_ids = module.vpc.private_subnet_ids
  ecs_sg_id          = module.security.ecs_sg_id
  target_group_arn   = module.alb.frontend_tg_arn
  aws_region         = var.aws_region
}


module "github_oidc" {
  source     = "../../modules/github-oidc"
  github_org = "your-github-username"   # replace with yours
}