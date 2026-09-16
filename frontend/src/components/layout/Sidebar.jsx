import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BarChart3, 
  Brain, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Users, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Activity,
  Shield
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'

const menuItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/predict', icon: Brain, label: 'Predict' },
  { path: '/alerts', icon: AlertTriangle, label: 'Alerts' },
  { path: '/resources', icon: Package, label: 'Resources' },
  { path: '/forecasts', icon: TrendingUp, label: 'Forecasts' },
  { path: '/teams', icon: Users, label: 'Teams' },
  { path: '/reports', icon: FileText, label: 'Reports' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

const Sidebar = ({ open, setOpen }) => {
  const { user } = useAuth()
  return (
    <aside className={`${open ? 'w-64' : 'w-20'} bg-[#0a0e17] border-r border-[#151c2c] flex flex-col transition-all duration-300 select-none z-40`}>
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#151c2c]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-[#00e599]/20 overflow-hidden">
            <img src="/prescient-logo.svg" alt="PrescientIQ logo" className="w-full h-full" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white leading-none">
                Prescient<span className="text-[#00e599]">IQ</span>
              </span>
              <span className="text-[8.5px] font-bold tracking-widest text-[#00e599]/90 uppercase font-mono mt-1">
                Neural Engine
              </span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg hover:bg-[#131b2c] text-slate-400 hover:text-slate-200 transition-colors"
          title={open ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {open ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-dark-item ${isActive ? 'sidebar-dark-item-active' : ''} ${!open && 'justify-center px-0'}`
            }
          >
            <item.icon size={18} className="flex-shrink-0" />
            {open && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card at Bottom */}
      <div className="p-3 border-t border-[#151c2c]">
        <div className={`flex items-center justify-between p-2.5 rounded-xl bg-[#0f1524] border border-[#1b253b] ${!open && 'justify-center p-2'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#00e599] ring-2 ring-[#0a0e17]" />
            {open && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Abdul Malik B J'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[9px] font-mono font-bold text-[#00e599] tracking-wider uppercase">
                    {user?.role || 'VIEWER'}
                  </span>
                </div>
              </div>
            )}
          </div>
          {open && (
            <button className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#182136] transition-colors">
              <MoreVertical size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar