import { DataSource } from 'typeorm'
import { UIFlow } from '../UIFlow'
import { UIComponent } from '../UIComponent'
import { ChatFlow } from '../ChatFlow'

describe('UI Entities', () => {
    let dataSource: DataSource

    beforeAll(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [UIFlow, UIComponent, ChatFlow],
            synchronize: true,
            logging: false
        })
        await dataSource.initialize()
    })

    afterAll(async () => {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy()
        }
    })

    describe('UIComponent Entity', () => {
        it('should create a UIComponent successfully', async () => {
            const component = new UIComponent()
            component.name = 'Test Component'
            component.description = 'A test component'
            component.type = 'button'
            component.category = 'input'
            component.schema = JSON.stringify({ type: 'object' })
            component.template = '<button>Test</button>'
            component.icon = 'test-icon'

            const savedComponent = await dataSource.manager.save(component)
            expect(savedComponent.id).toBeDefined()
            expect(savedComponent.name).toBe('Test Component')
            expect(savedComponent.createdDate).toBeDefined()
            expect(savedComponent.updatedDate).toBeDefined()
        })

        it('should enforce required fields', async () => {
            const component = new UIComponent()
            await expect(dataSource.manager.save(component)).rejects.toThrow()
        })

        it('should update a UIComponent', async () => {
            const component = new UIComponent()
            component.name = 'Original Name'
            component.type = 'button'
            component.category = 'input'
            component.schema = JSON.stringify({ type: 'object' })
            component.template = '<button>Test</button>'
            
            const savedComponent = await dataSource.manager.save(component)
            savedComponent.name = 'Updated Name'
            
            const updatedComponent = await dataSource.manager.save(savedComponent)
            expect(updatedComponent.name).toBe('Updated Name')
            expect(updatedComponent.updatedDate).not.toBe(updatedComponent.createdDate)
        })
    })

    describe('UIFlow Entity', () => {
        let chatflow: ChatFlow

        beforeEach(async () => {
            chatflow = new ChatFlow()
            chatflow.name = 'Test Chatflow'
            chatflow.flowData = JSON.stringify({ nodes: [], edges: [] })
            chatflow.deployed = true
            await dataSource.manager.save(chatflow)
        })

        it('should create a UIFlow successfully', async () => {
            const flow = new UIFlow()
            flow.name = 'Test Flow'
            flow.description = 'A test flow'
            flow.flowData = JSON.stringify({ nodes: [], edges: [] })
            flow.chatflow = chatflow
            flow.isPublic = true
            flow.deployed = true

            const savedFlow = await dataSource.manager.save(flow)
            expect(savedFlow.id).toBeDefined()
            expect(savedFlow.name).toBe('Test Flow')
            expect(savedFlow.chatflow.id).toBe(chatflow.id)
            expect(savedFlow.createdDate).toBeDefined()
            expect(savedFlow.updatedDate).toBeDefined()
        })

        it('should enforce required fields', async () => {
            const flow = new UIFlow()
            await expect(dataSource.manager.save(flow)).rejects.toThrow()
        })

        it('should enforce chatflow relationship', async () => {
            const flow = new UIFlow()
            flow.name = 'Test Flow'
            flow.flowData = JSON.stringify({ nodes: [], edges: [] })
            
            await expect(dataSource.manager.save(flow)).rejects.toThrow()
        })

        it('should cascade delete when chatflow is deleted', async () => {
            const flow = new UIFlow()
            flow.name = 'Test Flow'
            flow.flowData = JSON.stringify({ nodes: [], edges: [] })
            flow.chatflow = chatflow
            await dataSource.manager.save(flow)

            await dataSource.manager.remove(chatflow)
            const deletedFlow = await dataSource.manager.findOne(UIFlow, { where: { name: 'Test Flow' } })
            expect(deletedFlow).toBeNull()
        })

        it('should update a UIFlow', async () => {
            const flow = new UIFlow()
            flow.name = 'Original Name'
            flow.flowData = JSON.stringify({ nodes: [], edges: [] })
            flow.chatflow = chatflow
            
            const savedFlow = await dataSource.manager.save(flow)
            savedFlow.name = 'Updated Name'
            
            const updatedFlow = await dataSource.manager.save(savedFlow)
            expect(updatedFlow.name).toBe('Updated Name')
            expect(updatedFlow.updatedDate).not.toBe(updatedFlow.createdDate)
        })
    })
}) 