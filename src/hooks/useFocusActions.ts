import { useCallback } from 'react';
import { TaskFocusStrategy } from '../features/study/strategies/TaskFocusStrategy';
import { GoalFocusStrategy } from '../features/study/strategies/GoalFocusStrategy';
import { SubthemeFocusStrategy } from '../features/study/strategies/SubthemeFocusStrategy';
import type { FocusStrategy } from '../features/study/strategies/FocusStrategy';

interface FocusActionsParams {
    user: any;
    appCtx: any;
    taskCtx: any;
    goalCtx: any;
    themeCtx: any;
    gamificationCtx: any;
}

const strategies: Record<string, FocusStrategy> = {
    'task': new TaskFocusStrategy(),
    'goal': new GoalFocusStrategy(),
    'subtheme': new SubthemeFocusStrategy()
};

/**
 * Hook para gerenciar as ações de fim de foco e registro de tempo.
 * Utiliza o padrão Strategy para processar diferentes tipos de foco.
 */
export const useFocusActions = ({
    user,
    appCtx,
    taskCtx,
    goalCtx,
    themeCtx,
    gamificationCtx
}: FocusActionsParams) => {

    const logTime = useCallback((id: string, type: string, minutes: number) => {
        gamificationCtx.updateStats({
            totalFocusMinutes: (gamificationCtx.gamification.stats?.totalFocusMinutes || 0) + minutes
        });
    }, [gamificationCtx]);

    const endFocus = useCallback(async (completed: boolean, summary?: string) => {
        const currentFocus = appCtx.activeFocus;
        if (!currentFocus) {
            appCtx.endFocus(completed);
            return;
        }

        const endTime = new Date();
        const startTime = new Date(currentFocus.startTime);
        const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (60 * 1000));

        const sessionLog = {
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            durationMinutes: Math.max(1, durationMinutes),
            status: (completed ? 'completed' : 'cancelled') as 'completed' | 'cancelled',
            summary: summary
        };

        const { id, type } = currentFocus;
        const strategy = strategies[type];

        if (strategy) {
            try {
                await strategy.execute(id, sessionLog, user, { taskCtx, goalCtx, themeCtx });
            } catch (error) {
                console.error(`Error executing focus strategy for ${type}:`, error);
            }
        }

        appCtx.endFocus(completed, id);
    }, [user, appCtx, taskCtx, goalCtx, themeCtx]);

    return { logTime, endFocus };
};


