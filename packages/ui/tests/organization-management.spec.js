import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Test data
const adminUser = {
  email: `admin-${uuidv4()}@example.com`,
  password: 'Password123!',
  firstName: 'Admin',
  lastName: 'User',
};

const memberUser = {
  email: `member-${uuidv4()}@example.com`,
  password: 'Password123!',
  firstName: 'Member',
  lastName: 'User',
};

const testOrganization = {
  name: `Test Org ${uuidv4()}`,
  description: 'Test organization for organization management tests',
};

const updatedOrganization = {
  name: `Updated Org ${uuidv4()}`,
  description: 'Updated organization description',
};

test.describe('Organization Management', () => {
  let organizationId;

  test.beforeAll(async ({ browser }) => {
    // Create admin user and organization for testing
    const context = await browser.newContext();
    const page = await context.newPage();

    // Register admin user
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', adminUser.email);
    await page.fill('[data-testid="password-input"]', adminUser.password);
    await page.fill('[data-testid="confirm-password-input"]', adminUser.password);
    await page.fill('[data-testid="first-name-input"]', adminUser.firstName);
    await page.fill('[data-testid="last-name-input"]', adminUser.lastName);
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

    // Register member user
    const memberContext = await browser.newContext();
    const memberPage = await memberContext.newPage();

    await memberPage.goto('/register');
    await memberPage.fill('[data-testid="email-input"]', memberUser.email);
    await memberPage.fill('[data-testid="password-input"]', memberUser.password);
    await memberPage.fill('[data-testid="confirm-password-input"]', memberUser.password);
    await memberPage.fill('[data-testid="first-name-input"]', memberUser.firstName);
    await memberPage.fill('[data-testid="last-name-input"]', memberUser.lastName);
    await memberPage.click('[data-testid="next-button"]');

    // Create a different organization for the member
    await memberPage.fill('[data-testid="organization-name-input"]', `Member Org ${uuidv4()}`);
    await memberPage.fill('[data-testid="organization-description-input"]', 'Member organization');
    await memberPage.click('[data-testid="submit-button"]');

    // Wait for dashboard to load
    await memberPage.waitForSelector('[data-testid="dashboard"]');

    // Clean up
    await context.close();
    await memberContext.close();
  });

  test.beforeEach(async ({ page }) => {
    // Sign in as admin
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', adminUser.email);
    await page.fill('[data-testid="password-input"]', adminUser.password);
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
  });

  test('should display organization details', async ({ page }) => {
    // Navigate to organization page
    await page.goto(`/organizations/${organizationId}`);
    
    // Verify organization details are displayed
    await expect(page.locator('[data-testid="organization-name"]')).toContainText(testOrganization.name);
    await expect(page.locator('[data-testid="organization-description"]')).toContainText(testOrganization.description);
  });

  test('should update organization settings', async ({ page }) => {
    // Navigate to organization settings
    await page.goto(`/organizations/${organizationId}/settings`);
    
    // Update organization settings
    await page.fill('[data-testid="organization-name-input"]', updatedOrganization.name);
    await page.fill('[data-testid="organization-description-input"]', updatedOrganization.description);
    await page.click('[data-testid="save-organization-settings"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Organization updated successfully');
    
    // Verify organization was updated
    await page.goto(`/organizations/${organizationId}`);
    await expect(page.locator('[data-testid="organization-name"]')).toContainText(updatedOrganization.name);
    await expect(page.locator('[data-testid="organization-description"]')).toContainText(updatedOrganization.description);
  });

  test('should invite a member to organization', async ({ page }) => {
    // Navigate to organization members page
    await page.goto(`/organizations/${organizationId}/members`);
    
    // Click invite member button
    await page.click('[data-testid="invite-member-button"]');
    
    // Fill invitation form
    await page.fill('[data-testid="email-input"]', memberUser.email);
    await page.selectOption('[data-testid="role-select"]', 'member');
    await page.click('[data-testid="send-invitation-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Invitation sent successfully');
    
    // Verify member was added to the list
    await expect(page.locator(`text=${memberUser.email}`)).toBeVisible();
  });

  test('should accept organization invitation', async ({ browser }) => {
    // Use a new context to login as member user
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Sign in as member user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', memberUser.email);
    await page.fill('[data-testid="password-input"]', memberUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Navigate to invitations page
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="invitations-link"]');
    
    // Accept invitation
    const invitationRow = await page.locator('tr').filter({ hasText: updatedOrganization.name }).first();
    await invitationRow.locator('[data-testid="accept-invitation-button"]').click();
    
    // Wait for success notification
    await page.waitForSelector('text=Invitation accepted');
    
    // Verify organization is now in the list
    await page.click('[data-testid="organizations-link"]');
    await expect(page.locator(`text=${updatedOrganization.name}`)).toBeVisible();
    
    // Clean up
    await context.close();
  });

  test('should update organization member role', async ({ page }) => {
    // Navigate to organization members page
    await page.goto(`/organizations/${organizationId}/members`);
    
    // Find the member and click edit
    const memberRow = await page.locator('tr').filter({ hasText: memberUser.email }).first();
    await memberRow.locator('[data-testid="edit-member-button"]').click();
    
    // Change role to admin
    await page.selectOption('[data-testid="role-select"]', 'admin');
    await page.click('[data-testid="update-member-submit"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Member role updated successfully');
    
    // Verify role was updated
    await expect(memberRow.locator('text=admin')).toBeVisible();
  });

  test('should remove organization member', async ({ page }) => {
    // Navigate to organization members page
    await page.goto(`/organizations/${organizationId}/members`);
    
    // Get the email of the member to remove
    const memberRow = await page.locator('tr').filter({ hasText: memberUser.email }).first();
    
    // Click remove button
    await memberRow.locator('[data-testid="remove-member-button"]').click();
    
    // Confirm removal
    await page.click('[data-testid="confirm-remove-member"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Member removed successfully');
    
    // Verify member was removed
    await expect(page.locator(`text=${memberUser.email}`)).not.toBeVisible();
  });

  test('should create a new organization', async ({ page }) => {
    // Navigate to organizations page
    await page.goto('/organizations');
    
    // Click create organization button
    await page.click('[data-testid="create-organization-button"]');
    
    // Fill organization form
    const newOrgName = `New Org ${uuidv4()}`;
    const newOrgDescription = 'New organization description';
    await page.fill('[data-testid="organization-name-input"]', newOrgName);
    await page.fill('[data-testid="organization-description-input"]', newOrgDescription);
    await page.click('[data-testid="create-organization-submit"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Organization created successfully');
    
    // Verify organization was created
    await page.goto('/organizations');
    await expect(page.locator(`text=${newOrgName}`)).toBeVisible();
  });

  test('should switch between organizations', async ({ page }) => {
    // Navigate to organizations page
    await page.goto('/organizations');
    
    // Get the name of the first organization
    const firstOrgName = await page.locator('[data-testid="organization-name"]').first().textContent();
    
    // Click on the second organization
    await page.locator('[data-testid="organization-card"]').nth(1).click();
    
    // Wait for organization to load
    await page.waitForSelector('[data-testid="organization-name"]');
    
    // Get the name of the current organization
    const currentOrgName = await page.locator('[data-testid="organization-name"]').textContent();
    
    // Verify it's different from the first organization
    expect(currentOrgName).not.toEqual(firstOrgName);
    
    // Switch back to the first organization
    await page.click('[data-testid="organization-selector"]');
    await page.locator(`text=${firstOrgName}`).click();
    
    // Wait for organization to load
    await page.waitForSelector('[data-testid="organization-name"]');
    
    // Verify we're back to the first organization
    const switchedOrgName = await page.locator('[data-testid="organization-name"]').textContent();
    expect(switchedOrgName).toEqual(firstOrgName);
  });

  test('should delete organization', async ({ page }) => {
    // Navigate to organization settings
    await page.goto(`/organizations/${organizationId}/settings`);
    
    // Click delete organization button
    await page.click('[data-testid="delete-organization-button"]');
    
    // Confirm deletion by typing organization name
    await page.fill('[data-testid="confirm-text-input"]', updatedOrganization.name);
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Wait for redirect to organizations page
    await page.waitForURL('**/organizations');
    
    // Verify organization was deleted
    await expect(page.locator(`text=${updatedOrganization.name}`)).not.toBeVisible();
  });
});
