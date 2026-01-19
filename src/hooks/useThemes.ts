import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import type { Theme, Subtheme, Review } from '../types';
import type { User } from '../types/sync';
import type { GamificationState, GameStats } from '../types/gamification';
import { SyncQueueService } from '../services/SyncQueueService';
import { SRSService } from '../services/SRSService';
import { XP_VALUES } from '../config/gamification.config';
import { celebrate } from '../utils/celebration';
import { format } from 'date-fns';
import { parseLocalDate } from '../utils/dateHelpers';
import { useToast } from '../context/ToastContext';
import { addReviewSummary, addCompletionSummary } from '../utils/summaries';
import { addToBlacklist } from '../utils/deletedItemsBlacklist';

const calculateInitialSubthemeState = (
    startDate: string | undefined,
    idx: number,
    difficulty: string | undefined
) => {
    let introDate: string | undefined = undefined;
    let status: 'queue' | 'active' = 'queue';
    let reviews: Review[] = [];

    if (startDate && difficulty !== 'module') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const introObj = parseLocalDate(startDate);
        introObj.setDate(introObj.getDate() + idx);
        introDate = format(introObj, 'yyyy-MM-dd');

        if (idx === 0 && introDate <= todayStr) {
            status = 'active';
        }

        const offsets = [1, 2, 7, 15, 30];
        reviews = offsets.map((offset, reviewIdx) => {
            const reviewDateObj = new Date(introObj);
            reviewDateObj.setDate(reviewDateObj.getDate() + offset);
            return {
                number: reviewIdx + 1,
                date: format(reviewDateObj, 'yyyy-MM-dd'),
                status: 'pending' as const
            };
        });
    }

    return { introDate, status, reviews };
};

interface UseThemesProps {
    user: User | null;
    gamification: GamificationState;
    awardXP: (amount: number) => void;
    updateStats: (updates: Partial<GameStats>) => void;
    playSFX: (type: 'success' | 'xp' | 'achievement' | 'levelUp') => void;
}

export const useThemes = ({ user, gamification, awardXP, updateStats, playSFX }: UseThemesProps) => {
    const { showToast } = useToast();
    // Local-First State Initialization (Load backup immediately)
    const [themes, setThemes] = useState<Theme[]>(() => {
        try {
            const saved = localStorage.getItem('study_themes_backup');
            if (!saved) return [];

            const parsedThemes = JSON.parse(saved);
            return parsedThemes;
        } catch (e) {
            logger.error("Failed to parse study_themes_backup", e);
            return [];
        }
    });

    // Persist backups whenever state changes
    useEffect(() => {
        localStorage.setItem('study_themes_backup', JSON.stringify(themes));
    }, [themes]);

    // Data fetching logic moved to StudyContext

    const addTheme = async (title: string, subthemesInit: { title: string; duration?: number; difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'module' }[], options: { icon?: string, imageUrl?: string, color?: string, priority?: 'low' | 'medium' | 'high', startDate?: string, subtitle?: string, deadline?: string, category?: 'study' | 'project' } = {}) => {
        const { icon: _icon, imageUrl: _imageUrl, color, priority: _priority, startDate, deadline, category } = options;

        if (!user) {
            logger.error("Add Theme failed: No user logged in");
            showToast("Erro: Usuário não identificado. Tente recarregar a página.", "error");
            return;
        }
        // Validação básica de datas (formato YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (startDate && !dateRegex.test(startDate)) {
            showToast('Data de início inválida. Use o formato YYYY-MM-DD.', 'error');
            return;
        }
        if (deadline && !dateRegex.test(deadline)) {
            showToast('Data de término inválida. Use o formato YYYY-MM-DD.', 'error');
            return;
        }

        // 1. Create Theme Object
        const newThemeId = crypto.randomUUID();
        const newTheme: Theme = {
            id: newThemeId,
            title,
            color,
            createdAt: Date.now(),
            priority: _priority,
            icon: _icon,
            imageUrl: _imageUrl,
            startDate,
            deadline,
            category: category || 'study', // Default to study
            subthemes: []
        };

        // 2. Create Subthemes Objects
        const newSubthemes: Subtheme[] = subthemesInit.map((s, idx) => {
            const { introDate, status, reviews } = calculateInitialSubthemeState(startDate, idx, s.difficulty);

            return {
                id: crypto.randomUUID(),
                theme_id: newThemeId,
                title: s.title,
                status,
                introductionDate: introDate,
                reviews: reviews,
                sessions: [],
                durationMinutes: s.duration,
                difficulty: s.difficulty,
                order_index: idx
            };
        });

        newTheme.subthemes = newSubthemes;

        // 3. Optimistic Update with Auto-Activation
        try {
            setThemes(prev => {
                const allThemes = [...prev, newTheme];
                // Try to activate immediately if possible
                const today = SRSService.getToday();
                const result = SRSService.processDailyUpdates(allThemes, today);
                return result ? result.updatedThemes : allThemes;
            });
        } catch (e) {
            logger.error('Erro ao processar atualizações diárias:', e);
            // Reverte a inserção do tema recém criado
            setThemes(prev => prev.filter(t => t.id !== newThemeId));
            showToast('Erro ao criar tema.', 'error');
            return;
        }

        // 4. Queue Sync
        // Add Theme
        const themeOpId = crypto.randomUUID();
        const { subthemes: _subthemes, ...themeData } = newTheme;

        SyncQueueService.enqueue({
            id: themeOpId,
            type: 'ADD',
            table: 'themes',
            data: { ...themeData, user_id: user.id }
        });

        // Add Subthemes (Queue individually)
        newSubthemes.forEach((st, idx) => {
            const { durationMinutes, ...stData } = st;
            SyncQueueService.enqueue({
                type: 'ADD',
                table: 'subthemes',
                dependentOn: themeOpId,
                data: { ...stData, duration_minutes: durationMinutes, user_id: user.id, order_index: idx }
            });
        });

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (startDate && startDate > todayStr) {
            const startDateObj = new Date(startDate + 'T00:00:00');
            if (!isNaN(startDateObj.getTime())) {
                showToast(`Tema agendado para iniciar em ${format(startDateObj, 'dd/MM')}!`, "success");
            } else {
                showToast('Data de início inválida.', 'error');
            }
        } else {
            showToast("Tema criado com sucesso!", "success");
        }
    };


    const updateTheme = async (id: string, updates: Partial<Theme>) => {
        if (!user) return;
        setThemes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        SyncQueueService.enqueue({
            type: 'UPDATE',
            table: 'themes',
            data: { id, ...updates, user_id: user.id }
        });
    };

    const addSubtheme = async (themeId: string, title: string, duration?: number) => {
        if (!user) return;
        const newSub: Subtheme = {
            id: crypto.randomUUID(),
            theme_id: themeId,
            title,
            status: 'queue',
            reviews: [],
            sessions: [],
            durationMinutes: duration,
        };

        setThemes(prev => prev.map(t => t.id === themeId ? { ...t, subthemes: [...t.subthemes, newSub] } : t));

        const { durationMinutes: _durationMinutes, ...subData } = newSub;
        SyncQueueService.enqueue({
            type: 'ADD',
            table: 'subthemes',
            data: { ...subData, duration_minutes: duration, user_id: user.id }
        });
    };

    const deleteSubtheme = async (themeId: string, subthemeId: string) => {
        setThemes(prev => prev.map(t => t.id === themeId ? { ...t, subthemes: t.subthemes.filter(st => st.id !== subthemeId) } : t));

        // 🚫 BLACKLIST SUBTHEME
        addToBlacklist(subthemeId, 'subtheme');

        if (user) {
            SyncQueueService.enqueue({
                type: 'DELETE',
                table: 'subthemes',
                data: { id: subthemeId, user_id: user.id }
            });
        }
    };

    // Delete a theme and all its subthemes, ensuring no leftover data
    const deleteTheme = async (themeId: string) => {
        const previous = [...themes];
        const theme = themes.find(t => t.id === themeId);
        const subIds = theme?.subthemes.map(st => st.id) ?? [];
        // Optimistic UI removal
        setThemes(prev => prev.filter(t => t.id !== themeId));
        showToast('Tema excluído com sucesso!', 'success');
        // Enfileirar exclusões em uma única operação atômica
        try {
            if (user) {
                // Excluir tema
                SyncQueueService.enqueue({
                    type: 'DELETE',
                    table: 'themes',
                    data: { id: themeId, user_id: user.id }
                });

                // 🚫 BLACKLIST THEME
                addToBlacklist(themeId, 'theme');

                // Excluir subtemas associados
                subIds.forEach(subId => {
                    SyncQueueService.enqueue({
                        type: 'DELETE',
                        table: 'subthemes',
                        data: { id: subId, user_id: user.id }
                    });

                    // 🚫 BLACKLIST SUBTHEME (Linked)
                    addToBlacklist(subId, 'subtheme');
                });
            }
        } catch (e) {
            logger.error('Erro ao excluir tema ou subtemas:', e);
            // Reverte UI caso algo falhe
            setThemes(previous);
            showToast('Erro ao excluir tema.', 'error');
        }
    };

    const completeReview = async (
        subthemeId: string,
        reviewNumber: number = 0,
        type: 'review' | 'intro' = 'review',
        difficulty: 'easy' | 'medium' | 'hard' = 'medium',
        summary?: string
    ) => {
        if (!user) return;

        // PRIORIDADE MÁXIMA: Bloquear dias futuros
        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');

        // Centralize subtheme lookup
        const allSubthemes = themes.flatMap(t => t.subthemes);
        const subtheme = allSubthemes.find(st => st.id === subthemeId);

        if (!subtheme) return;

        // Check the specific dates
        if (type === 'review') {
            const review = subtheme.reviews.find(r => r.number === reviewNumber);
            if (review && review.date > todayStr) {
                showToast("Você não pode concluir revisões de dias futuros!", "error");
                return;
            }
        } else if (type === 'intro') {
            if (subtheme.introductionDate && subtheme.introductionDate > todayStr) {
                showToast("Você não pode iniciar estudos agendados para o futuro!", "error");
                return;
            }
        }

        let xpAwarded = 0;
        let targetSubtheme: Subtheme | null = null;

        if (type === 'intro') {
            const updatedThemes = themes.map(t => ({
                ...t,
                subthemes: t.subthemes.map(st => {
                    if (st.id === subthemeId) {
                        const updated: Subtheme = {
                            ...st,
                            status: 'active' as const,
                            introductionDate: format(new Date(), 'yyyy-MM-dd')
                        };

                        // Adicionar resumo para introdução
                        const currentSummaries = st.summaries || [];
                        updated.summaries = addCompletionSummary(
                            currentSummaries,
                            summary || `Introdução ao tema concluída em ${format(new Date(), 'dd/MM/yyyy \'às\' HH:mm')}`,
                            'study',
                            { id: st.id, type: 'theme', title: st.title }
                        );

                        targetSubtheme = updated;
                        return updated;
                    }
                    return st;
                })
            }));
            setThemes(updatedThemes);
            xpAwarded = XP_VALUES.INTRO;
        } else {
            const { updatedThemes, awarded } = SRSService.completeReview(themes, subthemeId, reviewNumber, difficulty);
            if (awarded) {
                // Adicionar resumo para revisão
                const themesWithSummary = updatedThemes.map(t => ({
                    ...t,
                    subthemes: t.subthemes.map(st => {
                        if (st.id === subthemeId) {
                            const currentSummaries = st.summaries || [];
                            const updatedSt = {
                                ...st,
                                summaries: addReviewSummary(
                                    currentSummaries,
                                    reviewNumber,
                                    summary || `Revisão espaciada ${reviewNumber} concluída com dificuldade ${difficulty === 'easy' ? 'fácil' : difficulty === 'hard' ? 'difícil' : 'média'}`,
                                    'study',
                                    { id: st.id, type: 'theme', title: st.title }
                                )
                            };
                            targetSubtheme = updatedSt;
                            return updatedSt;
                        }
                        return st;
                    })
                }));

                setThemes(themesWithSummary);
                xpAwarded = XP_VALUES.REVIEW;
            }
        }

        if (targetSubtheme) {
            const finalSubtheme = targetSubtheme as Subtheme;

            // Add summary to the specific review if provided
            if (summary && type === 'review') {
                finalSubtheme.reviews = finalSubtheme.reviews.map(r =>
                    r.number === reviewNumber ? { ...r, summary } : r
                );
            }

            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'subthemes',
                data: {
                    id: subthemeId,
                    reviews: finalSubtheme.reviews,
                    status: finalSubtheme.status,
                    introductionDate: finalSubtheme.introductionDate,
                    summaries: finalSubtheme.summaries,
                    user_id: user.id
                }
            });
        }

        if (xpAwarded > 0) {
            awardXP(xpAwarded);
            playSFX('success');
            updateStats({ reviewsCompleted: (gamification.stats?.reviewsCompleted || 0) + 1 });
            celebrate();
        }
    };

    const updateSubthemeContent = async (subthemeId: string, content: string) => {
        if (!user) return;
        // Validação de conteúdo vazio
        if (!content.trim()) {
            showToast('Conteúdo vazio não pode ser salvo.', 'error');
            return;
        }
        // Optimistic Update
        setThemes(prev => prev.map(t => {
            const found = t.subthemes.some(st => st.id === subthemeId);
            if (found) {
                return {
                    ...t,
                    subthemes: t.subthemes.map(st => st.id === subthemeId ? { ...st, text_content: content } : st)
                };
            }
            return t;
        }));

        // Sync Queue
        SyncQueueService.enqueue({
            type: 'UPDATE',
            table: 'subthemes',
            data: {
                id: subthemeId,
                text_content: content,
                user_id: user.id
            }
        });
    };

    return {
        themes,
        setThemes,
        addTheme,
        deleteTheme,
        updateTheme,
        addSubtheme,
        deleteSubtheme,
        completeReview,
        updateSubthemeContent,
        updateSubtheme: async (subthemeId: string, updates: Partial<Subtheme>) => {
            if (!user) return;

            // Optimistic Update
            setThemes(prev => prev.map(t => {
                const found = t.subthemes.some(st => st.id === subthemeId);
                if (found) {
                    return {
                        ...t,
                        subthemes: t.subthemes.map(st => st.id === subthemeId ? { ...st, ...updates } : st)
                    };
                }
                return t;
            }));

            // Sync Queue
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'subthemes',
                data: {
                    id: subthemeId,
                    ...updates,
                    user_id: user.id
                }
            });
        }
    };
};
