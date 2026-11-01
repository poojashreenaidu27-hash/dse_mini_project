// src/components/ui/Badge.tsx
import React from 'react'

type BadgeProps = {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  className?: string
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white',
  secondary: 'bg-gray-600 text-white',
  success: 'bg-green-600 text-white',
  danger: 'bg-red-600 text-white',
  warning: 'bg-yellow-600 text-white',
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'primary', className = '' }) => {
  const base = 'px-2 py-1 rounded text-xs font-medium'
  return (
    <span className={`${base} ${variantClasses[variant]} ${className}`}>{children}</span>
  )
}

export default Badge

