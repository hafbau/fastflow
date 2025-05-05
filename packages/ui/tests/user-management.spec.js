import { test, expect } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';

// Test data
const adminUser = {
  email: `admin-${uuidv4()}@example.com`,
  password: 'Password123!',
  firstName: 'Admin',
  lastName: 'User',
};

const testUser = {
  email: `test-${uuidv4()}@example.com`,
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
};

const updatedProfile = {
  firstName: 'Updated',
  lastName: 'User',
  jobTitle: 'Software Engineer',
  phoneNumber: '+1234567890',
};

const testOrganization = {
  name: `Test Org ${uuidv4()}`,
  description: 'Test organization for user management tests',
};

test.describe('User Management', () => {
  let userId;

  test.beforeAll(async ({ browser }) => {
    // Create admin user for testing
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

    // Clean up
    await context.close();
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

  test('should register a new user', async ({ browser }) => {
    // Use a new context for registration
    const context = await browser.newContext();
    const page = await context.newPage();

    // Go to registration page
    await page.goto('/register');
    
    // Fill user details
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);
    await page.fill('[data-testid="first-name-input"]', testUser.firstName);
    await page.fill('[data-testid="last-name-input"]', testUser.lastName);
    await page.click('[data-testid="next-button"]');
    
    // Fill organization details
    const newOrgName = `New Org ${uuidv4()}`;
    await page.fill('[data-testid="organization-name-input"]', newOrgName);
    await page.fill('[data-testid="organization-description-input"]', 'New organization description');
    await page.click('[data-testid="submit-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Verify user is logged in
    await expect(page.locator('[data-testid="user-menu"]')).toContainText(`${testUser.firstName} ${testUser.lastName}`);
    
    // Clean up
    await context.close();
  });

  test('should list users in admin panel', async ({ page }) => {
    // Navigate to user administration page
    await page.goto('/admin/users');
    
    // Verify both users are listed
    await expect(page.locator(`text=${adminUser.email}`)).toBeVisible();
    await expect(page.locator(`text=${testUser.email}`)).toBeVisible();
    
    // Get user ID for future tests
    const userRow = await page.locator('tr').filter({ hasText: testUser.email }).first();
    const href = await userRow.locator('a').getAttribute('href');
    const match = href.match(/\/users\/([^/]+)/);
    if (match) {
      userId = match[1];
    }
  });

  test('should view user profile', async ({ page }) => {
    // Navigate to user profile page
    await page.goto(`/admin/users/${userId}`);
    
    // Verify user details are displayed
    await expect(page.locator('[data-testid="user-name"]')).toContainText(`${testUser.firstName} ${testUser.lastName}`);
    await expect(page.locator('[data-testid="user-email"]')).toContainText(testUser.email);
  });

  test('should edit user profile as admin', async ({ page }) => {
    // Navigate to user edit page
    await page.goto(`/admin/users/${userId}/edit`);
    
    // Update user profile
    await page.fill('[data-testid="first-name-input"]', updatedProfile.firstName);
    await page.fill('[data-testid="last-name-input"]', updatedProfile.lastName);
    await page.fill('[data-testid="job-title-input"]', updatedProfile.jobTitle);
    await page.fill('[data-testid="phone-number-input"]', updatedProfile.phoneNumber);
    await page.click('[data-testid="save-profile-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=User profile updated successfully');
    
    // Verify profile was updated
    await page.goto(`/admin/users/${userId}`);
    await expect(page.locator('[data-testid="user-name"]')).toContainText(`${updatedProfile.firstName} ${updatedProfile.lastName}`);
    await expect(page.locator('[data-testid="user-job-title"]')).toContainText(updatedProfile.jobTitle);
    await expect(page.locator('[data-testid="user-phone"]')).toContainText(updatedProfile.phoneNumber);
  });

  test('should reset user password', async ({ page }) => {
    // Navigate to user administration page
    await page.goto('/admin/users');
    
    // Find the test user and click reset password
    const userRow = await page.locator('tr').filter({ hasText: testUser.email }).first();
    await userRow.locator('[data-testid="reset-password-button"]').click();
    
    // Confirm password reset
    await page.click('[data-testid="confirm-reset-password"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Password reset email sent');
  });

  test('should update own profile', async ({ browser }) => {
    // Use a new context to login as test user
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Sign in as test user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Navigate to profile page
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="profile-link"]');
    
    // Click edit profile
    await page.click('[data-testid="edit-profile-button"]');
    
    // Update profile
    const newJobTitle = 'Senior Software Engineer';
    await page.fill('[data-testid="job-title-input"]', newJobTitle);
    await page.click('[data-testid="save-profile-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Profile updated successfully');
    
    // Verify profile was updated
    await expect(page.locator('[data-testid="user-job-title"]')).toContainText(newJobTitle);
    
    // Clean up
    await context.close();
  });

  test('should change password', async ({ browser }) => {
    // Use a new context to login as test user
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Sign in as test user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Navigate to profile page
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="profile-link"]');
    
    // Go to security tab
    await page.click('[data-testid="security-tab"]');
    
    // Change password
    const newPassword = 'NewPassword123!';
    await page.fill('[data-testid="current-password-input"]', testUser.password);
    await page.fill('[data-testid="new-password-input"]', newPassword);
    await page.fill('[data-testid="confirm-password-input"]', newPassword);
    await page.click('[data-testid="change-password-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=Password changed successfully');
    
    // Sign out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    // Sign in with new password
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', newPassword);
    await page.click('[data-testid="login-button"]');
    
    // Verify login was successful
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Update test user password for future tests
    testUser.password = newPassword;
    
    // Clean up
    await context.close();
  });

  test('should set up MFA', async ({ browser }) => {
    // Use a new context to login as test user
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Sign in as test user
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    
    // Navigate to profile page
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="profile-link"]');
    
    // Go to security tab
    await page.click('[data-testid="security-tab"]');
    
    // Start MFA setup
    await page.click('[data-testid="setup-mfa-button"]');
    
    // Verify QR code is displayed
    await expect(page.locator('[data-testid="mfa-qr-code"]')).toBeVisible();
    
    // Note: We can't complete MFA setup in an automated test because it requires scanning a QR code
    // and entering a time-based code. In a real test, we might mock this functionality.
    
    // Cancel MFA setup
    await page.click('[data-testid="cancel-mfa-setup"]');
    
    // Clean up
    await context.close();
  });

  test('should deactivate and reactivate user', async ({ page }) => {
    // Navigate to user administration page
    await page.goto('/admin/users');
    
    // Find the test user and click deactivate
    const userRow = await page.locator('tr').filter({ hasText: testUser.email }).first();
    await userRow.locator('[data-testid="deactivate-user-button"]').click();
    
    // Confirm deactivation
    await page.click('[data-testid="confirm-deactivate-user"]');
    
    // Wait for success notification
    await page.waitForSelector('text=User deactivated successfully');
    
    // Verify user status changed to inactive
    await expect(userRow.locator('[data-testid="user-status"]')).toContainText('Inactive');
    
    // Reactivate user
    await userRow.locator('[data-testid="activate-user-button"]').click();
    
    // Confirm reactivation
    await page.click('[data-testid="confirm-activate-user"]');
    
    // Wait for success notification
    await page.waitForSelector('text=User activated successfully');
    
    // Verify user status changed to active
    await expect(userRow.locator('[data-testid="user-status"]')).toContainText('Active');
  });

  test('should delete user', async ({ page }) => {
    // Navigate to user administration page
    await page.goto('/admin/users');
    
    // Find the test user and click delete
    const userRow = await page.locator('tr').filter({ hasText: testUser.email }).first();
    await userRow.locator('[data-testid="delete-user-button"]').click();
    
    // Confirm deletion by typing email
    await page.fill('[data-testid="confirm-text-input"]', testUser.email);
    await page.click('[data-testid="confirm-delete-button"]');
    
    // Wait for success notification
    await page.waitForSelector('text=User deleted successfully');
    
    // Verify user was deleted
    await expect(page.locator(`text=${testUser.email}`)).not.toBeVisible();
  });
});
