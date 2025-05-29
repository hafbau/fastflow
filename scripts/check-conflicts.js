#!/usr/bin/env node

/**
 * Check for potential conflicts between @core updates and @flowstack customizations
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Configuration
const config = {
  corePath: '@core',
  platformPath: 'packages/@flowstack',
  // Add patterns for files/components you're overriding
  overridePatterns: [
    'components/**/*.{ts,tsx,js,jsx}',
    'config/**/*.{ts,js,json}',
    'styles/**/*.{css,scss,less}',
    'hooks/**/*.{ts,js}',
    'utils/**/*.{ts,js}'
  ],
  // Files that should trigger warnings if changed
  criticalFiles: [
    'package.json',
    'tsconfig.json',
    'webpack.config.js',
    'vite.config.js',
    '.babelrc',
    'api/**/*'
  ]
};

class ConflictChecker {
  constructor() {
    this.conflicts = [];
    this.warnings = [];
    this.overrideMap = new Map();
  }

  async run() {
    console.log('🔍 Checking for potential conflicts...\n');

    try {
      // Build override map
      await this.buildOverrideMap();
      
      // Check for conflicts
      await this.checkForConflicts();
      
      // Check critical files
      await this.checkCriticalFiles();
      
      // Report results
      this.reportResults();
      
      // Exit with error if conflicts found
      if (this.conflicts.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error during conflict check:', error);
      process.exit(1);
    }
  }

  async buildOverrideMap() {
    // Find all override files in platform packages
    const overrideFiles = await glob(`${config.platformPath}/overrides/**/*`, {
      nodir: true
    });

    for (const file of overrideFiles) {
      const relativePath = path.relative(`${config.platformPath}/overrides`, file);
      this.overrideMap.set(relativePath, file);
    }

    console.log(`📦 Found ${this.overrideMap.size} override files\n`);
  }

  async checkForConflicts() {
    // Get recently changed files in @core (would need git integration)
    // For now, we'll check all matching patterns
    
    for (const pattern of config.overridePatterns) {
      const coreFiles = await glob(`${config.corePath}/${pattern}`, {
        nodir: true
      });

      for (const coreFile of coreFiles) {
        const relativePath = path.relative(config.corePath, coreFile);
        
        // Check if we have an override for this file
        if (this.overrideMap.has(relativePath)) {
          const overrideFile = this.overrideMap.get(relativePath);
          
          // Check if core file was recently modified (simplified check)
          const coreStats = fs.statSync(coreFile);
          const overrideStats = fs.statSync(overrideFile);
          
          if (coreStats.mtime > overrideStats.mtime) {
            this.conflicts.push({
              coreFile,
              overrideFile,
              message: 'Core file was modified after override was created'
            });
          }
        }
      }
    }
  }

  async checkCriticalFiles() {
    for (const pattern of config.criticalFiles) {
      const files = await glob(`${config.corePath}/${pattern}`, {
        nodir: true
      });

      for (const file of files) {
        // In a real implementation, check if file was modified in the last sync
        // For now, just add as warning
        const relativePath = path.relative(config.corePath, file);
        
        if (await this.wasRecentlyModified(file)) {
          this.warnings.push({
            file,
            message: `Critical file modified: ${relativePath}`
          });
        }
      }
    }
  }

  async wasRecentlyModified(file) {
    // This is a simplified check - in production, you'd check against git history
    try {
      const stats = fs.statSync(file);
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return stats.mtime > hourAgo;
    } catch {
      return false;
    }
  }

  reportResults() {
    if (this.conflicts.length === 0 && this.warnings.length === 0) {
      console.log('✅ No conflicts detected!\n');
      return;
    }

    if (this.conflicts.length > 0) {
      console.log(`❌ Found ${this.conflicts.length} potential conflicts:\n`);
      
      this.conflicts.forEach((conflict, index) => {
        console.log(`${index + 1}. ${conflict.message}`);
        console.log(`   Core file: ${conflict.coreFile}`);
        console.log(`   Override:  ${conflict.overrideFile}\n`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`⚠️  Found ${this.warnings.length} warnings:\n`);
      
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        console.log(`   File: ${warning.file}\n`);
      });
    }

    console.log('📝 Recommendations:');
    console.log('   1. Review the conflicting files manually');
    console.log('   2. Update your overrides if core changes are beneficial');
    console.log('   3. Test thoroughly after resolving conflicts');
    console.log('   4. Document any intentional divergences\n');
  }
}

// Run the checker
const checker = new ConflictChecker();
checker.run(); 