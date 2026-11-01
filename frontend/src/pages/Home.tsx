// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'

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
            <Button as={Link} to="/complaint" className="bg-blue-600 text-white hover:bg-blue-700">
              Submit Complaint
            </Button>
            {user.role === 'admin' && (
              <Button as={Link} to="/admin" className="bg-green-600 text-white hover:bg-green-700">
                Admin Dashboard
              </Button>
            )}
            <Button onClick={logout} className="bg-gray-600 text-white hover:bg-gray-700">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button as={Link} to="/login" className="bg-blue-600 text-white hover:bg-blue-700">
              Login
            </Button>
            <Button as={Link} to="/register" className="bg-indigo-600 text-white hover:bg-indigo-700">
              Register
            </Button>
          </>
        )}
        <Button as={Link} to="/track" className="bg-teal-600 text-white hover:bg-teal-700">
          Track Complaint (anonymous)
        </Button>
      </div>
    </div>
  )
}

export default Home

