// Mobile Authentication API
// Handles login, logout, and token management for mobile apps

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';

// Login endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, deviceId, deviceName, platform } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    // Mock user authentication (replace with actual DB query)
    const user = {
      id: 'user_123',
      email: email,
      name: 'John Grower',
      role: 'grower',
      permissions: ['view_dashboard', 'control_environment', 'manage_tasks']
    };

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, deviceId },
      REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // Log device info
    if (deviceId) {
      await logDevice(user.id, { deviceId, deviceName, platform });
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        },
        tokens: {
          accessToken,
          refreshToken,
          expiresIn: 3600
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Refresh token endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token required' },
        { status: 400 }
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as any;

    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      success: true,
      data: {
        accessToken,
        expiresIn: 3600
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'No authorization header' },
        { status: 401 }
      );
    }

    // In production, invalidate the token
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

// Helper function to log device info
async function logDevice(userId: string, device: any) {
  // In production, save to database
}