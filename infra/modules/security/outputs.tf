output "alb_sg_id" {
  value       = aws_security_group.alb.id
  description = "Security group ID for the ALB"
}

output "ecs_sg_id" {
  value       = aws_security_group.ecs_tasks.id
  description = "Security group ID for ECS tasks"
}
