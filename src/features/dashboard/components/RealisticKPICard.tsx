import React from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface RealisticKPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    gradient: string;
    shadowColor: string;
    onClick?: () => void;
    alert?: boolean;
    isAction?: boolean;
}

export const RealisticKPICard = React.memo(({ title, value, icon: Icon, gradient, shadowColor, onClick, alert, isAction }: RealisticKPICardProps) => {

    // Map shadow color names to actual Tailwind classes for dynamic interpolation (simplified)
    const shadowClass = React.useMemo(() => ({
        purple: 'shadow-purple-500/20 hover:shadow-purple-500/40',
        emerald: 'shadow-emerald-500/20 hover:shadow-emerald-500/40',
        blue: 'shadow-blue-500/20 hover:shadow-blue-500/40',
        amber: 'shadow-amber-500/20 hover:shadow-amber-500/40',
    }[shadowColor] || 'shadow-blue-500/20'), [shadowColor]);

    const ringClass = React.useMemo(() => ({
        purple: 'group-hover:ring-purple-500/50',
        emerald: 'group-hover:ring-emerald-500/50',
        blue: 'group-hover:ring-blue-500/50',
        amber: 'group-hover:ring-amber-500/50',
    }[shadowColor] || 'group-hover:ring-white/20'), [shadowColor]);


    return (
        <motion.div
            onClick={onClick}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            tabIndex={onClick ? 0 : undefined}
            role={onClick ? "button" : undefined}
            aria-label={`${title}: ${value}${alert ? ' (Atenção)' : ''}`}
            whileHover={onClick ? { y: -5, scale: 1.02 } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] p-6 max-[380px]:p-4 cursor-pointer group transition-all duration-300 bg-slate-900/40 backdrop-blur-xl border border-white/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                "shadow-2xl hover:bg-slate-800/60",
                shadowClass,
                !onClick && "cursor-default"
            )}
        >
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Top Inner Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Ambient Glow */}
            <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-30", `bg-${shadowColor}-500`)} />

            <div className="relative z-10 flex flex-nowrap items-center justify-between gap-4 max-[380px]:gap-2">
                <div className="min-w-0 flex-1">
                    <p className="text-slate-500 text-[10px] max-[380px]:text-[9px] font-black uppercase tracking-[0.2em] max-[380px]:tracking-wider mb-2 flex items-center gap-2 truncate">
                        {title}
                        {alert && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />}
                    </p>

                    <div className="flex items-baseline gap-2 flex-wrap">
                        {isAction ? (
                            <span className={cn("text-3xl max-[380px]:text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent filter drop-shadow-md", gradient)}>
                                {value}
                            </span>
                        ) : (
                            <span className="text-4xl max-[380px]:text-3xl font-mono font-black text-white tracking-tighter drop-shadow-md">
                                {value}
                            </span>
                        )}
                        {!isAction && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">pts</span>}
                    </div>
                </div>

                {/* 3D Icon Container */}
                <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={cn(
                        "w-14 h-14 max-[380px]:w-12 max-[380px]:h-12 rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 ring-1 ring-white/20 flex-shrink-0",
                        `bg-gradient-to-br ${gradient}`,
                        ringClass
                    )}>
                    <Icon className="w-7 h-7 max-[380px]:w-5 max-[380px]:h-5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                </motion.div>
            </div>

            {/* Bottom Accent line */}
            <div className={cn("absolute bottom-0 left-0 w-full h-1 opacity-40 bg-gradient-to-r", gradient)} />
        </motion.div>
    );
});
