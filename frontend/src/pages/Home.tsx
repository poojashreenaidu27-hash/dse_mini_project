// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-6">CampusFix</h1>
      <p className="text-lg mb-8 text-center max-w-xl">
        Report maintenance issues, track them anonymously or as a logged‑in user, and let administrators manage the workflow.
      </p>
      <div className="flex flex-col gap-4 md:flex-row">
        {user ? (
          <>
            <Link
              to="/complaint"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Submit Complaint
            </Link>
            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Register
            </Link>
          </>
        )}
        <Link
          to="/track"
          className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
        >
          Track Complaint (anonymous)
        </Link>
      </div>
    </div>
  )
}

export default Home

