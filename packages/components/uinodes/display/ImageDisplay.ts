import { INodeData, ICommonObject } from '../../src/Interface'
import { UINodeBase, UIEvent, UINodeProperty } from '../../src/UIInterface'

/**
 * ImageDisplay component for rendering images with various display options
 * Includes caching support for improved performance
 */
class ImageDisplay extends UINodeBase {
    // Cache for rendered components
    private static componentCache: Map<string, { html: string, timestamp: number }> = new Map()
    // Cache expiration time in milliseconds (default: 10 minutes)
    private static CACHE_EXPIRATION = 10 * 60 * 1000

    constructor(nodeData: INodeData) {
        super(nodeData)
        // Set default properties
        this.properties = [
            {
                name: 'src',
                type: 'string',
                value: '',
                description: 'The URL of the image to display',
                required: true
            },
            {
                name: 'alt',
                type: 'string',
                value: 'Image',
                description: 'Alternative text for the image',
                required: true
            },
            {
                name: 'width',
                type: 'string',
                value: '100%',
                description: 'Width of the image (pixels or percentage)',
                required: false
            },
            {
                name: 'height',
                type: 'string',
                value: 'auto',
                description: 'Height of the image (pixels or auto)',
                required: false
            },
            {
                name: 'variant',
                type: 'select',
                value: 'default',
                description: 'Image display variant',
                required: false
            } as UINodeProperty,
            {
                name: 'alignCenter',
                type: 'boolean',
                value: false,
                description: 'Center the image horizontally',
                required: false
            },
            {
                name: 'borderRadius',
                type: 'string',
                value: '0',
                description: 'Border radius (e.g., 4px, 50%)',
                required: false
            },
            {
                name: 'boxShadow',
                type: 'boolean',
                value: false,
                description: 'Apply a subtle box shadow',
                required: false
            },
            {
                name: 'clickable',
                type: 'boolean',
                value: false,
                description: 'Make the image clickable',
                required: false
            },
            {
                name: 'targetUrl',
                type: 'string',
                value: '',
                description: 'URL to navigate to when clicked (if clickable)',
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
            },
            {
                name: 'lazyLoad',
                type: 'boolean',
                value: true,
                description: 'Enable lazy loading for the image',
                required: false
            }
        ]

        // Add options for select fields
        this.addOptionsToProperty('variant', [
            { label: 'Default', value: 'default' },
            { label: 'Rounded', value: 'rounded' },
            { label: 'Circular', value: 'circular' },
            { label: 'Square', value: 'square' }
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
        for (const [key, entry] of ImageDisplay.componentCache.entries()) {
            if (now - entry.timestamp > ImageDisplay.CACHE_EXPIRATION) {
                ImageDisplay.componentCache.delete(key)
            }
        }
    }

    /**
     * Gets a cached component if available and not expired
     */
    private getCachedComponent(cacheKey: string): string | null {
        const cachedEntry = ImageDisplay.componentCache.get(cacheKey)
        if (!cachedEntry) return null
        
        // Check if entry is expired
        if (Date.now() - cachedEntry.timestamp > ImageDisplay.CACHE_EXPIRATION) {
            ImageDisplay.componentCache.delete(cacheKey)
            return null
        }
        
        return cachedEntry.html
    }

    /**
     * Caches a rendered component
     */
    private setCachedComponent(cacheKey: string, html: string): void {
        ImageDisplay.componentCache.set(cacheKey, {
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
     * Renders the image display as Material-UI compatible JSX
     */
    async renderComponent(): Promise<string> {
        // Get property values with defaults
        const src = this.getPropertyValue('src') || ''
        const alt = this.getPropertyValue('alt') || 'Image'
        const width = this.getPropertyValue('width') || '100%'
        const height = this.getPropertyValue('height') || 'auto'
        const variant = this.getPropertyValue('variant') || 'default'
        const alignCenter = this.getPropertyValue('alignCenter') || false
        const borderRadius = this.getPropertyValue('borderRadius') || '0'
        const boxShadow = this.getPropertyValue('boxShadow') || false
        const clickable = this.getPropertyValue('clickable') || false
        const targetUrl = this.getPropertyValue('targetUrl') || ''
        const customCSS = this.getPropertyValue('customCSS') || ''
        const cacheEnabled = this.getPropertyValue('cacheEnabled') ?? true
        const lazyLoad = this.getPropertyValue('lazyLoad') ?? true
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
            width: width,
            height: height
        }
        
        // Add variant-specific styles
        if (variant === 'rounded') {
            styles.borderRadius = '8px'
        } else if (variant === 'circular') {
            styles.borderRadius = '50%'
        } else if (variant === 'square') {
            styles.borderRadius = '0'
        }
        
        // Add optional styles
        if (borderRadius && variant === 'default') {
            styles.borderRadius = borderRadius
        }
        
        if (boxShadow) {
            styles.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)'
        }
        
        // Add custom CSS
        if (customCSS) {
            Object.assign(styles, this.parseCSS(customCSS))
        }
        
        // Convert styles to inline style string
        const styleStr = JSON.stringify(styles)
        
        // Create container div if image needs to be centered
        let component = ''
        if (alignCenter) {
            component = `
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%'
                    }}
                >
            `
        }
        
        // Create image element
        if (clickable && targetUrl) {
            component += `
                <a 
                    href="${targetUrl}" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ display: 'inline-block' }}
                >
                    <img
                        src="${src}"
                        alt="${alt}"
                        style={${styleStr}}
                        ${lazyLoad ? 'loading="lazy"' : ''}
                        onClick={(event) => {
                            if (window.handleUINodeEvent) {
                                window.handleUINodeEvent('${this.id}', {
                                    type: 'click',
                                    name: 'image',
                                    value: { src: '${src}' }
                                });
                            }
                        }}
                    />
                </a>
            `
        } else {
            component += `
                <img
                    src="${src}"
                    alt="${alt}"
                    style={${styleStr}}
                    ${lazyLoad ? 'loading="lazy"' : ''}
                    ${clickable ? `
                    onClick={(event) => {
                        if (window.handleUINodeEvent) {
                            window.handleUINodeEvent('${this.id}', {
                                type: 'click',
                                name: 'image',
                                value: { src: '${src}' }
                            });
                        }
                    }}` : ''}
                />
            `
        }
        
        // Close container div if image is centered
        if (alignCenter) {
            component += `
                </Box>
            `
        }
        
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
            this.logger.debug(`ImageDisplay ${this.label} clicked:`, event.payload)
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
        return `image_${this.id}_${JSON.stringify(this.properties)}`
    }
}

module.exports = { nodeClass: ImageDisplay } 