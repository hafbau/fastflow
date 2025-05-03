/**
 * Authorization Middleware Tests
 * 
 * This module contains tests for the authorization middleware.
 */

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { User } from '@supabase/supabase-js'
import { AuthContext, PermissionCheckOptions } from '../middleware/auth/types'
import { verifyJWT } from '../middleware/auth/jwtVerification'
import { createUserContext } from '../middleware/auth/userContext'
import { checkPermission } from '../middleware/auth/permissionCheck'

// Mock Express request and response
const mockRequest = () => {
  const req: Partial<Request> = {
    headers: {},
    params: {},
    query: {}
  }
  return req as Request
}

const mockResponse = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis()
  }
  return res as Response
}

// Mock next function
const mockNext = jest.fn()

// Mock requireSystemAdmin middleware
const requireSystemAdmin = (req: Request, res: Response, next: Function) => {
  const authContext = (req as any).authContext as AuthContext
  
  if (!authContext || !authContext.user) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    })
  }
  
  if (!authContext.isSystemAdmin) {
    return res.status(StatusCodes.FORBIDDEN).json({
      error: 'Forbidden',
      message: 'System administrator access required'
    })
  }
  
  next()
}

describe('Authorization Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyJWT', () => {
    it('should call next if no Authorization header', async () => {
      const req = mockRequest()
      const res = mockResponse()
      
      await verifyJWT(req, res, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should call next if path is whitelisted', async () => {
      const req = mockRequest()
      req.path = '/api/v1/health'
      const res = mockResponse()
      
      await verifyJWT(req, res, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })
  })
  
  describe('createUserContext', () => {
    it('should create empty context if no user', async () => {
      const req = mockRequest()
      const res = mockResponse()
      
      await createUserContext(req, res, mockNext)
      
      expect(req).toHaveProperty('authContext')
      expect(mockNext).toHaveBeenCalled()
    })
  })
  
  describe('checkPermission', () => {
    it('should deny access if no auth context', async () => {
      const req = mockRequest()
      const res = mockResponse()
      
      const options: PermissionCheckOptions = {
        resourceType: 'chatflow',
        action: 'read'
      }
      
      await checkPermission(options)(req, res, mockNext)
      
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
      expect(res.json).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should allow access if user has permission', async () => {
      const req = mockRequest()
      const res = mockResponse()
      
      // Mock auth context
      const authContext: Partial<AuthContext> = {
        user: { id: 'user-123' } as User,
        authMethod: 'jwt',
        isSystemAdmin: false,
        permissions: ['chatflow:read', 'chatflow:create'],
        organizationRoles: { 'org-123': 'admin' },
        workspaceRoles: { 'ws-123': 'admin' },
        organizations: { 'org-123': { id: 'org-123', name: 'Test Organization' } },
        workspaces: { 'ws-123': { id: 'ws-123', name: 'Test Workspace', organizationId: 'org-123' } }
      }
      
      Object.defineProperty(req, 'authContext', {
        value: authContext,
        writable: true,
        enumerable: true,
        configurable: true
      })
      
      const options: PermissionCheckOptions = {
        resourceType: 'chatflow',
        action: 'read'
      }
      
      await checkPermission(options)(req, res, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should deny access if user does not have permission', async () => {
      const req = mockRequest()
      const res = mockResponse()
      
      // Mock auth context
      const authContext: Partial<AuthContext> = {
        user: { id: 'user-123' } as User,
        authMethod: 'jwt',
        isSystemAdmin: false,
        permissions: ['chatflow:read'],
        organizationRoles: { 'org-123': 'admin' },
        workspaceRoles: { 'ws-123': 'admin' },
        organizations: { 'org-123': { id: 'org-123', name: 'Test Organization' } },
        workspaces: { 'ws-123': { id: 'ws-123', name: 'Test Workspace', organizationId: 'org-123' } }
      }
      
      Object.defineProperty(req, 'authContext', {
        value: authContext,
        writable: true,
        enumerable: true,
        configurable: true
      })
      
      const options: PermissionCheckOptions = {
        resourceType: 'chatflow',
        action: 'delete'
      }
      
      await checkPermission(options)(req, res, mockNext)
      
      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN)
      expect(res.json).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
  
  describe('requireSystemAdmin', () => {
    it('should deny access if no auth context', () => {
      const req = mockRequest()
      const res = mockResponse()
      
      requireSystemAdmin(req, res, mockNext)
      
      expect(res.status).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED)
      expect(res.json).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })
    
    it('should allow access if user is system admin', () => {
      const req = mockRequest()
      const res = mockResponse()
      
      // Mock auth context
      const authContext: Partial<AuthContext> = {
        user: { id: 'user-123' } as User,
        isSystemAdmin: true
      }
      
      Object.defineProperty(req, 'authContext', {
        value: authContext,
        writable: true,
        enumerable: true,
        configurable: true
      })
      
      requireSystemAdmin(req, res, mockNext)
      
      expect(mockNext).toHaveBeenCalled()
    })
    
    it('should deny access if user is not system admin', () => {
      const req = mockRequest()
      const res = mockResponse()
      
      // Mock auth context
      const authContext: Partial<AuthContext> = {
        user: { id: 'user-123' } as User,
        isSystemAdmin: false
      }
      
      Object.defineProperty(req, 'authContext', {
        value: authContext,
        writable: true,
        enumerable: true,
        configurable: true
      })
      
      requireSystemAdmin(req, res, mockNext)
      
      expect(res.status).toHaveBeenCalledWith(StatusCodes.FORBIDDEN)
      expect(res.json).toHaveBeenCalled()
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})