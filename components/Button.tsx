import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = "rounded-xl font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-rose-500 text-white shadow-lg shadow-rose-200 dark:shadow-none hover:bg-rose-600",
    secondary: "bg-teal-400 text-white shadow-lg shadow-teal-200 dark:shadow-none hover:bg-teal-500",
    outline: "border-2 border-rose-500 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20",
    ghost: "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-3 text-base",
    lg: "px-6 py-4 text-lg w-full",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};