import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Test data
const testUser = {
  email: `test-${uuidv4()}@example.com`,
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
};

const testOrganization = {
  name: `Test Org ${uuidv4()}`,
  description: 'Test organization for workspace management tests',
};

const testWorkspace = {
  name: `Test Workspace ${uuidv4()}`,
  description: 'Test workspace for workspace management tests',
};

const updatedWorkspace = {
  name: `Updated Workspace ${uuidv4()}`,
  description: 'Updated workspace description',
};

test.describe('Workspace Management', () => {
  let organizationId;
  let workspaceId;

  test.beforeAll(async ({ browser }) => {
    // Create a new user, organization, and workspace for testing
    const context = await browser.newContext();
    const page = await context.newPage();

    // Register a new user
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.fill('[data-testid="first-name-input"]', testUser.firstName);
    await page.fill('[data-testid="last-name-input"]', testUser.lastName);
    await page.click('[data-testid="next-button"]');

    // Create organization
    await page.fill('[data-testid="organization-name-input"]', testOrganization.name);
    await page.fill('[data-testid="organization-description-input"]', testOrganization.description);
    await page.click('[data-testid="submit-button"]');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');

    // Get organization ID from URL
    const url = page.url();
    const match = url.match(/\/organizations\/([^/]+)/);
    if (match) {
      organizationId = match[1];
    }

    // Clean up
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    // Sign in
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should create a new workspace', async ({ page }) => {
    // Navigate to organization page
    await page.goto(`/organizations/${organizationId}`);
    
    // Click create workspace button
    await page.click('[data-testid="create-workspace-button"]');
    
    // Fill workspace form
    await page.fill('[data-testid="workspace-name-input"]', testWorkspace.name);
    await page.fill('[data-testid="workspace-description-input"]', testWorkspace.description);
    await page.click('[data-testid="create-workspace-submit"]');
    
    // Wait for workspace to be created
    await page.waitForSelector(`text=${testWorkspace.name}`);
    
    // Verify workspace was created
    const workspaceElement = await page.locator(`text=${testWorkspace.name}`).first();
    expect(await workspaceElement.isVisible()).toBeTruthy();
    
    // Get workspace ID for future tests
    await workspaceElement.click();
    const url = page.url();
    const match = url.match(/\/workspaces\/([^/]+)/);
    if (match) {
      workspaceId = match[1];
    }
  });

  test('should display workspace details', async ({ page }) => {
    // Navigate to workspace page
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}`);
    
    // Verify workspace details are displayed
    await expect(page.locator('[data-testid="workspace-name"]')).toContainText(testWorkspace.name);
    await expect(page.locator('[data-testid="workspace-description"]')).toContainText(testWorkspace.description);
  });

  test('should update workspace settings', async ({ page }) => {
    // Navigate to workspace settings
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}/settings`);
    
    // Update workspace settings
    await page.fill('[data-testid="workspace-name-input"]', updatedWorkspace.name);
    await page.fill('[data-testid="workspace-description-input"]', updatedWorkspace.description);
    await page.click('[data-testid="save-workspace-settings"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Workspace updated successfully');
    
    // Verify workspace was updated
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}`);
    await expect(page.locator('[data-testid="workspace-name"]')).toContainText(updatedWorkspace.name);
    await expect(page.locator('[data-testid="workspace-description"]')).toContainText(updatedWorkspace.description);
  });

  test('should invite a member to workspace', async ({ page }) => {
    // Create a new user to invite
    const invitedUserEmail = `invited-${uuidv4()}@example.com`;
    
    // Navigate to organization members page
    await page.goto(`/organizations/${organizationId}/members`);
    
    // Invite user to organization first
    await page.click('[data-testid="invite-member-button"]');
    await page.fill('[data-testid="email-input"]', invitedUserEmail);
    await page.selectOption('[data-testid="role-select"]', 'member');
    await page.click('[data-testid="send-invitation-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Invitation sent successfully');
    
    // Navigate to workspace members page
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    
    // Invite user to workspace
    await page.click('[data-testid="invite-member-button"]');
    await page.selectOption('[data-testid="member-select"]', invitedUserEmail);
    await page.selectOption('[data-testid="role-select"]', 'member');
    await page.click('[data-testid="invite-member-submit"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Member invited successfully');
    
    // Verify member was added to the list
    await expect(page.locator(`text=${invitedUserEmail}`)).toBeVisible();
  });

  test('should update workspace member role', async ({ page }) => {
    // Navigate to workspace members page
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    
    // Find the invited member and click edit
    const memberRow = await page.locator('tr').filter({ hasText: '@example.com' }).first();
    await memberRow.locator('[data-testid="edit-member-button"]').click();
    
    // Change role to admin
    await page.selectOption('[data-testid="role-select"]', 'admin');
    await page.click('[data-testid="update-member-submit"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Member role updated successfully');
    
    // Verify role was updated
    await expect(memberRow.locator('text=admin')).toBeVisible();
  });

  test('should remove workspace member', async ({ page }) => {
    // Navigate to workspace members page
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}/members`);
    
    // Get the email of the member to remove
    const memberRow = await page.locator('tr').filter({ hasText: '@example.com' }).first();
    const memberEmail = await memberRow.locator('td').nth(1).textContent();
    
    // Click remove button
    await memberRow.locator('[data-testid="remove-member-button"]').click();
    
    // Confirm removal
    await page.click('[data-testid="confirm-remove-member"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Member removed successfully');
    
    // Verify member was removed
    await expect(page.locator(`text=${memberEmail}`)).not.toBeVisible();
  });

  test('should delete workspace', async ({ page }) => {
    // Navigate to workspace settings
    await page.goto(`/organizations/${organizationId}/workspaces/${workspaceId}/settings`);
    
    // Click delete workspace button
    await page.click('[data-testid="delete-workspace-button"]');
    
    // Confirm deletion by typing workspace name
    await page.fill('[data-testid="confirm-text-input"]', updatedWorkspace.name);
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Wait for redirect to organization page
    await page.waitForURL(`**/organizations/${organizationId}`);
    
    // Verify workspace was deleted
    await expect(page.locator(`text=${updatedWorkspace.name}`)).not.toBeVisible();
  });
});
