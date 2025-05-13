import fs from 'fs'
import path from 'path'
import { SupabaseClient } from '@supabase/supabase-js'
import logger from './logger'
import { getSupabaseConfig } from '../config/supabase'

/**
 * Email template types supported by Supabase Auth
 */
export enum EmailTemplateType {
    CONFIRMATION = 'confirmation',
    INVITATION = 'invitation',
    MAGIC_LINK = 'magic_link',
    RESET_PASSWORD = 'recovery',
    MFA = 'mfa'
}

/**
 * Load an email template from the file system
 * @param {EmailTemplateType} templateType - The type of email template to load
 * @returns {string} The email template HTML content
 */
export const loadEmailTemplate = (templateType: EmailTemplateType): string => {
    try {
        // Convert template type to filename, handling special cases with different formats
        let templateFilename: string = templateType.toString()
        
        // Handle special cases where enum value and filename don't match
        if (templateType === EmailTemplateType.RESET_PASSWORD) {
            templateFilename = 'reset-password'
        } else if (templateType === EmailTemplateType.MAGIC_LINK) {
            templateFilename = 'magic-link'
        } else if (templateType === EmailTemplateType.MFA) {
            templateFilename = 'mfa-verification'
        }
        
        const templatePath = path.join(
            __dirname,
            '..',
            'templates',
            'emails',
            `${templateFilename}.html`
        )
        return fs.readFileSync(templatePath, 'utf8')
    } catch (error: any) {
        logger.error(`Failed to load email template: ${templateType}`, error)
        throw new Error(`Failed to load email template: ${templateType}`)
    }
}

/**
 * Initialize email templates for Supabase Auth
 * This function should be called during application startup
 * @param {SupabaseClient} supabaseAdmin - The Supabase admin client
 * @returns {Promise<void>}
 */
export const initializeEmailTemplates = async (supabaseAdmin: SupabaseClient | null): Promise<void> => {
    if (!supabaseAdmin) {
        logger.warn('Supabase admin client not available, skipping email template configuration')
        return
    }

    try {
        // Instead of trying to configure email templates via API, we'll use a Send Email Hook
        // This log is to indicate we're transitioning to the new approach
        logger.info('Supabase email templates will be handled via Send Email Hook')
        logger.info('Using dashboard-configured email templates as fallback')
        
        // Verify templates exist in our app (for safety)
        for (const templateType of Object.values(EmailTemplateType)) {
            try {
                loadEmailTemplate(templateType as EmailTemplateType)
                logger.debug(`Template ${templateType} exists as a fallback`)
            } catch (error: any) {
                logger.warn(`Fallback template ${templateType} not found: ${error.message}`)
            }
        }
        
        logger.info('Supabase email templates initialized')
    } catch (error) {
        logger.error('Failed to initialize email templates', error)
        // Don't throw error here to prevent application startup failure
        // Just log the error and continue
    }
}

/**
 * Interface for invitation email template parameters
 */
interface InvitationEmailParams {
    inviteeEmail: string
    inviterName: string
    organizationName: string
    role: string
    invitationUrl: string
    inviterAvatar?: string
    workspaceName?: string
}

/**
 * Generate an HTML email template for organization/workspace invitations
 * @param {InvitationEmailParams} params - The parameters for the invitation email
 * @returns {string} The HTML email template
 */
export const getInvitationEmailTemplate = (params: InvitationEmailParams): string => {
    const { inviteeEmail, inviterName, organizationName, role, invitationUrl, inviterAvatar, workspaceName } = params
    
    // Determine if this is a workspace or organization invitation
    const invitationType = workspaceName ? 'workspace' : 'organization'
    const entityName = workspaceName || organizationName
    
    // Avatar section
    const avatarSection = inviterAvatar 
        ? `<div class="avatar"><img src="${inviterAvatar}" alt="${inviterName}" style="width: 50px; height: 50px; border-radius: 50%; margin-right: 10px;"></div>`
        : '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to join ${entityName}</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                max-width: 150px;
                margin-bottom: 20px;
            }
            .content {
                background-color: #f9f9f9;
                border-radius: 5px;
                padding: 30px;
                margin-bottom: 30px;
            }
            .inviter-section {
                display: flex;
                align-items: center;
                margin-bottom: 20px;
            }
            .avatar {
                margin-right: 15px;
            }
            .button {
                display: inline-block;
                background-color: #4a6cf7;
                color: white;
                text-decoration: none;
                padding: 12px 24px;
                border-radius: 4px;
                font-weight: bold;
                margin: 20px 0;
            }
            .footer {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 30px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="https://flowstack.ai/logo.png" alt="Flowstack Logo" class="logo">
            <h1>You've been invited!</h1>
        </div>
        
        <div class="content">
            <p>Hello ${inviteeEmail},</p>
            
            <div class="inviter-section">
                ${avatarSection}
                <div>
                    <p><strong>${inviterName}</strong> has invited you to join ${workspaceName ? `the "${workspaceName}" workspace in the "${organizationName}" organization` : `the "${organizationName}" organization`} as a <strong>${role}</strong>.</p>
                </div>
            </div>
            
            <p>Click the button below to accept this invitation and get started:</p>
            
            <div style="text-align: center;">
                <a href="${invitationUrl}" class="button">Accept Invitation</a>
            </div>
            
            <p>If you're having trouble with the button above, copy and paste the URL below into your web browser:</p>
            <p style="word-break: break-all;">${invitationUrl}</p>
            
            <p>This invitation will expire in 7 days.</p>
        </div>
        
        <div class="footer">
            <p>If you didn't expect this invitation, you can ignore this email.</p>
            <p>&copy; ${new Date().getFullYear()} Flowstack. All rights reserved.</p>
        </div>
    </body>
    </html>
    `
}