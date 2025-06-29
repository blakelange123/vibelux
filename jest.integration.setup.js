// Integration test setup
import { execSync } from 'child_process'

// Global test database setup
beforeAll(async () => {
  // Set up test database
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/vibelux_test'
  process.env.REDIS_URL = process.env.TEST_REDIS_URL || 'redis://localhost:6379'
  
  try {
    // Run database migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' })
    console.log('Database migrations completed')
  } catch (error) {
    console.error('Failed to run database migrations:', error)
    throw error
  }
})

// Clean up after all tests
afterAll(async () => {
  try {
    // Clean up test data
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' })
    console.log('Test database cleaned up')
  } catch (error) {
    console.warn('Failed to clean up test database:', error)
  }
})

// Reset database state before each test
beforeEach(async () => {
  try {
    // Truncate all tables but keep schema
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    // Get all table names
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE '_prisma%'
    `
    
    // Truncate all tables
    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`)
    }
    
    await prisma.$disconnect()
  } catch (error) {
    console.warn('Failed to truncate test tables:', error)
  }
})

// Mock external services for integration tests
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({
    userId: 'test-user-id',
    sessionId: 'test-session-id',
  }),
  currentUser: jest.fn().mockResolvedValue({
    id: 'test-user-id',
    firstName: 'Test',
    lastName: 'User',
    emailAddresses: [{ emailAddress: 'test@example.com' }],
  }),
}))

// Mock AWS SDK
jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({}),
  })),
  PutObjectCommand: jest.fn(),
  GetObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'cus_test' }),
    },
    subscriptions: {
      create: jest.fn().mockResolvedValue({ id: 'sub_test', status: 'active' }),
      retrieve: jest.fn().mockResolvedValue({ id: 'sub_test', status: 'active' }),
    },
    webhooks: {
      constructEvent: jest.fn().mockReturnValue({
        type: 'customer.subscription.created',
        data: { object: { id: 'sub_test' } },
      }),
    },
  }))
})

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    pipeline: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    disconnect: jest.fn(),
  }))
})

// Global timeout for integration tests
jest.setTimeout(30000)