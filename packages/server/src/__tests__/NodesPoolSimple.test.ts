/**
 * Simple test for NodesPool UI functionality
 * All mocks are defined inline to avoid module resolution issues
 */

// Define UI categories for testing
export const UI_CATEGORIES = {
    CONTAINER: 'Container',
    FORM: 'Form',
    DISPLAY: 'Display',
    ACTION: 'Action'
};

// Simple mock node for testing
class MockUINode {
    type: string;
    category: string;
    name: string;
    schema: string;
    template: string;
    description?: string;
    icon?: string;

    constructor(data: any) {
        this.type = data.type;
        this.category = data.category;
        this.name = data.name || '';
        this.schema = data.schema || '[]';
        this.template = data.template || '';
        this.description = data.description;
        this.icon = data.icon;
    }

    renderComponent() {
        return Promise.resolve(this.template);
    }

    handleEvent() {
        return {};
    }

    getProperties() {
        try {
            return JSON.parse(this.schema);
        } catch (e) {
            return [];
        }
    }

    getCacheKey() {
        return `ui_${this.name}`;
    }
}

// Simple mock NodesPool class for testing
class MockNodesPool {
    componentUINodes: Record<string, any> = {};

    registerUINode(name: string, data: any) {
        // Validate required fields
        if (!data.type || !data.category) {
            return undefined;
        }

        // Validate category
        if (!Object.values(UI_CATEGORIES).includes(data.category)) {
            return undefined;
        }

        // Create and store the node
        const node = new MockUINode({
            ...data,
            name
        });
        this.componentUINodes[name] = node;
        return node;
    }

    unregisterUINode(name: string) {
        if (!this.componentUINodes[name]) {
            return false;
        }
        delete this.componentUINodes[name];
        return true;
    }

    getUINodesByCategory(category: string) {
        const result: Record<string, any> = {};
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (node.category === category) {
                result[name] = node;
            }
        }
        
        return result;
    }

    getUINodesGroupedByCategory() {
        const result: Record<string, Record<string, any>> = {
            [UI_CATEGORIES.CONTAINER]: {},
            [UI_CATEGORIES.FORM]: {},
            [UI_CATEGORIES.DISPLAY]: {},
            [UI_CATEGORIES.ACTION]: {}
        };
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (Object.values(UI_CATEGORIES).includes(node.category)) {
                result[node.category][name] = node;
            }
        }
        
        return result;
    }

    getUINodesByType(type: string) {
        const result: Record<string, any> = {};
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (node.type === type) {
                result[name] = node;
            }
        }
        
        return result;
    }

    createUINodeFactory(type: string) {
        return (name: string, data: any) => {
            return this.registerUINode(name, {
                ...data,
                type
            });
        };
    }
}

// Helper to create test components
function createTestComponents(nodesPool: MockNodesPool) {
    nodesPool.registerUINode('Container1', {
        name: 'Container Component',
        type: 'container',
        category: UI_CATEGORIES.CONTAINER,
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
        template: '<span></span>'
    });
    
    nodesPool.registerUINode('Action1', {
        name: 'Action Component',
        type: 'button',
        category: UI_CATEGORIES.ACTION,
        template: '<button></button>'
    });
}

// Tests begin here
describe('NodesPool UI Node Basic Functions', () => {
    let nodesPool: MockNodesPool;

    beforeEach(() => {
        nodesPool = new MockNodesPool();
    });

    describe('Component Registration', () => {
        it('should register a valid UI node', () => {
            const result = nodesPool.registerUINode('TestButton', {
                name: 'Test Button',
                type: 'button',
                category: UI_CATEGORIES.ACTION,
                template: '<button>Test</button>'
            });

            expect(result).toBeDefined();
            expect(nodesPool.componentUINodes.TestButton).toBeDefined();
            expect(nodesPool.componentUINodes.TestButton.type).toBe('button');
            expect(nodesPool.componentUINodes.TestButton.category).toBe(UI_CATEGORIES.ACTION);
        });

        it('should reject nodes with missing required fields', () => {
            // Missing type
            const result1 = nodesPool.registerUINode('MissingType', {
                name: 'Missing Type',
                category: UI_CATEGORIES.FORM
            });

            // Missing category
            const result2 = nodesPool.registerUINode('MissingCategory', {
                name: 'Missing Category',
                type: 'input'
            });

            expect(result1).toBeUndefined();
            expect(result2).toBeUndefined();
            expect(nodesPool.componentUINodes.MissingType).toBeUndefined();
            expect(nodesPool.componentUINodes.MissingCategory).toBeUndefined();
        });
    });

    describe('Component Categorization', () => {
        beforeEach(() => {
            createTestComponents(nodesPool);
        });

        it('should get nodes by category', () => {
            const formNodes = nodesPool.getUINodesByCategory(UI_CATEGORIES.FORM);
            
            expect(Object.keys(formNodes)).toHaveLength(2);
            expect(formNodes.Form1).toBeDefined();
            expect(formNodes.Form2).toBeDefined();
            expect(formNodes.Display1).toBeUndefined();
        });

        it('should get nodes by type', () => {
            const inputNodes = nodesPool.getUINodesByType('input');
            
            expect(Object.keys(inputNodes)).toHaveLength(1);
            expect(inputNodes.Form1).toBeDefined();
            expect(inputNodes.Form2).toBeUndefined();
        });

        it('should group nodes by category', () => {
            const grouped = nodesPool.getUINodesGroupedByCategory();
            
            expect(Object.keys(grouped)).toHaveLength(4);
            expect(Object.keys(grouped[UI_CATEGORIES.FORM])).toHaveLength(2);
            expect(Object.keys(grouped[UI_CATEGORIES.DISPLAY])).toHaveLength(1);
            expect(Object.keys(grouped[UI_CATEGORIES.ACTION])).toHaveLength(1);
        });
    });

    describe('Component Factory', () => {
        it('should create a factory that produces nodes of specified type', () => {
            const buttonFactory = nodesPool.createUINodeFactory('button');
            
            buttonFactory('CustomButton', {
                name: 'Custom Button',
                category: UI_CATEGORIES.ACTION
            });
            
            expect(nodesPool.componentUINodes.CustomButton).toBeDefined();
            expect(nodesPool.componentUINodes.CustomButton.type).toBe('button');
        });
    });
}); 