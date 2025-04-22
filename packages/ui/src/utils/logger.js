/**
 * Simple logger utility for consistent logging
 */

const logger = {
    debug: (message, ...args) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[DEBUG] ${message}`, ...args)
        }
    },
    
    info: (message, ...args) => {
        console.info(`[INFO] ${message}`, ...args)
    },
    
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args)
    },
    
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args)
    }
}

export default logger 