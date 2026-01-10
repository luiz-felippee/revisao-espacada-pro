import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '../services/NotificationService';

export const useNotifications = () => {
    const [hasPermission, setHasPermission] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        setIsSupported('Notification' in window);
        setHasPermission(Notification.permission === 'granted');
    }, []);

    const requestPermission = useCallback(async () => {
        const granted = await NotificationService.requestPermission();
        setHasPermission(granted);
        return granted;
    }, []);

    const sendNotification = useCallback((title: string, body: string, icon?: string) => {
        NotificationService.showNotification(title, body, icon);
    }, []);

    const sendReviewReminder = useCallback((themeTitle: string, reviewNumber: number) => {
        NotificationService.showNotification(
            '📚 Hora de Revisar!',
            `${themeTitle} - Revisão ${reviewNumber} está pronta`,
            '📚'
        );
    }, []);

    const sendTaskReminder = useCallback((taskTitle: string, isOverdue: boolean = false) => {
        NotificationService.showNotification(
            isOverdue ? '⚠️ Tarefa Atrasada!' : '📋 Lembrete de Tarefa',
            taskTitle,
            isOverdue ? '⚠️' : '📋'
        );
    }, []);

    const sendPomodoroComplete = useCallback((mode: 'focus' | 'break') => {
        const isFocus = mode === 'focus';
        NotificationService.showNotification(
            isFocus ? '🎉 Foco Completo!' : '⏰ Pausa Terminada!',
            isFocus
                ? 'Ótimo trabalho! Hora de fazer uma pausa.'
                : 'Pausa terminada! Pronto para focar?',
            isFocus ? '🎉' : '⏰'
        );
    }, []);

    const sendDailySummary = useCallback((tasksToday: number, reviewsToday: number) => {
        if (tasksToday === 0 && reviewsToday === 0) return;

        const parts: string[] = [];
        if (tasksToday > 0) parts.push(`${tasksToday} tarefa${tasksToday !== 1 ? 's' : ''}`);
        if (reviewsToday > 0) parts.push(`${reviewsToday} revisão${reviewsToday !== 1 ? 'ões' : ''}`);

        NotificationService.showNotification(
            '☀️ Bom dia!',
            `Você tem ${parts.join(' e ')} para hoje`,
            '☀️'
        );
    }, []);

    return {
        isSupported,
        hasPermission,
        requestPermission,
        sendNotification,
        sendReviewReminder,
        sendTaskReminder,
        sendPomodoroComplete,
        sendDailySummary,
    };
};
