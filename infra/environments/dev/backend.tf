terraform {
  backend "s3" {
    bucket = "my-terraform-state-bucket-infres-za-999"
    key    = "project/terraform.tfstate"

    region         = "us-east-1"
    dynamodb_table = "my-terraform-state-locking-table-infres-za-999"

  }
}