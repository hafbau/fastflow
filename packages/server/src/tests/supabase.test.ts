import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { 
    signUp, 
    signIn, 
    signOut, 
    resetPassword, 
    updatePassword, 
    getUserById,
    createUser, 
    inviteUser, 
    deleteUser 
} from '../utils/supabase'
import { getSupabaseConfig } from '../config/supabase'

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
    const mockAuth = {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithOtp: jest.fn(),
        signOut: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        getUser: jest.fn()
    }

    const mockAdmin = {
        getUserById: jest.fn(),
        createUser: jest.fn(),
        generateLink: jest.fn(),
        deleteUser: jest.fn()
    }

    return {
        createClient: jest.fn(() => ({
            auth: {
                ...mockAuth,
                admin: mockAdmin
            }
        }))
    }
})

// Mock the config
jest.mock('../config/supabase', () => ({
    getSupabaseConfig: jest.fn(() => ({
        url: 'https://test.supabase.co',
        anonKey: 'test-anon-key',
        serviceRoleKey: 'test-service-role-key'
    })),
    isSupabaseConfigured: jest.fn(() => true)
}))

describe('Supabase Authentication', () => {
    beforeAll(() => {
        // Ensure the mock is properly set up
        expect(getSupabaseConfig()).toEqual({
            url: 'https://test.supabase.co',
            anonKey: 'test-anon-key',
            serviceRoleKey: 'test-service-role-key'
        })
    })

    afterAll(() => {
        jest.resetAllMocks()
    })

    describe('User Registration and Authentication', () => {
        it('should sign up a new user', async () => {
            const mockResponse = {
                data: { user: { id: 'test-user-id' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.signUp.mockResolvedValue(mockResponse)
            
            const result = await signUp('test@example.com', 'password123')
            expect(result).toEqual({ user: { id: 'test-user-id' } })
        })

        it('should sign in a user with email and password', async () => {
            const mockResponse = {
                data: { user: { id: 'test-user-id' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.signInWithPassword.mockResolvedValue(mockResponse)
            
            const result = await signIn('test@example.com', 'password123')
            expect(result).toEqual({ user: { id: 'test-user-id' } })
        })

        it('should sign out a user', async () => {
            const mockResponse = {
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.signOut.mockResolvedValue(mockResponse)
            
            const result = await signOut()
            expect(result).toBe(true)
        })
    })

    describe('Password Management', () => {
        it('should reset a user password', async () => {
            const mockResponse = {
                data: {},
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.resetPasswordForEmail.mockResolvedValue(mockResponse)
            
            const result = await resetPassword('test@example.com')
            expect(result).toBe(true)
        })

        it('should update a user password', async () => {
            const mockResponse = {
                data: { user: { id: 'test-user-id' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.updateUser.mockResolvedValue(mockResponse)
            
            const result = await updatePassword('new-password123')
            expect(result).toEqual({ id: 'test-user-id' })
        })
    })

    describe('User Management (Admin)', () => {
        it('should get a user by ID', async () => {
            const mockResponse = {
                data: { user: { id: 'test-user-id', email: 'test@example.com' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.admin.getUserById.mockResolvedValue(mockResponse)
            
            const result = await getUserById('test-user-id')
            expect(result).toEqual({ id: 'test-user-id', email: 'test@example.com' })
        })

        it('should create a new user', async () => {
            const mockResponse = {
                data: { user: { id: 'new-user-id', email: 'new@example.com' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.admin.createUser.mockResolvedValue(mockResponse)
            
            const result = await createUser('new@example.com', 'password123')
            expect(result).toEqual({ id: 'new-user-id', email: 'new@example.com' })
        })

        it('should invite a user', async () => {
            const mockCreateResponse = {
                data: { user: { id: 'invited-user-id', email: 'invited@example.com' } },
                error: null
            }
            
            const mockGenerateLinkResponse = {
                data: { properties: { action_link: 'https://example.com/invite' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.admin.createUser.mockResolvedValue(mockCreateResponse)
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.admin.generateLink.mockResolvedValue(mockGenerateLinkResponse)
            
            const result = await inviteUser('invited@example.com')
            expect(result).toEqual({ 
                user: { id: 'invited-user-id', email: 'invited@example.com' },
                inviteUrl: 'https://example.com/invite'
            })
        })

        it('should delete a user', async () => {
            const mockResponse = {
                data: { user: { id: 'deleted-user-id' } },
                error: null
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.admin.deleteUser.mockResolvedValue(mockResponse)
            
            const result = await deleteUser('deleted-user-id')
            expect(result).toBe(true)
        })
    })

    describe('Error Handling', () => {
        it('should handle sign up errors', async () => {
            const mockResponse = {
                data: { user: null },
                error: { message: 'Email already registered' }
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.signUp.mockResolvedValue(mockResponse)
            
            await expect(signUp('test@example.com', 'password123')).rejects.toThrow('Email already registered')
        })

        it('should handle sign in errors', async () => {
            const mockResponse = {
                data: { user: null },
                error: { message: 'Invalid login credentials' }
            }
            
            // @ts-ignore - Mocked function
            require('@supabase/supabase-js').createClient().auth.signInWithPassword.mockResolvedValue(mockResponse)
            
            await expect(signIn('test@example.com', 'wrong-password')).rejects.toThrow('Invalid login credentials')
        })
    })
})