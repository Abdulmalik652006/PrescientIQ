import React, { useState } from 'react'
import { Calendar, Download, Maximize2 } from 'lucide-react'
import LineChart from '../charts/LineChart'

const PerformanceChart = ({
  data = [],
  title = 'Performance Forecast',
  subtitle = 'Actual vs Predicted Performance',
  height = 300,
  periods = ['7D', '30D', '90D', '1Y'],
  onPeriodChange,
  onDownload,
  loading = false
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30D')

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
    if (onPeriodChange) {
      onPeriodChange(period)
    }
  }

  const chartLines = [
    { key: 'actual', name: 'Actual', color: '#22c55e', strokeWidth: 2 },
    { key: 'predicted', name: 'Predicted', color: '#3b82f6', strokeWidth: 2, dashed: true }
  ]

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-secondary-900">{title}</h3>
          <p className="text-sm text-secondary-500">{subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {periods.map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  selectedPeriod === period
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-secondary-500 hover:text-secondary-700'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
          <button 
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-gray-100 text-secondary-400 transition-colors"
          >
            <Download size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100 text-secondary-400 transition-colors">
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      <LineChart 
        data={data} 
        xKey="day" 
        lines={chartLines}
        height={height}
        showGrid={true}
        showLegend={true}
        tooltip={true}
      />

      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary-500"></div>
          <span className="text-secondary-500">Actual Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-500 border-t-2 border-blue-500 border-dashed"></div>
          <span className="text-secondary-500">Predicted Performance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-blue-300"></div>
          <span className="text-secondary-500">Confidence Interval</span>
        </div>
      </div>
    </div>
  )
}

export default PerformanceChart