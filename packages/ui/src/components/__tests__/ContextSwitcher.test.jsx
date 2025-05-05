import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContextSwitcher from '../ContextSwitcher';
import { AuthContext } from '../../contexts/AuthContext';
import usePermissions from '../../hooks/usePermissions';

// Mock the usePermissions hook
jest.mock('../../hooks/usePermissions');

// Sample data for testing
const mockOrganizations = [
  { id: 'org-1', name: 'Organization 1' },
  { id: 'org-2', name: 'Organization 2' },
];

const mockWorkspaces = [
  { id: 'workspace-1', name: 'Workspace 1' },
  { id: 'workspace-2', name: 'Workspace 2' },
];

// Mock auth context values
const defaultAuthContext = {
  user: { id: 'user-1', email: 'user@example.com' },
  currentOrganization: mockOrganizations[0],
  currentWorkspace: mockWorkspaces[0],
  getUserOrganizations: jest.fn().mockResolvedValue(mockOrganizations),
  getUserWorkspaces: jest.fn().mockResolvedValue(mockWorkspaces),
  setActiveOrganization: jest.fn(),
  setActiveWorkspace: jest.fn(),
};

// Create a custom render function with AuthContext
const renderWithAuth = (ui, providerProps = {}) => {
  return render(
    <AuthContext.Provider value={{ ...defaultAuthContext, ...providerProps }}>
      {ui}
    </AuthContext.Provider>
  );
};

describe('ContextSwitcher Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default permissions mock
    usePermissions.mockReturnValue({
      canCreateWorkspace: true,
      hasPermission: (permission) => permission === 'canCreateWorkspace',
    });
  });

  test('renders organization and workspace selectors', async () => {
    renderWithAuth(<ContextSwitcher />);
    
    // Check organization label and selector are rendered
    expect(screen.getByText('Organization')).toBeInTheDocument();
    
    // Wait for organizations to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Check workspace label and selector are rendered (since we have a current organization)
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    
    // Wait for workspaces to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserWorkspaces).toHaveBeenCalledWith('org-1');
    });
  });

  test('shows loading state while fetching organizations', () => {
    // Override the getUserOrganizations to not resolve immediately
    const getUserOrganizationsMock = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    renderWithAuth(
      <ContextSwitcher />, 
      { getUserOrganizations: getUserOrganizationsMock }
    );
    
    // Check for loading indicator
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows loading state while fetching workspaces', async () => {
    // Override the getUserWorkspaces to not resolve immediately
    const getUserWorkspacesMock = jest.fn().mockImplementation(() => new Promise(() => {}));
    
    renderWithAuth(
      <ContextSwitcher />, 
      { getUserWorkspaces: getUserWorkspacesMock }
    );
    
    // Wait for organizations to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Check for loading indicator in workspace selector
    expect(screen.getAllByText('Loading...')[1]).toBeInTheDocument();
  });

  test('displays organizations in dropdown', async () => {
    renderWithAuth(<ContextSwitcher />);
    
    // Wait for organizations to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Open organization dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-organization').querySelector('input'));
    
    // Check that organizations are in the dropdown
    expect(screen.getByText('Organization 1')).toBeInTheDocument();
    expect(screen.getByText('Organization 2')).toBeInTheDocument();
    expect(screen.getByText('Create New Organization')).toBeInTheDocument();
  });

  test('displays workspaces in dropdown', async () => {
    renderWithAuth(<ContextSwitcher />);
    
    // Wait for workspaces to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserWorkspaces).toHaveBeenCalled();
    });
    
    // Open workspace dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-workspace').querySelector('input'));
    
    // Check that workspaces are in the dropdown
    expect(screen.getByText('Workspace 1')).toBeInTheDocument();
    expect(screen.getByText('Workspace 2')).toBeInTheDocument();
    expect(screen.getByText('Create New Workspace')).toBeInTheDocument();
  });

  test('calls setActiveOrganization when selecting an organization', async () => {
    renderWithAuth(<ContextSwitcher />);
    
    // Wait for organizations to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Open organization dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-organization').querySelector('input'));
    
    // Select the second organization
    fireEvent.click(screen.getByText('Organization 2'));
    
    // Check that setActiveOrganization was called with correct ID
    expect(defaultAuthContext.setActiveOrganization).toHaveBeenCalledWith('org-2');
  });

  test('calls setActiveWorkspace when selecting a workspace', async () => {
    renderWithAuth(<ContextSwitcher />);
    
    // Wait for workspaces to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserWorkspaces).toHaveBeenCalled();
    });
    
    // Open workspace dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-workspace').querySelector('input'));
    
    // Select the second workspace
    fireEvent.click(screen.getByText('Workspace 2'));
    
    // Check that setActiveWorkspace was called with correct IDs
    expect(defaultAuthContext.setActiveWorkspace).toHaveBeenCalledWith('org-1', 'workspace-2');
  });

  test('calls onCreateOrganization when "Create New Organization" is clicked', async () => {
    const onCreateOrganization = jest.fn();
    renderWithAuth(<ContextSwitcher onCreateOrganization={onCreateOrganization} />);
    
    // Wait for organizations to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Open organization dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-organization').querySelector('input'));
    
    // Click "Create New Organization"
    fireEvent.click(screen.getByText('Create New Organization'));
    
    // Check that onCreateOrganization was called
    expect(onCreateOrganization).toHaveBeenCalled();
  });

  test('calls onCreateWorkspace when "Create New Workspace" is clicked', async () => {
    const onCreateWorkspace = jest.fn();
    renderWithAuth(<ContextSwitcher onCreateWorkspace={onCreateWorkspace} />);
    
    // Wait for workspaces to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserWorkspaces).toHaveBeenCalled();
    });
    
    // Open workspace dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-workspace').querySelector('input'));
    
    // Click "Create New Workspace"
    fireEvent.click(screen.getByText('Create New Workspace'));
    
    // Check that onCreateWorkspace was called
    expect(onCreateWorkspace).toHaveBeenCalled();
  });

  test('hides "Create New Workspace" when user lacks permission', async () => {
    // Mock permissions to remove workspace creation permission
    usePermissions.mockReturnValue({
      canCreateWorkspace: false,
      hasPermission: () => false,
    });
    
    renderWithAuth(<ContextSwitcher />);
    
    // Wait for workspaces to load
    await waitFor(() => {
      expect(defaultAuthContext.getUserWorkspaces).toHaveBeenCalled();
    });
    
    // Open workspace dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-workspace').querySelector('input'));
    
    // "Create New Workspace" should not be present
    expect(screen.queryByText('Create New Workspace')).not.toBeInTheDocument();
  });

  test('handles no organizations scenario', async () => {
    // Mock empty organizations list
    const emptyOrgsAuth = {
      ...defaultAuthContext,
      getUserOrganizations: jest.fn().mockResolvedValue([]),
      currentOrganization: null,
      currentWorkspace: null,
    };
    
    renderWithAuth(<ContextSwitcher />, emptyOrgsAuth);
    
    // Wait for empty organizations to load
    await waitFor(() => {
      expect(emptyOrgsAuth.getUserOrganizations).toHaveBeenCalled();
    });
    
    // Open organization dropdown
    fireEvent.mouseDown(screen.getByTestId('context-switcher-organization').querySelector('input'));
    
    // Should show "No organizations found"
    expect(screen.getByText('No organizations found')).toBeInTheDocument();
    
    // Workspace selector should not be present
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
  });
});
