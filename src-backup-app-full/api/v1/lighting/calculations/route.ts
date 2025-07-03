import { NextRequest } from 'next/server';
import { validateApiKey, checkRateLimit } from '../../_middleware/auth';
import { handleApiError, successResponse } from '../../_middleware/error-handler';
import { rateLimitResponse, getRateLimitHeaders } from '../../_middleware/rate-limit';
import { validateQueryParams } from '../../_middleware/validation';
import { prisma } from '@/lib/prisma';
import { calculatePPFD, calculateDLI, calculateUniformity } from '@/lib/ppfd-calculations';
import { z } from 'zod';

const querySchema = z.object({
  projectId: z.string(),
  height: z.coerce.number().positive().optional(),
  photoperiod: z.coerce.number().min(0).max(24).default(12)
});

export async function GET(req: NextRequest) {
  try {
    // Validate API key
    const authResult = await validateApiKey(req, 'lighting:read');
    if ('status' in authResult) return authResult;
    const { user } = authResult;

    // Check rate limit
    const rateLimitKey = `lighting-calculations:${user.id}`;
    const isAllowed = await checkRateLimit(user.id, user.subscriptionTier);
    
    if (!isAllowed) {
      return rateLimitResponse(rateLimitKey, 500, 3600);
    }

    // Parse and validate query parameters
    const params = validateQueryParams(req.nextUrl.searchParams, querySchema);

    // Fetch project with fixtures
    const project = await prisma.project.findFirst({
      where: {
        id: params.projectId,
        userId: user.id
      },
      include: {
        fixtures: {
          include: {
            fixture: true
          }
        }
      }
    });

    if (!project) {
      return handleApiError(
        new Error('Project not found or access denied'),
        req.nextUrl.pathname
      );
    }

    const roomDimensions = project.roomDimensions as any;
    if (!roomDimensions) {
      return handleApiError(
        new Error('Project room dimensions not configured'),
        req.nextUrl.pathname
      );
    }

    // Calculate PPFD map
    const fixtures = project.fixtures.map(pf => {
      const position = pf.position as { x: number; y: number; z: number };
      return {
        ...pf.fixture,
        x: position.x,
        y: position.y,
        z: position.z,
        position,
        quantity: pf.quantity,
        enabled: true,
        beamAngle: pf.fixture.beamAngle || 120 // Default to 120 degrees if null
      };
    });

    const canopyHeight = params.height || 1.0; // Default 1m canopy height
    const mountingHeight = (roomDimensions.height || 3) - canopyHeight;

    // Generate PPFD grid
    const gridResolution = 0.5; // 0.5m grid
    const gridWidth = Math.ceil(roomDimensions.width / gridResolution);
    const gridLength = Math.ceil(roomDimensions.length / gridResolution);
    
    const ppfdGrid: number[][] = [];
    const ppfdValues: number[] = [];

    for (let y = 0; y < gridLength; y++) {
      const row: number[] = [];
      for (let x = 0; x < gridWidth; x++) {
        const pointX = x * gridResolution + gridResolution / 2;
        const pointY = y * gridResolution + gridResolution / 2;
        
        // Calculate PPFD at this point from all fixtures
        let totalPPFD = 0;
        fixtures.forEach(fixture => {
          for (let i = 0; i < fixture.quantity; i++) {
            const ppfd = calculatePPFD(
              fixture,
              pointX,
              pointY,
              canopyHeight
            );
            totalPPFD += ppfd;
          }
        });
        
        row.push(Math.round(totalPPFD));
        ppfdValues.push(totalPPFD);
      }
      ppfdGrid.push(row);
    }

    // Calculate statistics
    const avgPPFD = ppfdValues.reduce((a, b) => a + b, 0) / ppfdValues.length;
    const minPPFD = Math.min(...ppfdValues);
    const maxPPFD = Math.max(...ppfdValues);
    const uniformity = calculateUniformity(ppfdGrid);
    const dli = calculateDLI(avgPPFD, params.photoperiod ?? 12);

    // Calculate power metrics
    const totalPower = fixtures.reduce((sum, f) => sum + (f.wattage * f.quantity), 0);
    const totalPPF = fixtures.reduce((sum, f) => sum + (f.ppf * f.quantity), 0);
    const systemEfficacy = totalPPF / totalPower;

    const calculations = {
      ppfd: {
        grid: ppfdGrid,
        average: Math.round(avgPPFD),
        minimum: Math.round(minPPFD),
        maximum: Math.round(maxPPFD),
        uniformity: uniformity.toFixed(2),
        unit: 'μmol/m²/s'
      },
      dli: {
        value: dli.toFixed(1),
        photoperiod: params.photoperiod ?? 12,
        unit: 'mol/m²/day'
      },
      power: {
        total: Math.round(totalPower),
        perSquareMeter: Math.round(totalPower / (roomDimensions.length * roomDimensions.width)),
        unit: 'W'
      },
      efficacy: {
        system: systemEfficacy.toFixed(2),
        unit: 'μmol/J'
      },
      coverage: {
        area: roomDimensions.length * roomDimensions.width,
        gridResolution,
        canopyHeight,
        mountingHeight,
        unit: 'm²'
      }
    };

    const response = successResponse(calculations);

    // Add rate limit headers
    const rateLimitHeaders = getRateLimitHeaders(rateLimitKey, 500, 3600);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    return handleApiError(error, req.nextUrl.pathname);
  }
}

