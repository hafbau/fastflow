// Define types for UI components
export interface ComponentData {
    name?: string;  // Make name optional for flexibility in tests
    type?: string;
    category?: string;
    schema?: string;
    template?: string;
    description?: string;
    icon?: string;
    [key: string]: any;
}

export interface UINode {
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

// UI component categories
export const UI_CATEGORIES = {
    CONTAINER: 'Container',
    FORM: 'Form',
    DISPLAY: 'Display',
    ACTION: 'Action'
} as const;

export type UICategory = typeof UI_CATEGORIES[keyof typeof UI_CATEGORIES];

// Mock NodesPool class for testing
export class MockNodesPool {
    componentUINodes: Record<string, UINode> = {};
    componentNodes: Record<string, any> = {};
    componentCredentials: Record<string, any> = {};
    
    registerUINode(name: string, componentData: ComponentData): UINode | undefined {
        // Validate required fields
        if (!componentData.type || !componentData.category) {
            return undefined;
        }
        
        // Validate category
        const uiCategories = Object.values(UI_CATEGORIES);
        if (!uiCategories.includes(componentData.category as UICategory)) {
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

    getUINodesByCategory(category: UICategory): Record<string, UINode> {
        const result: Record<string, UINode> = {};
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (node.category === category) {
                result[name] = node;
            }
        }
        
        return result;
    }

    getUINodesGroupedByCategory(): Record<UICategory, Record<string, UINode>> {
        const result: Record<UICategory, Record<string, UINode>> = {
            [UI_CATEGORIES.CONTAINER]: {},
            [UI_CATEGORIES.FORM]: {},
            [UI_CATEGORIES.DISPLAY]: {},
            [UI_CATEGORIES.ACTION]: {}
        };
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            const category = node.category as UICategory;
            if (Object.values(UI_CATEGORIES).includes(category)) {
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

    // Minimal implementation of initialize to avoid errors in tests
    async initialize() {
        return Promise.resolve();
    }
}

// Setup function to create Jest mocks for common dependencies
export function setupNodesMocks() {
    // Mock the langchain dependencies that cause ESM issues
    jest.mock('@langchain/core/messages', () => ({
        BaseMessage: jest.fn(),
    }));

    jest.mock('langchain/memory', () => ({
        BufferMemory: jest.fn(),
        BufferWindowMemory: jest.fn(),
        ConversationSummaryMemory: jest.fn(),
        ConversationSummaryBufferMemory: jest.fn(),
    }));

    // Mock the Interface module to avoid ESM issues
    jest.mock('../../Interface', () => {
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

    // Mock the components Interface module
    jest.mock('fastflow-components', () => ({
        // Add any required exports from the components module
    }));

    // Mock the NodesPool module
    jest.mock('../../NodesPool', () => {
        return {
            NodesPool: MockNodesPool,
            UI_CATEGORIES,
            UICategory: undefined // TypeScript type, doesn't exist at runtime
        };
    });

    // Mock the logger to avoid unnecessary console output
    jest.mock('../../utils/logger', () => ({
        __esModule: true,
        default: {
            error: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn()
        }
    }));
}

// Helper to create test components of different categories
export function createTestComponents(nodesPool: MockNodesPool) {
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
} 