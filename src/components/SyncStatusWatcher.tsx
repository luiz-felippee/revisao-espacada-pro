import { useEffect, useRef } from 'react';
import { SyncQueueService } from '../services/SyncQueueService';
import { useToast } from '../context/ToastContext';

export const SyncStatusWatcher = () => {
    const { showToast } = useToast();
    const lastStatus = useRef<string>('synced');

    useEffect(() => {
        // Status Listener
        const unsubscribeStatus = SyncQueueService.subscribe((status) => {
            if (status === 'error' && lastStatus.current !== 'error') {
                if (navigator.onLine) {
                    showToast("Erro na sincronização. Verifique os detalhes.", "error");
                }
            } else if (status === 'offline' && lastStatus.current !== 'offline') {
                showToast("Modo Offline: Seus dados estão salvos no dispositivo.", "info");
            } else if (status === 'synced' && (lastStatus.current === 'syncing' || lastStatus.current === 'error')) {
                showToast("Tudo sincronizado!", "success");
            }
            lastStatus.current = status;
        });

        // Error Listener (New)
        const unsubscribeError = SyncQueueService.subscribeToError((msg) => {
            showToast(msg, "error");
        });

        return () => {
            unsubscribeStatus();
            unsubscribeError();
        };
    }, [showToast]);

    return null;
};
