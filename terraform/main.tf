provider "aws" {
  region = var.region
}

data "aws_availability_zones" "available" {}

# Create VPC
resource "aws_vpc" "this" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.stage}-vpc"
  }
}

# Create Public Subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.this.id
  cidr_block              = element(["10.0.0.0/24", "10.0.1.0/24"], count.index)
  availability_zone       = element(data.aws_availability_zones.available.names, count.index)
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.stage}-public-subnet-${count.index + 1}"
  }
}

# Create Private Subnets
resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.this.id
  cidr_block        = element(["10.0.2.0/24", "10.0.3.0/24"], count.index)
  availability_zone = element(data.aws_availability_zones.available.names, count.index)

  tags = {
    Name = "${var.stage}-private-subnet-${count.index + 1}"
  }
}

# Create Internet Gateway
resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.stage}-igw"
  }
}

# Create Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.stage}-public-rt"
  }
}

# Create Public Route
resource "aws_route" "public_internet_access" {
  route_table_id         = aws_route_table.public.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.this.id
}

# Associate Route Table with Public Subnets
resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Create EIP for NAT Gateway
resource "aws_eip" "nat" {
  count  = 2
  domain = "vpc"

  tags = {
    Name = "${var.stage}-nat-eip-${count.index + 1}"
  }
}

# Create NAT Gateway
resource "aws_nat_gateway" "this" {
  count         = 2
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.stage}-nat-gw-${count.index + 1}"
  }
}

# Create Private Route Table
resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.stage}-private-rt-${count.index + 1}"
  }
}

# Create Private Route
resource "aws_route" "private_internet_access" {
  count                  = 2
  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.this[count.index].id
}

# Associate Route Table with Private Subnets
resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# Create Security Group for ALB
resource "aws_security_group" "alb_sg" {
  name        = "${var.stage}-public-lb-sg"
  description = "Access to public load balancer"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create Security Group for Container
resource "aws_security_group" "container_sg" {
  name        = "${var.stage}-container-sg"
  description = "Access to container service"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create Public Load Balancer
resource "aws_lb" "public" {
  name               = "${var.stage}-public-lb"
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  security_groups    = [aws_security_group.alb_sg.id]

  tags = {
    Name = "${var.stage}-public-lb"
  }
}

# Create Dummy Target Group (optional)
resource "aws_lb_target_group" "dummy" {
  name     = "${var.stage}-dummy-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.this.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    interval            = 6
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Create ACM Certificate (if domain is provided)
resource "aws_acm_certificate" "main" {
  count                     = var.domain_name != "" ? 1 : 0
  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${var.stage}-certificate"
  }
}

# Output DNS validation records for manual configuration
output "acm_certificate_validation_records" {
  description = "DNS validation records to be added to your DNS provider (e.g., GoDaddy)"
  value = var.domain_name != "" ? {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      value  = dvo.resource_record_value
    }
  } : {}
}

# Note: Certificate validation will remain pending until DNS records are added manually
# The HTTPS listener will not work until the certificate is validated

# Create Listener for Public Load Balancer (HTTP)
resource "aws_lb_listener" "public_listener" {
  load_balancer_arn = aws_lb.public.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = var.domain_name != "" ? "redirect" : "forward"
    
    # Redirect to HTTPS if domain is configured
    dynamic "redirect" {
      for_each = var.domain_name != "" ? [1] : []
      content {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
    
    # Forward to target group if no domain
    target_group_arn = var.domain_name != "" ? null : aws_lb_target_group.dummy.arn
  }
}

# Create HTTPS Listener (if domain is provided)
resource "aws_lb_listener" "public_listener_https" {
  count             = var.domain_name != "" ? 1 : 0
  load_balancer_arn = aws_lb.public.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS-1-2-2017-01"
  certificate_arn   = aws_acm_certificate.main[0].arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.dummy.arn
  }
  
  # Note: This listener will only work after the certificate is validated via DNS
}

# Create ECS Cluster
resource "aws_ecs_cluster" "this" {
  name = "${var.stage}-ecs-cluster"
}

# Create Security Group for EFS
resource "aws_security_group" "efs_sg" {
  name        = "${var.stage}-efs-sg"
  description = "Security group for EFS file system"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [aws_security_group.container_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Create EFS File System
resource "aws_efs_file_system" "this" {
  encrypted        = true
  performance_mode = "generalPurpose"
  throughput_mode  = "bursting"

  tags = {
    Name = "${var.stage}-efs"
  }
}

# Create EFS Mount Targets
resource "aws_efs_mount_target" "efs_mt" {
  count           = 2
  file_system_id  = aws_efs_file_system.this.id
  subnet_id       = aws_subnet.private[count.index].id
  security_groups = [aws_security_group.efs_sg.id]
}

# Create IAM Role for ECS Service
resource "aws_iam_role" "ecs_service_role" {
  name = "${var.stage}-ecs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })

}

# Attach CloudWatch policy to ECS Service Role
resource "aws_iam_role_policy_attachment" "ecs_cloudwatch_policy" {
  role       = aws_iam_role.ecs_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

# Attach Policy to ECS Service Role
resource "aws_iam_role_policy" "ecs_service_policy" {
  name = "ecs-service-policy"
  role = aws_iam_role.ecs_service_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Action = [
        "ec2:AttachNetworkInterface",
        "ec2:CreateNetworkInterface",
        "ec2:CreateNetworkInterfacePermission",
        "ec2:DeleteNetworkInterface",
        "ec2:DeleteNetworkInterfacePermission",
        "ec2:Describe*",
        "ec2:DetachNetworkInterface",
        "elasticloadbalancing:DeregisterInstancesFromLoadBalancer",
        "elasticloadbalancing:DeregisterTargets",
        "elasticloadbalancing:Describe*",
        "elasticloadbalancing:RegisterInstancesWithLoadBalancer",
        "elasticloadbalancing:RegisterTargets"
      ],
      Resource = "*"
    }]
  })
}

# Create IAM Role for ECS Task Execution
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.stage}-ecs-task-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })
}

# Attach Policy to ECS Task Execution Role
resource "aws_iam_role_policy" "ecs_task_execution_policy" {
  name = "ecs-task-execution-policy"
  role = aws_iam_role.ecs_task_execution_role.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "elasticfilesystem:ClientMount",
          "elasticfilesystem:ClientWrite",
          "elasticfilesystem:DescribeMountTargets",
          "elasticfilesystem:DescribeFileSystems"
        ],
        Resource = aws_efs_file_system.this.arn
      },
      {
        Effect = "Allow",
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ],
        Resource = [
          "arn:aws:ssm:${var.region}:*:parameter/${var.stage}/flowstack/db/*"
        ]
      }
    ]
  })
}

# Create CloudWatch Log Group
resource "aws_cloudwatch_log_group" "fastflow" {
  name              = "/ecs/${var.stage}"
  retention_in_days = 7
}

# Create ECS Task Definition
resource "aws_ecs_task_definition" "fastflow" {
  family                   = "${var.stage}-fastflow-task"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "1024"
  memory                   = "8192"

  container_definitions = jsonencode([
    {
      name      = "fastflow-service"
      image     = "leadevs/fastflow:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "PORT", value = "3001" },
        { name = "PROXY_PORT", value = "3000" },
        { name = "DATABASE_TYPE", value = "postgres" },
        { name = "FLOWISE_USERNAME", value = "hafiz@leadevs.com" },
        { name = "FLOWISE_PASSWORD", value = "Password1@#" },
        { name = "VITE_PORT", value = "8080" },
        { name = "DATABASE_HOST", value = aws_db_instance.flowstack.address },
        { name = "DATABASE_PORT", value = tostring(aws_db_instance.flowstack.port) },
        { name = "DATABASE_NAME", value = aws_db_instance.flowstack.db_name },
        { name = "DATABASE_USER", value = aws_db_instance.flowstack.username },
        { name = "DATABASE_PASSWORD", value = aws_db_instance.flowstack.password },
        { name = "DATABASE_SSL", value = "true" },
        { name = "CORE_SERVER_URL", value = "http://localhost:3001" },
        { name = "CORE_UI_URL", value = "http://localhost:3001" },
        { name = "ENABLE_ENTERPRISE", value = "true" },
        { name = "FLOWISE_SECRETKEY_OVERWRITE", value = "flowstack-secret-key" },
        { name = "APIKEY_PATH", value = "/root/.fastflow" },
        { name = "SECRETKEY_PATH", value = "/root/.fastflow" },
        { name = "LOG_PATH", value = "/root/.fastflow/logs" },
        { name = "BLOB_STORAGE_PATH", value = "/root/.fastflow/storage" }
      ]
      entryPoint = ["/usr/local/bin/docker-entrypoint.sh"]
      mountPoints = [
        {
          sourceVolume  = "efs-volume"
          containerPath = "/root/.fastflow"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.fastflow.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = var.stage
        }
      }
    }
  ])

  volume {
    name = "efs-volume"

    efs_volume_configuration {
      file_system_id     = aws_efs_file_system.this.id
      root_directory     = "/"
      transit_encryption = "ENABLED"
    }
  }

  depends_on = [aws_db_instance.flowstack]
}

# Create Target Group for Fastflow
resource "aws_lb_target_group" "fastflow" {
  name        = "${var.stage}-fastflow-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.this.id

  health_check {
    path                = "/api/v1/ping"
    protocol            = "HTTP"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
    matcher             = "200-299"
  }
}

# Create Listener Rule for Fastflow (HTTP)
resource "aws_lb_listener_rule" "fastflow" {
  listener_arn = aws_lb_listener.public_listener.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fastflow.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# Create Listener Rule for Fastflow (HTTPS)
resource "aws_lb_listener_rule" "fastflow_https" {
  count        = var.domain_name != "" ? 1 : 0
  listener_arn = aws_lb_listener.public_listener_https[0].arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.fastflow.arn
  }

  condition {
    path_pattern {
      values = ["/*"]
    }
  }
}

# Create ECS Service
resource "aws_ecs_service" "fastflow" {
  name            = "${var.stage}-fastflow-service"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.fastflow.arn
  launch_type     = "FARGATE"
  desired_count   = var.ecs_desired_count

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.container_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.fastflow.arn
    container_name   = "fastflow-service"
    container_port   = 3000
  }

  # Deployment configuration
  deployment_maximum_percent         = 100
  deployment_minimum_healthy_percent = 0

  # Circuit breaker to stop deployment if tasks keep failing
  deployment_circuit_breaker {
    enable   = true
    rollback = false
  }

  force_new_deployment = true

  depends_on = [
    aws_lb_listener_rule.fastflow,
    aws_route.private_internet_access
  ]
}

# DNS Configuration Instructions (for external DNS providers like GoDaddy)
# After applying this Terraform configuration:
# 1. Add the DNS validation records from the 'acm_certificate_validation_records' output to your DNS provider
# 2. Create an A record pointing your domain to the ALB DNS name (use the 'alb_dns_name' output)
# 3. Create a CNAME record for www subdomain pointing to your main domain

# Output the external URL
output "external_url" {
  description = "URL of the Fastflow application"
  value       = var.domain_name != "" ? "https://${var.domain_name}" : "http://${aws_lb.public.dns_name}"
}

# Output the ALB DNS name (always available)
output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.public.dns_name
}

# Output DNS configuration instructions
output "dns_configuration_instructions" {
  description = "Instructions for configuring DNS with external providers"
  value = var.domain_name != "" ? "Please configure DNS: 1) Add CNAME records from 'acm_certificate_validation_records' output to validate certificate. 2) Point ${var.domain_name} to ${aws_lb.public.dns_name}. 3) Create CNAME for www.${var.domain_name} pointing to ${var.domain_name}." : "No domain configured - using HTTP only"
}

# Output certificate ARN for reference
output "acm_certificate_arn" {
  description = "ARN of the ACM certificate (if created)"
  value       = var.domain_name != "" ? aws_acm_certificate.main[0].arn : "No certificate created"
}

