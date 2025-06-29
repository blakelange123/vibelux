import { createMocks } from 'node-mocks-http'
import handler from '@/pages/api/auth/login'
import logoutHandler from '@/pages/api/auth/logout'
import { TestDataGenerator, TestHelpers } from '@/lib/testing/test-helpers'
import { prisma } from '@/lib/prisma'

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    customer: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userSession: {
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}))

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'validpassword',
      },
    })

    const mockCustomer = {
      id: 'customer-123',
      contactEmail: 'test@example.com',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    }

    const bcrypt = require('bcryptjs')
    const jwt = require('jsonwebtoken')
    
    ;(prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token')
    ;(prisma.userSession.create as jest.Mock).mockResolvedValue({
      id: 'session-123',
      sessionToken: 'session-token',
    })
    ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.token).toBe('mock-jwt-token')
    expect(data.user.id).toBe('customer-123')
  })

  it('should reject invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    })

    const mockCustomer = {
      id: 'customer-123',
      contactEmail: 'test@example.com',
      passwordHash: 'hashed-password',
      status: 'ACTIVE',
    }

    const bcrypt = require('bcryptjs')
    
    ;(prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer)
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })

  it('should reject inactive user', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'validpassword',
      },
    })

    const mockCustomer = {
      id: 'customer-123',
      contactEmail: 'test@example.com',
      passwordHash: 'hashed-password',
      status: 'INACTIVE',
    }

    ;(prisma.customer.findUnique as jest.Mock).mockResolvedValue(mockCustomer)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Account is not active')
  })

  it('should handle user not found', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'nonexistent@example.com',
        password: 'password',
      },
    })

    ;(prisma.customer.findUnique as jest.Mock).mockResolvedValue(null)

    await handler(req, res)

    expect(res._getStatusCode()).toBe(401)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(false)
    expect(data.error).toBe('Invalid credentials')
  })
})

describe('/api/auth/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should logout successfully', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        authorization: 'Bearer mock-jwt-token',
      },
    })

    const jwt = require('jsonwebtoken')
    ;(jwt.verify as jest.Mock).mockReturnValue({ userId: 'user-123' })
    ;(prisma.userSession.updateMany as jest.Mock).mockResolvedValue({ count: 1 })
    ;(prisma.auditLog.create as jest.Mock).mockResolvedValue({})

    await logoutHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.message).toBe('Logged out successfully')
  })

  it('should handle logout without token', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    })

    await logoutHandler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const data = JSON.parse(res._getData())
    expect(data.success).toBe(true)
    expect(data.message).toBe('Logged out successfully')
  })
})