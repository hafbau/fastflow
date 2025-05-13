import { test, expect } from '@playwright/test';

/**
 * E2E tests for Workspace Management functionality
 */
test.describe('Workspace Management', () => {
  let organizationId;
  let workspaceId;
  
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to the login page
    await page.goto('/login');
    
    // Fill in the login form
    await page.getByTestId('login-email').fill('admin@example.com');
    await page.getByTestId('login-password').fill('password123');
    
    // Submit the form
    await page.getByTestId('login-submit').click();
    
    // Wait for redirect to complete
    await page.waitForURL('**/*');
    
    // Verify that we're logged in by checking for the avatar button in AppLayout
    await expect(page.locator('button[aria-controls="user-menu"]')).toBeVisible();
    
    // Store organization ID for later use
    // We're assuming we have at least one organization, and we're using the first one
    const currentUrl = page.url();
    const orgMatches = currentUrl.match(/\/organizations\/([^\/]+)/);
    if (orgMatches && orgMatches[1]) {
      organizationId = orgMatches[1];
    } else {
      // Navigate to organizations list
      await page.goto('/organizations');
      
      // Click on the first organization (if any)
      const firstOrgLink = page.locator('.organization-card a').first();
      await firstOrgLink.click();
      
      // Extract organization ID from URL
      const url = page.url();
      const matches = url.match(/\/organizations\/([^\/]+)/);
      organizationId = matches ? matches[1] : null;
    }
    
    // Ensure we have an organization ID
    expect(organizationId).toBeTruthy();
  });
  
  test('should navigate to workspace list', async ({ page }) => {
    // Navigate to workspaces list
    await page.goto(`/organizations/${organizationId}/workspaces`);
    
    // Verify page content
    await expect(page.locator('h1')).toContainText('Workspaces');
    await expect(page.locator('button:has-text("Create Workspace")')).toBeVisible();
  });
  
  test('should create a new workspace', async ({ page }) => {
    // Navigate to workspaces list
    await page.goto(`/organizations/${organizationId}/workspaces`);
    
    // Click the create workspace button
    await page.locator('button:has-text("Create Workspace")').click();
    
    // Wait for dialog to appear
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Fill in workspace details
    const workspaceName = `Test Workspace ${Date.now()}`;
    await page.locator('input[name="name"]').fill(workspaceName);
    await page.locator('textarea[name="description"]').fill('Automated test workspace');
    
    // Submit the form
    await page.locator('button:has-text("Create")').click();
    
    // Wait for redirect to new workspace page
    await page.waitForURL('**/workspaces/**');
    
    // Extract workspace ID from URL
    const url = page.url();
    const matches = url.match(/\/workspaces\/([^\/]+)/);
    workspaceId = matches ? matches[1] : null;
    
    // Ensure we have a workspace ID
    expect(workspaceId).toBeTruthy();
    
    // Verify workspace detail page
    await expect(page.locator('h1')).toContainText(workspaceName);
  });
  
  test('should use the workspace layout for workspace pages', async ({ page }) => {
    // Skip if no workspace is available
    test.skip(!workspaceId, 'No workspace available');
    
    // Navigate to workspace page
    await page.goto(`/workspaces/${workspaceId}`);
    
    // Check for workspace-specific navigation elements from WorkspaceLayout
    await expect(page.locator('.MuiDrawer-root h6').first()).toBeVisible(); // Workspace title
    
    // Navigate to a function page (chatflows) through the side navigation
    await page.locator('a[href*="/chatflows"]').click();
    
    // Check if we're on the chatflows page
    await expect(page.url()).toContain(`/workspaces/${workspaceId}/chatflows`);
    
    // Check for the secondary AppBar with breadcrumbs
    await expect(page.locator('.MuiBreadcrumbs-root')).toBeVisible();
  });
  
  test('should navigate to workspace members', async ({ page }) => {
    // Skip if no workspace is available
    test.skip(!workspaceId, 'No workspace available');
    
    // Navigate to workspace members page
    await page.goto(`/workspaces/${workspaceId}/members`);
    
    // Verify page content
    await expect(page.locator('h1')).toContainText('Workspace Members');
    await expect(page.locator('button:has-text("Invite Member")')).toBeVisible();
  });
  
  test('should navigate to workspace settings', async ({ page }) => {
    // Skip if no workspace is available
    test.skip(!workspaceId, 'No workspace available');
    
    // Navigate to workspace settings page
    await page.goto(`/workspaces/${workspaceId}/settings`);
    
    // Verify page content
    await expect(page.locator('h1')).toContainText('Workspace Settings');
    
    // Check for edit and delete buttons
    await expect(page.locator('button:has-text("Edit Workspace")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete Workspace")')).toBeVisible();
  });
  
  test('should edit workspace settings', async ({ page }) => {
    // Skip if no workspace is available
    test.skip(!workspaceId, 'No workspace available');
    
    // Navigate to workspace settings page
    await page.goto(`/workspaces/${workspaceId}/settings`);
    
    // Click edit button
    await page.locator('button:has-text("Edit Workspace")').click();
    
    // Wait for dialog to appear
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Update workspace details
    const updatedName = `Updated Workspace ${Date.now()}`;
    await page.locator('input[name="name"]').fill(updatedName);
    
    // Submit the form
    await page.locator('button:has-text("Save")').click();
    
    // Wait for page to refresh with updated data
    await page.waitForLoadState('networkidle');
    
    // Verify updated details appear
    await expect(page.locator('h1')).toContainText(updatedName);
  });
  
  test('should delete a workspace', async ({ page }) => {
    // Skip if no workspace is available
    test.skip(!workspaceId, 'No workspace available');
    
    // Navigate to workspace settings page
    await page.goto(`/workspaces/${workspaceId}/settings`);
    
    // Click delete button
    await page.locator('button:has-text("Delete Workspace")').click();
    
    // Wait for confirmation dialog
    await expect(page.locator('div[role="dialog"]')).toBeVisible();
    
    // Confirm deletion
    await page.locator('button:has-text("Delete")').click();
    
    // Wait for redirect to workspaces list
    await page.waitForURL(`**/organizations/${organizationId}/workspaces`);
    
    // Verify we're back on the workspaces list page
    await expect(page.locator('h1')).toContainText('Workspaces');
  });
  
  test('should use ContextSwitcher to navigate between workspaces', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
    
    // Open context switcher
    await page.locator('.MuiToolbar-root button').nth(1).click();
    
    // Wait for context menu to appear
    await expect(page.locator('div[role="presentation"]')).toBeVisible();
    
    // Check if we have organizations listed
    const orgCount = await page.locator('li:has-text("Organization:")').count();
    expect(orgCount).toBeGreaterThan(0);
    
    // Select a workspace (if available)
    const workspaceOption = page.locator('li:has-text("Workspace:")').first();
    if (await workspaceOption.count() > 0) {
      await workspaceOption.click();
      
      // After selecting a workspace, we should be taken to that workspace
      await page.waitForURL('**/workspaces/**');
      
      // Verify we're in the workspace layout
      await expect(page.locator('.MuiDrawer-root h6').first()).toBeVisible();
    }
  });
});
