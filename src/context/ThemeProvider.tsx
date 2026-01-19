import React, { useEffect } from 'react';
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

    useEffect(() => {
        const fetchThemes = async () => {
            if (user) {
                const { data: themesData, error: themesError } = await supabase
                    .from('themes')
                    .select('*, subthemes(*)')
                    .eq('user_id', user.id)
                    .order('order_index', { foreignTable: 'subthemes', ascending: true });

                if (themesData && !themesError) {
                    const normalized = themesData.map(t => ({
                        ...t,
                        createdAt: new Date(t.created_at).getTime(),
                        imageUrl: t.image_url,
                        startDate: t.start_date,
                        summaries: t.summaries || [],
                        subthemes: t.subthemes.map((st: Subtheme & { theme_id: string; duration_minutes: number; time_spent: number }) => ({
                            ...st,
                            themeId: st.theme_id,
                            durationMinutes: st.duration_minutes,
                            timeSpent: st.time_spent || 0,
                            summaries: st.summaries || []
                        }))
                    }));

                    // --- ROBUST DELETION PROTECTION ---
                    const pendingDeletes = new Set<string>();
                    const pendingSubthemeDeletes = new Set<string>();
                    let deletedIds = new Set<string>();

                    try {
                        const storedDeleted = localStorage.getItem('deleted_theme_ids');
                        if (storedDeleted) {
                            deletedIds = new Set(JSON.parse(storedDeleted));
                        }


                        const queueRaw = localStorage.getItem('sync_queue_v1');
                        if (queueRaw) {
                            const queue = JSON.parse(queueRaw);
                            if (Array.isArray(queue)) {
                                queue.forEach((op: { type: string; table: string; data?: { id?: string } }) => {
                                    if (op.type === 'DELETE' && op.data?.id) {
                                        if (op.table === 'themes') pendingDeletes.add(op.data.id);
                                        if (op.table === 'subthemes') pendingSubthemeDeletes.add(op.data.id);
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        logger.error("Error reading sync queue for theme protection", e);
                    }

                    // 🚫 NUCLEAR PROTECTION: Filter permanent blacklist
                    const nonBlacklistedThemes = filterBlacklisted(normalized, 'theme');
                    // ----------------------------------

                    themeActions.setThemes(prevThemes => {
                        // Create a map of current themes for easy lookup
                        const currentThemesMap = new Map(prevThemes.map(t => [t.id, t]));
                        const finalThemes: Theme[] = [];
                        const processedIds = new Set<string>();
                        const themesToMigrate: Theme[] = [];
                        const subthemesToMigrate: Subtheme[] = [];

                        // 1. Process Server Themes (Merge with Local)
                        nonBlacklistedThemes.forEach((serverTheme: Theme) => {
                            if (pendingDeletes.has(serverTheme.id)) {
                                logger.info(`🛡️ Blocked zombie theme resurrecion: ${serverTheme.id}`);
                                return;
                            }

                            processedIds.add(serverTheme.id);
                            const localTheme = currentThemesMap.get(serverTheme.id);

                            let finalSubthemes = serverTheme.subthemes;

                            // Filter Server Subthemes against pending deletes + BLACKLIST
                            finalSubthemes = filterBlacklisted(finalSubthemes, 'subtheme');
                            finalSubthemes = finalSubthemes.filter((st: Subtheme) => !pendingSubthemeDeletes.has(st.id));

                            if (localTheme) {
                                // --- SMART SUBTHEME MERGE ---
                                if (serverTheme.subthemes.length === 0 && localTheme.subthemes.length > 0) {
                                    logger.warn(`[SmartMerge] Preserving ${localTheme.subthemes.length} local subthemes for theme ${serverTheme.title}`);
                                    finalSubthemes = localTheme.subthemes;

                                    // Check migration for these preserved subthemes
                                    localTheme.subthemes.forEach(st => {
                                        const s = st as any;
                                        if (!s.user_id || s.user_id !== user.id) {
                                            subthemesToMigrate.push({ ...st, user_id: user.id } as any);
                                        }
                                    });
                                }
                                else {
                                    // 2. Union Merge
                                    const subthemeMap = new Map<string, Subtheme>();

                                    // Local (Migrate if needed)
                                    localTheme.subthemes.forEach(st => {
                                        subthemeMap.set(st.id, st);
                                        const s = st as any;
                                        // Only migrate if it's NOT in the server set (optimistic add)
                                        // But wait, if it IS in the server set, we don't need to migrate.
                                        // We only care about local-only items here?
                                        // Actually simplest is check if map already has it from server... 
                                        // But we iterate local first.
                                        // Let's refine: We will check migration in a separate pass or here?
                                        // We can't know if server has it yet.
                                    });

                                    // Overlay Server
                                    const serverSubthemeIds = new Set<string>();
                                    serverTheme.subthemes.forEach((st: Subtheme) => {
                                        if (!pendingSubthemeDeletes.has(st.id)) {
                                            subthemeMap.set(st.id, st);
                                            serverSubthemeIds.add(st.id);
                                        }
                                    });

                                    // Now check for migration of items that are NOT in server
                                    localTheme.subthemes.forEach(st => {
                                        if (!serverSubthemeIds.has(st.id)) {
                                            const s = st as any;
                                            if (!s.user_id || s.user_id !== user.id) {
                                                subthemesToMigrate.push({ ...st, user_id: user.id } as any);
                                            }
                                        }
                                    });

                                    finalSubthemes = Array.from(subthemeMap.values());
                                }
                            }

                            finalThemes.push({
                                ...serverTheme,
                                subthemes: finalSubthemes
                            });
                        });

                        // 2. Preserve Local-Only Themes (Optimistic Adds & Migration)
                        prevThemes.forEach(localTheme => {
                            if (!processedIds.has(localTheme.id)) {
                                const t = localTheme as any;

                                // Migration Check
                                if (!t.user_id || t.user_id !== user.id) {
                                    const migratedTheme = { ...localTheme, user_id: user.id };
                                    themesToMigrate.push(migratedTheme as any);

                                    // Also migrate its subthemes
                                    const migratedSubthemes = localTheme.subthemes.map(st => {
                                        subthemesToMigrate.push({ ...st, user_id: user.id, theme_id: localTheme.id } as any);
                                        return { ...st, user_id: user.id, theme_id: localTheme.id };
                                    });

                                    finalThemes.push({ ...migratedTheme, subthemes: migratedSubthemes } as any);
                                } else {
                                    finalThemes.push(localTheme);
                                }
                            }
                        });

                        // 3. Execute Migration
                        if (themesToMigrate.length > 0 || subthemesToMigrate.length > 0) {
                            logger.info(`[ThemeProvider] Auto-migrating ${themesToMigrate.length} themes and ${subthemesToMigrate.length} subthemes`);
                            setTimeout(() => {
                                // Enqueue Themes
                                themesToMigrate.forEach(t => {
                                    SyncQueueService.enqueue({
                                        type: 'ADD',
                                        table: 'themes',
                                        data: { ...t, user_id: user.id }
                                    });
                                });

                                // Enqueue Subthemes (with dependency)
                                subthemesToMigrate.forEach(st => {
                                    SyncQueueService.enqueue({
                                        type: 'ADD',
                                        table: 'subthemes',
                                        data: { ...st, user_id: user.id, theme_id: (st as any).themeId || (st as any).theme_id }, // Ensure theme_id
                                        dependentOn: (st as any).themeId || (st as any).theme_id
                                    });
                                });
                            }, 1000);
                        }

                        return finalThemes;
                    });
                }
            }
        };

        fetchThemes();

        // Realtime Subscription
        if (user) {
            const channel = supabase
                .channel('db-changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'themes', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        logger.info('Realtime Theme Change:', payload);
                        fetchThemes();
                    }
                )
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'subthemes', filter: `user_id=eq.${user.id}` },
                    (payload) => {
                        logger.info('Realtime Subtheme Change:', payload);
                        fetchThemes();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [user, themeActions.setThemes]);

    return (
        <ThemeContext.Provider value={themeActions}>
            {children}
        </ThemeContext.Provider>
    );
};

