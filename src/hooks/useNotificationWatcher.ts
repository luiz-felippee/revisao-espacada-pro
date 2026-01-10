import { useEffect, useMemo } from 'react';
import type { Theme } from '../types';

/**
 * Hook para gerenciar o polling e permissões de notificações.
 * Centraliza a lógica que antes ficava no StudyProvider.
 */
export const useNotificationWatcher = (themes: Theme[]) => {
    const { notificationService } = useMemo(() => ({
        notificationService: import('../services/NotificationService').then(m => m.NotificationService)
    }), []);

    useEffect(() => {
        const initNotifications = async () => {
            const Service = await notificationService;
            await Service.requestPermission();
        };
        initNotifications();

        const interval = setInterval(async () => {
            const Service = await notificationService;

            // Mapeia temas para verificar notificações agendadas
            const itemsToCheck = themes.map(t => ({
                id: t.id,
                title: t.title,
                notificationTime: t.notificationTime,
                startDate: t.startDate
            }));

            Service.checkNotifications(itemsToCheck);
        }, 60000); // Verifica a cada minuto

        return () => clearInterval(interval);
    }, [themes, notificationService]);
};
