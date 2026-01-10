import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { BackupData } from '../utils/exportData';

interface DataManagementParams {
    user: any;
    taskCtx: any;
    goalCtx: any;
    themeCtx: any;
    gamificationCtx: any;
    appCtx: any;
}

/**
 * Hook para gerenciar operações de dados globais: Reset e Backup/Restore.
 * Retirado do StudyProvider para manter SRP.
 */
export const useDataManagement = ({
    user,
    taskCtx,
    goalCtx,
    themeCtx,
    gamificationCtx,
    appCtx
}: DataManagementParams) => {

    const resetAccount = useCallback(async () => {
        if (!user) return;

        const { error: tErrors } = await supabase.from('tasks').delete().eq('user_id', user.id);
        const { error: gErrors } = await supabase.from('goals').delete().eq('user_id', user.id);
        const { error: thErrors } = await supabase.from('themes').delete().eq('user_id', user.id);

        if (tErrors || gErrors || thErrors) {
            console.error("Error resetting account data:", tErrors, gErrors, thErrors);
            alert("Erro ao excluir dados do servidor. Tente novamente.");
            return;
        }

        taskCtx.setTasks([]);
        goalCtx.setGoals([]);
        themeCtx.setThemes([]);
        await gamificationCtx.resetGamification();

        localStorage.clear();
        window.location.reload();
    }, [user, taskCtx, goalCtx, themeCtx, gamificationCtx]);

    const restoreBackup = useCallback(async (data: BackupData) => {
        if (!user) throw new Error('Usuário não autenticado');

        const { validateBackupData } = await import('../utils/exportData');
        const validation = validateBackupData(data);
        if (!validation.valid) throw new Error(validation.error || 'Dados de backup inválidos');

        // Safety backup
        const currentBackup = {
            timestamp: new Date().toISOString(),
            themes: themeCtx.themes,
            tasks: taskCtx.tasks,
            goals: goalCtx.goals,
            gamification: gamificationCtx.gamification,
            zenMode: appCtx.zenMode
        };
        localStorage.setItem('study_backup_before_restore', JSON.stringify(currentBackup));

        try {
            await supabase.from('tasks').delete().eq('user_id', user.id);
            await supabase.from('goals').delete().eq('user_id', user.id);
            await supabase.from('themes').delete().eq('user_id', user.id);

            // Inserção em lote (Poderia ser abstraído, mas mantendo lógica original refatorada)
            for (const theme of data.themes) {
                const { subthemes, createdAt, ...themeData } = theme;
                await supabase.from('themes').insert({
                    ...themeData,
                    user_id: user.id,
                    created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
                });

                for (const sub of subthemes) {
                    const { durationMinutes, timeSpent, ...subData } = sub;
                    await supabase.from('subthemes').insert({
                        ...subData,
                        duration_minutes: durationMinutes,
                        time_spent: timeSpent,
                        user_id: user.id
                    });
                }
            }

            for (const task of data.tasks) {
                const { createdAt, startDate, endDate, imageUrl, durationMinutes, timeSpent, completionHistory, ...taskData } = task;
                await supabase.from('tasks').insert({
                    ...taskData,
                    start_date: startDate,
                    end_date: endDate,
                    image_url: imageUrl,
                    duration_minutes: durationMinutes,
                    time_spent: timeSpent,
                    completion_history: completionHistory,
                    user_id: user.id,
                    created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
                });
            }

            for (const goal of data.goals) {
                const { createdAt, imageUrl, durationMinutes, timeSpent, completionHistory, relatedThemeId, isHabit, startDate, ...goalData } = goal;
                await supabase.from('goals').insert({
                    ...goalData,
                    image_url: imageUrl,
                    duration_minutes: durationMinutes,
                    time_spent: timeSpent,
                    completion_history: completionHistory,
                    related_theme_id: relatedThemeId,
                    is_habit: isHabit,
                    start_date: startDate,
                    user_id: user.id,
                    created_at: createdAt ? new Date(createdAt).toISOString() : new Date().toISOString()
                });
            }

            if (data.gamification) {
                await supabase.from('gamification').upsert({ user_id: user.id, ...data.gamification });
            }

            themeCtx.setThemes(data.themes);
            taskCtx.setTasks(data.tasks);
            goalCtx.setGoals(data.goals);

            window.location.reload();
        } catch (error) {
            const safetyBackup = localStorage.getItem('study_backup_before_restore');
            if (safetyBackup) {
                const oldData = JSON.parse(safetyBackup);
                themeCtx.setThemes(oldData.themes);
                taskCtx.setTasks(oldData.tasks);
                goalCtx.setGoals(oldData.goals);
            }
            throw error;
        }
    }, [user, themeCtx, taskCtx, goalCtx, gamificationCtx, appCtx]);

    return { resetAccount, restoreBackup };
};
