import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'

const BarChart = ({
  data = [],
  xKey = 'name',
  bars = [],
  height = 300,
  layout = 'vertical',
  showGrid = true,
  showLegend = true,
  stacked = false,
  tooltip = true,
  className = '',
  colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
}) => {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-secondary-900 mb-1">{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const isHorizontal = layout === 'horizontal'

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart 
          data={data} 
          layout={layout}
          barCategoryGap={isHorizontal ? 10 : 20}
          barGap={isHorizontal ? 5 : 10}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
          {isHorizontal ? (
            <>
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 12 }} width={80} />
            </>
          ) : (
            <>
              <XAxis dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            </>
          )}
          {tooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          {bars.map((bar, index) => (
            <Bar
              key={index}
              dataKey={bar.key}
              name={bar.name || bar.key}
              fill={bar.color || colors[index % colors.length]}
              radius={[4, 4, 0, 0]}
              stackId={stacked ? 'stack' : undefined}
            >
              {bar.dataKey === 'utilization' && data.map((entry, idx) => (
                <Cell 
                  key={`cell-${idx}`}
                  fill={entry.utilization > 85 ? '#ef4444' : entry.utilization > 65 ? '#f59e0b' : '#22c55e'}
                />
              ))}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart