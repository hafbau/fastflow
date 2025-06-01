#!/usr/bin/env node

/**
 * Apply patches to core files
 * This script runs after npm install to apply any necessary patches
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PATCHES_DIR = path.join(__dirname, '..', 'patches');
const APPLIED_PATCHES_FILE = path.join(PATCHES_DIR, '.applied-patches.json');

class PatchApplier {
    constructor() {
        this.appliedPatches = this.loadAppliedPatches();
    }

    loadAppliedPatches() {
        try {
            if (fs.existsSync(APPLIED_PATCHES_FILE)) {
                return JSON.parse(fs.readFileSync(APPLIED_PATCHES_FILE, 'utf8'));
            }
        } catch (error) {
            console.warn('⚠️  Could not load applied patches record:', error.message);
        }
        return {};
    }

    saveAppliedPatches() {
        try {
            fs.writeFileSync(APPLIED_PATCHES_FILE, JSON.stringify(this.appliedPatches, null, 2));
        } catch (error) {
            console.error('❌ Could not save applied patches record:', error.message);
        }
    }

    async run() {
        console.log('🔧 Checking for patches to apply...\n');

        try {
            // Create patches directory if it doesn't exist
            if (!fs.existsSync(PATCHES_DIR)) {
                fs.mkdirSync(PATCHES_DIR, { recursive: true });
                console.log('📁 Created patches directory\n');
                return;
            }

            // Find all patch files
            const patchFiles = fs.readdirSync(PATCHES_DIR)
                .filter(file => file.endsWith('.patch'))
                .sort(); // Apply in alphabetical order

            if (patchFiles.length === 0) {
                console.log('✅ No patches to apply\n');
                return;
            }

            console.log(`📋 Found ${patchFiles.length} patch file(s)\n`);

            // Apply each patch
            for (const patchFile of patchFiles) {
                await this.applyPatch(patchFile);
            }

            this.saveAppliedPatches();
            console.log('\n✨ All patches processed successfully!');

        } catch (error) {
            console.error('❌ Error applying patches:', error.message);
            process.exit(1);
        }
    }

    async applyPatch(patchFile) {
        const patchPath = path.join(PATCHES_DIR, patchFile);
        const patchHash = this.getFileHash(patchPath);

        // Check if patch was already applied
        if (this.appliedPatches[patchFile] === patchHash) {
            console.log(`⏭️  Skipping ${patchFile} (already applied)`);
            return;
        }

        console.log(`🔧 Applying ${patchFile}...`);

        try {
            // Try to apply the patch
            execSync(`git apply --check ${patchPath}`, { stdio: 'pipe' });
            execSync(`git apply ${patchPath}`, { stdio: 'inherit' });
            
            // Record successful application
            this.appliedPatches[patchFile] = patchHash;
            console.log(`✅ Successfully applied ${patchFile}`);

        } catch (error) {
            // Check if patch is already applied
            try {
                execSync(`git apply --reverse --check ${patchPath}`, { stdio: 'pipe' });
                console.log(`⚠️  ${patchFile} appears to be already applied`);
                this.appliedPatches[patchFile] = patchHash;
            } catch {
                console.error(`❌ Failed to apply ${patchFile}`);
                console.error('   Error:', error.message);
                console.log('   You may need to apply this patch manually or update it.');
            }
        }
    }

    getFileHash(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content).digest('hex');
    }
}

// Run the patch applier
const applier = new PatchApplier();
applier.run(); 