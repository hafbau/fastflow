/**
 * FlowStack Proxy Server Configuration
 */

require('dotenv').config();

module.exports = {
    // Server Configuration
    PORT: process.env.PORT || 3001,
    CORE_SERVER_URL: process.env.CORE_SERVER_URL || 'http://localhost:3000',
    CORE_UI_URL: process.env.CORE_UI_URL || 'http://localhost:8080',
    
    // CORS Configuration
    CORS_OPTIONS: {
        origin: true, // Allow all origins in development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'baggage', 'sentry-trace'],
        exposedHeaders: ['x-access-token']
    },
    
    // Rebranding Configuration
    REBRAND: {
        'Flowise': 'FlowStack',
        'flowise': 'flowstack',
        'FLOWISE': 'FLOWSTACK',
        'flowiseai.com': 'getflowstack.ai',
        'Build LLM Apps Easily': 'Build AI Agents, Visually',
        'Open source UI visual tool': 'The most powerful platform'
    }
}; 