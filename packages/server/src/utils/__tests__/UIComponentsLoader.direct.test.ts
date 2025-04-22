/**
 * UIComponentsLoader direct test with explicit mocking
 * This approach avoids ESM issues by manually mocking all dependencies
 */

// Mock external modules that cause ESM issues
jest.mock('@langchain/core/messages', () => ({
    BaseMessage: jest.fn(),
}));

jest.mock('langchain/memory', () => ({
    BufferMemory: jest.fn(),
    BufferWindowMemory: jest.fn(),
    ConversationSummaryMemory: jest.fn(),
    ConversationSummaryBufferMemory: jest.fn(),
}));

// Mock the Interface module
jest.mock('../../Interface', () => ({
    IUINode: {
        renderComponent: jest.fn(),
        handleEvent: jest.fn(),
        getProperties: jest.fn(),
        getCacheKey: jest.fn(),
        getQueueOptions: jest.fn()
    }
}));

// Define types for better TypeScript support
interface MockComponentData {
    name?: string;
    type?: string;
    category?: string;
    schema?: string;
    template?: string;
    description?: string;
    icon?: string;
    [key: string]: any;
}

interface MockUINode {
    name: string;
    type?: string;
    category?: string;
    schema?: string;
    template?: string;
    description?: string;
    icon?: string;
    renderComponent: () => Promise<string>;
    handleEvent: () => Record<string, any>;
    getProperties: () => any[];
    [key: string]: any;
}

// Mock the NodesPool
jest.mock('../../NodesPool', () => {
    const UI_CATEGORIES = {
        CONTAINER: 'Container',
        FORM: 'Form',
        DISPLAY: 'Display',
        ACTION: 'Action'
    };
    
    class MockNodesPool {
        componentUINodes: Record<string, MockUINode> = {};
        
        registerUINode(name: string, data: MockComponentData): MockUINode | undefined {
            if (!data.type || !data.category) {
                return undefined;
            }
            
            const node: MockUINode = {
                ...data,
                name,
                renderComponent: async () => data.template || '',
                handleEvent: () => ({}),
                getProperties: () => []
            };
            
            this.componentUINodes[name] = node;
            return node;
        }
        
        unregisterUINode(name: string): boolean {
            if (!this.componentUINodes[name]) {
                return false;
            }
            delete this.componentUINodes[name];
            return true;
        }
    }
    
    return {
        NodesPool: MockNodesPool,
        UI_CATEGORIES
    };
});

// Mock logger
jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}));

// Now import the module under test
import { UIComponentsLoader } from '../UIComponentsLoader';
import { DataSource, Repository } from 'typeorm';
import { NodesPool, UI_CATEGORIES } from '../../NodesPool';

describe('UIComponentsLoader (Direct Mocking)', () => {
    let mockDataSource: Partial<DataSource>;
    let mockRepository: Partial<Repository<any>>;
    let nodesPool: NodesPool;
    let loader: UIComponentsLoader;
    
    const mockComponents = [
        {
            id: '1',
            name: 'TestButton',
            type: 'button',
            category: UI_CATEGORIES.ACTION,
            schema: '[]',
            template: '<button>Test</button>',
            description: 'A test button',
            icon: 'icon.svg',
            createdDate: new Date(),
            updatedDate: new Date()
        },
        {
            id: '2',
            name: 'TestInput',
            type: 'input',
            category: UI_CATEGORIES.FORM,
            schema: '[{"name": "value", "type": "string"}]',
            template: '<input type="text" />',
            description: 'A test input',
            icon: 'icon.svg',
            createdDate: new Date(),
            updatedDate: new Date()
        }
    ];
    
    beforeEach(() => {
        // Mock repository methods
        mockRepository = {
            find: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.category) {
                    return mockComponents.filter(comp => comp.category === options.where.category);
                }
                return [...mockComponents];
            }),
            findOne: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.id) {
                    return mockComponents.find(comp => comp.id === options.where.id) || null;
                }
                return null;
            }),
            create: jest.fn().mockImplementation((component) => {
                return {
                    ...component,
                    id: '3', // New ID for created components
                    createdDate: new Date(),
                    updatedDate: new Date()
                };
            }),
            save: jest.fn().mockImplementation(async (component) => {
                return { ...component };
            }),
            remove: jest.fn().mockImplementation(async () => {
                return true;
            })
        };
        
        // Mock data source
        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepository)
        };
        
        // Create NodesPool instance
        nodesPool = new NodesPool();
        
        // Spy on the NodesPool methods for verification
        jest.spyOn(nodesPool, 'registerUINode');
        jest.spyOn(nodesPool, 'unregisterUINode');
        
        // Create loader instance with mocks
        loader = new UIComponentsLoader(
            mockDataSource as DataSource,
            nodesPool as any // Type assertion to satisfy TypeORM
        );
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('loadAllComponents', () => {
        it('should load all components from database', async () => {
            const result = await loader.loadAllComponents();
            
            expect(result).toBe(2); // Number of mock components
            expect(mockRepository.find).toHaveBeenCalled();
            expect(nodesPool.registerUINode).toHaveBeenCalledTimes(2);
        });
        
        it('should handle errors gracefully', async () => {
            mockRepository.find = jest.fn().mockRejectedValue(new Error('Database error'));
            
            const result = await loader.loadAllComponents();
            
            expect(result).toBe(0);
            expect(mockRepository.find).toHaveBeenCalled();
            expect(nodesPool.registerUINode).not.toHaveBeenCalled();
        });
    });
    
    describe('loadComponentsByCategory', () => {
        it('should load components by category', async () => {
            const result = await loader.loadComponentsByCategory(UI_CATEGORIES.FORM);
            
            expect(result).toBe(1); // One form component
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { category: UI_CATEGORIES.FORM }
            });
            expect(nodesPool.registerUINode).toHaveBeenCalledTimes(1);
            expect(nodesPool.registerUINode).toHaveBeenCalledWith('TestInput', expect.anything());
        });
    });
    
    describe('createComponent', () => {
        it('should create a new component and register it', async () => {
            const newComponent = {
                name: 'NewComponent',
                type: 'container',
                category: UI_CATEGORIES.CONTAINER,
                schema: '[]',
                template: '<div></div>'
            };
            
            const result = await loader.createComponent(newComponent);
            
            expect(result).toBeDefined();
            expect(mockRepository.create).toHaveBeenCalledWith(newComponent);
            expect(mockRepository.save).toHaveBeenCalled();
            expect(nodesPool.registerUINode).toHaveBeenCalledWith('NewComponent', expect.anything());
        });
    });
    
    describe('updateComponent', () => {
        it('should update an existing component and re-register it', async () => {
            const updates = {
                name: 'UpdatedButton',
                description: 'An updated button'
            };
            
            const result = await loader.updateComponent('1', updates);
            
            expect(result).toBeDefined();
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton');
            expect(nodesPool.registerUINode).toHaveBeenCalledWith('UpdatedButton', expect.anything());
        });
    });
    
    describe('deleteComponent', () => {
        it('should delete a component and unregister it', async () => {
            const result = await loader.deleteComponent('1');
            
            expect(result).toBe(true);
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockRepository.remove).toHaveBeenCalled();
            expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton');
        });
    });
}); 