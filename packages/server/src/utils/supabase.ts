import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from './logger'
import { getSupabaseConfig, isSupabaseConfigured as isConfigured } from '../config/supabase'
import auditLogsService from '../services/audit-logs'

// Get Supabase configuration
const config = getSupabaseConfig()

// Create Supabase client instances
export const supabaseClient = config.url && config.anonKey
    ? createClient(config.url, config.anonKey)
    : null

export const supabaseAdmin = config.url && config.serviceRoleKey
    ? createClient(config.url, config.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
    : null

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
export const isSupabaseConfigured = (): boolean => {
    return isConfigured()
}

/**
 * Get a new Supabase client instance
 * @returns {SupabaseClient|null}
 */
export const getSupabaseClient = (): SupabaseClient | null => {
    const config = getSupabaseConfig()
    if (!config.url || !config.anonKey) return null
    return createClient(config.url, config.anonKey)
}

/**
 * Get a new Supabase admin client instance
 * @returns {SupabaseClient|null}
 */
export const getSupabaseAdmin = (): SupabaseClient | null => {
    const config = getSupabaseConfig()
    if (!config.url || !config.serviceRoleKey) return null
    return createClient(config.url, config.serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

/**
 * Sign up a new user with email and password
 * @param {string} email
 * @param {string} password
 * @param {object} metadata
 * @returns {Promise<object>}
 */
export const signUp = async (email: string, password: string, metadata: object = {}) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseClient!.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log successful signup
        try {
            await auditLogsService.logUserAction(
                data.user?.id || '',
                'user_register',
                'auth',
                undefined,
                { email },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log signup event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Sign up error: ${error.message}`)
        throw error
    }
}

/**
 * Sign in a user with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>}
 */
export const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseClient!.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.UNAUTHORIZED, error.message)
        }

        // Log successful login
        try {
            await auditLogsService.logUserAction(
                data.user?.id || '',
                'user_login',
                'auth',
                undefined,
                { email },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log login event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Sign in error: ${error.message}`)
        throw error
    }
}

/**
 * Sign in with magic link
 * @param {string} email
 * @returns {Promise<object>}
 */
export const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseClient!.auth.signInWithOtp({
            email
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log magic link request
        try {
            await auditLogsService.logUserAction(
                undefined,
                'magic_link_request',
                'auth',
                undefined,
                { email },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log magic link event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Magic link error: ${error.message}`)
        throw error
    }
}

/**
 * Sign out a user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { error } = await supabaseClient!.auth.signOut()

        if (error) {
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
        }

        // Get current user before signing out
        const { data: { user } } = await supabaseClient!.auth.getUser()
        
        // Log sign out
        if (user) {
            try {
                await auditLogsService.logUserAction(
                    user.id,
                    'user_logout',
                    'auth',
                    undefined,
                    { email: user.email },
                    undefined
                )
            } catch (auditError) {
                logger.error(`[Supabase] Failed to log logout event: ${auditError}`)
            }
        }
    } catch (error: any) {
        logger.error(`[Supabase] Sign out error: ${error.message}`)
        throw error
    }
}

/**
 * Reset password
 * @param {string} email
 * @returns {Promise<object>}
 */
export const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseClient!.auth.resetPasswordForEmail(email)

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log password reset request
        try {
            await auditLogsService.logUserAction(
                undefined,
                'password_reset_request',
                'auth',
                undefined,
                { email },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log password reset event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Reset password error: ${error.message}`)
        throw error
    }
}

/**
 * Update user password
 * @param {string} newPassword
 * @returns {Promise<object>}
 */
export const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseClient!.auth.updateUser({
            password: newPassword
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log password update
        try {
            await auditLogsService.logUserAction(
                data.user?.id || '',
                'password_update',
                'auth',
                undefined,
                { userId: data.user?.id || '' },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log password update event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Update password error: ${error.message}`)
        throw error
    }
}

/**
 * Get user by ID (admin only)
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const getUserById = async (userId: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseAdmin!.auth.admin.getUserById(userId)

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Get user error: ${error.message}`)
        throw error
    }
}

/**
 * Create a new user (admin only)
 * @param {string} email
 * @param {string} password
 * @param {object} metadata
 * @returns {Promise<object>}
 */
export const createUser = async (email: string, password: string, metadata: object = {}) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseAdmin!.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log user creation
        try {
            await auditLogsService.logUserAction(
                data.user?.id || '',
                'user_create',
                'user',
                data.user?.id || '',
                { email, metadata },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log user creation event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Create user error: ${error.message}`)
        throw error
    }
}

/**
 * Invite user by email (admin only)
 * @param {string} email
 * @param {object} metadata
 * @returns {Promise<object>}
 */
export const inviteUser = async (email: string, metadata: object = {}) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        // Create user with random password, they'll reset it via email
        const tempPassword = Math.random().toString(36).slice(-10)
        const { data, error } = await supabaseAdmin!.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: false,
            user_metadata: metadata
        })

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Send password reset email to complete invitation
        await supabaseAdmin!.auth.admin.generateLink({
            type: 'recovery',
            email
        })

        // Log user invitation
        try {
            await auditLogsService.logUserAction(
                data.user?.id || '',
                'user_invite',
                'user',
                data.user?.id || '',
                { email, metadata },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log user invitation event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Invite user error: ${error.message}`)
        throw error
    }
}

/**
 * Delete user (admin only)
 * @param {string} userId
 * @returns {Promise<object>}
 */
export const deleteUser = async (userId: string) => {
    if (!isSupabaseConfigured()) {
        throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
    }

    try {
        const { data, error } = await supabaseAdmin!.auth.admin.deleteUser(userId)

        if (error) {
            throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
        }

        // Log user deletion
        try {
            await auditLogsService.logUserAction(
                undefined,
                'user_delete',
                'user',
                userId,
                { userId },
                undefined
            )
        } catch (auditError) {
            logger.error(`[Supabase] Failed to log user deletion event: ${auditError}`)
        }

        return data
    } catch (error: any) {
        logger.error(`[Supabase] Delete user error: ${error.message}`)
        throw error
    }
}

/**
 * Verify JWT token from Supabase
 * @param {Request} req
 * @returns {Promise<object|null>}
 */
export const verifyToken = async (req: Request) => {
    if (!isSupabaseConfigured()) {
        return null
    }

    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null
        }

        const token = authHeader.split(' ')[1]
        
        // Verify the token
        const { data, error } = await supabaseClient!.auth.getUser(token)
        
        if (error) {
            logger.debug(`[Supabase] Token verification error: ${error.message}`)
            return null
        }
        
        return data.user
    } catch (error: any) {
        logger.debug(`[Supabase] Token verification error: ${error.message}`)
        return null
    }
}

/**
 * Middleware to verify JWT token from Supabase
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await verifyToken(req)
        
        if (user) {
            // Attach the user to the request object
            (req as any).user = user
            
            // Log authentication event (only for API routes, not for static assets)
            if (!req.path.includes('.') && !req.path.startsWith('/static')) {
                try {
                    // Use setTimeout to not block the request
                    setTimeout(async () => {
                        try {
                            await auditLogsService.logUserAction(
                                user.id || '',
                                'api_access',
                                'auth',
                                undefined,
                                {
                                    method: req.method,
                                    path: req.path,
                                    ip: req.ip
                                },
                                req.ip
                            )
                        } catch (error) {
                            logger.error(`[Supabase] Failed to log API access event: ${error}`)
                        }
                    }, 0)
                } catch (error) {
                    logger.error(`[Supabase] Error setting up audit logging: ${error}`)
                }
            }
            
            return next()
        }
        
        // If Supabase is not configured or token is invalid, continue to next middleware
        // This allows fallback to other authentication methods
        next()
    } catch (error) {
        // If there's an error, continue to next middleware
        // This allows fallback to other authentication methods
        next()
    }
}