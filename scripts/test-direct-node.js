#!/usr/bin/env node

console.log('[DIRECT-NODE-TEST] Starting direct Node.js test at', new Date());
console.log('[DIRECT-NODE-TEST] Node version:', process.version);
console.log('[DIRECT-NODE-TEST] Current directory:', process.cwd());
console.log('[DIRECT-NODE-TEST] Script arguments:', process.argv);

// Log environment
console.log('[DIRECT-NODE-TEST] Environment variables:');
Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('FLOWISE') || k.includes('PORT')).forEach(k => {
    console.log(`[DIRECT-NODE-TEST] ${k}=${process.env[k]}`);
});

// Change to core directory
process.chdir('/usr/src/core');
console.log('[DIRECT-NODE-TEST] Changed to directory:', process.cwd());

// Try to require @oclif/core
try {
    console.log('[DIRECT-NODE-TEST] Loading @oclif/core...');
    const oclif = require('@oclif/core');
    console.log('[DIRECT-NODE-TEST] @oclif/core loaded successfully');
    
    // Try to run oclif
    console.log('[DIRECT-NODE-TEST] Running oclif.run()...');
    oclif.run()
        .then(() => {
            console.log('[DIRECT-NODE-TEST] oclif.run() completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('[DIRECT-NODE-TEST] oclif.run() failed:', error);
            console.error('[DIRECT-NODE-TEST] Error stack:', error.stack);
            console.error('[DIRECT-NODE-TEST] Error details:', JSON.stringify(error, null, 2));
            process.exit(1);
        });
} catch (error) {
    console.error('[DIRECT-NODE-TEST] Failed to load @oclif/core:', error);
    console.error('[DIRECT-NODE-TEST] Error stack:', error.stack);
    
    // Try to check if the module exists
    try {
        const path = require('path');
        const fs = require('fs');
        const modulePath = path.join(process.cwd(), 'node_modules', '@oclif', 'core');
        console.log('[DIRECT-NODE-TEST] Checking if @oclif/core exists at:', modulePath);
        console.log('[DIRECT-NODE-TEST] Exists:', fs.existsSync(modulePath));
        
        if (fs.existsSync(modulePath)) {
            const packageJsonPath = path.join(modulePath, 'package.json');
            if (fs.existsSync(packageJsonPath)) {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                console.log('[DIRECT-NODE-TEST] @oclif/core version:', packageJson.version);
            }
        }
        
        // List node_modules
        console.log('[DIRECT-NODE-TEST] Contents of node_modules:');
        const nodeModules = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(nodeModules)) {
            const dirs = fs.readdirSync(nodeModules).slice(0, 10);
            console.log('[DIRECT-NODE-TEST] First 10 modules:', dirs);
        } else {
            console.log('[DIRECT-NODE-TEST] node_modules does not exist!');
        }
    } catch (e) {
        console.error('[DIRECT-NODE-TEST] Error checking modules:', e);
    }
    
    process.exit(1);
}

// Keep the process alive for a moment to ensure logs are captured
setTimeout(() => {
    console.log('[DIRECT-NODE-TEST] Test timeout reached');
    process.exit(1);
}, 30000);