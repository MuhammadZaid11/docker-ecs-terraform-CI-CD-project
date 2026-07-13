# outputs.tf
output "backend_repo_url" {
  value = module.ecr_backend.repository_url
}

output "frontend_repo_url" {
  value = module.ecr_frontend.repository_url
}

output "alb_dns_name" {
  value = module.alb.alb_dns_name
}