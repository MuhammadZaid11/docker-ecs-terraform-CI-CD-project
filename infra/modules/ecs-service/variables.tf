# variables.tf
variable "project_name" { 
    type = string 
    description = "Project name used as prefix for resources"
}

variable "service_name" { 
    type = string 
    description = "Name of the ECS service"
    }
variable "cluster_id" { 
    type = string 
    description = "ID of the ECS cluster"
}
variable "image_url" { 
    type = string 
    description = "URL of the Docker image to use"
}
variable "container_port" { 
    type = number 
    description = "Port on which the container listens"
}
variable "cpu" { 
    type = number 
    default = 256 
    description = "CPU units for the task definition"
}
variable "memory" { 
    type = number 
    default = 512 
    description = "Memory in MiB for the task definition"
}
variable "desired_count" { 
    type = number 
    default = 1 
    description = "Number of task instances to run"
}
variable "private_subnet_ids" { 
    type = list(string) 
    description = "List of private subnet IDs"
}
variable "ecs_sg_id" { 
    type = string 
    description = "Security group ID for ECS tasks"
}
variable "target_group_arn" { 
    type = string 
    description = "ARN of the target group to use for load balancing"
}
variable "aws_region" { 
    type = string 
    description = "AWS region where resources are deployed"
}
variable "environment_vars" {
  type    = list(object({ name = string, value = string }))
  default = []
}
variable "secrets" {
  type    = list(object({ name = string, valueFrom = string }))
  default = []
}
variable "secret_arn" {
  type    = string
  default = ""
}