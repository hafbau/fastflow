import { INode, INodeParams, INodeOutputsValue } from '../Interface'

describe('INode Interface', () => {
    const mockNode: INode = {
        name: 'TestNode',
        label: 'Test Node',
        type: 'test',
        icon: 'test-icon',
        category: 'Testing',
        baseClasses: ['BaseTest'],
        version: 1,
        description: 'A test node',
        inputs: [
            {
                label: 'Input 1',
                name: 'input1',
                type: 'string',
                description: 'First input parameter'
            }
        ],
        output: [
            {
                label: 'Output 1',
                name: 'output1',
                baseClasses: ['string'],
                description: 'First output'
            }
        ]
    }

    test('should have required properties', () => {
        expect(mockNode.name).toBeDefined()
        expect(mockNode.label).toBeDefined()
        expect(mockNode.type).toBeDefined()
        expect(mockNode.icon).toBeDefined()
        expect(mockNode.category).toBeDefined()
        expect(mockNode.baseClasses).toBeDefined()
        expect(mockNode.version).toBeDefined()
    })

    test('should have correct property types', () => {
        expect(typeof mockNode.name).toBe('string')
        expect(typeof mockNode.label).toBe('string')
        expect(typeof mockNode.type).toBe('string')
        expect(typeof mockNode.icon).toBe('string')
        expect(typeof mockNode.category).toBe('string')
        expect(Array.isArray(mockNode.baseClasses)).toBe(true)
        expect(typeof mockNode.version).toBe('number')
    })

    test('should have valid inputs structure', () => {
        expect(Array.isArray(mockNode.inputs)).toBe(true)
        if (mockNode.inputs) {
            const input = mockNode.inputs[0]
            expect(input.label).toBeDefined()
            expect(input.name).toBeDefined()
            expect(input.type).toBeDefined()
            expect(typeof input.label).toBe('string')
            expect(typeof input.name).toBe('string')
            expect(typeof input.type).toBe('string')
        }
    })

    test('should have valid output structure', () => {
        expect(Array.isArray(mockNode.output)).toBe(true)
        if (mockNode.output) {
            const output = mockNode.output[0]
            expect(output.label).toBeDefined()
            expect(output.name).toBeDefined()
            expect(output.baseClasses).toBeDefined()
            expect(typeof output.label).toBe('string')
            expect(typeof output.name).toBe('string')
            expect(Array.isArray(output.baseClasses)).toBe(true)
        }
    })
}) 