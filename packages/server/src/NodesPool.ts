import { IComponentNodes, IComponentCredentials, IComponentUINodes, IUINode } from './Interface'
import path from 'path'
import { Dirent } from 'fs'
import { getNodeModulesPackagePath } from './utils'
import { promises } from 'fs'
import { ICommonObject } from 'fastflow-components'
import logger from './utils/logger'
import { appConfig } from './AppConfig'

// UI component categories
export const UI_CATEGORIES = {
    CONTAINER: 'Container',
    FORM: 'Form',
    DISPLAY: 'Display',
    ACTION: 'Action'
} as const

export type UICategory = typeof UI_CATEGORIES[keyof typeof UI_CATEGORIES]

export class NodesPool {
    componentNodes: IComponentNodes = {}
    componentUINodes: IComponentUINodes = {}
    componentCredentials: IComponentCredentials = {}
    private credentialIconPath: ICommonObject = {}

    /**
     * Initialize to get all nodes & credentials
     */
    async initialize() {
        await this.initializeNodes()
        await this.initializeUINodes()
        await this.initializeCredentials()
    }

    /**
     * Initialize nodes
     */
    private async initializeNodes() {
        const disabled_nodes = process.env.DISABLED_NODES ? process.env.DISABLED_NODES.split(',') : []
        const packagePath = getNodeModulesPackagePath('fastflow-components')
        const nodesPath = path.join(packagePath, 'dist', 'nodes')
        const nodeFiles = await this.getFiles(nodesPath)
        return Promise.all(
            nodeFiles.map(async (file) => {
                if (file.endsWith('.js')) {
                    try {
                        const nodeModule = await require(file)

                        if (nodeModule.nodeClass) {
                            const newNodeInstance = new nodeModule.nodeClass()
                            newNodeInstance.filePath = file

                            // Replace file icon with absolute path
                            if (
                                newNodeInstance.icon &&
                                (newNodeInstance.icon.endsWith('.svg') ||
                                    newNodeInstance.icon.endsWith('.png') ||
                                    newNodeInstance.icon.endsWith('.jpg'))
                            ) {
                                const filePath = file.replace(/\\/g, '/').split('/')
                                filePath.pop()
                                const nodeIconAbsolutePath = `${filePath.join('/')}/${newNodeInstance.icon}`
                                newNodeInstance.icon = nodeIconAbsolutePath

                                // Store icon path for componentCredentials
                                if (newNodeInstance.credential) {
                                    for (const credName of newNodeInstance.credential.credentialNames) {
                                        this.credentialIconPath[credName] = nodeIconAbsolutePath
                                    }
                                }
                            }

                            const skipCategories = ['Analytic', 'SpeechToText']
                            const conditionOne = !skipCategories.includes(newNodeInstance.category)

                            const isCommunityNodesAllowed = appConfig.showCommunityNodes
                            const isAuthorPresent = newNodeInstance.author
                            let conditionTwo = true
                            if (!isCommunityNodesAllowed && isAuthorPresent) conditionTwo = false

                            const isDisabled = disabled_nodes.includes(newNodeInstance.name)

                            if (conditionOne && conditionTwo && !isDisabled) {
                                this.componentNodes[newNodeInstance.name] = newNodeInstance
                            }
                        }
                    } catch (err) {
                        logger.error(`❌ [server]: Error during initDatabase with file ${file}:`, err)
                    }
                }
            })
        )
    }

    /**
     * Initialize UI nodes
     */
    private async initializeUINodes() {
        const disabled_nodes = process.env.DISABLED_UI_NODES ? process.env.DISABLED_UI_NODES.split(',') : []
        const packagePath = getNodeModulesPackagePath('fastflow-components')
        const uiNodesPath = path.join(packagePath, 'dist', 'ui')
        
        try {
            const uiNodeFiles = await this.getFiles(uiNodesPath)
            return Promise.all(
                uiNodeFiles.map(async (file) => {
                    if (file.endsWith('.js')) {
                        try {
                            const nodeModule = await require(file)

                            if (nodeModule.uiNodeClass) {
                                const newNodeInstance = new nodeModule.uiNodeClass()
                                newNodeInstance.filePath = file

                                // Replace file icon with absolute path
                                if (
                                    newNodeInstance.icon &&
                                    (newNodeInstance.icon.endsWith('.svg') ||
                                        newNodeInstance.icon.endsWith('.png') ||
                                        newNodeInstance.icon.endsWith('.jpg'))
                                ) {
                                    const filePath = file.replace(/\\/g, '/').split('/')
                                    filePath.pop()
                                    const nodeIconAbsolutePath = `${filePath.join('/')}/${newNodeInstance.icon}`
                                    newNodeInstance.icon = nodeIconAbsolutePath
                                }

                                // Get UI component categories: Container, Form, Display, Action
                                const uiCategories = Object.values(UI_CATEGORIES)
                                const isValidCategory = uiCategories.includes(newNodeInstance.category as UICategory)

                                const isCommunityNodesAllowed = appConfig.showCommunityNodes
                                const isAuthorPresent = newNodeInstance.author
                                let communityCheck = true
                                if (!isCommunityNodesAllowed && isAuthorPresent) communityCheck = false

                                const isDisabled = disabled_nodes.includes(newNodeInstance.name)

                                if (isValidCategory && communityCheck && !isDisabled) {
                                    this.componentUINodes[newNodeInstance.name] = newNodeInstance
                                }
                            }
                        } catch (err) {
                            logger.error(`❌ [server]: Error loading UI node from file ${file}:`, err)
                        }
                    }
                })
            )
        } catch (error: any) {
            // It's okay if ui directory doesn't exist yet
            if (error.code !== 'ENOENT') {
                logger.error(`❌ [server]: Error during initializeUINodes:`, error)
            }
            return Promise.resolve()
        }
    }

    /**
     * Initialize credentials
     */
    private async initializeCredentials() {
        const packagePath = getNodeModulesPackagePath('fastflow-components')
        const nodesPath = path.join(packagePath, 'dist', 'credentials')
        const nodeFiles = await this.getFiles(nodesPath)
        return Promise.all(
            nodeFiles.map(async (file) => {
                if (file.endsWith('.credential.js')) {
                    const credentialModule = await require(file)
                    if (credentialModule.credClass) {
                        const newCredInstance = new credentialModule.credClass()
                        newCredInstance.icon = this.credentialIconPath[newCredInstance.name] ?? ''
                        this.componentCredentials[newCredInstance.name] = newCredInstance
                    }
                }
            })
        )
    }

    /**
     * Register a UI node from a database entry
     * @param {string} name The name of the UI component
     * @param {any} componentData The component data from the database
     * @returns {IUINode | undefined} The registered UI node or undefined if registration fails
     */
    registerUINode(name: string, componentData: any): IUINode | undefined {
        try {
            // Basic validation
            if (!name || !componentData || !componentData.type || !componentData.category) {
                logger.error(`❌ [server]: Invalid UI component data for ${name}`)
                return undefined
            }

            // Validate category
            const uiCategories = Object.values(UI_CATEGORIES)
            if (!uiCategories.includes(componentData.category)) {
                logger.error(`❌ [server]: Invalid category '${componentData.category}' for UI component ${name}`)
                return undefined
            }

            // Create a basic UI node implementation from the component data
            const uiNode: IUINode = {
                label: componentData.name,
                name: name,
                type: componentData.type,
                category: componentData.category,
                icon: componentData.icon || '',
                version: 1,
                baseClasses: ['UINode'],
                description: componentData.description || '',
                renderComponent: async () => componentData.template || '',
                handleEvent: async () => {},
                getProperties: () => {
                    try {
                        return JSON.parse(componentData.schema || '[]')
                    } catch (error) {
                        logger.error(`❌ [server]: Error parsing schema for UI node ${name}:`, error)
                        return []
                    }
                },
                getCacheKey: () => `ui_${name}`,
                getQueueOptions: () => ({ priority: 1, attempts: 3 })
            }

            // Register the node
            this.componentUINodes[name] = uiNode
            return uiNode
        } catch (error) {
            logger.error(`❌ [server]: Error registering UI node ${name}:`, error)
            return undefined
        }
    }

    /**
     * Unregister a UI node
     * @param {string} name The name of the UI component to unregister
     * @returns {boolean} True if successfully unregistered, false otherwise
     */
    unregisterUINode(name: string): boolean {
        if (this.componentUINodes[name]) {
            delete this.componentUINodes[name]
            return true
        }
        return false
    }

    /**
     * Get UI nodes of a specific category
     * @param {UICategory} category The category to filter by
     * @returns {IComponentUINodes} Object containing UI nodes of the specified category
     */
    getUINodesByCategory(category: UICategory): IComponentUINodes {
        const result: IComponentUINodes = {}
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (node.category === category) {
                result[name] = node
            }
        }
        
        return result
    }

    /**
     * Get UI nodes grouped by category
     * @returns {Record<UICategory, IComponentUINodes>} Object with categories as keys and UI nodes as values
     */
    getUINodesGroupedByCategory(): Record<UICategory, IComponentUINodes> {
        const result: Record<UICategory, IComponentUINodes> = {
            [UI_CATEGORIES.CONTAINER]: {},
            [UI_CATEGORIES.FORM]: {},
            [UI_CATEGORIES.DISPLAY]: {},
            [UI_CATEGORIES.ACTION]: {}
        }
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            const category = node.category as UICategory
            if (Object.values(UI_CATEGORIES).includes(category)) {
                result[category][name] = node
            }
        }
        
        return result
    }

    /**
     * Get UI nodes by type
     * @param {string} type The component type to filter by
     * @returns {IComponentUINodes} Object containing UI nodes of the specified type
     */
    getUINodesByType(type: string): IComponentUINodes {
        const result: IComponentUINodes = {}
        
        for (const [name, node] of Object.entries(this.componentUINodes)) {
            if (node.type === type) {
                result[name] = node
            }
        }
        
        return result
    }

    /**
     * Create a UI node factory function for a specific component type
     * @param {string} type The component type to create a factory for
     * @returns {Function} A factory function that creates UI nodes of the specified type
     */
    createUINodeFactory(type: string): (name: string, data: any) => IUINode | undefined {
        return (name: string, componentData: any) => {
            // Ensure the type is set correctly
            const data = { ...componentData, type }
            return this.registerUINode(name, data)
        }
    }

    /**
     * Recursive function to get node files
     * @param {string} dir
     * @returns {string[]}
     */
    private async getFiles(dir: string): Promise<string[]> {
        const dirents = await promises.readdir(dir, { withFileTypes: true })
        const files = await Promise.all(
            dirents.map((dirent: Dirent) => {
                const res = path.resolve(dir, dirent.name)
                return dirent.isDirectory() ? this.getFiles(res) : res
            })
        )
        return Array.prototype.concat(...files)
    }
}
