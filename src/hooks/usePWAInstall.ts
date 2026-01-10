import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook para gerenciar a lógica de instalação do PWA.
 * Detecta o evento 'beforeinstallprompt' e controla a exibição do prompt.
 */
export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPWAPrompt, setShowPWAPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Mostra o prompt após 30 segundos, se não tiver sido descartado previamente
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa_prompt_dismissed');
                if (!dismissed) {
                    setShowPWAPrompt(true);
                }
            }, 30000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handlePWAInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        logger.info(`PWA install outcome: ${outcome}`);

        setDeferredPrompt(null);
        setShowPWAPrompt(false);
    };

    const handlePWADismiss = () => {
        setShowPWAPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    return {
        showPWAPrompt,
        handlePWAInstall,
        handlePWADismiss
    };
};
