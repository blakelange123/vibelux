# Subscription Implementation Guide

## 🎯 New 8-Tier Subscription System

### Tier Overview with Key Features

1. **Free ($0/month)**
   - Basic calculators (PPFD/DLI/VPD)
   - Limited fixture library (100)
   - 1 project, 7-day retention
   - PDF export only
   - ❌ No AI features (no API costs)

2. **Hobbyist Plus ($9/month)**
   - Full fixture library (5000+)
   - Heat map visualization
   - Basic electrical calculations
   - Environmental alerts
   - 5 projects, 30-day retention

3. **Starter ($29/month)**
   - 3D visualization
   - **Electrical Load Estimator** ✨
   - ROI calculator
   - Heat load calculator
   - 20 projects, 90-day retention

4. **Professional ($79/month)** ⭐ MOST POPULAR
   - Auto-arrangement AI
   - **Electrical Load Balancing** (3-phase)
   - **Circuit Planning & Wire Sizing**
   - **SOP Generator** (10/month - uses ChatGPT API)
   - AI Spectrum Recommendations (100/month)
   - Lighting/Maintenance schedulers
   - Team sharing (3 users)
   - CAD/IES export

5. **Advanced ($149/month)**
   - Multi-layer design
   - Crop rotation planner
   - Photosynthetic modeling
   - Compliance audit trail
   - Weather adaptive lighting
   - API access (5000 calls/month)
   - Unlimited projects
   - 10 team members

6. **Enterprise ($299/month)**
   - **ML Yield Prediction**
   - **Predictive Maintenance**
   - AI Crop Advisor
   - IoT/Sensor integration
   - Custom dashboards
   - Unlimited API/AI features
   - 25 team members

7. **Corporate ($599/month)**
   - Multi-site management
   - White-label branding
   - SSO/ERP integration
   - Unlimited team members
   - Dedicated support
   - On-premise option

8. **Academic ($99/month)**
   - All Enterprise features
   - 100 student accounts
   - Curriculum tools
   - Research export
   - Academic support
   - Non-commercial only

## 💰 Pricing Strategy

### Annual Discounts (20% off)
- Hobbyist Plus: $86/year (save $22)
- Starter: $278/year (save $70)
- Professional: $758/year (save $190)
- Advanced: $1,430/year (save $358)
- Enterprise: $2,870/year (save $718)
- Corporate: $5,750/year (save $1,438)
- Academic: $950/year (save $238)

### Key Value Props by Tier

**For Hobbyists ($9)**
- "Full fixture database access"
- "Perfect for home grows up to 100 sq ft"

**For Starters ($29)**
- "3D visualization saves hours in planning"
- "Electrical estimator prevents costly mistakes"

**For Professionals ($79)**
- "AI-powered design optimization"
- "Generate compliant SOPs instantly"
- "Electrical load balancing for safety"

**For Advanced ($149)**
- "Maximize yields with crop rotation"
- "Stay compliant with audit trails"
- "Scientific-grade modeling"

**For Enterprise ($299)**
- "Predict and prevent failures"
- "ML-powered yield optimization"
- "Complete IoT integration"

## 🔧 Implementation Steps

### 1. Update Stripe Products
```javascript
// Create products in Stripe Dashboard
const products = {
  hobbyist_plus: {
    monthly: 'price_hobbyist_monthly',
    annual: 'price_hobbyist_annual'
  },
  starter: {
    monthly: 'price_starter_monthly',
    annual: 'price_starter_annual'
  },
  // ... etc
};
```

### 2. Feature Gating Implementation
```typescript
// In your components
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { FeatureGate } from '@/hooks/useFeatureAccess';

// Option 1: Hook
function MyComponent() {
  const { hasAccess, currentTier } = useFeatureAccess();
  
  if (!hasAccess('electricalEstimator')) {
    return <UpgradePrompt feature="Electrical Estimator" requiredTier="starter" />;
  }
  
  return <ElectricalEstimator />;
}

// Option 2: Component wrapper
function MyPage() {
  return (
    <FeatureGate feature="sopGenerator">
      <SOPGenerator />
    </FeatureGate>
  );
}
```

### 3. API Rate Limiting
```typescript
// For AI features that cost money
const checkAICredits = async (userId: string, feature: string) => {
  const usage = await getMonthlyUsage(userId, feature);
  const limits = getTierLimitsV2(userTier);
  
  if (feature === 'sopGenerator' && usage >= limits.sopGeneration) {
    throw new Error('Monthly SOP generation limit reached. Upgrade to continue.');
  }
  
  if (feature === 'aiSpectrum' && usage >= limits.aiCredits) {
    throw new Error('Monthly AI credits exhausted. Upgrade for more.');
  }
};
```

### 4. Database Schema Updates
```sql
-- Add to users table
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'active';
ALTER TABLE users ADD COLUMN subscription_period VARCHAR(20) DEFAULT 'monthly';

-- Usage tracking
CREATE TABLE feature_usage (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  feature_name VARCHAR(100),
  usage_count INTEGER DEFAULT 0,
  month_year VARCHAR(7), -- '2024-01'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, feature_name, month_year)
);
```

### 5. Update Pricing Page
```typescript
// Use the new comparison table
import TierComparisonTable from '@/components/pricing/TierComparisonTable';

export default function PricingPage() {
  return (
    <div>
      {/* Hero with new 8-tier cards */}
      <TierCards tiers={SUBSCRIPTION_TIERS_V2} />
      
      {/* Detailed comparison */}
      <TierComparisonTable />
      
      {/* Feature highlights */}
      <FeatureShowcase />
    </div>
  );
}
```

## 📊 Migration Strategy

### For Existing Users
1. **Current Free Users** → Stay on Free
2. **Current Starter ($29)** → Move to new Starter (same price, more features)
3. **Current Professional ($99)** → Offer choice:
   - Downgrade to new Professional ($79) with similar features
   - Stay at Advanced ($149) with many more features
4. **Current Advanced ($249)** → Move to Enterprise ($299) with more features
5. **Current Enterprise ($599)** → Stay on Corporate ($599)

### Grandfathering
- Keep existing users on old pricing for 6 months
- Send upgrade incentives highlighting new features
- Offer 3-month discount for switching to annual

## 🎨 Marketing Messages

### Feature-Specific Campaigns

**Electrical Tools** (Starter+)
- "Never overload a circuit again"
- "NEC-compliant load calculations"
- "Save thousands in electrical contractor fees"

**SOP Generator** (Professional+)
- "University-standard procedures in minutes"
- "Stay compliant with automated documentation"
- "Powered by ChatGPT for accuracy"

**Predictive Maintenance** (Enterprise+)
- "Prevent failures before they happen"
- "AI predicts equipment issues 45 days out"
- "Save $10,000+ per prevented failure"

### Upgrade Triggers
1. **Free → Hobbyist Plus**: "Unlock 5000+ certified fixtures"
2. **Hobbyist → Starter**: "Get 3D visualization and electrical safety"
3. **Starter → Professional**: "Automate design with AI"
4. **Professional → Advanced**: "Ensure compliance and maximize yields"
5. **Advanced → Enterprise**: "Predict the future with ML"

## 🚀 Quick Implementation Checklist

- [ ] Update `subscription-tiers-v2.ts` in production
- [ ] Create Stripe products and price IDs
- [ ] Implement feature access hook
- [ ] Add usage tracking for AI features
- [ ] Update pricing page with new tiers
- [ ] Create upgrade prompts for gated features
- [ ] Set up email campaigns for each tier
- [ ] Create landing pages for key features
- [ ] Update API rate limiting
- [ ] Implement annual billing toggle
- [ ] Add tier recommendation quiz
- [ ] Create migration plan for existing users

## 📈 Success Metrics

- **Conversion Rate**: Free → Paid (target: 5%)
- **Upgrade Rate**: Lower tier → Higher tier (target: 15%)
- **Annual vs Monthly**: Aim for 40% annual
- **Feature Usage**: Track which features drive upgrades
- **Churn by Tier**: Monitor retention at each level

---

*Remember: The key is progressive value - each tier should feel like a natural next step as users grow their operations.*