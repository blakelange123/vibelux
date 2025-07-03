import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://vibelux.app'
  
  // Static pages
  const staticPages = [
    '',
    '/features',
    '/pricing',
    '/about',
    '/fixtures',
    '/calculators',
    '/resources',
    '/marketplace',
    '/compare',
    '/affiliates',
    '/privacy',
    '/terms',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Feature pages
  const featurePages = [
    '/design/advanced',
    '/cultivation/crop-steering',
    '/sensors',
    '/sensors/wireless',
    '/operations',
    '/quality',
    '/workforce',
    '/compliance-calendar',
    '/demand-response',
    '/battery-optimization',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Tool pages
  const toolPages = [
    '/calculators/roi',
    '/calculators/energy',
    '/calculators/spectrum',
    '/calculators/coverage',
    '/photosynthetic-calculator',
    '/spectrum-builder',
    '/yield-prediction',
    '/tco-calculator',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...featurePages, ...toolPages]
}