/**
 * Affiliate Link Redirect Handler
 * Processes affiliate clicks and redirects to target URL
 */

import { NextRequest } from 'next/server'
import { redirect } from 'next/navigation'
import { cookies, headers } from 'next/headers'
import { affiliateSystem } from '@/lib/affiliates/affiliate-system'

interface AffiliateRedirectProps {
  params: {
    shortCode: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export default async function AffiliateRedirect({
  params,
  searchParams
}: AffiliateRedirectProps) {
  const { shortCode } = params
  
  try {
    // Get request information
    const headersList = headers()
    const userAgent = headersList.get('user-agent') || ''
    const referrer = headersList.get('referer') || undefined
    const forwarded = headersList.get('x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
                     headersList.get('x-real-ip') || 
                     '127.0.0.1'

    // Extract UTM parameters
    const utmParams: Record<string, string> = {}
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key.startsWith('utm_') && typeof value === 'string') {
        utmParams[key] = value
      }
    })

    // Process the click
    const clickResult = await affiliateSystem.processClick(shortCode, {
      ipAddress,
      userAgent,
      referrer,
      utmParams
    })

    // Set affiliate tracking cookie
    const cookieStore = cookies()
    cookieStore.set('vbl_aff', JSON.stringify(clickResult.cookieData), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    // Redirect to target URL
    redirect(clickResult.redirectUrl)

  } catch (error) {
    console.error('Affiliate redirect error:', error)
    
    // Fallback redirect to homepage
    redirect(process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app')
  }
}

// Generate metadata for the page
export async function generateMetadata({
  params
}: {
  params: { shortCode: string }
}) {
  try {
    // Get link information for metadata
    const link = await affiliateSystem.getLinkByShortCode(params.shortCode)
    
    if (link && link.metadata.title) {
      return {
        title: link.metadata.title,
        description: link.metadata.description || 'VibeLux - Professional LED Grow Lights',
        robots: 'noindex, nofollow' // Don't index affiliate links
      }
    }
  } catch (error) {
    console.error('Error generating affiliate link metadata:', error)
  }

  return {
    title: 'Redirecting...',
    description: 'VibeLux - Professional LED Grow Lights',
    robots: 'noindex, nofollow'
  }
}