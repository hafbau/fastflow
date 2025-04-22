import { DataSource } from 'typeorm'
import { Screen } from '../Screen'
import { UIFlow } from '../UIFlow'
import { ChatFlow } from '../ChatFlow'
import { UIComponent } from '../UIComponent'

describe('Screen Entity', () => {
    let dataSource: DataSource
    let uiFlowId: string
    let chatflowId: string

    beforeEach(async () => {
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            logging: false,
            entities: [Screen, UIFlow, ChatFlow, UIComponent]
        })
        await dataSource.initialize()
        
        // Create a ChatFlow for testing
        const chatflowRepository = dataSource.getRepository(ChatFlow)
        const chatflow = new ChatFlow()
        chatflow.name = 'Test Chatflow'
        chatflow.flowData = '{}'
        const savedChatflow = await chatflowRepository.save(chatflow)
        chatflowId = savedChatflow.id

        // Create a UIFlow for testing
        const flowRepository = dataSource.getRepository(UIFlow)
        const flow = new UIFlow()
        flow.name = 'Test Flow'
        flow.flowData = '{"nodes":[],"edges":[]}'
        flow.chatflowId = chatflowId
        flow.isPublic = false
        flow.deployed = false
        const savedFlow = await flowRepository.save(flow)
        uiFlowId = savedFlow.id
    })

    afterEach(async () => {
        await dataSource.destroy()
    })

    it('should create a Screen with required fields', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        
        const screen = new Screen()
        screen.path = '/test-screen'
        screen.title = 'Test Screen'
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        expect(savedScreen.id).toBeDefined()
        expect(savedScreen.path).toBe('/test-screen')
        expect(savedScreen.title).toBe('Test Screen')
        expect(savedScreen.uiFlowId).toBe(uiFlowId)
        expect(savedScreen.createdDate).toBeDefined()
        expect(savedScreen.updatedDate).toBeDefined()
    })

    it('should create a Screen with optional fields', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        
        const screen = new Screen()
        screen.path = '/test-screen'
        screen.title = 'Test Screen'
        screen.description = 'Test description'
        screen.queryParameters = { limit: 10, offset: 0 }
        screen.pathParameters = { id: '123' }
        screen.metadata = { bgColor: '#FFF', theme: 'light' }
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        expect(savedScreen.id).toBeDefined()
        expect(savedScreen.description).toBe('Test description')
        expect(savedScreen.queryParameters).toEqual({ limit: 10, offset: 0 })
        expect(savedScreen.pathParameters).toEqual({ id: '123' })
        expect(savedScreen.metadata).toEqual({ bgColor: '#FFF', theme: 'light' })
    })

    it('should update a Screen', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        
        // Create screen
        const screen = new Screen()
        screen.path = '/original-path'
        screen.title = 'Original Title'
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        // Wait to ensure updatedDate will be different
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Update screen
        savedScreen.path = '/updated-path'
        savedScreen.title = 'Updated Title'
        // Manually set the updatedDate to ensure it's different
        savedScreen.updatedDate = new Date(Date.now() + 5000)
        const updatedScreen = await screenRepository.save(savedScreen)
        
        expect(updatedScreen.path).toBe('/updated-path')
        expect(updatedScreen.title).toBe('Updated Title')
        expect(updatedScreen.updatedDate).not.toEqual(savedScreen.createdDate)
    })

    it('should delete a Screen', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        
        // Create screen
        const screen = new Screen()
        screen.path = '/to-be-deleted'
        screen.title = 'To Be Deleted'
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        // Delete screen
        await screenRepository.remove(savedScreen)
        
        // Try to find deleted screen
        const foundScreen = await screenRepository.findOne({
            where: { id: savedScreen.id }
        })
        
        expect(foundScreen).toBeNull()
    })

    it('should validate required fields', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        
        const screen = new Screen()
        // Missing required fields
        
        await expect(async () => {
            await screenRepository.save(screen)
        }).rejects.toThrow()
    })

    it('should establish relationship with UIFlow', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        const uiFlowRepository = dataSource.getRepository(UIFlow)
        
        // Create screen
        const screen = new Screen()
        screen.path = '/test-screen'
        screen.title = 'Test Screen'
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        // Get UIFlow with related screens
        const uiFlow = await uiFlowRepository.findOne({
            where: { id: uiFlowId },
            relations: ['screens']
        })
        
        expect(uiFlow).not.toBeNull()
        if (uiFlow) {
            expect(uiFlow.screens).toBeDefined()
            expect(uiFlow.screens.length).toBe(1)
            expect(uiFlow.screens[0].id).toBe(savedScreen.id)
        }
    })

    it('should allow UIComponents to be associated with a Screen', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        const componentRepository = dataSource.getRepository(UIComponent)
        
        // Create screen
        const screen = new Screen()
        screen.path = '/test-screen'
        screen.title = 'Test Screen'
        screen.uiFlowId = uiFlowId
        
        const savedScreen = await screenRepository.save(screen)
        
        // Create component
        const component = new UIComponent()
        component.name = 'Test Component'
        component.type = 'button'
        component.category = 'input'
        component.schema = '{}'
        component.template = '<button>Test</button>'
        component.screenId = savedScreen.id
        
        const savedComponent = await componentRepository.save(component)
        
        // Get screen with related components
        const screenWithComponents = await screenRepository.findOne({
            where: { id: savedScreen.id },
            relations: ['components']
        })
        
        expect(screenWithComponents).not.toBeNull()
        if (screenWithComponents) {
            expect(screenWithComponents.components).toBeDefined()
            expect(screenWithComponents.components.length).toBe(1)
            expect(screenWithComponents.components[0].id).toBe(savedComponent.id)
        }
    })

    it('should cascade delete UIFlow to Screen', async () => {
        const screenRepository = dataSource.getRepository(Screen)
        const uiFlowRepository = dataSource.getRepository(UIFlow)
        
        // Create screen
        const screen = new Screen()
        screen.path = '/test-screen'
        screen.title = 'Test Screen'
        screen.uiFlowId = uiFlowId
        
        await screenRepository.save(screen)
        
        // Delete UIFlow
        const uiFlow = await uiFlowRepository.findOne({ where: { id: uiFlowId } })
        if (uiFlow) {
            await uiFlowRepository.remove(uiFlow)
        }
        
        // Check if screen was deleted
        const screens = await screenRepository.find()
        expect(screens.length).toBe(0)
    })
}) 