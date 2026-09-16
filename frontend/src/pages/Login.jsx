import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [department, setDepartment] = useState('Operations')
  const [searchParams] = useSearchParams()
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        await register({ name, email, password, department })
        toast.success('Account created successfully!')
        navigate('/dashboard')
      } else {
        await login(email, password)
        toast.success('Welcome to PrescientIQ!')
        navigate('/dashboard')
      }
    } catch (error) {
      const errData = error.response?.data
      const errorMsg = errData?.errors?.[0]?.message || errData?.message || 'Authentication failed. Please check your credentials.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080c14] text-slate-100 p-4 relative overflow-hidden">
      {/* Background Cyber Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00e599 1px, transparent 1px), linear-gradient(to right, #00e599 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#00e599]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#0c121e]/90 border border-[#1b253b] rounded-3xl shadow-2xl p-8 backdrop-blur-xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#00e599] via-[#059669] to-[#047857] rounded-2xl flex items-center justify-center shadow-xl shadow-[#00e599]/20">
              <img src="/prescient-logo.svg" alt="PrescientIQ logo" className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-center text-white tracking-tight">
            Prescient<span className="text-[#00e599]">IQ</span>
          </h2>
          <p className="text-center text-[10px] font-mono font-bold text-[#00e599] uppercase tracking-widest mt-1">
            Autonomous Predictive Intelligence
          </p>
          <p className="text-center text-slate-400 text-xs mt-3">
            {isSignUp ? 'Create your neural workspace credentials' : 'Sign in to access your intelligence command center'}
          </p>
          
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">FULL NAME</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-4 py-2.5 bg-[#080d16] border border-[#182338] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/30" 
                  placeholder="e.g. Abdul Malik B J" 
                  required 
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#080d16] border border-[#182338] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/30"
                  placeholder="commander@enterprise.ai"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono font-medium text-slate-300 mb-1.5">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 bg-[#080d16] border border-[#182338] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00e599] focus:ring-1 focus:ring-[#00e599]/30"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-cyber-primary py-3 text-sm mt-2 flex items-center justify-center font-bold"
            >
              {loading ? (isSignUp ? 'Initializing Neural Account...' : 'Authenticating...') : (isSignUp ? 'Create Commander Account' : 'Access Command Center')}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            {isSignUp ? 'Already have credentials?' : 'Need access?'}{' '}
            <button 
              type="button" 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-[#00e599] font-semibold hover:underline ml-1"
            >
              {isSignUp ? 'Sign in' : 'Create new account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login