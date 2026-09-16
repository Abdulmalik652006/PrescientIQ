import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react'
import api from '../services/api'

import { useDataset } from '../context/DatasetContext'

const Alerts = () => {
  const { activeDataset, isUploaded } = useDataset()
  const [alerts, setAlerts] = useState([])
  const [summary, setSummary] = useState({ critical: 4, high: 9, medium: 14, resolved: 36 })
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isUploaded && activeDataset) {
      loadDatasetAlerts(activeDataset)
      setLoading(false)
    } else {
      fetchAlerts()
    }
  }, [isUploaded, activeDataset])

  const loadDatasetAlerts = (dataset) => {
    const util = dataset.utilizationData || []
    const derivedAlerts = util.map((u, index) => {
      const isCritical = u.utilization > 88
      const isHigh = u.utilization > 75
      const severity = isCritical ? 'Critical' : isHigh ? 'High' : 'Medium'
      return {
        id: index + 1,
        severity,
        title: `${u.team} Utilization Variance`,
        probability: Math.min(96, Math.round(u.utilization * 0.95)),
        impact: isCritical ? 'High' : 'Medium',
        status: isCritical ? 'Open' : 'In Progress',
        team: u.team
      }
    })

    const activeList = derivedAlerts.length ? derivedAlerts : mockAlerts

    setAlerts(activeList)
    setSummary({
      critical: activeList.filter(a => a.severity === 'Critical').length,
      high: activeList.filter(a => a.severity === 'High').length,
      medium: activeList.filter(a => a.severity === 'Medium').length,
      resolved: 18
    })
  }

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/alerts')
      setAlerts(response.data.alerts || mockAlerts)
      setSummary(response.data.summary || { critical: 4, high: 9, medium: 14, resolved: 36 })
    } catch (error) {
      setAlerts(mockAlerts)
    } finally {
      setLoading(false)
    }
  }

  const mockAlerts = [
    { id: 1, severity: 'Critical', title: 'Resource Shortage', probability: 91, impact: 'High', status: 'Open', team: 'Team Alpha' },
    { id: 2, severity: 'High', title: 'Demand Spike', probability: 84, impact: 'High', status: 'Open', team: 'Team Beta' },
    { id: 3, severity: 'Medium', title: 'Team Overload', probability: 68, impact: 'Medium', status: 'Monitoring', team: 'Team Gamma' },
    { id: 4, severity: 'Critical', title: 'System Performance Degradation', probability: 87, impact: 'Critical', status: 'Open', team: 'Team Delta' },
    { id: 5, severity: 'High', title: 'Supply Chain Disruption', probability: 76, impact: 'High', status: 'In Progress', team: 'Team Alpha' }
  ]

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'bg-[#f87171]/15 text-[#f87171] border-[#f87171]/30',
      High: 'bg-[#fb923c]/15 text-[#fb923c] border-[#fb923c]/30',
      Medium: 'bg-[#facc15]/15 text-[#facc15] border-[#facc15]/30',
      Low: 'bg-[#00e599]/15 text-[#00e599] border-[#00e599]/30'
    }
    return colors[severity] || 'bg-[#162035] text-slate-300'
  }

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30',
      'In Progress': 'bg-[#facc15]/15 text-[#facc15] border border-[#facc15]/30',
      'Monitoring': 'bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30',
      'Resolved': 'bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30'
    }
    return colors[status] || 'bg-[#162035] text-slate-300'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-3 border-[#00e599] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Risk & Alerts Center</h1>
        <p className="text-slate-400 text-sm mt-1">Autonomous surveillance & neural anomaly triage</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="cyber-card p-4 text-center border-[#f87171]/30 bg-[#160d14]">
          <p className="text-2xl font-bold font-mono text-[#f87171]">{summary.critical}</p>
          <p className="text-xs font-mono text-slate-400 uppercase mt-1">Critical Threat</p>
        </div>
        <div className="cyber-card p-4 text-center border-[#fb923c]/30 bg-[#18110b]">
          <p className="text-2xl font-bold font-mono text-[#fb923c]">{summary.high}</p>
          <p className="text-xs font-mono text-slate-400 uppercase mt-1">High Priority</p>
        </div>
        <div className="cyber-card p-4 text-center border-[#facc15]/30 bg-[#18160b]">
          <p className="text-2xl font-bold font-mono text-[#facc15]">{summary.medium}</p>
          <p className="text-xs font-mono text-slate-400 uppercase mt-1">Medium Variance</p>
        </div>
        <div className="cyber-card p-4 text-center border-[#00e599]/30 bg-[#081812]">
          <p className="text-2xl font-bold font-mono text-[#00e599]">{summary.resolved}</p>
          <p className="text-xs font-mono text-slate-400 uppercase mt-1">Resolved Safe</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Table */}
        <div className="lg:col-span-2 cyber-card overflow-hidden">
          <div className="p-4 border-b border-[#162035] flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">Active Neural Alerts</h3>
            <span className="text-xs font-mono text-[#00e599]">{alerts.length} Incidents</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#080d16] border-b border-[#162035]">
                <tr>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Severity</th>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Alert Title</th>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Probability</th>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Impact</th>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-mono font-semibold text-slate-400 uppercase">Matrix Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#151c2c]">
                {alerts.map((alert) => (
                  <tr 
                    key={alert.id} 
                    className="hover:bg-[#11192b] cursor-pointer transition-colors"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[11px] font-mono font-bold rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-white">{alert.title}</td>
                    <td className="px-4 py-3 text-xs font-mono text-[#38bdf8]">{alert.probability}%</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{alert.impact}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[11px] font-mono font-medium rounded-full ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{alert.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alert Details */}
        <div className="cyber-card p-6">
          <h3 className="font-bold text-white text-sm mb-4">Neural Incident Dossier</h3>
          {selectedAlert ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 text-xs font-mono font-bold rounded-full border ${getSeverityColor(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
                <span className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded-full ${getStatusColor(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>
              <h4 className="text-base font-bold text-white">{selectedAlert.title}</h4>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="bg-[#080d16] border border-[#172238] p-3 rounded-xl">
                  <p className="text-slate-400">Probability</p>
                  <p className="font-bold text-[#38bdf8] text-sm mt-0.5">{selectedAlert.probability}%</p>
                </div>
                <div className="bg-[#080d16] border border-[#172238] p-3 rounded-xl">
                  <p className="text-slate-400">Impact</p>
                  <p className="font-bold text-white text-sm mt-0.5">{selectedAlert.impact}</p>
                </div>
                <div className="bg-[#080d16] border border-[#172238] p-3 rounded-xl">
                  <p className="text-slate-400">Matrix Unit</p>
                  <p className="font-bold text-[#00e599] text-sm mt-0.5">{selectedAlert.team}</p>
                </div>
                <div className="bg-[#080d16] border border-[#172238] p-3 rounded-xl">
                  <p className="text-slate-400">Window</p>
                  <p className="font-bold text-slate-300 text-sm mt-0.5">30 Days</p>
                </div>
              </div>
              <div className="bg-[#080d18] p-4 rounded-xl border border-[#1b2944]">
                <p className="text-xs font-mono font-bold text-[#00e599]">Prescriptive AI Action</p>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">Allocate additional neural resources to {selectedAlert.team} to avert bottleneck trajectory.</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 btn-cyber-primary text-xs py-2.5">Assign Unit</button>
                <button className="flex-1 btn-cyber-outline text-xs py-2.5">Resolve Threat</button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
              <p className="text-xs font-mono">Select an alert incident to inspect telemetry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Alerts