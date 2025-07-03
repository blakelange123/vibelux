/**
 * Affiliate System Core
 * Manages affiliate programs, link generation, and tracking
 */

import { db } from '@/lib/db'
import { cacheManager } from '@/lib/cache/cache-manager'
import { CacheUtils } from '@/lib/cache/cache-decorators'
import { UnifiedCustomer, UnifiedPricingManager, PaymentModel } from '@/lib/unified-pricing'

export interface AffiliateUser {
  id: string
  userId: string
  affiliateCode: string
  status: 'pending' | 'active' | 'suspended' | 'terminated'
  commissionRate: number // Percentage (e.g., 5.0 for 5%)
  cookieDuration: number // Days
  customDomain?: string
  metadata: {
    companyName?: string
    website?: string
    socialMedia?: {
      instagram?: string
      twitter?: string
      youtube?: string
      tiktok?: string
    }
    audienceSize?: number
    niche?: string[]
  }
  stats: {
    totalClicks: number
    totalConversions: number
    totalRevenue: number
    conversionRate: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateLink {
  id: string
  affiliateId: string
  originalUrl: string
  shortCode: string
  customAlias?: string
  campaign?: string
  source?: string
  medium?: string
  content?: string
  isActive: boolean
  expiresAt?: Date
  metadata: {
    title?: string
    description?: string
    tags?: string[]
  }
  stats: {
    clicks: number
    uniqueClicks: number
    conversions: number
    revenue: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface AffiliateClick {
  id: string
  linkId: string
  affiliateId: string
  visitorId: string
  ipAddress: string
  userAgent: string
  referrer?: string
  country?: string
  city?: string
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    os: string
    browser: string
  }
  utmParams: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
  clickedAt: Date
  convertedAt?: Date
  conversionValue?: number
}

export interface AffiliateCommission {
  id: string
  affiliateId: string
  clickId: string
  orderId?: string
  type: 'sale' | 'lead' | 'signup' | 'subscription'
  amount: number
  rate: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  approvedAt?: Date
  paidAt?: Date
  metadata: {
    productName?: string
    orderValue?: number
    customerEmail?: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface LinkGenerationOptions {
  url: string
  campaign?: string
  source?: string
  medium?: string
  content?: string
  customAlias?: string
  expiresIn?: number // Days
  title?: string
  description?: string
  tags?: string[]
}

export interface TrackingOptions {
  cookieDuration?: number // Days
  trackConversions?: boolean
  trackRevenue?: boolean
  allowedDomains?: string[]
}

class AffiliateSystem {
  private readonly DEFAULT_COOKIE_DURATION = 30 // 30 days
  private readonly DEFAULT_COMMISSION_RATE = 5.0 // 5%

  /**
   * Create new affiliate account
   */
  async createAffiliate(userId: string, applicationData: {
    companyName?: string
    website?: string
    socialMedia?: any
    audienceSize?: number
    niche?: string[]
    requestedCommissionRate?: number
  }): Promise<AffiliateUser> {
    // Generate unique affiliate code
    const affiliateCode = await this.generateUniqueCode()
    
    const affiliate: Omit<AffiliateUser, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      affiliateCode,
      status: 'pending', // Requires manual approval
      commissionRate: applicationData.requestedCommissionRate || this.DEFAULT_COMMISSION_RATE,
      cookieDuration: this.DEFAULT_COOKIE_DURATION,
      metadata: {
        companyName: applicationData.companyName,
        website: applicationData.website,
        socialMedia: applicationData.socialMedia,
        audienceSize: applicationData.audienceSize,
        niche: applicationData.niche
      },
      stats: {
        totalClicks: 0,
        totalConversions: 0,
        totalRevenue: 0,
        conversionRate: 0
      }
    }

    const created = await db.affiliates.create(affiliate)
    
    // Invalidate cache
    await CacheUtils.invalidateUser(userId)
    
    return created
  }

  /**
   * Generate custom affiliate link
   */
  async generateLink(
    affiliateId: string, 
    options: LinkGenerationOptions
  ): Promise<AffiliateLink> {
    const affiliate = await this.getAffiliate(affiliateId)
    if (!affiliate || affiliate.status !== 'active') {
      throw new Error('Affiliate account not active')
    }

    // Generate short code or use custom alias
    const shortCode = options.customAlias || await this.generateShortCode()
    
    // Validate custom alias availability
    if (options.customAlias) {
      const existing = await this.findLinkByCode(shortCode)
      if (existing) {
        throw new Error('Custom alias already exists')
      }
    }

    const link: Omit<AffiliateLink, 'id' | 'createdAt' | 'updatedAt'> = {
      affiliateId,
      originalUrl: options.url,
      shortCode,
      customAlias: options.customAlias,
      campaign: options.campaign,
      source: options.source,
      medium: options.medium,
      content: options.content,
      isActive: true,
      expiresAt: options.expiresIn ? 
        new Date(Date.now() + options.expiresIn * 24 * 60 * 60 * 1000) : 
        undefined,
      metadata: {
        title: options.title,
        description: options.description,
        tags: options.tags
      },
      stats: {
        clicks: 0,
        uniqueClicks: 0,
        conversions: 0,
        revenue: 0
      }
    }

    const created = await db.affiliateLinks.create(link)
    
    // Cache the link for fast lookup
    await cacheManager.set(
      `affiliate:link:${shortCode}`,
      created,
      { ttl: 3600, prefix: 'affiliate' }
    )
    
    return created
  }

  /**
   * Process affiliate link click
   */
  async processClick(
    shortCode: string,
    request: {
      ipAddress: string
      userAgent: string
      referrer?: string
      utmParams?: Record<string, string>
    }
  ): Promise<{
    redirectUrl: string
    visitorId: string
    cookieData: {
      affiliateId: string
      clickId: string
      expiresAt: number
    }
  }> {
    // Get link from cache or database
    let link = await cacheManager.get<AffiliateLink>(
      `affiliate:link:${shortCode}`,
      { prefix: 'affiliate' }
    )
    
    if (!link) {
      link = await this.findLinkByCode(shortCode)
      if (link) {
        // Cache for future lookups
        await cacheManager.set(
          `affiliate:link:${shortCode}`,
          link,
          { ttl: 3600, prefix: 'affiliate' }
        )
      }
    }

    if (!link || !link.isActive) {
      throw new Error('Invalid or inactive affiliate link')
    }

    // Check if link is expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      throw new Error('Affiliate link has expired')
    }

    const affiliate = await this.getAffiliate(link.affiliateId)
    if (!affiliate || affiliate.status !== 'active') {
      throw new Error('Affiliate account not active')
    }

    // Generate visitor ID
    const visitorId = this.generateVisitorId(request.ipAddress, request.userAgent)
    
    // Parse device info
    const deviceInfo = this.parseDeviceInfo(request.userAgent)
    
    // Record click
    const click: Omit<AffiliateClick, 'id' | 'clickedAt'> = {
      linkId: link.id,
      affiliateId: link.affiliateId,
      visitorId,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      referrer: request.referrer,
      device: deviceInfo,
      utmParams: {
        source: request.utmParams?.utm_source || link.source,
        medium: request.utmParams?.utm_medium || link.medium,
        campaign: request.utmParams?.utm_campaign || link.campaign,
        term: request.utmParams?.utm_term,
        content: request.utmParams?.utm_content || link.content
      }
    }

    const recordedClick = await db.affiliateClicks.create(click)
    
    // Update link stats
    await this.updateLinkStats(link.id, 'click', visitorId)
    
    // Prepare cookie data
    const cookieData = {
      affiliateId: link.affiliateId,
      clickId: recordedClick.id,
      expiresAt: Date.now() + (affiliate.cookieDuration * 24 * 60 * 60 * 1000)
    }

    // Build redirect URL with tracking parameters
    const redirectUrl = this.buildRedirectUrl(link.originalUrl, {
      ...request.utmParams,
      utm_source: click.utmParams.source,
      utm_medium: click.utmParams.medium,
      utm_campaign: click.utmParams.campaign,
      utm_term: click.utmParams.term,
      utm_content: click.utmParams.content,
      aff_id: link.affiliateId,
      click_id: recordedClick.id
    })

    return {
      redirectUrl,
      visitorId,
      cookieData
    }
  }

  /**
   * Track conversion from cookie data with unified pricing support
   */
  async trackConversion(
    cookieData: {
      affiliateId: string
      clickId: string
    },
    conversionData: {
      type: 'sale' | 'lead' | 'signup' | 'subscription' | 'revenue_sharing'
      value?: number
      orderId?: string
      productName?: string
      customerEmail?: string
      paymentModel?: PaymentModel
      customerId?: string
    }
  ): Promise<AffiliateCommission> {
    const click = await db.affiliateClicks.findById(cookieData.clickId)
    if (!click) {
      throw new Error('Invalid click reference')
    }

    const affiliate = await this.getAffiliate(cookieData.affiliateId)
    if (!affiliate) {
      throw new Error('Invalid affiliate reference')
    }

    // Calculate commission based on customer's payment model
    const commissionAmount = await this.calculateCommission(
      affiliate,
      conversionData
    )

    const commission: Omit<AffiliateCommission, 'id' | 'createdAt' | 'updatedAt'> = {
      affiliateId: cookieData.affiliateId,
      clickId: cookieData.clickId,
      orderId: conversionData.orderId,
      type: conversionData.type,
      amount: commissionAmount,
      rate: affiliate.commissionRate,
      status: 'pending', // Requires approval
      metadata: {
        productName: conversionData.productName,
        orderValue: conversionData.value,
        customerEmail: conversionData.customerEmail,
        paymentModel: conversionData.paymentModel,
        customerId: conversionData.customerId
      }
    }

    const created = await db.affiliateCommissions.create(commission)

    // Update click with conversion data
    await db.affiliateClicks.update(cookieData.clickId, {
      convertedAt: new Date(),
      conversionValue: conversionData.value
    })

    // Update link and affiliate stats
    await this.updateLinkStats(click.linkId, 'conversion', click.visitorId, conversionData.value)
    await this.updateAffiliateStats(cookieData.affiliateId)

    return created
  }

  /**
   * Calculate commission based on customer's payment model
   */
  private async calculateCommission(
    affiliate: AffiliateUser,
    conversionData: {
      type: string
      value?: number
      paymentModel?: PaymentModel
      customerId?: string
    }
  ): Promise<number> {
    if (!conversionData.value) return 0;

    // Base commission calculation
    let commissionAmount = (conversionData.value * affiliate.commissionRate) / 100;

    // Adjust based on payment model
    if (conversionData.paymentModel === 'revenue-sharing') {
      // Revenue sharing customers provide ongoing commissions
      // Apply a multiplier for long-term value
      commissionAmount *= 1.5; // 50% bonus for revenue sharing referrals
      
      // For revenue sharing, commission is calculated on the revenue share payment
      // not the total customer value
      if (conversionData.customerId) {
        // This would typically be the monthly revenue sharing payment
        // For initial signup, we estimate based on typical values
        const estimatedMonthlyRevenue = conversionData.value * 0.2; // 20% revenue share typical
        commissionAmount = (estimatedMonthlyRevenue * affiliate.commissionRate) / 100;
      }
    }

    return Math.round(commissionAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate ongoing commission for revenue sharing customers
   */
  async calculateOngoingCommission(
    affiliateId: string,
    customerId: string,
    monthlyRevenueShare: number
  ): Promise<number> {
    const affiliate = await this.getAffiliate(affiliateId);
    if (!affiliate) return 0;

    // Find the original conversion to verify this customer was referred by this affiliate
    const originalCommission = await db.affiliateCommissions.findByCustomer(customerId, affiliateId);
    if (!originalCommission) return 0;

    // Calculate commission on monthly revenue share payment
    return (monthlyRevenueShare * affiliate.commissionRate) / 100;
  }

  /**
   * Get affiliate dashboard data
   */
  async getAffiliateDashboard(affiliateId: string, timeRange: {
    startDate: Date
    endDate: Date
  }) {
    const affiliate = await this.getAffiliate(affiliateId)
    if (!affiliate) {
      throw new Error('Affiliate not found')
    }

    // Get stats for time range
    const [clicks, conversions, commissions, topLinks] = await Promise.all([
      this.getClicksInRange(affiliateId, timeRange),
      this.getConversionsInRange(affiliateId, timeRange),
      this.getCommissionsInRange(affiliateId, timeRange),
      this.getTopPerformingLinks(affiliateId, timeRange)
    ])

    // Calculate metrics
    const totalClicks = clicks.length
    const totalConversions = conversions.length
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0
    const totalRevenue = commissions.reduce((sum, comm) => sum + comm.amount, 0)
    const pendingCommissions = commissions.filter(c => c.status === 'pending').length
    const approvedCommissions = commissions.filter(c => c.status === 'approved').length

    // Daily breakdown
    const dailyStats = this.calculateDailyStats(clicks, conversions, commissions, timeRange)

    return {
      affiliate: {
        id: affiliate.id,
        code: affiliate.affiliateCode,
        status: affiliate.status,
        commissionRate: affiliate.commissionRate,
        cookieDuration: affiliate.cookieDuration
      },
      metrics: {
        totalClicks,
        totalConversions,
        conversionRate,
        totalRevenue,
        pendingCommissions,
        approvedCommissions,
        averageOrderValue: totalConversions > 0 ? 
          commissions.reduce((sum, c) => sum + (c.metadata.orderValue || 0), 0) / totalConversions : 0
      },
      topLinks,
      dailyStats,
      recentActivity: {
        clicks: clicks.slice(-10),
        conversions: conversions.slice(-5)
      }
    }
  }

  /**
   * Generate custom affiliate URLs for different platforms
   */
  generatePlatformLinks(affiliateCode: string, baseUrls: {
    website?: string
    product?: string
    category?: string
  }) {
    const platformTemplates = {
      email: {
        subject: 'Check out VibeLux - Professional LED Grow Lights',
        body: `Hi there!\n\nI wanted to share VibeLux with you - they make some of the best LED grow lights I've used.\n\n{{LINK}}\n\nUse my link above to check them out!\n\nBest regards`
      },
      social: {
        instagram: `🌱 Just discovered @vibelux - amazing LED grow lights! Check them out: {{LINK}} #hydroponics #ledgrowlights #indoorgrowing`,
        twitter: `🌿 VibeLux has some incredible LED grow lights for indoor growing! {{LINK}} #GrowLights #IndoorGardening #LEDs`,
        facebook: `I've been using VibeLux LED grow lights and the results are amazing! If you're into indoor growing, definitely check them out: {{LINK}}`,
        youtube: `VibeLux LED Grow Lights - Link in description: {{LINK}}\n\nThese lights have transformed my indoor growing setup!`,
        tiktok: `Link in bio! @vibelux has the best LED grow lights 🌱✨ #growlights #indoorplants #vibelux`
      },
      website: {
        banner: `<a href="{{LINK}}" target="_blank"><img src="/affiliate-banner.jpg" alt="VibeLux LED Grow Lights" /></a>`,
        text: `<a href="{{LINK}}" target="_blank">Check out VibeLux LED Grow Lights</a>`,
        button: `<a href="{{LINK}}" target="_blank" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Shop VibeLux</a>`
      }
    }

    return platformTemplates
  }

  // Private helper methods

  private async generateUniqueCode(): Promise<string> {
    let code: string
    let attempts = 0
    const maxAttempts = 10

    do {
      code = this.generateRandomCode(8)
      attempts++
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique affiliate code')
      }
    } while (await this.codeExists(code))

    return code
  }

  private async generateShortCode(): Promise<string> {
    let code: string
    let attempts = 0
    const maxAttempts = 10

    do {
      code = this.generateRandomCode(6)
      attempts++
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique short code')
      }
    } while (await this.shortCodeExists(code))

    return code
  }

  private generateRandomCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF * chars.length))
    }
    return result
  }

  private async codeExists(code: string): Promise<boolean> {
    const existing = await db.affiliates.findByCode(code)
    return existing !== null
  }

  private async shortCodeExists(code: string): Promise<boolean> {
    const existing = await this.findLinkByCode(code)
    return existing !== null
  }

  private async findLinkByCode(code: string): Promise<AffiliateLink | null> {
    return await db.affiliateLinks.findByShortCode(code)
  }

  private async getAffiliate(affiliateId: string): Promise<AffiliateUser | null> {
    return await cacheManager.getOrSet(
      `affiliate:${affiliateId}`,
      () => db.affiliates.findById(affiliateId),
      { ttl: 1800, prefix: 'affiliate' }
    )
  }

  private generateVisitorId(ip: string, userAgent: string): string {
    const hash = require('crypto')
      .createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
    return hash.substring(0, 16)
  }

  private parseDeviceInfo(userAgent: string) {
    // Simple device detection (in production, use a library like ua-parser-js)
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
    const isTablet = /iPad|Tablet/.test(userAgent)
    
    return {
      type: isTablet ? 'tablet' as const : isMobile ? 'mobile' as const : 'desktop' as const,
      os: this.extractOS(userAgent),
      browser: this.extractBrowser(userAgent)
    }
  }

  private extractOS(userAgent: string): string {
    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac OS/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    if (/iOS|iPhone|iPad/.test(userAgent)) return 'iOS'
    return 'Unknown'
  }

  private extractBrowser(userAgent: string): string {
    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome'
    if (/Firefox/.test(userAgent)) return 'Firefox'
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari'
    if (/Edge/.test(userAgent)) return 'Edge'
    return 'Unknown'
  }

  private buildRedirectUrl(baseUrl: string, params: Record<string, string | undefined>): string {
    const url = new URL(baseUrl)
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value)
      }
    })
    
    return url.toString()
  }

  private async updateLinkStats(
    linkId: string, 
    type: 'click' | 'conversion', 
    visitorId: string, 
    value?: number
  ) {
    // Implementation would update link statistics
    // This is a placeholder for the actual database update
  }

  private async updateAffiliateStats(affiliateId: string) {
    // Implementation would recalculate and update affiliate statistics
    // This is a placeholder for the actual database update
  }

  private async getClicksInRange(affiliateId: string, timeRange: any) {
    // Implementation would fetch clicks in date range
    return []
  }

  private async getConversionsInRange(affiliateId: string, timeRange: any) {
    // Implementation would fetch conversions in date range
    return []
  }

  private async getCommissionsInRange(affiliateId: string, timeRange: any) {
    // Implementation would fetch commissions in date range
    return []
  }

  private async getTopPerformingLinks(affiliateId: string, timeRange: any) {
    // Implementation would fetch top performing links
    return []
  }

  private calculateDailyStats(clicks: any[], conversions: any[], commissions: any[], timeRange: any) {
    // Implementation would calculate daily breakdown
    return []
  }
}

export const affiliateSystem = new AffiliateSystem()
export default affiliateSystem