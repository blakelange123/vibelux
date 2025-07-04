/**
 * Database connection module
 * Real Prisma client implementation for VibeLux
 */

import { prisma } from './prisma'
import { createClient } from '@supabase/supabase-js'
import { User, Project, Fixture, ProjectFixture, LightRecipe, Report, SubscriptionTier } from '@prisma/client'

// Initialize Supabase client for file storage (optional)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Real database client using Prisma
export const db = {
  // Projects
  projects: {
    findMany: async (userId?: string) => {
      if (userId) {
        return await prisma.project.findMany({
          where: { userId },
          include: {
            fixtures: {
              include: {
                fixture: true
              }
            },
            calculations: true,
            reports: true
          },
          orderBy: { updatedAt: 'desc' }
        })
      }
      return await prisma.project.findMany({
        include: {
          user: true,
          fixtures: {
            include: {
              fixture: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' }
      })
    },
    
    findUnique: async (id: string) => {
      return await prisma.project.findUnique({
        where: { id },
        include: {
          user: true,
          fixtures: {
            include: {
              fixture: true
            }
          },
          calculations: true,
          reports: true
        }
      })
    },
    
    create: async (data: {
      name: string
      description?: string
      userId: string
      location?: any
      roomDimensions?: any
      fixtureLayout?: any
    }) => {
      return await prisma.project.create({
        data,
        include: {
          fixtures: {
            include: {
              fixture: true
            }
          }
        }
      })
    },
    
    update: async (id: string, data: Partial<Project>) => {
      return await prisma.project.update({
        where: { id },
        data,
        include: {
          fixtures: {
            include: {
              fixture: true
            }
          }
        }
      })
    },
    
    delete: async (id: string) => {
      return await prisma.project.delete({
        where: { id }
      })
    },
  },
  
  // Fixtures
  fixtures: {
    findMany: async (options?: {
      manufacturer?: string
      dlcQualified?: boolean
      minEfficacy?: number
      maxWattage?: number
      search?: string
    }) => {
      const where: any = {}
      
      if (options?.manufacturer) {
        where.manufacturer = {
          contains: options.manufacturer,
          mode: 'insensitive'
        }
      }
      
      if (options?.dlcQualified !== undefined) {
        where.dlcQualified = options.dlcQualified
      }
      
      if (options?.minEfficacy) {
        where.efficacy = {
          gte: options.minEfficacy
        }
      }
      
      if (options?.maxWattage) {
        where.wattage = {
          lte: options.maxWattage
        }
      }
      
      if (options?.search) {
        where.OR = [
          { manufacturer: { contains: options.search, mode: 'insensitive' } },
          { model: { contains: options.search, mode: 'insensitive' } }
        ]
      }
      
      return await prisma.fixture.findMany({
        where,
        orderBy: { efficacy: 'desc' },
        take: 100 // Limit for performance
      })
    },
    
    findUnique: async (id: string) => {
      return await prisma.fixture.findUnique({
        where: { id },
        include: {
          projectFixtures: {
            include: {
              project: true
            }
          }
        }
      })
    },
    
    create: async (data: {
      manufacturer: string
      model: string
      ppf: number
      wattage: number
      efficacy: number
      spectrum: any
      dimensions: any
      voltage: string
      dlcQualified?: boolean
      dlcPremium?: boolean
      beamAngle?: number
      distribution?: string
      powerFactor?: number
      thd?: number
      weight?: number
      dataSheet?: string
      iesFile?: string
      images?: string[]
    }) => {
      return await prisma.fixture.create({
        data
      })
    },
    
    update: async (id: string, data: Partial<Fixture>) => {
      return await prisma.fixture.update({
        where: { id },
        data
      })
    },
    
    delete: async (id: string) => {
      return await prisma.fixture.delete({
        where: { id }
      })
    },
  },
  
  // Users
  users: {
    findMany: async () => {
      return await prisma.user.findMany({
        include: {
          projects: true,
          usageRecords: true
        },
        orderBy: { createdAt: 'desc' }
      })
    },
    
    findUnique: async (id: string) => {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          projects: true,
          experiments: true,
          spectralLearningProfiles: true,
          facilities: true,
          investments: true,
          affiliateProfile: true,
          notifications: true,
          scoutingRecords: true,
          tasks: true
        }
      })
    },
    
    findByClerkId: async (clerkId: string) => {
      return await prisma.user.findUnique({
        where: { clerkId },
        include: {
          projects: true,
          usageRecords: true
        }
      })
    },
    
    create: async (data: {
      clerkId: string
      email: string
      name?: string
      subscriptionTier?: SubscriptionTier
    }) => {
      return await prisma.user.create({
        data
      })
    },
    
    update: async (id: string, data: Partial<User>) => {
      return await prisma.user.update({
        where: { id },
        data
      })
    },
    
    delete: async (id: string) => {
      return await prisma.user.delete({
        where: { id }
      })
    },
  },

  // Project Fixtures (junction table)
  projectFixtures: {
    create: async (data: {
      projectId: string
      fixtureId: string
      position: any
      rotation?: number
      quantity?: number
    }) => {
      return await prisma.projectFixture.create({
        data,
        include: {
          fixture: true,
          project: true
        }
      })
    },
    
    findMany: async (projectId: string) => {
      return await prisma.projectFixture.findMany({
        where: { projectId },
        include: {
          fixture: true
        }
      })
    },
    
    delete: async (id: string) => {
      return await prisma.projectFixture.delete({
        where: { id }
      })
    }
  },

  // Light Recipes
  lightRecipes: {
    findMany: async (userId?: string, crop?: string) => {
      const where: any = {}
      if (userId) where.userId = userId
      if (crop) where.crop = crop
      
      return await prisma.lightRecipe.findMany({
        where,
        include: {
          user: true
        },
        orderBy: { updatedAt: 'desc' }
      })
    },
    
    create: async (data: {
      name: string
      description?: string
      userId: string
      crop: string
      stages: any
      validated?: boolean
      public?: boolean
    }) => {
      return await prisma.lightRecipe.create({
        data
      })
    }
  },

  // Usage tracking
  usageRecords: {
    create: async (data: {
      userId: string
      feature: string
      action: string
      count?: number
      metadata?: any
    }) => {
      return await prisma.usageRecord.create({
        data
      })
    },
    
    getUserUsage: async (userId: string, startDate?: Date, endDate?: Date) => {
      const where: any = { userId }
      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) where.createdAt.gte = startDate
        if (endDate) where.createdAt.lte = endDate
      }
      
      return await prisma.usageRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })
    }
  },

  // Facility Management
  facilities: {
    findByUserId: async (userId: string) => {
      const facilityUser = await prisma.facilityUser.findFirst({
        where: { userId },
        include: {
          facility: true
        }
      })
      return facilityUser?.facility
    },

    findMany: async () => {
      return await prisma.facility.findMany({
        include: {
          users: {
            include: {
              user: true
            }
          },
          investments: true,
          projects: true
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    create: async (data: {
      name: string
      description?: string
      type: 'GREENHOUSE' | 'INDOOR' | 'VERTICAL_FARM' | 'RESEARCH' | 'HYBRID'
      address?: string
      city?: string
      state?: string
      country?: string
      zipCode?: string
      size?: number
      settings?: any
    }) => {
      return await prisma.facility.create({
        data
      })
    },

    addUser: async (facilityId: string, userId: string, role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER') => {
      return await prisma.facilityUser.create({
        data: {
          facilityId,
          userId,
          role
        },
        include: {
          facility: true,
          user: true
        }
      })
    }
  },

  // Investment Operations
  investments: {
    findOpportunities: async (facilityId?: string) => {
      const where = facilityId ? { facilityId } : {}
      return await prisma.investmentOpportunity.findMany({
        where,
        include: {
          facility: true,
          investments: {
            include: {
              investor: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    },

    findOpportunityById: async (id: string) => {
      return await prisma.investmentOpportunity.findUnique({
        where: { id },
        include: {
          facility: true,
          investments: {
            include: {
              investor: true,
              payouts: true
            }
          }
        }
      })
    },

    createOpportunity: async (data: {
      facilityId: string
      title: string
      description: string
      type: 'EXPANSION' | 'EQUIPMENT' | 'TECHNOLOGY' | 'OPERATIONS' | 'RESEARCH'
      minInvestment: number
      maxInvestment: number
      targetAmount: number
      expectedReturn: number
      duration: number
      paymentSchedule: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'AT_MATURITY'
      documents?: any
      startDate?: Date
      endDate?: Date
    }) => {
      return await prisma.investmentOpportunity.create({
        data,
        include: {
          facility: true
        }
      })
    },

    updateOpportunity: async (id: string, data: Partial<{
      title: string
      description: string
      status: 'DRAFT' | 'ACTIVE' | 'FUNDED' | 'CLOSED' | 'COMPLETED'
      minInvestment: number
      maxInvestment: number
      targetAmount: number
      expectedReturn: number
      duration: number
      paymentSchedule: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'AT_MATURITY'
      documents: any
      startDate: Date
      endDate: Date
    }>) => {
      return await prisma.investmentOpportunity.update({
        where: { id },
        data
      })
    },

    deleteOpportunity: async (id: string) => {
      return await prisma.investmentOpportunity.delete({
        where: { id }
      })
    },

    createInvestment: async (data: {
      opportunityId: string
      investorId: string
      amount: number
      paymentMethod?: string
      transactionId?: string
      notes?: string
    }) => {
      return await prisma.investment.create({
        data,
        include: {
          opportunity: true,
          investor: true
        }
      })
    },

    updateInvestmentStatus: async (id: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED') => {
      return await prisma.investment.update({
        where: { id },
        data: { status }
      })
    },

    getUserInvestments: async (userId: string) => {
      return await prisma.investment.findMany({
        where: { investorId: userId },
        include: {
          opportunity: {
            include: {
              facility: true
            }
          },
          payouts: true
        },
        orderBy: { investedAt: 'desc' }
      })
    }
  },

  // Affiliate Operations
  affiliates: {
    findByCode: async (code: string) => {
      return await prisma.affiliate.findUnique({
        where: { code },
        include: {
          user: true,
          referrals: true
        }
      })
    },

    findByUserId: async (userId: string) => {
      return await prisma.affiliate.findUnique({
        where: { userId },
        include: {
          user: true,
          referrals: true,
          payouts: true
        }
      })
    },

    findMany: async (options?: {
      status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
      tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
    }) => {
      const where: any = {}
      if (options?.status) where.status = options.status
      if (options?.tier) where.tier = options.tier

      return await prisma.affiliate.findMany({
        where,
        include: {
          user: true,
          referrals: true
        },
        orderBy: { totalRevenue: 'desc' }
      })
    },

    create: async (data: {
      userId: string
      code: string
      tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
      baseCommission?: number
      bonusCommission?: number
    }) => {
      return await prisma.affiliate.create({
        data: {
          userId: data.userId,
          code: data.code,
          tier: data.tier || 'BRONZE',
          baseCommission: data.baseCommission || 10,
          bonusCommission: data.bonusCommission || 0
        },
        include: {
          user: true
        }
      })
    },

    update: async (id: string, data: Partial<{
      code: string
      tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
      status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED'
      baseCommission: number
      bonusCommission: number
      paymentMethod: string
      paymentDetails: any
    }>) => {
      return await prisma.affiliate.update({
        where: { id },
        data
      })
    },

    createReferral: async (data: {
      affiliateId: string
      referredEmail: string
    }) => {
      return await prisma.affiliateReferral.create({
        data
      })
    },

    updateReferralStatus: async (id: string, data: {
      status: 'PENDING' | 'SIGNED_UP' | 'CONVERTED' | 'EXPIRED'
      signedUpAt?: Date
      firstPurchaseAt?: Date
      totalPurchases?: number
      totalCommission?: number
    }) => {
      return await prisma.affiliateReferral.update({
        where: { id },
        data
      })
    }
  }
}

// Export a secure query builder for complex queries
export const query = {
  // DEPRECATED: Use typed queries instead of raw SQL
  raw: async (sql: string, params?: any[]) => {
    throw new Error('Raw SQL queries are disabled for security. Use Prisma typed queries instead.')
  },
  
  // Safe alternative for complex queries
  safeQuery: async (queryName: string, params: Record<string, any> = {}) => {
    // Predefined safe queries only
    const allowedQueries = {
      getUserProjects: `
        SELECT p.*, u.email as user_email 
        FROM "Project" p 
        JOIN "User" u ON p."userId" = u.id 
        WHERE p."userId" = $1
      `,
      getProjectStats: `
        SELECT 
          COUNT(*) as total_projects,
          SUM(CASE WHEN p."status" = 'ACTIVE' THEN 1 ELSE 0 END) as active_projects
        FROM "Project" p
        WHERE p."userId" = $1
      `
    }
    
    if (!allowedQueries[queryName as keyof typeof allowedQueries]) {
      throw new Error(`Query '${queryName}' is not allowed`)
    }
    
    const sql = allowedQueries[queryName as keyof typeof allowedQueries]
    const paramValues = Object.values(params)
    
    return await prisma.$queryRaw(sql as any, ...paramValues)
  },
  
  transaction: async <T>(callback: (tx: typeof prisma) => Promise<T>) => {
    return await prisma.$transaction(callback)
  }
}

// Export the Prisma client directly
export { prisma }

export default db