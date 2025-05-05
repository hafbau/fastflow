# Implementation Plan for User Management and Organization/Workspace Management

This document outlines the detailed implementation plan for completing Task 3 (User Management) and Task 4 (Organization and Workspace Management) in the Flowstack project.

## Current Status

### Backend (Mostly Complete)
- **User Management**: 
  - `UserService` with registration, profile management, and admin features
  - `UserController` with appropriate endpoints
  - Supabase Auth integration
  
- **Organization/Workspace Management**:
  - Services and controllers for CRUD operations
  - Member management functionality
  - Invitation system with email notifications

### Frontend (Mostly Missing)
- No UI components for user registration, profile, or management
- No UI for organization/workspace management
- Missing invitation flows
- No context switching mechanism

## Admin Role Hierarchy

1. **System Admin**
   - Global access across all organizations and workspaces
   - Can manage all users, organizations, and system settings
   - Has access to system-wide analytics and audit logs

2. **Organization Admin**
   - Admin privileges within a specific organization
   - Can manage organization settings, members, and workspaces
   - Cannot access other organizations or system-level settings

3. **Workspace Admin**
   - Admin privileges within a specific workspace
   - Can manage workspace settings and members
   - Cannot modify organization settings or access other workspaces' admin features

## Implementation Plan

### Phase 1: User Management UI (Task 3)

#### 1.1 User Registration Flow
- Create registration form component with:
  - Basic registration (email/password via Supabase Auth)
  - Organization creation step (name, details)
  - User profile details (name, avatar, etc.)
- Implement email verification UI
- Create onboarding wizard to guide new users

#### 1.2 User Profile Management
- Build profile page component
- Create profile editing form
- Implement avatar upload/management
- Add password change functionality
- Build MFA setup interface

#### 1.3 User Administration

##### System Admin UI
- **User Listing**: Global view of all users across all organizations
- **User Creation**: Ability to create users and assign to any organization
- **User Administration**: Can modify any user's status, reset passwords, and assign system roles
- **Analytics Dashboard**: System-wide user metrics and activity

##### Organization Admin UI
- **User Listing**: Limited to users within their organization
- **User Invitation**: Can invite users to their organization only
- **User Administration**: Can modify organization members' roles and status
- **Analytics Dashboard**: Organization-specific user metrics

##### Workspace Admin UI
- **User Listing**: Limited to users within their workspace
- **User Invitation**: Can invite users to their workspace only
- **User Administration**: Can modify workspace members' roles
- **Analytics Dashboard**: Workspace-specific user metrics

#### 1.4 User Invitation Flows
- Create invitation UI for admins to invite users
- Build invitation acceptance page
- Implement email verification for invited users
- Create role assignment during invitation

### Phase 2: Organization & Workspace Management (Task 4)

#### 2.1 Organization Management UI

##### System Admin UI
- **Organization Management**: Create, view, edit, and delete any organization
- **Global Settings**: Configure system-wide settings affecting all organizations
- **Resource Allocation**: Manage resource limits for organizations

##### Organization Admin UI
- **Organization Management**: Edit their organization settings only
- **Organization Settings**: Configure organization-specific settings
- **Member Management**: Comprehensive organization member management

#### 2.2 Workspace Management UI

##### System Admin UI
- **Workspace Management**: Access all workspaces across all organizations

##### Organization Admin UI
- **Workspace Management**: Create, view, edit, and delete workspaces within their organization

##### Workspace Admin UI
- **Workspace Management**: Edit their workspace settings only
- **Member Management**: Limited to workspace member management
- **Resource Management**: Manage resources within workspace allocation limits

#### 2.3 Context Switching
- **System Admin**: Selector to navigate between any organization and workspace
- **Organization Admin**: Selector limited to their organization and its workspaces
- **Workspace Admin**: Selector limited to workspaces they have admin access to
- **Regular User**: Selector showing only organizations and workspaces they're members of

## Technical Implementation Approach

### 1. Permission-Based Component Rendering

```jsx
// Example of role-based component rendering
const UserManagementPage = () => {
  const { user, permissions } = useAuth();
  
  return (
    <div>
      <h1>User Management</h1>
      
      {/* System Admin only */}
      {permissions.hasSystemAdmin && (
        <SystemAdminControls />
      )}
      
      {/* Organization Admin */}
      {permissions.hasOrgAdmin && (
        <OrganizationAdminControls organizationId={currentOrganizationId} />
      )}
      
      {/* Workspace Admin */}
      {permissions.hasWorkspaceAdmin && (
        <WorkspaceAdminControls workspaceId={currentWorkspaceId} />
      )}
      
      {/* All users see this */}
      <UserProfileSection />
    </div>
  );
};
```

### 2. Role-Based API Access

- Implement middleware that checks user roles before allowing access to specific API endpoints
- Create role-specific API endpoints where necessary
- Return appropriate error messages for unauthorized access attempts

### 3. Context-Aware Navigation

- Build a navigation system that dynamically shows/hides options based on user role
- Implement breadcrumbs that show the current context (system/organization/workspace)
- Create role-specific dashboards as landing pages

## Component Structure

### User Management Components

```
UserManagement/
├── Registration/
│   ├── RegistrationForm.jsx
│   ├── EmailVerification.jsx
│   └── OnboardingWizard.jsx
├── Profile/
│   ├── UserProfile.jsx
│   ├── ProfileEditor.jsx
│   ├── AvatarUploader.jsx
│   ├── PasswordChange.jsx
│   └── MFASetup.jsx
├── Administration/
│   ├── UserListing.jsx
│   ├── UserSearch.jsx
│   ├── UserStatusManager.jsx
│   ├── PasswordReset.jsx
│   └── UserExport.jsx
└── Invitation/
    ├── InvitationForm.jsx
    ├── InvitationList.jsx
    ├── AcceptInvitation.jsx
    └── RoleAssignment.jsx
```

### Organization & Workspace Components

```
OrganizationManagement/
├── OrganizationList.jsx
├── OrganizationForm.jsx
├── OrganizationDetails.jsx
├── OrganizationSettings.jsx
└── MemberManagement/
    ├── MemberList.jsx
    ├── MemberInvite.jsx
    ├── RoleManager.jsx
    └── MemberRemoval.jsx

WorkspaceManagement/
├── WorkspaceList.jsx
├── WorkspaceForm.jsx
├── WorkspaceDetails.jsx
├── WorkspaceSettings.jsx
└── MemberManagement/
    ├── MemberList.jsx
    ├── MemberInvite.jsx
    ├── RoleManager.jsx
    └── MemberRemoval.jsx

ContextSwitching/
├── ContextSelector.jsx
├── OrganizationSelector.jsx
└── WorkspaceSelector.jsx
```

## Testing Strategy

### Unit Tests
- Test individual UI components
- Verify form validation logic
- Test state management

### Integration Tests
- Test API integration with UI components
- Verify data flow between components
- Test context switching functionality

### End-to-End Tests with Playwright

#### 1. User Registration Journey
- New user signup
- Email verification
- Organization creation
- Profile completion

#### 2. User Invitation Journey
- Admin sends invitation
- User receives and accepts invitation
- User completes profile
- User accesses appropriate resources

#### 3. Organization Management Journey
- Create organization
- Update organization settings
- Invite members
- Manage member permissions

#### 4. Workspace Management Journey
- Create workspace within organization
- Configure workspace settings
- Invite members to workspace
- Switch between workspaces

#### 5. Context Switching Journey
- Switch between organizations
- Switch between workspaces
- Verify correct data loading
- Test permission boundaries

#### 6. Role-Based Access Testing
- Verify system admins can access all features
- Verify organization admins can only access their organization
- Verify workspace admins can only access their workspace
- Test that users cannot access admin features

#### 7. UI Component Visibility Tests
- Verify appropriate UI elements are shown/hidden based on role
- Test that navigation options change appropriately with role

#### 8. API Access Tests
- Verify API endpoints enforce proper role-based access
- Test error handling for unauthorized access attempts

## Implementation Sequence

1. **Define Role-Based Permission System**
   - Create clear permission definitions for each role
   - Implement permission checking utilities

2. **Build Core Components with Role Awareness**
   - Design components to adapt based on user role
   - Implement conditional rendering based on permissions

3. **Create Role-Specific Pages**
   - System admin dashboard and management pages
   - Organization admin dashboard and management pages
   - Workspace admin dashboard and management pages
   - Regular user pages with appropriate access levels

4. **Implement Context Switching with Role Boundaries**
   - Create context selector that respects role limitations
   - Ensure proper state management during context changes

5. **Implement User Journeys**
   - Connect pages with navigation
   - Implement proper state management
   - Add context persistence

6. **Test and Refine**
   - Create comprehensive tests
   - Validate all acceptance criteria
   - Ensure responsive design

## Key Considerations

1. **Supabase Auth Integration**
   - Leverage existing auth-client package
   - Ensure proper session management
   - Handle authentication edge cases

2. **Multi-step Registration**
   - Design a seamless flow from Supabase Auth to organization creation
   - Store temporary state during multi-step processes
   - Handle interruptions in the registration flow

3. **Invitation Workflows**
   - Different flows for new vs. existing users
   - Clear email templates with actionable instructions
   - Proper error handling for expired/invalid invitations

4. **Context Switching**
   - Efficient state management for quick context changes
   - Clear visual indicators of current context
   - Proper permission boundaries between contexts
