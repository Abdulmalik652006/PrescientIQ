import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import Predict from './pages/Predict'
import Alerts from './pages/Alerts'
import Resources from './pages/Resources'
import Forecasts from './pages/Forecasts'
import Teams from './pages/Teams'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Introduction from './pages/Introduction'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './context/AuthContext'

import { DatasetProvider } from './context/DatasetContext'

const RootRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!user) {
    return location.pathname === '/' ? <Introduction /> : <Navigate to="/" replace />
  }
  return <Layout />
}

function App() {
  return (
    <AuthProvider>
      <DatasetProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/introduction" element={<Introduction />} />
            <Route path="/" element={<RootRoute />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="predict" element={<Predict />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="resources" element={<Resources />} />
              <Route path="forecasts" element={<Forecasts />} />
              <Route path="teams" element={<Teams />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </DatasetProvider>
    </AuthProvider>
  )
}

export default App