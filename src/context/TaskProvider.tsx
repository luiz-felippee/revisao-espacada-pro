import React, { useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';
import { supabase } from '../lib/supabase';
import { TaskContext } from './TaskContext';
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';
import { SyncQueueService } from '../services/SyncQueueService';
import { RealtimeService } from '../services/RealtimeService';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { gamification, awardXP, updateStats } = useGamification();

    const taskActions = useTasks({
        user,
        gamification,
        awardXP,
        updateStats
    });

    /**
     * Busca todas as tasks do usuário no Supabase
     */
    const fetchTasks = useCallback(async () => {
        if (!user) return;

        logger.info(`[TaskProvider] 🔄 Fetching tasks for user: ${user.id.substring(0, 8)}...`);

        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                logger.error('[TaskProvider] ❌ Failed to fetch tasks:', error);
                return;
            }

            if (data) {
                logger.info(`[TaskProvider] ✅ Fetched ${data.length} tasks from Supabase`);

                // Normalizar campos do banco para o formato da aplicação
                const normalized = data.map(t => ({
                    ...t,
                    startDate: t.start_date,
                    endDate: t.end_date,
                    createdAt: new Date(t.created_at).getTime(),
                    imageUrl: t.image_url,
                    durationMinutes: t.duration_minutes,
                    timeSpent: t.time_spent || 0,
                    completionHistory: t.completion_history || [],
                    sessions: t.sessions || [],
                    summaries: t.summaries || []
                }));

                // Proteção contra deleções pendentes
                const pendingDeletes = new Set<string>();
                try {
                    const queueRaw = localStorage.getItem('sync_queue_v1');
                    if (queueRaw) {
                        const queue = JSON.parse(queueRaw);
                        if (Array.isArray(queue)) {
                            queue.forEach((op: { type: string; table: string; data?: { id?: string } }) => {
                                if (op.type === 'DELETE' && op.table === 'tasks' && op.data?.id) {
                                    pendingDeletes.add(op.data.id);
                                }
                            });
                        }
                    }
                    if (pendingDeletes.size > 0) {
                        logger.info(`[TaskProvider] 🛡️ Found ${pendingDeletes.size} pending deletions`);
                    }
                } catch (e) {
                    logger.error("[TaskProvider] Error reading sync queue", e);
                }

                // Filtrar blacklist
                const nonBlacklisted = filterBlacklisted(normalized, 'task');
                const blacklistedCount = normalized.length - nonBlacklisted.length;
                if (blacklistedCount > 0) {
                    logger.warn(`[TaskProvider] 🛡️ Filtered ${blacklistedCount} blacklisted tasks`);
                }

                // Atualizar state com merge inteligente
                taskActions.setTasks(prevTasks => {
                    const finalTasks: Task[] = [];
                    const processedIds = new Set<string>();
                    const tasksToMigrate: Task[] = [];

                    // 1. Adicionar tasks do servidor (filtradas)
                    nonBlacklisted.forEach(serverTask => {
                        if (pendingDeletes.has(serverTask.id)) {
                            logger.info(`🛡️ Blocked zombie task: ${serverTask.id.substring(0, 8)}...`);
                            return;
                        }
                        finalTasks.push(serverTask);
                        processedIds.add(serverTask.id);
                    });

                    // 2. Preservar tasks locais (otimistas) e migrar se necessário
                    prevTasks.forEach(localTask => {
                        if (!processedIds.has(localTask.id)) {
                            const t = localTask as any;
                            if (!t.user_id || t.user_id !== user.id) {
                                // Migrar para o usuário atual
                                const migrated = { ...localTask, user_id: user.id };
                                tasksToMigrate.push(migrated as any);
                                finalTasks.push(migrated as any);
                            } else {
                                finalTasks.push(localTask);
                            }
                        }
                    });

                    // 3. Enfileirar migrações
                    if (tasksToMigrate.length > 0) {
                        logger.info(`[TaskProvider] 📤 Auto-migrating ${tasksToMigrate.length} local tasks`);
                        setTimeout(() => {
                            tasksToMigrate.forEach(t => {
                                SyncQueueService.enqueue({
                                    type: 'ADD',
                                    table: 'tasks',
                                    data: { ...t, user_id: user.id }
                                });
                            });
                        }, 1000);
                    }

                    logger.info(`[TaskProvider] 📊 Final: ${finalTasks.length} tasks (${processedIds.size} server, ${finalTasks.length - processedIds.size} local)`);
                    return finalTasks;
                });
            }
        } catch (error) {
            logger.error('[TaskProvider] ❌ Fetch error:', error);
        }
    }, [user, taskActions]);

    // Fetch inicial e inscrição no Realtime
    useEffect(() => {
        if (!user) return;

        // Fetch inicial
        fetchTasks();

        // Inscrever no Realtime para atualizações automáticas
        const unsubscribe = RealtimeService.subscribe('tasks', (event, record) => {
            logger.info(`[TaskProvider] 📥 Realtime ${event} for task:`, record?.id?.substring(0, 8));

            // Refetch para garantir consistência
            fetchTasks();
        });

        return () => {
            unsubscribe();
        };
    }, [user, fetchTasks]);

    return (
        <TaskContext.Provider value={taskActions}>
            {children}
        </TaskContext.Provider>
    );
};
