import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    id: string;
    type?: ToastType;
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

const typeConfig = {
    success: {
        icon: CheckCircle2,
        bg: 'from-success-500/20 to-success-600/10',
        border: 'border-success-500/30',
        iconColor: 'text-success-400',
        glow: 'shadow-glow-success',
    },
    error: {
        icon: AlertCircle,
        bg: 'from-danger-500/20 to-danger-600/10',
        border: 'border-danger-500/30',
        iconColor: 'text-danger-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'from-warning-500/20 to-warning-600/10',
        border: 'border-warning-500/30',
        iconColor: 'text-warning-400',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    },
    info: {
        icon: Info,
        bg: 'from-primary-500/20 to-primary-600/10',
        border: 'border-primary-500/30',
        iconColor: 'text-primary-400',
        glow: 'shadow-glow',
    },
};

export function Toast({ id, type = 'info', title, message, onClose }: ToastProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
                'relative w-full max-w-sm rounded-xl p-4',
                'bg-gradient-to-br backdrop-blur-xl border',
                'shadow-lg',
                config.bg,
                config.border,
                config.glow
            )}
        >
            <div className="flex gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <Icon className={cn('w-5 h-5', config.iconColor)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white mb-0.5">{title}</h3>
                    {message && (
                        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
                    )}
                </div>

                {/* Close button */}
                <button
                    onClick={() => onClose(id)}
                    className={cn(
                        'flex-shrink-0 p-1 rounded-lg',
                        'hover:bg-white/10 transition-colors',
                        'text-slate-400 hover:text-white'
                    )}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Progress bar */}
            <motion.div
                className={cn(
                    'absolute bottom-0 left-0 h-1 rounded-b-xl',
                    config.iconColor.replace('text-', 'bg-')
                )}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 3, ease: 'linear' }}
            />
        </motion.div>
    );
}

interface ToastContainerProps {
    toasts: Array<{
        id: string;
        type?: ToastType;
        title: string;
        message?: string;
        duration?: number;
    }>;
    onClose: (id: string) => void;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const positionStyles = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ toasts, onClose, position = 'top-right' }: ToastContainerProps) {
    return (
        <div className={cn('fixed z-[var(--z-notification)] flex flex-col gap-2 pointer-events-none', positionStyles[position])}>
            <AnimatePresence mode="sync">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast {...toast} onClose={onClose} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
