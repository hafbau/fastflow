variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"  # Or your preferred region
}

variable "stage" {
  description = "Environment stage (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}