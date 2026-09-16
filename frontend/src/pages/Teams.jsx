import React, { useState, useEffect } from 'react'
import { Users, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'

import { useDataset } from '../context/DatasetContext'

const Teams = () => {
  const { activeDataset, isUploaded } = useDataset()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isUploaded && activeDataset) {
      loadDatasetTeams(activeDataset)
      setLoading(false)
    } else {
      fetchTeams()
    }
  }, [isUploaded, activeDataset])

  const loadDatasetTeams = (dataset) => {
    const util = dataset.utilizationData || []
    const derivedTeams = util.map((u, i) => {
      const perf = Math.min(98, Math.max(65, Math.round(100 - (u.utilization > 85 ? (u.utilization - 80) * 1.5 : (80 - u.utilization) * 0.4))))
      const risk = u.utilization > 88 ? 'High' : u.utilization > 75 ? 'Medium' : 'Low'
      return {
        id: i + 1,
        name: u.team,
        performance: perf,
        utilization: u.utilization,
        risk,
        members: Math.round(u.utilization * 0.15) + 5,
        tasks: Math.round(u.utilization * 0.5) + 10,
        efficiency: Math.min(96, Math.round(perf * 0.95))
      }
    })

    const activeList = derivedTeams.length ? derivedTeams : mockTeams
    setTeams(activeList)
    setSelectedTeam(activeList[0])
  }

  const fetchTeams = async () => {
    try {
      const response = await api.get('/api/teams')
      const items = Array.isArray(response.data.items) ? response.data.items : []
      setTeams(items.length ? items.map((team) => ({
        ...team,
        id: team._id,
        risk: team.riskLevel,
        members: team.memberCount,
        tasks: team.workload,
      })) : mockTeams)
    } catch (error) {
      setTeams(mockTeams)
    } finally {
      setLoading(false)
    }
  }

  const mockTeams = [
    { id: 1, name: 'Team Alpha', performance: 94, utilization: 82, risk: 'Low', members: 12, tasks: 45, efficiency: 88 },
    { id: 2, name: 'Team Beta', performance: 87, utilization: 91, risk: 'Medium', members: 8, tasks: 38, efficiency: 76 },
    { id: 3, name: 'Team Gamma', performance: 72, utilization: 97, risk: 'High', members: 10, tasks: 52, efficiency: 65 },
    { id: 4, name: 'Team Delta', performance: 81, utilization: 64, risk: 'Low', members: 15, tasks: 40, efficiency: 79 }
  ]

  const getRiskColor = (risk) => {
    const colors = {
      'Low': 'bg-primary-100 text-primary-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'High': 'bg-red-100 text-red-700'
    }
    return colors[risk] || 'bg-gray-100 text-gray-700'
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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Team Intelligence</h1>
        <p className="text-secondary-500 mt-1">Monitor team performance and predictions</p>
      </div>

      {/* Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <div 
            key={team.id} 
            className="card p-4 cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedTeam(team)}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-secondary-900">{team.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskColor(team.risk)}`}>
                {team.risk}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-secondary-500">Performance</p>
                <p className={`font-bold ${team.performance > 80 ? 'text-primary-600' : 'text-red-600'}`}>
                  {team.performance}%
                </p>
              </div>
              <div>
                <p className="text-secondary-500">Utilization</p>
                <p className={`font-bold ${team.utilization < 85 ? 'text-primary-600' : 'text-red-600'}`}>
                  {team.utilization}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparison Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Team Comparison</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teams}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip />
                <Legend />
                <Bar dataKey="performance" fill="#22c55e" radius={[4, 4, 0, 0]} name="Performance" />
                <Bar dataKey="efficiency" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Efficiency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Details */}
        <div className="card p-6">
          <h3 className="font-semibold text-secondary-900 mb-4">Team Details</h3>
          {selectedTeam ? (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-secondary-900">{selectedTeam.name}</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-secondary-500">Performance</p>
                  <p className="font-bold text-secondary-900">{selectedTeam.performance}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-secondary-500">Utilization</p>
                  <p className="font-bold text-secondary-900">{selectedTeam.utilization}%</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-secondary-500">Members</p>
                  <p className="font-bold text-secondary-900">{selectedTeam.members}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-secondary-500">Tasks</p>
                  <p className="font-bold text-secondary-900">{selectedTeam.tasks}</p>
                </div>
              </div>
              <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                <p className="text-sm font-medium text-primary-700">Prediction</p>
                <p className="text-sm text-secondary-600 mt-1">
                  Expected performance: {selectedTeam.performance - 4}% | 
                  Risk probability: {selectedTeam.risk === 'Low' ? '25%' : selectedTeam.risk === 'Medium' ? '55%' : '78%'}
                </p>
                <p className="text-sm text-secondary-600 mt-1">
                  Recommended: {selectedTeam.risk === 'High' ? 'Add 2 resources' : 
                                 selectedTeam.risk === 'Medium' ? 'Monitor workload' : 
                                 'Maintain current resources'}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-secondary-400">
              <Users size={32} className="mx-auto mb-2" />
              <p>Select a team to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Teams