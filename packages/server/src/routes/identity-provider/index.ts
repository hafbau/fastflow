import { Router } from 'express'
import { verifyJWT } from '../../utils/supabase'
import { checkPermission } from '../../middleware/authorization'
import identityProviderController from './controller'

const router = Router()

// Authentication routes (public)
router.get('/auth/saml/login/:providerId', identityProviderController.initiateAuthentication)
router.post('/auth/saml/callback/:providerId', identityProviderController.handleCallback)
router.get('/auth/saml/metadata/:providerId', identityProviderController.getServiceProviderMetadata)
router.get('/auth/saml/logout/:providerId/:sessionId', identityProviderController.logout)

router.get('/auth/oidc/login/:providerId', identityProviderController.initiateAuthentication)
router.get('/auth/oidc/callback/:providerId', identityProviderController.handleCallback)
router.get('/auth/oidc/logout/:providerId/:sessionId', identityProviderController.logout)
router.get('/auth/oidc/logout/callback/:providerId', identityProviderController.handleLogoutCallback)

// Management routes (protected)
router.use('/identity-providers', verifyJWT)

// List providers for organization
router.get(
    '/identity-providers/organization/:organizationId',
    checkPermission('identity_provider:read'),
    identityProviderController.getProvidersForOrganization
)

// CRUD operations
router.get(
    '/identity-providers/:id',
    checkPermission('identity_provider:read'),
    identityProviderController.getProviderById
)

router.post(
    '/identity-providers',
    checkPermission('identity_provider:create'),
    identityProviderController.createProvider
)

router.put(
    '/identity-providers/:id',
    checkPermission('identity_provider:update'),
    identityProviderController.updateProvider
)

router.delete(
    '/identity-providers/:id',
    checkPermission('identity_provider:delete'),
    identityProviderController.deleteProvider
)

// Provider operations
router.post(
    '/identity-providers/:id/test',
    checkPermission('identity_provider:update'),
    identityProviderController.testProvider
)

router.post(
    '/identity-providers/:id/parse-metadata',
    checkPermission('identity_provider:update'),
    identityProviderController.parseIdentityProviderMetadata
)

router.post(
    '/identity-providers/:id/sync',
    checkPermission('identity_provider:update'),
    identityProviderController.synchronizeUsers
)

// Attribute mappings
router.get(
    '/identity-providers/:id/attributes',
    checkPermission('identity_provider:read'),
    identityProviderController.getAttributeMappings
)

router.post(
    '/identity-providers/:id/attributes',
    checkPermission('identity_provider:update'),
    identityProviderController.createAttributeMapping
)

router.put(
    '/identity-providers/:id/attributes/:attributeId',
    checkPermission('identity_provider:update'),
    identityProviderController.updateAttributeMapping
)

router.delete(
    '/identity-providers/:id/attributes/:attributeId',
    checkPermission('identity_provider:update'),
    identityProviderController.deleteAttributeMapping
)

export default router