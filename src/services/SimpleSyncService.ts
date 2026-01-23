import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * 🔄 SimpleSyncService - Sistema de Sincronização Robusto (Observer Pattern)
 * 
 * Usa polling simples para buscar dados do Supabase periodicamente.
 * Funciona 100% das vezes, sem depender de WebSockets.
 * Suporta múltiplos listeners simultâneos.
 */

export interface SyncCallbacks {
    onTasksUpdate?: (tasks: any[]) => void;
    onGoalsUpdate?: (goals: any[]) => void;
    onThemesUpdate?: (themes: any[]) => void;
}

class SimpleSyncServiceClass {
    private intervalId: NodeJS.Timeout | null = null;
    private isActive = false;
    private userId: string | null = null;
    private listeners: Set<SyncCallbacks> = new Set();
    private syncInterval = 5000; // 5 segundos
    private stats = {
        tasks: { count: 0, lastSuccess: 0 },
        goals: { count: 0, lastSuccess: 0 },
        themes: { count: 0, lastSuccess: 0 }
    };

    /**
     * Helper para garantir datas válidas (evita crash em iOS/Safari)
     */
    private safeDate(val: any, fallbackToNow = true): number | undefined {
        if (typeof val === 'number') return val;
        if (!val) return fallbackToNow ? Date.now() : undefined;
        const d = new Date(val);
        return isNaN(d.getTime()) ? (fallbackToNow ? Date.now() : undefined) : d.getTime();
    }

    /**
     * Helper para garantir datas formatadas (string) ou undefined
     */
    private safeDateString(val: any): string | undefined {
        if (!val) return undefined;
        if (typeof val === 'string') return val;
        try {
            return new Date(val).toISOString();
        } catch {
            return undefined;
        }
    }

    /**
     * Inicia o serviço de sincronização
     */
    start(userId: string) {
        if (this.isActive && this.userId === userId) {
            return;
        }

        // Se mudar de usuário, reinicia tudo
        if (this.userId && this.userId !== userId) {
            this.stop();
        }

        this.userId = userId;
        this.isActive = true;

        logger.info('[SimpleSyncService] 🚀 Iniciando serviço de sincronização');
        logger.info('[SimpleSyncService] User ID:', userId);
        logger.info(`[SimpleSyncService] Intervalo: ${this.syncInterval}ms`);

        // Sync imediato
        this.sync();

        // Polling periódico
        this.intervalId = setInterval(() => {
            this.sync();
        }, this.syncInterval);

        // Pausar quando app vai para background
        this.setupVisibilityListener();
    }

    /**
     * Inscreve um listener para receber atualizações
     */
    subscribe(callbacks: SyncCallbacks): () => void {
        this.listeners.add(callbacks);
        logger.info('[SimpleSyncService] 👂 Novo listener inscrito. Total:', this.listeners.size);

        // Se já temos dados em cache/estado interno, poderíamos enviar imediatamente
        // Por enquanto, forçamos um sync se for o primeiro listener ou se o serviço estiver parado
        if (this.userId && this.isActive) {
            // Opcional: force sync on subscribe
        }

        return () => {
            this.listeners.delete(callbacks);
            logger.info('[SimpleSyncService] 🔌 Listener removido. Total:', this.listeners.size);
        };
    }

    /**
     * Para o serviço de sincronização
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isActive = false;
        this.userId = null;
        this.listeners.clear();

        logger.info('[SimpleSyncService] 🛑 Serviço parado');
    }

    /**
     * Executa sincronização imediata
     */
    async sync() {
        if (!this.userId) {
            return;
        }

        // Se não tem listeners, não precisa buscar (otimização)
        if (this.listeners.size === 0) {
            // logger.debug('[SimpleSyncService] Sem listeners, pulando sync');
            return;
        }

        try {
            logger.info('[SimpleSyncService] 🔄 Sincronizando...');

            // Buscar dados em paralelo para ser mais rápido
            // Buscar dados em paralelo para ser mais rápido, usando allSettled para isolar falhas
            const results = await Promise.allSettled([
                this.syncTasks(),
                this.syncGoals(),
                this.syncThemes()
            ]);

            results.forEach((result, index) => {
                const types = ['Tasks', 'Goals', 'Themes'];
                if (result.status === 'rejected') {
                    logger.error(`[SimpleSyncService] ❌ Falha ao sincronizar ${types[index]}:`, result.reason);
                }
            });

            logger.info('[SimpleSyncService] ✅ Ciclo de sincronização finalizado');
        } catch (error) {
            logger.error('[SimpleSyncService] ❌ Erro geral na sincronização:', error);
        }
    }

    /**
     * Sincroniza tasks
     */
    private async syncTasks() {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', this.userId!)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('[SimpleSyncService] Erro ao buscar tasks:', error);
            return;
        }

        // Converter snake_case para camelCase com sanitização
        const tasks = data?.map(task => ({
            id: task.id,
            userId: task.user_id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            type: task.type,
            date: task.date,
            startDate: this.safeDateString(task.start_date),
            endDate: this.safeDateString(task.end_date),
            recurrence: task.recurrence,
            icon: task.icon,
            color: task.color,
            imageUrl: task.image_url,
            durationMinutes: task.duration_minutes,
            timeSpent: task.time_spent || 0,
            completionHistory: task.completion_history || [],
            sessions: task.sessions || [],
            summaries: task.summaries || [],
            createdAt: this.safeDate(task.created_at)
        })) || [];

        this.stats.tasks = { count: tasks.length, lastSuccess: Date.now() };

        // Notificar listeners
        this.listeners.forEach(listener => {
            if (listener.onTasksUpdate) {
                listener.onTasksUpdate(tasks);
            }
        });
    }

    /**
     * Sincroniza goals
     */
    private async syncGoals() {
        const { data, error } = await supabase
            .from('goals')
            .select('*')
            .eq('user_id', this.userId!)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('[SimpleSyncService] Erro ao buscar goals:', error);
            return;
        }

        // Converter snake_case para camelCase com sanitização
        const goals = data?.map(goal => ({
            id: goal.id,
            userId: goal.user_id,
            title: goal.title,
            status: goal.status,
            priority: goal.priority,
            type: goal.type || 'goal',
            category: goal.category || 'personal',
            progress: goal.progress || 0,
            icon: goal.icon,
            color: goal.color,
            imageUrl: goal.image_url,
            durationMinutes: goal.duration_minutes,
            timeSpent: goal.time_spent || 0,
            completionHistory: goal.completion_history || [],
            relatedThemeId: goal.theme_id,
            isHabit: goal.is_habit,
            startDate: this.safeDateString(goal.start_date),
            createdAt: this.safeDate(goal.created_at)
        })) || [];

        this.stats.goals = { count: goals.length, lastSuccess: Date.now() };

        // Notificar listeners
        this.listeners.forEach(listener => {
            if (listener.onGoalsUpdate) {
                listener.onGoalsUpdate(goals);
            }
        });
    }

    /**
     * Sincroniza themes
     */
    private async syncThemes() {
        const { data, error } = await supabase
            .from('themes')
            .select(`
                *,
                subthemes (*)
            `)
            .eq('user_id', this.userId!)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('[SimpleSyncService] Erro ao buscar themes:', error);
            return;
        }

        // Converter snake_case para camelCase com sanitização
        const themes = data?.map(theme => ({
            id: theme.id,
            userId: theme.user_id,
            title: theme.title,
            icon: theme.icon,
            color: theme.color,
            category: theme.category || 'study',
            priority: theme.priority || 'medium',
            startDate: this.safeDateString(theme.start_date),
            subthemes: theme.subthemes?.map((sub: any) => ({
                id: sub.id,
                title: sub.title,
                difficulty: sub.difficulty,
                status: sub.status,
                introDate: this.safeDateString(sub.intro_date),
                reviews: sub.reviews || [],
                durationMinutes: sub.duration_minutes,
                timeSpent: sub.time_spent || 0
            })) || [],
            createdAt: this.safeDate(theme.created_at)
        })) || [];

        this.stats.themes = { count: themes.length, lastSuccess: Date.now() };

        // Notificar listeners
        this.listeners.forEach(listener => {
            if (listener.onThemesUpdate) {
                listener.onThemesUpdate(themes);
            }
        });
    }

    /**
     * Configura listener para pausar quando app vai para background
     */
    private setupVisibilityListener() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                logger.info('[SimpleSyncService] 💤 App em background, pausando sync');
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
            } else {
                logger.info('[SimpleSyncService] 👀 App em foreground, retomando sync');
                if (this.isActive && !this.intervalId) {
                    // Sync imediato ao retornar
                    this.sync();

                    // Reiniciar polling
                    this.intervalId = setInterval(() => {
                        this.sync();
                    }, this.syncInterval);
                }
            }
        });
    }

    /**
     * Força sincronização imediata (para botão de refresh)
     */
    async forceSync() {
        logger.info('[SimpleSyncService] 🔄 Sincronização forçada pelo usuário');
        await this.sync();
    }
    /**
     * DEBUG: Retorna estado interno
     */
    getDebugInfo() {
        return {
            isActive: this.isActive,
            userId: this.userId,
            listenersCount: this.listeners.size,
            syncInterval: this.syncInterval,
            stats: this.stats
        };
    }
}

export const SimpleSyncService = new SimpleSyncServiceClass();
