import { DataSource } from 'typeorm'
import { UIComponent } from '../UIComponent'

describe('UIComponent Entity', () => {
    let dataSource: DataSource;

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [UIComponent]
        })
        await dataSource.initialize()
    })

    afterEach(async () => {
        await dataSource.destroy()
    })

    it('should create a UIComponent with required fields', async () => {
        const componentRepository = dataSource.getRepository(UIComponent)
        
        const component = new UIComponent()
        component.name = 'Test Component'
        component.type = 'button'
        component.category = 'input'
        component.schema = '{}'
        component.template = '<button>Test</button>'
        
        const savedComponent = await componentRepository.save(component)
        
        expect(savedComponent.id).toBeDefined()
        expect(savedComponent.name).toBe('Test Component')
        expect(savedComponent.type).toBe('button')
        expect(savedComponent.category).toBe('input')
        expect(savedComponent.schema).toBe('{}')
        expect(savedComponent.template).toBe('<button>Test</button>')
        expect(savedComponent.createdDate).toBeDefined()
        expect(savedComponent.updatedDate).toBeDefined()
    })

    it('should create a UIComponent with optional fields', async () => {
        const componentRepository = dataSource.getRepository(UIComponent)
        
        const component = new UIComponent()
        component.name = 'Test Component'
        component.description = 'Test description'
        component.type = 'button'
        component.category = 'input'
        component.schema = '{}'
        component.template = '<button>Test</button>'
        component.icon = 'test-icon'
        
        const savedComponent = await componentRepository.save(component)
        
        expect(savedComponent.id).toBeDefined()
        expect(savedComponent.description).toBe('Test description')
        expect(savedComponent.icon).toBe('test-icon')
    })

    it('should update a UIComponent', async () => {
        const componentRepository = dataSource.getRepository(UIComponent)
        
        // Create component
        const component = new UIComponent()
        component.name = 'Original Name'
        component.type = 'button'
        component.category = 'input'
        component.schema = '{}'
        component.template = '<button>Test</button>'
        
        const savedComponent = await componentRepository.save(component)
        const originalUpdatedDate = savedComponent.updatedDate
        
        // Wait to ensure updatedDate will be different
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update component
        savedComponent.name = 'Updated Name'
        const updatedComponent = await componentRepository.save(savedComponent)
        
        expect(updatedComponent.name).toBe('Updated Name')
        expect(updatedComponent.updatedDate.getTime()).toBeGreaterThan(originalUpdatedDate.getTime())
    })

    it('should delete a UIComponent', async () => {
        const componentRepository = dataSource.getRepository(UIComponent)
        
        // Create component
        const component = new UIComponent()
        component.name = 'To Be Deleted'
        component.type = 'button'
        component.category = 'input'
        component.schema = '{}'
        component.template = '<button>Test</button>'
        
        const savedComponent = await componentRepository.save(component)
        
        // Delete component
        await componentRepository.remove(savedComponent)
        
        // Try to find deleted component
        const foundComponent = await componentRepository.findOne({
            where: { id: savedComponent.id }
        })
        
        expect(foundComponent).toBeNull()
    })

    it('should validate required fields', async () => {
        const componentRepository = dataSource.getRepository(UIComponent)
        
        const component = new UIComponent()
        // Missing required fields
        
        await expect(async () => {
            await componentRepository.save(component)
        }).rejects.toThrow()
    })
}) 