import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

// Extended interface to support select options
interface UINodePropertyWithOptions extends UINodeProperty {
    options?: Array<{ label: string, value: string }>
}

/**
 * Button component for user interactions
 */
class Button extends UINodeBase {
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'text',
                type: 'string',
                value: 'Button',
                description: 'Text content of the button',
                required: true
            },
            {
                name: 'variant',
                type: 'select',
                value: 'contained',
                description: 'Visual style variant of the button',
                required: false
            } as UINodeProperty,
            {
                name: 'color',
                type: 'select',
                value: 'primary',
                description: 'Color theme of the button',
                required: false
            } as UINodeProperty,
            {
                name: 'size',
                type: 'select',
                value: 'medium',
                description: 'Size of the button',
                required: false
            } as UINodeProperty,
            {
                name: 'disabled',
                type: 'boolean',
                value: false,
                description: 'Whether the button is disabled',
                required: false
            },
            {
                name: 'fullWidth',
                type: 'boolean',
                value: false,
                description: 'Whether the button should take full width',
                required: false
            },
            {
                name: 'startIcon',
                type: 'string',
                value: '',
                description: 'Icon name to display before text (Material Icons)',
                required: false
            },
            {
                name: 'endIcon',
                type: 'string',
                value: '',
                description: 'Icon name to display after text (Material Icons)',
                required: false
            },
            {
                name: 'href',
                type: 'string',
                value: '',
                description: 'URL for button to navigate to (turns button into a link)',
                required: false
            },
            {
                name: 'target',
                type: 'select',
                value: '_self',
                description: 'Target for navigation (when href is set)',
                required: false
            } as UINodeProperty,
            {
                name: 'actionId',
                type: 'string',
                value: '',
                description: 'Identifier for action to trigger on click',
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
            { label: 'Warning', value: 'warning' },
            { label: 'Inherit', value: 'inherit' }
        ])

        this.addOptionsToProperty('size', [
            { label: 'Small', value: 'small' },
            { label: 'Medium', value: 'medium' },
            { label: 'Large', value: 'large' }
        ])

        this.addOptionsToProperty('target', [
            { label: 'Same Window', value: '_self' },
            { label: 'New Window', value: '_blank' },
            { label: 'Parent Frame', value: '_parent' },
            { label: 'Top Frame', value: '_top' }
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
     * Renders the button as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const text = this.getPropertyValue('text') || 'Button'
        const variant = this.getPropertyValue('variant') || 'contained'
        const color = this.getPropertyValue('color') || 'primary'
        const size = this.getPropertyValue('size') || 'medium'
        const disabled = this.getPropertyValue('disabled') || false
        const fullWidth = this.getPropertyValue('fullWidth') || false
        const startIcon = this.getPropertyValue('startIcon') || ''
        const endIcon = this.getPropertyValue('endIcon') || ''
        const href = this.getPropertyValue('href') || ''
        const target = this.getPropertyValue('target') || '_self'
        const actionId = this.getPropertyValue('actionId') || ''

        // Handle icons
        const startIconJSX = startIcon ? `startIcon={<Icon>${startIcon}</Icon>}` : ''
        const endIconJSX = endIcon ? `endIcon={<Icon>${endIcon}</Icon>}` : ''
        
        // Prepare onClick handler
        let onClickHandler = ''
        if (actionId) {
            onClickHandler = `onClick={(event) => {
                event.preventDefault();
                // Trigger the action with the specified ID
                if (window.triggerAction) {
                    window.triggerAction('${actionId}', {});
                }
            }}`
        }

        // Create the Material-UI compatible Button component
        return `
            <Button
                variant="${variant}"
                color="${color}"
                size="${size}"
                disabled={${disabled}}
                fullWidth={${fullWidth}}
                ${startIconJSX}
                ${endIconJSX}
                ${href ? `href="${href}" target="${target}"` : ''}
                ${onClickHandler}
            >
                ${text}
            </Button>
        `
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        if (event.type === 'click') {
            // Handle click event
            this.logger.debug(`Button ${this.label} clicked with payload:`, event.payload)
            
            // Get action ID if any
            const actionId = this.getPropertyValue('actionId')
            if (actionId) {
                // In a real implementation, this would trigger the action
                this.logger.debug(`Triggering action: ${actionId}`)
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
        return `button_${this.label}_${JSON.stringify(this.properties)}`
    }

    /**
     * Returns queue options for async operations
     */
    getQueueOptions(): { priority: number, attempts: number } {
        return { priority: 1, attempts: 1 }
    }
}

module.exports = { nodeClass: Button } 