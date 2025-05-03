/**
 * Backup Notification Utilities
 * 
 * This file contains utilities for sending backup notifications.
 */

import nodemailer from 'nodemailer';
import { IncomingWebhook } from '@slack/webhook';
import { getBackupConfig } from '../config/backupConfig';
import logger from '../../utils/logger';

/**
 * Notification type
 */
export type NotificationType = 'success' | 'failure' | 'warning' | 'info';

/**
 * Notification interface
 */
export interface BackupNotification {
    type: NotificationType;
    frequency: string;
    message: string;
    details?: any;
}

/**
 * Send backup notification
 * @param {BackupNotification} notification - Notification to send
 * @returns {Promise<boolean>} - True if notification was sent successfully
 */
export const sendBackupNotification = async (notification: BackupNotification): Promise<boolean> => {
    const backupConfig = getBackupConfig();
    
    if (!backupConfig.notification.enabled) {
        return false;
    }
    
    try {
        let notificationSent = false;
        
        // Send email notification if configured
        if (backupConfig.notification.email && backupConfig.notification.email.length > 0) {
            await sendEmailNotification(notification, backupConfig.notification.email);
            notificationSent = true;
        }
        
        // Send Slack notification if configured
        if (backupConfig.notification.slack) {
            await sendSlackNotification(notification, backupConfig.notification.slack);
            notificationSent = true;
        }
        
        return notificationSent;
    } catch (error) {
        logger.error(`[BackupNotification] Failed to send notification: ${error}`);
        return false;
    }
};

/**
 * Send email notification
 * @param {BackupNotification} notification - Notification to send
 * @param {string[]} recipients - Email recipients
 * @returns {Promise<void>}
 */
const sendEmailNotification = async (notification: BackupNotification, recipients: string[]): Promise<void> => {
    try {
        // Get email configuration from environment variables
        const smtpHost = process.env.SMTP_HOST || 'localhost';
        const smtpPort = parseInt(process.env.SMTP_PORT || '25');
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpFrom = process.env.SMTP_FROM || 'backup@flowstack.com';
        
        // Create nodemailer transport
        const transport = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: smtpUser && smtpPass ? {
                user: smtpUser,
                pass: smtpPass
            } : undefined
        });
        
        // Create email subject and body
        const subject = `Backup ${notification.type.toUpperCase()}: ${notification.frequency} backup ${notification.type === 'success' ? 'completed' : 'failed'}`;
        const body = createEmailBody(notification);
        
        // Send email
        await transport.sendMail({
            from: smtpFrom,
            to: recipients.join(', '),
            subject,
            html: body
        });
        
        logger.info(`[BackupNotification] Email notification sent to ${recipients.join(', ')}`);
    } catch (error) {
        logger.error(`[BackupNotification] Failed to send email notification: ${error}`);
        throw error;
    }
};

/**
 * Send Slack notification
 * @param {BackupNotification} notification - Notification to send
 * @param {string} webhookUrl - Slack webhook URL
 * @returns {Promise<void>}
 */
const sendSlackNotification = async (notification: BackupNotification, webhookUrl: string): Promise<void> => {
    try {
        // Create Slack webhook
        const webhook = new IncomingWebhook(webhookUrl);
        
        // Create Slack message
        const message = createSlackMessage(notification);
        
        // Send Slack message
        await webhook.send(message);
        
        logger.info('[BackupNotification] Slack notification sent');
    } catch (error) {
        logger.error(`[BackupNotification] Failed to send Slack notification: ${error}`);
        throw error;
    }
};

/**
 * Create email body
 * @param {BackupNotification} notification - Notification to create email body for
 * @returns {string} - Email body HTML
 */
const createEmailBody = (notification: BackupNotification): string => {
    const color = getNotificationColor(notification.type);
    const timestamp = new Date().toISOString();
    
    let detailsHtml = '';
    if (notification.details) {
        detailsHtml = '<h3>Details:</h3><ul>';
        for (const [key, value] of Object.entries(notification.details)) {
            detailsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
        }
        detailsHtml += '</ul>';
    }
    
    return `
        <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: ${color}; color: white; padding: 10px; text-align: center; }
                    .content { padding: 20px; border: 1px solid #ddd; }
                    .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Backup ${notification.type.toUpperCase()}</h2>
                    </div>
                    <div class="content">
                        <p><strong>Frequency:</strong> ${notification.frequency}</p>
                        <p><strong>Message:</strong> ${notification.message}</p>
                        <p><strong>Timestamp:</strong> ${timestamp}</p>
                        ${detailsHtml}
                    </div>
                    <div class="footer">
                        <p>This is an automated message from the Flowstack Backup System.</p>
                    </div>
                </div>
            </body>
        </html>
    `;
};

/**
 * Create Slack message
 * @param {BackupNotification} notification - Notification to create Slack message for
 * @returns {object} - Slack message object
 */
const createSlackMessage = (notification: BackupNotification): object => {
    const color = getNotificationColor(notification.type);
    const timestamp = Math.floor(Date.now() / 1000);
    
    let detailsText = '';
    if (notification.details) {
        detailsText = '*Details:*\n';
        for (const [key, value] of Object.entries(notification.details)) {
            detailsText += `• *${key}:* ${value}\n`;
        }
    }
    
    return {
        blocks: [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: `Backup ${notification.type.toUpperCase()}: ${notification.frequency} backup`,
                    emoji: true
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: `*Message:* ${notification.message}\n*Timestamp:* <!date^${timestamp}^{date_num} {time_secs}|${new Date().toISOString()}>`
                }
            },
            {
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: detailsText
                }
            },
            {
                type: 'context',
                elements: [
                    {
                        type: 'mrkdwn',
                        text: 'This is an automated message from the Flowstack Backup System.'
                    }
                ]
            }
        ],
        attachments: [
            {
                color: color
            }
        ]
    };
};

/**
 * Get notification color based on type
 * @param {NotificationType} type - Notification type
 * @returns {string} - Color hex code
 */
const getNotificationColor = (type: NotificationType): string => {
    switch (type) {
        case 'success':
            return '#36a64f'; // Green
        case 'failure':
            return '#ff0000'; // Red
        case 'warning':
            return '#ffcc00'; // Yellow
        case 'info':
            return '#3aa3e3'; // Blue
        default:
            return '#666666'; // Gray
    }
};