import { UIComponentsLoader } from '../UIComponentsLoader'
import { DataSource, Repository } from 'typeorm'
import { UIComponent } from '../../database/entities/UIComponent'
import { MockNodesPool, UI_CATEGORIES, setupNodesMocks } from '../../__tests__/mocks/MockNodesPool'

// Set up mocks for dependencies
setupNodesMocks()

// Mock the logger directly to override the one in setupNodesMocks if needed
jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        error: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }
}))

describe('UIComponentsLoader', () => {
    let mockDataSource: Partial<DataSource>
    let mockRepository: Partial<Repository<UIComponent>>
    let mockNodesPool: MockNodesPool
    let loader: UIComponentsLoader
    
    const mockComponents = [
        {
            id: '1',
            name: 'TestButton',
            type: 'button',
            category: UI_CATEGORIES.ACTION,
            schema: '[]',
            template: '<button>Test</button>',
            description: 'A test button',
            icon: 'icon.svg',
            createdDate: new Date(),
            updatedDate: new Date()
        },
        {
            id: '2',
            name: 'TestInput',
            type: 'input',
            category: UI_CATEGORIES.FORM,
            schema: '[{"name": "value", "type": "string"}]',
            template: '<input type="text" />',
            description: 'A test input',
            icon: 'icon.svg',
            createdDate: new Date(),
            updatedDate: new Date()
        }
    ] as UIComponent[]
    
    beforeEach(() => {
        // Mock repository methods
        mockRepository = {
            find: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.category) {
                    return mockComponents.filter(comp => comp.category === options.where.category)
                }
                if (options && options.where && options.where.id) {
                    return mockComponents.filter(comp => comp.id === options.where.id)
                }
                return [...mockComponents]
            }),
            findOne: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.id) {
                    return mockComponents.find(comp => comp.id === options.where.id) || null
                }
                return null
            }),
            create: jest.fn().mockImplementation((component) => {
                return {
                    ...component,
                    id: '3', // New ID for created components
                    createdDate: new Date(),
                    updatedDate: new Date()
                }
            }),
            save: jest.fn().mockImplementation(async (component) => {
                return { ...component }
            }),
            remove: jest.fn().mockImplementation(async () => {
                return true
            })
        }
        
        // Mock data source
        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepository)
        }
        
        // Use our MockNodesPool instead of manual mocking
        mockNodesPool = new MockNodesPool()
        
        // Spy on the MockNodesPool methods for verification
        jest.spyOn(mockNodesPool, 'registerUINode')
        jest.spyOn(mockNodesPool, 'unregisterUINode')
        
        // Create loader instance with mocks
        loader = new UIComponentsLoader(
            mockDataSource as DataSource,
            mockNodesPool as any // Type assertion to satisfy TypeORM
        )
    })
    
    afterEach(() => {
        jest.clearAllMocks()
    })
    
    describe('loadAllComponents', () => {
        it('should load all components from database', async () => {
            const result = await loader.loadAllComponents()
            
            expect(result).toBe(2) // Number of mock components
            expect(mockRepository.find).toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).toHaveBeenCalledTimes(2)
        })
        
        it('should handle errors gracefully', async () => {
            mockRepository.find = jest.fn().mockRejectedValue(new Error('Database error'))
            
            const result = await loader.loadAllComponents()
            
            expect(result).toBe(0)
            expect(mockRepository.find).toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).not.toHaveBeenCalled()
        })
    })
    
    describe('loadComponentsByCategory', () => {
        it('should load components by category', async () => {
            const result = await loader.loadComponentsByCategory(UI_CATEGORIES.FORM)
            
            expect(result).toBe(1) // One form component
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { category: UI_CATEGORIES.FORM }
            })
            expect(mockNodesPool.registerUINode).toHaveBeenCalledTimes(1)
            expect(mockNodesPool.registerUINode).toHaveBeenCalledWith('TestInput', expect.anything())
        })
        
        it('should handle errors gracefully', async () => {
            mockRepository.find = jest.fn().mockRejectedValue(new Error('Database error'))
            
            const result = await loader.loadComponentsByCategory(UI_CATEGORIES.FORM)
            
            expect(result).toBe(0)
            expect(mockRepository.find).toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).not.toHaveBeenCalled()
        })
    })
    
    describe('createComponent', () => {
        it('should create a new component and register it', async () => {
            const newComponent = {
                name: 'NewComponent',
                type: 'container',
                category: UI_CATEGORIES.CONTAINER,
                schema: '[]',
                template: '<div></div>'
            }
            
            const result = await loader.createComponent(newComponent)
            
            expect(result).toBeDefined()
            expect(mockRepository.create).toHaveBeenCalledWith(newComponent)
            expect(mockRepository.save).toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).toHaveBeenCalledWith('NewComponent', expect.anything())
        })
        
        it('should reject components with missing required fields', async () => {
            const invalidComponent = {
                name: 'InvalidComponent'
                // Missing type and category
            }
            
            const result = await loader.createComponent(invalidComponent)
            
            expect(result).toBeUndefined()
            expect(mockRepository.create).not.toHaveBeenCalled()
            expect(mockRepository.save).not.toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).not.toHaveBeenCalled()
        })
        
        it('should reject components with invalid category', async () => {
            const invalidComponent = {
                name: 'InvalidCategory',
                type: 'text',
                category: 'InvalidCategory' // Not a valid category
            }
            
            const result = await loader.createComponent(invalidComponent)
            
            expect(result).toBeUndefined()
            expect(mockRepository.create).not.toHaveBeenCalled()
            expect(mockRepository.save).not.toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).not.toHaveBeenCalled()
        })
    })
    
    describe('updateComponent', () => {
        it('should update an existing component and re-register it', async () => {
            const updates = {
                name: 'UpdatedButton',
                description: 'An updated button'
            }
            
            const result = await loader.updateComponent('1', updates)
            
            expect(result).toBeDefined()
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } })
            expect(mockRepository.save).toHaveBeenCalled()
            expect(mockNodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton')
            expect(mockNodesPool.registerUINode).toHaveBeenCalledWith('UpdatedButton', expect.anything())
        })
        
        it('should handle non-existent components', async () => {
            mockRepository.findOne = jest.fn().mockResolvedValue(null)
            
            const result = await loader.updateComponent('999', { name: 'DoesNotExist' })
            
            expect(result).toBeUndefined()
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } })
            expect(mockRepository.save).not.toHaveBeenCalled()
            expect(mockNodesPool.unregisterUINode).not.toHaveBeenCalled()
            expect(mockNodesPool.registerUINode).not.toHaveBeenCalled()
        })
    })
    
    describe('deleteComponent', () => {
        it('should delete a component and unregister it', async () => {
            const result = await loader.deleteComponent('1')
            
            expect(result).toBe(true)
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } })
            expect(mockRepository.remove).toHaveBeenCalled()
            expect(mockNodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton')
        })
        
        it('should handle non-existent components', async () => {
            mockRepository.findOne = jest.fn().mockResolvedValue(null)
            
            const result = await loader.deleteComponent('999')
            
            expect(result).toBe(false)
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '999' } })
            expect(mockRepository.remove).not.toHaveBeenCalled()
            expect(mockNodesPool.unregisterUINode).not.toHaveBeenCalled()
        })
    })
}) 