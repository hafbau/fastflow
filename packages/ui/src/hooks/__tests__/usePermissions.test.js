import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { AuthContext } from '../../contexts/AuthContext';
import usePermissions from '../usePermissions';

// Define test cases for different user scenarios
const testCases = [
  {
    name: 'system admin',
    context: {
      user: { 
        is_system_admin: true 
      },
      currentOrganization: null,
      currentWorkspace: null,
    },
    expected: {
      isSystemAdmin: true,
      isOrgAdmin: false,
      isOrgMember: false,
      canManageUsers: true,
      canManageOrgSettings: true,
    }
  },
  {
    name: 'organization admin',
    context: {
      user: { 
        is_system_admin: false 
      },
      currentOrganization: { 
        id: 'org-1', 
        role: 'admin' 
      },
      currentWorkspace: null,
    },
    expected: {
      isSystemAdmin: false,
      isOrgAdmin: true,
      isOrgMember: true,
      canCreateWorkspace: true,
      canManageOrgSettings: true,
      canManageOrgMembers: true,
    }
  },
  {
    name: 'organization member',
    context: {
      user: { 
        is_system_admin: false 
      },
      currentOrganization: { 
        id: 'org-1', 
        role: 'member' 
      },
      currentWorkspace: null,
    },
    expected: {
      isSystemAdmin: false,
      isOrgAdmin: false,
      isOrgMember: true,
      canCreateWorkspace: false,
      canManageOrgSettings: false,
      canManageOrgMembers: false,
      canViewOrgMembers: true,
    }
  },
  {
    name: 'workspace admin',
    context: {
      user: { 
        is_system_admin: false 
      },
      currentOrganization: { 
        id: 'org-1', 
        role: 'member' 
      },
      currentWorkspace: { 
        id: 'workspace-1', 
        role: 'admin' 
      },
    },
    expected: {
      isSystemAdmin: false,
      isOrgAdmin: false,
      isOrgMember: true,
      isWorkspaceAdmin: true,
      isWorkspaceMember: true,
      canManageWorkspaceSettings: true,
      canManageWorkspaceMembers: true,
      canViewWorkspaceMembers: true,
    }
  },
  {
    name: 'workspace member',
    context: {
      user: { 
        is_system_admin: false 
      },
      currentOrganization: { 
        id: 'org-1', 
        role: 'member' 
      },
      currentWorkspace: { 
        id: 'workspace-1', 
        role: 'member' 
      },
    },
    expected: {
      isSystemAdmin: false,
      isOrgAdmin: false,
      isOrgMember: true,
      isWorkspaceAdmin: false,
      isWorkspaceMember: true,
      canViewWorkspaceMembers: true,
      canManageWorkspaceSettings: false,
      canManageWorkspaceMembers: false,
    }
  },
  {
    name: 'read-only user',
    context: {
      user: { 
        is_system_admin: false 
      },
      currentOrganization: { 
        id: 'org-1', 
        role: 'readonly' 
      },
      currentWorkspace: { 
        id: 'workspace-1', 
        role: 'readonly' 
      },
    },
    expected: {
      isSystemAdmin: false,
      isOrgAdmin: false,
      isOrgMember: true,
      isOrgReadOnly: true,
      isWorkspaceAdmin: false,
      isWorkspaceMember: true,
      isWorkspaceReadOnly: true,
      canManageOrgSettings: false,
      canManageWorkspaceSettings: false,
      canViewOrgMembers: true,
      canViewWorkspaceMembers: true,
    }
  }
];

// Wrap the hook with the AuthContext provider
const wrapper = (contextValue) => ({ children }) => (
  <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
);

describe('usePermissions hook', () => {
  // Test all scenarios defined in testCases
  testCases.forEach(testCase => {
    describe(`for ${testCase.name}`, () => {
      let result;
      
      beforeEach(() => {
        const { result: hookResult } = renderHook(() => usePermissions(), {
          wrapper: wrapper(testCase.context)
        });
        result = hookResult.current;
      });
      
      // Test each expected permission
      Object.entries(testCase.expected).forEach(([permission, expectedValue]) => {
        test(`${permission} should be ${expectedValue}`, () => {
          expect(result[permission]).toBe(expectedValue);
        });
      });
      
      // Test the generic hasPermission method
      test('hasPermission method should work correctly', () => {
        // Check a permission that should be true
        const truePermission = Object.entries(testCase.expected)
          .find(([_, value]) => value === true)?.[0];
          
        // Check a permission that should be false
        const falsePermission = Object.entries(testCase.expected)
          .find(([_, value]) => value === false)?.[0];
        
        if (truePermission) {
          expect(result.hasPermission(truePermission)).toBe(true);
        }
        
        if (falsePermission) {
          expect(result.hasPermission(falsePermission)).toBe(false);
        }
      });
    });
  });
  
  // Test invalid permissions handling
  test('hasPermission should return false for invalid permissions', () => {
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper({
        user: { is_system_admin: false },
        currentOrganization: null,
        currentWorkspace: null,
      })
    });
    
    expect(result.current.hasPermission('nonExistentPermission')).toBe(false);
    expect(result.current.hasPermission(null)).toBe(false);
    expect(result.current.hasPermission(undefined)).toBe(false);
  });
});
