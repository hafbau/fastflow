# Store SMTP password securely in AWS Parameter Store
resource "aws_ssm_parameter" "smtp_password" {
  name        = "/${var.stage}/flowstack/smtp/password"
  description = "SMTP password for email sending"
  type        = "SecureString"
  value       = var.smtp_password
  
  tags = {
    Name = "${var.stage}-smtp-password"
  }
}