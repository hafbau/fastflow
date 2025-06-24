#!/usr/bin/env node

// Minimal test to debug oclif loading issues
console.log('[OCLIF-TEST] Starting minimal oclif test');

process.on('uncaughtException', (err) => {
    console.error('[OCLIF-TEST] Uncaught Exception:', err);
    console.error('[OCLIF-TEST] Stack:', err.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('[OCLIF-TEST] Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Test 1: Can we load core modules?
try {
    const fs = require('fs');
    const path = require('path');
    console.log('[OCLIF-TEST] Core modules loaded successfully');
} catch (e) {
    console.error('[OCLIF-TEST] Failed to load core modules:', e);
    process.exit(1);
}

// Test 2: Check current directory
console.log('[OCLIF-TEST] Current directory:', process.cwd());
console.log('[OCLIF-TEST] Script location:', __filename);

// Test 3: Try to find oclif
const modulePaths = [
    '/usr/src/core/node_modules/@oclif/core',
    './node_modules/@oclif/core',
    '../node_modules/@oclif/core',
    '../../node_modules/@oclif/core'
];

let oclifFound = false;
for (const modulePath of modulePaths) {
    try {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.resolve(modulePath);
        if (fs.existsSync(fullPath)) {
            console.log('[OCLIF-TEST] Found @oclif/core at:', fullPath);
            oclifFound = true;
            
            // Try to read package.json
            const pkgPath = path.join(fullPath, 'package.json');
            if (fs.existsSync(pkgPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                console.log('[OCLIF-TEST] @oclif/core version:', pkg.version);
            }
        }
    } catch (e) {
        // Ignore errors for non-existent paths
    }
}

if (!oclifFound) {
    console.error('[OCLIF-TEST] @oclif/core not found in any expected location!');
}

// Test 4: Try to require oclif
try {
    console.log('[OCLIF-TEST] Attempting to require @oclif/core...');
    const oclif = require('@oclif/core');
    console.log('[OCLIF-TEST] Successfully loaded @oclif/core');
    console.log('[OCLIF-TEST] oclif.run is a:', typeof oclif.run);
    
    // Test 5: Try to run oclif with minimal config
    console.log('[OCLIF-TEST] Attempting to run oclif...');
    
    // Set process.argv to simulate 'start' command
    process.argv = [process.argv[0], process.argv[1], 'start'];
    
    oclif.run()
        .then(() => {
            console.log('[OCLIF-TEST] oclif.run() completed successfully');
        })
        .catch((error) => {
            console.error('[OCLIF-TEST] oclif.run() failed:', error.message);
            console.error('[OCLIF-TEST] Error type:', error.constructor.name);
            console.error('[OCLIF-TEST] Error code:', error.code);
            console.error('[OCLIF-TEST] Stack:', error.stack);
            
            // Try to get more details
            if (error.oclif) {
                console.error('[OCLIF-TEST] Oclif error details:', JSON.stringify(error.oclif, null, 2));
            }
            
            process.exit(1);
        });
} catch (error) {
    console.error('[OCLIF-TEST] Failed to load @oclif/core:', error.message);
    console.error('[OCLIF-TEST] Error type:', error.constructor.name);
    console.error('[OCLIF-TEST] Stack:', error.stack);
    
    // Check NODE_PATH
    console.error('[OCLIF-TEST] NODE_PATH:', process.env.NODE_PATH);
    console.error('[OCLIF-TEST] require.resolve.paths("@oclif/core"):', require.resolve.paths('@oclif/core'));
    
    process.exit(1);
}