import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string | null;
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
    className?: string;
    wrapperClassName?: string;
    padding?: boolean;
    scrollContent?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'lg',
    className,
    wrapperClassName,
    padding = true,
    scrollContent = true
}) => {
    const modalId = React.useId();
    const titleId = `${modalId}-title`;

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        'full': 'max-w-full mx-4'
    }[maxWidth];

    return createPortal(
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 ${wrapperClassName || ''}`}
            style={{ touchAction: 'none' }}
            onClick={onClose}
            role="presentation"
        >
            <div
                className={`relative w-full ${maxWidthClass} bg-slate-950/90 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden ${className || ''}`}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? titleId : undefined}
            >
                {title !== null && (
                    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 border-b border-white/5 shrink-0">
                        <h2 id={titleId} className={`text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400`}>{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded-full transition-colors absolute top-2 right-2 sm:top-3 sm:right-3 z-50 touch-manipulation group"
                            aria-label="Fechar modal"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                        </button>
                    </div>
                )}

                {title === null && (
                    <button
                        onClick={onClose}
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-500/20 rounded-full transition-colors absolute top-6 right-4 z-[110] touch-manipulation group"
                        aria-label="Fechar modal"
                    >
                        <X className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                    </button>
                )}

                <div className={`${padding ? 'p-4 sm:p-6' : 'p-0'} ${scrollContent ? 'overflow-y-auto custom-scrollbar' : 'overflow-hidden flex flex-col'} flex-1`}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};
