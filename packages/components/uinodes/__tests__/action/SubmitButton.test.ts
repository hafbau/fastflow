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

// Mock fetch for form submission testing
const fetchMock = jest.fn().mockImplementation(() => 
    Promise.resolve({
        json: () => Promise.resolve({ success: true, jobId: 'mock-job-id' })
    })
)
global.fetch = fetchMock

// Import the component (need to use require since it's using CommonJS module.exports)
const SubmitButtonModule = require('../../action/SubmitButton')
const SubmitButton = SubmitButtonModule.nodeClass

describe('SubmitButton Component', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks()
    })
    
    test('should create a SubmitButton instance with default properties', () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-1',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        // Execute
        const submitButton = new SubmitButton(nodeData)
        
        // Verify
        expect(submitButton).toBeInstanceOf(SubmitButton)
        expect(submitButton.id).toBe('test-submit-button-1')
        expect(submitButton.label).toBe('Submit Button')
        expect(submitButton.getProperties()).toEqual(expect.arrayContaining([
            expect.objectContaining({ name: 'label', value: 'Submit' }),
            expect.objectContaining({ name: 'formId' }),
            expect.objectContaining({ name: 'variant', value: 'contained' }),
            expect.objectContaining({ name: 'color', value: 'primary' })
        ]))
    })
    
    test('should render button HTML with proper attributes', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-2',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        const submitButton = new SubmitButton(nodeData)
        
        // Execute
        const renderedHTML = await submitButton.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Button')
        expect(renderedHTML).toContain('variant="contained"')
        expect(renderedHTML).toContain('color="primary"')
        expect(renderedHTML).toContain('Submit')
        expect(renderedHTML).toContain('onClick=')
        expect(renderedHTML).toContain('window.handleUINodeEvent')
    })
    
    test('should render with custom properties', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-3',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {
                label: 'Custom Submit',
                formId: 'test-form',
                variant: 'outlined',
                color: 'secondary',
                fullWidth: true
            },
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        const submitButton = new SubmitButton(nodeData)
        
        // Mock getPropertyValue to return custom values
        jest.spyOn(submitButton as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            switch (name) {
                case 'label': return 'Custom Submit'
                case 'formId': return 'test-form'
                case 'variant': return 'outlined'
                case 'color': return 'secondary'
                case 'fullWidth': return true
                default: return undefined
            }
        })
        
        // Execute
        const renderedHTML = await submitButton.renderComponent()
        
        // Verify
        expect(renderedHTML).toContain('<Button')
        expect(renderedHTML).toContain('variant="outlined"')
        expect(renderedHTML).toContain('color="secondary"')
        expect(renderedHTML).toContain('fullWidth={true}')
        expect(renderedHTML).toContain('form="test-form"')
        expect(renderedHTML).toContain('Custom Submit')
    })
    
    test('should handle form submit events correctly', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-4',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {
                formId: 'test-form'
            },
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        const submitButton = new SubmitButton(nodeData)
        
        // Mock event handler
        const handleEventSpy = jest.spyOn(submitButton, 'handleEvent')
        
        // Create event objects
        const startEvent: any = {
            type: 'submitStart',
            payload: { formId: 'test-form', state: 'loading' }
        }
        
        const successEvent: any = {
            type: 'submitSuccess',
            payload: { formId: 'test-form', state: 'success', jobId: 'test-job' }
        }
        
        const errorEvent: any = {
            type: 'submitError',
            payload: { formId: 'test-form', state: 'error', message: 'Test error' }
        }
        
        // Execute
        await submitButton.handleEvent(startEvent)
        await submitButton.handleEvent(successEvent)
        await submitButton.handleEvent(errorEvent)
        
        // Verify
        expect(handleEventSpy).toHaveBeenCalledTimes(3)
        expect(consoleMock.debug).toHaveBeenCalledWith(
            expect.stringContaining('submit started'),
            expect.any(Object)
        )
        expect(consoleMock.debug).toHaveBeenCalledWith(
            expect.stringContaining('submit succeeded'),
            expect.any(Object)
        )
        expect(consoleMock.error).toHaveBeenCalledWith(
            expect.stringContaining('submit failed'),
            expect.any(Object)
        )
    })
    
    test('should handle queue operation', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-5',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        const submitButton = new SubmitButton(nodeData)
        
        // Execute
        await submitButton.queue()
        
        // Verify queue debug message was logged
        expect(consoleMock.debug).toHaveBeenCalledWith(
            expect.stringContaining('queued for processing'),
        )
    })
    
    test('should correctly parse CSS string', async () => {
        // Setup
        const nodeData: INodeData = {
            id: 'test-submit-button-6',
            name: 'SubmitButton',
            type: 'actionComponent',
            label: 'Submit Button',
            inputs: {},
            outputs: {},
            version: 1,
            category: 'Action',
            baseClasses: ['UINodeBase'],
            icon: 'buttonIcon'
        }
        
        const submitButton = new SubmitButton(nodeData)
        
        // Mock getPropertyValue to return custom CSS
        jest.spyOn(submitButton as any, 'getPropertyValue').mockImplementation((...args: unknown[]) => {
            const name = args[0] as string;
            if (name === 'customCSS') {
                return 'font-weight: bold; margin-top: 10px; text-transform: uppercase'
            }
            return undefined
        })
        
        // Execute
        const renderedHTML = await submitButton.renderComponent()
        
        // Verify CSS was parsed and applied
        expect(renderedHTML).toContain('style=')
        expect(renderedHTML).toContain('fontWeight')
        expect(renderedHTML).toContain('bold')
        expect(renderedHTML).toContain('marginTop')
        expect(renderedHTML).toContain('textTransform')
        expect(renderedHTML).toContain('uppercase')
    })
}) 