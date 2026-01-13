import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';

interface PWAPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
    platform?: 'ios' | 'android' | 'other';
}

export const PWAPrompt: React.FC<PWAPromptProps> = ({ onInstall, onDismiss, platform = 'android' }) => {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="fixed bottom-24 left-4 right-4 z-[100] md:max-w-md md:left-auto md:right-8"
            >
                <div className="bg-slate-900/90 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    {/* Background Effect */}
                    <div className="absolute top-0 right-0 p-16 bg-blue-600/10 blur-[40px] rounded-full pointer-events-none" />

                    <button
                        onClick={onDismiss}
                        className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-400" />
                    </button>

                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                            <Download className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 pr-6">
                            <h3 className="text-white font-bold text-base mb-1">
                                Instalar no Celular
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                {platform === 'ios'
                                    ? 'Acesse como um aplicativo nativo para uma melhor experiência.'
                                    : 'Adicione à sua tela inicial para acesso rápido e offline.'}
                            </p>
                        </div>
                    </div>

                    {platform === 'ios' ? (
                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-3">
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                                    <Share className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1">1. Toque no botão de <strong>Compartilhar</strong> na barra do Safari.</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-300">
                                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center">
                                    <PlusSquare className="w-3.5 h-3.5" />
                                </div>
                                <span className="flex-1">2. Selecione <strong>Tela de Início</strong> na lista.</span>
                            </div>
                            <button
                                onClick={onDismiss}
                                className="w-full mt-2 py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl border border-white/10 transition-all uppercase tracking-widest"
                            >
                                Entendi
                            </button>
                        </div>
                    ) : (
                        <div className="mt-5 flex gap-2">
                            <button
                                onClick={onInstall}
                                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                INSTALAR AGORA
                            </button>
                            <button
                                onClick={onDismiss}
                                className="px-6 py-3 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-sm rounded-xl transition-all"
                            >
                                Depois
                            </button>
                        </div>
                    )}

                    {/* Animated Border */}
                    <div className="absolute inset-0 border-2 border-blue-500/20 rounded-3xl pointer-events-none group-hover:border-blue-500/40 transition-colors" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
