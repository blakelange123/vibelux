# Vibelux Administrator Guide

## Table of Contents
1. [Platform Administration](#platform-administration)
2. [User Management](#user-management)
3. [Facility Management](#facility-management)
4. [System Configuration](#system-configuration)
5. [API Management](#api-management)
6. [Security & Compliance](#security--compliance)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Data Management](#data-management)
9. [Integration Management](#integration-management)
10. [Billing & Subscriptions](#billing--subscriptions)
11. [Support & Maintenance](#support--maintenance)

---

## Platform Administration

### Admin Dashboard Overview

The Admin Dashboard provides comprehensive system oversight and management capabilities.

```
Access: /admin (Requires ADMIN role)
```

#### Key Metrics Panel
- **Active Users**: Current session count and user activity
- **System Health**: Database, API, and service status
- **Resource Usage**: CPU, memory, storage utilization
- **Revenue Metrics**: Subscription revenue and growth
- **Support Tickets**: Open issues and response times

#### Quick Actions
- User account management
- System announcements
- Feature flag controls
- Emergency system controls
- Maintenance mode toggle

### System Architecture

#### Core Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Database      │
│   (Next.js)     │◄──►│   (132 routes)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Assets    │    │   Auth System   │    │   File Storage  │
│   (Static)      │    │   (Clerk)       │    │   (Cloud)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### Service Dependencies
- **Authentication**: Clerk (user management)
- **Payments**: Stripe (subscription billing)
- **AI Services**: Claude API (design assistance)
- **Email**: Resend (notifications)
- **Monitoring**: Prometheus (metrics collection)

---

## User Management

### User Roles & Permissions

#### System Roles
1. **USER** (Default)
   - Access to subscribed features
   - Create personal projects
   - Basic reporting capabilities

2. **ADMIN** (Platform Administrator)
   - Full system access
   - User management capabilities
   - System configuration control
   - Financial dashboard access

3. **RESEARCHER** (Research Institution)
   - Advanced statistical tools
   - Experimental design features
   - Publication-ready reports

#### Facility-Specific Roles
1. **OWNER** (Facility Owner)
   - Full facility control
   - Billing responsibility
   - User invitation rights
   - Settings management

2. **ADMIN** (Facility Administrator)
   - User management within facility
   - Configuration changes
   - Report generation
   - API access

3. **MANAGER** (Operations Manager)
   - Operational oversight
   - Data analysis
   - Limited configuration
   - Team coordination

4. **OPERATOR** (Daily Operations)
   - Data entry and monitoring
   - Basic calculations
   - Standard reports
   - Equipment monitoring

5. **VIEWER** (Read-Only Access)
   - View-only permissions
   - Report access
   - Dashboard viewing
   - No configuration rights

### User Management Operations

#### Creating User Accounts
```
Navigate: Admin > Users > Create User
```

1. **Basic Information**
   - Email address (required)
   - Full name
   - Organization/Company
   - Initial role assignment

2. **Access Configuration**
   - Subscription tier
   - Facility assignments
   - Permission overrides
   - API access rights

3. **Notification Setup**
   - Welcome email automation
   - Onboarding sequence
   - Feature announcements
   - Security notifications

#### Bulk User Operations
- **CSV Import**: Bulk user creation from spreadsheet
- **LDAP Sync**: Active Directory integration
- **SSO Provisioning**: Automatic account creation
- **Deactivation**: Soft delete vs. hard delete options

#### User Activity Monitoring
- Login frequency and patterns
- Feature usage analytics
- API consumption tracking
- Support ticket correlation

---

## Facility Management

### Multi-Tenant Architecture

#### Facility Hierarchy
```
Organization
├── Facility 1 (Location A)
│   ├── Growing Areas
│   ├── User Assignments
│   └── Equipment Inventory
├── Facility 2 (Location B)
│   ├── Growing Areas
│   ├── User Assignments
│   └── Equipment Inventory
└── Shared Resources
    ├── User Database
    ├── Billing Account
    └── Organization Settings
```

#### Facility Configuration

1. **Basic Setup**
   ```
   Navigate: Admin > Facilities > Create Facility
   ```
   - Facility name and description
   - Physical address and timezone
   - Primary contact information
   - Facility type (greenhouse, indoor, research)

2. **Technical Configuration**
   - Network settings and IP ranges
   - Sensor network configuration
   - API endpoint customization
   - Data retention policies

3. **User Assignment**
   - Assign facility administrators
   - Set user access levels
   - Configure approval workflows
   - Enable self-registration options

#### Growing Area Management

1. **Area Definition**
   - Physical dimensions and layout
   - Environmental zone configuration
   - Equipment assignments
   - Crop allocation

2. **Environmental Setpoints**
   - Temperature ranges (day/night cycles)
   - Humidity targets and VPD goals
   - CO₂ concentration levels
   - Lighting schedules and DLI targets

3. **Monitoring Configuration**
   - Sensor placement and calibration
   - Data collection intervals
   - Alert thresholds and escalation
   - Historical data retention

### Facility Analytics

#### Performance Dashboards
- Energy consumption tracking
- Yield per square foot metrics
- Environmental stability scores
- Equipment utilization rates

#### Comparative Analysis
- Multi-facility benchmarking
- Best practice identification
- Resource allocation optimization
- Performance trend analysis

---

## System Configuration

### Application Settings

#### Global Configuration
```
Navigate: Admin > System > Configuration
```

1. **Feature Flags**
   - Enable/disable platform features
   - A/B testing configuration
   - Gradual rollout controls
   - Emergency feature toggles

2. **System Limits**
   - API rate limiting configuration
   - File upload size restrictions
   - Database connection pooling
   - Memory allocation settings

3. **Default Values**
   - New user default settings
   - Facility template configurations
   - Calculation default parameters
   - Report generation settings

#### Environment Management

1. **Environment Variables**
   ```bash
   # Database Configuration
   DATABASE_URL=postgresql://...
   
   # External Services
   CLERK_SECRET_KEY=sk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   CLAUDE_API_KEY=sk-ant-...
   
   # Application Settings
   NEXT_PUBLIC_APP_URL=https://app.vibelux.com
   NODE_ENV=production
   ```

2. **Security Configuration**
   - JWT token expiration settings
   - Password complexity requirements
   - Session timeout configurations
   - Two-factor authentication policies

### Database Administration

#### Schema Management
- Database migration procedures
- Index optimization strategies
- Query performance monitoring
- Data archival policies

#### Backup & Recovery
```bash
# Automated Daily Backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Point-in-Time Recovery
pg_restore --time="2024-01-15 14:30:00" backup.sql
```

#### Performance Optimization
- Connection pooling configuration
- Query optimization and indexing
- Table partitioning strategies
- Read replica management

---

## API Management

### API Gateway Configuration

#### Rate Limiting
```javascript
// Rate Limiting by Subscription Tier
const rateLimits = {
  free: { requests: 100, window: '1h' },
  starter: { requests: 1000, window: '1h' },
  professional: { requests: 5000, window: '1h' },
  business: { requests: 10000, window: '1h' },
  enterprise: { requests: 'unlimited' }
};
```

#### Authentication & Authorization
1. **API Key Management**
   - Key generation and rotation
   - Scope-based permissions
   - Usage tracking and analytics
   - Key revocation procedures

2. **OAuth 2.0 Configuration**
   - Client registration process
   - Scope definition and management
   - Token lifecycle management
   - Refresh token policies

### API Monitoring

#### Performance Metrics
- Request latency distribution
- Error rate monitoring
- Throughput analysis
- Availability tracking

#### Usage Analytics
- Most popular endpoints
- User adoption patterns
- Geographic usage distribution
- Integration success rates

### API Documentation Management

#### Swagger/OpenAPI Configuration
```yaml
# API Documentation Generation
openapi: 3.0.0
info:
  title: Vibelux API
  version: 2.1.0
  description: Professional horticultural lighting platform API

servers:
  - url: https://api.vibelux.com/v1
    description: Production server
```

#### Developer Resources
- Interactive API explorer
- Code examples and SDKs
- Integration tutorials
- Best practices guides

---

## Security & Compliance

### Security Framework

#### Access Control
1. **Role-Based Access Control (RBAC)**
   - Granular permission system
   - Principle of least privilege
   - Regular access reviews
   - Automated deprovisioning

2. **Multi-Factor Authentication**
   - TOTP-based 2FA requirement
   - SMS backup options
   - Hardware token support
   - Recovery code management

#### Data Protection
1. **Encryption Standards**
   - AES-256 encryption at rest
   - TLS 1.3 for data in transit
   - Key management best practices
   - Certificate rotation procedures

2. **Privacy Controls**
   - Data minimization principles
   - Consent management
   - Right to deletion (GDPR)
   - Data portability features

### Compliance Management

#### SOC 2 Type II
```
Compliance Framework Implementation:
├── Security Controls
│   ├── Access management
│   ├── Encryption implementation
│   └── Incident response
├── Availability Controls
│   ├── Monitoring and alerting
│   ├── Backup procedures
│   └── Disaster recovery
├── Processing Integrity
│   ├── Data validation
│   ├── Error handling
│   └── Quality controls
├── Confidentiality
│   ├── Data classification
│   ├── Access restrictions
│   └── Secure disposal
└── Privacy
    ├── Notice and consent
    ├── Data handling
    └── Disclosure controls
```

#### GDPR Compliance
1. **Data Subject Rights**
   - Right to access personal data
   - Right to rectification
   - Right to erasure ("right to be forgotten")
   - Right to data portability

2. **Privacy by Design**
   - Data protection impact assessments
   - Privacy-preserving technologies
   - Consent management systems
   - Breach notification procedures

#### Industry-Specific Compliance
- **USDA Organic**: Traceability requirements
- **FDA**: Food safety modernization act
- **GlobalGAP**: Good agricultural practices
- **GFSI**: Global food safety initiative

### Security Monitoring

#### Threat Detection
- Real-time log analysis
- Anomaly detection algorithms
- Failed login attempt monitoring
- Suspicious API usage patterns

#### Incident Response
1. **Response Team Structure**
   - Incident commander role
   - Technical response team
   - Communications coordinator
   - Legal and compliance liaison

2. **Response Procedures**
   - Incident classification system
   - Escalation procedures
   - Evidence preservation
   - Post-incident review process

---

## Monitoring & Analytics

### System Monitoring

#### Infrastructure Metrics
```
Key Performance Indicators:
├── Application Performance
│   ├── Response time: <200ms (95th percentile)
│   ├── Error rate: <0.1%
│   └── Availability: >99.9%
├── Database Performance
│   ├── Query response time: <50ms
│   ├── Connection pool utilization: <80%
│   └── Cache hit rate: >95%
├── External Service Health
│   ├── Auth service (Clerk): >99.9%
│   ├── Payment service (Stripe): >99.9%
│   └── AI service (Claude): >95%
└── Business Metrics
    ├── User engagement rate
    ├── Feature adoption rate
    └── Customer satisfaction score
```

#### Alerting Configuration
1. **Critical Alerts** (Immediate response required)
   - System downtime or degraded performance
   - Security breach indicators
   - Data loss or corruption
   - Payment processing failures

2. **Warning Alerts** (Response within 4 hours)
   - High resource utilization
   - Elevated error rates
   - Third-party service degradation
   - User experience issues

3. **Informational Alerts** (Next business day)
   - Capacity planning notifications
   - Feature usage anomalies
   - Maintenance reminders
   - Performance optimization opportunities

### Business Analytics

#### User Engagement Metrics
- Daily/Monthly Active Users (DAU/MAU)
- Session duration and depth
- Feature utilization rates
- User retention cohorts

#### Revenue Analytics
- Monthly Recurring Revenue (MRR)
- Customer Lifetime Value (CLV)
- Churn rate analysis
- Upgrade/downgrade patterns

#### Product Analytics
- Feature adoption rates
- User journey analysis
- Conversion funnel optimization
- A/B test result tracking

### Reporting Dashboard

#### Executive Summary Reports
- Monthly business review format
- Key performance indicators
- Trend analysis and forecasting
- Competitive positioning metrics

#### Operational Reports
- System health summaries
- User support metrics
- Security incident reports
- Compliance status updates

---

## Data Management

### Data Architecture

#### Data Flow Overview
```
Data Sources → Collection → Processing → Storage → Analytics
     │              │           │          │         │
     ├─ Sensors     ├─ APIs     ├─ ETL     ├─ DB     ├─ Reports
     ├─ User Input  ├─ Webhooks ├─ ML      ├─ Cache  ├─ Dashboards
     └─ External    └─ Batch    └─ Stream  └─ Backup └─ Exports
```

#### Storage Strategy
1. **Operational Data** (PostgreSQL)
   - User accounts and profiles
   - Project and facility data
   - Real-time sensor readings
   - Financial transactions

2. **Analytics Data** (Data Warehouse)
   - Historical trend analysis
   - Aggregated performance metrics
   - Machine learning training data
   - Business intelligence datasets

3. **File Storage** (Cloud Storage)
   - CAD files and design documents
   - Images and documentation
   - Report exports and backups
   - Static assets and media

### Data Quality Management

#### Data Validation
```javascript
// Sensor Data Validation Example
const validateSensorReading = (reading) => {
  const checks = {
    temperature: (val) => val >= -10 && val <= 50,
    humidity: (val) => val >= 0 && val <= 100,
    co2: (val) => val >= 300 && val <= 2000,
    ppfd: (val) => val >= 0 && val <= 2000
  };
  
  return Object.entries(checks).every(([field, validate]) => 
    validate(reading[field])
  );
};
```

#### Data Cleansing Procedures
- Outlier detection and handling
- Missing data imputation strategies
- Duplicate record identification
- Data standardization processes

#### Data Lineage Tracking
- Source system identification
- Transformation documentation
- Quality check results
- Usage audit trails

### Backup & Recovery

#### Backup Strategy
1. **Database Backups**
   - Full backup: Daily at 2 AM UTC
   - Incremental backup: Every 4 hours
   - Transaction log backup: Every 15 minutes
   - Retention: 30 days local, 1 year archive

2. **File Storage Backups**
   - Continuous replication to secondary region
   - Weekly full backup to long-term storage
   - Version control for critical files
   - 99.999999999% (11 9's) durability SLA

#### Disaster Recovery Procedures
1. **Recovery Time Objectives (RTO)**
   - Critical systems: 1 hour
   - Non-critical systems: 4 hours
   - Full platform recovery: 8 hours

2. **Recovery Point Objectives (RPO)**
   - Transactional data: 15 minutes
   - Sensor data: 1 hour
   - File storage: 24 hours

---

## Integration Management

### Third-Party Integrations

#### Authentication Services
1. **Clerk Integration**
   ```javascript
   // Clerk Configuration
   const clerkConfig = {
     publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
     secretKey: process.env.CLERK_SECRET_KEY,
     webhooks: {
       userCreated: '/api/webhooks/clerk/user-created',
       userUpdated: '/api/webhooks/clerk/user-updated'
     }
   };
   ```

2. **Enterprise SSO**
   - SAML 2.0 implementation
   - Active Directory integration
   - Okta/Auth0 compatibility
   - Custom identity provider support

#### Payment Processing
1. **Stripe Integration**
   - Subscription management
   - Invoice generation
   - Payment method handling
   - Webhook event processing

2. **Revenue Recognition**
   - Automated billing cycles
   - Proration calculations
   - Tax compliance
   - Revenue reporting

#### AI Services
1. **Claude API Integration**
   - Request/response handling
   - Rate limiting compliance
   - Error handling and fallbacks
   - Usage tracking and billing

2. **Machine Learning Services**
   - TensorFlow.js implementation
   - Model training pipelines
   - Prediction caching strategies
   - Performance optimization

### IoT Device Integration

#### Sensor Network Management
1. **Device Registration**
   - Automatic device discovery
   - Manual device registration
   - Device authentication
   - Certificate management

2. **Data Collection**
   - Real-time data streaming
   - Batch data upload
   - Data validation and filtering
   - Offline data synchronization

#### Control System Integration
1. **Climate Control Systems**
   - HVAC system integration
   - Irrigation control
   - CO₂ injection systems
   - Lighting control interfaces

2. **Automation Protocols**
   - Modbus TCP/RTU support
   - BACnet integration
   - RESTful API interfaces
   - MQTT messaging protocols

### ERP System Integration

#### Data Synchronization
- Customer information sync
- Order management integration
- Inventory tracking
- Financial data exchange

#### Workflow Automation
- Purchase order generation
- Invoice processing
- Supply chain coordination
- Quality control workflows

---

## Billing & Subscriptions

### Subscription Management

#### Pricing Tiers
```javascript
// Subscription Tier Configuration
const pricingTiers = {
  free: {
    price: 0,
    features: ['basic_calculations', 'limited_projects'],
    limits: { projects: 1, api_calls: 100 }
  },
  starter: {
    price: 9,
    features: ['advanced_calculations', 'multiple_projects'],
    limits: { projects: 5, api_calls: 1000 }
  },
  professional: {
    price: 79,
    features: ['ai_assistant', '3d_visualization', 'team_sharing'],
    limits: { projects: 50, api_calls: 5000 }
  },
  enterprise: {
    price: 299,
    features: ['ml_predictions', 'iot_integration', 'unlimited_api'],
    limits: { projects: 'unlimited', api_calls: 'unlimited' }
  }
};
```

#### Billing Operations
1. **Automated Billing**
   - Monthly/annual billing cycles
   - Prorated charges for mid-cycle changes
   - Failed payment retry logic
   - Dunning management for delinquent accounts

2. **Usage-Based Billing**
   - API call tracking and billing
   - Storage usage monitoring
   - Overage charge calculations
   - Usage reporting and alerts

#### Revenue Recognition
1. **Accounting Integration**
   - Automated journal entries
   - Revenue recognition schedules
   - Tax calculation and reporting
   - Financial reporting compliance

2. **Subscription Analytics**
   - Churn rate analysis
   - Upgrade/downgrade tracking
   - Customer lifetime value
   - Revenue forecasting

### Financial Reporting

#### Revenue Reports
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Customer acquisition cost (CAC)
- Revenue per user (ARPU)

#### Subscription Health Metrics
- Churn rate (monthly/annual)
- Net revenue retention
- Expansion revenue
- Contraction revenue

---

## Support & Maintenance

### Support Ticket Management

#### Ticket Classification
1. **Priority Levels**
   - **P1 (Critical)**: System down, data loss, security breach
   - **P2 (High)**: Major feature broken, performance issues
   - **P3 (Medium)**: Minor feature issues, enhancement requests
   - **P4 (Low)**: Documentation updates, general questions

2. **Response Time SLAs**
   - P1: 1 hour response, 4 hour resolution
   - P2: 4 hour response, 1 day resolution
   - P3: 1 day response, 3 day resolution
   - P4: 2 day response, 1 week resolution

#### Support Workflow
```
Ticket Creation → Triage → Assignment → Resolution → Closure
      │              │         │          │         │
      ├─ User Portal ├─ Auto   ├─ Expert  ├─ Test   ├─ Survey
      ├─ Email       ├─ Manual ├─ Team    ├─ Deploy ├─ Archive
      └─ API         └─ Route  └─ Lead    └─ Monitor└─ Analyze
```

### Maintenance Procedures

#### Scheduled Maintenance
1. **Regular Maintenance Windows**
   - Weekly: Sunday 2-4 AM UTC (database optimization)
   - Monthly: First Saturday 6-8 AM UTC (system updates)
   - Quarterly: Security patches and major updates

2. **Maintenance Notifications**
   - 72-hour advance notice for planned maintenance
   - Status page updates during maintenance
   - Post-maintenance summary reports

#### Emergency Maintenance
1. **Emergency Response Procedures**
   - Incident commander activation
   - Emergency change approval process
   - Customer communication protocols
   - Post-incident review requirements

2. **Rollback Procedures**
   - Automated rollback triggers
   - Manual rollback procedures
   - Data integrity verification
   - Service restoration validation

### System Updates

#### Update Management
1. **Dependency Updates**
   - Automated security patch deployment
   - Staged rollout procedures
   - Compatibility testing requirements
   - Rollback contingency plans

2. **Feature Deployments**
   - Blue-green deployment strategy
   - Feature flag controlled rollouts
   - A/B testing for new features
   - Performance impact monitoring

#### Version Control
- Git-based version control
- Branch protection rules
- Code review requirements
- Automated testing gates

---

## Emergency Procedures

### Incident Response

#### Incident Classification
1. **Severity Levels**
   - **Sev 1**: Complete service outage
   - **Sev 2**: Major feature unavailable
   - **Sev 3**: Minor feature degradation
   - **Sev 4**: Cosmetic issues

2. **Response Team Activation**
   - On-call engineer notification
   - Incident commander assignment
   - Stakeholder communication
   - Customer notification procedures

#### Communication Procedures
1. **Internal Communication**
   - Slack incident channel creation
   - Status meeting scheduling
   - Escalation procedures
   - Executive briefing protocols

2. **External Communication**
   - Status page updates
   - Customer email notifications
   - Social media announcements
   - Press release coordination

### Business Continuity

#### Disaster Recovery
1. **Data Recovery Procedures**
   - Database restoration procedures
   - File storage recovery
   - Configuration restoration
   - Service dependency mapping

2. **Service Restoration**
   - Primary service restoration
   - Secondary service activation
   - Load balancing reconfiguration
   - Performance monitoring resumption

#### Risk Management
- Business impact assessments
- Risk mitigation strategies
- Insurance coverage verification
- Vendor contingency planning

---

*Last Updated: December 2024*
*Version: 2.1*

For technical support or questions about this guide, contact: admin@vibelux.com