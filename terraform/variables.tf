variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1" # Or your preferred region
}

variable "stage" {
  description = "Environment stage (e.g., dev, staging, prod)"
  type        = string
  default     = "dev"
}

# RDS Variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro" # For dev/testing, use larger for production
}

variable "db_allocated_storage" {
  description = "Initial allocated storage for RDS (GB)"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Maximum allocated storage for RDS autoscaling (GB)"
  type        = number
  default     = 100
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "flowstack_admin"
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  default     = "ChangeMe123SecurePassword" # Change this for production!
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks (set to 0 to stop the service)"
  type        = number
  default     = 2 # Set to 2 for high availability
}

variable "domain_name" {
  description = "Domain name for the application (optional, required for HTTPS)"
  type        = string
  default     = "studio.getflowstack.ai" # Set this to enable HTTPS
}

variable "smtp_password" {
  description = "SMTP password for email sending"
  type        = string
  sensitive   = true
  default     = "" # Set via environment variable TF_VAR_smtp_password
}
