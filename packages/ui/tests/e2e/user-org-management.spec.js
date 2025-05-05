import { test, expect } from '@playwright/test';

/**
 * End-to-End tests for User Management and Organization/Workspace Management
 * 
 * This test suite validates the following workflows:
 * 1. User registration and onboarding
 * 2. User profile management
 * 3. Organization creation and management
 * 4. Workspace creation and management 
 * 5. User invitations and role management
 * 6. Context switching between organizations and workspaces
 */

// Test constants
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test@123456',
  fullName: 'Test User',
};

const TEST_ORG = {
  name: `Test Organization ${Date.now()}`,
  description: 'Test organization description',
};

const TEST_WORKSPACE = {
  name: `Test Workspace ${Date.now()}`,
  description: 'Test workspace description',
};

// Test groups
test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should allow new user registration', async ({ page }) => {
    // Click the register link
    await page.click('text=Register');
    
    // Fill in registration form
    await page.fill('[data-testid="register-email"]', TEST_USER.email);
    await page.fill('[data-testid="register-password"]', TEST_USER.password);
    await page.fill('[data-testid="register-confirm-password"]', TEST_USER.password);
    await page.fill('[data-testid="register-name"]', TEST_USER.fullName);
    
    // Submit form
    await page.click('[data-testid="register-submit"]');
    
    // Verify successful registration
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('text=Verification email sent')).toBeVisible();
  });

  test('should allow user login', async ({ page }) => {
    // Click login link
    await page.click('text=Login');
    
    // Fill in login form with test user (assuming user exists)
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    
    // Submit form
    await page.click('[data-testid="login-submit"]');
    
    // Verify successful login
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should allow profile editing', async ({ page }) => {
    // Login first
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Navigate to profile
    await page.click('[data-testid="nav-profile"]');
    
    // Update profile information
    await page.fill('[data-testid="profile-name"]', 'Updated Name');
    
    // Save changes
    await page.click('[data-testid="profile-save"]');
    
    // Verify successful update
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

  test('should allow password change', async ({ page }) => {
    // Login first
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Navigate to profile
    await page.click('[data-testid="nav-profile"]');
    
    // Go to password change tab/section
    await page.click('text=Change Password');
    
    // Fill password change form
    await page.fill('[data-testid="current-password"]', 'password123');
    await page.fill('[data-testid="new-password"]', 'NewPassword@123');
    await page.fill('[data-testid="confirm-password"]', 'NewPassword@123');
    
    // Save changes
    await page.click('[data-testid="password-change-submit"]');
    
    // Verify successful password change
    await expect(page.locator('text=Password changed successfully')).toBeVisible();
  });
});

test.describe('Organization Management', () => {
  // Log in before each test in this group
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow creating a new organization', async ({ page }) => {
    // Go to organizations page
    await page.click('[data-testid="nav-organizations"]');
    
    // Click create new organization button
    await page.click('[data-testid="create-organization-button"]');
    
    // Fill organization form
    await page.fill('[data-testid="org-name"]', TEST_ORG.name);
    await page.fill('[data-testid="org-description"]', TEST_ORG.description);
    
    // Submit form
    await page.click('[data-testid="org-submit"]');
    
    // Verify organization created
    await expect(page.locator(`text=${TEST_ORG.name}`)).toBeVisible();
  });

  test('should allow editing organization settings', async ({ page }) => {
    // Go to organizations page
    await page.click('[data-testid="nav-organizations"]');
    
    // Click on existing organization
    await page.click('text=Test Organization');
    
    // Go to settings tab
    await page.click('text=Settings');
    
    // Edit organization name
    const updatedName = `Updated Org ${Date.now()}`;
    await page.fill('[data-testid="org-name"]', updatedName);
    
    // Save changes
    await page.click('[data-testid="org-save"]');
    
    // Verify changes saved
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test('should allow inviting members to organization', async ({ page }) => {
    // Go to organizations page
    await page.click('[data-testid="nav-organizations"]');
    
    // Click on existing organization
    await page.click('text=Test Organization');
    
    // Go to members tab
    await page.click('text=Members');
    
    // Click invite button
    await page.click('[data-testid="invite-member-button"]');
    
    // Fill invite form
    await page.fill('[data-testid="invite-email"]', 'newmember@example.com');
    await page.selectOption('[data-testid="invite-role"]', 'member');
    
    // Send invitation
    await page.click('[data-testid="send-invite"]');
    
    // Verify invitation sent
    await expect(page.locator('text=Invitation sent')).toBeVisible();
  });
});

test.describe('Workspace Management', () => {
  // Login and select an organization before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Select an organization from context switcher
    await page.click('[data-testid="context-switcher-organization"]');
    await page.click('text=Test Organization');
  });

  test('should allow creating a new workspace', async ({ page }) => {
    // Go to workspaces page
    await page.click('[data-testid="nav-workspaces"]');
    
    // Click create workspace button
    await page.click('[data-testid="create-workspace-button"]');
    
    // Fill workspace form
    await page.fill('[data-testid="workspace-name"]', TEST_WORKSPACE.name);
    await page.fill('[data-testid="workspace-description"]', TEST_WORKSPACE.description);
    
    // Submit form
    await page.click('[data-testid="workspace-submit"]');
    
    // Verify workspace created
    await expect(page.locator(`text=${TEST_WORKSPACE.name}`)).toBeVisible();
  });

  test('should allow editing workspace settings', async ({ page }) => {
    // Go to workspaces page
    await page.click('[data-testid="nav-workspaces"]');
    
    // Click on existing workspace
    await page.click('text=Test Workspace');
    
    // Go to settings tab
    await page.click('text=Settings');
    
    // Edit workspace name
    const updatedName = `Updated Workspace ${Date.now()}`;
    await page.fill('[data-testid="workspace-name"]', updatedName);
    
    // Save changes
    await page.click('[data-testid="workspace-save"]');
    
    // Verify changes saved
    await expect(page.locator(`text=${updatedName}`)).toBeVisible();
  });

  test('should allow inviting members to workspace', async ({ page }) => {
    // Go to workspaces page
    await page.click('[data-testid="nav-workspaces"]');
    
    // Click on existing workspace
    await page.click('text=Test Workspace');
    
    // Go to members tab
    await page.click('text=Members');
    
    // Click invite button
    await page.click('[data-testid="invite-workspace-member-button"]');
    
    // Fill invite form
    await page.fill('[data-testid="invite-email"]', 'workspace-member@example.com');
    await page.selectOption('[data-testid="invite-role"]', 'member');
    
    // Send invitation
    await page.click('[data-testid="send-invite"]');
    
    // Verify invitation sent
    await expect(page.locator('text=Invitation sent')).toBeVisible();
  });
});

test.describe('Context Switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'existing@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow switching between organizations', async ({ page }) => {
    // Open organization dropdown
    await page.click('[data-testid="context-switcher-organization"]');
    
    // Select a different organization
    await page.click('text=Second Organization');
    
    // Verify organization changed
    await expect(page.locator('[data-testid="active-organization"]')).toContainText('Second Organization');
    
    // Verify workspaces updated for new org
    await page.click('[data-testid="context-switcher-workspace"]');
    await expect(page.locator('text=Second Org Workspace')).toBeVisible();
  });

  test('should allow switching between workspaces', async ({ page }) => {
    // Open organization dropdown
    await page.click('[data-testid="context-switcher-organization"]');
    
    // Select an organization
    await page.click('text=Test Organization');
    
    // Open workspace dropdown
    await page.click('[data-testid="context-switcher-workspace"]');
    
    // Select a workspace
    await page.click('text=Test Workspace');
    
    // Verify workspace changed
    await expect(page.locator('[data-testid="active-workspace"]')).toContainText('Test Workspace');
  });
});

test.describe('User Administration', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as admin
    await page.goto('/login');
    await page.fill('[data-testid="login-email"]', 'admin@example.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should allow admin to list all users', async ({ page }) => {
    // Navigate to user administration
    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="nav-user-admin"]');
    
    // Verify user list is displayed
    await expect(page.locator('h1')).toContainText('User Administration');
    await expect(page.locator('table')).toBeVisible();
  });

  test('should allow admin to create new user', async ({ page }) => {
    // Navigate to user administration
    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="nav-user-admin"]');
    
    // Click create new user button
    await page.click('[data-testid="create-user-button"]');
    
    // Fill user form
    await page.fill('[data-testid="user-email"]', `admin-created-${Date.now()}@example.com`);
    await page.fill('[data-testid="user-name"]', 'Admin Created User');
    await page.fill('[data-testid="user-password"]', 'Password@123');
    
    // Submit form
    await page.click('[data-testid="user-submit"]');
    
    // Verify user created
    await expect(page.locator('text=User created successfully')).toBeVisible();
  });

  test('should allow admin to deactivate a user', async ({ page }) => {
    // Navigate to user administration
    await page.click('[data-testid="nav-admin"]');
    await page.click('[data-testid="nav-user-admin"]');
    
    // Find a user to deactivate
    await page.click('[data-testid="user-actions-button"]:first-child');
    await page.click('text=Deactivate');
    
    // Confirm deactivation
    await page.click('[data-testid="confirm-button"]');
    
    // Verify user deactivated
    await expect(page.locator('text=User deactivated')).toBeVisible();
  });
});
