# VibeLux Marketplace Module

## Architecture Overview

The marketplace is designed as a semi-independent module within VibeLux that can be easily extracted into a separate platform.

## Directory Structure

```
/src/marketplace/
├── api/                    # Marketplace API endpoints
│   ├── listings/
│   ├── orders/
│   ├── users/
│   └── analytics/
├── components/            # UI components
│   ├── common/
│   ├── listings/
│   ├── orders/
│   └── analytics/
├── lib/                   # Business logic
│   ├── types/
│   ├── services/
│   ├── validators/
│   └── utils/
├── pages/                 # Next.js pages
│   ├── board/
│   ├── listings/
│   ├── orders/
│   └── dashboard/
└── styles/               # Marketplace-specific styles
```

## Design Principles

1. **Self-Contained**: All marketplace code lives in this directory
2. **Minimal Dependencies**: Only depends on shared auth and database
3. **API-First**: All features exposed through REST/GraphQL APIs
4. **Separate Database**: Uses separate tables with `marketplace_` prefix
5. **Independent Deployment**: Can be deployed as separate service

## Integration Points

### With VibeLux Core
- **Authentication**: Uses VibeLux auth via JWT tokens
- **User Profiles**: Extends VibeLux user model
- **Facility Data**: Can import grow room data for context
- **Analytics**: Shares analytics infrastructure

### External Services
- **Payment Processing**: Stripe Connect for marketplace payments
- **Email/SMS**: SendGrid for notifications
- **Storage**: S3 for product images
- **Search**: Algolia for product search

## Migration Path

To extract marketplace as separate platform:

1. **Database Migration**
   ```sql
   -- Move marketplace tables to separate database
   CREATE DATABASE marketplace;
   -- Migrate tables with foreign key handling
   ```

2. **API Separation**
   ```typescript
   // Current: Integrated API
   /api/marketplace/listings
   
   // Future: Separate API
   https://api.marketplace.com/listings
   ```

3. **Authentication Bridge**
   ```typescript
   // Shared auth service
   class AuthBridge {
     validateVibeLuxToken(token: string): User
     createMarketplaceSession(user: User): Session
   }
   ```

4. **Data Sync**
   ```typescript
   // Event-driven sync
   VibeLuxEvents.on('facility.updated', (data) => {
     MarketplaceAPI.updateGrowerProfile(data);
   });
   ```

## Configuration

```typescript
// marketplace.config.ts
export const config = {
  // Feature flags for gradual rollout
  features: {
    standalone: process.env.MARKETPLACE_STANDALONE === 'true',
    customDomain: process.env.MARKETPLACE_DOMAIN,
    separateAuth: process.env.MARKETPLACE_AUTH === 'separate'
  },
  
  // Integration settings
  integration: {
    vibeluxAPI: process.env.VIBELUX_API_URL,
    authMode: 'shared', // 'shared' | 'federated' | 'separate'
    dataSync: 'realtime' // 'realtime' | 'batch' | 'manual'
  }
};
```

## Deployment Options

### Option 1: Monolithic (Current)
- Deploy with VibeLux
- Shared infrastructure
- Single deployment pipeline

### Option 2: Microservice
- Deploy as separate service
- Shared database
- Independent scaling

### Option 3: Standalone Platform
- Completely separate infrastructure
- Own domain and branding
- Federation with VibeLux

## Metrics for Separation Decision

Monitor these metrics to decide when to separate:

1. **Traffic**: >30% of total traffic is marketplace
2. **Revenue**: Marketplace generates >$100k MRR
3. **Users**: >1000 active marketplace users
4. **Performance**: Marketplace queries slow down main app
5. **Features**: Marketplace needs diverge from core platform

## Next Steps

1. Implement event bus for loose coupling
2. Create marketplace-specific API gateway
3. Design data synchronization strategy
4. Plan gradual migration path
5. Set up monitoring and metrics