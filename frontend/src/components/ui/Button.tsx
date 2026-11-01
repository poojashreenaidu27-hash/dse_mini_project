import React from 'react';

// Simple polymorphic button that can render as any element (e.g., <button>, <Link>, <a>)
// Props are passed through to the underlying component.
// Using `any` for props and ref keeps the usage pragmatic without TypeScript rigidity.

type ButtonProps = {
  as?: React.ElementType;
  // Allow any additional props (className, onClick, to, href, etc.)
  [key: string]: any;
};

export const Button = React.forwardRef<any, ButtonProps>(function Button({ as: Component = 'button', ...props }, ref) {
  return <Component ref={ref} {...props} />;
});

export default Button;
