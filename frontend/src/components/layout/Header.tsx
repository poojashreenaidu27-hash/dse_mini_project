import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Button } from '../ui/Button'

export const Header: React.FC = () => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-primary border-b border-border text-primary flex items-center justify-between px-6 py-3">
      <Link to="/" className="flex items-center space-x-2">
        {/* Simple logo placeholder */}
        <div className="w-8 h-8 bg-primary-hover rounded-full" />
        <span className="text-xl font-bold text-lavender">CampusFix</span>
      </Link>
      <nav className="space-x-4 hidden md:flex">
        {user && (
          <>
            <Link to="/complaint" className="hover:underline text-primary">
              Submit Complaint
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="hover:underline text-primary">
                Admin Dashboard
              </Link>
            )}
            <Button onClick={logout} className="bg-secondary hover:bg-secondary hover:text-white">
              Logout
            </Button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" className="hover:underline text-primary">
              Sign In
            </Link>
            <Link to="/register" className="hover:underline text-primary">
              Register
            </Link>
          </>
        )}
      </nav>
      {/* Mobile menu toggle could be added later */}
    </header>
  )
}

export default Header

