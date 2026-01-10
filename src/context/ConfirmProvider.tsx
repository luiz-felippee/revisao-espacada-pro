import React, { useState, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ConfirmContext, type ConfirmOptions } from './ConfirmContext';

// export const useConfirm = () => {
//     const context = useContext(ConfirmContext);
//     if (!context) {
//         throw new Error('useConfirm must be used within ConfirmProvider');
//     }
//     return context;
// };

interface ConfirmProviderProps {
    children: ReactNode;
}

export const ConfirmProvider: React.FC<ConfirmProviderProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions | null>(null);
    const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

    const confirm = (opts: ConfirmOptions): Promise<boolean> => {
        setOptions(opts);
        setIsOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolver(() => resolve);
        });
    };

    const handleConfirm = () => {
        if (resolver) {
            resolver(true);
        }
        setIsOpen(false);
        setOptions(null);
        setResolver(null);
    };

    const handleCancel = () => {
        if (resolver) {
            resolver(false);
        }
        setIsOpen(false);
        setOptions(null);
        setResolver(null);
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}

            {/* Confirm Modal */}
            {isOpen && options && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={handleCancel}
                >
                    {/* Backdrop with blur */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                    {/* Modal Card */}
                    <div
                        className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Noise Texture */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay pointer-events-none rounded-2xl" />

                        {/* Header */}
                        <div className="relative p-6 border-b border-slate-800/50">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center",
                                    options.isDangerous
                                        ? "bg-red-500/10 border border-red-500/20"
                                        : "bg-blue-500/10 border border-blue-500/20"
                                )}>
                                    <AlertTriangle className={cn(
                                        "w-6 h-6",
                                        options.isDangerous ? "text-red-400" : "text-blue-400"
                                    )} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-1">
                                        {options.title || 'Confirmação necessária'}
                                    </h3>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    className="flex-shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors"
                                    aria-label="Fechar"
                                >
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative p-6">
                            <p className="text-slate-300 leading-relaxed">
                                {options.message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="relative p-6 border-t border-slate-800/50 flex gap-3 justify-end">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2.5 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border border-slate-800/50 rounded-lg font-medium transition-all"
                            >
                                {options.cancelText || 'Cancelar'}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg",
                                    options.isDangerous
                                        ? "bg-red-600 hover:bg-red-500 text-white border border-red-500/20"
                                        : "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/20"
                                )}
                            >
                                {options.confirmText || 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};
