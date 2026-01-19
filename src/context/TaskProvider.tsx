import React, { useEffect } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';
import { supabase } from '../lib/supabase';
import { TaskContext } from './TaskContext';
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';
import { SyncQueueService } from '../services/SyncQueueService';

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { gamification, awardXP, updateStats } = useGamification();

    const taskActions = useTasks({
        user,
        gamification,
        awardXP,
        updateStats
    });

    // Initial Fetch from Supabase
    useEffect(() => {
        const fetchTasks = async () => {
            if (user) {
                logger.info(`[TaskProvider] Fetching tasks for user: ${user.id}`);

                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    logger.error('[TaskProvider] Failed to fetch tasks:', error);
                    return;
                }

                if (data) {
                    logger.info(`[TaskProvider] Fetched ${data.length} tasks from Supabase`);

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

                    // --- ROBUST DELETION PROTECTION ---
                    // Read pending deletions from Sync Queue to prevent 'zombies'
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
                            logger.info(`[TaskProvider] Found ${pendingDeletes.size} pending deletions in queue`);
                        }
                    } catch (e) {
                        logger.error("[TaskProvider] Error reading sync queue for protection", e);
                    }

                    // 🚫 NUCLEAR PROTECTION: Filter permanent blacklist
                    // This is the FINAL line of defense against zombie resurrection
                    const nonBlacklisted = filterBlacklisted(normalized, 'task');
                    const blacklistedCount = normalized.length - nonBlacklisted.length;
                    if (blacklistedCount > 0) {
                        logger.warn(`[TaskProvider] Filtered ${blacklistedCount} blacklisted tasks`);
                    }
                    // ----------------------------------

                    taskActions.setTasks(prevTasks => {
                        const finalTasks: Task[] = [];
                        const processedIds = new Set<string>();
                        const tasksToMigrate: Task[] = [];

                        // 1. Add/Update from Server (filtered)
                        nonBlacklisted.forEach(serverTask => {
                            if (pendingDeletes.has(serverTask.id)) {
                                logger.info(`🛡️ Blocked zombie task resurrecion: ${serverTask.id} `);
                                return; // Skip deleted item
                            }
                            finalTasks.push(serverTask);
                            processedIds.add(serverTask.id);
                        });

                        // 2. Preserve Local-Only (Optimistic) & Auto-Migrate
                        prevTasks.forEach(localTask => {
                            if (!processedIds.has(localTask.id)) {
                                // Check for ownership mismatch (Guest -> User migration)
                                const t = localTask as any;
                                if (!t.user_id || t.user_id !== user.id) {
                                    // Take ownership
                                    const migrated = { ...localTask, user_id: user.id };
                                    tasksToMigrate.push(migrated as any);
                                    finalTasks.push(migrated as any);
                                } else {
                                    finalTasks.push(localTask);
                                }
                            }
                        });

                        // 3. Process Migrations (Async)
                        if (tasksToMigrate.length > 0) {
                            logger.info(`[TaskProvider] Auto-migrating ${tasksToMigrate.length} local tasks to user ${user.id}`);
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

                        if (tasksToMigrate.length > 0) {
                            logger.info(`[TaskProvider] Preserved & Migrated ${tasksToMigrate.length} local tasks`);
                        }

                        const localOnlyCount = finalTasks.length - processedIds.size;
                        logger.info(`[TaskProvider] Final task count: ${finalTasks.length} (${processedIds.size} from server, ${localOnlyCount} local)`);

                        return finalTasks;
                    });
                }
            }
        };
        fetchTasks();

        // Realtime Subscription
        if (user) {
            const channel = supabase
                .channel('db-changes-tasks')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        logger.info('Realtime Task Change:', payload);
                        fetchTasks();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user]);


    return (
        <TaskContext.Provider value={taskActions}>
            {children}
        </TaskContext.Provider>
    );
};

