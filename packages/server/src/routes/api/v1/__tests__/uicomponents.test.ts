import express from 'express'
import request from 'supertest'
import { uiComponentsRouter } from '../uicomponents'
import { InternalFlowiseError } from '../../../../errors/internalFlowiseError'
import { StatusCodes } from 'http-status-codes'

// Mock modules
jest.mock('uuid', () => {
    const originalModule = jest.requireActual('uuid');
    
    return {
        ...originalModule,
        validate: jest.fn().mockImplementation((id) => {
            const validIds = [
                '12345678-1234-1234-1234-123456789012',
                '87654321-4321-4321-4321-210987654321', 
                '12345678-1234-5678-1234-567812345678',
                '98765432-5678-5678-5678-987654325678',
                'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
            ];
            return validIds.includes(id) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        }),
        v4: jest.fn().mockReturnValue('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
    };
});

// Mock the getRunningExpressApp
jest.mock('../../../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn().mockReturnValue({
        AppDataSource: {
            getRepository: jest.fn().mockImplementation((entity) => {
                const validScreenId = '12345678-1234-1234-1234-123456789012';
                const validComponentId = '87654321-4321-4321-4321-210987654321';
                
                if (entity === 'Screen') {
                    return {
                        findOne: jest.fn().mockImplementation(({ where }) => {
                            if (where.id === validScreenId) {
                                return { id: validScreenId, path: '/test' }
                            }
                            return null
                        })
                    }
                }
                
                return {
                    find: jest.fn().mockReturnValue([
                        { id: '12345678-1234-5678-1234-567812345678', name: 'Component 1', type: 'button', screenId: validScreenId },
                        { id: '98765432-5678-5678-5678-987654325678', name: 'Component 2', type: 'textfield', screenId: validScreenId }
                    ]),
                    findOne: jest.fn().mockImplementation(({ where }) => {
                        if (where.id === validComponentId) {
                            return { id: validComponentId, name: 'Test Component', type: 'button' }
                        }
                        return null
                    }),
                    create: jest.fn().mockImplementation((data) => ({ ...data, id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })),
                    save: jest.fn().mockImplementation((data) => ({ ...data, id: data.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' })),
                    remove: jest.fn().mockResolvedValue(undefined)
                }
            }),
            transaction: jest.fn().mockImplementation(async (callback) => {
                return await callback({
                    save: jest.fn().mockImplementation((data) => ({ ...data, id: data.id || 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }))
                })
            })
        }
    })
}))

describe('UIComponents Router', () => {
    let app: express.Application

    beforeEach(() => {
        app = express()
        app.use(express.json())
        app.use('/api/v1/ui-components', uiComponentsRouter)
        
        // Reset all mocks
        jest.clearAllMocks()
    })

    describe('GET /', () => {
        it('should return all UI components', async () => {
            const response = await request(app).get('/api/v1/ui-components')
            
            expect(response.status).toBe(StatusCodes.OK)
            expect(response.body).toHaveLength(2)
            expect(response.body[0].name).toBe('Component 1')
            expect(response.body[1].name).toBe('Component 2')
        })
    })
    
    describe('GET /screen/:screenId', () => {
        it('should return UI components for a valid screen ID', async () => {
            const validScreenId = '12345678-1234-1234-1234-123456789012';
            const response = await request(app).get(`/api/v1/ui-components/screen/${validScreenId}`);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveLength(2);
        })
        
        it('should return 400 for invalid screen ID format', async () => {
            const response = await request(app).get('/api/v1/ui-components/screen/invalid-id')
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid Screen ID format')
        })
    })
    
    describe('GET /:componentId', () => {
        it('should return a UI component for a valid ID', async () => {
            const validComponentId = '87654321-4321-4321-4321-210987654321';
            const response = await request(app).get(`/api/v1/ui-components/${validComponentId}`);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.name).toBe('Test Component');
        })
        
        it('should return 404 for non-existent component', async () => {
            const validUUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // non-existent but valid UUID
            const response = await request(app).get(`/api/v1/ui-components/${validUUID}`);
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.error).toBe(`UIComponent ${validUUID} not found`);
        })
        
        it('should return 400 for invalid component ID format', async () => {
            const response = await request(app).get('/api/v1/ui-components/invalid-id')
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid UI Component ID format')
        })
    })
    
    describe('POST /', () => {
        it('should create a new UI component with valid data', async () => {
            const validScreenId = '12345678-1234-1234-1234-123456789012';
            const componentData = {
                name: 'New Component',
                type: 'button',
                screenId: validScreenId
            };
            
            const response = await request(app)
                .post('/api/v1/ui-components')
                .send(componentData);
            
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.name).toBe('New Component');
        })
        
        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/v1/ui-components')
                .send({ name: 'Incomplete Component' })
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Missing required fields: name, type, screenId')
        })
        
        it('should return 400 for invalid screen ID format', async () => {
            const response = await request(app)
                .post('/api/v1/ui-components')
                .send({
                    name: 'Test Component',
                    type: 'button',
                    screenId: 'invalid-id'
                })
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST)
            expect(response.body.error).toBe('Invalid Screen ID format')
        })
    })
    
    describe('PATCH /:componentId', () => {
        it('should update a UI component with valid data', async () => {
            const validComponentId = '87654321-4321-4321-4321-210987654321';
            const updateData = {
                name: 'Updated Component'
            };
            
            const response = await request(app)
                .patch(`/api/v1/ui-components/${validComponentId}`)
                .send(updateData);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.name).toBe('Updated Component');
        })
        
        it('should return 404 for non-existent component', async () => {
            const validUUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // non-existent but valid UUID
            const response = await request(app)
                .patch(`/api/v1/ui-components/${validUUID}`)
                .send({ name: 'Updated Name' });
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.error).toBe(`UIComponent ${validUUID} not found`);
        })
    })
    
    describe('DELETE /:componentId', () => {
        it('should delete a UI component', async () => {
            const validComponentId = '87654321-4321-4321-4321-210987654321';
            const response = await request(app).delete(`/api/v1/ui-components/${validComponentId}`);
            
            expect(response.status).toBe(StatusCodes.NO_CONTENT);
        })
        
        it('should return 404 for non-existent component', async () => {
            const validUUID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'; // non-existent but valid UUID
            const response = await request(app).delete(`/api/v1/ui-components/${validUUID}`);
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.error).toBe(`UIComponent ${validUUID} not found`);
        })
    })
}) 