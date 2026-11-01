// src/components/ui/Notification.tsx
import React from 'react'

type NotificationProps = {
  /** 'error' | 'success' | 'info' */
  type?: 'error' | 'success' | 'info'
  message: string
  /** Optional close handler */
  onClose?: () => void
}

export const Notification: React.FC<NotificationProps> = ({ type = 'info', message, onClose }) => {
  const base = 'p-3 rounded mb-4 flex items-center justify-between'
  const variantClasses: Record<string, string> = {
    error: 'bg-red-100 text-red-800 border border-red-300',
    success: 'bg-green-100 text-green-800 border border-green-300',
    info: 'bg-blue-100 text-blue-800 border border-blue-300',
  }
  return (
    <div className={`${base} ${variantClasses[type]}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-sm underline hover:text-gray-600"
        >
          Close
        </button>
      )}
    </div>
  )
}

export default Notification

