import React, { useEffect } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useGoals } from '../hooks/useGoals';
import type { Goal } from '../types';
import { supabase } from '../lib/supabase';
import { GoalContext } from './GoalContext'; // Updated import
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { gamification, awardXP, updateStats } = useGamification();

    const goalActions = useGoals({
        user,
        gamification,
        awardXP,
        updateStats
    });

    // Initial Fetch from Supabase
    useEffect(() => {
        const fetchGoals = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('goals')
                    .select('*')
                    .eq('user_id', user.id);

                if (data && !error) {
                    const normalized = data.map(g => ({
                        ...g,
                        createdAt: new Date(g.created_at).getTime(),
                        imageUrl: g.image_url,
                        durationMinutes: g.duration_minutes,
                        timeSpent: g.time_spent || 0,
                        completionHistory: g.completion_history || [],
                        sessions: g.sessions || [],
                        summaries: g.summaries || []
                    }));

                    // --- ROBUST DELETION PROTECTION ---
                    const pendingDeletes = new Set<string>();
                    try {
                        const queueRaw = localStorage.getItem('sync_queue_v1');
                        if (queueRaw) {
                            const queue = JSON.parse(queueRaw);
                            if (Array.isArray(queue)) {
                                queue.forEach((op: { type: string; table: string; data?: { id?: string } }) => {
                                    if (op.type === 'DELETE' && op.table === 'goals' && op.data?.id) {
                                        pendingDeletes.add(op.data.id);
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        logger.error("Error reading sync queue for goal protection", e);
                    }

                    // 🚫 NUCLEAR PROTECTION: Filter permanent blacklist
                    const nonBlacklisted = filterBlacklisted(normalized, 'goal');
                    // ----------------------------------

                    goalActions.setGoals(prevGoals => {
                        const finalGoals: Goal[] = [];
                        const processedIds = new Set<string>();

                        // 1. Add/Update from Server (filtered)
                        nonBlacklisted.forEach(serverGoal => {
                            if (pendingDeletes.has(serverGoal.id)) {
                                logger.info(`🛡️ Blocked zombie goal resurrecion: ${serverGoal.id}`);
                                return;
                            }
                            finalGoals.push(serverGoal);
                            processedIds.add(serverGoal.id);
                        });

                        // 2. Preserve Local-Only (Optimistic)
                        prevGoals.forEach(localGoal => {
                            if (!processedIds.has(localGoal.id)) {
                                finalGoals.push(localGoal);
                            }
                        });

                        return finalGoals;
                    });
                }
            }
        };
        fetchGoals();
    }, [user]); // Fixed: removed goalActions to prevent infinite loop


    return (
        <GoalContext.Provider value={goalActions}>
            {children}
        </GoalContext.Provider>
    );
};

