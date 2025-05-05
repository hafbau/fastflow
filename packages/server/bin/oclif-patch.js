/**
 * Monkey patch for @oclif/core to handle property access errors in Node.js 20+
 *
 * This is a lightweight patch that only handles process.emitWarning.
 * The main issue with Plugin.addErrorScope is fixed via patch-package.
 */

// Only apply the patch if we're using Node.js 20 or later
const nodeVersion = process.version.slice(1).split('.')[0];
if (parseInt(nodeVersion, 10) >= 20) {
  try {
    // Store the original emitWarning function
    const originalEmitWarning = process.emitWarning;
    
    // Override the process.emitWarning function to handle errors with read-only properties
    process.emitWarning = function(warning, options) {
      // If it's an Error object, ensure we don't have problems with read-only properties
      if (warning instanceof Error) {
        try {
          // Call the original function with extracted properties to avoid read-only property issues
          return originalEmitWarning(warning.message || '', {
            type: warning.name || 'Warning',
            code: warning.code,
            detail: warning.detail,
          });
        } catch (error) {
          console.error('Error in emitWarning patch:', error);
        }
      }
      
      // Call the original function for non-Error warnings or if our patch failed
      return originalEmitWarning(warning, options);
    };
    
    console.log('Applied process.emitWarning patch for Node.js 20+ compatibility');
  } catch (error) {
    console.error('Failed to apply process.emitWarning patch:', error);
  }
} 