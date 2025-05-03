/**
 * JWT Verification Middleware
 * 
 * This module provides middleware for verifying JWT tokens.
 */

import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../../errors/InternalFastflowError'
import { supabaseClient } from '../../utils/supabase'

// Paths that don't require authentication
const PUBLIC_PATHS = [
  '/api/v1/health',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/confirm-email',
  '/api/v1/auth/magic-link'
]

/**
 * Verify JWT token middleware
 * 
 * This middleware verifies the JWT token in the Authorization header.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip authentication for public paths
    if (PUBLIC_PATHS.some(path => req.path.startsWith(path))) {
      return next()
    }
    
    // Get authorization header
    const authHeader = req.headers.authorization
    
    // If no authorization header, continue without user
    if (!authHeader) {
      return next()
    }
    
    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return next()
    }
    
    // Extract token
    const token = authHeader.split(' ')[1]
    
    // Verify token with Supabase
    if (supabaseClient) {
      try {
        const { data, error } = await supabaseClient.auth.getUser(token)
        
        if (!error && data && data.user) {
          // Set user in request
          Object.defineProperty(req, 'user', {
            value: data.user,
            writable: true,
            enumerable: true,
            configurable: true
          })
          
          Object.defineProperty(req, 'authMethod', {
            value: 'jwt',
            writable: true,
            enumerable: true,
            configurable: true
          })
        }
      } catch (e) {
        // Ignore errors
      }
    }
    
    return next()
  } catch (error) {
    // If there's an error, continue without user
    return next()
  }
}

/**
 * Verify API key middleware
 * 
 * This middleware verifies the API key in the X-API-Key header.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const verifyAPIKey = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip authentication for public paths
    if (PUBLIC_PATHS.some(path => req.path.startsWith(path))) {
      return next()
    }
    
    // Get API key header
    const apiKey = req.headers['x-api-key']
    
    // If no API key, continue without user
    if (!apiKey) {
      return next()
    }
    
    // Verify API key
    // This would need to be implemented based on your API key model
    // For example, you might have an APIKey service or repository
    // that can verify an API key and return the associated user
    
    // For now, we'll just continue without user
    return next()
  } catch (error) {
    // If there's an error, continue without user
    return next()
  }
}