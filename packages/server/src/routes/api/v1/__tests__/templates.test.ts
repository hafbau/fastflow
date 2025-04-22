import express from 'express'
import request from 'supertest'
import { templatesRouter } from '../templates'
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
        })
    };
});

// Mock the getRunningExpressApp
jest.mock('../../../../utils/getRunningExpressApp', () => ({
    getRunningExpressApp: jest.fn().mockReturnValue({
        AppDataSource: {
            getRepository: jest.fn().mockImplementation((entity) => {
                const validUIFlowId = '12345678-1234-1234-1234-123456789012';
                const validTemplateId = '87654321-4321-4321-4321-210987654321';
                const validChatflowId = '12345678-1234-5678-1234-567812345678';
                
                if (entity === 'UIFlow') {
                    return {
                        findOne: jest.fn().mockImplementation(({ where, relations }) => {
                            if (where.id === validUIFlowId) {
                                return {
                                    id: validUIFlowId,
                                    name: 'Test UI Flow',
                                    flowData: { nodes: [], edges: [] },
                                    screens: [
                                        {
                                            id: 'screen-1',
                                            path: '/home',
                                            title: 'Home',
                                            description: 'Home screen',
                                            components: [
                                                {
                                                    id: 'comp-1',
                                                    type: 'button',
                                                    name: 'Button 1',
                                                    properties: { text: 'Click me' }
                                                }
                                            ]
                                        }
                                    ]
                                };
                            }
                            return null;
                        })
                    };
                }
                
                if (entity === 'ChatFlow') {
                    return {
                        findOne: jest.fn().mockImplementation(({ where }) => {
                            if (where.id === validChatflowId) {
                                return {
                                    id: validChatflowId,
                                    name: 'Test Chat Flow'
                                };
                            }
                            return null;
                        })
                    };
                }
                
                return {
                    find: jest.fn().mockImplementation(({ where, order }) => {
                        if (where && where.category === 'dashboard') {
                            return [
                                {
                                    id: validTemplateId,
                                    name: 'Dashboard Template',
                                    category: 'dashboard',
                                    version: '1.0.0'
                                }
                            ];
                        }
                        
                        return [
                            {
                                id: validTemplateId,
                                name: 'Test Template',
                                version: '1.0.0',
                                data: {
                                    screens: [
                                        {
                                            path: '/home',
                                            title: 'Home',
                                            components: []
                                        }
                                    ]
                                }
                            },
                            {
                                id: 'another-template-id',
                                name: 'Another Template',
                                version: '1.0.0'
                            }
                        ];
                    }),
                    findOne: jest.fn().mockImplementation(({ where }) => {
                        if (where.id === validTemplateId) {
                            return {
                                id: validTemplateId,
                                name: 'Test Template',
                                version: '1.0.0',
                                data: {
                                    screens: [
                                        {
                                            path: '/home',
                                            title: 'Home',
                                            components: []
                                        }
                                    ]
                                }
                            };
                        }
                        return null;
                    }),
                    create: jest.fn().mockImplementation((data) => ({ ...data, id: 'new-template-id' })),
                    save: jest.fn().mockImplementation((data) => ({ ...data, id: data.id || 'new-template-id' })),
                    remove: jest.fn().mockResolvedValue(undefined)
                };
            }),
            transaction: jest.fn().mockImplementation(async (callback) => {
                return await callback({
                    save: jest.fn().mockImplementation((data) => ({ ...data, id: data.id || 'new-id' }))
                });
            })
        }
    })
}));

describe('Templates Router', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/v1/templates', templatesRouter);
        
        // Reset all mocks
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('should return all templates', async () => {
            const response = await request(app).get('/api/v1/templates');
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveLength(2);
            expect(response.body[0].name).toBe('Test Template');
        });
    });
    
    describe('GET /category/:category', () => {
        it('should return templates by category', async () => {
            const response = await request(app).get('/api/v1/templates/category/dashboard');
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].category).toBe('dashboard');
        });
    });
    
    describe('GET /:templateId', () => {
        it('should return a template by ID', async () => {
            const templateId = '87654321-4321-4321-4321-210987654321';
            const response = await request(app).get(`/api/v1/templates/${templateId}`);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.name).toBe('Test Template');
        });
        
        it('should return 404 for non-existent template', async () => {
            const templateId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
            const response = await request(app).get(`/api/v1/templates/${templateId}`);
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.error).toBe(`Template ${templateId} not found`);
        });
        
        it('should return 400 for invalid template ID format', async () => {
            const response = await request(app).get('/api/v1/templates/invalid-id');
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe('Invalid Template ID format');
        });
    });
    
    describe('POST /create-from-uiflow/:uiFlowId', () => {
        it('should create a template from a UI flow', async () => {
            const uiFlowId = '12345678-1234-1234-1234-123456789012';
            const templateData = {
                name: 'New Template',
                description: 'Template created from UI flow',
                category: 'form'
            };
            
            const response = await request(app)
                .post(`/api/v1/templates/create-from-uiflow/${uiFlowId}`)
                .send(templateData);
            
            expect(response.status).toBe(StatusCodes.CREATED);
            expect(response.body.name).toBe('New Template');
        });
        
        it('should return 400 for missing required fields', async () => {
            const uiFlowId = '12345678-1234-1234-1234-123456789012';
            const response = await request(app)
                .post(`/api/v1/templates/create-from-uiflow/${uiFlowId}`)
                .send({});
            
            expect(response.status).toBe(StatusCodes.BAD_REQUEST);
            expect(response.body.error).toBe('Missing required field: name');
        });
    });
    
    describe('DELETE /:templateId', () => {
        it('should delete a template', async () => {
            const templateId = '87654321-4321-4321-4321-210987654321';
            const response = await request(app).delete(`/api/v1/templates/${templateId}`);
            
            expect(response.status).toBe(StatusCodes.NO_CONTENT);
        });
        
        it('should return 404 for non-existent template', async () => {
            const templateId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
            const response = await request(app).delete(`/api/v1/templates/${templateId}`);
            
            expect(response.status).toBe(StatusCodes.NOT_FOUND);
            expect(response.body.error).toBe(`Template ${templateId} not found`);
        });
    });
    
    describe('PATCH /:templateId', () => {
        it('should update a template', async () => {
            const templateId = '87654321-4321-4321-4321-210987654321';
            const updateData = {
                name: 'Updated Template Name'
            };
            
            const response = await request(app)
                .patch(`/api/v1/templates/${templateId}`)
                .send(updateData);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.name).toBe('Updated Template Name');
        });
        
        it('should update version if data is updated', async () => {
            const templateId = '87654321-4321-4321-4321-210987654321';
            const updateData = {
                data: {
                    screens: [
                        {
                            path: '/new-home',
                            title: 'New Home',
                            components: []
                        }
                    ]
                }
            };
            
            const response = await request(app)
                .patch(`/api/v1/templates/${templateId}`)
                .send(updateData);
            
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.version).not.toBe('1.0.0');
        });
    });
}); 