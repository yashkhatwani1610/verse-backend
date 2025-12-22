import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'primary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'default',
    size = 'md',
    className = '',
    children,
    isLoading = false,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold uppercase tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-peach-500 transform active:scale-95';

    const variantStyles = {
        default: 'bg-gradient-to-r from-peach-400 to-peach-600 text-white hover:from-peach-500 hover:to-peach-700 shadow-md hover:shadow-lg',
        outline: 'border-2 border-peach-400 text-peach-700 hover:bg-peach-400 hover:text-white shadow-sm hover:shadow-md',
        primary: 'bg-gradient-to-r from-peach-400 to-peach-600 text-white hover:from-peach-500 hover:to-peach-700 shadow-lg hover:shadow-xl',
        ghost: 'text-gray-700 hover:bg-white/50 hover:text-gray-900',
    };

    const sizeStyles = {
        sm: 'px-4 py-2 text-sm gap-1.5',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg gap-2.5',
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
};
