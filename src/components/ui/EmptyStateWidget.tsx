import React from 'react';
import { motion } from 'framer-motion';
import { type LucideIcon, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmptyStateWidgetProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
    gradient?: string;
}

export const EmptyStateWidget: React.FC<EmptyStateWidgetProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
    gradient = "from-blue-500 to-indigo-600"
}) => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-[2rem] p-8 md:p-12",
            "bg-slate-900/50 backdrop-blur-xl border border-white/5",
            "flex flex-col items-center justify-center text-center",
            className
        )}>
            {/* Background Decoration */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none",
                "bg-gradient-to-r", gradient
            )} />

            {/* Icon Circle */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className={cn(
                    "relative z-10 w-20 h-20 rounded-3xl mb-6 flex items-center justify-center",
                    "bg-gradient-to-br shadow-2xl",
                    gradient,
                    "shadow-lg"
                )}
            >
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm" />
                <Icon className="w-10 h-10 text-white drop-shadow-md relative z-10" />
            </motion.div>

            {/* Text Content */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative z-10 max-w-md space-y-2"
            >
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    {title}
                </h3>
                <p className="text-slate-400 text-base leading-relaxed">
                    {description}
                </p>
            </motion.div>

            {/* Action Button */}
            {actionLabel && onAction && (
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    onClick={onAction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "relative z-10 mt-8 px-8 py-3 rounded-xl font-bold text-white shadow-xl transition-all",
                        "bg-gradient-to-r hover:brightness-110",
                        gradient,
                        "flex items-center gap-2 group"
                    )}
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    {actionLabel}
                </motion.button>
            )}
        </div>
    );
};
