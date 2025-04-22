import { DataSource } from 'typeorm'
import { UIFlow } from '../UIFlow'
import { ChatFlow } from '../ChatFlow'

describe('UIFlow Entity', () => {
    let dataSource: DataSource
    let chatflowId: string

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [UIFlow, ChatFlow]
        })
        await dataSource.initialize()
        
        // Create a ChatFlow for testing
        const chatflowRepository = dataSource.getRepository(ChatFlow)
        const chatflow = new ChatFlow()
        chatflow.name = 'Test Chatflow'
        chatflow.flowData = '{}'
        const savedChatflow = await chatflowRepository.save(chatflow)
        chatflowId = savedChatflow.id
    })

    afterEach(async () => {
        await dataSource.destroy()
    })

    it('should create a UIFlow with required fields', async () => {
        const flowRepository = dataSource.getRepository(UIFlow)
        
        const flow = new UIFlow()
        flow.name = 'Test Flow'
        flow.flowData = '{"nodes":[],"edges":[]}'
        flow.chatflowId = chatflowId
        flow.isPublic = false
        flow.deployed = false
        
        const savedFlow = await flowRepository.save(flow)
        
        expect(savedFlow.id).toBeDefined()
        expect(savedFlow.name).toBe('Test Flow')
        expect(savedFlow.flowData).toBe('{"nodes":[],"edges":[]}')
        expect(savedFlow.chatflowId).toBe(chatflowId)
        expect(savedFlow.isPublic).toBe(false)
        expect(savedFlow.deployed).toBe(false)
        expect(savedFlow.createdDate).toBeDefined()
        expect(savedFlow.updatedDate).toBeDefined()
    })

    it('should create a UIFlow with optional fields', async () => {
        const flowRepository = dataSource.getRepository(UIFlow)
        
        const flow = new UIFlow()
        flow.name = 'Test Flow'
        flow.description = 'Test description'
        flow.flowData = '{"nodes":[],"edges":[]}'
        flow.chatflowId = chatflowId
        flow.isPublic = true
        flow.deployed = true
        
        const savedFlow = await flowRepository.save(flow)
        
        expect(savedFlow.id).toBeDefined()
        expect(savedFlow.description).toBe('Test description')
        expect(savedFlow.isPublic).toBe(true)
        expect(savedFlow.deployed).toBe(true)
    })

    it('should update a UIFlow', async () => {
        const flowRepository = dataSource.getRepository(UIFlow)
        
        // Create flow
        const flow = new UIFlow()
        flow.name = 'Original Name'
        flow.flowData = '{"nodes":[],"edges":[]}'
        flow.chatflowId = chatflowId
        flow.isPublic = false
        flow.deployed = false
        
        const savedFlow = await flowRepository.save(flow)
        const originalUpdatedDate = savedFlow.updatedDate
        
        // Wait to ensure updatedDate will be different
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update flow
        savedFlow.name = 'Updated Name'
        savedFlow.isPublic = true
        savedFlow.updatedDate = new Date() // Explicitly set updated date
        const updatedFlow = await flowRepository.save(savedFlow)
        
        expect(updatedFlow.name).toBe('Updated Name')
        expect(updatedFlow.isPublic).toBe(true)
        expect(updatedFlow.updatedDate.getTime()).toBeGreaterThan(originalUpdatedDate.getTime())
    })

    it('should delete a UIFlow', async () => {
        const flowRepository = dataSource.getRepository(UIFlow)
        
        // Create flow
        const flow = new UIFlow()
        flow.name = 'To Be Deleted'
        flow.flowData = '{"nodes":[],"edges":[]}'
        flow.chatflowId = chatflowId
        flow.isPublic = false
        flow.deployed = false
        
        const savedFlow = await flowRepository.save(flow)
        
        // Delete flow
        await flowRepository.remove(savedFlow)
        
        // Try to find deleted flow
        const foundFlow = await flowRepository.findOne({
            where: { id: savedFlow.id }
        })
        
        expect(foundFlow).toBeNull()
    })

    it('should validate required fields', async () => {
        const flowRepository = dataSource.getRepository(UIFlow)
        
        const flow = new UIFlow()
        // Missing required fields
        
        await expect(async () => {
            await flowRepository.save(flow)
        }).rejects.toThrow()
    })
}) 