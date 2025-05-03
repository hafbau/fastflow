/**
 * Application configuration
 */
const config = {
    // Application URL
    appURL: process.env.APP_URL || 'http://localhost:3000',
    
    // Server port
    port: parseInt(process.env.PORT || '3000'),
    
    // Database configuration
    database: {
        type: process.env.DATABASE_TYPE || 'sqlite',
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT ? parseInt(process.env.DATABASE_PORT) : undefined,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME || 'flowstack',
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true'
    },
    
    // Email configuration
    email: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM || 'noreply@flowstack.ai'
    },
    
    // JWT configuration
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    },
    
    // Supabase configuration
    supabase: {
        url: process.env.SUPABASE_URL || '',
        key: process.env.SUPABASE_KEY || '',
        jwtSecret: process.env.SUPABASE_JWT_SECRET || ''
    }
}

export default config