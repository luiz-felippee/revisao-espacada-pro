import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon: Icon,
    className,
    children,
    ...props
}) => {
    return (
        <button
            className={cn(
                "flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                {
                    'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20': variant === 'primary',
                    'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700': variant === 'secondary',
                    'bg-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200': variant === 'ghost',
                    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20': variant === 'danger',

                    'px-3 py-1.5 text-sm': size === 'sm',
                    'px-4 py-2': size === 'md',
                    'px-6 py-3 text-lg': size === 'lg',
                },
                className
            )}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </button>
    );
};
