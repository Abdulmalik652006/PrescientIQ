import React, { useState, useEffect } from 'react'
import { Package, Activity, AlertTriangle, CheckCircle, Server, Users, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'
import api from '../services/api'
import { useDataset } from '../context/DatasetContext'

const Resources = () => {
  const { activeDataset, isUploaded } = useDataset()
  const [loading, setLoading] = useState(true)
  const [resources, setResources] = useState([])
  const [utilizationData, setUtilizationData] = useState([])
  const [availabilityBreakdown, setAvailabilityBreakdown] = useState([
    { name: 'Active (In Use)', value: 68, color: '#22c55e' },
    { name: 'Available (Idle)', value: 24, color: '#3b82f6' },
    { name: 'Maintenance', value: 5, color: '#f59e0b' },
    { name: 'Offline', value: 3, color: '#ef4444' }
  ])
  const [kpis, setKpis] = useState({
    totalResources: 142,
    activeResources: 118,
    avgUtilization: 78.4,
    capacityEfficiency: 88.2
  })

  useEffect(() => {
    if (isUploaded && activeDataset) {
      loadDatasetResources(activeDataset)
      setLoading(false)
    } else {
      fetchResourceData()
    }
  }, [isUploaded, activeDataset])

  const loadDatasetResources = (dataset) => {
    const util = dataset.utilizationData || [
      { team: 'Operations', utilization: 84 },
      { team: 'Engineering', utilization: 76 },
      { team: 'Logistics', utilization: 92 },
      { team: 'Sales', utilization: 68 },
      { team: 'Customer Support', utilization: 88 }
    ]

    setUtilizationData(util)

    const avgUtil = util.reduce((sum, u) => sum + (u.utilization || 0), 0) / Math.max(1, util.length)
    const totalOps = dataset.summary?.rows || 120

    setKpis({
      totalResources: Math.round(totalOps * 0.8),
      activeResources: Math.round(totalOps * 0.7),
      avgUtilization: Math.round(avgUtil * 10) / 10,
      capacityEfficiency: Math.round((100 - (avgUtil > 85 ? 12 : 5)) * 10) / 10
    })

    const resourceList = util.map((u, idx) => ({
      id: idx + 1,
      name: `${u.team} Infrastructure Unit ${idx + 1}`,
      department: u.team,
      utilization: u.utilization,
      status: u.utilization > 88 ? 'Overloaded' : u.utilization > 70 ? 'Optimal' : 'Underutilized',
      capacity: `${u.utilization * 15} GB/s`,
      health: u.utilization > 88 ? 'Warning' : 'Healthy'
    }))

    setResources(resourceList)
  }

  const fetchResourceData = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/resources')
      const items = response.data.resources || []
      if (items.length) {
        setResources(items)
      } else {
        loadDatasetResources({ utilizationData: [] })
      }
    } catch (error) {
      loadDatasetResources({ utilizationData: [] })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Overloaded':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'Optimal':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Underutilized':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Resource Management</h1>
          <p className="text-secondary-500 mt-1">
            {isUploaded ? `Active Dataset: ${activeDataset?.file?.name}` : 'Resource allocation, capacity planning, and utilization'}
          </p>
        </div>
        <button 
          onClick={fetchResourceData}
          className="px-4 py-2 rounded-lg border border-gray-200 text-secondary-600 hover:bg-gray-50 text-sm flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh Status
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-500">Total Infrastructure Units</p>
            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{kpis.totalResources}</h3>
          </div>
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
            <Server size={24} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-500">Active Operational</p>
            <h3 className="text-2xl font-bold text-green-600 mt-1">{kpis.activeResources}</h3>
          </div>
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-500">Avg Utilization Rate</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{kpis.avgUtilization}%</h3>
          </div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary-500">Capacity Efficiency</p>
            <h3 className="text-2xl font-bold text-secondary-900 mt-1">{kpis.capacityEfficiency}%</h3>
          </div>
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Department Resource Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" />
                <YAxis dataKey="team" type="category" stroke="#9ca3af" width={110} />
                <Tooltip />
                <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                  {utilizationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.utilization > 85 ? '#ef4444' : entry.utilization > 70 ? '#22c55e' : '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Availability Breakdown */}
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Availability Breakdown</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availabilityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {availabilityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {availabilityBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-secondary-600">{item.name}</span>
                </div>
                <span className="font-semibold text-secondary-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources Table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-secondary-900">Resource Allocation & Health</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Resource Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Utilization</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-secondary-500 uppercase">Capacity</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((res) => (
                <tr key={res.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-secondary-900">{res.name}</td>
                  <td className="px-4 py-3 text-secondary-600">{res.department}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${res.utilization > 85 ? 'bg-red-500' : 'bg-primary-500'}`}
                          style={{ width: `${Math.min(res.utilization, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-secondary-700">{res.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-600">{res.capacity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Resources