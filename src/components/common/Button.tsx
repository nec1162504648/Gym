import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
  secondary:
    'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-gray-400',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
