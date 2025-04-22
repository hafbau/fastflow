import { INodeData } from '../Interface'
import { IUINode, UIEvent, UINodeProperty, UINodeBase } from '../UIInterface'

// Mock implementation of UINodeBase for testing
class MockUINode extends UINodeBase {
    async renderComponent(): Promise<string> {
        return '<div>Mock Component</div>'
    }
}

describe('UINodeBase', () => {
    let nodeData: INodeData
    let mockNode: MockUINode

    beforeEach(() => {
        // Setup test data
        nodeData = {
            id: 'test-id',
            label: 'Test Node',
            name: 'testNode',
            type: 'test',
            icon: 'test-icon',
            version: 1,
            category: 'test',
            baseClasses: ['TestClass'],
            description: 'Test Description',
            filePath: '/test/path',
            badge: 'test',
            deprecateMessage: undefined,
            hideOutput: false,
            author: 'Test Author',
            documentation: 'Test Docs',
            tags: ['test']
        }
        mockNode = new MockUINode(nodeData)
    })

    describe('Constructor and Properties', () => {
        it('should correctly initialize with node data', () => {
            expect(mockNode.label).toBe(nodeData.label)
            expect(mockNode.name).toBe(nodeData.name)
            expect(mockNode.type).toBe(nodeData.type)
            expect(mockNode.icon).toBe(nodeData.icon)
            expect(mockNode.version).toBe(nodeData.version)
            expect(mockNode.category).toBe(nodeData.category)
            expect(mockNode.baseClasses).toEqual(nodeData.baseClasses)
            expect(mockNode.description).toBe(nodeData.description)
            expect(mockNode.filePath).toBe(nodeData.filePath)
            expect(mockNode.badge).toBe(nodeData.badge)
            expect(mockNode.deprecateMessage).toBe(nodeData.deprecateMessage)
            expect(mockNode.hideOutput).toBe(nodeData.hideOutput)
            expect(mockNode.author).toBe(nodeData.author)
            expect(mockNode.documentation).toBe(nodeData.documentation)
            expect(mockNode.tags).toEqual(nodeData.tags)
        })
    })

    describe('renderComponent', () => {
        it('should render mock component', async () => {
            const result = await mockNode.renderComponent()
            expect(result).toBe('<div>Mock Component</div>')
        })
    })

    describe('handleEvent', () => {
        let consoleSpy: jest.SpyInstance

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'debug').mockImplementation()
        })

        afterEach(() => {
            consoleSpy.mockRestore()
        })

        it('should handle events and log debug message', async () => {
            const event: UIEvent = {
                type: 'click',
                payload: { value: 'test' }
            }

            await mockNode.handleEvent(event)
            expect(consoleSpy).toHaveBeenCalledWith(
                'Handling event click with payload:',
                { value: 'test' }
            )
        })
    })

    describe('Properties Management', () => {
        it('should start with empty properties', () => {
            expect(mockNode.getProperties()).toEqual([])
        })

        it('should allow adding properties', () => {
            const property: UINodeProperty = {
                name: 'testProp',
                type: 'string',
                value: 'test',
                description: 'Test property',
                required: true
            }

            // Access protected method through type assertion
            ;(mockNode as any).addProperty(property)

            const properties = mockNode.getProperties()
            expect(properties).toHaveLength(1)
            expect(properties[0]).toEqual(property)
        })
    })

    describe('Error Handling', () => {
        let consoleSpy: jest.SpyInstance

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        })

        afterEach(() => {
            consoleSpy.mockRestore()
        })

        it('should handle errors correctly', () => {
            const error = new Error('Test error')
            const context = 'test context'

            expect(() => {
                // Access protected method through type assertion
                ;(mockNode as any).handleError(error, context)
            }).toThrow(error)

            expect(consoleSpy).toHaveBeenCalledWith(
                'Error in test context:',
                error
            )
        })
    })

    describe('Performance Monitoring', () => {
        let consoleSpy: jest.SpyInstance
        let performanceNowSpy: jest.SpyInstance

        beforeEach(() => {
            consoleSpy = jest.spyOn(console, 'debug').mockImplementation()
            performanceNowSpy = jest
                .spyOn(performance, 'now')
                .mockImplementationOnce(() => 0)
                .mockImplementationOnce(() => 100)
        })

        afterEach(() => {
            consoleSpy.mockRestore()
            performanceNowSpy.mockRestore()
        })

        it('should measure operation performance', async () => {
            const operation = jest.fn().mockResolvedValue('result')
            const operationName = 'test operation'

            // Access protected method through type assertion
            const result = await (mockNode as any).measurePerformance(
                operation,
                operationName
            )

            expect(result).toBe('result')
            expect(operation).toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith(
                'test operation took 100ms'
            )
        })

        it('should measure performance even if operation fails', async () => {
            const error = new Error('Test error')
            const operation = jest.fn().mockRejectedValue(error)
            const operationName = 'failing operation'

            // Access protected method through type assertion
            await expect(
                (mockNode as any).measurePerformance(operation, operationName)
            ).rejects.toThrow(error)

            expect(operation).toHaveBeenCalled()
            expect(consoleSpy).toHaveBeenCalledWith(
                'failing operation took 100ms'
            )
        })
    })

    describe('Interface Contract', () => {
        it('should implement all required IUINode methods', () => {
            const requiredMethods = ['renderComponent', 'handleEvent', 'getProperties']
            requiredMethods.forEach(method => {
                expect(typeof (mockNode as any)[method]).toBe('function')
            })
        })

        it('should have optional cache and queue methods defined as undefined', () => {
            const optionalMethods = ['cache', 'queue']
            optionalMethods.forEach(method => {
                expect((mockNode as any)[method]).toBeUndefined()
            })
        })
    })
}) 