import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "outline" | "ghost";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      size = "md",
      variant = "default",
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "py-1 px-2 text-sm",
      md: "py-2 px-4",
      lg: "py-3 px-6 text-lg",
    } as const;

    const variantClasses = {
      default: "",
      primary: "bg-[#c96a5d] hover:bg-[#b85e52] text-white",
      outline: "bg-transparent border border-[#c96a5d] text-[#c96a5d]",
      ghost: "bg-transparent hover:bg-white/10",
    } as const;

    return (
      <button
        ref={ref}
        className={`font-medium rounded transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
