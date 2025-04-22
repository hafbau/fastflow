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
const CardDisplayModule = require('../../display/CardDisplay')
const CardDisplay = CardDisplayModule.nodeClass

describe('CardDisplay Component', () => {
    beforeEach(() => {
        // Reset mock before each test
        jest.clearAllMocks()
    })

    test('should create a CardDisplay instance with default properties', () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-1',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        // Execute
        const cardDisplay = new CardDisplay(nodeData)
        
        // Verify
        expect(cardDisplay).toBeInstanceOf(CardDisplay)
        expect(cardDisplay.id).toBe('test-card-display-1')
        expect(cardDisplay.label).toBe('Card Display')
        expect(cardDisplay.getProperties()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'title' }),
            expect.objectContaining({ name: 'elevation' }),
            expect.objectContaining({ name: 'variant' })
        ]))
    })
    
    test('should render card HTML with default values', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-2',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Card')
        expect(renderedHTML).toContain('variant=')
        expect(renderedHTML).toContain('sx=')
    })
    
    test('should render card with title', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-3',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {
                title: 'Test Card Title',
                subtitle: 'Card Subtitle'
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Mock getPropertyValue to return title values
        jest.spyOn(cardDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'title': return 'Test Card Title'
                case 'subtitle': return 'Card Subtitle'
                default: return undefined
            }
        })

        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Card')
        expect(renderedHTML).toContain('<CardHeader')
        expect(renderedHTML).toContain('title=')
        expect(renderedHTML).toContain('Test Card Title')
    })
    
    test('should render card with content', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-4',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {
                content: 'This is test card content.'
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Mock getPropertyValue to return content values
        jest.spyOn(cardDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'content': return 'This is test card content.'
                default: return undefined
            }
        })

        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Card')
        expect(renderedHTML).toContain('<CardContent')
        expect(renderedHTML).toContain('Typography')
        expect(renderedHTML).toContain('This is test card content')
    })
    
    test('should render card with media image', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-5',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {
                imageSrc: 'https://example.com/card-image.jpg',
                imageAlt: 'Card Image',
                imageHeight: '200'
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Mock getPropertyValue to return image values
        jest.spyOn(cardDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'imageSrc': return 'https://example.com/card-image.jpg'
                case 'imageAlt': return 'Card Image'
                case 'imageHeight': return '200'
                default: return undefined
            }
        })

        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Card')
        expect(renderedHTML).toContain('<CardMedia')
        expect(renderedHTML).toContain('component=')
        expect(renderedHTML).toContain('height=')
        expect(renderedHTML).toContain('image=')
        expect(renderedHTML).toContain('https://example.com/card-image.jpg')
    })
    
    test('should render a card (for action tests)', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-6',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {
                showActions: true,
                actionText: 'Learn More'
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Mock getPropertyValue to return action values
        jest.spyOn(cardDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'showActions': return true
                case 'actionText': return 'Learn More'
                default: return undefined
            }
        })

        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify basic card rendering
        expect(renderedHTML).toContain('<Card')
        expect(renderedHTML).toContain('variant=')
        expect(renderedHTML).toContain('sx=')
    })
    
    test('should handle events properly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-8',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Create a mock event
        const mockEvent = {
            type: 'buttonClick',
            nodeId: 'test-card-display-8',
            payload: { 
                buttonIndex: 0,
                buttonLabel: 'Test Button'
            }
        }
        
        // Mock console for checking that event was logged
        const logSpy = jest.spyOn(console, 'debug')
        
        // Execute handleEvent
        await cardDisplay.handleEvent(mockEvent)
        
        // Verify that the event was handled
        expect(logSpy).toHaveBeenCalled()
    })
    
    test('should parse custom CSS correctly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-card-display-9',
            name: 'CardDisplay',
            type: 'displayComponent',
            label: 'Card Display',
            inputs: {
                customCSS: 'background-color: #f5f5f5; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 12px'
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'cardIcon'
        }
        
        const cardDisplay = new CardDisplay(nodeData)
        
        // Mock getPropertyValue to return custom CSS
        jest.spyOn(cardDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            if (name === 'customCSS') {
                return 'background-color: #f5f5f5; box-shadow: 0 8px 16px rgba(0,0,0,0.2); border-radius: 12px'
            }
            return undefined
        })
        
        // Execute
        const renderedHTML = await cardDisplay.renderComponent()
        
        // Verify CSS was parsed and applied
        expect(renderedHTML).toContain('"backgroundColor":"#f5f5f5"')
        expect(renderedHTML).toContain('"boxShadow"')
        expect(renderedHTML).toContain('"borderRadius"')
    })
}) 