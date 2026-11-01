// src/components/layout/Header.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-gray-800 text-white py-3 px-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        CampusFix
      </Link>
      <nav className="space-x-4">
        {user ? (
          <>
            <Link to="/complaint" className="hover:underline">
              Submit Complaint
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:underline">
                Admin Dashboard
              </Link>
            )}
            <Button onClick={logout} className="bg-gray-600 hover:bg-gray-700">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header

