import React from 'react'
import { TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'

const KPICard = ({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  subtitle,
  comparison = 'vs last month',
  color = 'primary',
  loading = false,
  onClick
}) => {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600'
  }

  const trendColor = trend === 'up' ? 'text-primary-600' : 'text-red-600'
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown
  const ArrowIcon = trend === 'up' ? ArrowUp : ArrowDown

  if (loading) {
    return (
      <div className="stat-card animate-pulse">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="stat-card cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-secondary-500 truncate">{title}</p>
          <h3 className="text-2xl font-bold text-secondary-900 mt-1 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          {subtitle && (
            <p className="text-xs text-secondary-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`stat-icon ${colorClasses[color]} flex-shrink-0`}>
          {Icon && <Icon size={24} />}
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4 pt-2 border-t border-gray-100">
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          <ArrowIcon size={16} className="inline" />
          <span>{Math.abs(change)}%</span>
        </div>
        <span className="text-sm text-secondary-400 truncate">{comparison}</span>
        <div className="ml-auto">
          <TrendIcon size={16} className={trend === 'up' ? 'text-primary-400' : 'text-red-400'} />
        </div>
      </div>
    </div>
  )
}

export default KPICard