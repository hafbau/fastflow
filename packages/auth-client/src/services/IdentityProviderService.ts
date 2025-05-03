import { authService } from './AuthService';
import { UserProfile, IdentityProviderSession } from '../types/auth';

/**
 * Identity provider configuration interface
 */
export interface IdentityProviderConfig {
  id: string;
  name: string;
  type: string;
  organizationId: string;
  status: string;
  metadata?: Record<string, any>;
}

/**
 * Identity provider attribute interface
 */
export interface IdentityProviderAttribute {
  id: string;
  identityProviderId: string;
  name: string;
  value: string;
  isSecret: boolean;
}

/**
 * Service for interacting with identity providers
 */
export class IdentityProviderService {
  private static instance: IdentityProviderService;
  private apiBaseUrl: string;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || '';
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): IdentityProviderService {
    if (!IdentityProviderService.instance) {
      IdentityProviderService.instance = new IdentityProviderService();
    }
    return IdentityProviderService.instance;
  }

  /**
   * Get all identity providers for an organization
   * @param organizationId Organization ID
   * @returns List of identity providers
   */
  public async getProvidersForOrganization(organizationId: string): Promise<IdentityProviderConfig[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/identity-providers/organization/${organizationId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch identity providers: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching identity providers:', error);
      return [];
    }
  }

  /**
   * Get an identity provider by ID
   * @param providerId Provider ID
   * @returns Identity provider configuration
   */
  public async getProviderById(providerId: string): Promise<IdentityProviderConfig | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/identity-providers/${providerId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch identity provider: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching identity provider:', error);
      return null;
    }
  }

  /**
   * Initiate authentication with an identity provider
   * @param providerId Provider ID
   * @returns Redirect URL
   */
  public async initiateAuthentication(providerId: string): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/identity-providers/${providerId}/auth/initiate`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to initiate authentication: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.redirectUrl;
    } catch (error) {
      console.error('Error initiating authentication:', error);
      throw error;
    }
  }

  /**
   * Get the current user's identity provider sessions
   * @returns List of identity provider sessions
   */
  public async getUserSessions(): Promise<IdentityProviderSession[]> {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        return [];
      }
      
      const response = await fetch(`${this.apiBaseUrl}/api/identity-providers/sessions/user`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user sessions: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      return [];
    }
  }

  /**
   * Logout from an identity provider
   * @param providerId Provider ID
   * @param sessionId Session ID
   */
  public async logout(providerId: string, sessionId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/identity-providers/${providerId}/auth/logout/${sessionId}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to logout: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error logging out from identity provider:', error);
      throw error;
    }
  }

  /**
   * Get user profile from an identity provider
   * @param providerId Provider ID
   * @param sessionId Session ID
   * @returns User profile
   */
  public async getUserProfile(providerId: string, sessionId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/identity-providers/${providerId}/profile/${sessionId}`,
        {
          credentials: 'include'
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }
}

// Export singleton instance
export const identityProviderService = IdentityProviderService.getInstance();