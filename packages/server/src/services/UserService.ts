import { SupabaseClient } from '@supabase/supabase-js'
import { StatusCodes } from 'http-status-codes'
import { getRepository } from 'typeorm'
import { InternalFastflowError } from '../errors/InternalFastflowError'
import logger from '../utils/logger'
import { getSupabaseAdmin, getSupabaseClient } from '../utils/supabase'
import { EmailTemplateType, loadEmailTemplate } from '../utils/emailTemplates'
import { UserProfile as UserProfileEntity } from '../database/entities/UserProfile'

/**
 * User status enum
 */
export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
}

/**
 * User profile interface
 */
export interface UserProfile {
    id: string
    email: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatarUrl?: string
    status: UserStatus
    phoneNumber?: string
    lastLogin?: Date
    preferences?: Record<string, any>
    metadata?: Record<string, any>
    createdAt: Date
    updatedAt: Date
}

/**
 * User creation options
 */
export interface UserCreateOptions {
    email: string
    password?: string
    firstName?: string
    lastName?: string
    displayName?: string
    avatarUrl?: string
    phoneNumber?: string
    status?: UserStatus
    preferences?: Record<string, any>
    metadata?: Record<string, any>
    sendInvitation?: boolean
}

/**
 * User update options
 */
export interface UserUpdateOptions {
    firstName?: string
    lastName?: string
    displayName?: string
    avatarUrl?: string
    phoneNumber?: string
    status?: UserStatus
    preferences?: Record<string, any>
    metadata?: Record<string, any>
}

/**
 * User search options
 */
export interface UserSearchOptions {
    query?: string
    status?: UserStatus
    organizationId?: string
    workspaceId?: string
    page?: number
    limit?: number
    sortBy?: string
    sortDirection?: 'asc' | 'desc'
}

/**
 * User search result
 */
export interface UserSearchResult {
    users: UserProfile[]
    total: number
    page: number
    limit: number
}

/**
 * Service for managing users
 */
export class UserService {
    private supabaseAdmin: SupabaseClient
    private supabaseClient: SupabaseClient
    private userProfileRepository: any

    /**
     * Constructor
     */
    constructor() {
        const admin = getSupabaseAdmin()
        const client = getSupabaseClient()

        if (!admin || !client) {
            throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Supabase is not configured')
        }

        this.supabaseAdmin = admin
        this.supabaseClient = client
        this.userProfileRepository = getRepository(UserProfileEntity)
    }

    /**
     * Register a new user
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {object} metadata - Additional user metadata
     * @returns {Promise<UserProfile>}
     */
    async register(email: string, password: string, metadata: Record<string, any> = {}): Promise<UserProfile> {
        try {
            // Create user with Supabase Auth
            const { data, error } = await this.supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        ...metadata,
                        status: UserStatus.PENDING
                    }
                }
            })

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user')
            }

            // Create user profile in database
            await this.createOrUpdateUserProfile(data.user.id, {
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                displayName: metadata.displayName,
                status: UserStatus.PENDING
            })

            // Return user profile
            return this.getUserById(data.user.id)
        } catch (error: any) {
            logger.error(`[UserService] Registration error: ${error.message}`)
            throw error
        }
    }

    /**
     * Invite a user to the system
     * @param {string} email - User email
     * @param {object} metadata - Additional user metadata
     * @returns {Promise<UserProfile>}
     */
    async invite(email: string, metadata: Record<string, any> = {}): Promise<UserProfile> {
        try {
            // Create user with random password
            const tempPassword = Math.random().toString(36).slice(-10)
            
            const { data, error } = await this.supabaseAdmin.auth.admin.createUser({
                email,
                password: tempPassword,
                email_confirm: false,
                user_metadata: {
                    ...metadata,
                    status: UserStatus.PENDING
                }
            })

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user')
            }

            // Send password reset email to complete invitation
            await this.supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email
            })

            // Create user profile in database
            await this.createOrUpdateUserProfile(data.user.id, {
                firstName: metadata.firstName,
                lastName: metadata.lastName,
                displayName: metadata.displayName,
                status: UserStatus.PENDING
            })

            // Return user profile
            return this.getUserById(data.user.id)
        } catch (error: any) {
            logger.error(`[UserService] Invitation error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise<UserProfile>}
     */
    async getUserById(userId: string): Promise<UserProfile> {
        try {
            const { data, error } = await this.supabaseAdmin.auth.admin.getUserById(userId)

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // Get user profile from database
            const userProfile = await this.userProfileRepository.findOne({
                where: { id: userId } as any
            })

            // If user profile doesn't exist in database, create it
            if (!userProfile) {
                return this.createOrUpdateUserProfile(userId, {
                    status: UserStatus.ACTIVE
                })
            }

            // Combine Supabase user data with database profile
            return this.combineUserData(data.user, userProfile)
        } catch (error: any) {
            logger.error(`[UserService] Get user error: ${error.message}`)
            throw error
        }
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Promise<UserProfile>}
     */
    async getUserByEmail(email: string): Promise<UserProfile> {
        try {
            // Supabase doesn't have a direct method to get user by email
            // We need to list users and filter by email
            const { data, error } = await this.supabaseAdmin.auth.admin.listUsers()

            if (error) {
                throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
            }

            const user = data.users.find(u => u.email === email)

            if (!user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // Get user profile from database
            const userProfile = await this.userProfileRepository.findOne({
                where: { id: user.id } as any
            })

            // If user profile doesn't exist in database, create it
            if (!userProfile) {
                return this.createOrUpdateUserProfile(user.id, {
                    status: UserStatus.ACTIVE
                })
            }

            // Combine Supabase user data with database profile
            return this.combineUserData(user, userProfile)
        } catch (error: any) {
            logger.error(`[UserService] Get user by email error: ${error.message}`)
            throw error
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {UserUpdateOptions} options - Update options
     * @returns {Promise<UserProfile>}
     */
    async updateUser(userId: string, options: UserUpdateOptions): Promise<UserProfile> {
        try {
            // Get current user data
            const currentUser = await this.getUserById(userId)
            
            // Prepare metadata update
            const metadata = {
                ...currentUser.metadata,
                firstName: options.firstName ?? currentUser.firstName,
                lastName: options.lastName ?? currentUser.lastName,
                displayName: options.displayName ?? currentUser.displayName,
                avatarUrl: options.avatarUrl ?? currentUser.avatarUrl,
                phoneNumber: options.phoneNumber ?? currentUser.phoneNumber,
                status: options.status ?? currentUser.status,
                preferences: options.preferences ?? currentUser.preferences,
                ...options.metadata
            }

            // Update user metadata
            const { data, error } = await this.supabaseAdmin.auth.admin.updateUserById(
                userId,
                { user_metadata: metadata }
            )

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // Update user profile in database
            return this.createOrUpdateUserProfile(userId, options)
        } catch (error: any) {
            logger.error(`[UserService] Update user error: ${error.message}`)
            throw error
        }
    }

    /**
     * Update user status
     * @param {string} userId - User ID
     * @param {UserStatus} status - New status
     * @returns {Promise<UserProfile>}
     */
    async updateUserStatus(userId: string, status: UserStatus): Promise<UserProfile> {
        try {
            // Get current user data
            const currentUser = await this.getUserById(userId)
            
            // Update user metadata with new status
            const metadata = {
                ...currentUser.metadata,
                status
            }

            // Update user metadata
            const { data, error } = await this.supabaseAdmin.auth.admin.updateUserById(
                userId,
                { user_metadata: metadata }
            )

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // If status is INACTIVE, also disable the user in Supabase
            if (status === UserStatus.INACTIVE) {
                await this.supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    { ban_duration: 'none' }
                )
            } else if (status === UserStatus.ACTIVE) {
                // If status is ACTIVE, ensure the user is not banned
                await this.supabaseAdmin.auth.admin.updateUserById(
                    userId,
                    { ban_duration: undefined }
                )
            }

            // Update user profile status in database
            return this.createOrUpdateUserProfile(userId, { status })
        } catch (error: any) {
            logger.error(`[UserService] Update user status error: ${error.message}`)
            throw error
        }
    }

    /**
     * Delete user
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async deleteUser(userId: string): Promise<void> {
        try {
            // Delete user from Supabase
            const { error } = await this.supabaseAdmin.auth.admin.deleteUser(userId)

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            // Delete user profile from database
            await this.userProfileRepository.delete(userId)
        } catch (error: any) {
            logger.error(`[UserService] Delete user error: ${error.message}`)
            throw error
        }
    }

    /**
     * Reset user password
     * @param {string} email - User email
     * @returns {Promise<void>}
     */
    async resetPassword(email: string): Promise<void> {
        try {
            const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email)

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }
        } catch (error: any) {
            logger.error(`[UserService] Reset password error: ${error.message}`)
            throw error
        }
    }

    /**
     * Reset user password (admin)
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async resetPasswordByAdmin(userId: string): Promise<void> {
        try {
            // Get user email
            const user = await this.getUserById(userId)
            
            // Generate password reset link
            const { error } = await this.supabaseAdmin.auth.admin.generateLink({
                type: 'recovery',
                email: user.email
            })

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }
        } catch (error: any) {
            logger.error(`[UserService] Admin reset password error: ${error.message}`)
            throw error
        }
    }

    /**
     * Search users
     * @param {UserSearchOptions} options - Search options
     * @returns {Promise<UserSearchResult>}
     */
    async searchUsers(options: UserSearchOptions = {}): Promise<UserSearchResult> {
        try {
            const page = options.page || 1
            const limit = options.limit || 20
            
            // Get all users from Supabase
            const { data, error } = await this.supabaseAdmin.auth.admin.listUsers()

            if (error) {
                throw new InternalFastflowError(StatusCodes.INTERNAL_SERVER_ERROR, error.message)
            }

            let filteredUsers = data.users

            // Filter by status if provided
            if (options.status) {
                filteredUsers = filteredUsers.filter(user => 
                    user.user_metadata?.status === options.status
                )
            }

            // Filter by search query if provided
            if (options.query) {
                const query = options.query.toLowerCase()
                filteredUsers = filteredUsers.filter(user => 
                    user.email?.toLowerCase().includes(query) ||
                    user.user_metadata?.firstName?.toLowerCase().includes(query) ||
                    user.user_metadata?.lastName?.toLowerCase().includes(query) ||
                    user.user_metadata?.displayName?.toLowerCase().includes(query)
                )
            }

            // Sort users if sortBy is provided
            if (options.sortBy) {
                const direction = options.sortDirection === 'desc' ? -1 : 1
                
                filteredUsers.sort((a, b) => {
                    let valueA, valueB
                    
                    if (options.sortBy === 'email') {
                        valueA = a.email || ''
                        valueB = b.email || ''
                    } else if (options.sortBy === 'createdAt') {
                        valueA = a.created_at || ''
                        valueB = b.created_at || ''
                    } else if (options.sortBy) {
                        const sortKey = options.sortBy as string;
                        valueA = a.user_metadata ? (a.user_metadata as Record<string, any>)[sortKey] || '' : ''
                        valueB = b.user_metadata ? (b.user_metadata as Record<string, any>)[sortKey] || '' : ''
                    }
                    
                    return valueA > valueB ? direction : -direction
                })
            }

            // Calculate pagination
            const total = filteredUsers.length
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

            // Get user profiles from database
            const userProfiles = await this.userProfileRepository.find()
            
            // Create a map of user profiles by ID for quick lookup
            const profileMap = new Map<string, UserProfileEntity>()
            userProfiles.forEach((profile: UserProfileEntity) => {
                profileMap.set(profile.id, profile)
            })
            
            // Map to user profiles, combining Supabase data with database profiles
            const users = await Promise.all(paginatedUsers.map(async user => {
                const profile = profileMap.get(user.id)
                if (profile) {
                    return this.combineUserData(user, profile)
                } else {
                    // If profile doesn't exist in database, create it
                    return this.createOrUpdateUserProfile(user.id, {
                        status: user.user_metadata?.status || UserStatus.ACTIVE
                    })
                }
            }))

            return {
                users,
                total,
                page,
                limit
            }
        } catch (error: any) {
            logger.error(`[UserService] Search users error: ${error.message}`)
            throw error
        }
    }

    /**
     * Map Supabase user to UserProfile
     * @param {any} user - Supabase user object
     * @returns {UserProfile}
     */
    private mapUserToProfile(user: any): UserProfile {
        return {
            id: user.id,
            email: user.email || '',
            firstName: user.user_metadata?.firstName,
            lastName: user.user_metadata?.lastName,
            displayName: user.user_metadata?.displayName,
            avatarUrl: user.user_metadata?.avatarUrl,
            status: user.user_metadata?.status || UserStatus.ACTIVE,
            phoneNumber: user.user_metadata?.phoneNumber,
            lastLogin: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
            preferences: user.user_metadata?.preferences || {},
            metadata: user.user_metadata || {},
            createdAt: new Date(user.created_at),
            updatedAt: new Date(user.updated_at)
        }
    }

    /**
     * Create or update a user profile in the database
     * @param {string} userId - User ID
     * @param {UserUpdateOptions} options - Profile data
     * @returns {Promise<UserProfile>}
     */
    private async createOrUpdateUserProfile(userId: string, options: UserUpdateOptions): Promise<UserProfile> {
        try {
            // Get Supabase user data
            const { data, error } = await this.supabaseAdmin.auth.admin.getUserById(userId)

            if (error) {
                throw new InternalFastflowError(StatusCodes.BAD_REQUEST, error.message)
            }

            if (!data.user) {
                throw new InternalFastflowError(StatusCodes.NOT_FOUND, 'User not found')
            }

            // Check if user profile exists
            let userProfile = await this.userProfileRepository.findOne({
                where: { id: userId } as any
            })

            if (userProfile) {
                // Update existing profile
                userProfile.firstName = options.firstName !== undefined ? options.firstName : userProfile.firstName
                userProfile.lastName = options.lastName !== undefined ? options.lastName : userProfile.lastName
                userProfile.displayName = options.displayName !== undefined ? options.displayName : userProfile.displayName
                userProfile.avatarUrl = options.avatarUrl !== undefined ? options.avatarUrl : userProfile.avatarUrl
                userProfile.phoneNumber = options.phoneNumber !== undefined ? options.phoneNumber : userProfile.phoneNumber
                userProfile.status = options.status !== undefined ? options.status : userProfile.status
                userProfile.preferences = options.preferences !== undefined ? options.preferences : userProfile.preferences
                userProfile.metadata = options.metadata !== undefined ? { ...userProfile.metadata, ...options.metadata } : userProfile.metadata
                userProfile.lastLogin = data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : userProfile.lastLogin
                
                await this.userProfileRepository.save(userProfile)
            } else {
                // Create new profile
                userProfile = this.userProfileRepository.create({
                    id: userId,
                    firstName: options.firstName,
                    lastName: options.lastName,
                    displayName: options.displayName || `${options.firstName || ''} ${options.lastName || ''}`.trim() || undefined,
                    avatarUrl: options.avatarUrl,
                    phoneNumber: options.phoneNumber,
                    status: options.status || UserStatus.ACTIVE,
                    preferences: options.preferences || {},
                    metadata: options.metadata || {},
                    lastLogin: data.user.last_sign_in_at ? new Date(data.user.last_sign_in_at) : undefined
                })
                
                await this.userProfileRepository.save(userProfile)
            }

            // Return combined user data
            return this.combineUserData(data.user, userProfile)
        } catch (error: any) {
            logger.error(`[UserService] Create/update user profile error: ${error.message}`)
            throw error
        }
    }

    /**
     * Combine Supabase user data with database profile
     * @param {any} supabaseUser - Supabase user object
     * @param {UserProfileEntity} dbProfile - Database profile
     * @returns {UserProfile}
     */
    private combineUserData(supabaseUser: any, dbProfile: UserProfileEntity): UserProfile {
        return {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            firstName: dbProfile.firstName,
            lastName: dbProfile.lastName,
            displayName: dbProfile.displayName,
            avatarUrl: dbProfile.avatarUrl,
            status: dbProfile.status as UserStatus,
            phoneNumber: dbProfile.phoneNumber,
            lastLogin: dbProfile.lastLogin || (supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined),
            preferences: dbProfile.preferences || {},
            metadata: dbProfile.metadata || {},
            createdAt: dbProfile.createdAt || new Date(supabaseUser.created_at),
            updatedAt: dbProfile.updatedAt || new Date(supabaseUser.updated_at)
        }
    }
}

export default UserService