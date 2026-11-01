// src/components/ui/Button.tsx
import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Additional class names – component already adds base styling */
  className?: string
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', ...rest }) => {
  const base =
    'px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const combined = `${base} ${className}`
  return (
    <button className={combined} {...rest}>
      {children}
    </button>
  )
}

export default Button

