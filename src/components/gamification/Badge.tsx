import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BadgeProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    variant?: 'primary' | 'success' | 'warning' | 'legendary';
    size?: 'sm' | 'md' | 'lg';
    unlocked?: boolean;
    progress?: number; // 0-100
    className?: string;
    onClick?: () => void;
}

const variantStyles = {
    primary: {
        bg: 'from-blue-500/20 to-blue-600/10',
        border: 'border-blue-500/30',
        glow: 'shadow-glow',
        icon: 'text-blue-400',
    },
    success: {
        bg: 'from-emerald-500/20 to-emerald-600/10',
        border: 'border-emerald-500/30',
        glow: 'shadow-glow-success',
        icon: 'text-emerald-400',
    },
    warning: {
        bg: 'from-amber-500/20 to-amber-600/10',
        border: 'border-amber-500/30',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        icon: 'text-amber-400',
    },
    legendary: {
        bg: 'from-purple-500/20 via-pink-500/20 to-orange-500/20',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.4)]',
        icon: 'text-purple-400',
    },
};

const sizeStyles = {
    sm: {
        container: 'w-16 h-16',
        icon: 'w-6 h-6',
        text: 'text-xs',
    },
    md: {
        container: 'w-20 h-20',
        icon: 'w-8 h-8',
        text: 'text-sm',
    },
    lg: {
        container: 'w-24 h-24',
        icon: 'w-10 h-10',
        text: 'text-base',
    },
};

export function Badge({
    icon: Icon,
    title,
    description,
    variant = 'primary',
    size = 'md',
    unlocked = false,
    progress = 0,
    className,
    onClick,
}: BadgeProps) {
    const styles = variantStyles[variant];
    const sizes = sizeStyles[size];

    return (
        <motion.div
            className={cn('relative group cursor-pointer', className)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
        >
            {/* Badge Container */}
            <div
                className={cn(
                    'relative flex items-center justify-center rounded-xl',
                    'bg-gradient-to-br border backdrop-blur-sm',
                    'transition-all duration-300',
                    sizes.container,
                    styles.bg,
                    styles.border,
                    unlocked ? styles.glow : 'opacity-50 grayscale',
                    onClick && 'hover:scale-105'
                )}
            >
                {/* Progress Ring */}
                {!unlocked && progress > 0 && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/10"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className={styles.icon}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: progress / 100 }}
                            transition={{ duration: 1, ease: 'easeInOut' }}
                            style={{
                                strokeDasharray: '100',
                                strokeDashoffset: '0',
                            }}
                        />
                    </svg>
                )}

                {/* Icon */}
                <Icon className={cn(sizes.icon, styles.icon, unlocked && 'animate-float')} />

                {/* Locked Overlay */}
                {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl backdrop-blur-sm">
                        <motion.div
                            className="text-white/70"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            🔒
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="bg-slate-900 border border-white/10 rounded-lg px-3 py-2 shadow-xl backdrop-blur-xl whitespace-nowrap">
                    <p className={cn('font-semibold', sizes.text, unlocked ? 'text-white' : 'text-slate-400')}>
                        {title}
                    </p>
                    {description && (
                        <p className="text-xs text-slate-400 mt-1">{description}</p>
                    )}
                    {!unlocked && progress > 0 && (
                        <div className="mt-2">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                                <span>Progresso</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-1">
                                <motion.div
                                    className={cn('h-full rounded-full', styles.bg)}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>
                    )}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-slate-900" />
                </div>
            </div>

            {/* Unlock Animation */}
            {unlocked && (
                <motion.div
                    className="absolute inset-0 rounded-xl"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0, 0],
                    }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={cn('absolute inset-0 rounded-xl', styles.bg, styles.glow)} />
                </motion.div>
            )}
        </motion.div>
    );
}
