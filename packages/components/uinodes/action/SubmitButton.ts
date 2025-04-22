import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

/**
 * SubmitButton component for form submissions with BullMQ integration
 * Handles background job processing for form actions
 */
class SubmitButton extends UINodeBase {
    // Queue name for BullMQ integration
    private static QUEUE_NAME = 'ui-form-submission'
    // Default job options
    private static DEFAULT_JOB_OPTIONS = {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
    
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'label',
                type: 'string',
                value: 'Submit',
                description: 'Button label text',
                required: true
            },
            {
                name: 'formId',
                type: 'string',
                value: '',
                description: 'ID of the form to submit',
                required: true
            },
            {
                name: 'variant',
                type: 'select',
                value: 'contained',
                description: 'Button style variant',
                required: false
            } as UINodeProperty,
            {
                name: 'color',
                type: 'select',
                value: 'primary',
                description: 'Button color',
                required: false
            } as UINodeProperty,
            {
                name: 'size',
                type: 'select',
                value: 'medium',
                description: 'Button size',
                required: false
            } as UINodeProperty,
            {
                name: 'fullWidth',
                type: 'boolean',
                value: false,
                description: 'Whether the button should take the full width',
                required: false
            },
            {
                name: 'disabled',
                type: 'boolean',
                value: false,
                description: 'Whether the button is disabled',
                required: false
            },
            {
                name: 'startIcon',
                type: 'string',
                value: '',
                description: 'Material-UI icon name to display before the label',
                required: false
            },
            {
                name: 'endIcon',
                type: 'string',
                value: '',
                description: 'Material-UI icon name to display after the label',
                required: false
            },
            {
                name: 'loadingText',
                type: 'string',
                value: 'Submitting...',
                description: 'Text to display while the form is being submitted',
                required: false
            },
            {
                name: 'successText',
                type: 'string',
                value: 'Submitted!',
                description: 'Text to display on successful submission',
                required: false
            },
            {
                name: 'errorText',
                type: 'string',
                value: 'Error submitting form',
                description: 'Text to display on failed submission',
                required: false
            },
            {
                name: 'jobPriority',
                type: 'select',
                value: 'normal',
                description: 'Priority for the background job',
                required: false
            } as UINodeProperty,
            {
                name: 'jobDelay',
                type: 'number',
                value: 0,
                description: 'Delay (in ms) before processing the job',
                required: false
            },
            {
                name: 'jobRetries',
                type: 'number',
                value: 3,
                description: 'Number of retry attempts on failure',
                required: false
            },
            {
                name: 'useTransaction',
                type: 'boolean',
                value: true,
                description: 'Whether to use a database transaction for the form submission',
                required: false
            },
            {
                name: 'validationBeforeSubmit',
                type: 'boolean',
                value: true,
                description: 'Whether to validate the form before submission',
                required: false
            },
            {
                name: 'customCSS',
                type: 'string',
                value: '',
                description: 'Custom CSS styles (in valid CSS syntax)',
                required: false
            }
        ]

        // Add options for select fields
        this.addOptionsToProperty('variant', [
            { label: 'Contained', value: 'contained' },
            { label: 'Outlined', value: 'outlined' },
            { label: 'Text', value: 'text' }
        ])

        this.addOptionsToProperty('color', [
            { label: 'Primary', value: 'primary' },
            { label: 'Secondary', value: 'secondary' },
            { label: 'Success', value: 'success' },
            { label: 'Error', value: 'error' },
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' }
        ])

        this.addOptionsToProperty('size', [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
        ])

        this.addOptionsToProperty('jobPriority', [
            { label: 'Low', value: 'low' },
            { label: 'Normal', value: 'normal' },
            { label: 'High', value: 'high' },
            { label: 'Critical', value: 'critical' }
        ])
    }

    /**
     * Helper method to add options to a select property
     */
    private addOptionsToProperty(propertyName: string, options: Array<{ label: string, value: string }>): void {
        const index = this.properties.findIndex(p => p.name === propertyName)
        if (index !== -1) {
            (this.properties[index] as any).options = options
        }
    }

    /**
     * Renders the submit button as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const label = this.getPropertyValue('label') || 'Submit'
        const formId = this.getPropertyValue('formId') || ''
        const variant = this.getPropertyValue('variant') || 'contained'
        const color = this.getPropertyValue('color') || 'primary'
        const size = this.getPropertyValue('size') || 'medium'
        const fullWidth = this.getPropertyValue('fullWidth') || false
        const disabled = this.getPropertyValue('disabled') || false
        const startIcon = this.getPropertyValue('startIcon') || undefined
        const endIcon = this.getPropertyValue('endIcon') || undefined
        const loadingText = this.getPropertyValue('loadingText') || 'Submitting...'
        const successText = this.getPropertyValue('successText') || 'Submitted!'
        const errorText = this.getPropertyValue('errorText') || 'Error submitting form'
        const customCSS = this.getPropertyValue('customCSS') || ''
        
        // Parse custom CSS
        let inlineStyle = ''
        if (customCSS) {
            inlineStyle = ` style={${JSON.stringify(this.parseCSS(customCSS))}}`
        }
        
        // Create the Material-UI compatible Button component
        return `
            <Button
                variant="${variant}"
                color="${color}"
                size="${size}"
                fullWidth={${fullWidth}}
                disabled={${disabled}}
                type="submit"
                form="${formId}"
                ${startIcon ? `startIcon={<${startIcon} />}` : ''}
                ${endIcon ? `endIcon={<${endIcon} />}` : ''}${inlineStyle}
                onClick={(event) => {
                    event.preventDefault();
                    
                    if (window.handleUINodeEvent) {
                        // Set initial loading state
                        window.handleUINodeEvent('${this.id}', {
                            type: 'submitStart',
                            name: 'submitButton',
                            value: { formId: '${formId}', state: 'loading', message: '${loadingText}' }
                        });
                        
                        // Get form data
                        const form = document.getElementById('${formId}');
                        if (!form) {
                            window.handleUINodeEvent('${this.id}', {
                                type: 'submitError',
                                name: 'submitButton',
                                value: { formId: '${formId}', state: 'error', message: 'Form not found' }
                            });
                            return;
                        }
                        
                        const formData = new FormData(form);
                        const formValues = {};
                        formData.forEach((value, key) => {
                            formValues[key] = value;
                        });
                        
                        // Submit the form data
                        fetch('/api/v1/uiflows/submit-form', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                formId: '${formId}',
                                nodeId: '${this.id}',
                                formData: formValues,
                                jobOptions: {
                                    priority: '${this.getPropertyValue('jobPriority') || 'normal'}',
                                    delay: ${this.getPropertyValue('jobDelay') || 0},
                                    attempts: ${this.getPropertyValue('jobRetries') || 3},
                                    useTransaction: ${this.getPropertyValue('useTransaction') || true}
                                }
                            }),
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.success) {
                                window.handleUINodeEvent('${this.id}', {
                                    type: 'submitSuccess',
                                    name: 'submitButton',
                                    value: { 
                                        formId: '${formId}', 
                                        state: 'success', 
                                        message: '${successText}',
                                        jobId: data.jobId
                                    }
                                });
                                
                                // Reset form after successful submission if needed
                                if (data.resetForm) {
                                    form.reset();
                                }
                            } else {
                                window.handleUINodeEvent('${this.id}', {
                                    type: 'submitError',
                                    name: 'submitButton',
                                    value: { 
                                        formId: '${formId}', 
                                        state: 'error', 
                                        message: data.error || '${errorText}'
                                    }
                                });
                            }
                        })
                        .catch(error => {
                            window.handleUINodeEvent('${this.id}', {
                                type: 'submitError',
                                name: 'submitButton',
                                value: { 
                                    formId: '${formId}', 
                                    state: 'error', 
                                    message: error.message || '${errorText}'
                                }
                            });
                        });
                    }
                }}
            >
                {${label}}
            </Button>
        `
    }

    /**
     * Implementation of queue method required by IUINode interface
     * Integrates with BullMQ for job processing
     */
    async queue(): Promise<void> {
        // BullMQ integration would be implemented here on the server side
        // This method is called by the system, not directly by client code
        this.logger.debug(`SubmitButton ${this.label} queued for processing`)
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        if (event.type === 'submitStart') {
            this.logger.debug(`SubmitButton ${this.label} submit started:`, event.payload)
        } else if (event.type === 'submitSuccess') {
            this.logger.debug(`SubmitButton ${this.label} submit succeeded:`, event.payload)
        } else if (event.type === 'submitError') {
            this.logger.error(`SubmitButton ${this.label} submit failed:`, event.payload)
        }
    }

    /**
     * Helper method to parse CSS string into object for inline styles
     */
    private parseCSS(css: string): Record<string, string> {
        try {
            const style: Record<string, string> = {}
            // Simple parser for CSS-like syntax
            const declarations = css.split(';')
            
            for (const declaration of declarations) {
                const [property, value] = declaration.split(':').map(str => str.trim())
                if (property && value) {
                    // Convert kebab-case to camelCase for React
                    const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                    style[camelProperty] = value
                }
            }
            
            return style
        } catch (error) {
            this.logger.error('Failed to parse custom CSS:', error)
            return {}
        }
    }

    /**
     * Helper method to get a property value by name
     */
    private getPropertyValue(name: string): any {
        const property = this.properties.find(prop => prop.name === name)
        return property ? property.value : undefined
    }
}

module.exports = { nodeClass: SubmitButton } 