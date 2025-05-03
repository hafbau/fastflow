# Rate Limiting System

This document provides an overview of the rate limiting system implemented in the Flowstack application.

## Overview

The rate limiting system is designed to prevent abuse, enhance security, and ensure fair resource allocation. It uses Redis for distributed rate limiting, allowing the system to work across multiple application instances.

## Features

- **Redis-based distributed rate limiting**: Ensures consistent rate limiting across multiple application instances
- **Sliding window algorithm**: Provides more accurate rate limiting than fixed window approaches
- **Different rate limits for different endpoints**: Customized rate limits based on endpoint sensitivity
- **Role-based rate limits**: Higher limits for admin users
- **Operation-based rate limits**: Different limits for read vs. write operations
- **Exponential backoff**: Increasing delays for repeated failures
- **Bypass mechanisms**: Trusted services can bypass rate limiting
- **Monitoring and analytics**: Track rate limit events and view statistics
- **Proper response headers**: Standard rate limit headers for client feedback

## Configuration

Rate limits are configured in `packages/server/src/config/rateLimit.ts`. The configuration includes:

- **Authentication endpoints**: 
  - Register: 10 requests per minute per IP
  - Reset Password: 5 requests per hour per IP

- **API key endpoints**:
  - Create/Verify: 30 requests per minute per user

- **API endpoints**:
  - Default: 100 requests per minute
  - Admin: 300 requests per minute
  - Read operations: 200 requests per minute
  - Write operations: 50 requests per minute

## Implementation

The rate limiting system consists of several components:

1. **RateLimitService**: Core service that manages rate limiters and tracks events
2. **Rate limiting middleware**: Express middleware that applies rate limits to routes
3. **Configuration**: Defines rate limits for different endpoints and user roles
4. **Monitoring**: Tracks and analyzes rate limit events

## Usage

### Applying Rate Limiting to Routes

Rate limiting is applied to routes using middleware functions:

```typescript
// For authentication endpoints
import { authRateLimiter } from '../middlewares/rateLimit'
router.post('/register', authRateLimiter('register'), userController.register)

// For API key endpoints
import { apiKeyRateLimiter } from '../middlewares/rateLimit'
router.post('/apikey', apiKeyRateLimiter('create'), apikeyController.createApiKey)

// For general API endpoints
import { apiRateLimiter } from '../middlewares/rateLimit'
router.get('/resources', apiRateLimiter('read'), resourceController.getResources)

// For dynamic rate limiting based on request properties
import { dynamicRateLimiter } from '../middlewares/rateLimit'
app.use('/api/v1', dynamicRateLimiter())

// For exponential backoff on repeated failures
import { exponentialBackoff } from '../middlewares/rateLimit'
router.post('/login', exponentialBackoff(3, 1000), authController.login)
```

### Monitoring Rate Limiting

Rate limiting events and statistics can be accessed through the following endpoints:

- **GET /api/v1/rate-limit/stats**: Get rate limiting statistics (admin only)
- **GET /api/v1/rate-limit/events**: Get rate limiting events (admin only)
- **DELETE /api/v1/rate-limit/events**: Clear rate limiting events (admin only)

## Response Headers

When rate limiting is applied, the following headers are included in the response:

- **X-RateLimit-Limit**: Maximum number of requests allowed in the time window
- **X-RateLimit-Remaining**: Number of requests remaining in the current time window
- **X-RateLimit-Reset**: Time when the rate limit window resets (Unix timestamp)
- **Retry-After**: Seconds to wait before making another request (only when rate limited)

## Error Responses

When a request is rate limited, a 429 Too Many Requests response is returned with a message explaining the rate limit.

## Testing

Unit tests for the rate limiting system are available in `packages/server/src/tests/rateLimit.test.ts`.

## Security Considerations

- Rate limiting is an important security measure but should be used alongside other security practices
- IP-based rate limiting can be bypassed with proxies, so user-based rate limiting is also implemented
- Rate limiting should be monitored to ensure it's not too restrictive for legitimate users

## Future Improvements

- Implement more sophisticated anomaly detection for potential abuse
- Add rate limit quota system for enterprise customers
- Enhance monitoring dashboard with real-time visualizations
- Implement more granular rate limits based on resource types