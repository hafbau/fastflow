#!/bin/bash
# Script to create and apply the SSL fix patch

echo "Creating SSL fix patch..."

cat > patches/fix-database-ssl-explicit.patch << 'EOF'
diff --git a/core/packages/server/src/DataSource.ts b/core/packages/server/src/DataSource.ts
index abc123..def456 100644
--- a/core/packages/server/src/DataSource.ts
+++ b/core/packages/server/src/DataSource.ts
@@ -111,6 +111,9 @@ export const getDatabaseSSLFromEnv = () => {
         }
     } else if (process.env.DATABASE_SSL === 'true') {
         return true
+    } else if (process.env.DATABASE_SSL === 'false') {
+        // Explicitly return false to disable SSL (fixes ECS/RDS connection issues)
+        return false
     }
     return undefined
 }
EOF

echo "Applying patch..."
git apply patches/fix-database-ssl-explicit.patch

if [ $? -eq 0 ]; then
    echo "✅ Patch applied successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Commit the changes: git add -A && git commit -m 'fix: explicitly disable SSL when DATABASE_SSL=false'"
    echo "2. Build Docker image: ./scripts/build-docker.sh"
    echo "3. Deploy to ECR: ./scripts/deploy-to-ecr.sh"
else
    echo "❌ Failed to apply patch. The file may have already been modified."
fi