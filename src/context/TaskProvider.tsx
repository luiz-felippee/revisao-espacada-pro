import React, { useEffect } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';
import { supabase } from '../lib/supabase';
import { TaskContext } from './TaskContext';
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';

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
                const { data, error } = await supabase
                    .from('tasks')
                    .select('*')
                    .eq('user_id', user.id);

                if (data && !error) {
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
                    } catch (e) {
                        logger.error("Error reading sync queue for protection", e);
                    }

                    // 🚫 NUCLEAR PROTECTION: Filter permanent blacklist
                    // This is the FINAL line of defense against zombie resurrection
                    const nonBlacklisted = filterBlacklisted(normalized, 'task');
                    // ----------------------------------

                    taskActions.setTasks(prevTasks => {
                        const finalTasks: Task[] = [];
                        const processedIds = new Set<string>();

                        // 1. Add/Update from Server (filtered)
                        nonBlacklisted.forEach(serverTask => {
                            if (pendingDeletes.has(serverTask.id)) {
                                logger.info(`🛡️ Blocked zombie task resurrecion: ${serverTask.id} `);
                                return; // Skip deleted item
                            }
                            finalTasks.push(serverTask);
                            processedIds.add(serverTask.id);
                        });

                        // 2. Preserve Local-Only (Optimistic)
                        prevTasks.forEach(localTask => {
                            if (!processedIds.has(localTask.id)) {
                                finalTasks.push(localTask);
                            }
                        });

                        return finalTasks;
                    });
                }
            }
        };
        fetchTasks();
    }, [user]); // Fixed: removed taskActions to prevent infinite loop


    return (
        <TaskContext.Provider value={taskActions}>
            {children}
        </TaskContext.Provider>
    );
};

