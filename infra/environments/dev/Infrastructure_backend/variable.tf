variable "aws_region" {
    description = "The AWS region to deploy resources in"
    type        = string
    default     = "us-east-1"  
}

variable "bucket_name" {
    description = "The name of the S3 bucket to be created for Terraform state storage"
    type        = string
    default     = "my-terraform-state-bucket-infres-za-999"
  
}

variable "environment" {
    description = "The environment for which the resources are being created (e.g., dev, staging, prod)"
    type        = string
    default     = "dev"
  
}

variable "dynamodb_table_name" {
    description = "The name of the DynamoDB table to be created for Terraform state locking"
    type        = string
    default     = "my-terraform-state-locking-table-infres-za-999"
  
}