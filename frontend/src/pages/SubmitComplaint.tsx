// src/pages/SubmitComplaint.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { apiPost, ApiResponse } from '../lib/api'
import { ComplaintCreate, Complaint } from '../types'

// Static options – keep in sync with backend enum values.
const categories = [
  'Wi-Fi and network connectivity',
  'Computer laboratory equipment',
  'Electrical issues',
  'Plumbing and water supply',
  'Projectors and classroom equipment',
  'Furniture and infrastructure',
  'Cleanliness and sanitation',
  'Other maintenance issues',
]

const locations = [
  'Computer Lab',
  'Electronics Lab',
  'Library',
  'Classroom Block A',
  'Classroom Block B',
  'Auditorium',
  'Administrative Block',
  'Cafeteria',
  'Campus Common Area',
]

const schema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string().refine((val) => categories.includes(val), {
    message: 'Invalid category',
  }),
  location: z.string().refine((val) => locations.includes(val), {
    message: 'Invalid location',
  }),
  severity: z.coerce.number().int().min(1).max(5).refine((v) => Number.isInteger(v), {
    message: 'Severity must be an integer between 1 and 5',
  }),
})

type FormData = z.infer<typeof schema>

function SubmitComplaint() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const payload: ComplaintCreate = {
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      severity: data.severity,
    }
    try {
      const res: ApiResponse<Complaint> = await apiPost<Complaint, typeof payload>(
        '/api/v1/complaints/identified',
        payload
      )
      if (res.error) throw new Error(res.error)
      const comp = res.data
      alert(`Complaint submitted!\nID: ${comp.id}\nTracking token: ${comp.tracking_token}`)
      // After a successful submit, redirect to home or tracking page.
      navigate('/')
    } catch (e: any) {
      alert(e.message || 'Failed to submit complaint')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xl bg-white p-6 rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Submit a Complaint</h2>
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            {...register('title')}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>
        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
          )}
        </div>
        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="location">
            Location
          </label>
          <select
            id="location"
            {...register('location')}
            className="w-full border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a location</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          {errors.location && (
            <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
          )}
        </div>
        {/* Severity */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="severity">
            Severity (1‑5)
          </label>
          <input
            id="severity"
            type="number"
            min={1}
            max={5}
            {...register('severity', { valueAsNumber: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.severity && (
            <p className="text-red-600 text-sm mt-1">{errors.severity.message}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {isSubmitting ? 'Submitting…' : 'Submit Complaint'}
        </Button>
      </form>
    </div>
  )
}

export default SubmitComplaint

