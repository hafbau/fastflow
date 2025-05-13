import request from 'supertest'
import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getInitializedDataSource } from '../DataSource'
import invitationService from '../services/invitations'
import { Organization } from '../database/entities/Organization'
import { Workspace } from '../database/entities/Workspace'
import { Invitation } from '../database/entities/Invitation'
import { UserProfile } from '../database/entities/UserProfile'
import { OrganizationMember } from '../database/entities/OrganizationMember'
import { WorkspaceMember } from '../database/entities/WorkspaceMember'

// Setup mock Express app to test the API
const app = express()
app.use(express.json())

// Mock authentication middleware
const mockAuth = (req: any, res: any, next: any) => {
    req.user = {
        id: 'test-user-id',
        email: 'test@example.com'
    }
    next()
}

// Mock permission middleware
const mockPermission = (permission: string) => (req: any, res: any, next: any) => {
    next()
}

// Import and apply routes
import invitationsRouter from '../routes/invitations'
app.use(mockAuth) // Apply mock auth to all routes
app.use('/', invitationsRouter)

describe('Invitation System Integration Test', () => {
    let dataSource: any
    let organizationId: string
    let workspaceId: string
    let userId: string
    let invitationToken: string
    
    beforeAll(async () => {
        // Initialize TypeORM data source
        dataSource = await getInitializedDataSource()
        
        // Create test organization
        const orgRepo = dataSource.getRepository(Organization)
        const newOrg = orgRepo.create({
            name: 'Test Organization',
            slug: `test-org-${uuidv4().substring(0, 8)}`
        })
        await orgRepo.save(newOrg)
        organizationId = newOrg.id
        
        // Create test workspace
        const workspaceRepo = dataSource.getRepository(Workspace)
        const newWorkspace = workspaceRepo.create({
            name: 'Test Workspace',
            slug: `test-workspace-${uuidv4().substring(0, 8)}`,
            organizationId: organizationId
        })
        await workspaceRepo.save(newWorkspace)
        workspaceId = newWorkspace.id
        
        // Create test user
        const userRepo = dataSource.getRepository(UserProfile)
        const newUser = userRepo.create({
            email: `test-user-${uuidv4().substring(0, 8)}@example.com`,
            firstName: 'Test',
            lastName: 'User',
            status: 'active'
        })
        await userRepo.save(newUser)
        userId = newUser.id
    })
    
    afterAll(async () => {
        // Clean up test data
        if (dataSource) {
            // Delete test invitations
            await dataSource.getRepository(Invitation).delete({ organizationId })
            
            // Delete test workspace members
            await dataSource.getRepository(WorkspaceMember).delete({ workspaceId })
            
            // Delete test organization members
            await dataSource.getRepository(OrganizationMember).delete({ organizationId })
            
            // Delete test workspace
            await dataSource.getRepository(Workspace).delete({ id: workspaceId })
            
            // Delete test organization
            await dataSource.getRepository(Organization).delete({ id: organizationId })
            
            // Delete test user
            await dataSource.getRepository(UserProfile).delete({ id: userId })
            
            // Close data source
            await dataSource.destroy()
        }
    })
    
    describe('Creating Invitations', () => {
        test('should create an organization invitation', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
            // Create invitation via service
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                role: 'member',
                invitedBy: userId
            })
            
            expect(invitation).toBeDefined()
            expect(invitation.email).toBe(email)
            expect(invitation.organizationId).toBe(organizationId)
            expect(invitation.role).toBe('member')
            expect(invitation.invitationType).toBe('organization')
            
            // Save token for later tests
            invitationToken = invitation.token
        })
        
        test('should create a workspace invitation', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
            // Create invitation via service
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                workspaceId,
                role: 'editor',
                invitedBy: userId
            })
            
            expect(invitation).toBeDefined()
            expect(invitation.email).toBe(email)
            expect(invitation.organizationId).toBe(organizationId)
            expect(invitation.workspaceId).toBe(workspaceId)
            expect(invitation.role).toBe('editor')
            expect(invitation.invitationType).toBe('workspace')
        })
    })
    
    describe('Retrieving Invitations', () => {
        test('should get invitation by token', async () => {
            const invitation = await invitationService.getInvitationByToken(invitationToken)
            
            expect(invitation).toBeDefined()
            expect(invitation.token).toBe(invitationToken)
        })
        
        test('should get organization invitations', async () => {
            const invitations = await invitationService.getOrganizationInvitations(organizationId)
            
            expect(invitations).toBeDefined()
            expect(invitations.length).toBeGreaterThan(0)
            expect(invitations[0].organizationId).toBe(organizationId)
            expect(invitations[0].workspaceId).toBeNull() // Only org invitations
        })
        
        test('should get all organization invitations including workspace invitations', async () => {
            const invitations = await invitationService.getOrganizationInvitations(organizationId, true)
            
            expect(invitations).toBeDefined()
            expect(invitations.length).toBeGreaterThan(1) // Should include both types
            
            // Verify we have at least one of each type
            const orgInvitation = invitations.find(inv => inv.workspaceId === null)
            const workspaceInvitation = invitations.find(inv => inv.workspaceId !== null)
            
            expect(orgInvitation).toBeDefined()
            expect(workspaceInvitation).toBeDefined()
        })
        
        test('should get workspace invitations', async () => {
            const invitations = await invitationService.getWorkspaceInvitations(workspaceId)
            
            expect(invitations).toBeDefined()
            expect(invitations.length).toBeGreaterThan(0)
            expect(invitations[0].workspaceId).toBe(workspaceId)
        })
    })
    
    describe('Updating Invitations', () => {
        test('should resend an invitation', async () => {
            const invitation = await invitationService.resendInvitation(invitationToken)
            
            expect(invitation).toBeDefined()
            expect(invitation.token).toBe(invitationToken)
            expect(invitation.status).toBe('pending')
            
            // Verify expiration date was updated
            const expiresAfter = new Date()
            expiresAfter.setDate(expiresAfter.getDate() + 6) // Slightly less than 7 days
            expect(invitation.expiresAt.getTime()).toBeGreaterThan(expiresAfter.getTime())
        })
        
        test('should cancel an invitation', async () => {
            // Create a new invitation to cancel
            const email = `invite-cancel-${uuidv4().substring(0, 8)}@example.com`
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                role: 'member'
            })
            
            await invitationService.cancelInvitation(invitation.id)
            
            const updatedInvitation = await invitationService.getInvitationById(invitation.id)
            expect(updatedInvitation.status).toBe('canceled')
        })
    })
    
    // Note: This is just testing the service. In a real application,
    // you would also test the API endpoints through the Express app.
})