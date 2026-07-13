variable "project_name" {
	type        = string
	description = "Project name used as prefix for resources"
}

variable "vpc_cidr" {
	type        = string
	description = "CIDR block for the VPC, e.g. 10.0.0.0/16"
}

variable "public_subnet_cidrs" {
	type        = list(string)
	description = "List of CIDR blocks for public subnets"
}

variable "private_subnet_cidrs" {
	type        = list(string)
	description = "List of CIDR blocks for private subnets"
}

variable "azs" {
	type        = list(string)
	description = "List of availability zones to place subnets in"
}