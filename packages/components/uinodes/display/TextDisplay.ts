import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

/**
 * TextDisplay component for rendering text with various styling options
 * Includes caching support for improved performance
 */
class TextDisplay extends UINodeBase {
    // Cache for rendered components
    private static componentCache: Map<string, { html: string, timestamp: number }> = new Map()
    // Cache expiration time in milliseconds (default: 5 minutes)
    private static CACHE_EXPIRATION = 5 * 60 * 1000

    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'content',
                type: 'string',
                value: 'Text content',
                description: 'The text to display',
                required: true
            },
            {
                name: 'variant',
                type: 'select',
                value: 'body1',
                description: 'The Typography variant to use',
                required: false
            } as UINodeProperty,
            {
                name: 'align',
                type: 'select',
                value: 'left',
                description: 'Text alignment',
                required: false
            } as UINodeProperty,
            {
                name: 'color',
                type: 'string',
                value: '',
                description: 'Optional color (e.g., primary, secondary, or CSS color)',
                required: false
            },
            {
                name: 'gutterBottom',
                type: 'boolean',
                value: false,
                description: 'Add margin to the bottom',
                required: false
            },
            {
                name: 'noWrap',
                type: 'boolean',
                value: false,
                description: 'Prevent text wrapping',
                required: false
            },
            {
                name: 'paragraph',
                type: 'boolean',
                value: false,
                description: 'Apply paragraph styling',
                required: false
            },
            {
                name: 'customCSS',
                type: 'string',
                value: '',
                description: 'Custom CSS styles (in valid CSS syntax)',
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
            { label: 'h1', value: 'h1' },
            { label: 'h2', value: 'h2' },
            { label: 'h3', value: 'h3' },
            { label: 'h4', value: 'h4' },
            { label: 'h5', value: 'h5' },
            { label: 'h6', value: 'h6' },
            { label: 'subtitle1', value: 'subtitle1' },
            { label: 'subtitle2', value: 'subtitle2' },
            { label: 'body1', value: 'body1' },
            { label: 'body2', value: 'body2' },
            { label: 'caption', value: 'caption' },
            { label: 'button', value: 'button' },
            { label: 'overline', value: 'overline' }
        ])

        this.addOptionsToProperty('align', [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
            { label: 'Justify', value: 'justify' }
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
        for (const [key, entry] of TextDisplay.componentCache.entries()) {
            if (now - entry.timestamp > TextDisplay.CACHE_EXPIRATION) {
                TextDisplay.componentCache.delete(key)
            }
        }
    }

    /**
     * Gets a cached component if available and not expired
     */
    private getCachedComponent(cacheKey: string): string | null {
        const cachedEntry = TextDisplay.componentCache.get(cacheKey)
        if (!cachedEntry) return null
        
        // Check if entry is expired
        if (Date.now() - cachedEntry.timestamp > TextDisplay.CACHE_EXPIRATION) {
            TextDisplay.componentCache.delete(cacheKey)
            return null
        }
        
        return cachedEntry.html
    }

    /**
     * Caches a rendered component
     */
    private setCachedComponent(cacheKey: string, html: string): void {
        TextDisplay.componentCache.set(cacheKey, {
            html,
            timestamp: Date.now()
        })
    }

    /**
     * Renders the text display as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const content = this.getPropertyValue('content') || 'Text content'
        const variant = this.getPropertyValue('variant') || 'body1'
        const align = this.getPropertyValue('align') || 'left'
        const color = this.getPropertyValue('color') || undefined
        const gutterBottom = this.getPropertyValue('gutterBottom') || false
        const noWrap = this.getPropertyValue('noWrap') || false
        const paragraph = this.getPropertyValue('paragraph') || false
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
        
        // Build inline style from customCSS
        let inlineStyle = ''
        if (customCSS) {
            inlineStyle = ` style={${JSON.stringify(this.parseCSS(customCSS))}}`
        }
        
        // Create the Material-UI compatible Typography component
        const component = `
            <Typography
                variant="${variant}"
                align="${align}"
                ${color ? `color="${color}"` : ''}
                ${gutterBottom ? 'gutterBottom' : ''}
                ${noWrap ? 'noWrap' : ''}
                ${paragraph ? 'paragraph' : ''}${inlineStyle}
            >
                ${content}
            </Typography>
        `
        
        // Cache the component if caching is enabled
        if (cacheEnabled && cacheKey) {
            this.setCachedComponent(cacheKey, component)
        }
        
        return component
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

    /**
     * Returns cache key for the component (for optimizing rendering)
     */
    getCacheKey(): string {
        return `text_${this.id}_${JSON.stringify(this.properties)}`
    }
}

module.exports = { nodeClass: TextDisplay } 