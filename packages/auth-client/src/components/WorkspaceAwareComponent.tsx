import React from 'react';
import { useWorkspacePermission, useWorkspace } from '../hooks/useWorkspaceContext';

interface WorkspaceAwareComponentProps {
  resourceType: string;
  requiredAction: string;
  fallbackMessage?: string;
  children: React.ReactNode;
}

/**
 * A component that conditionally renders children based on workspace permissions
 * 
 * @example
 * <WorkspaceAwareComponent resourceType="chatflows" requiredAction="create">
 *   <button>Create New Chatflow</button>
 * </WorkspaceAwareComponent>
 */
export const WorkspaceAwareComponent: React.FC<WorkspaceAwareComponentProps> = ({
  resourceType,
  requiredAction,
  fallbackMessage = "You don't have permission to perform this action",
  children
}) => {
  const { hasPermission, isLoading } = useWorkspacePermission(resourceType, requiredAction);
  const { workspaceId } = useWorkspace();
  
  if (isLoading) {
    return <div>Loading permissions...</div>;
  }
  
  if (!workspaceId) {
    return <div>Please select a workspace</div>;
  }
  
  return hasPermission ? (
    <>{children}</>
  ) : (
    <div className="permission-denied">{fallbackMessage}</div>
  );
};

/**
 * A component that renders different content based on the current workspace
 */
export const CurrentWorkspaceInfo: React.FC = () => {
  const { workspaceId, organizationId, isLoading } = useWorkspace();
  
  if (isLoading) {
    return <div>Loading workspace info...</div>;
  }
  
  if (!organizationId) {
    return <div>No organization selected</div>;
  }
  
  if (!workspaceId) {
    return <div>No workspace selected</div>;
  }
  
  return (
    <div className="workspace-info">
      <h3>Current Workspace Context</h3>
      <p>Organization ID: {organizationId}</p>
      <p>Workspace ID: {workspaceId}</p>
    </div>
  );
}; 