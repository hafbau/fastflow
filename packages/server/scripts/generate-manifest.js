#!/usr/bin/env node

// Simple script to generate an oclif.manifest.json file without triggering the name property error
const fs = require('fs');
const path = require('path');

// Read package.json to get version and command info
const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = require(pkgPath);

// Get the command files from the dist/commands directory
const commandsDir = path.join(__dirname, '..', 'dist', 'commands');
const commandFiles = fs.readdirSync(commandsDir)
  .filter(file => file.endsWith('.js') && !file.startsWith('base.'));

// Create a minimal manifest
const manifest = {
  version: pkg.version,
  commands: {}
};

// Add each command to the manifest
commandFiles.forEach(file => {
  const commandName = path.basename(file, '.js');
  
  // Skip base.js and d.ts files
  if (commandName === 'base') return;
  
  // Create a minimal entry for each command
  manifest.commands[commandName] = {
    id: commandName,
    description: `${commandName} command`,
    pluginName: pkg.name,
    pluginAlias: pkg.name,
    pluginType: 'core',
    hidden: false,
    aliases: [],
    flags: {},
    args: []
  };
});

// Write the manifest file
const manifestPath = path.join(__dirname, '..', 'oclif.manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Generated oclif.manifest.json with ${Object.keys(manifest.commands).length} commands`);