import { INode, INodeData, ICommonObject } from './Interface'

/**
 * Interface for UI-specific events that can be handled by UI nodes
 */
export interface UIEvent {
    type: string
    payload: ICommonObject
}

/**
 * Interface for UI node properties that can be configured
 */
export interface UINodeProperty {
    name: string
    type: string
    value: any
    description?: string
    required?: boolean
}

/**
 * Interface for UI nodes, extending the base INode interface
 */
export interface IUINode extends INode {
    /**
     * Renders the component associated with this node
     * @returns JSX element or string representation of the component
     */
    renderComponent(): Promise<string>

    /**
     * Handles UI events triggered on this node
     * @param event The UI event to handle
     */
    handleEvent(event: UIEvent): Promise<void>

    /**
     * Gets the configurable properties of this node
     * @returns Array of UINodeProperty objects
     */
    getProperties(): UINodeProperty[]

    /**
     * Optional method to handle caching of node data
     */
    cache?(): Promise<void>

    /**
     * Optional method to handle queueing of node operations
     */
    queue?(): Promise<void>
}

/**
 * Base class for UI nodes implementing the IUINode interface
 */
export abstract class UINodeBase implements IUINode {
    id: string
    label: string
    name: string
    type: string
    icon: string
    version: number
    category: string
    baseClasses: string[]
    description?: string
    filePath?: string
    badge?: string
    deprecateMessage?: string
    hideOutput?: boolean
    author?: string
    documentation?: string
    tags?: string[]

    protected logger: Console = console
    protected properties: UINodeProperty[] = []

    constructor(nodeData: INodeData) {
        this.id = nodeData.id
        this.label = nodeData.label
        this.name = nodeData.name
        this.type = nodeData.type
        this.icon = nodeData.icon
        this.version = nodeData.version
        this.category = nodeData.category
        this.baseClasses = nodeData.baseClasses
        this.description = nodeData.description
        this.filePath = nodeData.filePath
        this.badge = nodeData.badge
        this.deprecateMessage = nodeData.deprecateMessage
        this.hideOutput = nodeData.hideOutput
        this.author = nodeData.author
        this.documentation = nodeData.documentation
        this.tags = nodeData.tags
    }

    /**
     * Abstract method to render the component
     */
    abstract renderComponent(): Promise<string>

    /**
     * Default event handler that can be overridden by child classes
     */
    async handleEvent(event: UIEvent): Promise<void> {
        this.logger.debug(`Handling event ${event.type} with payload:`, event.payload)
    }

    /**
     * Returns the node's configurable properties
     */
    getProperties(): UINodeProperty[] {
        return this.properties
    }

    /**
     * Protected method to add a property to the node
     */
    protected addProperty(property: UINodeProperty): void {
        this.properties.push(property)
    }

    /**
     * Protected method for error handling
     */
    protected handleError(error: Error, context: string): void {
        this.logger.error(`Error in ${context}:`, error)
        throw error
    }

    /**
     * Protected method for performance monitoring
     */
    protected async measurePerformance<T>(
        operation: () => Promise<T>,
        operationName: string
    ): Promise<T> {
        const start = performance.now()
        try {
            return await operation()
        } finally {
            const duration = performance.now() - start
            this.logger.debug(`${operationName} took ${duration}ms`)
        }
    }
} 