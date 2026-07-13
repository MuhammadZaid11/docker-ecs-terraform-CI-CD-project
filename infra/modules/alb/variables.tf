variable "project_name" {
    type = string
    description = "Project name used as prefix for resources"
}
variable "vpc_id" {
    type = string
    description = "VPC ID"
}
variable "public_subnet_ids" {
    type = list(string)
    description = "List of public subnet IDs"
}
variable "alb_sg_id" {
    type = string
    description = "Security group ID for the ALB"
}
variable "backend_port" {
    type = number
    description = "Port for the backend service"
}
variable "frontend_port" {
    type = number
    description = "Port for the frontend service"
}