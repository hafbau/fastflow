/**
 * NodesPool.test.ts - Comprehensive tests for the NodesPool class
 *
 * This file tests the actual implementation of NodesPool class
 * while mocking external dependencies.
 */

// Mock external dependencies
jest.mock('../utils', () => ({
  getNodeModulesPackagePath: jest.fn().mockReturnValue('/mock/path')
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock AppConfig
jest.mock('../AppConfig', () => ({
  appConfig: {
    showCommunityNodes: true
  }
}));

// Mock the getFiles method to avoid fs dependencies
jest.mock('../NodesPool', () => {
  // Import the actual module
  const originalModule = jest.requireActual('../NodesPool');
  
  // Return a modified version that mocks getFiles
  return {
    ...originalModule,
    NodesPool: class extends originalModule.NodesPool {
      async getFiles(dir: string): Promise<string[]> {
        // Return different mock files based on the directory
        if (dir.includes('nodes')) {
          return ['/mock/path/dist/nodes/test.js'];
        } else if (dir.includes('ui')) {
          return ['/mock/path/dist/ui/test-ui.js'];
        } else if (dir.includes('credentials')) {
          return ['/mock/path/dist/credentials/test.credential.js'];
        }
        return [];
      }
    }
  };
});

// Mock require for node modules
jest.mock('/mock/path/dist/nodes/test.js', () => ({
  nodeClass: jest.fn().mockImplementation(() => ({
    name: 'TestNode',
    category: 'TestCategory',
    icon: 'test-icon.svg',
    credential: { credentialNames: ['TestCredential'] }
  }))
}), { virtual: true });

jest.mock('/mock/path/dist/ui/test-ui.js', () => ({
  uiNodeClass: jest.fn().mockImplementation(() => ({
    name: 'TestUINode',
    category: 'Form',
    type: 'input',
    icon: 'test-icon.svg'
  }))
}), { virtual: true });

jest.mock('/mock/path/dist/credentials/test.credential.js', () => ({
  credClass: jest.fn().mockImplementation(() => ({
    name: 'TestCredential'
  }))
}), { virtual: true });

// Import NodesPool after mocking dependencies
import { NodesPool, UI_CATEGORIES } from '../NodesPool';
import logger from '../utils/logger';

describe('NodesPool', () => {
  let nodesPool: NodesPool;

  beforeEach(() => {
    jest.clearAllMocks();
    nodesPool = new NodesPool();
  });

  describe('initialize', () => {
    it('should initialize nodes, UI nodes, and credentials', async () => {
      await nodesPool.initialize();
      
      // Verify nodes were registered
      expect(Object.keys(nodesPool.componentNodes).length).toBeGreaterThan(0);
      expect(Object.keys(nodesPool.componentUINodes).length).toBeGreaterThan(0);
      expect(Object.keys(nodesPool.componentCredentials).length).toBeGreaterThan(0);
    });

    it('should respect disabled nodes from environment variables', async () => {
      // Set environment variables for disabled nodes
      const originalEnv = process.env;
      process.env = { 
        ...originalEnv,
        DISABLED_NODES: 'TestNode',
        DISABLED_UI_NODES: 'TestUINode'
      };

      await nodesPool.initialize();

      // Reset environment
      process.env = originalEnv;

      // Verify disabled nodes aren't included
      expect(nodesPool.componentNodes['TestNode']).toBeUndefined();
      expect(nodesPool.componentUINodes['TestUINode']).toBeUndefined();
    });
  });

  describe('UI Node operations', () => {
    it('should register a valid UI node with all fields', () => {
      const result = nodesPool.registerUINode('CompleteUINode', {
        name: 'Complete UI Node',
        type: 'button',
        category: UI_CATEGORIES.ACTION,
        schema: '[{"name":"label","type":"string","value":"Click Me"}]',
        template: '<button>{{label}}</button>',
        description: 'A complete button component',
        icon: 'button.svg'
      });

      expect(result).toBeDefined();
      expect(nodesPool.componentUINodes['CompleteUINode']).toBeDefined();
      expect(nodesPool.componentUINodes['CompleteUINode'].label).toBe('Complete UI Node');
      expect(nodesPool.componentUINodes['CompleteUINode'].icon).toBe('button.svg');
      expect(nodesPool.componentUINodes['CompleteUINode'].description).toBe('A complete button component');
    });

    it('should reject UI nodes with invalid component data', () => {
      const result1 = nodesPool.registerUINode('', { type: 'button', category: UI_CATEGORIES.ACTION });
      const result2 = nodesPool.registerUINode('MissingType', { name: 'Missing Type', category: UI_CATEGORIES.FORM });
      const result3 = nodesPool.registerUINode('MissingCategory', { name: 'Missing Category', type: 'input' });
      
      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
      expect(result3).toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should reject UI nodes with invalid category', () => {
      const result = nodesPool.registerUINode('InvalidCategory', {
        name: 'Invalid Category Component',
        type: 'text',
        category: 'InvalidCategory'
      });
      
      expect(result).toBeUndefined();
      expect(nodesPool.componentUINodes['InvalidCategory']).toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle getProperties for nodes with schema', () => {
      const result = nodesPool.registerUINode('WithSchema', {
        name: 'Schema Node',
        type: 'text',
        category: UI_CATEGORIES.DISPLAY,
        schema: '[{"name":"text","type":"string"}]'
      });

      expect(result).toBeDefined();
      if (result) {
        const properties = result.getProperties();
        expect(properties).toHaveLength(1);
        expect(properties[0].name).toBe('text');
        expect(properties[0].type).toBe('string');
      }
    });

    it('should handle invalid schema JSON', () => {
      const result = nodesPool.registerUINode('InvalidSchema', {
        name: 'Invalid Schema Node',
        type: 'text',
        category: UI_CATEGORIES.DISPLAY,
        schema: 'invalid json'
      });

      expect(result).toBeDefined();
      if (result) {
        const properties = result.getProperties();
        expect(properties).toEqual([]);
        expect(logger.error).toHaveBeenCalled();
      }
    });
  });

  describe('UI Node Categorization', () => {
    beforeEach(() => {
      // Register test components for categorization tests
      nodesPool.registerUINode('Container1', {
        name: 'Container Component',
        type: 'container',
        category: UI_CATEGORIES.CONTAINER
      });
      
      nodesPool.registerUINode('Form1', {
        name: 'Form Component',
        type: 'input',
        category: UI_CATEGORIES.FORM
      });
      
      nodesPool.registerUINode('Form2', {
        name: 'Another Form Component',
        type: 'select',
        category: UI_CATEGORIES.FORM
      });
      
      nodesPool.registerUINode('Display1', {
        name: 'Display Component',
        type: 'text',
        category: UI_CATEGORIES.DISPLAY
      });
      
      nodesPool.registerUINode('Action1', {
        name: 'Action Component',
        type: 'button',
        category: UI_CATEGORIES.ACTION
      });
    });

    it('should get UI nodes by category', () => {
      const formComponents = nodesPool.getUINodesByCategory(UI_CATEGORIES.FORM);
      
      expect(Object.keys(formComponents).length).toBe(2);
      expect(formComponents['Form1']).toBeDefined();
      expect(formComponents['Form2']).toBeDefined();
      expect(formComponents['Container1']).toBeUndefined();
    });

    it('should group UI nodes by category', () => {
      const groupedComponents = nodesPool.getUINodesGroupedByCategory();
      
      expect(Object.keys(groupedComponents).length).toBe(4);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.FORM]).length).toBe(2);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.DISPLAY]).length).toBe(1);
      
      expect(groupedComponents[UI_CATEGORIES.FORM]['Form1']).toBeDefined();
      expect(groupedComponents[UI_CATEGORIES.FORM]['Form2']).toBeDefined();
    });

    it('should get UI nodes by type', () => {
      const inputComponents = nodesPool.getUINodesByType('input');
      
      expect(Object.keys(inputComponents).length).toBe(1);
      expect(inputComponents['Form1']).toBeDefined();
      expect(inputComponents['Form1'].type).toBe('input');
    });

    it('should create a UI node factory for a specific component type', () => {
      const buttonFactory = nodesPool.createUINodeFactory('button');
      
      const customButton = buttonFactory('CustomButton', {
        name: 'Custom Button',
        category: UI_CATEGORIES.ACTION
      });
      
      expect(customButton).toBeDefined();
      expect(nodesPool.componentUINodes['CustomButton']).toBeDefined();
      expect(nodesPool.componentUINodes['CustomButton'].type).toBe('button');
    });

    it('should successfully unregister a component', () => {
      expect(nodesPool.componentUINodes['Form1']).toBeDefined();
      
      const result = nodesPool.unregisterUINode('Form1');
      
      expect(result).toBe(true);
      expect(nodesPool.componentUINodes['Form1']).toBeUndefined();
    });
    
    it('should return false when unregistering a non-existent component', () => {
      const result = nodesPool.unregisterUINode('NonExistentComponent');
      expect(result).toBe(false);
    });
  });
}); 