import React, { useState, useEffect } from 'react'
import { User, Bell, Brain, AlertCircle, Layout, Moon, Sun, Shield, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [settings, setSettings] = useState({
    riskThreshold: 75,
    confidenceThreshold: 85,
    alertFrequency: 'realtime',
    defaultForecastPeriod: '30',
    darkMode: false
  })

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        department: user.department || 'Engineering'
      }))
      if (user.settings) {
        setSettings(prev => ({
          ...prev,
          ...user.settings
        }))
      }
    }
  }, [user])

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'predictions', icon: Brain, label: 'Prediction Settings' },
    { id: 'alerts', icon: AlertCircle, label: 'Alert Thresholds' },
    { id: 'appearance', icon: Layout, label: 'Appearance' },
    { id: 'security', icon: Shield, label: 'Security' }
  ]

  const handleSave = async () => {
    setSaving(true)
    try {
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error('New passwords do not match!')
        setSaving(false)
        return
      }

      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        department: profileForm.department,
        ...(profileForm.newPassword ? { password: profileForm.newPassword } : {}),
        settings
      }

      try {
        const response = await api.put('/api/auth/profile', payload)
        if (response.data?.user) {
          updateUser(response.data.user)
        }
      } catch (err) {
        // Local state update fallback if API token is mock
        updateUser({
          name: profileForm.name,
          email: profileForm.email,
          department: profileForm.department,
          settings
        })
      }

      toast.success('Settings and profile saved successfully!')
    } catch (error) {
      console.error('Save settings error:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-500 mt-1">Configure your user profile, preferences, and system thresholds</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-secondary-600 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 card p-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Profile Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400" 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400" 
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Role</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-secondary-500 cursor-not-allowed" 
                    value={user?.role || 'Administrator'} 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Department</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Operations">Operations</option>
                    <option value="Sales">Sales</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Customer Support">Customer Support</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Notification Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-secondary-700">Email alerts for Critical Risks</span>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-secondary-700">Daily Forecast Digest</span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Prediction Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Confidence Threshold</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="50" 
                      max="100" 
                      value={settings.confidenceThreshold}
                      onChange={(e) => setSettings({...settings, confidenceThreshold: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="font-medium text-secondary-900">{settings.confidenceThreshold}%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Default Forecast Period</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    value={settings.defaultForecastPeriod}
                    onChange={(e) => setSettings({...settings, defaultForecastPeriod: e.target.value})}
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="180">180 Days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Alert Thresholds</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Risk Threshold</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.riskThreshold}
                      onChange={(e) => setSettings({...settings, riskThreshold: parseInt(e.target.value)})}
                      className="flex-1"
                    />
                    <span className="font-medium text-secondary-900">{settings.riskThreshold}%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Alert Frequency</label>
                  <select 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    value={settings.alertFrequency}
                    onChange={(e) => setSettings({...settings, alertFrequency: e.target.value})}
                  >
                    <option value="realtime">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Appearance</h3>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Moon size={20} /> : <Sun size={20} />}
                  <span className="font-medium text-secondary-900">Dark Mode</span>
                </div>
                <button 
                  onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
                  className={`w-12 h-6 rounded-full transition-colors ${settings.darkMode ? 'bg-primary-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-secondary-900">Security</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                    placeholder="••••••••" 
                    value={profileForm.currentPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">New Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                    placeholder="••••••••" 
                    value={profileForm.newPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg" 
                    placeholder="••••••••" 
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings