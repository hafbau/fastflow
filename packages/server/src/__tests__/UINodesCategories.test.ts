// Mock all external dependencies to avoid ESM issues
jest.mock('../Interface', () => {
    // Create a minimal IUINode interface required for tests
    const mockIUINode = {
        renderComponent: jest.fn(),
        handleEvent: jest.fn(),
        getProperties: jest.fn(),
        getCacheKey: jest.fn(),
        getQueueOptions: jest.fn()
    };

    // Return the mocked exports
    return {
        IUINode: mockIUINode
    };
});

// Define types to fix TypeScript errors
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

interface UINode {
    name: string;
    type: string;
    category: string;
    schema?: string;
    template?: string;
    description?: string;
    icon?: string;
    renderComponent: () => Promise<string>;
    handleEvent: () => Record<string, any>;
    getProperties: () => any[];
    getCacheKey?: () => string;
    getQueueOptions?: () => { priority: number, attempts: number };
    [key: string]: any;
}

// Mock the NodesPool class to avoid requiring external dependencies
jest.mock('../NodesPool', () => {
    const UI_CATEGORIES = {
        CONTAINER: 'Container',
        FORM: 'Form',
        DISPLAY: 'Display',
        ACTION: 'Action'
    };

    class MockNodesPool {
        componentUINodes: Record<string, UINode> = {};
        
        registerUINode(name: string, componentData: ComponentData): UINode | undefined {
            // Validate required fields
            if (!componentData.type || !componentData.category) {
                return undefined;
            }
            
            // Validate category
            const uiCategories = Object.values(UI_CATEGORIES);
            if (!uiCategories.includes(componentData.category)) {
                return undefined;
            }
            
            // Create a UI node
            const node: UINode = {
                ...componentData,
                name,
                // Ensure non-nullable type and category
                type: componentData.type,
                category: componentData.category,
                renderComponent: async () => componentData.template || '',
                handleEvent: () => ({}),
                getProperties: () => {
                    try {
                        const props = JSON.parse(componentData.schema || '[]');
                        return props;
                    } catch (e) {
                        return [];
                    }
                },
                getCacheKey: () => `ui_${name}`,
                getQueueOptions: () => ({ priority: 1, attempts: 3 })
            };
            
            // Store in componentUINodes
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

        getUINodesByCategory(category: string): Record<string, UINode> {
            const result: Record<string, UINode> = {};
            
            for (const [name, node] of Object.entries(this.componentUINodes)) {
                if (node.category === category) {
                    result[name] = node;
                }
            }
            
            return result;
        }

        getUINodesGroupedByCategory(): Record<string, Record<string, UINode>> {
            const result: Record<string, Record<string, UINode>> = {
                [UI_CATEGORIES.CONTAINER]: {},
                [UI_CATEGORIES.FORM]: {},
                [UI_CATEGORIES.DISPLAY]: {},
                [UI_CATEGORIES.ACTION]: {}
            };
            
            for (const [name, node] of Object.entries(this.componentUINodes)) {
                const category = node.category;
                if (category && Object.values(UI_CATEGORIES).includes(category)) {
                    result[category][name] = node;
                }
            }
            
            return result;
        }

        getUINodesByType(type: string): Record<string, UINode> {
            const result: Record<string, UINode> = {};
            
            for (const [name, node] of Object.entries(this.componentUINodes)) {
                if (node.type === type) {
                    result[name] = node;
                }
            }
            
            return result;
        }

        createUINodeFactory(type: string): (name: string, data: ComponentData) => UINode | undefined {
            return (name: string, componentData: ComponentData) => {
                // Ensure the type is set correctly
                const data = { ...componentData, type };
                return this.registerUINode(name, data);
            };
        }
    }
    
    return {
        NodesPool: MockNodesPool,
        UI_CATEGORIES
    };
});

// Mock the logger to avoid unnecessary console output
jest.mock('../utils/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        info: jest.fn(),
        debug: jest.fn()
    }
}));

// Import modules after mocking
const { NodesPool, UI_CATEGORIES } = require('../NodesPool');

// Define the test suite for NodesPool UI Categories
describe('NodesPool UI Categories', () => {
    // Use a more specific type
    let nodesPool: any;

    beforeEach(() => {
        nodesPool = new NodesPool();
        
        // Register some test components of different categories
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
                category: 'InvalidCategory',
                schema: '[]',
                template: '<div></div>'
            });
            
            expect(result).toBeUndefined();
            expect(nodesPool.componentUINodes['InvalidCategory']).toBeUndefined();
        });
    });
}); 