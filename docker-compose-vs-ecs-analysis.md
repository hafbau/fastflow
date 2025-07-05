# Docker Compose vs ECS Configuration Analysis

## Executive Summary

After thorough analysis, I've identified several critical differences between the working Docker Compose setup and the failing ECS configuration. The primary issue is the SSL handling, but there are also several other configuration discrepancies that could contribute to instability.

## Critical Differences

### 1. Database Connection Context
| Aspect | Docker Compose | ECS | Impact |
|--------|---------------|-----|---------|
| Database Host | `postgres` (container name) | AWS RDS endpoint | 🔴 **CRITICAL** |
| SSL Behavior | PostgreSQL container doesn't advertise SSL | RDS advertises SSL support | 🔴 **CRITICAL** |
| Network | Docker bridge network | AWS VPC | Medium |
| Connection | Direct container-to-container | Through AWS network | Low |

**Root Cause**: When TypeORM connects to RDS (which advertises SSL), it attempts SSL even with `DATABASE_SSL=false` because `getDatabaseSSLFromEnv()` returns `undefined` instead of explicitly `false`.

### 2. Environment Variables Comparison

#### Missing in ECS but Present in Docker Compose:
- `NODE_ENV` (defaults to production in supervisord)
- `FLOWISE_FILE_SIZE_LIMIT` (50mb)
- `EXECUTION_MODE` (main)
- `QUEUE_PROVIDER` (memory)
- `REDIS_URL` (empty)
- `OPENAI_API_KEY` (empty)
- `ANTHROPIC_API_KEY` (empty)

#### Different Values:
| Variable | Docker Compose | ECS |
|----------|---------------|-----|
| `FLOWISE_USERNAME` | admin@flowstack.com | hafiz@leadevs.com |
| `FLOWISE_PASSWORD` | ChangeMe123!@# | Password1@# |
| `FLOWISE_SECRETKEY_OVERWRITE` | myFlowiseSecretKey | flowstack-secret-key |

#### Additional in ECS:
- `NODE_TLS_REJECT_UNAUTHORIZED=0` (attempted SSL fix)
- `VITE_PORT=8080` (UI development server port)
- `APIKEY_PATH=/root/.fastflow`

### 3. Supervisord Configuration Differences

#### Docker Compose (via supervisord.conf):
- Uses `/usr/local/bin/start-flowstack` wrapper script
- Includes `ENABLE_ENTERPRISE=true` in environment
- Includes `FLOWISE_SKIP_OFFLINE_LICENSE_VERIFY=true`
- Has a third service: `log-monitor`
- More granular process management settings

#### ECS (inline configuration):
- Directly runs `pnpm start`
- Missing several environment variables in supervisord environment
- No log-monitor service
- Different startup priorities and timing

### 4. Volume Mount Differences

| Aspect | Docker Compose | ECS |
|--------|---------------|-----|
| Data Volume | Local volume `flowstack_data` | EFS mount |
| Mount Path | `/root/.flowise` | `/root/.fastflow` |
| Log Volume | `/var/log/flowstack` | CloudWatch Logs only |

**Issue**: Path inconsistency - Docker uses `.flowise` while ECS uses `.fastflow`

### 5. Startup Process Differences

#### Docker Compose:
1. Uses `docker-entrypoint.sh`
2. Waits for PostgreSQL health check
3. Sets default environment variables
4. Starts supervisord with pre-configured file

#### ECS:
1. Overwrites supervisord config inline
2. No database readiness check
3. Different command structure
4. Missing entrypoint script benefits

### 6. Health Check Differences

| Aspect | Docker Compose | ECS |
|--------|---------------|-----|
| Endpoint | http://localhost:3000/api/v1/ping | Same |
| Start Period | 90s | Not specified |
| Interval | 30s | Default ECS (30s) |
| Timeout | 10s | Default ECS (5s) |
| Retries | 3 | Default ECS (3) |

### 7. Network Configuration

#### Docker Compose:
- Port mapping: `3000:3000` (external:internal)
- Services communicate via service names
- Simple bridge network

#### ECS:
- Only exposes port 3000
- Uses AWS VPC networking (awsvpc mode)
- More complex routing through ALB

### 8. Process Management

#### Key Difference in Supervisord:
- **Docker**: Supervisord config includes more environment variables passed through
- **ECS**: Inline config might not properly propagate all environment variables

## Recommendations

### Immediate Fixes:
1. **Apply the SSL fix** (already done) - explicitly return `false` when `DATABASE_SSL=false`
2. **Add missing environment variables** to ECS task definition
3. **Fix path inconsistency** - use `/root/.flowise` consistently

### Configuration Alignment:
```bash
# Add to ECS environment variables:
{ name = "NODE_ENV", value = "production" },
{ name = "FLOWISE_FILE_SIZE_LIMIT", value = "50mb" },
{ name = "EXECUTION_MODE", value = "main" },
{ name = "QUEUE_PROVIDER", value = "memory" },
{ name = "FLOWISE_SKIP_OFFLINE_LICENSE_VERIFY", value = "true" }
```

### Supervisord Environment Fix:
The ECS supervisord configuration is missing several environment variables. Update line 482 to include:
```
environment=PORT="3001",NODE_ENV="production",NODE_TLS_REJECT_UNAUTHORIZED="0",FLOWISE_USERNAME="%(ENV_FLOWISE_USERNAME)s",FLOWISE_PASSWORD="%(ENV_FLOWISE_PASSWORD)s",DATABASE_TYPE="%(ENV_DATABASE_TYPE)s",DATABASE_HOST="%(ENV_DATABASE_HOST)s",DATABASE_PORT="%(ENV_DATABASE_PORT)s",DATABASE_NAME="%(ENV_DATABASE_NAME)s",DATABASE_USER="%(ENV_DATABASE_USER)s",DATABASE_PASSWORD="%(ENV_DATABASE_PASSWORD)s",DATABASE_SSL="%(ENV_DATABASE_SSL)s",ENABLE_ENTERPRISE="%(ENV_ENABLE_ENTERPRISE)s",FLOWISE_SECRETKEY_OVERWRITE="%(ENV_FLOWISE_SECRETKEY_OVERWRITE)s",APIKEY_PATH="%(ENV_APIKEY_PATH)s",SECRETKEY_PATH="%(ENV_SECRETKEY_PATH)s",LOG_PATH="%(ENV_LOG_PATH)s",BLOB_STORAGE_PATH="%(ENV_BLOB_STORAGE_PATH)s",FLOWISE_FILE_SIZE_LIMIT="%(ENV_FLOWISE_FILE_SIZE_LIMIT)s",EXECUTION_MODE="%(ENV_EXECUTION_MODE)s",QUEUE_PROVIDER="%(ENV_QUEUE_PROVIDER)s"
```

### Long-term Improvements:
1. Use the same supervisord.conf file in both environments
2. Implement database connection retry logic
3. Standardize paths (`.flowise` vs `.fastflow`)
4. Add database readiness check to ECS startup

## Conclusion

The primary failure is due to SSL handling differences between local PostgreSQL and AWS RDS. However, several other configuration mismatches could cause additional issues once the SSL problem is resolved. The ECS configuration attempts to inline-configure supervisord, which leads to missing environment variables and different startup behavior compared to the working Docker Compose setup.