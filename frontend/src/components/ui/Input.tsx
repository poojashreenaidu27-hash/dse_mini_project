// src/components/ui/Input.tsx
import React from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  className?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...rest }) => {
  const inputCls =
    'w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1" htmlFor={rest.id as string}>
          {label}
        </label>
      )}
      <input className={inputCls} {...rest} />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default Input

