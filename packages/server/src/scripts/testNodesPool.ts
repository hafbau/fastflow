import { NodesPool } from '../NodesPool'
import logger from '../utils/logger'

async function testNodesPool() {
    logger.info('Starting NodesPool test...')
    
    // Create a new NodesPool instance
    const nodesPool = new NodesPool()
    logger.info('NodesPool created')
    
    // Test registerUINode
    logger.info('Testing registerUINode...')
    const componentData = {
        name: 'TestComponent',
        type: 'button',
        category: 'Form',
        schema: '[{"name": "color", "type": "string", "value": "blue"}]',
        template: '<button>Test</button>',
        description: 'A test component',
        icon: 'test-icon'
    }

    const result = nodesPool.registerUINode('TestComponent', componentData)
    
    if (result) {
        logger.info('Successfully registered UI node:')
        logger.info(`- Name: ${result.name}`)
        logger.info(`- Type: ${result.type}`)
        logger.info(`- Category: ${result.category}`)
        logger.info(`- Has renderComponent: ${typeof result.renderComponent === 'function'}`)
        logger.info(`- Has handleEvent: ${typeof result.handleEvent === 'function'}`)
        logger.info(`- Has getProperties: ${typeof result.getProperties === 'function'}`)
        
        // Test renderComponent
        const renderedComponent = await result.renderComponent()
        logger.info(`- Rendered component: ${renderedComponent}`)
        
        // Test getProperties
        const properties = result.getProperties()
        logger.info(`- Properties count: ${properties.length}`)
        if (properties.length > 0) {
            logger.info(`- First property name: ${properties[0].name}`)
            logger.info(`- First property value: ${properties[0].value}`)
        }
    } else {
        logger.error('Failed to register UI node')
    }
    
    // Test unregisterUINode
    logger.info('Testing unregisterUINode...')
    const unregisterResult = nodesPool.unregisterUINode('TestComponent')
    logger.info(`Unregister result: ${unregisterResult}`)
    logger.info(`Component still exists: ${!!nodesPool.componentUINodes['TestComponent']}`)
    
    // Test handling missing fields
    logger.info('Testing missing field validation...')
    const invalidData = {
        name: 'InvalidComponent',
        schema: '[]',
        template: '<div>Invalid</div>'
        // Missing type and category
    }
    
    const invalidResult = nodesPool.registerUINode('InvalidComponent', invalidData)
    logger.info(`Invalid component registration result: ${!!invalidResult}`)
    
    logger.info('NodesPool test completed!')
}

testNodesPool().catch(error => {
    logger.error('Error during NodesPool test:', error)
}) 