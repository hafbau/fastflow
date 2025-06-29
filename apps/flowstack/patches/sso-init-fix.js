// SSO initialization fix for FlowStack
// This module intercepts SSO initialization to prevent crashes

const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
    const result = originalRequire.apply(this, arguments);
    
    // Intercept the App class if it's being loaded
    if (id.includes('/dist/index') || id.includes('\\dist\\index')) {
        // Wrap the App class to add safety checks
        if (result && result.App) {
            const OriginalApp = result.App;
            
            // Create a wrapper class
            class SafeApp extends OriginalApp {
                async config(...args) {
                    try {
                        // Call parent config
                        await super.config(...args);
                        
                        // Add safety check for SSO initialization
                        if (this.app && typeof this.app.initializeSSO === 'function') {
                            await this.app.initializeSSO();
                        } else {
                            console.log('[FLOWSTACK] SSO initialization skipped - method not available');
                        }
                    } catch (error) {
                        if (error.message && error.message.includes('initializeSSO')) {
                            console.log('[FLOWSTACK] SSO initialization skipped due to error:', error.message);
                            // Continue without SSO
                        } else {
                            throw error;
                        }
                    }
                }
            }
            
            // Replace the export
            result.App = SafeApp;
        }
    }
    
    return result;
};

console.log('[FLOWSTACK] SSO initialization fix loaded');