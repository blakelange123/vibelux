// Mobile App API Endpoints
// RESTful API for Vibelux mobile applications

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// API versioning and documentation
const API_VERSION = '1.0.0';
const API_DOCS = {
  version: API_VERSION,
  endpoints: {
    auth: '/api/v1/mobile/auth',
    dashboard: '/api/v1/mobile/dashboard',
    rooms: '/api/v1/mobile/rooms',
    sensors: '/api/v1/mobile/sensors',
    controls: '/api/v1/mobile/controls',
    alerts: '/api/v1/mobile/alerts',
    tasks: '/api/v1/mobile/tasks',
    recipes: '/api/v1/mobile/recipes'
  }
};

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Vibelux Mobile API',
    documentation: API_DOCS,
    timestamp: new Date()
  });
}