// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import { apiGet, apiPatch } from '../lib/api';
import type { ApiResponse } from '../lib/api';
import type { Complaint } from '../types';

function AdminDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const res: ApiResponse<Complaint[]> = await apiGet<Complaint[]>('/api/v1/admin/complaints')
      if (res.error) throw new Error(res.error)
      setComplaints(res.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load complaints')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComplaints()
  }, [])

  const updateStatus = async (id: number, status: string) => {
    try {
      const payload = { status }
      const res: ApiResponse<Complaint> = await apiPatch<Complaint, typeof payload>(`/api/v1/admin/complaints/${id}`, payload)
      if (res.error) throw new Error(res.error)
      // Update local state
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: res.data.status } : c))
      )
    } catch (e: any) {
      alert(e.message || 'Failed to update status')
    }
  }

  if (loading) return <div className="p-4 text-textPrimary">Loading complaints…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="p-4 bg-primary min-h-screen text-textPrimary">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <table className="min-w-full bg-card border border-border">
        <thead className="bg-surface">
          <tr>
            <th className="p-2 border border-border">ID</th>
            <th className="p-2 border border-border">Title</th>
            <th className="p-2 border border-border">Category</th>
            <th className="p-2 border border-border">Location</th>
            <th className="p-2 border border-border">Severity</th>
            <th className="p-2 border border-border">Status</th>
            <th className="p-2 border border-border">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="hover:bg-surface">
              <td className="p-2 border border-border text-center">{c.id}</td>
              <td className="p-2 border border-border text-textPrimary">{c.title}</td>
              <td className="p-2 border border-border text-textPrimary">{c.category}</td>
              <td className="p-2 border border-border text-textPrimary">{c.location}</td>
              <td className="p-2 border border-border text-center text-textPrimary">{c.severity}</td>
              <td className="p-2 border border-border">
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="border rounded px-1 py-0.5 bg-primary text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="reopened">Reopened</option>
                </select>
              </td>
              <td className="p-2 border border-border text-textPrimary">
                {new Date(c.submitted_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminDashboard
