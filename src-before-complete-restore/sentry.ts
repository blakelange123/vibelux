import * as Sentry from '@sentry/nextjs'
import { prisma } from './prisma'

// Initialize Sentry
export function initSentry() {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      
      // Performance Monitoring
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Prisma({ client: prisma }),
      ],
      
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers['authorization']
          delete event.request.headers['cookie']
          delete event.request.headers['x-api-key']
        }
        
        // Remove sensitive cookies
        if (event.request?.cookies) {
          delete event.request.cookies
        }
        
        // Filter out specific errors we don't want to track
        const error = hint.originalException
        if (error && error instanceof Error) {
          // Don't log rate limit errors
          if (error.message?.includes('rate limit')) {
            return null
          }
          
          // Don't log expected validation errors
          if (error.message?.includes('Invalid input')) {
            return null
          }
        }
        
        return event
      },
      
      // Attach user context
      beforeSendTransaction(event) {
        // Add custom tags
        event.tags = {
          ...event.tags,
          service: 'vibelux-api',
          version: process.env.APP_VERSION || '1.0.0'
        }
        
        return event
      }
    })
  }
}

// Custom error boundary
export function captureException(error: Error, context?: Record<string, any>) {
  console.error('Error captured:', error)
  
  if (process.env.SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('custom', context)
      }
      Sentry.captureException(error)
    })
  }
}

// Performance monitoring helpers
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

// Add user context
export function setUser(user: { id: string; email: string; subscriptionTier?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    subscription_tier: user.subscriptionTier
  })
}

// Clear user context on logout
export function clearUser() {
  Sentry.setUser(null)
}

// Custom breadcrumb logging
export function addBreadcrumb(
  message: string,
  category: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000
  })
}

// Track custom events
export function trackEvent(eventName: string, data?: Record<string, any>) {
  addBreadcrumb(eventName, 'custom-event', 'info', data)
  
  // Also send to analytics if configured
  if (typeof window !== 'undefined' && (window as any).analytics) {
    (window as any).analytics.track(eventName, data)
  }
}

// Monitor API performance
export function monitorAPIEndpoint(endpoint: string) {
  return async (req: Request, handler: Function) => {
    const transaction = startTransaction(`API ${endpoint}`, 'http.server')
    const span = transaction.startChild({
      op: 'http.server',
      description: `${req.method} ${endpoint}`
    })
    
    try {
      const result = await handler(req)
      span.setStatus('ok')
      return result
    } catch (error) {
      span.setStatus('internal_error')
      captureException(error as Error, { endpoint, method: req.method })
      throw error
    } finally {
      span.finish()
      transaction.finish()
    }
  }
}

// Database query monitoring
export function monitorDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const span = Sentry.getCurrentHub().getScope()?.getSpan()?.startChild({
    op: 'db.query',
    description: queryName
  })
  
  return queryFn()
    .then((result) => {
      span?.setStatus('ok')
      return result
    })
    .catch((error) => {
      span?.setStatus('internal_error')
      throw error
    })
    .finally(() => {
      span?.finish()
    })
}

// Error types for better categorization
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export class ExternalAPIError extends Error {
  constructor(message: string, public service: string) {
    super(message)
    this.name = 'ExternalAPIError'
  }
}