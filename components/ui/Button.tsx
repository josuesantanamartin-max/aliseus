import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn'; // Assuming there's a utility for combining classes

export interface ButtonProps extends HTMLMotionProps<'button'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant = 'primary',
            size = 'md',
            isLoading,
            leftIcon,
            rightIcon,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:pointer-events-none disabled:opacity-50';

        const variants = {
            primary: 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 shadow-sm hover:shadow-md hover:shadow-cyan-500/20',
            secondary: 'bg-aliseus-100 text-aliseus-900 hover:bg-aliseus-200 dark:bg-aliseus-800 dark:text-aliseus-50 dark:hover:bg-aliseus-700',
            outline: 'border border-aliseus-200 bg-transparent hover:bg-aliseus-50 dark:border-aliseus-700 dark:text-aliseus-100 dark:hover:bg-aliseus-800',
            ghost: 'bg-transparent hover:bg-aliseus-100 dark:hover:bg-aliseus-800 dark:text-aliseus-100 text-aliseus-700',
            danger: 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40',
        };

        const sizes = {
            sm: 'h-8 px-3 text-xs rounded-lg',
            md: 'h-10 px-4 py-2 text-sm rounded-xl',
            lg: 'h-12 px-8 text-base rounded-2xl',
            icon: 'h-10 w-10 justify-center rounded-xl',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
