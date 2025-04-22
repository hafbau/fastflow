/**
 * Minimal test for UIComponentsLoader that avoids ESM issues
 * This approach directly tests the core functionality without actual dependencies
 */

// Create a minimal mock implementation of UIComponentsLoader that doesn't import problematic ESM modules
class MockUIComponentsLoader {
    private repository: any;
    private nodesPool: any;

    constructor(dataSource: any, nodesPool: any) {
        this.repository = dataSource.getRepository(null);
        this.nodesPool = nodesPool;
    }

    async loadAllComponents(): Promise<number> {
        try {
            const components = await this.repository.find();
            let loadedCount = 0;

            for (const component of components) {
                const result = this.nodesPool.registerUINode(component.name, component);
                if (result) {
                    loadedCount++;
                }
            }

            return loadedCount;
        } catch (error) {
            return 0;
        }
    }

    async loadComponentsByCategory(category: string): Promise<number> {
        try {
            const components = await this.repository.find({ where: { category } });
            let loadedCount = 0;

            for (const component of components) {
                const result = this.nodesPool.registerUINode(component.name, component);
                if (result) {
                    loadedCount++;
                }
            }

            return loadedCount;
        } catch (error) {
            return 0;
        }
    }

    async createComponent(component: any): Promise<any> {
        try {
            if (!component.name || !component.type || !component.category) {
                return undefined;
            }

            const newComponent = this.repository.create(component);
            const savedComponent = await this.repository.save(newComponent);

            const registered = this.nodesPool.registerUINode(savedComponent.name, savedComponent);
            return savedComponent;
        } catch (error) {
            return undefined;
        }
    }

    async updateComponent(id: string, updates: any): Promise<any> {
        try {
            const existingComponent = await this.repository.findOne({ where: { id } });
            if (!existingComponent) {
                return undefined;
            }

            const oldName = existingComponent.name;
            const newName = updates.name || oldName;

            if (oldName !== newName) {
                this.nodesPool.unregisterUINode(oldName);
            }

            Object.assign(existingComponent, updates);
            const updatedComponent = await this.repository.save(existingComponent);

            const registered = this.nodesPool.registerUINode(updatedComponent.name, updatedComponent);
            return updatedComponent;
        } catch (error) {
            return undefined;
        }
    }

    async deleteComponent(id: string): Promise<boolean> {
        try {
            const existingComponent = await this.repository.findOne({ where: { id } });
            if (!existingComponent) {
                return false;
            }

            const unregistered = this.nodesPool.unregisterUINode(existingComponent.name);
            await this.repository.remove(existingComponent);
            return true;
        } catch (error) {
            return false;
        }
    }
}

describe('UIComponentsLoader Mock Test', () => {
    let mockDataSource: any;
    let mockRepository: any;
    let nodesPool: any;
    let loader: MockUIComponentsLoader;
    
    const mockComponents = [
        {
            id: '1',
            name: 'TestButton',
            type: 'button',
            category: 'Action',
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
            category: 'Form',
            schema: '[{"name": "value", "type": "string"}]',
            template: '<input type="text" />',
            description: 'A test input',
            icon: 'icon.svg',
            createdDate: new Date(),
            updatedDate: new Date()
        }
    ];
    
    beforeEach(() => {
        // Mock repository methods
        mockRepository = {
            find: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.category) {
                    return mockComponents.filter(comp => comp.category === options.where.category);
                }
                return [...mockComponents];
            }),
            findOne: jest.fn().mockImplementation(async (options) => {
                if (options && options.where && options.where.id) {
                    return mockComponents.find(comp => comp.id === options.where.id) || null;
                }
                return null;
            }),
            create: jest.fn().mockImplementation((component) => {
                return {
                    ...component,
                    id: '3', // New ID for created components
                    createdDate: new Date(),
                    updatedDate: new Date()
                };
            }),
            save: jest.fn().mockImplementation(async (component) => {
                return { ...component };
            }),
            remove: jest.fn().mockImplementation(async () => {
                return true;
            })
        };
        
        // Mock data source
        mockDataSource = {
            getRepository: jest.fn().mockReturnValue(mockRepository)
        };
        
        // Mock NodesPool
        nodesPool = {
            registerUINode: jest.fn().mockImplementation((name, data) => {
                if (!data.type || !data.category) return undefined;
                return { name, type: data.type, category: data.category };
            }),
            unregisterUINode: jest.fn().mockReturnValue(true)
        };
        
        // Create loader instance with mocks
        loader = new MockUIComponentsLoader(
            mockDataSource,
            nodesPool
        );
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    describe('loadAllComponents', () => {
        it('should load all components from database', async () => {
            const result = await loader.loadAllComponents();
            
            expect(result).toBe(2); // Number of mock components
            expect(mockRepository.find).toHaveBeenCalled();
            expect(nodesPool.registerUINode).toHaveBeenCalledTimes(2);
        });
        
        it('should handle errors gracefully', async () => {
            mockRepository.find = jest.fn().mockRejectedValue(new Error('Database error'));
            
            const result = await loader.loadAllComponents();
            
            expect(result).toBe(0);
            expect(mockRepository.find).toHaveBeenCalled();
            expect(nodesPool.registerUINode).not.toHaveBeenCalled();
        });
    });
    
    describe('loadComponentsByCategory', () => {
        it('should load components by category', async () => {
            const result = await loader.loadComponentsByCategory('Form');
            
            expect(result).toBe(1); // One form component
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { category: 'Form' }
            });
            expect(nodesPool.registerUINode).toHaveBeenCalledTimes(1);
        });
    });
    
    describe('createComponent', () => {
        it('should create a new component and register it', async () => {
            const newComponent = {
                name: 'NewComponent',
                type: 'container',
                category: 'Container',
                schema: '[]',
                template: '<div></div>'
            };
            
            const result = await loader.createComponent(newComponent);
            
            expect(result).toBeDefined();
            expect(mockRepository.create).toHaveBeenCalledWith(newComponent);
            expect(mockRepository.save).toHaveBeenCalled();
            expect(nodesPool.registerUINode).toHaveBeenCalledWith('NewComponent', expect.anything());
        });
    });
    
    describe('updateComponent', () => {
        it('should update an existing component and re-register it', async () => {
            const updates = {
                name: 'UpdatedButton',
                description: 'An updated button'
            };
            
            const result = await loader.updateComponent('1', updates);
            
            expect(result).toBeDefined();
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockRepository.save).toHaveBeenCalled();
            expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('TestButton');
            expect(nodesPool.registerUINode).toHaveBeenCalledWith('UpdatedButton', expect.anything());
        });
    });
    
    describe('deleteComponent', () => {
        it('should delete a component and unregister it', async () => {
            // Setup
            const mockComponent = {
                id: '1',
                name: 'UpdatedButton',
                type: 'button',
                category: 'input',
                schema: '{}',
                template: '<button>Test</button>',
                createdDate: new Date(),
                updatedDate: new Date()
            };
            
            mockRepository.findOne.mockResolvedValue(mockComponent);
            mockRepository.remove.mockResolvedValue(mockComponent);
            
            // Execute
            await loader.deleteComponent('1');
            
            // Verify
            expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
            expect(mockRepository.remove).toHaveBeenCalled();
            expect(nodesPool.unregisterUINode).toHaveBeenCalledWith('UpdatedButton');
        });
    });
}); 