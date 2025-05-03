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
 * Configure a single email template using the Supabase REST API
 * @param {SupabaseClient} supabaseAdmin - The Supabase admin client
 * @param {string} type - The template type
 * @param {string} template - The template HTML content
 * @returns {Promise<void>}
 */
const configureTemplate = async (
    supabaseAdmin: SupabaseClient,
    type: string,
    template: string
): Promise<void> => {
    try {
        // Get the API URL and key from the config
        const config = getSupabaseConfig()
        const supabaseUrl = config.url
        const supabaseKey = config.serviceRoleKey
        
        // Make a direct REST API call to update the template
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/templates/${type}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            },
            body: JSON.stringify({ template })
        })
        
        if (!response.ok) {
            const error = await response.json()
            throw new Error(`Failed to update template: ${JSON.stringify(error)}`)
        }
        
        logger.info(`Successfully configured ${type} email template`)
    } catch (error) {
        logger.error(`Failed to configure ${type} email template`, error)
        throw error
    }
}

/**
 * Load an email template from the file system
 * @param {EmailTemplateType} templateType - The type of email template to load
 * @returns {string} The email template HTML content
 */
export const loadEmailTemplate = (templateType: EmailTemplateType): string => {
    try {
        const templatePath = path.join(
            __dirname,
            '..',
            'templates',
            'emails',
            `${templateType === EmailTemplateType.RESET_PASSWORD ? 'reset-password' : templateType}.html`
        )
        return fs.readFileSync(templatePath, 'utf8')
    } catch (error) {
        logger.error(`Failed to load email template: ${templateType}`, error)
        throw new Error(`Failed to load email template: ${templateType}`)
    }
}

/**
 * Configure email templates for Supabase Auth
 * @param {SupabaseClient} supabaseAdmin - The Supabase admin client
 * @returns {Promise<void>}
 */
export const configureEmailTemplates = async (supabaseAdmin: SupabaseClient): Promise<void> => {
    try {
        logger.info('Configuring Supabase email templates')

        // For Supabase v2, we need to use a REST API call to update email templates
        // as the JS client doesn't expose this functionality directly
        
        // Configure confirmation email template
        const confirmationTemplate = loadEmailTemplate(EmailTemplateType.CONFIRMATION)
        await configureTemplate(supabaseAdmin, 'confirmation', confirmationTemplate)

        // Configure invitation email template
        const invitationTemplate = loadEmailTemplate(EmailTemplateType.INVITATION)
        await configureTemplate(supabaseAdmin, 'invitation', invitationTemplate)

        // Configure magic link email template
        const magicLinkTemplate = loadEmailTemplate(EmailTemplateType.MAGIC_LINK)
        await configureTemplate(supabaseAdmin, 'magic_link', magicLinkTemplate)

        // Configure reset password email template
        const resetPasswordTemplate = loadEmailTemplate(EmailTemplateType.RESET_PASSWORD)
        await configureTemplate(supabaseAdmin, 'recovery', resetPasswordTemplate)

        // Configure MFA email template
        const mfaTemplate = loadEmailTemplate(EmailTemplateType.MFA)
        await configureTemplate(supabaseAdmin, 'mfa', mfaTemplate)

        logger.info('Successfully configured Supabase email templates')
    } catch (error) {
        logger.error('Failed to configure Supabase email templates', error)
        throw new Error('Failed to configure Supabase email templates')
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
        await configureEmailTemplates(supabaseAdmin)
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
    workspaceName?: string
}

/**
 * Generate an HTML email template for organization/workspace invitations
 * @param {InvitationEmailParams} params - The parameters for the invitation email
 * @returns {string} The HTML email template
 */
export const getInvitationEmailTemplate = (params: InvitationEmailParams): string => {
    const { inviteeEmail, inviterName, organizationName, role, invitationUrl, workspaceName } = params
    
    // Determine if this is a workspace or organization invitation
    const invitationType = workspaceName ? 'workspace' : 'organization'
    const entityName = workspaceName || organizationName
    
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
            
            <p>${inviterName} has invited you to join ${workspaceName ? `the "${workspaceName}" workspace in the "${organizationName}" organization` : `the "${organizationName}" organization`} as a <strong>${role}</strong>.</p>
            
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