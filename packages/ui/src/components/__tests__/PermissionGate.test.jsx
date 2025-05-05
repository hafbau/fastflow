import React from 'react';
import { render, screen } from '@testing-library/react';
import PermissionGate from '../PermissionGate';
import usePermissions from '../../hooks/usePermissions';

// Mock the usePermissions hook
jest.mock('../../hooks/usePermissions');

describe('PermissionGate Component', () => {
  const testContent = 'Protected Content';

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test('renders children when user has the specified permission', () => {
    // Mock the permissions hook to return true for the required permission
    usePermissions.mockReturnValue({
      canEditResource: true,
      hasPermission: (permission) => permission === 'canEditResource',
    });

    render(
      <PermissionGate permission="canEditResource">
        <div>{testContent}</div>
      </PermissionGate>
    );

    // Check that the protected content is rendered
    expect(screen.getByText(testContent)).toBeInTheDocument();
    // Verify the hook was called
    expect(usePermissions).toHaveBeenCalledTimes(1);
  });

  test('does not render children when user lacks the specified permission', () => {
    // Mock the permissions hook to return false for the required permission
    usePermissions.mockReturnValue({
      canEditResource: false,
      hasPermission: (permission) => permission === 'canEditResource' ? false : true,
    });

    render(
      <PermissionGate permission="canEditResource">
        <div>{testContent}</div>
      </PermissionGate>
    );

    // Check that the protected content is not rendered
    expect(screen.queryByText(testContent)).not.toBeInTheDocument();
    // Verify the hook was called
    expect(usePermissions).toHaveBeenCalledTimes(1);
  });

  test('renders fallback content when user lacks permission and fallback is provided', () => {
    // Mock the permissions hook to return false for the required permission
    usePermissions.mockReturnValue({
      canViewResource: false,
      hasPermission: () => false,
    });

    const fallbackText = 'Permission Denied';

    render(
      <PermissionGate 
        permission="canViewResource"
        fallback={<div>{fallbackText}</div>}
      >
        <div>{testContent}</div>
      </PermissionGate>
    );

    // Check that the fallback content is rendered
    expect(screen.getByText(fallbackText)).toBeInTheDocument();
    // Check that the protected content is not rendered
    expect(screen.queryByText(testContent)).not.toBeInTheDocument();
  });

  test('handles array of permissions with ANY logic', () => {
    // Mock the permissions hook to return mixed permissions
    usePermissions.mockReturnValue({
      canEditResource: false,
      canDeleteResource: true,
      hasPermission: (permission) => permission === 'canDeleteResource',
    });

    render(
      <PermissionGate 
        permission={['canEditResource', 'canDeleteResource']} 
        logic="ANY"
      >
        <div>{testContent}</div>
      </PermissionGate>
    );

    // Since one permission is true with ANY logic, the content should be rendered
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  test('handles array of permissions with ALL logic', () => {
    // Mock the permissions hook to return mixed permissions
    usePermissions.mockReturnValue({
      canEditResource: true,
      canDeleteResource: false,
      hasPermission: (permission) => permission === 'canEditResource',
    });

    render(
      <PermissionGate 
        permission={['canEditResource', 'canDeleteResource']} 
        logic="ALL"
      >
        <div>{testContent}</div>
      </PermissionGate>
    );

    // Since not all permissions are true with ALL logic, the content should not be rendered
    expect(screen.queryByText(testContent)).not.toBeInTheDocument();
  });

  test('renders nothing when children are not provided', () => {
    usePermissions.mockReturnValue({
      canEditResource: true,
      hasPermission: () => true,
    });

    const { container } = render(
      <PermissionGate permission="canEditResource" />
    );

    // The component should render nothing (empty)
    expect(container.firstChild).toBeNull();
  });
});
