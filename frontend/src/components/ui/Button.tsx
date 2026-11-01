// src/components/ui/Button.tsx
import React from 'react'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Additional class names – component already adds base styling */
  className?: string
  /** Render as a different element (e.g., Link) */
  as?: React.ElementType
  /** Props for the rendered element when using `as` */
  asProps?: Record<string, any>
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', as: Component = 'button', asProps = {}, ...rest }) => {
  const base =
    'px-4 py-2 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  const combined = `${base} ${className}`
  return (
    <Component className={combined} {...asProps} {...rest}>
      {children}
    </Component>
  )
}

export default Button


