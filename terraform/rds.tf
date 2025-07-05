# RDS PostgreSQL for FlowStack

# Create subnet group for RDS
resource "aws_db_subnet_group" "flowstack" {
  name       = "${var.stage}-flowstack-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.stage}-flowstack-db-subnet-group"
  }
}

# Security group for RDS
resource "aws_security_group" "rds_sg" {
  name        = "${var.stage}-flowstack-rds-sg"
  description = "Security group for FlowStack RDS instance"
  vpc_id      = aws_vpc.this.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.container_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.stage}-flowstack-rds-sg"
  }
  
  # Prevent deletion issues - RDS must be deleted first
  lifecycle {
    create_before_destroy = false
  }
}

# Create custom parameter group to disable SSL enforcement
resource "aws_db_parameter_group" "flowstack" {
  name   = "${var.stage}-flowstack-pg15"
  family = "postgres15"

  parameter {
    name  = "rds.force_ssl"
    value = "0"
  }

  tags = {
    Name = "${var.stage}-flowstack-parameter-group"
  }
}

# RDS PostgreSQL instance
resource "aws_db_instance" "flowstack" {
  identifier     = "${var.stage}-flowstack-db"
  engine         = "postgres"
  engine_version = "15.12"
  instance_class = var.db_instance_class
  
  # Use custom parameter group
  parameter_group_name = aws_db_parameter_group.flowstack.name

  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "flowstack"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.flowstack.name

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  deletion_protection       = var.stage == "prod" ? true : false
  skip_final_snapshot       = var.stage == "prod" ? false : true
  final_snapshot_identifier = var.stage == "prod" ? "${var.stage}-flowstack-db-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "${var.stage}-flowstack-db"
  }
  
  # Add timeout for delete operations
  timeouts {
    delete = "60m"
  }
}

# Store database connection details in Parameter Store
resource "aws_ssm_parameter" "db_host" {
  name  = "/${var.stage}/flowstack/db/host"
  type  = "String"
  value = aws_db_instance.flowstack.address
}

resource "aws_ssm_parameter" "db_port" {
  name  = "/${var.stage}/flowstack/db/port"
  type  = "String"
  value = aws_db_instance.flowstack.port
}

resource "aws_ssm_parameter" "db_name" {
  name  = "/${var.stage}/flowstack/db/name"
  type  = "String"
  value = aws_db_instance.flowstack.db_name
}

resource "aws_ssm_parameter" "db_username" {
  name  = "/${var.stage}/flowstack/db/username"
  type  = "SecureString"
  value = aws_db_instance.flowstack.username
}

resource "aws_ssm_parameter" "db_password" {
  name  = "/${var.stage}/flowstack/db/password"
  type  = "SecureString"
  value = aws_db_instance.flowstack.password
}

# Output database endpoint
output "db_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.flowstack.endpoint
  sensitive   = true
} 