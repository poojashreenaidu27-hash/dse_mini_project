// src/pages/TrackComplaint.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'

import { apiGet } from '../lib/api';
import type { ApiResponse } from '../lib/api'
import type { TrackingInfo } from '../types'

const schema = z.object({
  complaintId: z.string().min(1, { message: 'Complaint ID is required' }),
  token: z.string().min(1, { message: 'Tracking token is required' }),
})

type FormData = z.infer<typeof schema>

function TrackComplaint() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const [tracking, setTracking] = useState<TrackingInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const onSubmit = async (data: FormData) => {
    setErrorMsg('')
    setTracking(null)
    try {
      // Backend endpoint: GET /api/v1/track/{id}?token=...
      const url = `/api/v1/track/${encodeURIComponent(data.complaintId)}?token=${encodeURIComponent(
        data.token
      )}`
      const res: ApiResponse<TrackingInfo> = await apiGet<TrackingInfo>(url)
      if (res.error) throw new Error(res.error)
      setTracking(res.data)
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to fetch tracking info')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-md bg-white p-6 rounded shadow mb-6"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Track a Complaint</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="complaintId">
            Complaint ID
          </label>
          <input
            id="complaintId"
            type="text"
            {...register('complaintId')}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.complaintId && (
            <p className="text-red-600 text-sm mt-1">{errors.complaintId.message}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="token">
            Tracking Token
          </label>
          <input
            id="token"
            type="text"
            {...register('token')}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.token && (
            <p className="text-red-600 text-sm mt-1">{errors.token.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
        >
          {isSubmitting ? 'Checking…' : 'Check Status'}
        </button>
      </form>

      {errorMsg && <p className="text-red-600 mb-4">{errorMsg}</p>}

      {tracking && (
        <div className="w-full max-w-xl bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">Complaint Details</h3>
          <p>
            <strong>Title:</strong> {tracking.complaint.title}
          </p>
          <p>
            <strong>Status:</strong> {tracking.complaint.status}
          </p>
          <p>
            <strong>Submitted at:</strong> {new Date(tracking.complaint.submitted_at).toLocaleString()}
          </p>
          {tracking.complaint.resolution_estimate && (
            <p>
              <strong>Estimated resolution (days):</strong>{' '}
              {tracking.complaint.resolution_estimate}
            </p>
          )}
          <h4 className="mt-4 font-medium">Public Notes</h4>
          <ul className="list-disc list-inside">
            {tracking.public_notes.map((note, i) => (
              <li key={i}>{note}</li>
            ))}
          </ul>
          <h4 className="mt-4 font-medium">Status History</h4>
          <ul className="list-disc list-inside">
            {tracking.status_history.map((entry, i) => (
              <li key={i}>
                [{new Date(entry.timestamp).toLocaleString()}] {entry.status}
                {entry.note ? ` – ${entry.note}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default TrackComplaint

