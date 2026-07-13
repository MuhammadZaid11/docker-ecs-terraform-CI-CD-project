output "bucket_id" {
    description = "The ID of the S3 bucket created for Terraform state storage"
    value       = aws_s3_bucket.state_bucket.id
  
}

output "dynamodb_table_id" {
    description = "The ID of the DynamoDB table created for Terraform state locking"
    value       = aws_dynamodb_table.my_state_locking_table.id
  
}
  
