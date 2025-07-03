import React from 'react'
import { useMobile } from '@/hooks/useMobile'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (item: T) => React.ReactNode
  mobileHidden?: boolean
  sortable?: boolean
  width?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (item: T) => void
  mobileCardView?: boolean
  className?: string
}

export function ResponsiveTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  mobileCardView = true,
  className = ''
}: ResponsiveTableProps<T>) {
  const { isMobile } = useMobile()
  const [sortBy, setSortBy] = React.useState<string | null>(null)
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = React.useState<Set<string | number>>(new Set())

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(key)
      setSortOrder('asc')
    }
  }

  const toggleRow = (id: string | number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortBy) return data

    return [...data].sort((a, b) => {
      const aVal = (a as any)[sortBy]
      const bVal = (b as any)[sortBy]
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }, [data, sortBy, sortOrder])

  // Mobile card view
  if (isMobile && mobileCardView) {
    return (
      <div className={`space-y-3 ${className}`}>
        {sortedData.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg p-4 space-y-3"
            onClick={() => onRowClick?.(item)}
          >
            {/* Primary info - always visible */}
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                {columns
                  .filter(col => !col.mobileHidden)
                  .slice(0, 2)
                  .map(col => (
                    <div key={col.key}>
                      <p className="text-xs text-gray-500">{col.label}</p>
                      <p className="text-sm text-white">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </p>
                    </div>
                  ))}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleRow(item.id)
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                {expandedRows.has(item.id) ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Expanded info */}
            {expandedRows.has(item.id) && (
              <div className="pt-3 border-t border-gray-700 space-y-2">
                {columns
                  .filter(col => !col.mobileHidden)
                  .slice(2)
                  .map(col => (
                    <div key={col.key} className="flex justify-between text-sm">
                      <span className="text-gray-500">{col.label}:</span>
                      <span className="text-white">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // Desktop table view
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700">
            {columns.map(col => (
              <th
                key={col.key}
                className={`
                  px-4 py-3 text-left text-sm font-medium text-gray-400
                  ${col.sortable ? 'cursor-pointer hover:text-white' : ''}
                  ${col.width || ''}
                `}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortBy === col.key && (
                    <span className="text-purple-400">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item, index) => (
            <tr
              key={item.id}
              className={`
                border-b border-gray-800
                ${onRowClick ? 'cursor-pointer hover:bg-gray-800/50' : ''}
                ${index % 2 === 0 ? 'bg-gray-900/30' : ''}
              `}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3 text-sm text-gray-300">
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Responsive Data List Component
interface DataListItem {
  label: string
  value: React.ReactNode
  mobileHidden?: boolean
}

interface ResponsiveDataListProps {
  items: DataListItem[]
  className?: string
}

export function ResponsiveDataList({ items, className = '' }: ResponsiveDataListProps) {
  const { isMobile } = useMobile()
  
  const visibleItems = items.filter(item => !isMobile || !item.mobileHidden)

  return (
    <dl className={`${isMobile ? 'space-y-3' : 'grid grid-cols-2 gap-4'} ${className}`}>
      {visibleItems.map((item, index) => (
        <div
          key={index}
          className={`
            ${isMobile ? 'flex justify-between items-center' : ''}
            ${!isMobile && index % 2 === 0 ? 'pr-4' : 'pl-4'}
          `}
        >
          <dt className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-sm mb-1'}`}>
            {item.label}
          </dt>
          <dd className={`text-white ${isMobile ? 'text-sm font-medium' : 'text-base'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}