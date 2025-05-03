import express from 'express'
import userLifecycleController from '../controllers/UserLifecycleController'
import { authenticateUser } from '../middleware/auth'

const router = express.Router()

// Apply authentication middleware to all routes
router.use(authenticateUser)

// User lifecycle state routes
router.post('/events', userLifecycleController.triggerLifecycleEvent)
router.get('/users/:userId/states', userLifecycleController.getUserLifecycleStateHistory)
router.get('/users/:userId/state/current', userLifecycleController.getUserCurrentLifecycleState)
router.get('/users/:userId/actions', userLifecycleController.getUserProvisioningActions)

// Provisioning action routes
router.get('/actions/pending', userLifecycleController.getPendingApprovalActions)
router.post('/actions/:actionId/approve', userLifecycleController.approveAction)
router.post('/actions/:actionId/reject', userLifecycleController.rejectAction)

// Provisioning rule routes
router.post('/rules', userLifecycleController.createProvisioningRule)
router.get('/rules', userLifecycleController.getAllProvisioningRules)
router.get('/rules/:ruleId', userLifecycleController.getProvisioningRuleById)
router.put('/rules/:ruleId', userLifecycleController.updateProvisioningRule)
router.delete('/rules/:ruleId', userLifecycleController.deleteProvisioningRule)

export default router