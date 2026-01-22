import React, { useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useGoals } from '../hooks/useGoals';
import type { Goal } from '../types';
import { supabase } from '../lib/supabase';
import { GoalContext } from './GoalContext';
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';
import { SyncQueueService } from '../services/SyncQueueService';
import { SimpleSyncService } from '../services/SimpleSyncService';

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { gamification, awardXP, updateStats } = useGamification();

    const goalActions = useGoals({
        user,
        gamification,
        awardXP,
        updateStats
    });

    /**
     * Busca todos os goals do usuário no Supabase
     */
    const fetchGoals = useCallback(async () => {
        if (!user) return;

        logger.info(`[GoalProvider] 🔄 Fetching goals for user: ${user.id.substring(0, 8)}...`);

        try {
            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                logger.error('[GoalProvider] ❌ Failed to fetch goals:', error);
                return;
            }

            if (data) {
                logger.info(`[GoalProvider] ✅ Fetched ${data.length} goals from Supabase`);

                // Normalizar campos do banco para o formato da aplicação
                const normalized = data.map(g => ({
                    ...g,
                    relatedThemeId: g.theme_id,
                    createdAt: new Date(g.created_at).getTime(),
                    imageUrl: g.image_url,
                    durationMinutes: g.duration_minutes,
                    timeSpent: g.time_spent || 0,
                    completionHistory: g.completion_history || [],
                    sessions: g.sessions || [],
                    summaries: g.summaries || []
                }));

                // Proteção contra deleções pendentes
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
                    if (pendingDeletes.size > 0) {
                        logger.info(`[GoalProvider] 🛡️ Found ${pendingDeletes.size} pending deletions`);
                    }
                } catch (e) {
                    logger.error("[GoalProvider] Error reading sync queue", e);
                }

                // Filtrar blacklist
                const nonBlacklisted = filterBlacklisted(normalized, 'goal');
                const blacklistedCount = normalized.length - nonBlacklisted.length;
                if (blacklistedCount > 0) {
                    logger.warn(`[GoalProvider] 🛡️ Filtered ${blacklistedCount} blacklisted goals`);
                }

                // Atualizar state com merge inteligente
                goalActions.setGoals(prevGoals => {
                    const finalGoals: Goal[] = [];
                    const processedIds = new Set<string>();
                    const goalsToMigrate: Goal[] = [];

                    // 1. Adicionar goals do servidor (filtrados)
                    nonBlacklisted.forEach(serverGoal => {
                        if (pendingDeletes.has(serverGoal.id)) {
                            logger.info(`🛡️ Blocked zombie goal: ${serverGoal.id.substring(0, 8)}...`);
                            return;
                        }
                        finalGoals.push(serverGoal);
                        processedIds.add(serverGoal.id);
                    });

                    // 2. Preservar goals locais (otimistas) e migrar se necessário
                    prevGoals.forEach(localGoal => {
                        if (!processedIds.has(localGoal.id)) {
                            const g = localGoal as any;
                            if (!g.user_id || g.user_id !== user.id) {
                                // Migrar para o usuário atual
                                const migrated = { ...localGoal, user_id: user.id };
                                goalsToMigrate.push(migrated as any);
                                finalGoals.push(migrated as any);
                            } else {
                                finalGoals.push(localGoal);
                            }
                        }
                    });

                    // 3. Enfileirar migrações
                    if (goalsToMigrate.length > 0) {
                        logger.info(`[GoalProvider] 📤 Auto-migrating ${goalsToMigrate.length} local goals`);
                        setTimeout(() => {
                            goalsToMigrate.forEach(g => {
                                SyncQueueService.enqueue({
                                    type: 'ADD',
                                    table: 'goals',
                                    data: { ...g, user_id: user.id }
                                });
                            });
                        }, 1000);
                    }

                    logger.info(`[GoalProvider] 📊 Final: ${finalGoals.length} goals (${processedIds.size} server, ${finalGoals.length - processedIds.size} local)`);
                    return finalGoals;
                });
            }
        } catch (error) {
            logger.error('[GoalProvider] ❌ Fetch error:', error);
        }
    }, [user, goalActions]);

    // 🚀 SimpleSyncService - Polling robusto a cada 5 segundos
    useEffect(() => {
        if (!user) return;

        logger.info('[GoalProvider] 🔄 Iniciando SimpleSyncService');

        // Iniciar serviço (idempotente)
        SimpleSyncService.start(user.id);

        // Inscrever listener para goals
        const unsubscribe = SimpleSyncService.subscribe({
            onGoalsUpdate: (goals) => {
                logger.info(`[GoalProvider] 📥 SimpleSyncService atualizou ${goals.length} goals`);
                goalActions.setGoals(goals);
            }
        });

        return () => {
            logger.info('[GoalProvider] 🔌 Removendo listener do SimpleSyncService');
            unsubscribe();
        };
    }, [user, goalActions]);

    return (
        <GoalContext.Provider value={goalActions}>
            {children}
        </GoalContext.Provider>
    );
};
