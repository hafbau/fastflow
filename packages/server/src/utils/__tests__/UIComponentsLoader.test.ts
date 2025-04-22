/**
 * UIComponentsLoader.test.ts - Tests for the UIComponentsLoader class
 * 
 * This file tests the actual implementation of UIComponentsLoader while mocking
 * external dependencies like the database, NodesPool, and loggers.
 */

// Mock dependencies first
jest.mock('../logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Mock a repository for TypeORM
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn()
};

// Mock TypeORM with decorators
jest.mock('typeorm', () => {
  return {
    DataSource: jest.fn().mockImplementation(() => ({
      getRepository: jest.fn().mockReturnValue(mockRepository)
    })),
    Entity: jest.fn(),
    Column: jest.fn(),
    CreateDateColumn: jest.fn(),
    UpdateDateColumn: jest.fn(),
    PrimaryGeneratedColumn: jest.fn(),
  };
});

// Mock NodesPool with basic functionality needed for tests
jest.mock('../../NodesPool', () => {
  const UI_CATEGORIES = {
    ACTION: 'action',
    FORM: 'form',
    DISPLAY: 'display',
    CONTAINER: 'container'
  };
  
  return {
    NodesPool: jest.fn().mockImplementation(() => ({
      componentUINodes: {},
      registerUINode: jest.fn((name, data) => {
        if (!data.type || !data.category) {
          return undefined;
        }
        const validCategories = Object.values(UI_CATEGORIES);
        if (!validCategories.includes(data.category)) {
          return undefined;
        }
        return { name, type: data.type, category: data.category };
      }),
      unregisterUINode: jest.fn((name) => true)
    })),
    UI_CATEGORIES,
    UICategory: UI_CATEGORIES
  };
});

// Import UIComponentsLoader and dependencies after mocks
import { DataSource } from 'typeorm';
import { UIComponentsLoader } from '../UIComponentsLoader';
import { NodesPool, UI_CATEGORIES } from '../../NodesPool';
import logger from '../logger';

// Test component data
const mockComponents = [
  {
    id: '1',
    name: 'TestButton',
    type: 'button',
    category: UI_CATEGORIES.ACTION,
    description: 'A test button',
    schema: '[{"name":"text","type":"string"}]',
    template: '<button>Test</button>',
    createdDate: new Date(),
    updatedDate: new Date()
  },
  {
    id: '2',
    name: 'TestInput',
    type: 'input',
    category: UI_CATEGORIES.FORM,
    description: 'A test input',
    schema: '[{"name":"value","type":"string"}]',
    template: '<input type="text" />',
    createdDate: new Date(),
    updatedDate: new Date()
  }
];

describe('UIComponentsLoader', () => {
  let uiComponentsLoader: UIComponentsLoader;
  let dataSource: DataSource;
  let nodesPool: NodesPool;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock behaviors
    mockRepository.find.mockResolvedValue(mockComponents);
    mockRepository.findOne.mockImplementation(({ where }) => {
      const component = mockComponents.find(c => c.id === where.id);
      return Promise.resolve(component ? { ...component } : undefined);
    });
    mockRepository.create.mockImplementation(component => component);
    mockRepository.save.mockImplementation(component => Promise.resolve({
      ...component,
      id: component.id || '3',
      createdDate: new Date(),
      updatedDate: new Date()
    }));
    mockRepository.remove.mockImplementation(component => Promise.resolve(component));
    
    // Initialize required objects
    dataSource = new DataSource({ type: 'sqlite', database: ':memory:' });
    nodesPool = new NodesPool();
    
    // Create instance of class under test
    uiComponentsLoader = new UIComponentsLoader(dataSource, nodesPool);
  });
  
  describe('loadAllComponents', () => {
    it('should load all components from the database', async () => {
      const result = await uiComponentsLoader.loadAllComponents();
      
      expect(result).toBe(2);
      expect(mockRepository.find).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Loaded 2 UI components'));
      expect(nodesPool.registerUINode).toHaveBeenCalledTimes(2);
    });
    
    it('should handle database errors gracefully', async () => {
      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await uiComponentsLoader.loadAllComponents();
      
      expect(result).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error loading UI components'),
        expect.any(Error)
      );
    });
  });
  
  describe('loadComponentsByCategory', () => {
    it('should load components of a specific category', async () => {
      mockRepository.find.mockImplementationOnce(({ where }) => {
        return Promise.resolve(
          mockComponents.filter(c => c.category === where.category)
        );
      });
      
      const result = await uiComponentsLoader.loadComponentsByCategory(UI_CATEGORIES.FORM);
      
      expect(result).toBe(1);
      expect(mockRepository.find).toHaveBeenCalledWith({ where: { category: UI_CATEGORIES.FORM } });
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Loaded 1 UI components of category'));
      expect(nodesPool.registerUINode).toHaveBeenCalledTimes(1);
    });
    
    it('should handle database errors when loading by category', async () => {
      mockRepository.find.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await uiComponentsLoader.loadComponentsByCategory(UI_CATEGORIES.ACTION);
      
      expect(result).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error loading UI components of category'),
        expect.any(Error)
      );
    });
  });
  
  describe('createComponent', () => {
    it('should create a valid component', async () => {
      const newComponent = {
        name: 'NewComponent',
        type: 'dropdown',
        category: UI_CATEGORIES.FORM,
        description: 'A new dropdown component',
        schema: '[{"name":"options","type":"array"}]',
        template: '<select></select>'
      };
      
      const result = await uiComponentsLoader.createComponent(newComponent);
      
      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalledWith(newComponent);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Created and registered UI component'));
      expect(nodesPool.registerUINode).toHaveBeenCalledWith(newComponent.name, expect.anything());
    });
    
    it('should reject components with missing required fields', async () => {
      const invalidComponent = {
        name: 'MissingFields',
        // Missing type and category
        description: 'Invalid component'
      };
      
      const result = await uiComponentsLoader.createComponent(invalidComponent);
      
      expect(result).toBeUndefined();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Missing required fields'));
    });
    
    it('should reject components with invalid category', async () => {
      const invalidComponent = {
        name: 'InvalidCategory',
        type: 'button',
        category: 'invalid-category',
        description: 'Component with invalid category'
      };
      
      const result = await uiComponentsLoader.createComponent(invalidComponent);
      
      expect(result).toBeUndefined();
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid category'));
    });
  });
  
  describe('updateComponent', () => {
    it('should update an existing component', async () => {
      const updates = {
        description: 'Updated description',
        template: '<button class="primary">Updated</button>'
      };
      
      const result = await uiComponentsLoader.updateComponent('1', updates);
      
      expect(result).toBeDefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Updated and re-registered UI component'));
    });
    
    it('should handle component name changes', async () => {
      const updates = {
        name: 'RenamedButton'
      };
      
      const result = await uiComponentsLoader.updateComponent('1', updates);
      
      expect(result).toBeDefined();
      expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton');
      expect(nodesPool.registerUINode).toHaveBeenCalledWith('RenamedButton', expect.anything());
    });
    
    it('should handle non-existent component IDs', async () => {
      mockRepository.findOne.mockResolvedValueOnce(undefined);
      
      const result = await uiComponentsLoader.updateComponent('999', { description: 'Updated' });
      
      expect(result).toBeUndefined();
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
  
  describe('deleteComponent', () => {
    it('should delete an existing component', async () => {
      const result = await uiComponentsLoader.deleteComponent('1');
      
      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(mockRepository.remove).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Deleted UI component'));
      expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton');
    });
    
    it('should handle non-existent component IDs', async () => {
      mockRepository.findOne.mockResolvedValueOnce(undefined);
      
      const result = await uiComponentsLoader.deleteComponent('999');
      
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
    
    it('should handle unregistering components not in NodesPool', async () => {
      (nodesPool.unregisterUINode as jest.Mock).mockReturnValueOnce(false);
      
      const result = await uiComponentsLoader.deleteComponent('1');
      
      expect(result).toBe(true);
      expect(logger.warn).toHaveBeenCalledWith(expect.stringContaining('not found in NodesPool'));
      expect(mockRepository.remove).toHaveBeenCalled();
    });
  });
}); 