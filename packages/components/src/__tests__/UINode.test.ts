import { IUINode, UINodeBase, UIEvent, UINodeProperty } from '../UIInterface'
import { INodeData } from '../Interface'

// Mock implementation of UINodeBase for testing
class TestUINode extends UINodeBase {
    async renderComponent(): Promise<string> {
        return '<div>Test Component</div>'
    }

    async handleEvent(event: UIEvent): Promise<void> {
        // Test implementation
        if (event.type === 'test') {
            this.properties.push({
                name: 'testProp',
                type: 'string',
                value: event.payload.value
            })
        }
    }

    getProperties(): UINodeProperty[] {
        return this.properties
    }
}

describe('UINodeBase Class', () => {
    let nodeData: INodeData
    let testNode: TestUINode

    beforeEach(() => {
        nodeData = {
            id: 'test-1',
            label: 'Test Node',
            name: 'TestNode',
            type: 'ui',
            icon: 'test-icon',
            category: 'UI',
            baseClasses: ['UINode'],
            version: 1,
            description: 'A test UI node',
            tags: ['test', 'ui']
        }
        testNode = new TestUINode(nodeData)
    })

    test('should initialize with correct properties from nodeData', () => {
        expect(testNode.label).toBe(nodeData.label)
        expect(testNode.name).toBe(nodeData.name)
        expect(testNode.type).toBe(nodeData.type)
        expect(testNode.icon).toBe(nodeData.icon)
        expect(testNode.category).toBe(nodeData.category)
        expect(testNode.baseClasses).toEqual(nodeData.baseClasses)
        expect(testNode.version).toBe(nodeData.version)
        expect(testNode.description).toBe(nodeData.description)
        expect(testNode.tags).toEqual(nodeData.tags)
    })

    test('should render component correctly', async () => {
        const rendered = await testNode.renderComponent()
        expect(rendered).toBe('<div>Test Component</div>')
    })

    test('should handle events and update properties', async () => {
        const testEvent: UIEvent = {
            type: 'test',
            payload: { value: 'test value' }
        }

        await testNode.handleEvent(testEvent)
        const properties = testNode.getProperties()

        expect(properties).toHaveLength(1)
        expect(properties[0]).toEqual({
            name: 'testProp',
            type: 'string',
            value: 'test value'
        })
    })

    test('should initialize with empty properties array', () => {
        const properties = testNode.getProperties()
        expect(Array.isArray(properties)).toBe(true)
        expect(properties).toHaveLength(0)
    })

    test('should implement IUINode interface correctly', () => {
        expect(testNode).toHaveProperty('renderComponent')
        expect(testNode).toHaveProperty('handleEvent')
        expect(testNode).toHaveProperty('getProperties')
        expect(typeof testNode.renderComponent).toBe('function')
        expect(typeof testNode.handleEvent).toBe('function')
        expect(typeof testNode.getProperties).toBe('function')
    })

    test('should handle optional properties correctly', () => {
        const minimalNodeData: INodeData = {
            id: 'test-2',
            label: 'Minimal Node',
            name: 'MinimalNode',
            type: 'ui',
            icon: 'minimal-icon',
            category: 'UI',
            baseClasses: ['UINode'],
            version: 1
        }
        const minimalNode = new TestUINode(minimalNodeData)

        expect(minimalNode.description).toBeUndefined()
        expect(minimalNode.tags).toBeUndefined()
        expect(minimalNode.badge).toBeUndefined()
        expect(minimalNode.deprecateMessage).toBeUndefined()
        expect(minimalNode.hideOutput).toBeUndefined()
        expect(minimalNode.author).toBeUndefined()
        expect(minimalNode.documentation).toBeUndefined()
    })
}) 