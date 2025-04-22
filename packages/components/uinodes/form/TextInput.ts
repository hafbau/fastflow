import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

// Extended interface to support select options
interface UINodePropertyWithOptions extends UINodeProperty {
    options?: Array<{ label: string, value: string }>
}

/**
 * TextInput component for collecting user text input
 */
class TextInput extends UINodeBase {
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'label',
                type: 'string',
                value: 'Text Input',
                description: 'Label for the input field',
                required: false
            },
            {
                name: 'placeholder',
                type: 'string',
                value: 'Enter text...',
                description: 'Placeholder text when input is empty',
                required: false
            },
            {
                name: 'defaultValue',
                type: 'string',
                value: '',
                description: 'Default value for the input',
                required: false
            },
            {
                name: 'name',
                type: 'string',
                value: 'textInput',
                description: 'Name of the form field (for form submission)',
                required: true
            },
            {
                name: 'required',
                type: 'boolean',
                value: false,
                description: 'Whether the field is required',
                required: false
            },
            {
                name: 'disabled',
                type: 'boolean',
                value: false,
                description: 'Whether the field is disabled',
                required: false
            },
            {
                name: 'variant',
                type: 'select',
                value: 'outlined',
                description: 'Visual variant of the input',
                required: false
            } as UINodeProperty,
            {
                name: 'size',
                type: 'select',
                value: 'medium',
                description: 'Size of the input field',
                required: false
            } as UINodeProperty,
            {
                name: 'fullWidth',
                type: 'boolean',
                value: true,
                description: 'Whether the input should take up the full width',
                required: false
            },
            {
                name: 'multiline',
                type: 'boolean',
                value: false,
                description: 'Whether the input should allow multiple lines',
                required: false
            },
            {
                name: 'rows',
                type: 'number',
                value: 4,
                description: 'Number of rows (when multiline is true)',
                required: false
            },
            {
                name: 'minLength',
                type: 'number',
                value: 0,
                description: 'Minimum input length',
                required: false
            },
            {
                name: 'maxLength',
                type: 'number',
                value: 0,
                description: 'Maximum input length (0 for no limit)',
                required: false
            },
            {
                name: 'helperText',
                type: 'string',
                value: '',
                description: 'Helper text displayed below the input',
                required: false
            },
            {
                name: 'type',
                type: 'select',
                value: 'text',
                description: 'Input type (text, password, email, etc.)',
                required: false
            } as UINodeProperty,
            {
                name: 'margin',
                type: 'select',
                value: 'normal',
                description: 'Margin around the input',
                required: false
            } as UINodeProperty
        ]

        // Add options for select fields
        this.addOptionsToProperty('variant', [
            { label: 'Outlined', value: 'outlined' },
            { label: 'Filled', value: 'filled' },
            { label: 'Standard', value: 'standard' }
        ])

        this.addOptionsToProperty('size', [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' }
        ])

        this.addOptionsToProperty('type', [
            { label: 'Text', value: 'text' },
            { label: 'Password', value: 'password' },
            { label: 'Email', value: 'email' },
            { label: 'Number', value: 'number' },
            { label: 'Tel', value: 'tel' },
            { label: 'URL', value: 'url' }
        ])

        this.addOptionsToProperty('margin', [
            { label: 'None', value: 'none' },
            { label: 'Dense', value: 'dense' },
            { label: 'Normal', value: 'normal' }
        ])
    }

    /**
     * Helper method to add options to a select property
     */
    private addOptionsToProperty(propertyName: string, options: Array<{ label: string, value: string }>): void {
        const index = this.properties.findIndex(p => p.name === propertyName)
        if (index !== -1) {
            (this.properties[index] as UINodePropertyWithOptions).options = options
        }
    }

    /**
     * Renders the text input as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const label = this.getPropertyValue('label') || 'Text Input'
        const placeholder = this.getPropertyValue('placeholder') || 'Enter text...'
        const defaultValue = this.getPropertyValue('defaultValue') || ''
        const name = this.getPropertyValue('name') || 'textInput'
        const required = this.getPropertyValue('required') || false
        const disabled = this.getPropertyValue('disabled') || false
        const variant = this.getPropertyValue('variant') || 'outlined'
        const size = this.getPropertyValue('size') || 'medium'
        const fullWidth = this.getPropertyValue('fullWidth') !== false
        const multiline = this.getPropertyValue('multiline') || false
        const rows = this.getPropertyValue('rows') || 4
        const minLength = this.getPropertyValue('minLength') || 0
        const maxLength = this.getPropertyValue('maxLength') || 0
        const helperText = this.getPropertyValue('helperText') || ''
        const type = this.getPropertyValue('type') || 'text'
        const margin = this.getPropertyValue('margin') || 'normal'

        // Handle input constraints
        const inputProps: any = {}
        if (minLength > 0) inputProps.minLength = minLength
        if (maxLength > 0) inputProps.maxLength = maxLength

        // Create the Material-UI compatible TextField component
        return `
            <TextField
                label="${label}"
                placeholder="${placeholder}"
                defaultValue="${defaultValue}"
                name="${name}"
                variant="${variant}"
                size="${size}"
                type="${type}"
                margin="${margin}"
                fullWidth={${fullWidth}}
                required={${required}}
                disabled={${disabled}}
                multiline={${multiline}}
                ${multiline ? `rows={${rows}}` : ''}
                helperText="${helperText}"
                inputProps={${JSON.stringify(inputProps)}}
                onChange={(event) => {
                    // Handle change event
                    const value = event.target.value;
                    // You can add custom handling here or emit an event
                }}
            />
        `
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        if (event.type === 'change') {
            // Handle value change event
            this.logger.debug(`TextInput ${this.label} changed to:`, event.payload.value)
            
            // Update the defaultValue property to reflect the new value
            const index = this.properties.findIndex(p => p.name === 'defaultValue')
            if (index !== -1) {
                this.properties[index].value = event.payload.value
            }
        }
    }

    /**
     * Helper method to get a property value by name
     */
    private getPropertyValue(name: string): any {
        const property = this.properties.find(prop => prop.name === name)
        return property ? property.value : undefined
    }

    /**
     * Returns the current value of the input field
     */
    getValue(): string {
        return this.getPropertyValue('defaultValue') || ''
    }

    /**
     * Set the value of the input field
     */
    setValue(value: string): void {
        const index = this.properties.findIndex(p => p.name === 'defaultValue')
        if (index !== -1) {
            this.properties[index].value = value
        }
    }

    /**
     * Returns cache key for the component (for optimizing rendering)
     */
    getCacheKey(): string {
        return `text_input_${this.label}_${JSON.stringify(this.properties)}`
    }

    /**
     * Returns queue options for async operations
     */
    getQueueOptions(): { priority: number, attempts: number } {
        return { priority: 2, attempts: 1 }
    }
}

module.exports = { nodeClass: TextInput } 