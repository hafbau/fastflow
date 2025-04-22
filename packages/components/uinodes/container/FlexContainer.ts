import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

// Extended interface to support select options
interface UINodePropertyWithOptions extends UINodeProperty {
    options?: Array<{ label: string, value: string }>
}

/**
 * FlexContainer component that allows flexible layout of child components
 */
class FlexContainer extends UINodeBase {
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'direction',
                type: 'select',
                value: 'row',
                description: 'The flex direction of the container',
                required: false
            } as UINodeProperty,
            {
                name: 'wrap',
                type: 'select',
                value: 'nowrap',
                description: 'Whether the flex container should wrap its children',
                required: false
            } as UINodeProperty,
            {
                name: 'justifyContent',
                type: 'select',
                value: 'flex-start',
                description: 'How to align the content along the main axis',
                required: false
            } as UINodeProperty,
            {
                name: 'alignItems',
                type: 'select',
                value: 'stretch',
                description: 'How to align the items along the cross axis',
                required: false
            } as UINodeProperty,
            {
                name: 'gap',
                type: 'number',
                value: 0,
                description: 'Gap between child elements (in pixels)',
                required: false
            },
            {
                name: 'padding',
                type: 'string',
                value: '0',
                description: 'Padding inside the container (CSS shorthand format)',
                required: false
            },
            {
                name: 'margin',
                type: 'string',
                value: '0',
                description: 'Margin around the container (CSS shorthand format)',
                required: false
            },
            {
                name: 'height',
                type: 'string',
                value: 'auto',
                description: 'Height of the container (auto, 100%, or specific px value)',
                required: false
            },
            {
                name: 'width',
                type: 'string',
                value: '100%',
                description: 'Width of the container (auto, 100%, or specific px value)',
                required: false
            },
            {
                name: 'backgroundColor',
                type: 'color',
                value: 'transparent',
                description: 'Background color of the container',
                required: false
            },
            {
                name: 'border',
                type: 'string',
                value: 'none',
                description: 'Border of the container (CSS shorthand format)',
                required: false
            },
            {
                name: 'borderRadius',
                type: 'string',
                value: '0',
                description: 'Border radius of the container (CSS shorthand format)',
                required: false
            }
        ]

        // Add options for select fields
        this.addOptionsToProperty('direction', [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
            { label: 'Row Reverse', value: 'row-reverse' },
            { label: 'Column Reverse', value: 'column-reverse' }
        ])

        this.addOptionsToProperty('wrap', [
            { label: 'No Wrap', value: 'nowrap' },
            { label: 'Wrap', value: 'wrap' },
            { label: 'Wrap Reverse', value: 'wrap-reverse' }
        ])

        this.addOptionsToProperty('justifyContent', [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Space Between', value: 'space-between' },
            { label: 'Space Around', value: 'space-around' },
            { label: 'Space Evenly', value: 'space-evenly' }
        ])

        this.addOptionsToProperty('alignItems', [
            { label: 'Start', value: 'flex-start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'flex-end' },
            { label: 'Stretch', value: 'stretch' },
            { label: 'Baseline', value: 'baseline' }
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
     * Renders the flex container as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const direction = this.getPropertyValue('direction') || 'row'
        const wrap = this.getPropertyValue('wrap') || 'nowrap'
        const justifyContent = this.getPropertyValue('justifyContent') || 'flex-start'
        const alignItems = this.getPropertyValue('alignItems') || 'stretch'
        const gap = this.getPropertyValue('gap') || 0
        const padding = this.getPropertyValue('padding') || '0'
        const margin = this.getPropertyValue('margin') || '0'
        const height = this.getPropertyValue('height') || 'auto'
        const width = this.getPropertyValue('width') || '100%'
        const backgroundColor = this.getPropertyValue('backgroundColor') || 'transparent'
        const border = this.getPropertyValue('border') || 'none'
        const borderRadius = this.getPropertyValue('borderRadius') || '0'

        // Create the Material-UI compatible Box component
        return `
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: '${direction}',
                    flexWrap: '${wrap}',
                    justifyContent: '${justifyContent}',
                    alignItems: '${alignItems}',
                    gap: ${gap},
                    padding: '${padding}',
                    margin: '${margin}',
                    height: '${height}',
                    width: '${width}',
                    backgroundColor: '${backgroundColor}',
                    border: '${border}',
                    borderRadius: '${borderRadius}'
                }}
            >
                {children}
            </Box>
        `
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        // For basic container, we might not need event handling beyond defaults
        this.logger.debug(`FlexContainer received event: ${event.type}`)
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
        return `flex_container_${this.label}_${JSON.stringify(this.properties)}`
    }

    /**
     * Returns queue options for async operations
     */
    getQueueOptions(): { priority: number, attempts: number } {
        return { priority: 1, attempts: 1 }
    }
}

module.exports = { nodeClass: FlexContainer } 