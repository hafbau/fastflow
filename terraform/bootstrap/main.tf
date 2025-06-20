# Bootstrap Terraform Configuration
# This creates the GitHub Actions IAM role and should be applied first

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# GitHub OIDC Provider - Use existing one
data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

# GitHub Actions IAM Role
resource "aws_iam_role" "github_actions_terraform_role" {
  name = "GitHubActionsTerraformRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.aws_iam_openid_connect_provider.github_actions.arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:hafbau/fastflow:*"
          }
        }
      }
    ]
  })

  tags = {
    Name = "GitHubActionsTerraformRole"
  }
}

# Comprehensive IAM Policy for Terraform Operations
resource "aws_iam_policy" "terraform_operations" {
  name        = "TerraformOperationsPolicy"
  description = "Policy for GitHub Actions to manage AWS resources via Terraform"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          # VPC and Networking
          "ec2:*",
          
          # ECS
          "ecs:*",
          
          # ELB/ALB
          "elasticloadbalancing:*",
          
          # IAM (limited)
          "iam:CreateRole",
          "iam:DeleteRole", 
          "iam:GetRole",
          "iam:ListRoles",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:UpdateRole",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:ListAttachedRolePolicies",
          "iam:CreatePolicy",
          "iam:DeletePolicy",
          "iam:GetPolicy",
          "iam:ListPolicies",
          "iam:CreatePolicyVersion",
          "iam:DeletePolicyVersion",
          "iam:GetPolicyVersion",
          "iam:ListPolicyVersions",
          "iam:SetDefaultPolicyVersion",
          "iam:PutRolePolicy",
          "iam:GetRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:ListRolePolicies",
          "iam:PassRole",
          
          # RDS
          "rds:*",
          
          # EFS
          "elasticfilesystem:*",
          
          # CloudWatch Logs
          "logs:*",
          
          # S3 (for Terraform state if needed)
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket",
          
          # Route53 (if using custom domains)
          "route53:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach the policy to the role
resource "aws_iam_role_policy_attachment" "github_actions_terraform_policy" {
  role       = aws_iam_role.github_actions_terraform_role.name
  policy_arn = aws_iam_policy.terraform_operations.arn
}

# Output the role ARN for use in GitHub Actions
output "github_actions_role_arn" {
  value = aws_iam_role.github_actions_terraform_role.arn
  description = "ARN of the GitHub Actions IAM role"
}