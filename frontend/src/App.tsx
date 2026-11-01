import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import NotificationProvider from './context/NotificationContext'

import { Header } from './components/layout/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import SubmitComplaint from './pages/SubmitComplaint'
import TrackComplaint from './pages/TrackComplaint'
import AdminDashboard from './pages/AdminDashboard'
import Analytics from './pages/Analytics'

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AdminRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  return user && user.role === 'admin' ? children : <Navigate to="/" replace />
}



function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/complaint"
              element={
                <PrivateRoute>
                  <SubmitComplaint />
                </PrivateRoute>
              }
            />
            <Route path="/track" element={<TrackComplaint />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <AdminRoute>
                  <Analytics />
                </AdminRoute>
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
