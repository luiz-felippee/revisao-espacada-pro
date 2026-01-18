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
                            // serverTheme.subthemes already has the structure, we can just map simple array check via filterBlacklisted helper
                            // But helper expects T[], so we can cast or just use inline check if helper is not subtheme aware
                            // Let's use helper for consistency
                            finalSubthemes = filterBlacklisted(finalSubthemes, 'subtheme');

                            // Also filter pending sync queue deletes
                            finalSubthemes = finalSubthemes.filter((st: Subtheme) => !pendingSubthemeDeletes.has(st.id));


                            if (localTheme) {
                                // --- SMART SUBTHEME MERGE ---
                                // 1. If server has 0 subthemes but local has them, this is likely a sync glitch or latency.
                                //    KEEP local subthemes to prevent "zeroing".
                                if (serverTheme.subthemes.length === 0 && localTheme.subthemes.length > 0) {
                                    logger.warn(`[SmartMerge] Preserving ${localTheme.subthemes.length} local subthemes for theme ${serverTheme.title} (Server returned 0)`);
                                    finalSubthemes = localTheme.subthemes;
                                }
                                else {
                                    // 2. Union Merge: Keep local-only items (optimistic adds) + Server updates
                                    const subthemeMap = new Map<string, Subtheme>();

                                    // Start with Local (preserves un-synced added items)
                                    // But ignore if they are pending delete locally (already handled by useThemes deleteSubtheme logic which updates state)
                                    localTheme.subthemes.forEach(st => subthemeMap.set(st.id, st));

                                    // Overlay Server (Source of Truth for synced items)
                                    // serverTheme.subthemes are technically arrays from server.
                                    // We must check if any server subtheme is in pendingSubthemeDeletes (already filtered above in finalSubthemes assignment)
                                    // So we overlay the filtered server subthemes.
                                    serverTheme.subthemes.forEach((st: Subtheme) => {
                                        if (!pendingSubthemeDeletes.has(st.id)) {
                                            subthemeMap.set(st.id, st);
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

                        // 2. Preserve Local-Only Themes (Optimistic Adds not yet on server)
                        prevThemes.forEach(localTheme => {
                            if (!processedIds.has(localTheme.id)) {
                                finalThemes.push(localTheme);
                            }
                        });

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

