variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "description"
}

variable "service_name" {
  type = string
}

variable "cluster_id" {
  type = string
}

variable "image_url" {
  type = string
}

variable "container_port" {
  type = number
}

variable "cpu" {
  type    = number
  default = 256
}

variable "memory" {
  type    = number
  default = 512
}

variable "desired_count" {
  type    = number
  default = 1
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_sg_id" {
  type = string
}

variable "target_group_arn" {
  type = string
}

variable "environment_vars" {
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "secrets" {
  type = list(object({
    name      = string
    valueFrom = string
  }))
  default = []
}

variable "secret_arn" {
  type    = string
  default = ""
}

variable "enable_secrets_policy" {
  type        = bool
  default     = false
  description = "Whether to attach Secrets Manager access policy to the ECS task execution role"
}