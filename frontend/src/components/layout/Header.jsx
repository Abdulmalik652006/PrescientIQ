import React, { useState, useRef, useEffect } from 'react'
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  LogOut, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Sparkles,
  Command,
  Activity,
  Cpu
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDataset } from '../../context/DatasetContext'
import { useNavigate } from 'react-router-dom'

const initialNotifications = [
  {
    id: 1,
    title: 'High Risk Alert: Engineering Matrix',
    message: 'Workload utilization reached 94%. Risk of sprint bottleneck.',
    time: '5m ago',
    type: 'alert',
    link: '/alerts',
    read: false
  },
  {
    id: 2,
    title: 'Neural Forecast Model Converged',
    message: 'DeepAR v4.2 updated (+18.4% projected growth trajectory).',
    time: '25m ago',
    type: 'forecast',
    link: '/forecasts',
    read: false
  },
  {
    id: 3,
    title: 'Executive Telemetry Synthesis Ready',
    message: 'Autonomous synthesis evaluated 412 variables in dataset matrix.',
    time: '1h ago',
    type: 'report',
    link: '/reports',
    read: false
  },
  {
    id: 4,
    title: 'Cluster Load Spike Detected',
    message: 'eu-west-2 load spiked to 84% capacity threshold.',
    time: '3h ago',
    type: 'alert',
    link: '/resources',
    read: false
  }
]

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { activeDataset } = useDataset()
  const navigate = useNavigate()

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const dropdownRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // If a new dataset is active, dynamically ensure a notification is present
  useEffect(() => {
    if (activeDataset?.file?.name) {
      setNotifications(prev => {
        const datasetNotifId = 999
        if (prev.some(n => n.id === datasetNotifId)) return prev
        return [
          {
            id: datasetNotifId,
            title: 'Neural Pipeline Active',
            message: `Vectorized: ${activeDataset.file.name} (${activeDataset.summary?.rows || 8523} rows).`,
            time: 'Just now',
            type: 'ai',
            link: '/dashboard',
            read: false
          },
          ...prev
        ]
      })
    }
  }, [activeDataset])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const markAsRead = (id, e) => {
    e?.stopPropagation()
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id)
    setNotificationsOpen(false)
    if (notification.link) {
      navigate(notification.link)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="text-amber-400" size={15} />
      case 'forecast':
        return <TrendingUp className="text-[#38bdf8]" size={15} />
      case 'report':
        return <FileText className="text-[#00e599]" size={15} />
      case 'ai':
      default:
        return <Sparkles className="text-purple-400" size={15} />
    }
  }

  return (
    <header className="bg-[#080c14] border-b border-[#151c2c] px-4 md:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-[#0f1523] border border-[#1b253b] text-slate-400 hover:text-white transition-colors"
          title="Toggle Navigation"
        >
          <Menu size={18} />
        </button>
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-slate-500" size={16} />
          <input 
            type="text" 
            placeholder="Search dashboard, metrics, reports..." 
            className="pl-9 pr-12 py-2 bg-[#0d1320] border border-[#1b253b] rounded-xl text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/30 w-64 md:w-80 transition-all"
          />
          <div className="absolute right-2.5 px-1.5 py-0.5 rounded-md bg-[#162035] border border-[#23314d] text-[10px] font-mono font-semibold text-slate-400">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Telemetry and Actions */}
      <div className="flex items-center gap-3">
        {/* Live Engine Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d1424] border border-[#1b2742]">
          <span className="w-2 h-2 rounded-full bg-[#00e599] animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-300">
            AI Engine Live <span className="text-slate-500">•</span> <span className="text-[#00e599]">v4.2</span>
          </span>
        </div>

        {/* Notification Bell with Popover Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors relative border ${
              notificationsOpen 
                ? 'bg-[#162238] border-[#00e599] text-[#00e599]' 
                : 'bg-[#0f1523] border-[#1b253b] text-slate-400 hover:text-slate-200 hover:border-[#2a3857]'
            }`}
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#00e599] text-[#042416] text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-md shadow-[#00e599]/30">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c121e] rounded-2xl shadow-2xl border border-[#1e293f] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-3 border-b border-[#1a2337] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  {unreadCount > 0 ? (
                    <span className="bg-[#00e599]/15 text-[#00e599] border border-[#00e599]/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      {unreadCount} NEW
                    </span>
                  ) : (
                    <span className="bg-[#162035] text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      ALL READ
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-xs text-[#00e599] hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#151c2c]">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`px-4 py-3 hover:bg-[#121929] cursor-pointer transition-colors flex items-start gap-3 relative ${
                        !notif.read ? 'bg-[#0e1626]' : ''
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[#141d2f] border border-[#1e2b46] flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read && (
                        <span 
                          title="Mark as read"
                          onClick={(e) => markAsRead(notif.id, e)}
                          className="w-2 h-2 rounded-full bg-[#00e599] flex-shrink-0 mt-2 hover:scale-150 transition-transform"
                        />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500">
                    <Bell className="mx-auto mb-2 opacity-30" size={28} />
                    <p className="text-sm font-medium text-slate-400">No notifications</p>
                    <p className="text-xs text-slate-600 mt-1">You're all caught up!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 border-t border-[#1a2337] flex items-center justify-between bg-[#0a0f1a] rounded-b-2xl">
                <button 
                  onClick={() => {
                    setNotificationsOpen(false)
                    navigate('/alerts')
                  }}
                  className="text-xs font-medium text-[#00e599] hover:underline"
                >
                  View Alerts Center &rarr;
                </button>
                {notifications.length > 0 && (
                  <button 
                    onClick={clearAllNotifications}
                    className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={13} />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLogout}
            className="p-2 rounded-xl bg-[#0f1523] border border-[#1b253b] text-slate-400 hover:text-red-400 hover:border-red-900/40 transition-colors"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header