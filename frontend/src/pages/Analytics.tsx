// src/pages/Analytics.tsx
import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { AnalyticsSummary } from '../types';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'

function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const res: ApiResponse<AnalyticsSummary> = await apiGet<AnalyticsSummary>('/api/v1/analytics/summary')
      if (res.error) throw new Error(res.error)
      setData(res.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) return <div className="p-4">Loading analytics…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>
  if (!data) return null

  const topCategories = data.top_categories.map((c) => ({ name: c.category, count: c.count }))
  const topLocations = data.top_locations.map((l) => ({ name: l.location, count: l.count }))

  // For a simple time‑series we can reuse the same summary data if the backend provides it.
  // Here we just mock a placeholder series – replace with real data when available.
  const timeline = [
    { day: 'Mon', count: 5 },
    { day: 'Tue', count: 8 },
    { day: 'Wed', count: 6 },
    { day: 'Thu', count: 10 },
    { day: 'Fri', count: 7 },
    { day: 'Sat', count: 3 },
    { day: 'Sun', count: 4 },
  ]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary cards */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium">Total Complaints</h3>
          <p className="text-3xl font-semibold">{data.total_complaints}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium">Open</h3>
          <p className="text-3xl font-semibold">{data.open}</p>
        </div>
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-medium">Resolved</h3>
          <p className="text-3xl font-semibold">{data.resolved}</p>
        </div>
        <div className="bg-white rounded shadow p-4 md:col-span-2 lg:col-span-1">
          <h3 className="font-medium mb-2">Average Resolution Time (days)</h3>
          <p className="text-2xl">{data.avg_resolution_time_days.toFixed(1)}</p>
        </div>
      </div>

      {/* Top categories bar chart */}
      <div className="mt-8 bg-white rounded shadow p-4">
        <h3 className="font-medium mb-4">Top Categories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topCategories} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top locations bar chart */}
      <div className="mt-8 bg-white rounded shadow p-4">
        <h3 className="font-medium mb-4">Top Locations</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topLocations} layout="vertical" margin={{ left: 40, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Complaints" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Simple weekly timeline line chart (placeholder) */}
      <div className="mt-8 bg-white rounded shadow p-4">
        <h3 className="font-medium mb-4">Complaints Over the Last Week</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeline} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#f59e0b" name="Complaints" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Analytics

