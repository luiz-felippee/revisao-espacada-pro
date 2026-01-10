import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps {
    progress: number; // 0 to 100
    color?: string; // Tailwind color class like 'bg-blue-500' or hex if using style
    className?: string;
    showLabel?: boolean;
    height?: string; // e.g., 'h-1.5'
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    color = 'bg-blue-500',
    className,
    showLabel = false,
    height = 'h-1.5'
}) => {
    // Clamp progress between 0 and 100
    const clampedProgress = Math.max(0, Math.min(100, progress));

    return (
        <div className={cn("w-full", className)}>
            {showLabel && (
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    <span>Progresso</span>
                    <span>{Math.round(clampedProgress)}%</span>
                </div>
            )}
            <div className={cn("w-full bg-slate-800/50 rounded-full overflow-hidden border border-white/5", height)}>
                <div
                    className={cn("h-full transition-all duration-500 ease-out", color)}
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    );
};
