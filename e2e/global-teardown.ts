import { FullConfig } from '@playwright/test'

async function globalTeardown(config: FullConfig) {
  console.log('Running global teardown...')
  
  try {
    // Clean up test data, close connections, etc.
    console.log('Cleaning up test environment...')
    
    // Example: Clean up test database
    // await cleanupTestDatabase()
    
    // Example: Remove test files
    // await fs.unlink('auth-state.json').catch(() => {})
    
    console.log('Teardown completed successfully')
    
  } catch (error) {
    console.error('Global teardown failed:', error)
    // Don't throw to avoid failing the entire test run
  }
}

export default globalTeardown