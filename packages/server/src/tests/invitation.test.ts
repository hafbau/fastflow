import { v4 as uuidv4 } from 'uuid'
import { getRepository } from 'typeorm'
import { getInitializedDataSource } from '../DataSource'
import invitationService from '../services/invitations'
import { Organization } from '../database/entities/Organization'
import { Workspace } from '../database/entities/Workspace'
import { Invitation } from '../database/entities/Invitation'
import { UserProfile } from '../database/entities/UserProfile'
import { OrganizationMember } from '../database/entities/OrganizationMember'
import { WorkspaceMember } from '../database/entities/WorkspaceMember'
import { InternalFastflowError } from '../errors/InternalFastflowError'

describe('Invitation Service', () => {
    let dataSource: any
    let organizationId: string
    let workspaceId: string
    let userId: string
    
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
            // Delete test workspace members
            await dataSource.getRepository(WorkspaceMember).delete({ workspaceId })
            
            // Delete test organization members
            await dataSource.getRepository(OrganizationMember).delete({ organizationId })
            
            // Delete test invitations
            await dataSource.getRepository(Invitation).delete({ organizationId })
            
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
    
    describe('createInvitation', () => {
        let orgInvitationId: string
        let workspaceInvitationId: string
        
        test('should create organization invitation successfully', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
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
            expect(invitation.workspaceId).toBeNull()
            expect(invitation.status).toBe('pending')
            expect(invitation.token).toBeDefined()
            expect(invitation.invitationType).toBe('organization')
            
            orgInvitationId = invitation.id
        })
        
        test('should create workspace invitation successfully', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
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
            expect(invitation.status).toBe('pending')
            expect(invitation.token).toBeDefined()
            expect(invitation.invitationType).toBe('workspace')
            
            workspaceInvitationId = invitation.id
        })
        
        test('should fail to create invitation with invalid organization', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
            await expect(
                invitationService.createInvitation({
                    email,
                    organizationId: uuidv4(), // Non-existent ID
                    role: 'member'
                })
            ).rejects.toThrow(InternalFastflowError)
        })
        
        test('should fail to create invitation with invalid workspace', async () => {
            const email = `invite-${uuidv4().substring(0, 8)}@example.com`
            
            await expect(
                invitationService.createInvitation({
                    email,
                    organizationId,
                    workspaceId: uuidv4(), // Non-existent ID
                    role: 'member'
                })
            ).rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('getInvitationById', () => {
        let invitationId: string
        
        beforeAll(async () => {
            // Create a test invitation
            const email = `invite-get-${uuidv4().substring(0, 8)}@example.com`
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                role: 'member'
            })
            invitationId = invitation.id
        })
        
        test('should get invitation by ID', async () => {
            const invitation = await invitationService.getInvitationById(invitationId)
            
            expect(invitation).toBeDefined()
            expect(invitation.id).toBe(invitationId)
            expect(invitation.organizationId).toBe(organizationId)
        })
        
        test('should fail to get non-existent invitation', async () => {
            await expect(
                invitationService.getInvitationById(uuidv4())
            ).rejects.toThrow(InternalFastflowError)
        })
    })
    
    describe('cancelInvitation', () => {
        let invitationId: string
        
        beforeAll(async () => {
            // Create a test invitation
            const email = `invite-cancel-${uuidv4().substring(0, 8)}@example.com`
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                role: 'member'
            })
            invitationId = invitation.id
        })
        
        test('should cancel invitation successfully', async () => {
            await invitationService.cancelInvitation(invitationId)
            
            const invitation = await invitationService.getInvitationById(invitationId)
            expect(invitation.status).toBe('canceled')
        })
    })
    
    describe('resendInvitation', () => {
        let invitationId: string
        
        beforeAll(async () => {
            // Create a test invitation
            const email = `invite-resend-${uuidv4().substring(0, 8)}@example.com`
            const invitation = await invitationService.createInvitation({
                email,
                organizationId,
                role: 'member'
            })
            invitationId = invitation.id
        })
        
        test('should resend invitation successfully', async () => {
            // Set expiration date to past
            const pastDate = new Date()
            pastDate.setDate(pastDate.getDate() - 10)
            
            await dataSource.getRepository(Invitation).update(
                { id: invitationId },
                { expiresAt: pastDate }
            )
            
            // Verify it's expired
            let invitation = await invitationService.getInvitationById(invitationId)
            expect(invitation.expiresAt.getTime()).toBeLessThan(Date.now())
            
            // Resend the invitation
            invitation = await invitationService.resendInvitation(invitationId)
            
            // Verify expiration date is updated
            expect(invitation.expiresAt.getTime()).toBeGreaterThan(Date.now())
        })
        
        test('should fail to resend canceled invitation', async () => {
            // Cancel the invitation
            await invitationService.cancelInvitation(invitationId)
            
            // Try to resend
            await expect(
                invitationService.resendInvitation(invitationId)
            ).rejects.toThrow(InternalFastflowError)
        })
    })
})