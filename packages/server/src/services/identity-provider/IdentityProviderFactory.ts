import { IdentityProviderType } from '../../database/entities/IdentityProvider'
import { IIdentityProvider, IdentityProviderFactory } from './interfaces'
import { SAMLIdentityProvider } from './providers/SAMLIdentityProvider'
import { OIDCIdentityProvider } from './providers/OIDCIdentityProvider'
import logger from '../../utils/logger'

/**
 * Factory for creating identity provider instances
 */
export class DefaultIdentityProviderFactory implements IdentityProviderFactory {
    /**
     * Create a provider instance based on the provider type
     * @param type Identity provider type
     * @returns Identity provider instance
     */
    createProvider(type: IdentityProviderType): IIdentityProvider {
        logger.debug(`Creating identity provider of type: ${type}`)
        
        switch (type) {
            case IdentityProviderType.SAML:
                return new SAMLIdentityProvider()
            case IdentityProviderType.OIDC:
                return new OIDCIdentityProvider()
            default:
                throw new Error(`Unsupported identity provider type: ${type}`)
        }
    }
}

// Singleton instance
export const identityProviderFactory = new DefaultIdentityProviderFactory()