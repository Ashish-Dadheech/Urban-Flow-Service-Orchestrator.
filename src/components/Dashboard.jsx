import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useAlert } from '../context/AlertContext'
import VehicleDashboard from './VehicleDashboard'
import ReportIncident from './ReportIncident'
import './Dashboard.css'

function StatCard({ title, value, color }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    activeVehicles: 0,
    openIncidents: 0,
  })
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { alertLevel } = useAlert()

  const fetchStats = async () => {
    try {
      const vehiclesRes = await axios.get('http://localhost:5000/vehicles')
      const incidentsRes = await axios.get('http://localhost:5000/incidents')

      const activeVehicles = vehiclesRes.data.filter(v => v.status === 'Active').length
      const openIncidents = incidentsRes.data.filter(i => i.status === 'Open').length

      setStats({
        totalVehicles: vehiclesRes.data.length,
        activeVehicles,
        openIncidents,
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [refreshTrigger])

  const handleIncidentReported = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const alertColors = {
    Green: '#10b981',
    Yellow: '#f59e0b',
    Red: '#ef4444',
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col">
        <div className="text-xl font-bold mb-6">Urban Flow</div>
        <nav className="flex-1">
          <ul>
            <li className="mb-2">
              <a className="block px-3 py-2 rounded bg-slate-800">Dashboard</a>
            </li>
            <li className="mb-2">
              <a className="block px-3 py-2 rounded hover:bg-slate-800">Services</a>
            </li>
            <li className="mb-2">
              <a className="block px-3 py-2 rounded hover:bg-slate-800">Analytics</a>
            </li>
            <li className="mb-2">
              <a className="block px-3 py-2 rounded hover:bg-slate-800">Settings</a>
            </li>
          </ul>
        </nav>
        <div className="text-sm text-slate-400">© 2025 Urban Flow</div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900">Service Orchestration Dashboard</h2>
            <p className="text-sm text-slate-500">Manage vehicles and incidents in real-time</p>
          </div>
          <div 
            className="flex items-center gap-3 px-4 py-2 rounded-lg"
            style={{ backgroundColor: alertColors[alertLevel] }}
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-semibold">Alert Level: {alertLevel}</span>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-3 gap-4 mb-8">
          <StatCard title="Total Vehicles" value={stats.totalVehicles} color="blue" />
          <StatCard title="Active Vehicles" value={stats.activeVehicles} color="green" />
          <StatCard title="Open Incidents" value={stats.openIncidents} color="red" />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Vehicle Dashboard - Takes 2 columns */}
          <div className="col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
              <VehicleDashboard key={refreshTrigger} onDataChange={() => setRefreshTrigger(prev => prev + 1)} />
            </div>
          </div>

          {/* Report Incident Form - Takes 1 column */}
          <div className="col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
              <ReportIncident onIncidentReported={handleIncidentReported} refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
