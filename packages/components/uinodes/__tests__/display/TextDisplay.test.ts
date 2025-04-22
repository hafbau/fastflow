import { INodeData } from '../../../src/Interface'
import path from 'path'

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
const TextDisplayModule = require('../../display/TextDisplay')
const TextDisplay = TextDisplayModule.nodeClass

describe('TextDisplay Component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    test('should create a TextDisplay instance with default properties', () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-1',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        // Execute
        const textDisplay = new TextDisplay(nodeData)
        
        // Verify
        expect(textDisplay).toBeInstanceOf(TextDisplay)
        expect(textDisplay.id).toBe('test-text-display-1')
        expect(textDisplay.label).toBe('Text Display')
        expect(textDisplay.getProperties()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'content' }),
            expect.objectContaining({ name: 'variant' }),
            expect.objectContaining({ name: 'align' }),
            expect.objectContaining({ name: 'cacheEnabled' })
        ]))
    })
    
    test('should render component HTML correctly with default values', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-2',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        const textDisplay = new TextDisplay(nodeData)
        
        // Execute
        const renderedHTML = await textDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Typography')
        expect(renderedHTML).toContain('variant="body1"')
        expect(renderedHTML).toContain('align="left"')
        expect(renderedHTML).toContain('Text content')
    })
    
    test('should render component with custom properties', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-3',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {
                content: 'Custom Text Content',
                variant: 'h1',
                align: 'center',
                color: 'primary',
                gutterBottom: true
            },
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        const textDisplay = new TextDisplay(nodeData)
        
        // Mock getPropertyValue to return custom values
        jest.spyOn(textDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'content': return 'Custom Text Content'
                case 'variant': return 'h1'
                case 'align': return 'center'
                case 'color': return 'primary'
                case 'gutterBottom': return true
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await textDisplay.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Typography')
        expect(renderedHTML).toContain('variant="h1"')
        expect(renderedHTML).toContain('align="center"')
        expect(renderedHTML).toContain('color="primary"')
        expect(renderedHTML).toContain('gutterBottom')
        expect(renderedHTML).toContain('Custom Text Content')
    })
    
    test('should use cache for repeated rendering', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-4',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        const textDisplay = new TextDisplay(nodeData)
        
        // Mock caching methods to verify they're called
        const getCachedComponentSpy = jest.spyOn(textDisplay as any, 'getCachedComponent')
        const setCachedComponentSpy = jest.spyOn(textDisplay as any, 'setCachedComponent')
        
        // First render should set cache
        await textDisplay.renderComponent()
        
        // Execute second render, should use cache
        await textDisplay.renderComponent()
        
        // Verify
        expect(getCachedComponentSpy).toHaveBeenCalledTimes(2)
        expect(setCachedComponentSpy).toHaveBeenCalledTimes(1) // Called only on first render
    })
    
    test('should clean up expired cache entries', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-5',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        const textDisplay = new TextDisplay(nodeData)
        
        // Mock Date.now to simulate time passing
        const originalNow = Date.now
        const nowMock = jest.fn()
        global.Date.now = nowMock
        
        // Set initial time
        nowMock.mockReturnValue(1000)
        
        // Render to create cache entry
        await textDisplay.renderComponent()
        
        // Move time forward past cache expiration
        const cacheExpiration = (TextDisplay as any).CACHE_EXPIRATION
        nowMock.mockReturnValue(1000 + cacheExpiration + 1000) // Add extra 1000ms
        
        // Execute cache cleanup
        await textDisplay.cache()
        
        // Try to render again, should not use expired cache
        const setCachedComponentSpy = jest.spyOn(textDisplay as any, 'setCachedComponent')
        await textDisplay.renderComponent()
        
        // Verify cache was set again (wouldn't happen if using cached version)
        expect(setCachedComponentSpy).toHaveBeenCalled()
        
        // Restore original Date.now
        global.Date.now = originalNow
    })
    
    test('should parse custom CSS correctly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-text-display-6',
            name: 'TextDisplay',
            type: 'displayComponent',
            label: 'Text Display',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Display',
            baseClasses: ['UINodeBase'],
            icon: 'textIcon'
        }
        
        const textDisplay = new TextDisplay(nodeData)
        
        // Mock getPropertyValue to return custom CSS
        jest.spyOn(textDisplay as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            if (name === 'customCSS') {
                return 'font-weight: bold; text-decoration: underline; margin-top: 20px'
            }
            if (name === 'content') {
                return 'Custom styled text'
            }
            return undefined
        })
        
        // Execute
        const renderedHTML = await textDisplay.renderComponent()
        
        // Verify CSS was parsed and applied
        expect(renderedHTML).toContain('style=')
        expect(renderedHTML).toContain('fontWeight')
        expect(renderedHTML).toContain('bold')
        expect(renderedHTML).toContain('textDecoration')
        expect(renderedHTML).toContain('underline')
        expect(renderedHTML).toContain('marginTop')
        expect(renderedHTML).toContain('20px')
    })
}) 