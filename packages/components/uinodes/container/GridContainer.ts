import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

// Extended interface to support select options
interface UINodePropertyWithOptions extends UINodeProperty {
    options?: Array<{ label: string, value: string }>
}

/**
 * GridContainer component that enables grid-based layout of child components
 */
class GridContainer extends UINodeBase {
    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'columns',
                type: 'number',
                value: 3,
                description: 'Number of columns in the grid',
                required: false
            },
            {
                name: 'rows',
                type: 'number',
                value: 0,
                description: 'Number of rows in the grid (0 for auto)',
                required: false
            },
            {
                name: 'columnGap',
                type: 'number',
                value: 2,
                description: 'Gap between columns (in pixels)',
                required: false
            },
            {
                name: 'rowGap',
                type: 'number',
                value: 2,
                description: 'Gap between rows (in pixels)',
                required: false
            },
            {
                name: 'autoFlow',
                type: 'select',
                value: 'row',
                description: 'Direction of auto-placement algorithm',
                required: false
            } as UINodeProperty,
            {
                name: 'justifyItems',
                type: 'select',
                value: 'stretch',
                description: 'Default justification of grid items',
                required: false
            } as UINodeProperty,
            {
                name: 'alignItems',
                type: 'select',
                value: 'stretch',
                description: 'Default alignment of grid items',
                required: false
            } as UINodeProperty,
            {
                name: 'templateColumns',
                type: 'string',
                value: '',
                description: 'CSS grid-template-columns value (overrides columns if set)',
                required: false
            },
            {
                name: 'templateRows',
                type: 'string',
                value: '',
                description: 'CSS grid-template-rows value (overrides rows if set)',
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
        this.addOptionsToProperty('autoFlow', [
            { label: 'Row', value: 'row' },
            { label: 'Column', value: 'column' },
            { label: 'Row Dense', value: 'row dense' },
            { label: 'Column Dense', value: 'column dense' }
        ])

        this.addOptionsToProperty('justifyItems', [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' }
        ])

        this.addOptionsToProperty('alignItems', [
            { label: 'Start', value: 'start' },
            { label: 'Center', value: 'center' },
            { label: 'End', value: 'end' },
            { label: 'Stretch', value: 'stretch' }
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
     * Renders the grid container as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const columns = this.getPropertyValue('columns') || 3
        const rows = this.getPropertyValue('rows') || 0
        const columnGap = this.getPropertyValue('columnGap') || 2
        const rowGap = this.getPropertyValue('rowGap') || 2
        const autoFlow = this.getPropertyValue('autoFlow') || 'row'
        const justifyItems = this.getPropertyValue('justifyItems') || 'stretch'
        const alignItems = this.getPropertyValue('alignItems') || 'stretch'
        const templateColumns = this.getPropertyValue('templateColumns') || ''
        const templateRows = this.getPropertyValue('templateRows') || ''
        const padding = this.getPropertyValue('padding') || '0'
        const margin = this.getPropertyValue('margin') || '0'
        const height = this.getPropertyValue('height') || 'auto'
        const width = this.getPropertyValue('width') || '100%'
        const backgroundColor = this.getPropertyValue('backgroundColor') || 'transparent'
        const border = this.getPropertyValue('border') || 'none'
        const borderRadius = this.getPropertyValue('borderRadius') || '0'

        // Determine grid template values
        const gridTemplateColumns = templateColumns || `repeat(${columns}, 1fr)`
        const gridTemplateRows = templateRows || (rows > 0 ? `repeat(${rows}, 1fr)` : 'auto')

        // Create the Material-UI compatible Box component with grid display
        return `
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '${gridTemplateColumns}',
                    gridTemplateRows: '${gridTemplateRows}',
                    gridColumnGap: ${columnGap},
                    gridRowGap: ${rowGap},
                    gridAutoFlow: '${autoFlow}',
                    justifyItems: '${justifyItems}',
                    alignItems: '${alignItems}',
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
        this.logger.debug(`GridContainer received event: ${event.type}`)
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
        return `grid_container_${this.label}_${JSON.stringify(this.properties)}`
    }

    /**
     * Returns queue options for async operations
     */
    getQueueOptions(): { priority: number, attempts: number } {
        return { priority: 1, attempts: 1 }
    }
}

module.exports = { nodeClass: GridContainer } 