import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Check } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationPermissionBanner: React.FC = () => {
    const { isSupported, hasPermission, requestPermission } = useNotifications();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(() => {
        // Initialize from localStorage to avoid synchronous setState in effect
        const dismissed = localStorage.getItem('notification_banner_dismissed');
        return dismissed === 'true' || !isSupported;
    });

    useEffect(() => {
        // Check if should show banner
        if (isDismissed || hasPermission) {
            return;
        }

        // Show banner after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, [hasPermission, isDismissed]);

    const handleAllow = async () => {
        const granted = await requestPermission();
        if (granted) {
            setIsVisible(false);
            localStorage.setItem('notification_banner_dismissed', 'true');
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        localStorage.setItem('notification_banner_dismissed', 'true');
    };

    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9998] max-w-md w-full px-4 animate-in slide-in-from-bottom-5 fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl border border-white/20 p-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                            Ative as Notificações! 🔔
                        </h3>
                        <p className="text-white/90 text-sm mb-4">
                            Receba lembretes de revisões espaçadas e nunca perca uma tarefa importante.
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleAllow}
                                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all flex items-center gap-2 shadow-lg"
                            >
                                <Check className="w-4 h-4" />
                                Permitir
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="bg-white/10 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-white/20 transition-all"
                            >
                                Agora Não
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="text-white/70 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
