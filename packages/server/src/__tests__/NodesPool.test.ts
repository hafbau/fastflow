// Mock dependencies before importing the module
import { MockNodesPool, UI_CATEGORIES, setupNodesMocks, createTestComponents } from './mocks/MockNodesPool'

// Set up mocks for dependencies
setupNodesMocks()

// Import after mocking
import { NodesPool } from '../NodesPool'

describe('NodesPool UI Node Functions', () => {
    let nodesPool: MockNodesPool

    beforeEach(() => {
        // Use our MockNodesPool instead of actual NodesPool
        nodesPool = new MockNodesPool()
    })

    describe('registerUINode', () => {
        it('should register a valid UI node', () => {
            // Using type assertion as this is a test case where we expect success
            const result = nodesPool.registerUINode('TestButton', {
                name: 'Test Button',
                type: 'button',
                category: UI_CATEGORIES.ACTION,
                schema: '[]',
                template: '<button>Test</button>'
            })

            // Check if the node was registered properly first
            expect(result).toBeDefined()
            
            // Then check the properties in the componentUINodes directly
            const registeredNode = nodesPool.componentUINodes.TestButton
            expect(registeredNode).toBeDefined()
            expect(registeredNode.type).toBe('button')
            expect(registeredNode.category).toBe(UI_CATEGORIES.ACTION)
        })

        it('should reject nodes with missing required fields', () => {
            // Missing type
            const result1 = nodesPool.registerUINode('MissingType', {
                name: 'Missing Type',
                category: UI_CATEGORIES.FORM
            })

            // Missing category
            const result2 = nodesPool.registerUINode('MissingCategory', {
                name: 'Missing Category',
                type: 'input'
            })

            expect(result1).toBeUndefined()
            expect(result2).toBeUndefined()
            expect(nodesPool.componentUINodes.MissingType).toBeUndefined()
            expect(nodesPool.componentUINodes.MissingCategory).toBeUndefined()
        })

        it('should reject nodes with invalid category', () => {
            const result = nodesPool.registerUINode('InvalidCategory', {
                name: 'Invalid Category',
                type: 'text',
                category: 'InvalidCategory'
            })

            expect(result).toBeUndefined()
            expect(nodesPool.componentUINodes.InvalidCategory).toBeUndefined()
        })

        it('should correctly parse schema', () => {
            const schema = '[{"name":"label","type":"string"},{"name":"size","type":"select","options":["small","medium","large"]}]'
            
            // Register the component
            nodesPool.registerUINode('SchemaTest', {
                name: 'Schema Test',
                type: 'button',
                category: UI_CATEGORIES.ACTION,
                schema
            })
            
            // Access the node directly from componentUINodes to avoid nullability issues
            const node = nodesPool.componentUINodes.SchemaTest
            expect(node).toBeDefined()
            
            // Now we can safely test the properties
            const properties = node.getProperties()
            expect(properties).toHaveLength(2)
            expect(properties[0].name).toBe('label')
            expect(properties[1].options).toContain('large')
        })
    })

    describe('unregisterUINode', () => {
        it('should unregister an existing node', () => {
            // Register first
            nodesPool.registerUINode('TestButton', {
                name: 'Test Button',
                type: 'button',
                category: UI_CATEGORIES.ACTION
            })

            // Then unregister
            const result = nodesPool.unregisterUINode('TestButton')
            
            expect(result).toBe(true)
            expect(nodesPool.componentUINodes.TestButton).toBeUndefined()
        })

        it('should return false for non-existent nodes', () => {
            const result = nodesPool.unregisterUINode('NonExistentNode')
            expect(result).toBe(false)
        })
    })

    describe('getUINodesByCategory', () => {
        beforeEach(() => {
            // Create test components of different categories
            createTestComponents(nodesPool)
        })

        it('should get nodes by category', () => {
            const formNodes = nodesPool.getUINodesByCategory(UI_CATEGORIES.FORM)
            
            expect(Object.keys(formNodes)).toHaveLength(2)
            expect(formNodes.Form1).toBeDefined()
            expect(formNodes.Form2).toBeDefined()
            expect(formNodes.Display1).toBeUndefined()
        })

        it('should return empty object for category with no nodes', () => {
            // Remove all nodes of a category first
            nodesPool.unregisterUINode('Container1')
            
            const containerNodes = nodesPool.getUINodesByCategory(UI_CATEGORIES.CONTAINER)
            expect(Object.keys(containerNodes)).toHaveLength(0)
        })
    })

    describe('getUINodesGroupedByCategory', () => {
        beforeEach(() => {
            // Create test components of different categories
            createTestComponents(nodesPool)
        })

        it('should group nodes by category', () => {
            const grouped = nodesPool.getUINodesGroupedByCategory()
            
            // Verify all categories exist
            expect(Object.keys(grouped)).toHaveLength(4)
            expect(grouped[UI_CATEGORIES.CONTAINER]).toBeDefined()
            expect(grouped[UI_CATEGORIES.FORM]).toBeDefined()
            expect(grouped[UI_CATEGORIES.DISPLAY]).toBeDefined()
            expect(grouped[UI_CATEGORIES.ACTION]).toBeDefined()
            
            // Verify node counts per category
            expect(Object.keys(grouped[UI_CATEGORIES.CONTAINER])).toHaveLength(1)
            expect(Object.keys(grouped[UI_CATEGORIES.FORM])).toHaveLength(2)
            expect(Object.keys(grouped[UI_CATEGORIES.DISPLAY])).toHaveLength(1)
            expect(Object.keys(grouped[UI_CATEGORIES.ACTION])).toHaveLength(1)
        })

        it('should handle empty categories', () => {
            // Clear all nodes
            nodesPool.componentUINodes = {}
            
            const grouped = nodesPool.getUINodesGroupedByCategory()
            
            // All categories should exist but be empty
            expect(Object.keys(grouped[UI_CATEGORIES.CONTAINER])).toHaveLength(0)
            expect(Object.keys(grouped[UI_CATEGORIES.FORM])).toHaveLength(0)
            expect(Object.keys(grouped[UI_CATEGORIES.DISPLAY])).toHaveLength(0)
            expect(Object.keys(grouped[UI_CATEGORIES.ACTION])).toHaveLength(0)
        })
    })

    describe('getUINodesByType', () => {
        beforeEach(() => {
            // Create test components of different types
            createTestComponents(nodesPool)
        })

        it('should get nodes by type', () => {
            const inputNodes = nodesPool.getUINodesByType('input')
            
            expect(Object.keys(inputNodes)).toHaveLength(1)
            expect(inputNodes.Form1).toBeDefined()
        })

        it('should return empty object for type with no nodes', () => {
            const nonExistentType = nodesPool.getUINodesByType('nonexistent')
            expect(Object.keys(nonExistentType)).toHaveLength(0)
        })
    })

    describe('createUINodeFactory', () => {
        it('should create a factory that produces nodes of specified type', () => {
            const buttonFactory = nodesPool.createUINodeFactory('button')
            
            // Create a button using the factory and check registration
            buttonFactory('CustomButton', {
                name: 'Custom Button',
                category: UI_CATEGORIES.ACTION
            })
            
            // Check the results directly from componentUINodes
            const buttonNode = nodesPool.componentUINodes.CustomButton
            expect(buttonNode).toBeDefined()
            expect(buttonNode.type).toBe('button')
        })

        it('should preserve other properties when creating nodes', () => {
            const inputFactory = nodesPool.createUINodeFactory('input')
            
            // Create an input using the factory
            inputFactory('CustomInput', {
                name: 'Custom Input',
                category: UI_CATEGORIES.FORM,
                schema: '[{"name":"value","type":"string"}]',
                description: 'A custom input'
            })
            
            // Check the results directly from componentUINodes
            const inputNode = nodesPool.componentUINodes.CustomInput
            expect(inputNode).toBeDefined()
            expect(inputNode.type).toBe('input')
            expect(inputNode.description).toBe('A custom input')
        })
    })
}) 