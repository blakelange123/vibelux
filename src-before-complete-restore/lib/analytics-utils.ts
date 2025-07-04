// Analytics and metrics utilities

export interface UsageMetrics {
  totalUsers: number
  activeUsers: number
  calculationsRun: number
  designsCreated: number
  energySaved: number
  facilitiesManaged: number
}

export interface PerformanceData {
  date: string
  ppfdCalculations: number
  heatLoadCalculations: number
  vpdCalculations: number
  designsCreated: number
  energyOptimized: number
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'error'
  uptime: number
  responseTime: number
  errorRate: number
  activeConnections: number
}

export interface UserActivity {
  userId: string
  userName: string
  lastActive: string
  calculationsToday: number
  designsCreated: number
  subscription: 'starter' | 'professional' | 'enterprise'
}

// Generate mock analytics data for demonstration
export function generateUsageMetrics(): UsageMetrics {
  return {
    totalUsers: 2847,
    activeUsers: 1203,
    calculationsRun: 15642,
    designsCreated: 3421,
    energySaved: 2847321, // kWh
    facilitiesManaged: 187
  }
}

export function generatePerformanceData(): PerformanceData[] {
  const data: PerformanceData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toISOString().split('T')[0],
      ppfdCalculations: Math.floor(Math.random() * 50) + 20,
      heatLoadCalculations: Math.floor(Math.random() * 30) + 10,
      vpdCalculations: Math.floor(Math.random() * 40) + 15,
      designsCreated: Math.floor(Math.random() * 15) + 5,
      energyOptimized: Math.floor(Math.random() * 1000) + 500
    })
  }
  
  return data
}

export function generateSystemHealth(): SystemHealth {
  const statuses: SystemHealth['status'][] = ['healthy', 'healthy', 'healthy', 'warning', 'healthy']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  
  return {
    status: randomStatus,
    uptime: 99.7,
    responseTime: Math.floor(Math.random() * 100) + 50,
    errorRate: Math.random() * 0.5,
    activeConnections: Math.floor(Math.random() * 500) + 200
  }
}

export function generateUserActivity(): UserActivity[] {
  const users = [
    { name: 'John Smith', subscription: 'professional' as const },
    { name: 'Sarah Johnson', subscription: 'enterprise' as const },
    { name: 'Mike Chen', subscription: 'starter' as const },
    { name: 'Lisa Davis', subscription: 'professional' as const },
    { name: 'Tom Wilson', subscription: 'enterprise' as const },
    { name: 'Emma Brown', subscription: 'starter' as const },
    { name: 'David Lee', subscription: 'professional' as const },
    { name: 'Amy Taylor', subscription: 'enterprise' as const }
  ]
  
  return users.map((user, index) => ({
    userId: `user_${index + 1}`,
    userName: user.name,
    lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    calculationsToday: Math.floor(Math.random() * 20),
    designsCreated: Math.floor(Math.random() * 5),
    subscription: user.subscription
  }))
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function formatMetric(value: number, type: 'number' | 'percentage' | 'currency' | 'energy' = 'number'): string {
  switch (type) {
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'currency':
      return `$${value.toLocaleString()}`
    case 'energy':
      return `${value.toLocaleString()} kWh`
    default:
      return value.toLocaleString()
  }
}