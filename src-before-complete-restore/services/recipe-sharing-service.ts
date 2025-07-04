/**
 * Recipe Sharing Service
 * 
 * Manages user-generated recipe sharing with Git-style version control,
 * diff viewing, and collaboration features
 */

import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import crypto from 'crypto'
import { z } from 'zod'
import * as diff from 'diff'
import { simpleGit, SimpleGit } from 'simple-git'
import path from 'path'
import fs from 'fs/promises'

const prisma = new PrismaClient()
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD
})

// Recipe schema
export const RecipeSchema = z.object({
  name: z.string(),
  description: z.string(),
  cultivar: z.string(),
  growthPhases: z.array(z.object({
    name: z.string(),
    duration: z.number(),
    environmental: z.object({
      temperature: z.object({ day: z.number(), night: z.number() }),
      humidity: z.object({ day: z.number(), night: z.number() }),
      co2: z.number(),
      vpd: z.object({ day: z.number(), night: z.number() })
    }),
    lighting: z.object({
      photoperiod: z.number(),
      intensity: z.number(),
      dli: z.number(),
      spectrum: z.object({
        uv: z.number().optional(),
        blue: z.number(),
        green: z.number(),
        red: z.number(),
        farRed: z.number()
      })
    }),
    nutrition: z.object({
      ec: z.number(),
      ph: z.number(),
      nutrients: z.record(z.number())
    }),
    irrigation: z.object({
      frequency: z.string(),
      volume: z.number(),
      runoffTarget: z.number()
    })
  })),
  expectedOutcomes: z.object({
    yield: z.number(),
    cycleDays: z.number(),
    quality: z.object({
      thc: z.number().optional(),
      cbd: z.number().optional(),
      terpenes: z.record(z.number()).optional()
    })
  }),
  tags: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  equipment: z.array(z.string()),
  notes: z.string().optional()
})

export type Recipe = z.infer<typeof RecipeSchema>

// Recipe version control
export interface RecipeVersion {
  id: string
  recipeId: string
  version: string
  authorId: string
  message: string
  changes: RecipeChange[]
  parentVersion?: string
  createdAt: Date
}

export interface RecipeChange {
  path: string
  type: 'added' | 'modified' | 'deleted'
  oldValue?: any
  newValue?: any
}

// Recipe collaboration
export interface RecipeCollaboration {
  recipeId: string
  userId: string
  role: 'owner' | 'maintainer' | 'contributor' | 'viewer'
  addedAt: Date
}

export interface RecipeFork {
  id: string
  originalRecipeId: string
  forkedByUserId: string
  forkedAt: Date
  divergedCommits: number
}

export interface RecipeMergeRequest {
  id: string
  sourceRecipeId: string
  targetRecipeId: string
  title: string
  description: string
  authorId: string
  status: 'open' | 'merged' | 'closed'
  changes: RecipeChange[]
  comments: RecipeComment[]
  createdAt: Date
  mergedAt?: Date
  mergedBy?: string
}

export interface RecipeComment {
  id: string
  userId: string
  message: string
  lineNumber?: number
  filePath?: string
  createdAt: Date
}

export class RecipeSharingService {
  private git: SimpleGit
  private repoPath: string

  constructor() {
    this.repoPath = process.env.RECIPE_REPO_PATH || '/tmp/vibelux-recipes'
    this.git = simpleGit(this.repoPath)
    this.initializeRepository()
  }

  /**
   * Initialize Git repository for recipes
   */
  private async initializeRepository() {
    try {
      await fs.access(this.repoPath)
    } catch {
      await fs.mkdir(this.repoPath, { recursive: true })
      await this.git.init()
    }
  }

  /**
   * Create a new recipe
   */
  async createRecipe(
    userId: string,
    recipeData: Recipe
  ): Promise<{ id: string; version: string }> {
    // Validate recipe
    const validated = RecipeSchema.parse(recipeData)
    
    // Create recipe record
    const recipe = await prisma.recipe.create({
      data: {
        name: validated.name,
        description: validated.description,
        cultivar: validated.cultivar,
        author_id: userId,
        data: validated as any,
        tags: validated.tags,
        difficulty: validated.difficulty,
        is_public: true,
        version: '1.0.0'
      }
    })
    
    // Create Git commit
    const recipePath = path.join(this.repoPath, `${recipe.id}.json`)
    await fs.writeFile(recipePath, JSON.stringify(validated, null, 2))
    
    await this.git.add(recipePath)
    await this.git.commit(`Initial recipe: ${validated.name}`, {
      '--author': `User <${userId}@vibelux.com>`
    })
    
    const commit = await this.git.revparse(['HEAD'])
    
    // Create version record
    await prisma.recipeVersion.create({
      data: {
        recipe_id: recipe.id,
        version: '1.0.0',
        commit_hash: commit,
        author_id: userId,
        message: `Initial recipe: ${validated.name}`,
        changes: [{
          path: '/',
          type: 'added',
          newValue: validated
        }]
      }
    })
    
    // Index for search
    await this.indexRecipe(recipe.id, validated)
    
    return { id: recipe.id, version: '1.0.0' }
  }

  /**
   * Update recipe with version control
   */
  async updateRecipe(
    recipeId: string,
    userId: string,
    updates: Partial<Recipe>,
    message: string
  ): Promise<{ version: string; changes: RecipeChange[] }> {
    // Check permissions
    const hasPermission = await this.checkPermission(recipeId, userId, 'contributor')
    if (!hasPermission) {
      throw new Error('Insufficient permissions')
    }
    
    // Get current recipe
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })
    
    if (!recipe) {
      throw new Error('Recipe not found')
    }
    
    const currentData = recipe.data as Recipe
    const updatedData = { ...currentData, ...updates }
    
    // Validate updated recipe
    const validated = RecipeSchema.parse(updatedData)
    
    // Calculate changes
    const changes = this.calculateChanges(currentData, validated)
    
    // Increment version
    const currentVersion = recipe.version.split('.')
    const newVersion = `${currentVersion[0]}.${parseInt(currentVersion[1]) + 1}.0`
    
    // Update recipe
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        data: validated as any,
        version: newVersion,
        updated_at: new Date()
      }
    })
    
    // Create Git commit
    const recipePath = path.join(this.repoPath, `${recipeId}.json`)
    await fs.writeFile(recipePath, JSON.stringify(validated, null, 2))
    
    await this.git.add(recipePath)
    await this.git.commit(message, {
      '--author': `User <${userId}@vibelux.com>`
    })
    
    const commit = await this.git.revparse(['HEAD'])
    
    // Create version record
    await prisma.recipeVersion.create({
      data: {
        recipe_id: recipeId,
        version: newVersion,
        commit_hash: commit,
        author_id: userId,
        message,
        changes: changes as any,
        parent_version: recipe.version
      }
    })
    
    // Update search index
    await this.indexRecipe(recipeId, validated)
    
    return { version: newVersion, changes }
  }

  /**
   * Fork a recipe
   */
  async forkRecipe(
    recipeId: string,
    userId: string
  ): Promise<{ forkedRecipeId: string }> {
    // Get original recipe
    const original = await prisma.recipe.findUnique({
      where: { id: recipeId }
    })
    
    if (!original) {
      throw new Error('Recipe not found')
    }
    
    // Create forked recipe
    const forked = await prisma.recipe.create({
      data: {
        name: `${original.name} (Fork)`,
        description: original.description,
        cultivar: original.cultivar,
        author_id: userId,
        data: original.data,
        tags: original.tags,
        difficulty: original.difficulty,
        is_public: true,
        version: '1.0.0',
        forked_from_id: recipeId
      }
    })
    
    // Create fork record
    await prisma.recipeFork.create({
      data: {
        original_recipe_id: recipeId,
        forked_recipe_id: forked.id,
        forked_by_user_id: userId
      }
    })
    
    // Copy Git history
    const originalPath = path.join(this.repoPath, `${recipeId}.json`)
    const forkedPath = path.join(this.repoPath, `${forked.id}.json`)
    await fs.copyFile(originalPath, forkedPath)
    
    await this.git.add(forkedPath)
    await this.git.commit(`Forked from ${original.name}`, {
      '--author': `User <${userId}@vibelux.com>`
    })
    
    return { forkedRecipeId: forked.id }
  }

  /**
   * Create merge request
   */
  async createMergeRequest(
    sourceRecipeId: string,
    targetRecipeId: string,
    userId: string,
    title: string,
    description: string
  ): Promise<RecipeMergeRequest> {
    // Verify recipes exist and user has access
    const [source, target] = await Promise.all([
      prisma.recipe.findUnique({ where: { id: sourceRecipeId } }),
      prisma.recipe.findUnique({ where: { id: targetRecipeId } })
    ])
    
    if (!source || !target) {
      throw new Error('Recipe not found')
    }
    
    // Check if source is fork of target
    const fork = await prisma.recipeFork.findFirst({
      where: {
        forked_recipe_id: sourceRecipeId,
        original_recipe_id: targetRecipeId
      }
    })
    
    if (!fork && source.forked_from_id !== targetRecipeId) {
      throw new Error('Source recipe must be a fork of target recipe')
    }
    
    // Calculate changes between recipes
    const changes = this.calculateChanges(
      target.data as Recipe,
      source.data as Recipe
    )
    
    // Create merge request
    const mergeRequest = await prisma.recipeMergeRequest.create({
      data: {
        source_recipe_id: sourceRecipeId,
        target_recipe_id: targetRecipeId,
        title,
        description,
        author_id: userId,
        status: 'open',
        changes: changes as any
      }
    })
    
    // Notify target recipe owner
    await this.notifyMergeRequest(target.author_id, mergeRequest.id, title)
    
    return {
      id: mergeRequest.id,
      sourceRecipeId,
      targetRecipeId,
      title,
      description,
      authorId: userId,
      status: 'open',
      changes,
      comments: [],
      createdAt: mergeRequest.created_at
    }
  }

  /**
   * Merge a merge request
   */
  async mergeMergeRequest(
    mergeRequestId: string,
    userId: string
  ): Promise<{ merged: boolean; version: string }> {
    const mergeRequest = await prisma.recipeMergeRequest.findUnique({
      where: { id: mergeRequestId },
      include: {
        target_recipe: true,
        source_recipe: true
      }
    })
    
    if (!mergeRequest) {
      throw new Error('Merge request not found')
    }
    
    // Check permissions
    const hasPermission = await this.checkPermission(
      mergeRequest.target_recipe_id,
      userId,
      'maintainer'
    )
    
    if (!hasPermission) {
      throw new Error('Insufficient permissions to merge')
    }
    
    // Apply changes to target recipe
    const targetData = mergeRequest.target_recipe.data as Recipe
    const sourceData = mergeRequest.source_recipe.data as Recipe
    const mergedData = this.mergeRecipeData(targetData, sourceData)
    
    // Update target recipe
    const newVersion = this.incrementVersion(mergeRequest.target_recipe.version, 'minor')
    
    await prisma.recipe.update({
      where: { id: mergeRequest.target_recipe_id },
      data: {
        data: mergedData as any,
        version: newVersion
      }
    })
    
    // Update merge request
    await prisma.recipeMergeRequest.update({
      where: { id: mergeRequestId },
      data: {
        status: 'merged',
        merged_at: new Date(),
        merged_by: userId
      }
    })
    
    // Create version record
    await prisma.recipeVersion.create({
      data: {
        recipe_id: mergeRequest.target_recipe_id,
        version: newVersion,
        commit_hash: crypto.randomUUID(),
        author_id: userId,
        message: `Merged: ${mergeRequest.title}`,
        changes: mergeRequest.changes as any
      }
    })
    
    return { merged: true, version: newVersion }
  }

  /**
   * Get recipe diff between versions
   */
  async getRecipeDiff(
    recipeId: string,
    fromVersion: string,
    toVersion: string
  ): Promise<RecipeDiff> {
    const versions = await prisma.recipeVersion.findMany({
      where: {
        recipe_id: recipeId,
        version: { in: [fromVersion, toVersion] }
      },
      orderBy: { created_at: 'asc' }
    })
    
    if (versions.length !== 2) {
      throw new Error('Invalid versions')
    }
    
    // Get recipe data for each version
    const fromPath = path.join(this.repoPath, `${recipeId}.json`)
    const [fromCommit, toCommit] = versions.map(v => v.commit_hash)
    
    // Get file content at specific commits
    const fromContent = await this.git.show([`${fromCommit}:${path.basename(fromPath)}`])
    const toContent = await this.git.show([`${toCommit}:${path.basename(fromPath)}`])
    
    const fromData = JSON.parse(fromContent)
    const toData = JSON.parse(toContent)
    
    // Generate diff
    const textDiff = diff.createPatch(
      `${recipeId}.json`,
      JSON.stringify(fromData, null, 2),
      JSON.stringify(toData, null, 2),
      fromVersion,
      toVersion
    )
    
    // Calculate structured changes
    const changes = this.calculateChanges(fromData, toData)
    
    return {
      recipeId,
      fromVersion,
      toVersion,
      textDiff,
      changes,
      summary: {
        additions: changes.filter(c => c.type === 'added').length,
        modifications: changes.filter(c => c.type === 'modified').length,
        deletions: changes.filter(c => c.type === 'deleted').length
      }
    }
  }

  /**
   * Search recipes
   */
  async searchRecipes(
    query: string,
    filters?: {
      cultivar?: string
      difficulty?: string
      tags?: string[]
      author?: string
      minYield?: number
      maxCycleDays?: number
    }
  ): Promise<RecipeSearchResult[]> {
    // Build search query
    const where: any = {
      is_public: true
    }
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { cultivar: { contains: query, mode: 'insensitive' } }
      ]
    }
    
    if (filters?.cultivar) {
      where.cultivar = filters.cultivar
    }
    
    if (filters?.difficulty) {
      where.difficulty = filters.difficulty
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags }
    }
    
    if (filters?.author) {
      where.author_id = filters.author
    }
    
    // Search recipes
    const recipes = await prisma.recipe.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            likes: true,
            forks: true,
            comments: true
          }
        }
      },
      orderBy: [
        { likes: { _count: 'desc' } },
        { created_at: 'desc' }
      ],
      take: 50
    })
    
    // Filter by yield and cycle days if specified
    let filtered = recipes
    
    if (filters?.minYield) {
      filtered = filtered.filter(r => {
        const data = r.data as Recipe
        return data.expectedOutcomes.yield >= filters.minYield
      })
    }
    
    if (filters?.maxCycleDays) {
      filtered = filtered.filter(r => {
        const data = r.data as Recipe
        return data.expectedOutcomes.cycleDays <= filters.maxCycleDays
      })
    }
    
    return filtered.map(recipe => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      cultivar: recipe.cultivar,
      author: {
        id: recipe.author.id,
        name: recipe.author.name || recipe.author.email
      },
      difficulty: recipe.difficulty,
      tags: recipe.tags,
      expectedYield: (recipe.data as Recipe).expectedOutcomes.yield,
      cycleDays: (recipe.data as Recipe).expectedOutcomes.cycleDays,
      likes: recipe._count.likes,
      forks: recipe._count.forks,
      comments: recipe._count.comments,
      version: recipe.version,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at
    }))
  }

  /**
   * Get recipe details with version history
   */
  async getRecipeDetails(
    recipeId: string,
    version?: string
  ): Promise<RecipeDetails> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        versions: {
          orderBy: { created_at: 'desc' },
          take: 10,
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    if (!recipe) {
      throw new Error('Recipe not found')
    }
    
    // Get specific version if requested
    let data = recipe.data as Recipe
    if (version && version !== recipe.version) {
      const versionRecord = await prisma.recipeVersion.findFirst({
        where: {
          recipe_id: recipeId,
          version
        }
      })
      
      if (!versionRecord) {
        throw new Error('Version not found')
      }
      
      // Load version data from Git
      const versionPath = path.join(this.repoPath, `${recipeId}.json`)
      const content = await this.git.show([
        `${versionRecord.commit_hash}:${path.basename(versionPath)}`
      ])
      data = JSON.parse(content)
    }
    
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      cultivar: recipe.cultivar,
      data,
      author: {
        id: recipe.author.id,
        name: recipe.author.name || recipe.author.email
      },
      version: version || recipe.version,
      versions: recipe.versions.map(v => ({
        version: v.version,
        author: {
          id: v.author.id,
          name: v.author.name || v.author.email
        },
        message: v.message,
        createdAt: v.created_at
      })),
      collaborators: recipe.collaborators.map(c => ({
        user: {
          id: c.user.id,
          name: c.user.name || c.user.email
        },
        role: c.role as any,
        addedAt: c.added_at
      })),
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at
    }
  }

  // Helper methods
  private calculateChanges(oldData: Recipe, newData: Recipe): RecipeChange[] {
    const changes: RecipeChange[] = []
    
    // Deep comparison of recipe objects
    const compareObjects = (oldObj: any, newObj: any, path: string = '') => {
      const allKeys = new Set([
        ...Object.keys(oldObj || {}),
        ...Object.keys(newObj || {})
      ])
      
      for (const key of allKeys) {
        const currentPath = path ? `${path}.${key}` : key
        
        if (!(key in oldObj)) {
          changes.push({
            path: currentPath,
            type: 'added',
            newValue: newObj[key]
          })
        } else if (!(key in newObj)) {
          changes.push({
            path: currentPath,
            type: 'deleted',
            oldValue: oldObj[key]
          })
        } else if (typeof oldObj[key] === 'object' && typeof newObj[key] === 'object') {
          compareObjects(oldObj[key], newObj[key], currentPath)
        } else if (oldObj[key] !== newObj[key]) {
          changes.push({
            path: currentPath,
            type: 'modified',
            oldValue: oldObj[key],
            newValue: newObj[key]
          })
        }
      }
    }
    
    compareObjects(oldData, newData)
    return changes
  }

  private mergeRecipeData(target: Recipe, source: Recipe): Recipe {
    // Simple merge strategy - can be enhanced with conflict resolution
    return {
      ...target,
      ...source,
      tags: [...new Set([...target.tags, ...source.tags])]
    }
  }

  private incrementVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const parts = version.split('.').map(Number)
    
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
    }
  }

  private async checkPermission(
    recipeId: string,
    userId: string,
    requiredRole: 'viewer' | 'contributor' | 'maintainer' | 'owner'
  ): Promise<boolean> {
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        collaborators: {
          where: { user_id: userId }
        }
      }
    })
    
    if (!recipe) return false
    
    // Owner has all permissions
    if (recipe.author_id === userId) return true
    
    // Check collaborator role
    const collaborator = recipe.collaborators[0]
    if (!collaborator) return false
    
    const roleHierarchy = {
      viewer: 1,
      contributor: 2,
      maintainer: 3,
      owner: 4
    }
    
    return roleHierarchy[collaborator.role as keyof typeof roleHierarchy] >= 
           roleHierarchy[requiredRole]
  }

  private async indexRecipe(recipeId: string, data: Recipe) {
    // Index recipe for search (could use Elasticsearch in production)
    await redis.hset(
      'recipe:search:index',
      recipeId,
      JSON.stringify({
        name: data.name,
        cultivar: data.cultivar,
        tags: data.tags,
        difficulty: data.difficulty,
        yield: data.expectedOutcomes.yield,
        cycleDays: data.expectedOutcomes.cycleDays
      })
    )
  }

  private async notifyMergeRequest(userId: string, mergeRequestId: string, title: string) {
    // Send notification to user about new merge request
    await prisma.notification.create({
      data: {
        user_id: userId,
        type: 'merge_request',
        title: 'New merge request',
        message: `New merge request: ${title}`,
        data: { mergeRequestId }
      }
    })
  }
}

// Type definitions
interface RecipeDiff {
  recipeId: string
  fromVersion: string
  toVersion: string
  textDiff: string
  changes: RecipeChange[]
  summary: {
    additions: number
    modifications: number
    deletions: number
  }
}

interface RecipeSearchResult {
  id: string
  name: string
  description: string
  cultivar: string
  author: {
    id: string
    name: string
  }
  difficulty: string
  tags: string[]
  expectedYield: number
  cycleDays: number
  likes: number
  forks: number
  comments: number
  version: string
  createdAt: Date
  updatedAt: Date
}

interface RecipeDetails {
  id: string
  name: string
  description: string
  cultivar: string
  data: Recipe
  author: {
    id: string
    name: string
  }
  version: string
  versions: Array<{
    version: string
    author: {
      id: string
      name: string
    }
    message: string
    createdAt: Date
  }>
  collaborators: Array<{
    user: {
      id: string
      name: string
    }
    role: 'owner' | 'maintainer' | 'contributor' | 'viewer'
    addedAt: Date
  }>
  createdAt: Date
  updatedAt: Date
}

export default RecipeSharingService