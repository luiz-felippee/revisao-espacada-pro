import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

/**
 * Hook para gerenciar a lógica de instalação do PWA.
 * Detecta o evento 'beforeinstallprompt' e controla a exibição do prompt.
 */
export const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPWAPrompt, setShowPWAPrompt] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // Detect Platform
        const userAgent = window.navigator.userAgent.toLowerCase();
        let currentPlatform: 'ios' | 'android' | 'other' = 'other';

        if (/iphone|ipad|ipod/.test(userAgent)) {
            currentPlatform = 'ios';
        } else if (/android/.test(userAgent)) {
            currentPlatform = 'android';
        }
        setPlatform(currentPlatform);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;

        if (isStandalone) return;

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            // Mostra o prompt após 10 segundos para Android se não tiver sido descartado
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa_prompt_dismissed');
                if (!dismissed) {
                    setShowPWAPrompt(true);
                }
            }, 10000);

            return () => clearTimeout(timer);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Para iOS, mostramos manualmente após 5 segundos pois não há evento automático
        if (currentPlatform === 'ios') {
            const timer = setTimeout(() => {
                const dismissed = localStorage.getItem('pwa_prompt_dismissed');
                if (!dismissed) {
                    setShowPWAPrompt(true);
                }
            }, 15000);
            return () => {
                window.removeEventListener('beforeinstallprompt', handler);
                clearTimeout(timer);
            };
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handlePWAInstall = async () => {
        if (!deferredPrompt) {
            // Se for iOS ou outro que não suporta o botão, apenas fechamos (as instruções estão no componente)
            setShowPWAPrompt(false);
            return;
        }

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
        handlePWADismiss,
        platform
    };
};
