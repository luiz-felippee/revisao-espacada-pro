import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SyncQueueService } from '../../services/SyncQueueService';

export const OfflineIndicator = () => {
    const [status, setStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>(SyncQueueService.getStatus());
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Subscribe to sync queue updates
        const unsubscribe = SyncQueueService.subscribe((newStatus) => {
            setStatus(newStatus);
        });

        // Also listen to online/offline events globally
        const handleOnline = () => {
            // Let SyncQueue handle the logic, but trigger update
            setStatus(SyncQueueService.getStatus());
        };
        const handleOffline = () => {
            // Immediate feedback
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            unsubscribe();
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (status === 'synced') {
            // Show "Synced" briefly then hide
            const timer = setTimeout(() => setIsVisible(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [status]);

    if (!isVisible && status === 'synced') return null;

    return (
        <div className={cn(
            "fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs shadow-2xl transition-all duration-500 transform",
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
            status === 'offline' && "bg-slate-900 border border-red-500/20 text-red-400",
            status === 'syncing' && "bg-slate-900 border border-blue-500/20 text-blue-400",
            status === 'synced' && "bg-slate-900 border border-emerald-500/20 text-emerald-400",
            status === 'error' && "bg-red-500 text-white"
        )}>
            {status === 'offline' && (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>OFFLINE - Modo Local</span>
                </>
            )}
            {status === 'syncing' && (
                <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sincronizando...</span>
                </>
            )}
            {status === 'synced' && (
                <>
                    <Wifi className="w-3.5 h-3.5" />
                    <span>Online & Sincronizado</span>
                </>
            )}
            {status === 'error' && (
                <>
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>Erro de Sincronização</span>
                </>
            )}
        </div>
    );
};
