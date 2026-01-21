import { useEffect, useMemo, useRef } from 'react';
import type { Theme, Task, Goal } from '../types';

interface UseNotificationWatcherProps {
    themes: Theme[];
    tasks: Task[];
    goals: Goal[];
}

/**
 * Hook para gerenciar o polling e permissões de notificações.
 * Monitora todas as atividades (themes, tasks, goals) e envia notificações no horário agendado.
 * Também envia notificações automáticas de revisões e tarefas pendentes.
 */
export const useNotificationWatcher = ({ themes, tasks, goals }: UseNotificationWatcherProps) => {
    // 🚀 FIX: Usar refs para evitar recriar o interval toda vez que os dados mudam
    const themesRef = useRef(themes);
    const tasksRef = useRef(tasks);
    const goalsRef = useRef(goals);

    // Atualizar refs quando os dados mudarem
    useEffect(() => {
        themesRef.current = themes;
        tasksRef.current = tasks;
        goalsRef.current = goals;
    }, [themes, tasks, goals]);

    const { notificationService, reviewNotificationService } = useMemo(() => ({
        notificationService: import('../services/NotificationService').then(m => m.NotificationService),
        reviewNotificationService: import('../services/ReviewNotificationService').then(m => m.ReviewNotificationService)
    }), []);

    useEffect(() => {
        const initNotifications = async () => {
            const Service = await notificationService;
            const granted = await Service.requestPermission();
            if (granted) {
                console.log('✅ Notificações habilitadas');
            }
        };
        initNotifications();

        const interval = setInterval(async () => {
            const Service = await notificationService;
            const ReviewService = await reviewNotificationService;
            const today = new Date().toISOString().split('T')[0];

            // ========== NOTIFICAÇÕES AUTOMÁTICAS DE REVISÕES ==========
            // Envia notificações em horários específicos (9h, 14h, 19h) se houver revisões pendentes
            ReviewService.notifyPendingReviews(themesRef.current, tasksRef.current);

            // ========== NOTIFICAÇÕES BASEADAS EM HORÁRIOS CONFIGURADOS ==========
            // Coletar todas as atividades que precisam ser monitoradas
            const itemsToCheck: any[] = [];

            // 1. THEMES/SUBTEMAS (Revisões)
            themesRef.current.forEach(theme => {
                theme.subthemes.forEach(subtheme => {
                    if (!subtheme.notificationTime) return;

                    // Verificar qual revisão está pendente hoje
                    const todayReview = subtheme.reviews.find(r =>
                        r.date === today && r.status === 'pending'
                    );

                    if (todayReview) {
                        itemsToCheck.push({
                            id: subtheme.id,
                            title: `${theme.title} - ${subtheme.title}`,
                            notificationTime: subtheme.notificationTime,
                            startDate: today,
                            isCompleted: false,
                            status: 'pending'
                        });
                    }
                });
            });

            // 2. TASKS (Tarefas)
            tasksRef.current.forEach(task => {
                if (!task.notificationTime) return;

                // Verificar se a tarefa é para hoje
                const isToday = task.date === today ||
                    (task.startDate && task.startDate <= today &&
                        task.endDate && task.endDate >= today);

                if (isToday) {
                    itemsToCheck.push({
                        id: task.id,
                        title: task.title,
                        notificationTime: task.notificationTime,
                        startDate: task.date || task.startDate,
                        isCompleted: task.status === 'completed',
                        status: task.status
                    });
                }
            });

            // 3. GOALS/HABITS (Metas e Hábitos)
            goalsRef.current.forEach(goal => {
                if (!goal.notificationTime) return;

                // Verificar se já foi concluído hoje
                const completedToday = goal.completionHistory?.some(date =>
                    date.startsWith(today)
                );

                // Verificar se está no período ativo
                const isActive = !goal.deadline || goal.deadline >= today;

                if (isActive) {
                    itemsToCheck.push({
                        id: goal.id,
                        title: goal.title,
                        notificationTime: goal.notificationTime,
                        startDate: today,
                        isCompleted: completedToday || goal.progress >= 100,
                        status: completedToday || goal.progress >= 100 ? 'completed' : 'pending'
                    });
                }
            });

            // Enviar para verificação
            if (itemsToCheck.length > 0) {
                Service.checkNotifications(itemsToCheck);
            }
        }, 60000); // Verifica a cada minuto

        return () => clearInterval(interval);
    }, [notificationService, reviewNotificationService]); // 🚀 FIX: Removido themes, tasks, goals das dependências
};
