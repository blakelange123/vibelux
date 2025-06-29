# VibeLux Demo Setup Guide

This guide will help you set up a comprehensive demo environment with realistic data for investor walkthroughs.

## 🎯 Demo Overview

The demo showcases VibeLux's complete platform including:
- **Investment Management**: Portfolio tracking, opportunities, payouts
- **Facility Operations**: Real-time monitoring, cost tracking, production data
- **Affiliate Program**: Referral tracking and commission management
- **Analytics**: Performance metrics, ROI calculations, growth projections

## 🚀 Quick Setup

### 1. Reset and Seed Database
```bash
# Complete reset with demo data
npm run db:reset-demo

# Or seed demo data only (if database already exists)
npm run db:seed-demo
```

### 2. Access Demo Accounts

The demo creates three user accounts:

#### **Facility Owner/Operator**
- **Email**: `demo.facility@vibelux.com`
- **Role**: Facility management, operations tracking
- **Access**: 3 facilities, production data, cost tracking

#### **Investor**
- **Email**: `demo.investor@vibelux.com`  
- **Role**: Investment portfolio management
- **Access**: $500K invested across 3 opportunities, monthly returns

#### **Platform Admin**
- **Email**: `admin@vibelux.com`
- **Role**: System administration, user management
- **Access**: Full platform oversight, analytics, affiliate management

### 3. Enable Demo Mode
Add `?demo=true` to any URL to activate demo mode with enhanced features and sample data.

## 📊 Demo Data Includes

### **Facilities** (3 total)
1. **Green Valley Cannabis Co.** (Denver, CO)
   - 50,000 sq ft greenhouse
   - Premium cannabis cultivation
   - LED lighting upgrade project

2. **Vertical Greens Chicago** (Chicago, IL)
   - 25,000 sq ft vertical farm
   - Leafy greens production
   - Advanced automation systems

3. **Premium Herbs Indoor** (Portland, OR)
   - 35,000 sq ft indoor facility
   - Herb cultivation with UV supplementation
   - Processing technology upgrade

### **Investment Opportunities** (3 active)
1. **LED Lighting Upgrade** - $750K target, 25.5% expected return
2. **Vertical Farm Expansion** - $1.2M target, 32% expected return  
3. **Cannabis Processing Tech** - $600K target, 28.5% expected return (funded)

### **Investment Portfolio**
- **Total Invested**: $500,000 across 3 opportunities
- **Returns Generated**: $39,750 (monthly payouts)
- **Expected IRR**: 25-32% depending on investment type
- **Payment History**: 3 months of completed transactions

### **Operations Data**
- **Production Batch**: Completed cannabis grow (25kg dry weight)
- **Sensor Readings**: 30 days of environmental data
- **Cost Tracking**: Labor, utilities, nutrients, equipment expenses
- **Quality Metrics**: THC content, yield per sq ft, energy efficiency

### **Affiliate Program**
- **Active Affiliate**: GREENVALLEY2024 referral code
- **Performance**: 8 total referrals, $45,750 revenue generated
- **Commissions**: $6,862.50 earned, Silver tier status

## 🎬 Investor Walkthrough Script

### **1. Market Opportunity (2 minutes)**
- Show facility dashboard with real cultivation metrics
- Highlight energy costs and yield optimization potential
- Present before/after scenarios with VibeLux improvements

### **2. Investment Portfolio (3 minutes)**
Navigate to investor dashboard (`demo.investor@vibelux.com`):
- **Portfolio Overview**: $500K invested, $39.7K returns
- **Active Investments**: 3 opportunities with different risk profiles
- **Monthly Returns**: Consistent payout history
- **Performance Metrics**: 25-32% IRR, verified facility data

### **3. Technology Platform (4 minutes)**
Switch to facility view (`demo.facility@vibelux.com`):
- **Real-time Monitoring**: Live sensor data, environmental controls
- **Production Tracking**: Batch management, yield optimization
- **Cost Analytics**: Detailed expense tracking, ROI calculations
- **Automation**: Advanced LED control, spectrum optimization

### **4. Market Validation (2 minutes)**
- **Affiliate Program**: Referral growth, revenue generation
- **Facility Network**: Multiple facility types and locations
- **Proven Results**: Documented yield improvements, energy savings

### **5. Investment Terms (3 minutes)**
Show investment opportunity details:
- **Funding Levels**: $50K - $500K investment minimums
- **Return Structure**: Monthly service fees + yield sharing
- **Risk Mitigation**: Diversified facility portfolio
- **Exit Strategy**: Equipment value retention, contract flexibility

## 🔧 Technical Features Demonstrated

### **Real-time Analytics**
- Environmental sensor integration (temperature, humidity, CO2, PPFD)
- Energy usage monitoring and optimization
- Yield tracking and performance benchmarking

### **Financial Transparency**
- Detailed expense categorization and tracking
- ROI calculations with verifiable facility data
- Automated payout processing and reporting

### **Risk Management**
- Diversified facility portfolio across geographic regions
- Multiple crop types and facility configurations
- Performance-based payment structures

### **Scalability**
- API-first architecture for facility integrations
- Automated data collection and analysis
- Multi-tenant platform supporting facility networks

## 📱 Demo Access URLs

- **Investor Portfolio**: `/investments/portfolio?demo=true`
- **Facility Dashboard**: `/facility/dashboard?demo=true`
- **Investment Opportunities**: `/investments/marketplace?demo=true`
- **Analytics**: `/analytics/performance?demo=true`
- **Admin Panel**: `/admin/overview?demo=true`

## 🛠️ Customization

### Adding More Demo Data
Edit `/src/scripts/seed-demo-data.ts` to customize:
- Facility details and locations
- Investment amounts and terms
- Production metrics and timelines
- Sensor data patterns

### Demo Mode Features
The demo mode (`?demo=true`) provides:
- Enhanced UI with explanatory tooltips
- Sample data overlay for empty states
- Guided tour highlights
- Simplified workflows for presentations

## 📞 Support

For demo setup issues or customization requests:
- Check database connections and environment variables
- Ensure Prisma schema is up to date: `npx prisma db push`
- Review seed script logs for any data creation errors

---

**Ready to impress investors with real-world cultivation data and proven ROI metrics!** 🌱📈