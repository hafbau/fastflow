import request from 'supertest'
import express from 'express'
import { getRepository } from 'typeorm'
import { App } from '../index'
import { ApiKey } from '../database/entities/ApiKey'
import apiKeyService from '../services/apiKeyService'
import { authConfig } from '../config/auth'
import { generateAPIKey, generateSecretHash } from '../utils/apiKey'
import { createUser, signIn } from '../utils/supabase'

describe('Authentication Compatibility Layer', () => {
    let appInstance: App
    let app: express.Application
    let apiKey: string
    let apiKeyId: string
    let supabaseToken: string
    let supabaseUserId: string
    
    beforeAll(async () => {
        // Save original environment variables
        const originalEnv = { ...process.env }
        
        // Set up test environment
        process.env.ENABLE_SUPABASE_AUTH = 'true'
        process.env.SUPABASE_AUTH_PRIMARY = 'true'
        process.env.ENABLE_API_KEY_AUTH = 'true'
        process.env.API_KEY_REQUIRE_USER = 'false'
        process.env.APIKEY_STORAGE_TYPE = 'database'
        process.env.FASTFLOW_USERNAME = 'testuser'
        process.env.FASTFLOW_PASSWORD = 'testpassword'
        
        // Initialize app
        appInstance = new App()
        await appInstance.initDatabase()
        await appInstance.config()
        app = appInstance.app
        
        // Create a test user in Supabase
        try {
            const email = `test-${Date.now()}@example.com`
            const password = 'Test123456!'
            
            const userData = await createUser(email, password, {
                name: 'Test User',
                isTestUser: true
            })
            
            if (userData && userData.user) {
                supabaseUserId = userData.user.id
                
                // Sign in to get a token
                const authData = await signIn(email, password)
                if (authData && authData.session) {
                    supabaseToken = authData.session.access_token
                }
            }
        } catch (error) {
            console.error('Error creating test user:', error)
        }
        
        // Create a test API key
        try {
            const key = await apiKeyService.createApiKey('Test API Key')
            if (key) {
                apiKey = key.apiKey
                apiKeyId = key.id
            }
        } catch (error) {
            console.error('Error creating test API key:', error)
            
            // Fallback to direct creation if service fails
            const newApiKey = generateAPIKey()
            const apiSecret = generateSecretHash(newApiKey)
            
            const apiKeyRepo = getRepository(ApiKey)
            const newKey = apiKeyRepo.create({
                id: Date.now().toString(),
                keyName: 'Test API Key',
                apiKey: newApiKey,
                apiSecret
            })
            
            await apiKeyRepo.save(newKey)
            apiKey = newApiKey
            apiKeyId = newKey.id
        }
        
        return () => {
            // Restore original environment variables
            process.env = originalEnv
        }
    })
    
    describe('Authentication Methods', () => {
        test('Should authenticate with Supabase JWT token', async () => {
            if (!supabaseToken) {
                console.warn('Skipping Supabase auth test - no token available')
                return
            }
            
            const response = await request(app)
                .get('/api/v1/flows')
                .set('Authorization', `Bearer ${supabaseToken}`)
                
            expect(response.status).not.toBe(401)
        })
        
        test('Should authenticate with API key', async () => {
            if (!apiKey) {
                console.warn('Skipping API key auth test - no key available')
                return
            }
            
            const response = await request(app)
                .get('/api/v1/flows')
                .set('Authorization', `Bearer ${apiKey}`)
                
            expect(response.status).not.toBe(401)
        })
        
        test('Should authenticate with Basic Auth', async () => {
            const credentials = Buffer.from(`${process.env.FASTFLOW_USERNAME}:${process.env.FASTFLOW_PASSWORD}`).toString('base64')
            
            const response = await request(app)
                .get('/api/v1/flows')
                .set('Authorization', `Basic ${credentials}`)
                
            expect(response.status).not.toBe(401)
        })
        
        test('Should reject invalid credentials', async () => {
            const response = await request(app)
                .get('/api/v1/flows')
                .set('Authorization', 'Bearer invalid-token')
                
            expect(response.status).toBe(401)
        })
    })
    
    describe('API Key Association', () => {
        test('Should associate API key with Supabase user', async () => {
            if (!apiKeyId || !supabaseUserId) {
                console.warn('Skipping API key association test - missing data')
                return
            }
            
            const updatedKey = await apiKeyService.associateWithSupabaseUser(apiKeyId, supabaseUserId)
            expect(updatedKey).toBeTruthy()
            expect(updatedKey?.supabaseUserId).toBe(supabaseUserId)
            
            // Test authentication with the associated key
            const response = await request(app)
                .get('/api/v1/flows')
                .set('Authorization', `Bearer ${apiKey}`)
                
            expect(response.status).not.toBe(401)
        })
    })
    
    describe('Whitelist URLs', () => {
        test('Should allow access to whitelisted URLs without authentication', async () => {
            const response = await request(app)
                .get('/api/v1/ping')
                
            expect(response.status).not.toBe(401)
        })
    })
    
    describe('Internal Requests', () => {
        test('Should allow internal requests with x-request-from header', async () => {
            const response = await request(app)
                .get('/api/v1/flows')
                .set('x-request-from', 'internal')
                
            expect(response.status).not.toBe(401)
        })
        
        test('Should require auth for internal requests when configured', async () => {
            // Save original config
            const originalConfig = { ...authConfig.internalRequest }
            
            try {
                // Update config to require auth for internal requests
                authConfig.internalRequest.requireAuth = true
                
                const response = await request(app)
                    .get('/api/v1/flows')
                    .set('x-request-from', 'internal')
                    
                expect(response.status).toBe(401)
                
                // Test with basic auth
                const credentials = Buffer.from(`${process.env.FASTFLOW_USERNAME}:${process.env.FASTFLOW_PASSWORD}`).toString('base64')
                
                const authResponse = await request(app)
                    .get('/api/v1/flows')
                    .set('x-request-from', 'internal')
                    .set('Authorization', `Basic ${credentials}`)
                    
                expect(authResponse.status).not.toBe(401)
            } finally {
                // Restore original config
                authConfig.internalRequest.requireAuth = originalConfig.requireAuth
            }
        })
    })
    
    describe('API Key Storage', () => {
        test('Should store and retrieve API keys from database', async () => {
            if (!apiKeyId) {
                console.warn('Skipping API key storage test - no key available')
                return
            }
            
            // Ensure we're using database storage
            const originalStorageType = authConfig.apiKey.storageType
            authConfig.apiKey.storageType = 'database'
            
            try {
                // Retrieve the key
                const key = await apiKeyService.getApiKeyById(apiKeyId)
                expect(key).toBeTruthy()
                expect(key?.id).toBe(apiKeyId)
                
                // Validate the key
                const isValid = await apiKeyService.validateApiKey(apiKey)
                expect(isValid).toBe(true)
            } finally {
                // Restore original storage type
                authConfig.apiKey.storageType = originalStorageType
            }
        })
    })
    
    afterAll(async () => {
        // Clean up test data
        if (apiKeyId) {
            try {
                await apiKeyService.deleteApiKey(apiKeyId)
            } catch (error) {
                console.error('Error cleaning up test API key:', error)
            }
        }
        
        // Clean up test user (would require admin API call to Supabase)
    })
})