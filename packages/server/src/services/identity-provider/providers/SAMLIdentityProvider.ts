import { Request, Response } from 'express'
import { ServiceProvider, IdentityProvider as SAMLIdP, setSchemaValidator } from 'samlify'
import { v4 as uuidv4 } from 'uuid'
import { BaseIdentityProvider } from '../BaseIdentityProvider'
import { 
    IdentityProviderType 
} from '../../../database/entities/IdentityProvider'
import { IdentityProviderSession } from '../../../database/entities/IdentityProviderSession'
import { AuthenticationResult, ProviderConfig } from '../interfaces'
import logger from '../../../utils/logger'
import * as xml2js from 'xml2js'

// Disable schema validation for development
setSchemaValidator({
    validate: (response) => {
        return Promise.resolve('skipped')
    }
})

export class SAMLIdentityProvider extends BaseIdentityProvider {
    type = IdentityProviderType.SAML
    private sp: any = null
    private idp: any = null
    
    async initialize(providerConfig: ProviderConfig): Promise<boolean> {
        try {
            await super.initialize(providerConfig)
            
            // Create service provider
            this.sp = ServiceProvider({
                entityID: this.config.config.entityID || `${process.env.APP_URL}/saml/metadata/${this.config.id}`,
                assertionConsumerService: [{
                    Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
                    Location: `${process.env.APP_URL}/api/v1/auth/saml/callback/${this.config.id}`
                }],
                singleLogoutService: [{
                    Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
                    Location: `${process.env.APP_URL}/api/v1/auth/saml/logout/callback/${this.config.id}`
                }],
                authnRequestsSigned: this.config.config.authnRequestsSigned || false,
                wantAssertionsSigned: this.config.config.wantAssertionsSigned || false
            })
            
            // If private key and certificate are provided, set them
            if (this.config.config.privateKey && this.config.config.signingCert) {
                this.sp.addPrivateKey(
                    Buffer.from(this.config.config.privateKey, 'utf-8'),
                    'pem'
                )
                
                this.sp.addX509Certificate(
                    Buffer.from(this.config.config.signingCert, 'utf-8')
                )
            }
            
            // Create identity provider
            this.idp = SAMLIdP({
                entityID: this.config.config.idpEntityID,
                singleSignOnService: [{
                    Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
                    Location: this.config.config.singleSignOnServiceUrl
                }],
                singleLogoutService: this.config.config.singleLogoutServiceUrl ? [{
                    Binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
                    Location: this.config.config.singleLogoutServiceUrl
                }] : undefined,
                wantAuthnRequestsSigned: this.config.config.wantAuthnRequestsSigned || false
            })
            
            // Add IdP certificate
            if (this.config.config.idpCert) {
                this.idp.addX509Certificate(
                    Buffer.from(this.config.config.idpCert, 'utf-8')
                )
            }
            
            return true
        } catch (error) {
            logger.error(`[SAML] Failed to initialize provider: ${error}`)
            return false
        }
    }
    
    async generateServiceProviderMetadata(): Promise<string> {
        if (!this.sp) {
            throw new Error('SAML service provider not initialized')
        }
        
        return this.sp.getMetadata()
    }
    
    async parseIdentityProviderMetadata(metadata: string): Promise<any> {
        try {
            // Parse XML metadata
            const parser = new xml2js.Parser({ explicitArray: false })
            const result = await parser.parseStringPromise(metadata)
            
            // Extract relevant information
            const entityDescriptor = result['md:EntityDescriptor'] || result.EntityDescriptor
            if (!entityDescriptor) {
                throw new Error('Invalid SAML metadata: EntityDescriptor not found')
            }
            
            const idpDescriptor = entityDescriptor['md:IDPSSODescriptor'] || 
                                 entityDescriptor.IDPSSODescriptor
            
            if (!idpDescriptor) {
                throw new Error('Invalid SAML metadata: IDPSSODescriptor not found')
            }
            
            // Extract entity ID
            const idpEntityID = entityDescriptor.$.entityID
            
            // Extract SSO service
            const ssoService = idpDescriptor['md:SingleSignOnService'] || 
                              idpDescriptor.SingleSignOnService
            
            let singleSignOnServiceUrl = ''
            if (Array.isArray(ssoService)) {
                // Find HTTP-Redirect binding
                const redirectBinding = ssoService.find(
                    (s: any) => s.$.Binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
                )
                singleSignOnServiceUrl = redirectBinding?.$.Location || ssoService[0].$.Location
            } else if (ssoService) {
                singleSignOnServiceUrl = ssoService.$.Location
            }
            
            // Extract SLO service
            const sloService = idpDescriptor['md:SingleLogoutService'] || 
                              idpDescriptor.SingleLogoutService
            
            let singleLogoutServiceUrl = ''
            if (Array.isArray(sloService)) {
                // Find HTTP-Redirect binding
                const redirectBinding = sloService.find(
                    (s: any) => s.$.Binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect'
                )
                singleLogoutServiceUrl = redirectBinding?.$.Location || sloService[0].$.Location
            } else if (sloService) {
                singleLogoutServiceUrl = sloService.$.Location
            }
            
            // Extract certificate
            let idpCert = ''
            const keyDescriptor = idpDescriptor['md:KeyDescriptor'] || 
                                 idpDescriptor.KeyDescriptor
            
            if (Array.isArray(keyDescriptor)) {
                // Find signing key
                const signingKey = keyDescriptor.find(
                    (k: any) => !k.$.use || k.$.use === 'signing'
                )
                const certData = signingKey?.['ds:KeyInfo']?.['ds:X509Data']?.['ds:X509Certificate'] || 
                                signingKey?.KeyInfo?.X509Data?.X509Certificate
                
                if (certData) {
                    idpCert = certData
                }
            } else if (keyDescriptor) {
                const certData = keyDescriptor['ds:KeyInfo']?.['ds:X509Data']?.['ds:X509Certificate'] || 
                                keyDescriptor.KeyInfo?.X509Data?.X509Certificate
                
                if (certData) {
                    idpCert = certData
                }
            }
            
            // Format certificate with header and footer
            if (idpCert) {
                idpCert = `-----BEGIN CERTIFICATE-----\n${idpCert}\n-----END CERTIFICATE-----`
            }
            
            return {
                idpEntityID,
                singleSignOnServiceUrl,
                singleLogoutServiceUrl,
                idpCert
            }
        } catch (error) {
            logger.error(`[SAML] Failed to parse IdP metadata: ${error}`)
            throw error
        }
    }
    
    async initiateAuthentication(req: Request, res: Response): Promise<void> {
        try {
            if (!this.sp || !this.idp) {
                throw new Error('SAML provider not initialized')
            }
            
            // Store redirect URL in session
            // @ts-ignore - Add samlRedirectUrl to session
            req.session.samlRedirectUrl = typeof req.query.redirectUrl === 'string' ? req.query.redirectUrl : '/'
            
            // Generate SAML request
            const { context } = this.sp.createLoginRequest(this.idp, 'redirect')
            
            // Redirect to IdP
            res.redirect(context)
        } catch (error) {
            logger.error(`[SAML] Authentication initiation error: ${error}`)
            res.status(500).json({ error: 'Failed to initiate SAML authentication' })
        }
    }
    
    async handleCallback(req: Request, res: Response): Promise<AuthenticationResult> {
        try {
            if (!this.sp || !this.idp) {
                return this.createErrorResult('SAML provider not initialized')
            }
            
            // Get redirect URL from session
            // @ts-ignore - Access samlRedirectUrl from session
            const redirectUrl = req.session.samlRedirectUrl || '/'
            
            // Parse SAML response
            const samlResponse = req.body.SAMLResponse
            if (!samlResponse) {
                return this.createErrorResult('No SAML response found in request')
            }
            
            // Validate SAML response
            const parseResult = await this.sp.parseLoginResponse(this.idp, 'post', { body: req.body })
            
            // Extract user attributes
            const attributes = parseResult.extract.attributes
            const nameID = parseResult.extract.nameID
            
            // Map attributes to user profile
            const userProfile = this.mapAttributes(attributes, this.attributes)
            
            // Ensure we have an email
            if (!userProfile.email) {
                // Try to use nameID as email if it looks like an email
                if (nameID && nameID.includes('@')) {
                    userProfile.email = nameID
                } else {
                    return this.createErrorResult('No email found in SAML response')
                }
            }
            
            // Create session
            const session = {
                id: uuidv4(),
                identityProviderId: this.config.id,
                identityProvider: this.config,
                externalId: nameID || attributes.uid || attributes.nameID || userProfile.email,
                sessionData: {
                    samlResponse,
                    attributes
                },
                expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
                active: true,
                ipAddress: req.ip || '',
                userAgent: req.headers['user-agent'] || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: '' as string, // Will be set later when user is created/linked
                metadata: {}
            } as IdentityProviderSession;
            
            // Clean up session
            // @ts-ignore - Delete samlRedirectUrl from session
            delete req.session.samlRedirectUrl
            
            return this.createSuccessResult(userProfile, session, redirectUrl)
        } catch (error) {
            logger.error(`[SAML] Authentication callback error: ${error}`)
            return this.createErrorResult(`SAML authentication failed: ${(error as Error).message || 'Unknown error'}`)
        }
    }
    
    async logout(req: Request, res: Response, session: IdentityProviderSession): Promise<void> {
        try {
            if (!this.sp || !this.idp || !session) {
                throw new Error('Cannot perform logout: missing provider or session')
            }
            
            // Check if IdP supports SLO
            if (!this.config.config.singleLogoutServiceUrl) {
                // If no SLO URL, just redirect to home
                res.redirect('/')
                return
            }
            
            // Generate SAML logout request
            const { context } = this.sp.createLogoutRequest(this.idp, 'redirect', {
                nameID: session.externalId,
                sessionIndex: session.sessionData?.sessionIndex
            })
            
            // Redirect to IdP
            res.redirect(context)
        } catch (error) {
            logger.error(`[SAML] Logout error: ${error}`)
            res.redirect('/')
        }
    }
}