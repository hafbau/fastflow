import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useWorkspace, useOrganization } from '../hooks/useWorkspaceContext';

// This is a placeholder interface - replace with actual types from your API
interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

// This is a placeholder interface - replace with actual types from your API
interface Workspace {
  id: string;
  name: string;
  organizationId: string;
  iconUrl?: string;
}

/**
 * WorkspaceSwitcher component
 * Provides UI for switching between organizations and workspaces
 */
export const WorkspaceSwitcher: React.FC = () => {
  const { user } = useAuthContext();
  const { organizationId, switchOrganization } = useOrganization();
  const { workspaceId, switchWorkspace } = useWorkspace();
  
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/${user.id}/organizations`);
        const data = await response.json();
        setOrganizations(data);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [user]);
  
  // Fetch workspaces for the current organization
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!organizationId) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/organizations/${organizationId}/workspaces`);
        const data = await response.json();
        setWorkspaces(data);
      } catch (error) {
        console.error('Error fetching workspaces:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [organizationId]);
  
  // Handle organization selection
  const handleOrganizationChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrgId = e.target.value;
    try {
      await switchOrganization(newOrgId);
    } catch (error) {
      console.error('Error switching organization:', error);
    }
  };
  
  // Handle workspace selection
  const handleWorkspaceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newWorkspaceId = e.target.value;
    try {
      await switchWorkspace(newWorkspaceId);
    } catch (error) {
      console.error('Error switching workspace:', error);
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="workspace-switcher">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="organization-select">
            <label htmlFor="organization-select">Organization:</label>
            <select
              id="organization-select"
              value={organizationId || ''}
              onChange={handleOrganizationChange}
              disabled={isLoading}
            >
              <option value="" disabled>
                Select Organization
              </option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          
          {organizationId && (
            <div className="workspace-select">
              <label htmlFor="workspace-select">Workspace:</label>
              <select
                id="workspace-select"
                value={workspaceId || ''}
                onChange={handleWorkspaceChange}
                disabled={isLoading || !organizationId || workspaces.length === 0}
              >
                <option value="" disabled>
                  Select Workspace
                </option>
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 