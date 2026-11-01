// src/context/NotificationContext.tsx
import React, { createContext, useContext, useState } from 'react'
import { Notification } from '../components/ui/Notification'

type NotificationItem = {
  id: number
  type: 'error' | 'success' | 'info'
  message: string
}

type NotificationContextProps = {
  addNotification: (type: NotificationItem['type'], message: string) => void
  removeNotification: (id: number) => void
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const addNotification = (type: NotificationItem['type'], message: string) => {
    const id = Date.now()
    setNotifications((prev) => [...prev, { id, type, message }])
    // Auto‑remove after 5 seconds
    setTimeout(() => removeNotification(id), 5000)
  }

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {/* Render notifications in the top‑right corner */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            type={n.type}
            message={n.message}
            onClose={() => removeNotification(n.id)}
          />
        ))}
      </div>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

export default NotificationProvider

