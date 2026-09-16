import React from 'react'
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts'

const LineChart = ({
  data = [],
  xKey = 'name',
  lines = [],
  height = 300,
  showGrid = true,
  showLegend = true,
  showArea = false,
  fillOpacity = 0.2,
  tooltip = true,
  className = ''
}) => {
  const defaultColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

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

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        {showArea ? (
          <ComposedChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {lines.map((line, index) => (
              <Area
                key={index}
                type="monotone"
                dataKey={line.key}
                name={line.name || line.key}
                stroke={line.color || defaultColors[index % defaultColors.length]}
                fill={line.color || defaultColors[index % defaultColors.length]}
                fillOpacity={fillOpacity}
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot || false}
              />
            ))}
          </ComposedChart>
        ) : (
          <RechartsLineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis dataKey={xKey} stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            {tooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
            {lines.map((line, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={line.key}
                name={line.name || line.key}
                stroke={line.color || defaultColors[index % defaultColors.length]}
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot || false}
                strokeDasharray={line.dashed ? '5 5' : undefined}
              />
            ))}
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart