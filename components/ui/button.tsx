import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
};

export function Button({
  children,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg',
  };

  const variantClasses = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100',
    ghost: 'bg-transparent hover:bg-gray-100',
  };

  return (
    <button
      className={`font-medium rounded transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
