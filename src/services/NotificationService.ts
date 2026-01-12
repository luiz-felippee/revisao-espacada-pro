interface NotificationItem {
    id: string;
    title: string;
    notificationTime?: string;
    startDate?: string;
    isCompleted?: boolean;
    status?: 'completed' | 'pending';
}

export class NotificationService {
    private static STORAGE_KEY = 'sent_notifications';
    private static CLEANUP_DAYS = 7; // Limpar notificações com mais de 7 dias

    static async requestPermission() {
        if (!('Notification' in window)) {
            console.warn('Este navegador não suporta notificações desktop');
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }

        return false;
    }

    static showNotification(title: string, body: string, icon?: string) {
        if (!('Notification' in window)) return;

        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: icon || '/vite.svg', // Fallback icon
                vibrate: [200, 100, 200],
                tag: `activity-${Date.now()}`, // Unique tag to avoid duplicates
                requireInteraction: false // Auto-hide after a few seconds
            } as NotificationOptions & { vibrate?: number[] });
        }
    }

    /**
     * Marca uma notificação como enviada
     */
    private static markAsSent(itemId: string, type: 'now' | 'before') {
        const today = new Date().toISOString().split('T')[0];
        const key = `${itemId}_${today}_${type}`;

        const sent = this.getSentNotifications();
        sent[key] = Date.now();

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sent));
    }

    /**
     * Verifica se uma notificação já foi enviada hoje
     */
    private static wasSent(itemId: string, type: 'now' | 'before'): boolean {
        const today = new Date().toISOString().split('T')[0];
        const key = `${itemId}_${today}_${type}`;

        const sent = this.getSentNotifications();
        return key in sent;
    }

    /**
     * Recupera notificações enviadas do localStorage
     */
    private static getSentNotifications(): Record<string, number> {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    }

    /**
     * Limpa notificações antigas (mais de X dias)
     */
    private static cleanupOldNotifications() {
        const sent = this.getSentNotifications();
        const cutoffTime = Date.now() - (this.CLEANUP_DAYS * 24 * 60 * 60 * 1000);

        const cleaned: Record<string, number> = {};
        Object.entries(sent).forEach(([key, timestamp]) => {
            if (timestamp > cutoffTime) {
                cleaned[key] = timestamp;
            }
        });

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cleaned));
    }

    /**
     * Verifica e envia notificações para atividades agendadas
     */
    static checkNotifications(items: NotificationItem[]) {
        // Limpar notificações antigas periodicamente
        if (Math.random() < 0.1) { // 10% de chance a cada verificação
            this.cleanupOldNotifications();
        }

        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

        items.forEach(item => {
            // Ignorar se não tem horário de notificação
            if (!item.notificationTime) return;

            // Ignorar se já está concluída
            if (item.isCompleted || item.status === 'completed') return;

            // Verificar se é para hoje
            const isForToday = !item.startDate || item.startDate === todayStr;
            if (!isForToday) return;

            const [hours, minutes] = item.notificationTime.split(':').map(Number);

            // Converter para minutos totais para facilitar comparação
            const itemTotalMinutes = hours * 60 + minutes;
            const currentTotalMinutes = currentHours * 60 + currentMinutes;

            const diff = itemTotalMinutes - currentTotalMinutes;

            // Notificação 10 minutos antes
            if (diff === 10 && !this.wasSent(item.id, 'before')) {
                this.showNotification(
                    `🔔 Atividade em 10 minutos`,
                    `${item.title} está agendada para ${item.notificationTime}. Prepare-se!`
                );
                this.markAsSent(item.id, 'before');
                console.log(`📬 Notificação enviada (10 min antes): ${item.title}`);
            }

            // Notificação no horário exato (dentro de uma janela de 1 minuto)
            if (diff >= 0 && diff < 1 && !this.wasSent(item.id, 'now')) {
                this.showNotification(
                    `⏰ Hora da Atividade!`,
                    `${item.title} começa agora às ${item.notificationTime}!`
                );
                this.markAsSent(item.id, 'now');
                console.log(`📬 Notificação enviada (horário exato): ${item.title}`);
            }
        });
    }

    /**
     * Reseta todas as notificações enviadas (útil para testes)
     */
    static resetNotifications() {
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('🗑️ Histórico de notificações limpo');
    }
}
