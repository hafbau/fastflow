import React from 'react';
import WorkspaceLayout from './WorkspaceLayout';
import { WorkspaceProvider } from '../contexts/WorkspaceContext';

/**
 * WorkspaceLayoutWithProvider component
 * Wraps WorkspaceLayout with the WorkspaceProvider to provide workspace context
 */
const WorkspaceLayoutWithProvider = () => {
  return (
    <WorkspaceProvider>
      <WorkspaceLayout />
    </WorkspaceProvider>
  );
};

export default WorkspaceLayoutWithProvider;