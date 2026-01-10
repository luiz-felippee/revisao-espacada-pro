import { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import type { Task } from '../types';
import type { User } from '../types/sync';
import type { GamificationState, GameStats } from '../types/gamification';
import { TaskSchema } from '../lib/validation';
import { SyncQueueService } from '../services/SyncQueueService';
import { XP_VALUES } from '../config/gamification.config';
import { celebrate } from '../utils/celebration';
import { format } from 'date-fns';
import { parseLocalDate } from '../utils/dateHelpers';
import { useToast } from '../context/ToastContext';
import { addCompletionSummary } from '../utils/summaries';
import { addToBlacklist, removeFromBlacklist } from '../utils/deletedItemsBlacklist';

interface UseTasksProps {
    user: User | null;
    gamification: GamificationState;
    awardXP: (amount: number) => void;
    updateStats: (updates: Partial<GameStats>) => void;
}

export const useTasks = ({ user, gamification, awardXP, updateStats }: UseTasksProps) => {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState<Task[]>(() => {
        try {
            const saved = localStorage.getItem('study_tasks_backup');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            logger.error("Failed to parse study_tasks_backup", e);
            return [];
        }
    });

    useEffect(() => {
        // Update primary backup
        localStorage.setItem('study_tasks_backup', JSON.stringify(tasks));

        // 🛡️ CLEANUP: Remove orphaned keys from old versions
        // This prevents zombie resurrections from abandoned localStorage keys
        const orphanedKeys = ['study_tasks', 'study-panel-tasks', 'tasks_backup'];
        orphanedKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                logger.info(`🧹 Cleaning orphaned localStorage key: ${key}`);
                localStorage.removeItem(key);
            }
        });
    }, [tasks]);

    const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
        if (!user) {
            showToast("Erro: Usuário não identificado. Tente recarregar a página.", "error");
            return;
        }
        // Validation
        const val = TaskSchema.omit({ id: true }).safeParse(task);
        if (!val.success) {
            showToast("Erro: " + val.error.issues[0].message, "error");
            return;
        }

        const taskData = { ...task };
        // If a 'day' task has no date, default to today
        if (taskData.type === 'day' && !taskData.date) {
            taskData.date = format(new Date(), 'yyyy-MM-dd');
        }
        // Validate date for 'day' tasks: cannot be in the future
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        if (taskData.type === 'day' && taskData.date && taskData.date > todayStr) {
            showToast('Data da tarefa não pode ser no futuro.', 'error');
            return;
        }

        const newTask: Task = {
            ...taskData,
            id: crypto.randomUUID(),
            createdAt: Date.now(),
            status: 'pending',
            completionHistory: [],
            sessions: [],
            timeSpent: 0
        };

        // 1. Optimistic UI Update
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);

        // 2. Queue for Sync
        if (user) {
            SyncQueueService.enqueue({
                type: 'ADD',
                table: 'tasks',
                data: { ...newTask, user_id: user.id }
            });
        }

        awardXP(XP_VALUES.TASK * 0.1);

        // Use the previously defined todayStr
        const itemDate = newTask.date || (newTask.startDate ? newTask.startDate.split('T')[0] : '');
        if (itemDate > todayStr) {
            showToast(`Missão agendada para ${format(parseLocalDate(itemDate), 'dd/MM')}!`, "success");
        } else {
            showToast("Missão criada com sucesso!", "success");
        }
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        const val = TaskSchema.partial().safeParse(updates);
        if (!val.success) return;

        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));

        if (!user) return;
        SyncQueueService.enqueue({
            type: 'UPDATE',
            table: 'tasks',
            data: { id, ...updates, user_id: user.id }
        });
    };

    const deleteTask = async (taskId: string) => {
        logger.info(`🗑️ deleteTask called for ID: ${taskId}`);
        // Optimistic UI removal
        const previous = [...tasks];
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        setTasks(updatedTasks);

        // 🔥 CRITICAL: Force IMMEDIATE localStorage update
        // This prevents async race conditions that cause zombie resurrections
        localStorage.setItem('study_tasks_backup', JSON.stringify(updatedTasks));
        logger.info(`💾 Forced localStorage update: ${updatedTasks.length} tasks remaining`);

        // 🚫 NUCLEAR OPTION: Add to permanent blacklist
        // This ensures the item NEVER comes back, even if Supabase fails
        addToBlacklist(taskId, 'task');

        showToast('Tarefa excluída com sucesso!', 'success');
        // Queue delete operation
        try {
            logger.info(`📤 Queueing DELETE operation for task: ${taskId}`);
            if (user) {
                SyncQueueService.enqueue({
                    type: 'DELETE',
                    table: 'tasks',
                    data: { id: taskId, user_id: user.id }
                });
            }
            logger.info(`✅ DELETE enqueued successfully for task: ${taskId}`);
        } catch (error) {
            logger.error('❌ Error enqueuing delete operation:', error);
            // Rollback UI state AND blacklist on failure
            setTasks(previous);
            localStorage.setItem('study_tasks_backup', JSON.stringify(previous));
            removeFromBlacklist(taskId, 'task');
            showToast('Erro ao excluir tarefa.', 'error');
        }
    };
    const toggleTask = async (taskId: string, dateStr?: string, summaryText?: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const now = new Date();
        const todayStr = format(now, 'yyyy-MM-dd');
        const date = dateStr || todayStr;

        // PRIORIDADE MÁXIMA: Bloquear dias futuros
        if (date > todayStr) {
            showToast("Você não pode concluir atividades de dias futuros!", "error");
            return;
        }
        let updates: Partial<Task> = {};
        let xpAwarded = 0;
        let isCompletedAction = false;

        if (task.type === 'period' || task.type === 'recurring') {
            const history = task.completionHistory || [];
            const hasCompletedTargetDate = history.some(d => d.startsWith(date));

            let newHistory;
            if (hasCompletedTargetDate) {
                newHistory = history.filter(d => !d.startsWith(date));
            } else {
                const completionIso = `${date}T${format(now, 'HH:mm:ss.SSS')}`;
                newHistory = [...history, completionIso];
                xpAwarded = XP_VALUES.TASK;
                isCompletedAction = true;
            }
            updates = { completionHistory: newHistory };

            // Adicionar resumo para tarefas de período/recorrentes
            if (isCompletedAction) {
                const currentSummaries = task.summaries || [];
                updates.summaries = addCompletionSummary(
                    currentSummaries,
                    summaryText || `Tarefa concluída em ${format(now, 'dd/MM/yyyy \'às\' HH:mm')}`,
                    'general',
                    { id: task.id, type: 'task', title: task.title }
                );
            }
        } else {
            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            const history = task.completionHistory || [];
            let newHistory = history;

            if (newStatus === 'completed') {
                const completionIso = `${format(now, 'yyyy-MM-dd')}T${format(now, 'HH:mm:ss.SSS')}`;
                newHistory = [...history, completionIso];
                xpAwarded = XP_VALUES.TASK;
                isCompletedAction = true;
            } else {
                const todayStr = format(now, 'yyyy-MM-dd');
                newHistory = history.filter(h => !h.startsWith(todayStr));
            }

            updates = {
                status: newStatus,
                completionHistory: newHistory
            };

            // Adicionar resumo para tarefas simples/dia
            if (newStatus === 'completed') {
                const currentSummaries = task.summaries || [];
                updates.summaries = addCompletionSummary(
                    currentSummaries,
                    summaryText || `Tarefa "${task.title}" concluída com sucesso!`,
                    'general',
                    { id: task.id, type: 'task', title: task.title }
                );
            }
        }

        // 1. Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));

        // 2. Side Effects
        if (isCompletedAction && xpAwarded > 0) {
            awardXP(xpAwarded);
            updateStats({ tasksCompleted: (gamification.stats?.tasksCompleted || 0) + 1 });
            celebrate();
        }

        // 3. Queue Sync
        if (user) {
            SyncQueueService.enqueue({
                type: 'UPDATE',
                table: 'tasks',
                data: { id: taskId, ...updates, user_id: user.id }
            });
        }
    };

    return {
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask
    };
};
