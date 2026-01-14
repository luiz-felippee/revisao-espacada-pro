import type { Subtheme, Review, Task, Goal } from '../types';
import { NotificationService } from './NotificationService';

interface ReviewNotificationConfig {
    morning: boolean;      // Notificar de manhã (9h)
    afternoon: boolean;    // Notificar à tarde (14h)
    evening: boolean;      // Notificar à noite (19h)
    enabled: boolean;      // Sistema de notificações ativo
}

const DEFAULT_CONFIG: ReviewNotificationConfig = {
    morning: true,
    afternoon: true,
    evening: false,
    enabled: true
};

export class ReviewNotificationService {
    private static CONFIG_KEY = 'review_notification_config';
    private static SENT_REVIEWS_KEY = 'sent_review_notifications';

    /**
     * Obtém configuração de notificações
     */
    static getConfig(): ReviewNotificationConfig {
        try {
            const stored = localStorage.getItem(this.CONFIG_KEY);
            return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
        } catch {
            return DEFAULT_CONFIG;
        }
    }

    /**
     * Salva configuração de notificações
     */
    static saveConfig(config: Partial<ReviewNotificationConfig>) {
        const current = this.getConfig();
        const updated = { ...current, ...config };
        localStorage.setItem(this.CONFIG_KEY, JSON.stringify(updated));
    }

    /**
     * Verifica se uma revisão já foi notificada hoje
     */
    private static wasReviewNotified(reviewId: string, period: string): boolean {
        const today = new Date().toISOString().split('T')[0];
        const key = `${reviewId}_${today}_${period}`;

        try {
            const stored = localStorage.getItem(this.SENT_REVIEWS_KEY);
            const sent = stored ? JSON.parse(stored) : {};
            return key in sent;
        } catch {
            return false;
        }
    }

    /**
     * Marca revisão como notificada
     */
    private static markReviewAsNotified(reviewId: string, period: string) {
        const today = new Date().toISOString().split('T')[0];
        const key = `${reviewId}_${today}_${period}`;

        try {
            const stored = localStorage.getItem(this.SENT_REVIEWS_KEY);
            const sent = stored ? JSON.parse(stored) : {};
            sent[key] = Date.now();

            // Limpar notificações antigas (mais de 7 dias)
            const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
            Object.keys(sent).forEach(k => {
                if (sent[k] < cutoff) delete sent[k];
            });

            localStorage.setItem(this.SENT_REVIEWS_KEY, JSON.stringify(sent));
        } catch (e) {
            console.error('Erro ao marcar revisão como notificada:', e);
        }
    }

    /**
     * Obtém revisões pendentes para hoje
     */
    static getPendingReviews(themes: Array<{ id: string; title: string; subthemes: Subtheme[] }>): Array<{
        id: string;
        title: string;
        themeTitle: string;
        date: string;
        number: number;
    }> {
        const today = new Date().toISOString().split('T')[0];
        const pending: Array<{ id: string; title: string; themeTitle: string; date: string; number: number }> = [];

        themes.forEach(theme => {
            theme.subthemes.forEach(subtheme => {
                if (subtheme.reviews && subtheme.reviews.length > 0) {
                    subtheme.reviews.forEach(review => {
                        if (review.status === 'pending' && review.date === today) {
                            pending.push({
                                id: `${subtheme.id}_review_${review.number}`,
                                title: subtheme.title,
                                themeTitle: theme.title,
                                date: review.date,
                                number: review.number
                            });
                        }
                    });
                }
            });
        });

        return pending;
    }

    /**
     * Obtém tarefas pendentes para hoje
     */
    static getPendingTasks(tasks: Task[]): Task[] {
        const today = new Date().toISOString().split('T')[0];

        return tasks.filter(task => {
            if (task.status === 'completed') return false;

            // Tarefa do dia
            if (task.type === 'day' && task.date === today) return true;

            // Tarefa de período
            if (task.type === 'period' && task.startDate && task.endDate) {
                return task.startDate <= today && task.endDate >= today;
            }

            // Tarefa recorrente
            if (task.type === 'recurring' && task.recurrence) {
                const dayOfWeek = new Date().getDay();
                return task.recurrence.includes(dayOfWeek);
            }

            return false;
        });
    }

    /**
     * Envia notificação de revisões pendentes
     */
    static notifyPendingReviews(
        themes: Array<{ id: string; title: string; subthemes: Subtheme[] }>,
        tasks: Task[]
    ) {
        const config = this.getConfig();
        if (!config.enabled) return;

        const now = new Date();
        const hour = now.getHours();

        // Determinar período do dia
        let period: 'morning' | 'afternoon' | 'evening' | null = null;
        if (hour === 9 && config.morning) period = 'morning';
        else if (hour === 14 && config.afternoon) period = 'afternoon';
        else if (hour === 19 && config.evening) period = 'evening';

        if (!period) return;

        // Obter revisões e tarefas pendentes
        const pendingReviews = this.getPendingReviews(themes);
        const pendingTasks = this.getPendingTasks(tasks);

        // Notificar revisões
        if (pendingReviews.length > 0) {
            const notificationId = `reviews_${period}`;

            if (!this.wasReviewNotified(notificationId, period)) {
                const titles = pendingReviews.slice(0, 3).map(r => `• ${r.title} (${r.themeTitle})`).join('\n');
                const moreText = pendingReviews.length > 3 ? `\n... e mais ${pendingReviews.length - 3}` : '';

                NotificationService.showNotification(
                    `📚 ${pendingReviews.length} ${pendingReviews.length === 1 ? 'Revisão Pendente' : 'Revisões Pendentes'}`,
                    `Você tem revisões agendadas para hoje:\n${titles}${moreText}`
                );

                this.markReviewAsNotified(notificationId, period);
                console.log(`📬 Notificação de revisões enviada (${period}):`, pendingReviews.length);
            }
        }

        // Notificar tarefas
        if (pendingTasks.length > 0) {
            const notificationId = `tasks_${period}`;

            if (!this.wasReviewNotified(notificationId, period)) {
                const titles = pendingTasks.slice(0, 3).map(t => `• ${t.title}`).join('\n');
                const moreText = pendingTasks.length > 3 ? `\n... e mais ${pendingTasks.length - 3}` : '';

                NotificationService.showNotification(
                    `✅ ${pendingTasks.length} ${pendingTasks.length === 1 ? 'Tarefa Pendente' : 'Tarefas Pendentes'}`,
                    `Tarefas para hoje:\n${titles}${moreText}`
                );

                this.markReviewAsNotified(notificationId, period);
                console.log(`📬 Notificação de tarefas enviada (${period}):`, pendingTasks.length);
            }
        }
    }
}
