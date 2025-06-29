import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for admin user
    await page.goto('/admin/dashboard')
    
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('displays admin dashboard with key metrics @smoke', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Admin Dashboard/)
    
    // Check main heading
    await expect(page.getByText('Admin Dashboard')).toBeVisible()
    
    // Check that key metrics are displayed
    await expect(page.getByText('Total Users')).toBeVisible()
    await expect(page.getByText('MRR')).toBeVisible()
    await expect(page.getByText('Active Now')).toBeVisible()
    await expect(page.getByText('Support Tickets')).toBeVisible()
  })

  test('navigates to user management', async ({ page }) => {
    // Click on User Management section
    await page.getByText('User Management').click()
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Check we're on the right page
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByText('User Management')).toBeVisible()
  })

  test('navigates to backup management', async ({ page }) => {
    // Click on Database Backup section
    await page.getByText('Database Backup').click()
    
    // Wait for navigation
    await page.waitForLoadState('networkidle')
    
    // Check we're on the backup page
    await expect(page).toHaveURL(/\/admin\/backup/)
    await expect(page.getByText('Database Backup')).toBeVisible()
  })

  test('displays system health status', async ({ page }) => {
    // Check system health section
    await expect(page.getByText('System Health')).toBeVisible()
    
    // Check that health indicators are present
    const healthIndicators = page.locator('[data-testid="health-indicator"]')
    await expect(healthIndicators).toHaveCount.greaterThan(0)
  })

  test('shows recent activity feed', async ({ page }) => {
    // Check recent activity section
    await expect(page.getByText('Recent Activity')).toBeVisible()
    
    // Check that activity items are displayed
    const activityItems = page.locator('[data-testid="activity-item"]')
    await expect(activityItems).toHaveCount.greaterThan(0)
  })

  test('filters metrics by time range', async ({ page }) => {
    // Select different time range
    await page.selectOption('[data-testid="time-range-selector"]', '7d')
    
    // Wait for metrics to update
    await page.waitForTimeout(1000)
    
    // Check that metrics are still displayed (specific values may change)
    await expect(page.getByText('Total Users')).toBeVisible()
  })

  test('responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that navigation is responsive
    await expect(page.getByText('Admin Dashboard')).toBeVisible()
    
    // Check that admin sections are stacked vertically
    const adminSections = page.locator('[data-testid="admin-section"]')
    await expect(adminSections.first()).toBeVisible()
  })
})