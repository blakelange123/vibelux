/**
 * Database Layer Tests
 * Tests for the main database abstraction layer
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { db } from '@/lib/db'
import { mockFixture, mockUser, mockProject, createMockDb } from '../utils/test-helpers'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: createMockDb()
}))

const mockPrisma = createMockDb()

describe('Database Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Fixtures', () => {
    it('should find all fixtures', async () => {
      const fixtures = await db.fixtures.findMany()
      
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalled()
      expect(fixtures).toEqual([mockFixture])
      expect(fixtures[0]).toBeValidFixture()
    })

    it('should find fixtures by manufacturer', async () => {
      const manufacturer = 'Test Manufacturer'
      await db.fixtures.findMany(undefined, manufacturer)
      
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalledWith({
        where: { manufacturer }
      })
    })

    it('should find fixture by ID', async () => {
      const fixture = await db.fixtures.findById('test_fixture_001')
      
      expect(mockPrisma.fixtures.findUnique).toHaveBeenCalledWith({
        where: { id: 'test_fixture_001' }
      })
      expect(fixture).toEqual(mockFixture)
    })

    it('should create new fixture', async () => {
      const newFixtureData = {
        manufacturer: 'New Manufacturer',
        model: 'NM-LED-500',
        type: 'LED Panel',
        specifications: {
          wattage: 500,
          efficacy: 2.5,
          ppfd: 1250
        },
        pricing: {
          msrp: 750
        }
      }

      const fixture = await db.fixtures.create(newFixtureData)
      
      expect(mockPrisma.fixtures.create).toHaveBeenCalledWith({
        data: newFixtureData
      })
      expect(fixture).toBeValidFixture()
    })

    it('should update existing fixture', async () => {
      const updateData = { pricing: { msrp: 1600 } }
      
      await db.fixtures.update('test_fixture_001', updateData)
      
      expect(mockPrisma.fixtures.update).toHaveBeenCalledWith({
        where: { id: 'test_fixture_001' },
        data: updateData
      })
    })

    it('should delete fixture', async () => {
      await db.fixtures.delete('test_fixture_001')
      
      expect(mockPrisma.fixtures.delete).toHaveBeenCalledWith({
        where: { id: 'test_fixture_001' }
      })
    })

    it('should search fixtures by specifications', async () => {
      const searchCriteria = {
        wattageMin: 500,
        wattageMax: 1500,
        efficacyMin: 2.0
      }

      await db.fixtures.findMany(undefined, undefined, searchCriteria)
      
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalledWith({
        where: {
          'specifications.wattage': {
            gte: 500,
            lte: 1500
          },
          'specifications.efficacy': {
            gte: 2.0
          }
        }
      })
    })
  })

  describe('Users', () => {
    it('should find all users', async () => {
      const users = await db.users.findMany()
      
      expect(mockPrisma.users.findMany).toHaveBeenCalled()
      expect(users).toEqual([mockUser])
    })

    it('should find user by ID', async () => {
      const user = await db.users.findById('test_user_123')
      
      expect(mockPrisma.users.findUnique).toHaveBeenCalledWith({
        where: { id: 'test_user_123' }
      })
      expect(user).toEqual(mockUser)
    })

    it('should find user by Clerk ID', async () => {
      const user = await db.users.findByClerkId('clerk_user_123')
      
      expect(mockPrisma.users.findByClerkId).toHaveBeenCalledWith('clerk_user_123')
      expect(user).toEqual(mockUser)
    })

    it('should create new user', async () => {
      const newUserData = {
        clerkId: 'clerk_new_user',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User'
      }

      const user = await db.users.create(newUserData)
      
      expect(mockPrisma.users.create).toHaveBeenCalledWith({
        data: newUserData
      })
      expect(user).toMatchObject({
        email: 'newuser@example.com',
        firstName: 'New'
      })
    })

    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        subscription: 'enterprise'
      }
      
      await db.users.update('test_user_123', updateData)
      
      expect(mockPrisma.users.update).toHaveBeenCalledWith({
        where: { id: 'test_user_123' },
        data: updateData
      })
    })
  })

  describe('Projects', () => {
    it('should find user projects', async () => {
      const projects = await db.projects.findMany('test_user_123')
      
      expect(mockPrisma.projects.findMany).toHaveBeenCalledWith({
        where: { userId: 'test_user_123' },
        include: {
          fixtures: {
            include: { fixture: true }
          }
        }
      })
      expect(projects).toEqual([mockProject])
    })

    it('should find project by ID', async () => {
      const project = await db.projects.findById('test_project_123')
      
      expect(mockPrisma.projects.findUnique).toHaveBeenCalledWith({
        where: { id: 'test_project_123' },
        include: {
          fixtures: {
            include: { fixture: true }
          }
        }
      })
      expect(project).toEqual(mockProject)
    })

    it('should create new project', async () => {
      const newProjectData = {
        name: 'New Growing Facility',
        description: 'A new indoor growing operation',
        userId: 'test_user_123',
        settings: {
          units: 'metric',
          currency: 'EUR'
        }
      }

      const project = await db.projects.create(newProjectData)
      
      expect(mockPrisma.projects.create).toHaveBeenCalledWith({
        data: newProjectData,
        include: {
          fixtures: {
            include: { fixture: true }
          }
        }
      })
      expect(project).toMatchObject({
        name: 'New Growing Facility',
        userId: 'test_user_123'
      })
    })

    it('should update project settings', async () => {
      const updateData = {
        settings: {
          units: 'imperial',
          currency: 'CAD'
        }
      }
      
      await db.projects.update('test_project_123', updateData)
      
      expect(mockPrisma.projects.update).toHaveBeenCalledWith({
        where: { id: 'test_project_123' },
        data: updateData,
        include: {
          fixtures: {
            include: { fixture: true }
          }
        }
      })
    })

    it('should delete project', async () => {
      await db.projects.delete('test_project_123')
      
      expect(mockPrisma.projects.delete).toHaveBeenCalledWith({
        where: { id: 'test_project_123' }
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.fixtures.findMany.mockRejectedValueOnce(new Error('Database connection failed'))
      
      await expect(db.fixtures.findMany()).rejects.toThrow('Database connection failed')
    })

    it('should handle not found errors', async () => {
      mockPrisma.fixtures.findUnique.mockResolvedValueOnce(null)
      
      const fixture = await db.fixtures.findById('nonexistent_id')
      expect(fixture).toBeNull()
    })

    it('should handle validation errors', async () => {
      const invalidData = {
        // Missing required fields
        manufacturer: '',
        model: ''
      }

      mockPrisma.fixtures.create.mockRejectedValueOnce(new Error('Validation failed'))
      
      await expect(db.fixtures.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  describe('Query Optimization', () => {
    it('should use efficient queries for large datasets', async () => {
      const filters = {
        wattageRange: [500, 1500],
        efficacyRange: [2.0, 3.0],
        manufacturer: 'Test Manufacturer'
      }

      await db.fixtures.findMany(undefined, filters.manufacturer, {
        wattageMin: filters.wattageRange[0],
        wattageMax: filters.wattageRange[1],
        efficacyMin: filters.efficacyRange[0],
        efficacyMax: filters.efficacyRange[1]
      })
      
      // Verify that the query includes proper indexable fields
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalledWith({
        where: {
          manufacturer: 'Test Manufacturer',
          'specifications.wattage': {
            gte: 500,
            lte: 1500
          },
          'specifications.efficacy': {
            gte: 2.0,
            lte: 3.0
          }
        }
      })
    })

    it('should limit results when specified', async () => {
      await db.fixtures.findMany(undefined, undefined, undefined, 10)
      
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalledWith({
        take: 10
      })
    })

    it('should support pagination', async () => {
      await db.fixtures.findMany(undefined, undefined, undefined, 10, 20)
      
      expect(mockPrisma.fixtures.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 20
      })
    })
  })
})