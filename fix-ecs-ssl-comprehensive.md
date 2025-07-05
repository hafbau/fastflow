# Comprehensive Fix for ECS SSL Certificate Error

## Root Cause Analysis

The issue occurs because:
1. AWS RDS PostgreSQL advertises SSL support by default
2. TypeORM's PostgreSQL driver (using 'pg' library) automatically attempts SSL when the server supports it
3. The `getDatabaseSSLFromEnv()` function returns `undefined` when `DATABASE_SSL=false`, which doesn't explicitly disable SSL
4. AWS RDS uses a self-signed certificate that fails validation

## Solution Options

### Option 1: Use PostgreSQL Connection String (Immediate Fix)

Add this to your Terraform configuration to use a connection string that explicitly disables SSL:

```terraform
# In terraform/main.tf, add after line 461:
{ name = "DATABASE_URL", value = "postgresql://${aws_db_instance.flowstack.username}:${aws_db_instance.flowstack.password}@${aws_db_instance.flowstack.address}:${aws_db_instance.flowstack.port}/${aws_db_instance.flowstack.db_name}?sslmode=disable" },
```

Then update the supervisord configuration to include DATABASE_URL:

```terraform
# Update line 482 to add DATABASE_URL:
environment=PORT="3001",NODE_ENV="production",NODE_TLS_REJECT_UNAUTHORIZED="0",DATABASE_URL="%(ENV_DATABASE_URL)s",FLOWISE_USERNAME="%(ENV_FLOWISE_USERNAME)s",...
```

### Option 2: Create Custom Parameter Group (Database-Level Fix)

Create a custom RDS parameter group that doesn't require SSL:

```terraform
# Add to terraform/rds.tf:
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

# Then update the RDS instance to use it:
# In aws_db_instance.flowstack, add:
parameter_group_name = aws_db_parameter_group.flowstack.name
```

### Option 3: Patch the Code (Permanent Fix - Requires Docker Rebuild)

Apply this patch to fix the `getDatabaseSSLFromEnv()` function:

```bash
# Create the patch file
cat > /tmp/fix-ssl.patch << 'EOF'
diff --git a/core/packages/server/src/DataSource.ts b/core/packages/server/src/DataSource.ts
index abc123..def456 100644
--- a/core/packages/server/src/DataSource.ts
+++ b/core/packages/server/src/DataSource.ts
@@ -111,6 +111,9 @@ export const getDatabaseSSLFromEnv = () => {
         }
     } else if (process.env.DATABASE_SSL === 'true') {
         return true
+    } else if (process.env.DATABASE_SSL === 'false') {
+        // Explicitly return false to disable SSL
+        return false
     }
     return undefined
 }
EOF

# Apply the patch
cd /Users/hafizsuara/Projects/flowstack
git apply /tmp/fix-ssl.patch

# Rebuild and deploy
./scripts/build-docker.sh
./scripts/deploy-to-ecr.sh
```

### Option 4: Quick Workaround (No Rebuild Required)

If TypeORM supports connection URLs, you can override the connection completely:

1. Set a DATABASE_URL environment variable that includes `?sslmode=disable`
2. Modify the Terraform to construct this URL

## Recommended Approach

For immediate resolution without rebuilding:
1. Use Option 1 (Connection String) - This explicitly tells PostgreSQL to disable SSL
2. Apply the Terraform changes
3. Monitor the logs to ensure connection succeeds

For long-term fix:
1. Apply Option 3 (Code Patch)
2. Rebuild the Docker image
3. This ensures SSL handling works correctly in all environments

## Verification

After applying any fix, verify:
1. Check CloudWatch logs for "Database migrations completed successfully"
2. Confirm no SSL errors in the logs
3. Test the health endpoint: `curl http://{ALB_DNS}/api/v1/ping`

## Additional Notes

- The `NODE_TLS_REJECT_UNAUTHORIZED=0` workaround didn't work because the SSL negotiation happens at the PostgreSQL protocol level, not the Node.js TLS level
- AWS RDS certificates are valid but use a certificate chain that's not in the default Node.js trust store
- Using `sslmode=disable` in the connection string is the most reliable way to disable SSL for PostgreSQL connections