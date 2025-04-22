/**
 * UINodesCategories.test.ts - Tests for the NodesPool class UI categories functionality
 *
 * This file tests the actual implementation of NodesPool's UI category methods
 * while mocking external dependencies.
 */

// Mock external dependencies that NodesPool relies on
jest.mock('../utils', () => ({
  getNodeModulesPackagePath: jest.fn().mockReturnValue('/mock/path')
}));

jest.mock('fs', () => ({
  promises: {
    readdir: jest.fn().mockResolvedValue([])
  },
  Dirent: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn()
}));

jest.mock('../AppConfig', () => ({
  appConfig: {
    showCommunityNodes: true
  }
}));

// Define types to help with TypeScript
interface ComponentData {
  name: string;
  type?: string;
  category?: string;
  schema?: string;
  template?: string;
  description?: string;
  icon?: string;
  [key: string]: any;
}

// Import the actual NodesPool implementation
import { NodesPool, UI_CATEGORIES } from '../NodesPool';
import logger from '../utils/logger';

describe('NodesPool UI Categories', () => {
  let nodesPool: NodesPool;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a new instance of the actual NodesPool class
    nodesPool = new NodesPool();
    
    // Register test components directly using the actual implementation
    nodesPool.registerUINode('Container1', {
      name: 'Container Component',
      type: 'container',
      category: UI_CATEGORIES.CONTAINER,
      schema: '[]',
      template: '<div></div>'
    });
    
    nodesPool.registerUINode('Form1', {
      name: 'Form Component',
      type: 'input',
      category: UI_CATEGORIES.FORM,
      schema: '[{"name": "value", "type": "string"}]',
      template: '<input type="text" />'
    });
    
    nodesPool.registerUINode('Form2', {
      name: 'Another Form Component',
      type: 'select',
      category: UI_CATEGORIES.FORM,
      schema: '[{"name": "options", "type": "array"}]',
      template: '<select></select>'
    });
    
    nodesPool.registerUINode('Display1', {
      name: 'Display Component',
      type: 'text',
      category: UI_CATEGORIES.DISPLAY,
      schema: '[]',
      template: '<span></span>'
    });
    
    nodesPool.registerUINode('Action1', {
      name: 'Action Component',
      type: 'button',
      category: UI_CATEGORIES.ACTION,
      schema: '[]',
      template: '<button></button>'
    });
  });

  describe('UI Component Categorization', () => {
    it('should get UI nodes by category', () => {
      const formComponents = nodesPool.getUINodesByCategory(UI_CATEGORIES.FORM);
      
      expect(Object.keys(formComponents).length).toBe(2);
      expect(formComponents['Form1']).toBeDefined();
      expect(formComponents['Form2']).toBeDefined();
      expect(formComponents['Container1']).toBeUndefined();
      
      const containerComponents = nodesPool.getUINodesByCategory(UI_CATEGORIES.CONTAINER);
      expect(Object.keys(containerComponents).length).toBe(1);
      expect(containerComponents['Container1']).toBeDefined();
    });

    it('should group UI nodes by category', () => {
      const groupedComponents = nodesPool.getUINodesGroupedByCategory();
      
      expect(Object.keys(groupedComponents).length).toBe(4);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.CONTAINER]).length).toBe(1);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.FORM]).length).toBe(2);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.DISPLAY]).length).toBe(1);
      expect(Object.keys(groupedComponents[UI_CATEGORIES.ACTION]).length).toBe(1);
      
      expect(groupedComponents[UI_CATEGORIES.FORM]['Form1']).toBeDefined();
      expect(groupedComponents[UI_CATEGORIES.FORM]['Form2']).toBeDefined();
    });

    it('should get UI nodes by type', () => {
      const inputComponents = nodesPool.getUINodesByType('input');
      
      expect(Object.keys(inputComponents).length).toBe(1);
      expect(inputComponents['Form1']).toBeDefined();
      expect(inputComponents['Form1'].type).toBe('input');
      
      const buttonComponents = nodesPool.getUINodesByType('button');
      expect(Object.keys(buttonComponents).length).toBe(1);
      expect(buttonComponents['Action1']).toBeDefined();
    });

    it('should create a UI node factory for a specific component type', () => {
      const buttonFactory = nodesPool.createUINodeFactory('button');
      
      const customButton = buttonFactory('CustomButton', {
        name: 'Custom Button',
        category: UI_CATEGORIES.ACTION,
        schema: '[{"name": "label", "type": "string", "value": "Click me"}]',
        template: '<button>{{label}}</button>'
      });
      
      expect(customButton).toBeDefined();
      if (customButton) {
        expect(customButton.type).toBe('button');
        expect(customButton.category).toBe(UI_CATEGORIES.ACTION);
      }
      expect(nodesPool.componentUINodes['CustomButton']).toBeDefined();
      
      // The factory should enforce the type
      const components = nodesPool.getUINodesByType('button');
      expect(Object.keys(components).length).toBe(2); // Action1 and CustomButton
      expect(components['CustomButton']).toBeDefined();
    });

    it('should reject components with invalid categories', () => {
      const result = nodesPool.registerUINode('InvalidCategory', {
        name: 'Invalid Category Component',
        type: 'text',
        category: 'InvalidCategory', // Not a valid UI_CATEGORY
        schema: '[]',
        template: '<div></div>'
      });
      
      expect(result).toBeUndefined();
      expect(nodesPool.componentUINodes['InvalidCategory']).toBeUndefined();
      expect(logger.error).toHaveBeenCalled();
      
      // Get the actual call arguments to verify message content rather than exact formatting
      const errorCalls = (logger.error as jest.Mock).mock.calls;
      expect(errorCalls.length).toBeGreaterThan(0);
      
      // Check that the message contains the key information
      const errorMessage = errorCalls[0][0]; // First argument of the first call
      expect(errorMessage).toContain('Invalid category');
      expect(errorMessage).toContain('InvalidCategory');
    });
    
    it('should reject components with missing required fields', () => {
      const resultNoType = nodesPool.registerUINode('MissingType', {
        name: 'Missing Type Component',
        // Missing type
        category: UI_CATEGORIES.DISPLAY,
        schema: '[]',
        template: '<div></div>'
      });
      
      expect(resultNoType).toBeUndefined();
      expect(nodesPool.componentUINodes['MissingType']).toBeUndefined();
      
      const resultNoCategory = nodesPool.registerUINode('MissingCategory', {
        name: 'Missing Category Component',
        type: 'text',
        // Missing category
        schema: '[]',
        template: '<div></div>'
      });
      
      expect(resultNoCategory).toBeUndefined();
      expect(nodesPool.componentUINodes['MissingCategory']).toBeUndefined();
    });
    
    it('should handle invalid schema JSON', () => {
      const component = nodesPool.registerUINode('InvalidSchema', {
        name: 'Invalid Schema Component',
        type: 'text',
        category: UI_CATEGORIES.DISPLAY,
        schema: 'This is not valid JSON',
        template: '<div></div>'
      });
      
      expect(component).toBeDefined();
      if (component) {
        const properties = component.getProperties();
        expect(properties).toEqual([]);
        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('Error parsing schema for UI node InvalidSchema'),
          expect.anything()
        );
      }
    });
    
    it('should successfully unregister a component', () => {
      expect(nodesPool.componentUINodes['Form1']).toBeDefined();
      
      const result = nodesPool.unregisterUINode('Form1');
      
      expect(result).toBe(true);
      expect(nodesPool.componentUINodes['Form1']).toBeUndefined();
      
      // After unregistering, the node should not be included in category-based queries
      const formComponents = nodesPool.getUINodesByCategory(UI_CATEGORIES.FORM);
      expect(Object.keys(formComponents).length).toBe(1);
      expect(formComponents['Form1']).toBeUndefined();
      expect(formComponents['Form2']).toBeDefined();
    });
    
    it('should return false when unregistering a non-existent component', () => {
      const result = nodesPool.unregisterUINode('NonExistentComponent');
      expect(result).toBe(false);
    });
  });
}); 