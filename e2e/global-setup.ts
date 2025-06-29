import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('Running global setup...')
  
  // Start with a fresh browser instance
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Set up test data or perform authentication if needed
    console.log('Setting up test environment...')
    
    // Wait for the application to be ready
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    console.log('Application is ready for testing')
    
    // Store authentication state or other setup data
    // await page.context().storageState({ path: 'auth-state.json' })
    
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup