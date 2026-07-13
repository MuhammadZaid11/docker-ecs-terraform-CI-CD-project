variable "project_name" {
  description = "Short name used as a prefix for all resources (VPC, ALB, ECS cluster, etc.)"
  type        = string
  default     = "mern-devops"
}

variable "aws_region" {
  description = "AWS region where all infrastructure will be created"
  type        = string
  default     = "us-east-1"
}