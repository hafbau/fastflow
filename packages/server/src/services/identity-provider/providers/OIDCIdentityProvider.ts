import { Request, Response } from 'express'
import * as openidClient from 'openid-client'
import * as expressSession from 'express-session'
import { v4 as uuidv4 } from 'uuid'
import logger from '../../../utils/logger'

// Extend Express Request type to include session
declare module 'express-serve-static-core' {
    interface Request {
        session: expressSession.Session & {
            codeVerifier?: string;
            oidcRedirectUrl?: string;
            oidcState?: string;
            oidcNonce?: string;
        }
    }
}
import { BaseIdentityProvider } from '../BaseIdentityProvider'
import {
    IdentityProviderType
} from '../../../database/entities/IdentityProvider'
import { IdentityProviderSession } from '../../../database/entities/IdentityProviderSession'
import { AuthenticationResult, ProviderConfig } from '../interfaces'

export class OIDCIdentityProvider extends BaseIdentityProvider {
    type = IdentityProviderType.OIDC
    private oidcConfig: openidClient.Configuration | null = null
    
    async initialize(providerConfig: ProviderConfig): Promise<boolean> {
        try {
            await super.initialize(providerConfig)
            
            // Discover the OIDC provider
            if (this.config.config.discoveryUrl) {
                const serverUrl = new URL(this.config.config.discoveryUrl)
                
                // Create client configuration
                this.oidcConfig = await openidClient.discovery(
                    serverUrl,
                    this.config.config.clientId,
                    {
                        client_secret: this.config.config.clientSecret,
                        redirect_uris: [`${process.env.APP_URL}/api/v1/auth/oidc/callback/${this.config.id}`],
                        post_logout_redirect_uris: [`${process.env.APP_URL}/api/v1/auth/oidc/logout/callback/${this.config.id}`],
                        token_endpoint_auth_method: this.config.config.tokenEndpointAuthMethod || 'client_secret_basic'
                    }
                )
            } else if (this.config.config.issuer) {
                // Manual configuration is not directly supported in the new API
                // We would need to create a custom server metadata object
                logger.error('[OIDC] Manual configuration is not supported with the current openid-client version')
                return false
            } else {
                throw new Error('OIDC provider configuration is missing discovery URL or issuer details')
            }
            
            return true
        } catch (error) {
            logger.error(`[OIDC] Failed to initialize provider: ${error}`)
            return false
        }
    }
    
    async generateServiceProviderMetadata(): Promise<string> {
        if (!this.oidcConfig) {
            throw new Error('OIDC client not initialized')
        }
        
        return JSON.stringify(this.oidcConfig.clientMetadata())
    }
    
    async parseIdentityProviderMetadata(metadata: string): Promise<any> {
        try {
            const config = JSON.parse(metadata)
            return {
                issuer: config.issuer,
                authorizationEndpoint: config.authorization_endpoint,
                tokenEndpoint: config.token_endpoint,
                userinfoEndpoint: config.userinfo_endpoint,
                jwksUri: config.jwks_uri
            }
        } catch (error) {
            logger.error(`[OIDC] Failed to parse IdP metadata: ${error}`)
            throw error
        }
    }
    
    async initiateAuthentication(req: Request, res: Response): Promise<void> {
        try {
            if (!this.oidcConfig) {
                throw new Error('OIDC client not initialized')
            }
            
            // Generate code verifier and challenge for PKCE
            const codeVerifier = openidClient.randomPKCECodeVerifier()
            const codeChallenge = await openidClient.calculatePKCECodeChallenge(codeVerifier)
            
            // Store code verifier in session for later use
            req.session.codeVerifier = codeVerifier
            
            // Store redirect URL in session
            req.session.oidcRedirectUrl = typeof req.query.redirectUrl === 'string' ? req.query.redirectUrl : '/'
            
            // Generate state parameter
            const state = openidClient.randomState()
            req.session.oidcState = state
            
            // Generate nonce
            const nonce = openidClient.randomNonce()
            req.session.oidcNonce = nonce
            
            // Generate authorization URL
            const authUrl = openidClient.buildAuthorizationUrl(this.oidcConfig, {
                scope: this.config.config.scope || 'openid profile email',
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
                state,
                nonce
            })
            
            // Redirect to authorization endpoint
            res.redirect(authUrl.href)
        } catch (error) {
            logger.error(`[OIDC] Authentication initiation error: ${error}`)
            res.status(500).json({ error: 'Failed to initiate OIDC authentication' })
        }
    }
    
    async handleCallback(req: Request, res: Response): Promise<AuthenticationResult> {
        try {
            if (!this.oidcConfig) {
                return this.createErrorResult('OIDC client not initialized')
            }
            
            // Verify state parameter
            if (req.query.state !== req.session.oidcState) {
                return this.createErrorResult('Invalid state parameter')
            }
            
            // Get code verifier from session
            const codeVerifier = req.session.codeVerifier
            if (!codeVerifier) {
                return this.createErrorResult('Code verifier not found in session')
            }
            
            // Get redirect URL from session
            const redirectUrl = req.session.oidcRedirectUrl || '/'
            
            // Create a URL object from the current request URL
            const currentUrl = new URL(req.url, `${req.protocol}://${req.get('host')}`)
            
            // Exchange authorization code for tokens
            const tokenSet = await openidClient.authorizationCodeGrant(
                this.oidcConfig,
                currentUrl,
                {
                    pkceCodeVerifier: codeVerifier,
                    expectedState: req.session.oidcState,
                    expectedNonce: req.session.oidcNonce
                }
            )
            
            // Get user info from the ID token claims
            let userInfo: any;
            try {
                userInfo = tokenSet.claims && typeof tokenSet.claims === 'function' ? tokenSet.claims() : null;
                if (!userInfo || !userInfo.sub) {
                    userInfo = { sub: 'unknown' };
                }
            } catch (error) {
                logger.error(`[OIDC] Failed to extract claims from token: ${error}`);
                userInfo = { sub: 'unknown' };
            }
            
            // Map attributes to user profile
            const userProfile = this.mapAttributes(userInfo, this.attributes)
            
            // Ensure we have an email
            if (!userProfile.email) {
                return this.createErrorResult('No email found in OIDC response')
            }
            
            // Create session
            const session = {
                id: uuidv4(),
                identityProviderId: this.config.id,
                identityProvider: this.config,
                externalId: userInfo.sub,
                sessionData: {
                    tokenSet: {
                        access_token: tokenSet.access_token,
                        id_token: tokenSet.id_token,
                        refresh_token: tokenSet.refresh_token,
                        token_type: tokenSet.token_type,
                        expires_at: tokenSet.expires_at
                    },
                    userInfo
                },
                expiresAt: tokenSet.expires_at ? new Date(Number(tokenSet.expires_at) * 1000) : new Date(Date.now() + 8 * 60 * 60 * 1000),
                active: true,
                ipAddress: req.ip || '',
                userAgent: req.headers['user-agent'] || '',
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: '' as string, // Will be set later when user is created/linked
                metadata: {}
            } as IdentityProviderSession;
            
            // Clean up session
            delete req.session.codeVerifier
            delete req.session.oidcState
            delete req.session.oidcNonce
            delete req.session.oidcRedirectUrl
            
            return this.createSuccessResult(userProfile, session, redirectUrl)
        } catch (error) {
            logger.error(`[OIDC] Authentication callback error: ${error}`)
            return this.createErrorResult(`OIDC authentication failed: ${(error as Error).message || 'Unknown error'}`)
        }
    }
    
    async logout(req: Request, res: Response, session: IdentityProviderSession): Promise<void> {
        try {
            if (!this.oidcConfig || !session) {
                throw new Error('Cannot perform logout: missing client or session')
            }
            
            // Get ID token from session
            const idToken = session.sessionData?.tokenSet?.id_token
            
            if (!idToken) {
                // If no ID token, just redirect to home
                res.redirect('/')
                return
            }
            
            // Generate end session URL
            const logoutUrl = openidClient.buildEndSessionUrl(this.oidcConfig, {
                id_token_hint: idToken,
                post_logout_redirect_uri: `${process.env.APP_URL}/api/v1/auth/oidc/logout/callback/${this.config.id}`
            })
            
            // Redirect to end session endpoint
            res.redirect(logoutUrl.href)
        } catch (error) {
            logger.error(`[OIDC] Logout error: ${error}`)
            res.redirect('/')
        }
    }
}