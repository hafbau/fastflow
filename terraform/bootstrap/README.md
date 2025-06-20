# Bootstrap Terraform Configuration

This directory contains the bootstrap configuration that creates the GitHub Actions IAM role and OIDC provider.

## Setup Steps

### 1. Initial Bootstrap (Run Once)

This step creates the IAM role that GitHub Actions will use. Run this locally with admin AWS credentials:

```bash
cd terraform/bootstrap
terraform init
terraform plan
terraform apply
```

This will output the role ARN. Copy this ARN for step 2.

### 2. Update GitHub Actions Workflow

Update `.github/workflows/terraform-deploy.yml` with the output role ARN:

```yaml
role-to-assume: arn:aws:iam::223131393841:role/GitHubActionsTerraformRole
```

### 3. Run Main Terraform

Now GitHub Actions can run the main terraform configuration with the proper permissions.

## What This Creates

- **OIDC Provider**: Allows GitHub Actions to authenticate with AWS
- **IAM Role**: `GitHubActionsTerraformRole` with comprehensive permissions
- **IAM Policy**: Permissions for VPC, ECS, RDS, ELB, EFS, CloudWatch, etc.

## Security

- Role can only be assumed by your specific GitHub repository
- Includes deny statements to prevent accidental deletion of the role itself
- Follows principle of least privilege for Terraform operations

## Repository Configuration

Make sure your repository name matches in the assume role policy:
- Current: `repo:hafizsuara/flowstack:*`
- Update if your repo path is different