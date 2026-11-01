import React from 'react';

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & { as?: React.ElementType };

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ as: Component = 'button', ...props }, ref) {
  return <Component ref={ref} {...props} />;
});

export default Button;

