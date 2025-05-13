# Customizing Auth Emails with Send Email Hook

This document explains how to properly set up a Send Email Hook to customize Supabase Auth emails in the Flowstack application.

## Background

Our original approach to customizing email templates was trying to use a deprecated API endpoint that no longer exists in Supabase. The proper solution is to use Supabase's Auth Hooks feature, specifically the Send Email Hook.

## How It Works

1. When Supabase Auth needs to send an email (signup, password reset, etc.), it will call our webhook
2. Our webhook creates a custom email using our own templates and branding
3. We control the entire email creation and delivery process

## Setup Instructions

### 1. Create an Edge Function

Create a Supabase Edge Function that will handle the email creation and sending:

```typescript
// send-email/index.ts
import { Webhook } from '@supabase/auth-helpers-nextjs'
import { createTransport } from 'nodemailer'
// Or use your preferred email sending library

// Your own email template utilities
import { renderConfirmationEmail, renderResetPasswordEmail } from '../emails/templates'

export const handler = async (req, res) => {
  // Verify the webhook signature
  const webhookSecret = process.env.SUPABASE_AUTH_WEBHOOK_SECRET
  const signature = req.headers['x-signature']
  const body = await req.text()
  
  const webhook = new Webhook(webhookSecret)
  const payload = webhook.verify(body, signature)
  
  // Extract the required information
  const { email_data, user } = payload
  const { email_action_type, token, token_hash, redirect_to } = email_data
  
  // Create the appropriate email based on the action type
  let emailHtml, emailSubject
  
  switch (email_action_type) {
    case 'confirmation':
      emailHtml = renderConfirmationEmail({
        confirmationUrl: `${process.env.SITE_URL}/auth/confirm?token_hash=${token_hash}&type=signup&redirect_to=${redirect_to}`,
        token
      })
      emailSubject = 'Confirm your Flowstack account'
      break
      
    case 'reset_password':
      emailHtml = renderResetPasswordEmail({
        resetUrl: `${process.env.SITE_URL}/auth/reset-password?token_hash=${token_hash}&type=recovery&redirect_to=${redirect_to}`,
        token
      })
      emailSubject = 'Reset your Flowstack password'
      break
      
    // Handle other email types: magic_link, invite, etc.
  }
  
  // Send the email
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  })
  
  await transporter.sendMail({
    from: `"Flowstack" <${process.env.SMTP_FROM}>`,
    to: user.email,
    subject: emailSubject,
    html: emailHtml
  })
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 2. Deploy the Function

Deploy your Edge Function:

```bash
supabase functions deploy send-email --no-verify-jwt
```

### 3. Configure the Send Email Hook

1. Go to the Supabase Dashboard > Authentication > Auth Hooks
2. Create a new Send Email Hook
3. Enter the URL of your deployed function
4. Generate a strong webhook secret
5. Save the configuration

### 4. Update Environment Variables

Make sure to set all the required environment variables for your function:

```bash
supabase secrets set \
  SUPABASE_AUTH_WEBHOOK_SECRET=your_webhook_secret \
  SITE_URL=https://your-site.com \
  SMTP_HOST=smtp.example.com \
  SMTP_PORT=587 \
  SMTP_USER=your_smtp_username \
  SMTP_PASSWORD=your_smtp_password \
  SMTP_FROM=noreply@your-site.com
```

## Benefits

- **Complete Control**: Design emails exactly how you want with your branding
- **Flexibility**: Use any email template system or email delivery service
- **Easier Debugging**: Errors during email sending are tracked in your function logs
- **Better User Experience**: Create more user-friendly and branded emails

## Testing

To test the webhook locally:

1. Run your function locally: `supabase functions serve send-email --env-file .env.local`
2. Use a tool like Postman to send POST requests to your local endpoint with test data
3. Check your email service to see if the emails are being sent correctly

## Troubleshooting

- Check function logs for errors: `supabase functions logs send-email`
- Verify webhook signature is being validated correctly
- Make sure your SMTP credentials are correct
- Test email templates separately from the webhook logic

## References

- [Supabase Auth Hooks Documentation](https://supabase.com/docs/guides/auth/auth-hooks)
- [Send Email Hook Example](https://supabase.com/docs/guides/functions/examples/auth-send-email-hook-react-email-resend) 