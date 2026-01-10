import { motion, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface XPBarProps {
    currentXP: number;
    requiredXP: number;
    level: number;
    showLevel?: boolean;
    showNumbers?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
    className?: string;
    onLevelUp?: () => void;
}

export function XPBar({
    currentXP,
    requiredXP,
    level,
    showLevel = true,
    showNumbers = true,
    variant = 'default',
    className,
    onLevelUp,
}: XPBarProps) {
    const [previousLevel, setPreviousLevel] = useState(level);
    const percentage = Math.min((currentXP / requiredXP) * 100, 100);

    // Smooth spring animation for the progress bar
    const springProgress = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const progressWidth = useTransform(springProgress, [0, 100], ['0%', '100%']);

    useEffect(() => {
        springProgress.set(percentage);
    }, [percentage, springProgress]);

    // Level up detection during render (React handles this efficiently)
    if (level > previousLevel) {
        setPreviousLevel(level);
        onLevelUp?.();
    }

    if (variant === 'compact') {
        return (
            <div className={cn('flex items-center gap-3', className)}>
                {showLevel && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30">
                        <Zap className="w-3 h-3 text-primary-400" />
                        <span className="text-xs font-bold text-primary-400">Nv {level}</span>
                    </div>
                )}
                <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden relative">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                        style={{ width: progressWidth }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />
                    </motion.div>
                </div>
                {showNumbers && (
                    <span className="text-xs text-slate-400 tabular-nums min-w-[60px] text-right">
                        {currentXP}/{requiredXP}
                    </span>
                )}
            </div>
        );
    }

    if (variant === 'detailed') {
        return (
            <div className={cn('glass-card p-4', className)}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-500/30 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-primary-400" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-slate-900 border-2 border-primary-500 rounded-full px-2 py-0.5">
                                <span className="text-xs font-bold text-primary-400">{level}</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Nível {level}</h3>
                            <p className="text-xs text-slate-400">
                                {Math.round(percentage)}% para o próximo nível
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-gradient">{currentXP}</p>
                        <p className="text-xs text-slate-400">XP total</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full"
                        style={{ width: progressWidth }}
                    >
                        {/* Animated shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{
                                x: ['-100%', '200%'],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </motion.div>

                    {/* XP needed indicator */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white drop-shadow-lg">
                            {currentXP} / {requiredXP} XP
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                    <span>Faltam {requiredXP - currentXP} XP</span>
                    <span className="text-primary-400 font-semibold">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={cn('space-y-2', className)}>
            {showLevel && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-primary-500/20 to-primary-600/10 border border-primary-500/30">
                            <Zap className="w-4 h-4 text-primary-400" />
                            <span className="text-sm font-bold text-primary-400">Nível {level}</span>
                        </div>
                    </div>
                    {showNumbers && (
                        <span className="text-sm text-slate-400 tabular-nums">
                            {currentXP} / {requiredXP} XP
                        </span>
                    )}
                </div>
            )}

            {/* Progress Bar */}
            <div className="relative h-4 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-500 rounded-full"
                    style={{ width: progressWidth }}
                >
                    {/* Animated shine */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer" />

                    {/* Glow effect */}
                    <motion.div
                        className="absolute -inset-1 bg-gradient-to-r from-primary-500/50 to-primary-600/50 blur-md -z-10"
                        animate={{
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                </motion.div>

                {/* Percentage text inside bar if enough space */}
                {percentage > 15 && (
                    <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-semibold text-white drop-shadow-lg">
                            {Math.round(percentage)}%
                        </span>
                    </div>
                )}
            </div>

            {/* Additional info */}
            {showNumbers && (
                <div className="flex justify-between text-xs text-slate-400">
                    <span>Faltam {requiredXP - currentXP} XP</span>
                    <span className="text-primary-400">Próximo: Nível {level + 1}</span>
                </div>
            )}
        </div>
    );
}
