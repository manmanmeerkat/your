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
    default: '',
    primary: 'bg-[#c96a5d] hover:bg-[#b85e52] text-white',
    outline: 'bg-transparent border border-[#c96a5d] text-[#c96a5d]',
    ghost: 'bg-transparent hover:bg-white/10',
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
