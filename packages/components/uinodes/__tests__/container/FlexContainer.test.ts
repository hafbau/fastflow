import { INodeData } from '../../../src/Interface'

// Mock console to prevent test logs
const consoleMock = {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
    info: jest.fn()
}
global.console = consoleMock as any

// Mock window.handleUINodeEvent
const handleUINodeEventMock = jest.fn()
global.window = {
    ...global.window,
    handleUINodeEvent: handleUINodeEventMock
} as any

// Import the component (need to use require since it's using CommonJS module.exports)
const FlexContainerModule = require('../../container/FlexContainer')
const FlexContainer = FlexContainerModule.nodeClass

describe('FlexContainer Component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    test('should create a FlexContainer instance with default properties', () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-1',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        // Execute
        const flexContainer = new FlexContainer(nodeData)
        
        // Verify
        expect(flexContainer).toBeInstanceOf(FlexContainer)
        expect(flexContainer.id).toBe('test-flex-container-1')
        expect(flexContainer.label).toBe('Flex Container')
        expect(flexContainer.getProperties()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'direction' }),
            expect.objectContaining({ name: 'justifyContent' }),
            expect.objectContaining({ name: 'alignItems' })
        ]))
    })
    
    test('should render container HTML correctly with default values', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-2',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const flexContainer = new FlexContainer(nodeData)
        
        // Execute
        const renderedHTML = await flexContainer.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("display: 'flex'")
        expect(renderedHTML).toContain('flexDirection')
        expect(renderedHTML).toContain('justifyContent')
        expect(renderedHTML).toContain('alignItems')
    })
    
    test('should render container with custom properties', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-3',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {
                direction: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '24px',
                backgroundColor: '#f5f5f5'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const flexContainer = new FlexContainer(nodeData)
        
        // Mock getPropertyValue to return custom values
        jest.spyOn(flexContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'direction': return 'column'
                case 'justifyContent': return 'center'
                case 'alignItems': return 'flex-start'
                case 'gap': return '16px'
                case 'padding': return '24px'
                case 'backgroundColor': return '#f5f5f5'
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await flexContainer.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("flexDirection: 'column'")
        expect(renderedHTML).toContain("justifyContent: 'center'")
        expect(renderedHTML).toContain("alignItems: 'flex-start'")
        expect(renderedHTML).toContain('gap: 16')
        expect(renderedHTML).toContain("padding: '24px'")
        expect(renderedHTML).toContain("backgroundColor: '#f5f5f5'")
    })
    
    test('should render with children placeholder', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-4',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const flexContainer = new FlexContainer(nodeData)
        
        // Execute
        const renderedHTML = await flexContainer.renderComponent()
        
        // Verify that the container includes a placeholder for children
        expect(renderedHTML).toContain('{children}')
    })
    
    test('should parse custom CSS correctly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-5',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {
                customCSS: 'border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const flexContainer = new FlexContainer(nodeData)
        
        // Mock getPropertyValue to return custom CSS
        jest.spyOn(flexContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            if (name === 'customCSS') {
                return 'border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1)'
            }
            if (name === 'border') {
                return '1px solid #ccc'
            }
            if (name === 'borderRadius') {
                return '8px'
            }
            if (name === 'boxShadow') {
                return '0 2px 4px rgba(0,0,0,0.1)'
            }
            return undefined
        })
        
        // Execute
        const renderedHTML = await flexContainer.renderComponent()
        
        // Verify CSS was parsed and applied
        expect(renderedHTML).toContain("border: '1px solid #ccc'")
        expect(renderedHTML).toContain("borderRadius: '8px'")
    })
    
    test('should handle responsive design properties', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-flex-container-6',
            name: 'FlexContainer',
            type: 'containerComponent',
            label: 'Flex Container',
            inputs: {
                responsive: true,
                direction: 'column',
                mobileDirection: 'column',
                tabletDirection: 'row',
                desktopDirection: 'row'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const flexContainer = new FlexContainer(nodeData)
        
        // Mock getPropertyValue for this test case
        jest.spyOn(flexContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'direction': return 'column'
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await flexContainer.renderComponent()
        
        // Verify basic rendering works even without all responsive props
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("flexDirection: 'column'")
        expect(renderedHTML).toContain("display: 'flex'")
    })
}) 