import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import basicAuth from 'express-basic-auth'
import { validateAPIKey } from '../../utils/validateKey'
import { verifyToken, getUserById } from '../../utils/supabase'
import { WHITELIST_URLS } from '../../utils/constants'
import logger from '../../utils/logger'
import apiKeyService from '../../services/apiKeyService'
import { authConfig } from '../../config/auth'

/**
 * Unified authentication middleware that checks:
 * 1. Supabase JWT token
 * 2. API key
 * 3. Basic auth (if configured)
 * 
 * This middleware maintains backward compatibility with existing authentication methods
 * while adding Supabase Auth as the primary authentication method.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const URL_CASE_INSENSITIVE_REGEX: RegExp = /\/api\/v1\//i
    const URL_CASE_SENSITIVE_REGEX: RegExp = /\/api\/v1\//

    // Step 1: Check if the req path contains /api/v1 regardless of case
    if (!URL_CASE_INSENSITIVE_REGEX.test(req.path)) {
        // If the req path does not contain /api/v1, then allow the request to pass through
        // example: /assets, /canvas
        return next()
    }

    // Step 2: Check if the req path is case sensitive
    if (!URL_CASE_SENSITIVE_REGEX.test(req.path)) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized Access' })
    }

    // Step 3: Check if the req path is in the whitelist
    const isWhitelisted = WHITELIST_URLS.some((url) => req.path.startsWith(url))
    if (isWhitelisted) {
        return next()
    }

    // Step 4: Check if the request is internal
    if (req.headers['x-request-from'] === 'internal') {
        // For internal requests, check if internal request authentication is enabled
        if (authConfig.internalRequest.enabled) {
            // If authentication is required for internal requests
            if (authConfig.internalRequest.requireAuth) {
                // If basic auth is configured, use it
                if (authConfig.basicAuth.enabled &&
                    authConfig.basicAuth.username &&
                    authConfig.basicAuth.password) {
                    const username = authConfig.basicAuth.username
                    const password = authConfig.basicAuth.password
                    const basicAuthMiddleware = basicAuth({
                        users: { [username]: password }
                    })
                    return basicAuthMiddleware(req, res, next)
                }
                // If no auth method is available, deny access
                return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized Internal Request' })
            }
        }
        // Allow internal requests if not requiring auth
        return next()
    }

    // Step 5: Authentication checks
    authenticateRequest(req, res, next)
}

/**
 * Authenticate the request using available authentication methods
 */
const authenticateRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Authentication order based on configuration
        const authMethods = []
        
        // Add Supabase Auth if enabled
        if (authConfig.supabase.enabled) {
            authMethods.push('supabase')
        }
        
        // Add API Key Auth if enabled
        if (authConfig.apiKey.enabled) {
            authMethods.push('apiKey')
        }
        
        // Add Basic Auth if enabled AND Supabase Auth is not primary
        // Additionally, verify username and password are not empty
        if (authConfig.basicAuth.enabled && 
            authConfig.basicAuth.username && 
            authConfig.basicAuth.password && 
            !authConfig.supabase.primary) {
            authMethods.push('basicAuth')
        }
        
        // Supabase Auth is ALWAYS prioritized if it's enabled and set as primary in the config
        if (authConfig.supabase.enabled && authConfig.supabase.primary) {
            // If Supabase is already in the methods, move it to the front
            if (authMethods.includes('supabase') && authMethods[0] !== 'supabase') {
                authMethods.splice(authMethods.indexOf('supabase'), 1)
                authMethods.unshift('supabase')
            } 
            // If Supabase is not in the methods yet, add it at the front
            else if (!authMethods.includes('supabase')) {
                authMethods.unshift('supabase')
            }
            
            // When Supabase is primary, NEVER use basic auth
            const index = authMethods.indexOf('basicAuth');
            if (index > -1) {
                authMethods.splice(index, 1);
            }
        }
        
        // Try each authentication method in order
        for (const method of authMethods) {
            switch (method) {
                case 'supabase':
                    // Try Supabase JWT token
                    const user = await verifyToken(req)
                    if (user) {
                        // Attach the user to the request object
                        (req as any).user = user
                        logger.debug(`[Auth] User authenticated via Supabase: ${user.id}`)
                        return next()
                    }
                    break
                    
                case 'apiKey':
                    // Try API key
                    const isKeyValidated = await validateAPIKey(req)
                    if (isKeyValidated) {
                        // Get the API key from the request
                        const authHeader = req.headers.authorization
                        if (authHeader && authHeader.startsWith('Bearer ')) {
                            const apiKey = authHeader.split(' ')[1]
                            
                            // Get the API key details
                            const keyDetails = await apiKeyService.getApiKeyByKey(apiKey)
                            
                            // If user association is required but the key has no user, reject
                            if (authConfig.apiKey.requireUserAssociation &&
                                (!keyDetails || !keyDetails.supabaseUserId)) {
                                logger.debug(`[Auth] API key rejected: no user association`)
                                continue
                            }
                            
                            // If the API key is associated with a Supabase user, attach the user to the request
                            if (keyDetails && keyDetails.supabaseUserId) {
                                try {
                                    const userData = await getUserById(keyDetails.supabaseUserId)
                                    if (userData && userData.user) {
                                        (req as any).user = userData.user
                                        logger.debug(`[Auth] Request authenticated via API key associated with user: ${userData.user.id}`)
                                        return next()
                                    }
                                } catch (error) {
                                    logger.debug(`[Auth] Error getting Supabase user for API key: ${error}`)
                                }
                            }
                        }
                        
                        logger.debug(`[Auth] Request authenticated via API key (no associated user)`)
                        return next()
                    }
                    break
                    
                case 'basicAuth':
                    // Only use basic auth if Supabase Auth is NOT primary and username/password are provided
                    if (!authConfig.supabase.primary && authConfig.basicAuth.username && authConfig.basicAuth.password) {
                        const username = authConfig.basicAuth.username
                        const password = authConfig.basicAuth.password
                        const basicAuthMiddleware = basicAuth({
                            users: { [username]: password }
                        })
                        return basicAuthMiddleware(req, res, next)
                    }
                    // If we're here but shouldn't use basic auth, just continue to next method
                    break
            }
        }

        // If all authentication methods fail, return unauthorized
        return res.status(StatusCodes.UNAUTHORIZED).json({
            error: 'Unauthorized Access',
            message: 'Authentication failed. Please provide valid credentials.'
        })
    } catch (error) {
        logger.error(`[Auth] Authentication error: ${error}`)
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Unauthorized Access' })
    }
}