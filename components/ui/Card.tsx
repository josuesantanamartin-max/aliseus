import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn'; // Assuming there's a utility for combining classes

export interface CardProps extends HTMLMotionProps<'div'> {
    variant?: 'default' | 'glass' | 'elevated' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            padding = 'md',
            children,
            ...props
        },
        ref
    ) => {
        const baseStyles = 'rounded-[2rem] overflow-hidden transition-all duration-300';

        const variants = {
            default: 'bg-white dark:bg-aliseus-900 border border-aliseus-100 dark:border-aliseus-800 shadow-soft hover:shadow-md',
            glass: 'bg-white/80 dark:bg-aliseus-900/80 backdrop-blur-xl border border-white/20 dark:border-aliseus-800/50 shadow-glass',
            elevated: 'bg-white dark:bg-aliseus-900 shadow-glow hover:-translate-y-1',
            outline: 'border-2 border-dashed border-aliseus-200 dark:border-aliseus-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-transparent',
        };

        const paddings = {
            none: 'p-0',
            sm: 'p-4',
            md: 'p-6 md:p-8',
            lg: 'p-8 md:p-10',
        };

        return (
            <motion.div
                ref={ref}
                whileHover={variant !== 'outline' ? { y: -2 } : {}}
                className={cn(baseStyles, variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

export { Card };
