import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDevice } from '../hooks/useDevice';

export const InstallPWAHint = () => {
    const { isIOS, isPWA, isMobile } = useDevice();
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show if mobile, NOT a PWA already, and not dismissed
        const dismissed = localStorage.getItem('pwa_hint_dismissed');
        if (isMobile && !isPWA && !dismissed) {
            const timer = setTimeout(() => setShow(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [isMobile, isPWA]);

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('pwa_hint_dismissed', 'true');
    };

    if (!show) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-24 left-4 right-4 z-[60] bg-slate-900/90 backdrop-blur-2xl border border-blue-500/30 rounded-2xl p-4 shadow-2xl"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                        <Smartphone className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white mb-1">Instale o App PRO</h3>
                            <button onClick={handleDismiss} className="p-1 text-slate-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                            Para uma experiência mais rápida e em tela cheia, adicione este app à sua tela inicial.
                        </p>

                        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
                            {isIOS ? (
                                <>
                                    <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                                        <Share className="w-4 h-4" /> Toque em Compartilhar
                                    </div>
                                    <div className="w-px h-4 bg-white/10" />
                                    <div className="flex items-center gap-2 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                                        <PlusSquare className="w-4 h-4" /> "Adicionar à Tela de Início"
                                    </div>
                                </>
                            ) : (
                                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-2">
                                    Toque nos 3 pontos e em "Instalar Aplicativo"
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
