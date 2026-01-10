import React, { createContext, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted) return null;

    const colorStyles = {
        danger: {
            icon: 'text-red-500',
            bgIcon: 'bg-red-500/10',
            border: 'border-red-500/20',
            button: 'bg-red-600 hover:bg-red-700',
            buttonRing: 'focus:ring-red-500'
        },
        warning: {
            icon: 'text-amber-500',
            bgIcon: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            button: 'bg-amber-600 hover:bg-amber-700',
            buttonRing: 'focus:ring-amber-500'
        },
        info: {
            icon: 'text-blue-500',
            bgIcon: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            button: 'bg-blue-600 hover:bg-blue-700',
            buttonRing: 'focus:ring-blue-500'
        }
    }[type];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.3 }}
                        className={cn(
                            "relative w-full max-w-sm bg-slate-900 border rounded-2xl shadow-2xl p-6 overflow-hidden",
                            colorStyles.border
                        )}
                    >
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none" />

                        <div className="relative z-10">
                            <div className="flex items-start gap-4">
                                <div className={cn("p-3 rounded-full flex-shrink-0", colorStyles.bgIcon)}>
                                    <AlertTriangle className={cn("w-6 h-6", colorStyles.icon)} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white leading-none mb-2 pt-1">{title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    {cancelText}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform active:scale-95",
                                        colorStyles.button
                                    )}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>

                        {/* Close X */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
};
