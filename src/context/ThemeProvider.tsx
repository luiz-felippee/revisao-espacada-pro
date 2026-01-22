import React, { useEffect, useCallback } from 'react';
import { logger } from '../utils/logger';
import { useAuth } from './AuthContext';
import { useGamification } from './GamificationContext';
import { useThemes } from '../hooks/useThemes';
import type { Theme, Subtheme } from '../types';
import { supabase } from '../lib/supabase';
import { useAudio } from './AudioContext';
import { ThemeContext } from './ThemeContext';
import { filterBlacklisted } from '../utils/deletedItemsBlacklist';
import { SyncQueueService } from '../services/SyncQueueService';
import { SimpleSyncService } from '../services/SimpleSyncService';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { gamification, awardXP, updateStats } = useGamification();
    const { playSFX } = useAudio();

    const themeActions = useThemes({
        user,
        gamification,
        awardXP,
        updateStats,
        playSFX
    });

    /**
     * Busca todos os themes e subthemes do usuário no Supabase
     */
    const fetchThemes = useCallback(async () => {
        if (!user) return;

        logger.info(`[ThemeProvider] 🔄 Fetching themes for user: ${user.id.substring(0, 8)}...`);

        try {
            const { data: themesData, error: themesError } = await supabase
                .from('themes')
                .select('*, subthemes(*)')
                .eq('user_id', user.id)
                .order('order_index', { foreignTable: 'subthemes', ascending: true });

            if (themesError) {
                logger.error('[ThemeProvider] ❌ Failed to fetch themes:', themesError);
                return;
            }

            if (themesData) {
                logger.info(`[ThemeProvider] ✅ Fetched ${themesData.length} themes from Supabase`);

                // Normalizar campos do banco para o formato da aplicação
                const normalized = themesData.map(t => ({
                    ...t,
                    createdAt: new Date(t.created_at).getTime(),
                    imageUrl: t.image_url,
                    startDate: t.start_date,
                    summaries: t.summaries || [],
                    subthemes: (t.subthemes || []).map((st: any) => ({
                        ...st,
                        themeId: st.theme_id,
                        durationMinutes: st.duration_minutes,
                        timeSpent: st.time_spent || 0,
                        summaries: st.summaries || []
                    }))
                }));

                // Proteção contra deleções pendentes
                const pendingThemeDeletes = new Set<string>();
                const pendingSubthemeDeletes = new Set<string>();

                try {
                    const queueRaw = localStorage.getItem('sync_queue_v1');
                    if (queueRaw) {
                        const queue = JSON.parse(queueRaw);
                        if (Array.isArray(queue)) {
                            queue.forEach((op: { type: string; table: string; data?: { id?: string } }) => {
                                if (op.type === 'DELETE' && op.data?.id) {
                                    if (op.table === 'themes') pendingThemeDeletes.add(op.data.id);
                                    if (op.table === 'subthemes') pendingSubthemeDeletes.add(op.data.id);
                                }
                            });
                        }
                    }
                    if (pendingThemeDeletes.size > 0 || pendingSubthemeDeletes.size > 0) {
                        logger.info(`[ThemeProvider] 🛡️ Found pending deletions - themes: ${pendingThemeDeletes.size}, subthemes: ${pendingSubthemeDeletes.size}`);
                    }
                } catch (e) {
                    logger.error("[ThemeProvider] Error reading sync queue", e);
                }

                // Filtrar blacklist de themes
                const nonBlacklistedThemes = filterBlacklisted(normalized, 'theme');

                // Atualizar state com merge inteligente
                themeActions.setThemes(prevThemes => {
                    const finalThemes: Theme[] = [];
                    const processedIds = new Set<string>();
                    const themesToMigrate: Theme[] = [];
                    const subthemesToMigrate: Subtheme[] = [];

                    // 1. Processar themes do servidor
                    nonBlacklistedThemes.forEach((serverTheme: Theme) => {
                        if (pendingThemeDeletes.has(serverTheme.id)) {
                            logger.info(`🛡️ Blocked zombie theme: ${serverTheme.id.substring(0, 8)}...`);
                            return;
                        }

                        processedIds.add(serverTheme.id);
                        const localTheme = prevThemes.find(t => t.id === serverTheme.id);

                        // Filtrar subthemes contra blacklist e pendentes
                        let finalSubthemes = filterBlacklisted(serverTheme.subthemes, 'subtheme');
                        finalSubthemes = finalSubthemes.filter(st => !pendingSubthemeDeletes.has(st.id));

                        // Merge com subthemes locais se servidor veio vazio
                        if (localTheme && serverTheme.subthemes.length === 0 && localTheme.subthemes.length > 0) {
                            logger.warn(`[ThemeProvider] 📦 Preserving ${localTheme.subthemes.length} local subthemes`);
                            finalSubthemes = localTheme.subthemes;

                            // Marcar para migração
                            localTheme.subthemes.forEach(st => {
                                const s = st as any;
                                if (!s.user_id || s.user_id !== user.id) {
                                    subthemesToMigrate.push({ ...st, user_id: user.id } as any);
                                }
                            });
                        }

                        finalThemes.push({
                            ...serverTheme,
                            subthemes: finalSubthemes
                        });
                    });

                    // 2. Preservar themes locais e migrar se necessário
                    prevThemes.forEach(localTheme => {
                        if (!processedIds.has(localTheme.id)) {
                            const t = localTheme as any;
                            if (!t.user_id || t.user_id !== user.id) {
                                // Migrar theme e subthemes
                                const migratedTheme = { ...localTheme, user_id: user.id };
                                themesToMigrate.push(migratedTheme as any);

                                const migratedSubthemes = localTheme.subthemes.map(st => {
                                    const migrated = { ...st, user_id: user.id, theme_id: localTheme.id };
                                    subthemesToMigrate.push(migrated as any);
                                    return migrated;
                                });

                                finalThemes.push({ ...migratedTheme, subthemes: migratedSubthemes } as any);
                            } else {
                                finalThemes.push(localTheme);
                            }
                        }
                    });

                    // 3. Enfileirar migrações
                    if (themesToMigrate.length > 0 || subthemesToMigrate.length > 0) {
                        logger.info(`[ThemeProvider] 📤 Auto-migrating ${themesToMigrate.length} themes and ${subthemesToMigrate.length} subthemes`);
                        setTimeout(() => {
                            themesToMigrate.forEach(t => {
                                SyncQueueService.enqueue({
                                    type: 'ADD',
                                    table: 'themes',
                                    data: { ...t, user_id: user.id }
                                });
                            });

                            subthemesToMigrate.forEach(st => {
                                SyncQueueService.enqueue({
                                    type: 'ADD',
                                    table: 'subthemes',
                                    data: { ...st, user_id: user.id, theme_id: (st as any).themeId || (st as any).theme_id },
                                    dependentOn: (st as any).themeId || (st as any).theme_id
                                });
                            });
                        }, 1000);
                    }

                    logger.info(`[ThemeProvider] 📊 Final: ${finalThemes.length} themes (${processedIds.size} server, ${finalThemes.length - processedIds.size} local)`);
                    return finalThemes;
                });
            }
        } catch (error) {
            logger.error('[ThemeProvider] ❌ Fetch error:', error);
        }
    }, [user, themeActions]);

    // 🚀 SimpleSyncService - Polling robusto a cada 5 segundos
    useEffect(() => {
        if (!user) return;

        logger.info('[ThemeProvider] 🔄 Iniciando SimpleSyncService');

        // Iniciar serviço (idempotente)
        SimpleSyncService.start(user.id);

        // Inscrever listener para themes
        const unsubscribe = SimpleSyncService.subscribe({
            onThemesUpdate: (themes) => {
                logger.info(`[ThemeProvider] 📥 SimpleSyncService atualizou ${themes.length} themes`);
                themeActions.setThemes(themes);
            }
        });

        return () => {
            logger.info('[ThemeProvider] 🔌 Removendo listener do SimpleSyncService');
            unsubscribe();
        };
    }, [user, themeActions]);

    return (
        <ThemeContext.Provider value={themeActions}>
            {children}
        </ThemeContext.Provider>
    );
};
