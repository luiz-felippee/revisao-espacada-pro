import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, ...props }, ref) => {
    return (
        <div className="space-y-1">
            {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
            <input
                ref={ref}
                className={cn(
                    "w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-slate-100 placeholder:text-slate-600 transition-all",
                    className
                )}
                {...props}
            />
        </div>
    );
});
Input.displayName = 'Input';
