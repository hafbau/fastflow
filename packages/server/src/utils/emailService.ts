import { supabaseAdmin } from './supabase'
import logger from './logger'

/**
 * Interface for invitation email parameters
 */
interface InvitationEmailParams {
    email: string
    organizationName: string
    invitationType: 'organization' | 'workspace'
    token: string
    role: string
    workspaceName?: string
}

/**
 * Send an invitation email
 */
export const sendInvitationEmail = async (params: InvitationEmailParams): Promise<void> => {
    try {
        const { email, organizationName, invitationType, token, role, workspaceName } = params
        
        // Build the invitation URL
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'
        const invitationUrl = `${baseUrl}/${invitationType}-invitations/${token}`
        
        // Build the email subject
        let subject = ''
        if (invitationType === 'organization') {
            subject = `Invitation to join ${organizationName}`
        } else {
            subject = `Invitation to join ${workspaceName} workspace in ${organizationName}`
        }
        
        // Build the email content
        let content = ''
        if (invitationType === 'organization') {
            content = `
                <p>You have been invited to join the organization <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="${invitationUrl}">Accept Invitation</a></p>
                <p>This invitation will expire in 7 days.</p>
            `
        } else {
            content = `
                <p>You have been invited to join the workspace <strong>${workspaceName}</strong> in organization <strong>${organizationName}</strong> as a <strong>${role}</strong>.</p>
                <p>Click the link below to accept the invitation:</p>
                <p><a href="${invitationUrl}">Accept Invitation</a></p>
                <p>This invitation will expire in 7 days.</p>
            `
        }
        
        // Send the email using Supabase
        if (supabaseAdmin) {
            // Use the appropriate Supabase email API
            // This is a placeholder - actual implementation depends on Supabase version and API
            await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
                data: {
                    subject,
                    content,
                    redirectTo: invitationUrl
                }
            })
        } else {
            // If Supabase is not configured, log the email for development
            logger.info(`[DEV] Email would be sent to ${email} with subject: ${subject}`)
            logger.info(`[DEV] Email content: ${content}`)
        }
    } catch (error) {
        logger.error(`Failed to send invitation email: ${error}`)
        throw error
    }
}