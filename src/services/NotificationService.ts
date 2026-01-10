export class NotificationService {
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
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: icon || '/vite.svg', // Fallback icon
                vibrate: [200, 100, 200]
            } as NotificationOptions & { vibrate?: number[] });
        }
    }

    static checkNotifications(
        items: { id: string; title: string; notificationTime?: string; startDate?: string }[]
    ) {
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

        items.forEach(item => {
            if (!item.notificationTime) return;
            if (item.startDate && item.startDate > todayStr) return; // Future item
            if (item.startDate && item.startDate < todayStr) return; // Past item? Maybe we alert daily? Let's check strict day match for "Atividade"

            // Allow notifications for Items starting TODAY
            // OR if no startDate implies daily? For now, Theme usually has startDate.
            // Let's assume strict date match for the alert to avoid daily spam if not recurring.
            // User requested "quando tiver perto da atividade", implies scheduled activity.

            const [hours, minutes] = item.notificationTime.split(':').map(Number);

            // Notification Trigger: 10 minutes before
            // We need to convert everything to minutes to compare easily
            const itemTotalMinutes = hours * 60 + minutes;
            const currentTotalMinutes = currentHours * 60 + currentMinutes;

            const diff = itemTotalMinutes - currentTotalMinutes;

            // Trigger if exactly 10 minutes before (to avoid span logic for now, poll every minute)
            if (diff === 10) {
                this.showNotification(
                    `Atividade em Breve: ${item.title}`,
                    `Sua atividade está agendada para começar às ${item.notificationTime}. Prepare-se!`,
                    '📚'
                );
            }
        });
    }
}
