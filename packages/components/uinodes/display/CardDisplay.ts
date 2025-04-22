import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

/**
 * CardDisplay component for displaying content in Material-UI card format
 * Includes caching support for improved performance
 */
class CardDisplay extends UINodeBase {
    // Cache for rendered components
    private static componentCache: Map<string, { html: string, timestamp: number }> = new Map()
    // Cache expiration time in milliseconds (default: 5 minutes)
    private static CACHE_EXPIRATION = 5 * 60 * 1000

    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'title',
                type: 'string',
                value: 'Card Title',
                description: 'Title of the card',
                required: false
            },
            {
                name: 'subtitle',
                type: 'string',
                value: '',
                description: 'Subtitle of the card',
                required: false
            },
            {
                name: 'content',
                type: 'string',
                value: 'Card content goes here',
                description: 'Text content of the card',
                required: false
            },
            {
                name: 'imageSrc',
                type: 'string',
                value: '',
                description: 'URL of the image to display at the top of the card',
                required: false
            },
            {
                name: 'imageAlt',
                type: 'string',
                value: 'Card image',
                description: 'Alternative text for the image',
                required: false
            },
            {
                name: 'imageHeight',
                type: 'string',
                value: '140',
                description: 'Height of the image (in pixels)',
                required: false
            },
            {
                name: 'variant',
                type: 'select',
                value: 'outlined',
                description: 'Card variant style',
                required: false
            } as UINodeProperty,
            {
                name: 'elevation',
                type: 'number',
                value: 1,
                description: 'Card elevation (shadow depth) when using the "elevation" variant',
                required: false
            },
            {
                name: 'width',
                type: 'string',
                value: '100%',
                description: 'Width of the card (pixels or percentage)',
                required: false
            },
            {
                name: 'minHeight',
                type: 'string',
                value: '',
                description: 'Minimum height of the card (pixels or percentage)',
                required: false
            },
            {
                name: 'actionArea',
                type: 'boolean',
                value: false,
                description: 'Whether to wrap the card in a clickable CardActionArea',
                required: false
            },
            {
                name: 'actionUrl',
                type: 'string',
                value: '',
                description: 'URL to navigate to when the card is clicked (if actionArea is true)',
                required: false
            },
            {
                name: 'actionButtons',
                type: 'json',
                value: '[]',
                description: 'Array of action buttons to display at the bottom of the card (format: [{label: "Button 1", color: "primary"}])',
                required: false
            },
            {
                name: 'customCSS',
                type: 'string',
                value: '',
                description: 'Custom CSS styles for the card (in valid CSS syntax)',
                required: false
            },
            {
                name: 'cacheKey',
                type: 'string',
                value: '',
                description: 'Optional custom cache key for this component',
                required: false
            },
            {
                name: 'cacheEnabled',
                type: 'boolean',
                value: true,
                description: 'Whether caching is enabled for this component',
                required: false
            }
        ]

        // Add options for select fields
        this.addOptionsToProperty('variant', [
            { label: 'Outlined', value: 'outlined' },
            { label: 'Elevation', value: 'elevation' }
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
     * Implementation of cache method required by IUINode interface
     * Cleans up expired cache entries
     */
    async cache(): Promise<void> {
        const now = Date.now()
        // Clean up expired cache entries
        for (const [key, entry] of CardDisplay.componentCache.entries()) {
            if (now - entry.timestamp > CardDisplay.CACHE_EXPIRATION) {
                CardDisplay.componentCache.delete(key)
            }
        }
    }

    /**
     * Gets a cached component if available and not expired
     */
    private getCachedComponent(cacheKey: string): string | null {
        const cachedEntry = CardDisplay.componentCache.get(cacheKey)
        if (!cachedEntry) return null
        
        // Check if entry is expired
        if (Date.now() - cachedEntry.timestamp > CardDisplay.CACHE_EXPIRATION) {
            CardDisplay.componentCache.delete(cacheKey)
            return null
        }
        
        return cachedEntry.html
    }

    /**
     * Caches a rendered component
     */
    private setCachedComponent(cacheKey: string, html: string): void {
        CardDisplay.componentCache.set(cacheKey, {
            html,
            timestamp: Date.now()
        })
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
     * Parse action buttons from JSON string
     */
    private parseActionButtons(jsonStr: string): Array<{ label: string, color?: string, variant?: string }> {
        try {
            return JSON.parse(jsonStr) || []
        } catch (error) {
            this.logger.error('Failed to parse action buttons:', error)
            return []
        }
    }

    /**
     * Renders the card display as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const title = this.getPropertyValue('title') || ''
        const subtitle = this.getPropertyValue('subtitle') || ''
        const content = this.getPropertyValue('content') || ''
        const imageSrc = this.getPropertyValue('imageSrc') || ''
        const imageAlt = this.getPropertyValue('imageAlt') || 'Card image'
        const imageHeight = this.getPropertyValue('imageHeight') || '140'
        const variant = this.getPropertyValue('variant') || 'outlined'
        const elevation = this.getPropertyValue('elevation') || 1
        const width = this.getPropertyValue('width') || '100%'
        const minHeight = this.getPropertyValue('minHeight') || ''
        const actionArea = this.getPropertyValue('actionArea') || false
        const actionUrl = this.getPropertyValue('actionUrl') || ''
        const actionButtonsJson = this.getPropertyValue('actionButtons') || '[]'
        const customCSS = this.getPropertyValue('customCSS') || ''
        const cacheEnabled = this.getPropertyValue('cacheEnabled') ?? true
        let cacheKey = this.getPropertyValue('cacheKey') || ''
        
        // If caching is enabled, check the cache first
        if (cacheEnabled) {
            // Generate a cache key if not provided
            if (!cacheKey) {
                cacheKey = this.getCacheKey()
            }
            
            const cachedComponent = this.getCachedComponent(cacheKey)
            if (cachedComponent) {
                return cachedComponent
            }
        }
        
        // Build style object
        const styles: Record<string, string> = {
            width: width
        }
        
        if (minHeight) {
            styles.minHeight = minHeight
        }
        
        // Add custom CSS
        if (customCSS) {
            Object.assign(styles, this.parseCSS(customCSS))
        }
        
        // Parse action buttons
        const actionButtons = this.parseActionButtons(actionButtonsJson)
        
        // Build the card component
        let component = `
            <Card
                variant="${variant}"
                ${variant === 'elevation' ? `elevation={${elevation}}` : ''}
                sx={${JSON.stringify(styles)}}
            >
        `
        
        // Wrap in CardActionArea if needed
        if (actionArea) {
            component += `
                <CardActionArea
                    ${actionUrl ? `
                    component="a"
                    href="${actionUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    ` : ''}
                    onClick={(event) => {
                        if (window.handleUINodeEvent) {
                            window.handleUINodeEvent('${this.id}', {
                                type: 'click',
                                name: 'card',
                                value: { id: '${this.id}', title: '${title}' }
                            });
                        }
                    }}
                >
            `
        }
        
        // Add image if provided
        if (imageSrc) {
            component += `
                <CardMedia
                    component="img"
                    height="${imageHeight}"
                    image="${imageSrc}"
                    alt="${imageAlt}"
                />
            `
        }
        
        // Add title and subtitle if provided
        if (title || subtitle) {
            component += `
                <CardHeader
                    ${title ? `title="${title}"` : ''}
                    ${subtitle ? `subheader="${subtitle}"` : ''}
                />
            `
        }
        
        // Add content if provided
        if (content) {
            component += `
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        ${content}
                    </Typography>
                </CardContent>
            `
        }
        
        // Close CardActionArea if needed
        if (actionArea) {
            component += `
                </CardActionArea>
            `
        }
        
        // Add action buttons if provided
        if (actionButtons.length > 0) {
            component += `
                <CardActions>
            `
            
            actionButtons.forEach((button, index) => {
                component += `
                    <Button 
                        size="small" 
                        color="${button.color || 'primary'}"
                        variant="${button.variant || 'text'}"
                        onClick={(event) => {
                            if (window.handleUINodeEvent) {
                                window.handleUINodeEvent('${this.id}', {
                                    type: 'buttonClick',
                                    name: 'cardButton',
                                    value: { 
                                        buttonIndex: ${index},
                                        buttonLabel: '${button.label}',
                                        cardId: '${this.id}'
                                    }
                                });
                            }
                        }}
                    >
                        ${button.label}
                    </Button>
                `
            })
            
            component += `
                </CardActions>
            `
        }
        
        // Close the card
        component += `
            </Card>
        `
        
        // Cache the component if caching is enabled
        if (cacheEnabled && cacheKey) {
            this.setCachedComponent(cacheKey, component)
        }
        
        return component
    }

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    async handleEvent(event: UIEvent): Promise<void> {
        if (event.type === 'click') {
            this.logger.debug(`CardDisplay ${this.label} clicked:`, event.payload)
        } else if (event.type === 'buttonClick') {
            this.logger.debug(`CardDisplay ${this.label} button clicked:`, event.payload)
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
        return `card_${this.id}_${JSON.stringify(this.properties)}`
    }
}

module.exports = { nodeClass: CardDisplay } 