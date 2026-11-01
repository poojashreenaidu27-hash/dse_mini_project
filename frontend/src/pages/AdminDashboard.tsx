// src/pages/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import { apiGet, apiPatch, ApiResponse } from '../lib/api'
import { Complaint } from '../types'

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

  if (loading) return <div className="p-4">Loading complaints…</div>
  if (error) return <div className="p-4 text-red-600">{error}</div>

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Title</th>
            <th className="p-2 border">Category</th>
            <th className="p-2 border">Location</th>
            <th className="p-2 border">Severity</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((c) => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="p-2 border text-center">{c.id}</td>
              <td className="p-2 border">{c.title}</td>
              <td className="p-2 border">{c.category}</td>
              <td className="p-2 border">{c.location}</td>
              <td className="p-2 border text-center">{c.severity}</td>
              <td className="p-2 border">
                <select
                  value={c.status}
                  onChange={(e) => updateStatus(c.id, e.target.value)}
                  className="border rounded px-1 py-0.5"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="reopened">Reopened</option>
                </select>
              </td>
              <td className="p-2 border">
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

