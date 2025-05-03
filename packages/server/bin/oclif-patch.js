/**
 * Monkey patch for @oclif/core to handle property access errors
 * 
 * This patches the process.emitWarning function to handle errors with read-only properties
 * which happens in Node.js 20+ when oclif tries to set the error name property
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
          // Create a safe error object with writable properties
          const safeWarning = {
            message: warning.message || '',
            name: warning.name || 'Error',
            stack: warning.stack || '',
          };
          
          // Copy any additional properties
          for (const prop in warning) {
            if (!['message', 'name', 'stack'].includes(prop) && typeof warning[prop] !== 'function') {
              try {
                safeWarning[prop] = warning[prop];
              } catch (e) {
                // Ignore if we can't copy a property
              }
            }
          }
          
          // Call the original function with our safe warning object
          return originalEmitWarning(safeWarning.message, {
            type: safeWarning.name,
            code: warning.code,
            detail: warning.detail,
          });
        } catch (error) {
          // If something goes wrong with our approach, fall back to original behavior
          console.error('Error in emitWarning patch:', error);
        }
      }
      
      // Call the original function for non-Error warnings or if our patch failed
      return originalEmitWarning(warning, options);
    };
    
    console.log('Applied process.emitWarning patch for Node.js compatibility');
  } catch (error) {
    console.error('Failed to apply process.emitWarning patch:', error);
  }
} 