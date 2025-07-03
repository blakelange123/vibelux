import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth';
import { withErrorHandler, ErrorResponses, ValidationError } from '@/lib/error-handler';
import { createNotification, NotificationTemplates } from '@/lib/notifications';
import { hasPermission } from '@/lib/permissions';
import { db } from '@/lib/db';

// Example validation schema
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(['INDOOR', 'GREENHOUSE', 'VERTICAL_FARM']),
});

/**
 * Example GET endpoint with proper error handling
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // 2. Permission check
  if (!await hasPermission(user.id, 'projects.view')) {
    throw ErrorResponses.forbidden('You do not have permission to view projects');
  }
  
  // 3. Get query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  if (page < 1 || limit < 1 || limit > 100) {
    throw ErrorResponses.badRequest('Invalid pagination parameters');
  }
  
  // 4. Fetch data with error handling
  try {
    const projects = await db.projects.findMany(user.id);
    
    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total: projects.length,
      },
    });
  } catch (error) {
    // Database errors are automatically handled by withErrorHandler
    throw error;
  }
});

/**
 * Example POST endpoint with validation and notifications
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // 2. Permission check
  if (!await hasPermission(user.id, 'projects.create')) {
    throw ErrorResponses.forbidden('You do not have permission to create projects');
  }
  
  // 3. Parse and validate request body
  const body = await request.json();
  const validation = createProjectSchema.safeParse(body);
  
  if (!validation.success) {
    throw new ValidationError(validation.error.errors);
  }
  
  const data = validation.data;
  
  // 4. Check for conflicts
  const existingProject = await db.projects.findMany(user.id);
  const duplicate = existingProject.find(p => p.name === data.name);
  
  if (duplicate) {
    throw ErrorResponses.conflict('A project with this name already exists');
  }
  
  // 5. Check subscription limits
  const userDetails = await db.users.findUnique(user.id);
  const projectLimits = {
    FREE: 3,
    STARTER: 10,
    PROFESSIONAL: 50,
    BUSINESS: 200,
    ENTERPRISE: -1, // unlimited
  };
  
  const limit = projectLimits[userDetails?.subscriptionTier || 'FREE'];
  if (limit !== -1 && existingProject.length >= limit) {
    throw ErrorResponses.paymentRequired(
      `You have reached the project limit for your plan (${limit} projects). Please upgrade to create more projects.`
    );
  }
  
  // 6. Create the project
  try {
    const project = await db.projects.create({
      name: data.name,
      description: data.description,
      userId: user.id,
      roomDimensions: {
        width: 0,
        length: 0,
        height: 0,
        units: 'feet',
      },
    });
    
    // 7. Send notification
    await createNotification({
      userId: user.id,
      type: 'success',
      title: 'Project Created',
      message: `Your project "${project.name}" has been created successfully.`,
      data: { projectId: project.id },
    });
    
    // 8. Return success response
    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
    
  } catch (error) {
    // Any database errors will be caught and handled by withErrorHandler
    throw error;
  }
});

/**
 * Example DELETE endpoint with authorization
 */
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  // 1. Authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  // 2. Get project ID from URL
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id');
  
  if (!projectId) {
    throw ErrorResponses.badRequest('Project ID is required');
  }
  
  // 3. Check if project exists and user owns it
  const project = await db.projects.findUnique(projectId);
  
  if (!project) {
    throw ErrorResponses.notFound('Project');
  }
  
  if (project.userId !== user.id) {
    throw ErrorResponses.forbidden('You do not have permission to delete this project');
  }
  
  // 4. Check permission
  if (!await hasPermission(user.id, 'projects.delete')) {
    throw ErrorResponses.forbidden('Your plan does not allow deleting projects');
  }
  
  // 5. Delete the project
  try {
    await db.projects.delete(projectId);
    
    // 6. Send notification
    await createNotification({
      userId: user.id,
      type: 'info',
      title: 'Project Deleted',
      message: `Project "${project.name}" has been deleted.`,
    });
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
    
  } catch (error) {
    throw error;
  }
});