import client from './client'

const getAllUIFlows = () => client.get('/ui-flows')
const getUIFlowById = (id) => client.get(`/ui-flows/${id}`)
const createUIFlow = (body) => client.post('/ui-flows', body)
const updateUIFlow = (id, body) => client.patch(`/ui-flows/${id}`, body)
const deleteUIFlow = (id) => client.delete(`/ui-flows/${id}`)
const deployUIFlow = (id) => client.post(`/ui-flows/${id}/deploy`)
const undeployUIFlow = (id) => client.post(`/ui-flows/${id}/undeploy`)

export default {
    getAllUIFlows,
    getUIFlowById,
    createUIFlow,
    updateUIFlow,
    deleteUIFlow,
    deployUIFlow,
    undeployUIFlow
} 