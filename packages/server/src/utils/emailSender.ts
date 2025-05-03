import nodemailer from 'nodemailer'
import logger from './logger'

interface EmailOptions {
    to: string
    subject: string
    html: string
    from?: string
    text?: string
    attachments?: any[]
}

/**
 * Send an email using nodemailer
 * @param options Email options
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        // Get email configuration from environment variables
        const host = process.env.SMTP_HOST
        const port = parseInt(process.env.SMTP_PORT || '587')
        const user = process.env.SMTP_USER
        const pass = process.env.SMTP_PASSWORD
        const from = options.from || process.env.SMTP_FROM || 'noreply@flowstack.ai'
        
        // If SMTP is not configured, log a warning and return
        if (!host || !user || !pass) {
            logger.warn('SMTP not configured. Email not sent.')
            logger.info(`Would have sent email to ${options.to} with subject "${options.subject}"`)
            return
        }
        
        // Create transporter
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for other ports
            auth: {
                user,
                pass
            }
        })
        
        // Send email
        await transporter.sendMail({
            from,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
            attachments: options.attachments
        })
        
        logger.info(`Email sent to ${options.to} with subject "${options.subject}"`)
    } catch (error) {
        logger.error(`Failed to send email: ${error}`)
        throw error
    }
}