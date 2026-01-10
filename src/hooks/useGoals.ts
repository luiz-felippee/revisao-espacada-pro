import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import type { Goal } from '../types';
import type { User } from '../types/sync';
import type { GamificationState, GameStats } from '../types/gamification';
import { GoalSchema } from '../lib/validation';
import { SyncQueueService } from '../services/SyncQueueService';
import { XP_VALUES } from '../config/gamification.config';
import { celebrate } from '../utils/celebration';
import { format } from 'date-fns';
import { useToast } from '../context/ToastContext';
import { addGoalProgressSummary, addCompletionSummary } from '../utils/summaries';
import { addToBlacklist, removeFromBlacklist } from '../utils/deletedItemsBlacklist';

interface UseGoalsProps {
    user: User | null;
    gamification: GamificationState;
    awardXP: (amount: number) => void;
    updateStats: (updates: Partial<GameStats>) => void;
}

export const useGoals = ({ user, gamification: _gamification, awardXP, updateStats: _updateStats }: UseGoalsProps) => {
    const { showToast } = useToast();
    const [goals, setGoals] = useState<Goal[]>(() => {
        try {
            const saved = localStorage.getItem('study_goals_backup');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            logger.error("Failed to parse study_goals_backup", e);
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('study_goals_backup', JSON.stringify(goals));

        // 🛡️ CLEANUP: Remove orphaned keys
        const orphanedKeys = ['study_goals', 'study-panel-goals', 'goals_backup'];
        orphanedKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                logger.info(`🧹 Cleaning orphaned localStorage key: ${key}`);
                localStorage.removeItem(key);
            }
        });
    }, [goals]);

    const addGoal = async (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => {
        if (!user) {
            showToast("Erro: Usuário não identificado.", "error");
            return;
        }
        // Validation
        const val = GoalSchema.omit({ id: true, progress: true }).safeParse(goal);
        if (!val.success) {
            showToast("Erro: " + val.error.issues[0].message, "error");
            return;
        }

        const newGoal: Goal = {
            ...goal,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            progress: 0,
            completionHistory: [],
            sessions: [],
            timeSpent: 0
        };

        // 1. Optimistic Update
        const updatedGoals = [...goals, newGoal];
        setGoals(updatedGoals);

        awardXP(XP_VALUES.GOAL * 0.1);

        // 2. Queue Sync
        SyncQueueService.enqueue({
            type: 'ADD',
            table: 'goals',
            data: { ...newGoal, user_id: user.id }
        });

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (newGoal.startDate && newGoal.startDate > todayStr) {
            showToast(`Meta agendada para iniciar em ${format(new Date(newGoal.startDate + 'T00:00:00'), 'dd/MM')}!`, "success");
        } else {
            showToast("Meta criada com sucesso!", "success");
        }
    };

    const deleteGoal = async (goalId: string) => {
        logger.info(`🗑️ deleteGoal called for ID: ${goalId}`);
        // Optimistic Update
        const previousGoals = [...goals];
        const updatedGoals = goals.filter(g => g.id !== goalId);
        setGoals(updatedGoals);

        // 🔥 CRITICAL: Force IMMEDIATE localStorage update
        localStorage.setItem('study_goals_backup', JSON.stringify(updatedGoals));
        logger.info(`💾 Forced localStorage update: ${updatedGoals.length} goals remaining`);

        // 🚫 NUCLEAR OPTION: Add to permanent blacklist
        addToBlacklist(goalId, 'goal');

        showToast("Meta excluída com sucesso!", "success");

        try {
            // Queue Sync
            SyncQueueService.enqueue({
                type: 'DELETE',
                table: 'goals',
                data: { id: goalId }
            });
        } catch (_error) {
            setGoals(previousGoals);
            localStorage.setItem('study_goals_backup', JSON.stringify(previousGoals));
            removeFromBlacklist(goalId, 'goal');
            showToast("Erro ao excluir meta.", "error");
        }
    };

    const updateGoal = async (id: string, updates: Partial<Goal>) => {
        // Validation
        const val = GoalSchema.partial().safeParse(updates);
        if (!val.success) {
            showToast("Erro: Dados inválidos.", "error");
            return;
        }

        // Se o progresso foi atualizado, adicionar resumo
        if (updates.progress !== undefined) {
            const currentGoal = goals.find(g => g.id === id);
            if (currentGoal && currentGoal.progress !== updates.progress) {
                const currentSummaries = currentGoal.summaries || [];
                updates.summaries = addGoalProgressSummary(
                    currentSummaries,
                    updates.progress,
                    `Progresso atualizado de ${Math.round(currentGoal.progress)}% para ${Math.round(updates.progress)}%`,
                    currentGoal.category,
                    { id: currentGoal.id, type: 'goal', title: currentGoal.title }
                );
            }
        }

        setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));

        if (user) {
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'goals',
                data: { id, ...updates, user_id: user.id }
            });
        }
    };

    const toggleGoal = async (goalId: string, dateStr?: string, summaryText?: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return;

        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const date = dateStr || todayStr;

        // PRIORIDADE MÁXIMA: Bloquear dias futuros
        if (date > todayStr) {
            showToast("Você não pode concluir atividades de dias futuros!", "error");
            return;
        }
        let updates: Partial<Goal> = {};
        let xpAwarded = 0;
        let isCompletedAction = false;

        // Check history for ALL goal types to prevent XP farming
        const history = goal.completionHistory || [];
        const hasCompletedTargetDate = history.some(d => d.startsWith(date));

        if (goal.type === 'habit') {
            let newHistory;
            if (hasCompletedTargetDate) {
                // Uncheck: Deduct XP
                newHistory = history.filter(d => !d.startsWith(date));
                xpAwarded = -(XP_VALUES.GOAL / 5);
            } else {
                // Check
                const completionIso = new Date().toISOString();
                newHistory = [...history, completionIso];
                xpAwarded = XP_VALUES.GOAL / 5;
                isCompletedAction = true;
            }
            updates = { completionHistory: newHistory };

            // Update progress for UI
            const isCompletedToday = !hasCompletedTargetDate;
            updates.progress = isCompletedToday ? 100 : 0;

            // Adicionar resumo para hábitos
            if (isCompletedAction) {
                const currentSummaries = goal.summaries || [];
                updates.summaries = addCompletionSummary(
                    currentSummaries,
                    summaryText || `Hábito "${goal.title}" concluído em ${format(now, 'dd/MM/yyyy \'às\' HH:mm')}`,
                    'habit',
                    { id: goal.id, type: 'goal', title: goal.title }
                );
            }

        } else {
            // Standard Goal
            const isComplete = goal.progress >= 100;

            if (isComplete) {
                updates = { progress: 0 };
                xpAwarded = -XP_VALUES.GOAL;
            } else {
                updates = { progress: 100 };

                if (!hasCompletedTargetDate) {
                    const completionIso = new Date().toISOString();
                    updates.completionHistory = [...history, completionIso];
                    xpAwarded = XP_VALUES.GOAL;
                    isCompletedAction = true;

                    // Adicionar resumo para metas padrão
                    const currentSummaries = goal.summaries || [];
                    updates.summaries = addCompletionSummary(
                        currentSummaries,
                        summaryText || `Meta "${goal.title}" concluída com sucesso! 🎯`,
                        'goal',
                        { id: goal.id, type: 'goal', title: goal.title }
                    );
                }
            }
        }

        // 1. Optimistic Update
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));

        // 2. Side Effects
        if (xpAwarded !== 0) {
            awardXP(xpAwarded);
        }
        if (isCompletedAction) {
            celebrate();
        }

        // 3. Queue Sync
        if (user) {
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'goals',
                data: { id: goalId, ...updates, user_id: user.id }
            });
        }
    };

    const toggleGoalItem = async (goalId: string, itemId: string, dateStr?: string, summaryText?: string) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal || !goal.checklist) return;

        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const date = dateStr || todayStr;

        // PRIORIDADE MÁXIMA: Bloquear dias futuros
        if (date > todayStr) {
            showToast("Você não pode concluir atividades de dias futuros!", "error");
            return;
        }

        const updatedChecklist = goal.checklist.map(item => {
            if (item.id === itemId) {
                const isNowCompleted = !item.completed;
                return {
                    ...item,
                    completed: isNowCompleted,
                    completedAt: isNowCompleted ? new Date().toISOString() : undefined
                };
            }
            return item;
        });

        const totalItems = updatedChecklist.length;
        const completedItems = updatedChecklist.filter(i => i.completed).length;
        const newProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const updates: Partial<Goal> = {
            checklist: updatedChecklist,
            progress: newProgress
        };

        // Add summary if item completed
        const completedItem = updatedChecklist.find(i => i.id === itemId);
        if (completedItem?.completed) {
            const currentSummaries = goal.summaries || [];
            updates.summaries = addGoalProgressSummary(
                currentSummaries,
                newProgress,
                summaryText || `Item "${completedItem.title}" concluído! (${newProgress}%)`,
                goal.category,
                { id: goal.id, type: 'goal', title: goal.title }
            );
        }

        // 1. Optimistic Update
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, ...updates } : g));

        // 2. Award XP if completing an item
        const item = updatedChecklist.find(i => i.id === itemId);
        if (item?.completed) {
            awardXP(XP_VALUES.GOAL / 10);
        }

        if (user) {
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'goals',
                data: { id: goalId, ...updates, user_id: user.id }
            });
        }
    };

    return {
        goals,
        setGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        toggleGoal,
        toggleGoalItem
    };
};
