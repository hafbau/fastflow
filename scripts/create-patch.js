#!/usr/bin/env node

/**
 * Create a patch file from modifications to core files
 * Usage: node scripts/create-patch.js <patch-name> [description]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PATCHES_DIR = path.join(__dirname, '..', 'patches');
const CORE_DIR = path.join(__dirname, '..', 'core');

class PatchCreator {
    constructor() {
        this.patchName = process.argv[2];
        this.description = process.argv.slice(3).join(' ') || 'No description provided';
    }

    async run() {
        if (!this.patchName) {
            this.showUsage();
            process.exit(1);
        }

        console.log('🔍 Creating patch from core modifications...\n');

        try {
            // Ensure patches directory exists
            if (!fs.existsSync(PATCHES_DIR)) {
                fs.mkdirSync(PATCHES_DIR, { recursive: true });
            }

            // Check for modifications in core
            const modifiedFiles = this.getModifiedCoreFiles();
            
            if (modifiedFiles.length === 0) {
                console.log('ℹ️  No modifications found in core directory');
                console.log('   Make your changes to core files first, then run this command again.');
                process.exit(0);
            }

            console.log(`📋 Found modifications in ${modifiedFiles.length} file(s):`);
            modifiedFiles.forEach(file => console.log(`   - ${file}`));
            console.log();

            // Create the patch
            const patchFileName = `${this.patchName}.patch`;
            const patchPath = path.join(PATCHES_DIR, patchFileName);

            // Generate patch
            console.log(`📝 Creating patch: ${patchFileName}`);
            execSync(`git diff core/ > ${patchPath}`, { stdio: 'inherit' });

            // Add patch metadata
            this.addPatchMetadata(patchPath);

            console.log(`\n✅ Patch created successfully: ${patchFileName}`);
            console.log('\n📌 Next steps:');
            console.log('   1. Review the patch file to ensure it contains only intended changes');
            console.log('   2. Commit the patch file to your repository');
            console.log('   3. The patch will be automatically applied on next install');
            console.log('\n⚠️  Remember: Avoid modifying core files directly in production!');

        } catch (error) {
            console.error('❌ Error creating patch:', error.message);
            process.exit(1);
        }
    }

    getModifiedCoreFiles() {
        try {
            const output = execSync('git status --porcelain core/', { encoding: 'utf8' });
            return output
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.substring(3));
        } catch {
            return [];
        }
    }

    addPatchMetadata(patchPath) {
        const metadata = [
            `# FlowStack Patch: ${this.patchName}`,
            `# Description: ${this.description}`,
            `# Created: ${new Date().toISOString()}`,
            `# Author: ${this.getGitUser()}`,
            '#',
            ''
        ].join('\n');

        const patchContent = fs.readFileSync(patchPath, 'utf8');
        fs.writeFileSync(patchPath, metadata + patchContent);
    }

    getGitUser() {
        try {
            const name = execSync('git config user.name', { encoding: 'utf8' }).trim();
            const email = execSync('git config user.email', { encoding: 'utf8' }).trim();
            return `${name} <${email}>`;
        } catch {
            return 'Unknown';
        }
    }

    showUsage() {
        console.log('Usage: node scripts/create-patch.js <patch-name> [description]');
        console.log();
        console.log('Examples:');
        console.log('  node scripts/create-patch.js fix-auth-bug "Fixed authentication issue in login flow"');
        console.log('  node scripts/create-patch.js add-custom-header "Added X-Custom-Header to all API responses"');
        console.log();
        console.log('This script creates a patch file from your modifications to the core/ directory.');
    }
}

// Run the patch creator
const creator = new PatchCreator();
creator.run(); 