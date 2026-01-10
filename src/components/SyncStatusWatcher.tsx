import { useEffect, useRef } from 'react';
import { SyncQueueService } from '../services/SyncQueueService';
import { useToast } from '../context/ToastContext';

export const SyncStatusWatcher = () => {
    const { showToast } = useToast();
    const lastStatus = useRef<string>('synced');

    useEffect(() => {
        const unsubscribe = SyncQueueService.subscribe((status) => {
            if (status === 'error' && lastStatus.current !== 'error') {
                if (navigator.onLine) {
                    showToast("Erro na sincronização. Tentando novamente...", "error");
                }
            } else if (status === 'offline' && lastStatus.current !== 'offline') {
                showToast("Modo Offline: Seus dados estão salvos no dispositivo.", "info");
            } else if (status === 'synced' && (lastStatus.current === 'syncing' || lastStatus.current === 'error')) {
                showToast("Tudo sincronizado!", "success");
            }
            lastStatus.current = status;
        });

        return () => unsubscribe();
    }, [showToast]);

    return null;
};
