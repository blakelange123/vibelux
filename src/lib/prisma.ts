import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { 
  prisma: PrismaClient
  connectionCount: number
}

// Connection pooling and timeout configuration
const prismaConfig = {
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool settings for better performance and leak prevention
  __internal: {
    engine: {
      // Connection pool size (default is 4 * CPU cores)
      connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
      // Connection timeout in milliseconds
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'),
      // Query timeout in milliseconds 
      queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
      // Pool timeout in milliseconds
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '10000'),
    },
  },
} as const

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(prismaConfig)

// Track connection count for monitoring
if (!globalForPrisma.connectionCount) {
  globalForPrisma.connectionCount = 0
}

// Add connection monitoring and automatic cleanup
prisma.$on('beforeExit', async () => {
  console.log('Prisma client disconnecting...')
  globalForPrisma.connectionCount = Math.max(0, globalForPrisma.connectionCount - 1)
})

// Add query logging for performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    if (e.duration > 1000) { // Log slow queries (>1s)
      console.warn(`Slow query detected: ${e.duration}ms - ${e.query.substring(0, 100)}...`)
    }
  })
}

// Graceful shutdown handler
const gracefulShutdown = async () => {
  console.log('Shutting down Prisma client...')
  try {
    await prisma.$disconnect()
    console.log('Prisma client disconnected successfully')
    globalForPrisma.connectionCount = 0
  } catch (error) {
    console.error('Error during Prisma shutdown:', error)
  }
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  process.on('beforeExit', gracefulShutdown)
}

// Store globally to prevent re-instantiation during hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export connection health check
export const checkDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`
    return { 
      status: 'healthy', 
      connections: globalForPrisma.connectionCount,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      connections: globalForPrisma.connectionCount,
      timestamp: new Date().toISOString()
    }
  }
}

// Export connection management utilities
export const connectionManager = {
  getConnectionCount: () => globalForPrisma.connectionCount,
  incrementConnection: () => ++globalForPrisma.connectionCount,
  decrementConnection: () => globalForPrisma.connectionCount = Math.max(0, globalForPrisma.connectionCount - 1),
  resetConnections: () => globalForPrisma.connectionCount = 0
}