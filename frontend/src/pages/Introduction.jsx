import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, LogIn, UserPlus } from 'lucide-react'

const Introduction = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#00e599 1px, transparent 1px), linear-gradient(to right, #00e599 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00e599]/10 rounded-full blur-3xl pointer-events-none" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <img src="/prescient-logo.svg" alt="PrescientIQ logo" className="w-10 h-10" />
          <span className="text-lg font-extrabold tracking-tight text-white">Prescient<span className="text-[#00e599]">IQ</span></span>
        </div>
      </header>

      <main className="max-w-4xl w-full min-h-[calc(100vh-96px)] mx-auto px-6 pb-16 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="flex justify-center mb-7">
          <img src="/prescient-logo.svg" alt="PrescientIQ logo" className="w-28 h-28 md:w-36 md:h-36 animate-pulse-glow" />
        </div>
        <p className="text-xs font-mono font-bold text-[#00e599] uppercase tracking-[0.28em]">Welcome to PrescientIQ</p>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-4 tracking-tight">Turn tomorrow uncertainty into an advantage today.</h1>
        <p className="text-slate-400 mt-5 mx-auto max-w-2xl text-base md:text-lg leading-relaxed">PrescientIQ turns your operational data into clear forecasts, early risk signals, and practical decisions, all in one intelligent workspace.</p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate('/login?signup=true')} className="btn-cyber-primary px-7 py-3.5 text-sm">
            <UserPlus size={17} />
            Get started
            <ArrowRight size={16} />
          </button>
          <button onClick={() => navigate('/login')} className="btn-cyber-outline px-7 py-3.5 text-sm">
            <LogIn size={17} />
            Sign in
          </button>
        </div>
        <p className="mt-8 text-xs text-slate-500">Already have an account? <button onClick={() => navigate('/login')} className="text-[#00e599] hover:underline">Sign in here</button></p>
      </main>
    </div>
  )
}

export default Introduction