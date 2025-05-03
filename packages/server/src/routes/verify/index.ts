import express from 'express'
import apikeyController from '../../controllers/apikey'
import { apiKeyRateLimiter, exponentialBackoff } from '../../middlewares/rateLimit'
const router = express.Router()

// READ
router.get(['/apikey/', '/apikey/:apikey'],
    apiKeyRateLimiter('verify'),
    exponentialBackoff(),
    apikeyController.verifyApiKey
)

export default router
