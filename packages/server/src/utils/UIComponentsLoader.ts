import { DataSource, Repository } from 'typeorm'
import { NodesPool, UI_CATEGORIES, UICategory } from '../NodesPool'
import { UIComponent } from '../database/entities/UIComponent'
import logger from './logger'

/**
 * Utility class to load UI components from the database into the NodesPool
 */
export class UIComponentsLoader {
    private repository: Repository<UIComponent>
    private nodesPool: NodesPool

    /**
     * Create a new UIComponentsLoader
     * @param {DataSource} dataSource The TypeORM data source
     * @param {NodesPool} nodesPool The NodesPool instance to populate
     */
    constructor(dataSource: DataSource, nodesPool: NodesPool) {
        this.repository = dataSource.getRepository(UIComponent)
        this.nodesPool = nodesPool
    }

    /**
     * Load all UI components from the database into the NodesPool
     * @returns {Promise<number>} The number of components loaded
     */
    async loadAllComponents(): Promise<number> {
        try {
            const components = await this.repository.find()
            let loadedCount = 0

            for (const component of components) {
                const result = this.nodesPool.registerUINode(component.name, component)
                if (result) {
                    loadedCount++
                }
            }

            logger.info(`✅ [server]: Loaded ${loadedCount} UI components from database`)
            return loadedCount
        } catch (error) {
            logger.error('❌ [server]: Error loading UI components from database:', error)
            return 0
        }
    }

    /**
     * Load UI components of a specific category from the database into the NodesPool
     * @param {UICategory} category The category to load
     * @returns {Promise<number>} The number of components loaded
     */
    async loadComponentsByCategory(category: UICategory): Promise<number> {
        try {
            const components = await this.repository.find({ where: { category } })
            let loadedCount = 0

            for (const component of components) {
                const result = this.nodesPool.registerUINode(component.name, component)
                if (result) {
                    loadedCount++
                }
            }

            logger.info(`✅ [server]: Loaded ${loadedCount} UI components of category '${category}' from database`)
            return loadedCount
        } catch (error) {
            logger.error(`❌ [server]: Error loading UI components of category '${category}' from database:`, error)
            return 0
        }
    }

    /**
     * Create a new UI component in the database and register it with the NodesPool
     * @param {Partial<UIComponent>} component The component data to create
     * @returns {Promise<UIComponent | undefined>} The created component or undefined if creation failed
     */
    async createComponent(component: Partial<UIComponent>): Promise<UIComponent | undefined> {
        try {
            // Validate required fields
            if (!component.name || !component.type || !component.category) {
                logger.error('❌ [server]: Missing required fields (name, type, category) for UI component')
                return undefined
            }

            // Validate category
            const validCategories = Object.values(UI_CATEGORIES)
            if (!validCategories.includes(component.category as UICategory)) {
                logger.error(`❌ [server]: Invalid category '${component.category}' for UI component`)
                return undefined
            }

            // Create component in database
            const newComponent = this.repository.create(component)
            const savedComponent = await this.repository.save(newComponent)

            // Register with NodesPool
            const registered = this.nodesPool.registerUINode(savedComponent.name, savedComponent)
            if (!registered) {
                logger.error(`❌ [server]: Failed to register UI component '${savedComponent.name}' with NodesPool`)
                // Consider removing from database if registration fails?
            } else {
                logger.info(`✅ [server]: Created and registered UI component '${savedComponent.name}'`)
            }

            return savedComponent
        } catch (error) {
            logger.error('❌ [server]: Error creating UI component:', error)
            return undefined
        }
    }

    /**
     * Update an existing UI component and its registration in the NodesPool
     * @param {string} id The component ID
     * @param {Partial<UIComponent>} updates The updates to apply
     * @returns {Promise<UIComponent | undefined>} The updated component or undefined if update failed
     */
    async updateComponent(id: string, updates: Partial<UIComponent>): Promise<UIComponent | undefined> {
        try {
            // Find existing component
            const existingComponent = await this.repository.findOne({ where: { id } })
            if (!existingComponent) {
                logger.error(`❌ [server]: UI component with ID '${id}' not found`)
                return undefined
            }

            // Check if we're updating the name, which requires unregistering the old name
            const oldName = existingComponent.name
            const newName = updates.name || oldName

            // Unregister the old component if name is changing
            if (oldName !== newName) {
                this.nodesPool.unregisterUINode(oldName)
            }

            // Update component in database
            Object.assign(existingComponent, updates)
            const updatedComponent = await this.repository.save(existingComponent)

            // Register with NodesPool
            const registered = this.nodesPool.registerUINode(updatedComponent.name, updatedComponent)
            if (!registered) {
                logger.error(`❌ [server]: Failed to register updated UI component '${updatedComponent.name}' with NodesPool`)
                // Try to restore old registration if possible
                if (oldName !== newName) {
                    this.nodesPool.registerUINode(oldName, existingComponent)
                }
            } else {
                logger.info(`✅ [server]: Updated and re-registered UI component '${updatedComponent.name}'`)
            }

            return updatedComponent
        } catch (error) {
            logger.error('❌ [server]: Error updating UI component:', error)
            return undefined
        }
    }

    /**
     * Delete a UI component and unregister it from the NodesPool
     * @param {string} id The component ID
     * @returns {Promise<boolean>} True if deletion was successful
     */
    async deleteComponent(id: string): Promise<boolean> {
        try {
            // Find existing component
            const existingComponent = await this.repository.findOne({ where: { id } })
            if (!existingComponent) {
                logger.error(`❌ [server]: UI component with ID '${id}' not found`)
                return false
            }

            // Unregister from NodesPool
            const unregistered = this.nodesPool.unregisterUINode(existingComponent.name)
            if (!unregistered) {
                logger.warn(`⚠️ [server]: UI component '${existingComponent.name}' not found in NodesPool`)
            }

            // Delete from database
            await this.repository.remove(existingComponent)
            logger.info(`✅ [server]: Deleted UI component '${existingComponent.name}'`)

            return true
        } catch (error) {
            logger.error('❌ [server]: Error deleting UI component:', error)
            return false
        }
    }
} 