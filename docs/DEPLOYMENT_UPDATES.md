# Deployment & Update Strategy for Visual Operations Intelligence

## Overview
This document outlines how to safely deploy updates, manage feature rollouts, and handle subscription changes for active users.

## 1. Version Control & Branching Strategy

### Branch Structure
```
main (production)
├── staging (pre-production testing)
├── develop (integration branch)
└── feature/* (individual features)
```

### Workflow
1. Create feature branches from `develop`
2. Test thoroughly in development
3. Merge to `staging` for pre-production testing
4. Deploy to `main` after validation

## 2. Database Migration Strategy

### Safe Migration Process
```bash
# 1. Generate migration
npx prisma migrate dev --name add_new_feature

# 2. Test migration locally
npm run db:migrate

# 3. Create backup before production migration
npm run backup:create

# 4. Apply migration in production
npx prisma migrate deploy
```

### Feature Flags for Gradual Rollout
```typescript
// src/lib/feature-flags.ts
export const FEATURE_FLAGS = {
  NEW_DASHBOARD: process.env.NEXT_PUBLIC_FEATURE_NEW_DASHBOARD === 'true',
  ENHANCED_ANALYTICS: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
  VISUAL_OPS_V2: process.env.NEXT_PUBLIC_FEATURE_VISUAL_OPS_V2 === 'true'
};

// Usage in components
if (FEATURE_FLAGS.NEW_DASHBOARD) {
  return <NewDashboard />;
} else {
  return <LegacyDashboard />;
}
```

## 3. Subscription Management During Updates

### Handling Plan Changes
```typescript
// src/lib/subscription-manager.ts
export class SubscriptionManager {
  // Grandfather existing users when removing features
  static async handleFeatureDeprecation(
    userId: string,
    deprecatedFeature: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    if (user?.subscription?.createdAt < DEPRECATION_DATE) {
      // Grandfather the feature
      await prisma.userFeatureOverride.create({
        data: {
          userId,
          feature: deprecatedFeature,
          enabled: true,
          reason: 'grandfathered',
          expiresAt: null
        }
      });
    }
  }

  // Handle price increases
  static async notifyPriceChange(
    userId: string,
    oldPrice: number,
    newPrice: number
  ) {
    // Keep existing price until renewal
    await prisma.priceProtection.create({
      data: {
        userId,
        oldPrice,
        newPrice,
        protectedUntil: user.subscription.currentPeriodEnd
      }
    });

    // Send notification email
    await sendPriceChangeNotification(user.email, {
      oldPrice,
      newPrice,
      effectiveDate: user.subscription.currentPeriodEnd
    });
  }
}
```

## 4. Deployment Process

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] Database migrations tested
- [ ] Feature flags configured
- [ ] Changelog updated
- [ ] Customer notifications prepared
- [ ] Rollback plan documented

### Deployment Steps
```bash
# 1. Build and test
npm run build
npm run test:all

# 2. Deploy to staging
git push staging develop:main

# 3. Run smoke tests
npm run test:smoke -- --env=staging

# 4. Deploy to production
git push production main

# 5. Monitor for issues
npm run monitor:production
```

## 5. Changelog Management

### Changelog Structure
```markdown
# Changelog

## [2.1.0] - 2024-01-15

### Added
- Visual Operations Intelligence v2 with enhanced AI analysis
- Multi-language support for 10 languages
- Offline mode with automatic sync

### Changed
- Improved mobile authentication with device fingerprinting
- Enhanced admin dashboard with real-time metrics

### Fixed
- Security: Fixed XSS vulnerability in help articles
- Performance: Resolved database connection leaks

### Deprecated
- Legacy photo upload API (use /api/v2/photos instead)

### Removed
- Discontinued free tier API access (grandfathered for existing users)

### Security
- Updated xlsx dependency to resolve CVE-2023-30533
- Enhanced SQL injection protection
```

### Auto-Generate Changelog
```typescript
// scripts/generate-changelog.ts
import { execSync } from 'child_process';

function generateChangelog() {
  const lastTag = execSync('git describe --tags --abbrev=0').toString().trim();
  const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`).toString();
  
  const changelog = {
    features: [],
    fixes: [],
    breaking: []
  };

  commits.split('\n').forEach(commit => {
    if (commit.startsWith('feat:')) {
      changelog.features.push(commit.replace('feat: ', ''));
    } else if (commit.startsWith('fix:')) {
      changelog.fixes.push(commit.replace('fix: ', ''));
    } else if (commit.includes('BREAKING CHANGE')) {
      changelog.breaking.push(commit);
    }
  });

  return changelog;
}
```

## 6. In-App Update Notifications

### Update Banner Component
```typescript
// src/components/UpdateBanner.tsx
export function UpdateBanner() {
  const [updates, setUpdates] = useState<Update[]>([]);
  
  useEffect(() => {
    fetch('/api/updates/recent')
      .then(res => res.json())
      .then(setUpdates);
  }, []);

  if (!updates.length) return null;

  return (
    <div className="bg-blue-600 text-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">New Updates Available!</h3>
          <p>{updates[0].summary}</p>
        </div>
        <Link href="/changelog" className="text-white underline">
          View All Updates
        </Link>
      </div>
    </div>
  );
}
```

## 7. Zero-Downtime Deployment

### Database Updates Without Downtime
```typescript
// Use expand-contract pattern for schema changes

// Step 1: Add new column (backward compatible)
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

// Step 2: Deploy code that writes to both old and new
// Step 3: Migrate existing data
// Step 4: Deploy code that reads from new field
// Step 5: Remove old column in next release
```

### Rolling Updates with Kubernetes
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: vibelux-app
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    spec:
      containers:
      - name: app
        image: vibelux/app:latest
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

## 8. Monitoring & Rollback

### Health Checks
```typescript
// src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    stripe: await checkStripe(),
    influxdb: await checkInfluxDB()
  };

  const healthy = Object.values(checks).every(check => check.healthy);
  
  return NextResponse.json({
    status: healthy ? 'healthy' : 'unhealthy',
    checks,
    version: process.env.APP_VERSION,
    timestamp: new Date().toISOString()
  }, {
    status: healthy ? 200 : 503
  });
}
```

### Automated Rollback
```bash
#!/bin/bash
# scripts/auto-rollback.sh

HEALTH_URL="https://api.vibelux.com/health"
MAX_RETRIES=5
RETRY_DELAY=30

for i in $(seq 1 $MAX_RETRIES); do
  if curl -f $HEALTH_URL; then
    echo "Health check passed"
    exit 0
  fi
  
  echo "Health check failed, attempt $i/$MAX_RETRIES"
  sleep $RETRY_DELAY
done

echo "Health checks failed, rolling back..."
git revert HEAD --no-edit
git push production main --force
```

## 9. Customer Communication

### Update Notification System
```typescript
// src/lib/update-notifications.ts
export async function notifyUsersOfUpdate(update: Update) {
  const affectedUsers = await getAffectedUsers(update);
  
  for (const user of affectedUsers) {
    // In-app notification
    await createNotification({
      userId: user.id,
      type: 'system_update',
      title: update.title,
      message: update.description,
      ctaText: 'Learn More',
      ctaUrl: `/changelog#${update.version}`
    });

    // Email for major updates
    if (update.severity === 'major') {
      await sendUpdateEmail(user.email, update);
    }
  }
}
```

## 10. A/B Testing New Features

### Feature Experiment Framework
```typescript
// src/lib/experiments.ts
export class ExperimentManager {
  static async getVariant(userId: string, experimentId: string) {
    const assignment = await prisma.experimentAssignment.findUnique({
      where: {
        userId_experimentId: { userId, experimentId }
      }
    });

    if (!assignment) {
      // Assign user to variant
      const variant = Math.random() > 0.5 ? 'control' : 'treatment';
      await prisma.experimentAssignment.create({
        data: { userId, experimentId, variant }
      });
      return variant;
    }

    return assignment.variant;
  }
}

// Usage
const variant = await ExperimentManager.getVariant(userId, 'new_dashboard');
if (variant === 'treatment') {
  return <NewDashboard />;
}
```

## Best Practices

1. **Always test migrations** on a copy of production data
2. **Use feature flags** for gradual rollouts
3. **Monitor key metrics** after deployment
4. **Have a rollback plan** for every change
5. **Communicate changes** to users in advance
6. **Grandfather features** when removing from plans
7. **Version your APIs** to maintain compatibility
8. **Use canary deployments** for high-risk changes
9. **Maintain backwards compatibility** for at least one version
10. **Document all breaking changes** clearly

## Emergency Procedures

### Critical Bug in Production
1. Assess impact and severity
2. Implement immediate fix or rollback
3. Communicate with affected users
4. Post-mortem and prevention plan

### Data Migration Failure
1. Stop the migration immediately
2. Restore from backup
3. Fix the migration script
4. Test thoroughly before retry

### Performance Degradation
1. Scale up resources temporarily
2. Identify bottleneck
3. Implement fix
4. Scale back down after verification