import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
});

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

// Lighting API schemas
export const lightingControlSchema = z.object({
  fixtureId: z.string(),
  power: z.boolean().optional(),
  dimming: z.number().min(0).max(100).optional(),
  spectrum: z.object({
    red: z.number().min(0).max(100).optional(),
    green: z.number().min(0).max(100).optional(),
    blue: z.number().min(0).max(100).optional(),
    white: z.number().min(0).max(100).optional(),
    farRed: z.number().min(0).max(100).optional(),
    uv: z.number().min(0).max(100).optional()
  }).optional()
});

export const lightingScheduleSchema = z.object({
  name: z.string(),
  fixtures: z.array(z.string()),
  schedule: z.array(z.object({
    time: z.string(), // HH:MM format
    power: z.boolean(),
    dimming: z.number().min(0).max(100).optional(),
    spectrum: z.object({
      red: z.number().min(0).max(100).optional(),
      green: z.number().min(0).max(100).optional(),
      blue: z.number().min(0).max(100).optional(),
      white: z.number().min(0).max(100).optional(),
      farRed: z.number().min(0).max(100).optional(),
      uv: z.number().min(0).max(100).optional()
    }).optional()
  })),
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).optional(),
  enabled: z.boolean().default(true)
});

// Environmental data schemas
export const sensorDataSchema = z.object({
  sensorId: z.string(),
  type: z.enum(['temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'vpd']),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string().datetime().optional()
});

export const environmentalQuerySchema = z.object({
  sensorTypes: z.array(z.enum(['temperature', 'humidity', 'co2', 'light', 'ph', 'ec', 'vpd'])).optional(),
  aggregation: z.enum(['raw', 'minute', 'hour', 'day']).optional(),
  includeStats: z.boolean().optional()
}).merge(dateRangeSchema).merge(paginationSchema);

// Plant biology schemas
export const growthPredictionSchema = z.object({
  cropType: z.string(),
  cultivar: z.string().optional(),
  plantingDate: z.string().datetime(),
  environmentalConditions: z.object({
    temperature: z.number().optional(),
    humidity: z.number().optional(),
    co2: z.number().optional(),
    ppfd: z.number().optional(),
    dli: z.number().optional()
  }).optional()
});

export const plantHealthSchema = z.object({
  plantId: z.string(),
  observations: z.object({
    leafColor: z.enum(['healthy', 'yellowing', 'browning', 'purple']).optional(),
    growth: z.enum(['normal', 'stunted', 'excessive']).optional(),
    symptoms: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional()
  })
});

// GlobalGAP compliance schemas
export const complianceCheckSchema = z.object({
  checkType: z.enum(['water', 'pesticide', 'fertilizer', 'harvest', 'storage']),
  data: z.record(z.any())
});

// Webhook schemas
export const webhookSubscriptionSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum([
    'alert.stress_detected',
    'alert.health_issue',
    'alert.threshold_violation',
    'status.stage_transition',
    'status.harvest_ready',
    'system.maintenance_required',
    'compliance.audit_due'
  ])),
  secret: z.string().min(32).optional(),
  enabled: z.boolean().default(true)
});

// Helper function to validate request body
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<T> {
  const body = await request.json();
  return schema.parse(body);
}

// Helper function to validate query params
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params = Object.fromEntries(searchParams.entries());
  return schema.parse(params);
}