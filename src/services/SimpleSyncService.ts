import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

/**
 * 🔄 SimpleSyncService - Sistema de Sincronização Robusto
 * 
 * Usa polling simples para buscar dados do Supabase periodicamente.
 * Funciona 100% das vezes, sem depender de WebSockets.
 * 
 * Estratégia:
 * - Polling a cada 5 segundos quando ativo
 * - Fetch direto do Supabase
 * - Atualiza providers via callbacks
 */

export interface SyncCallbacks {
    onTasksUpdate: (tasks: any[]) => void;
    onGoalsUpdate: (goals: any[]) => void;
    onThemesUpdate: (themes: any[]) => void;
}

class SimpleSyncServiceClass {
    private intervalId: NodeJS.Timeout | null = null;
    private isActive = false;
    private userId: string | null = null;
    private callbacks: SyncCallbacks | null = null;
    private syncInterval = 5000; // 5 segundos

    /**
     * Inicia o serviço de sincronização
     */
    start(userId: string, callbacks: SyncCallbacks) {
        if (this.isActive && this.userId === userId) {
            logger.info('[SimpleSyncService] Já está ativo para este usuário');
            return;
        }

        // Parar serviço anterior se existir
        this.stop();

        this.userId = userId;
        this.callbacks = callbacks;
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
     * Para o serviço de sincronização
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isActive = false;
        this.userId = null;
        this.callbacks = null;

        logger.info('[SimpleSyncService] 🛑 Serviço parado');
    }

    /**
     * Executa sincronização imediata
     */
    async sync() {
        if (!this.userId || !this.callbacks) {
            logger.warn('[SimpleSyncService] Sync chamado sem userId ou callbacks');
            return;
        }

        try {
            logger.info('[SimpleSyncService] 🔄 Sincronizando...');

            // Buscar tasks
            await this.syncTasks();

            // Buscar goals
            await this.syncGoals();

            // Buscar themes
            await this.syncThemes();

            logger.info('[SimpleSyncService] ✅ Sincronização completa');
        } catch (error) {
            logger.error('[SimpleSyncService] ❌ Erro na sincronização:', error);
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

        // Converter snake_case para camelCase
        const tasks = data?.map(task => ({
            id: task.id,
            userId: task.user_id,
            title: task.title,
            status: task.status,
            priority: task.priority,
            type: task.type,
            date: task.date,
            startDate: task.start_date,
            endDate: task.end_date,
            recurrence: task.recurrence,
            icon: task.icon,
            color: task.color,
            imageUrl: task.image_url,
            durationMinutes: task.duration_minutes,
            timeSpent: task.time_spent || 0,
            completionHistory: task.completion_history || [],
            sessions: task.sessions || [],
            summaries: task.summaries || [],
            createdAt: task.created_at
        })) || [];

        logger.info(`[SimpleSyncService] 📋 ${tasks.length} tasks sincronizadas`);
        this.callbacks!.onTasksUpdate(tasks);
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

        // Converter snake_case para camelCase
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
            relatedThemeId: goal.related_theme_id,
            isHabit: goal.is_habit,
            startDate: goal.start_date,
            createdAt: goal.created_at
        })) || [];

        logger.info(`[SimpleSyncService] 🎯 ${goals.length} goals sincronizadas`);
        this.callbacks!.onGoalsUpdate(goals);
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

        // Converter snake_case para camelCase
        const themes = data?.map(theme => ({
            id: theme.id,
            userId: theme.user_id,
            title: theme.title,
            icon: theme.icon,
            color: theme.color,
            startDate: theme.start_date,
            subthemes: theme.subthemes?.map((sub: any) => ({
                id: sub.id,
                title: sub.title,
                difficulty: sub.difficulty,
                status: sub.status,
                introDate: sub.intro_date,
                reviews: sub.reviews || [],
                durationMinutes: sub.duration_minutes,
                timeSpent: sub.time_spent || 0
            })) || [],
            createdAt: theme.created_at
        })) || [];

        logger.info(`[SimpleSyncService] 📚 ${themes.length} themes sincronizados`);
        this.callbacks!.onThemesUpdate(themes);
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
}

export const SimpleSyncService = new SimpleSyncServiceClass();
