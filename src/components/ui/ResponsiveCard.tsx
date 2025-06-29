import React from 'react'
import { useMobile } from '@/hooks/useMobile'

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
}

export function ResponsiveCard({
  children,
  className = '',
  title,
  description,
  icon,
  actions,
  collapsible = false,
  defaultCollapsed = false
}: ResponsiveCardProps) {
  const { isMobile } = useMobile()
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  return (
    <div
      className={`
        bg-gray-800 rounded-lg 
        ${isMobile ? 'p-4' : 'p-6'} 
        ${className}
      `}
    >
      {(title || description || icon || actions) && (
        <div className="mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {icon && (
                <div className="flex-shrink-0">
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className={`font-semibold text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                    {title}
                  </h3>
                )}
                {description && (
                  <p className={`text-gray-400 ${isMobile ? 'text-xs mt-1' : 'text-sm mt-2'}`}>
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              {collapsible && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      isCollapsed ? '' : 'rotate-180'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {(!collapsible || !isCollapsed) && children}
    </div>
  )
}

// Responsive Grid Component
interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

export function ResponsiveGrid({
  children,
  className = '',
  cols = { mobile: 1, tablet: 2, desktop: 3 }
}: ResponsiveGridProps) {
  return (
    <div
      className={`
        grid gap-4
        grid-cols-${cols.mobile || 1}
        sm:grid-cols-${cols.tablet || 2}
        lg:grid-cols-${cols.desktop || 3}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Responsive Stat Card
interface ResponsiveStatProps {
  label: string
  value: string | number
  change?: {
    value: number
    trend: 'up' | 'down'
  }
  icon?: React.ReactNode
  color?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export function ResponsiveStat({
  label,
  value,
  change,
  icon,
  color = 'default'
}: ResponsiveStatProps) {
  const { isMobile } = useMobile()
  
  const colorClasses = {
    default: 'bg-gray-700',
    success: 'bg-green-900/50',
    warning: 'bg-yellow-900/50',
    danger: 'bg-red-900/50',
    info: 'bg-blue-900/50'
  }

  return (
    <div className={`${colorClasses[color]} rounded-lg ${isMobile ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {label}
          </p>
          <p className={`font-semibold text-white ${isMobile ? 'text-xl mt-1' : 'text-2xl mt-2'}`}>
            {value}
          </p>
          {change && (
            <p className={`${isMobile ? 'text-xs mt-1' : 'text-sm mt-2'} flex items-center gap-1`}>
              <span className={change.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-gray-500">from last period</span>
            </p>
          )}
        </div>
        {icon && (
          <div className={`${isMobile ? 'p-2' : 'p-3'} bg-gray-800 rounded-lg`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}