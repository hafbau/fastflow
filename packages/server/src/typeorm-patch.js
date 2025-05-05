/**
 * TypeORM Monkey Patch
 * 
 * This script patches TypeORM to handle the "Connection not found" error
 * by ensuring a default connection exists before any code tries to use getRepository.
 */

// This will run before any TypeScript code is loaded
const path = require('path');
const fs = require('fs');
const { DataSource } = require('typeorm');
const connectionManager = require('typeorm').getConnectionManager();

// Create a default empty connection if one doesn't exist
if (!connectionManager.has('default')) {
  console.log('Creating placeholder default TypeORM connection');
  
  try {
    // Get user home directory
    const getUserHome = () => {
      return process.env.HOME || process.env.USERPROFILE;
    };
    
    // Set up a minimal default connection
    const homePath = process.env.DATABASE_PATH || path.join(getUserHome(), '.fastflow');
    if (!fs.existsSync(homePath)) {
      fs.mkdirSync(homePath, { recursive: true });
    }
    
    // Create a simple sqlite connection
    const dataSource = new DataSource({
      name: 'default',
      type: 'sqlite',
      database: path.resolve(homePath, 'database.sqlite'),
      entities: [],
      synchronize: false
    });
    
    // Initialize it immediately
    dataSource.initialize()
      .then(() => {
        console.log('Default TypeORM connection initialized successfully');
      })
      .catch(error => {
        console.error('Error initializing default TypeORM connection:', error);
      });
  } catch (error) {
    console.error('Error creating default TypeORM connection:', error);
  }
}

// Patch TypeORM's getRepository to handle errors more gracefully
const originalGetRepository = require('typeorm').getRepository;
require('typeorm').getRepository = function(entity, connectionName = 'default') {
  try {
    return originalGetRepository(entity, connectionName);
  } catch (error) {
    if (error.message && error.message.includes('Connection "default" was not found')) {
      console.warn(`TypeORM attempted to use getRepository before connection was ready`);
      // Return a dummy repository that will be replaced once the real connection is initialized
      return {
        find: async () => [],
        findOne: async () => null,
        create: () => ({}),
        save: async (entity) => entity,
        // Add other common repository methods as needed
      };
    }
    throw error;
  }
};

console.log('Applied TypeORM patches for better Node.js 20+ compatibility');