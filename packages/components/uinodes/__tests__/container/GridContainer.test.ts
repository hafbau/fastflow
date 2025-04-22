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
const GridContainerModule = require('../../container/GridContainer')
const GridContainer = GridContainerModule.nodeClass

describe('GridContainer Component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    test('should create a GridContainer instance with default properties', () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-1',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        // Execute
        const gridContainer = new GridContainer(nodeData)
        
        // Verify
        expect(gridContainer).toBeInstanceOf(GridContainer)
        expect(gridContainer.id).toBe('test-grid-container-1')
        expect(gridContainer.label).toBe('Grid Container')
        expect(gridContainer.getProperties()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'columns' }),
            expect.objectContaining({ name: 'columnGap' }),
            expect.objectContaining({ name: 'rowGap' })
        ]))
    })
    
    test('should render container HTML correctly with default values', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-2',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const gridContainer = new GridContainer(nodeData)
        
        // Execute
        const renderedHTML = await gridContainer.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("display: 'grid'")
        expect(renderedHTML).toContain('gridTemplateColumns')
        expect(renderedHTML).toContain('gridColumnGap')
    })
    
    test('should render container with custom properties', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-3',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {
                columns: 12,
                columnGap: 3,
                rowGap: 3,
                justifyItems: 'center',
                alignItems: 'center',
                padding: '24px',
                backgroundColor: '#f9f9f9'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const gridContainer = new GridContainer(nodeData)
        
        // Mock getPropertyValue to return custom values
        jest.spyOn(gridContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'columns': return 12
                case 'columnGap': return 3
                case 'rowGap': return 3
                case 'justifyItems': return 'center'
                case 'alignItems': return 'center'
                case 'padding': return '24px'
                case 'backgroundColor': return '#f9f9f9'
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await gridContainer.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("display: 'grid'")
        expect(renderedHTML).toContain('repeat(12, 1fr)')
        expect(renderedHTML).toContain('gridColumnGap: 3')
        expect(renderedHTML).toContain('gridRowGap: 3')
        expect(renderedHTML).toContain("justifyItems: 'center'")
        expect(renderedHTML).toContain("alignItems: 'center'")
    })
    
    test('should render with children placeholder', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-4',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const gridContainer = new GridContainer(nodeData)
        
        // Execute
        const renderedHTML = await gridContainer.renderComponent()
        
        // Verify that the container includes a placeholder for children
        expect(renderedHTML).toContain('{children}')
    })
    
    test('should parse custom CSS correctly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-5',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {
                customCSS: 'border: 1px solid #ddd; border-radius: 4px; min-height: 200px'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const gridContainer = new GridContainer(nodeData)
        
        // Mock getPropertyValue to return custom CSS
        jest.spyOn(gridContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            if (name === 'border') {
                return '1px solid #ddd'
            }
            if (name === 'borderRadius') {
                return '4px'
            }
            if (name === 'minHeight') {
                return '200px'
            }
            return undefined
        })
        
        // Execute
        const renderedHTML = await gridContainer.renderComponent()
        
        // Verify CSS was parsed and applied
        expect(renderedHTML).toContain("border: '1px solid #ddd'")
        expect(renderedHTML).toContain("borderRadius: '4px'")
        expect(renderedHTML).toContain("height: ")
    })
    
    test('should handle template columns setting', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-grid-container-6',
            name: 'GridContainer',
            type: 'containerComponent',
            label: 'Grid Container',
            inputs: {
                templateColumns: 'minmax(100px, 1fr) 2fr 1fr',
                templateRows: 'auto auto 100px'
            },
            outputs: {},
            version: 1,
            category: 'Container',
            baseClasses: ['UINodeBase'],
            icon: 'containerIcon'
        }
        
        const gridContainer = new GridContainer(nodeData)
        
        // Mock getPropertyValue to return template values
        jest.spyOn(gridContainer as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'templateColumns': return 'minmax(100px, 1fr) 2fr 1fr'
                case 'templateRows': return 'auto auto 100px'
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await gridContainer.renderComponent()
        
        // Verify template settings are applied
        expect(renderedHTML).toContain('Box')
        expect(renderedHTML).toContain("display: 'grid'")
        expect(renderedHTML).not.toContain('repeat(') // Should use the custom template instead
        expect(renderedHTML).toContain("gridTemplateColumns: 'minmax(100px, 1fr) 2fr 1fr'")
        expect(renderedHTML).toContain("gridTemplateRows: 'auto auto 100px'")
    })
}) 