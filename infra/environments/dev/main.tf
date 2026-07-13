module "ecr_backend" {
  source    = "../../modules/ecr"
  repo_name = "mern-backend"
}

module "ecr_frontend" {
  source    = "../../modules/ecr"
  repo_name = "mern-frontend"
}