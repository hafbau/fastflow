import { INodeData } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty, IUINode } from '../../src/UIInterface'

// Extended interface to support select options
interface UINodePropertyWithOptions extends UINodeProperty {
    options?: Array<{ label: string, value: string }>
}

interface SelectOption {
    label: string
    value: string
}

/**
 * SelectInput component for dropdown selection
 */
export class SelectInput extends UINodeBase implements IUINode {
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'label',
                type: 'string',
                value: 'Select',
                description: 'Label for the select field',
                required: true
            },
            {
                name: 'name',
                type: 'string',
                value: '',
                description: 'Name attribute for the form field',
                required: true
            },
            {
                name: 'options',
                type: 'json',
                value: '[]',
                description: 'Options for the select (array of {label, value} objects)',
                required: true
            },
            {
                name: 'defaultValue',
                type: 'string',
                value: '',
                description: 'Default selected value',
                required: false
            },
            {
                name: 'helperText',
                type: 'string',
                value: '',
                description: 'Helper text displayed below the select',
                required: false
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
                description: 'Visual style variant of the select',
                required: false
            } as UINodeProperty,
            {
                name: 'size',
                type: 'select',
                value: 'medium',
                description: 'Size of the select field',
                required: false
            } as UINodeProperty,
            {
                name: 'fullWidth',
                type: 'boolean',
                value: true,
                description: 'Whether the select should take full width',
                required: false
            },
            {
                name: 'multiple',
                type: 'boolean',
                value: false,
                description: 'Allow multiple selections',
                required: false
            },
            {
                name: 'error',
                type: 'boolean',
                value: false,
                description: 'Whether to display the select in an error state',
                required: false
            }
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
     * Parse options from the options property
     */
    private parseOptions(): SelectOption[] {
        try {
            const optionsValue = this.getPropertyValue('options')
            if (typeof optionsValue === 'string') {
                return JSON.parse(optionsValue)
            } else if (Array.isArray(optionsValue)) {
                return optionsValue
            }
        } catch (error) {
            this.logger.error('Failed to parse select options:', error)
        }
        return []
    }

    /**
     * Renders the select input as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const label = this.getPropertyValue('label') || 'Select'
        const name = this.getPropertyValue('name') || ''
        const defaultValue = this.getPropertyValue('defaultValue') || ''
        const helperText = this.getPropertyValue('helperText') || ''
        const required = this.getPropertyValue('required') || false
        const disabled = this.getPropertyValue('disabled') || false
        const variant = this.getPropertyValue('variant') || 'outlined'
        const size = this.getPropertyValue('size') || 'medium'
        const fullWidth = this.getPropertyValue('fullWidth') || true
        const multiple = this.getPropertyValue('multiple') || false
        const error = this.getPropertyValue('error') || false
        
        // Get options
        const options = this.parseOptions()
        
        // Generate option items
        const optionItems = options.map(option => 
            `<MenuItem key="${option.value}" value="${option.value}">${option.label}</MenuItem>`
        ).join('\n')

        // Create the Material-UI compatible Select component
        return `
            <FormControl
                variant="${variant}"
                size="${size}"
                fullWidth={${fullWidth}}
                required={${required}}
                disabled={${disabled}}
                error={${error}}
                margin="normal"
            >
                <InputLabel id="${name}-label">${label}</InputLabel>
                <Select
                    labelId="${name}-label"
                    id="${name}"
                    name="${name}"
                    value="${defaultValue}"
                    label="${label}"
                    ${multiple ? 'multiple={true}' : ''}
                    onChange={(event) => {
                        // Handle change event
                        if (window.handleUINodeEvent) {
                            window.handleUINodeEvent('${this.id}', {
                                type: 'change',
                                name: '${name}',
                                value: event.target.value
                            });
                        }
                    }}
                >
                    ${optionItems}
                </Select>
                ${helperText ? `<FormHelperText>${helperText}</FormHelperText>` : ''}
            </FormControl>
        `
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        if (event.type === 'change') {
            // Update the defaultValue property when selection changes
            this.logger.debug(`SelectInput ${this.label} changed:`, event.payload)
            
            // Find and update the defaultValue property
            const valueIndex = this.properties.findIndex(prop => prop.name === 'defaultValue')
            if (valueIndex !== -1 && event.payload && event.payload.value !== undefined) {
                this.properties[valueIndex].value = event.payload.value
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
     * Returns cache key for the component (for optimizing rendering)
     */
    getCacheKey(): string {
        return `select_${this.label}_${JSON.stringify(this.properties)}`
    }

    /**
     * Returns queue options for async operations
     */
    getQueueOptions(): { priority: number, attempts: number } {
        return { priority: 1, attempts: 1 }
    }
}

module.exports = { nodeClass: SelectInput } 