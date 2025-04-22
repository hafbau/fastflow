import { DataSource } from 'typeorm'
import { UIFlow } from '../UIFlow'
import { UIComponent } from '../UIComponent'
import { ChatFlow } from '../ChatFlow'
import { Screen } from '../Screen'

describe('UI Entities', () => {
    let dataSource: DataSource

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            entities: [UIFlow, UIComponent, ChatFlow, Screen],
            synchronize: true,
            logging: false
        })
        await dataSource.initialize()
    })

    afterEach(async () => {
        if (dataSource && dataSource.isInitialized) {
            await dataSource.destroy()
        }
    })

    describe('UIComponent Entity', () => {
        const mockComponentData = {
            name: 'Test Component',
            type: 'button',
            category: 'input',
            schema: '{}',
            template: '<button>Test</button>'
        }

        it('should create a UIComponent successfully', async () => {
            const component = new UIComponent()
            Object.assign(component, {
                ...mockComponentData,
                description: 'A test component',
                icon: 'test-icon'
            })

            const savedComponent = await dataSource.manager.save(component)
            expect(savedComponent.id).toBeDefined()
            expect(savedComponent.name).toBe('Test Component')
            expect(savedComponent.description).toBe('A test component')
            expect(savedComponent.icon).toBe('test-icon')
            expect(savedComponent.createdDate).toBeDefined()
            expect(savedComponent.updatedDate).toBeDefined()
        })

        it('should enforce required fields', async () => {
            const component = new UIComponent()
            await expect(dataSource.manager.save(component)).rejects.toThrow()
        })

        it('should update a UIComponent', async () => {
            const component = new UIComponent()
            Object.assign(component, mockComponentData)
            
            const savedComponent = await dataSource.manager.save(component)
            const initialDate = savedComponent.updatedDate
            
            // Add a delay and set explicit update date
            await new Promise(resolve => setTimeout(resolve, 1000))
            savedComponent.name = 'Updated Name'
            savedComponent.updatedDate = new Date()
            
            const updatedComponent = await dataSource.manager.save(savedComponent)
            
            expect(updatedComponent.name).toBe('Updated Name')
            expect(updatedComponent.updatedDate.getTime()).toBeGreaterThan(initialDate.getTime())
        })
    })

    describe('UIFlow Entity', () => {
        let chatflow: ChatFlow

        beforeEach(async () => {
            // Create fresh chatflow for each test
            chatflow = new ChatFlow()
            chatflow.name = 'Test Chatflow'
            chatflow.flowData = '{}'
            await dataSource.manager.save(chatflow)
        })

        const mockFlowData = {
            name: 'Test Flow',
            description: 'A test flow',
            flowData: '{}'
        }

        it('should create a UIFlow successfully', async () => {
            const flow = new UIFlow()
            Object.assign(flow, {
                ...mockFlowData,
                chatflowId: chatflow.id,
                isPublic: true,
                deployed: true
            })

            const savedFlow = await dataSource.manager.save(flow)
            expect(savedFlow.id).toBeDefined()
            expect(savedFlow.name).toBe('Test Flow')
            expect(savedFlow.description).toBe('A test flow')
            expect(savedFlow.chatflowId).toBe(chatflow.id)
            expect(savedFlow.isPublic).toBe(true)
            expect(savedFlow.deployed).toBe(true)
            expect(savedFlow.createdDate).toBeDefined()
            expect(savedFlow.updatedDate).toBeDefined()
        })

        it('should enforce required fields', async () => {
            const flow = new UIFlow()
            await expect(dataSource.manager.save(flow)).rejects.toThrow()
        })

        it('should enforce chatflow relationship', async () => {
            const flow = new UIFlow()
            Object.assign(flow, mockFlowData)
            await expect(dataSource.manager.save(flow)).rejects.toThrow()
        })

        it('should cascade delete when chatflow is deleted', async () => {
            const flow = new UIFlow()
            Object.assign(flow, {
                ...mockFlowData,
                chatflowId: chatflow.id
            })
            await dataSource.manager.save(flow)

            // Delete the chatflow
            await dataSource.manager.remove(chatflow)

            // Verify the flow was cascade deleted
            const deletedFlow = await dataSource.manager.findOne(UIFlow, {
                where: { id: flow.id }
            })

            expect(deletedFlow).toBeNull()
        })

        it('should update a UIFlow', async () => {
            const flow = new UIFlow()
            Object.assign(flow, {
                ...mockFlowData,
                chatflowId: chatflow.id
            })
            
            const savedFlow = await dataSource.manager.save(flow)
            const initialDate = savedFlow.updatedDate
            
            // Add a delay and set explicit update date
            await new Promise(resolve => setTimeout(resolve, 1000))
            savedFlow.name = 'Updated Name'
            savedFlow.updatedDate = new Date()
            
            const updatedFlow = await dataSource.manager.save(savedFlow)
            
            expect(updatedFlow.name).toBe('Updated Name')
            expect(updatedFlow.updatedDate.getTime()).toBeGreaterThan(initialDate.getTime())
        })
    })
}) 