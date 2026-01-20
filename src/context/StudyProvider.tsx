import React, { useMemo } from 'react';
import { GamificationProvider } from './GamificationProvider';
import { useGamification } from './GamificationContext';
import { useAuth } from './AuthContext';
import { TaskProvider } from './TaskProvider';
import { useTaskContext } from './TaskContext';
import { GoalProvider } from './GoalProvider';
import { useGoalContext } from './GoalContext';
import { ThemeProvider } from './ThemeProvider';
import { useThemeContext } from './ThemeContext';
import { AppProvider } from './AppProvider';
import { useAppContext } from './AppContext';
import { useNotificationWatcher } from '../hooks/useNotificationWatcher';
import { useFocusActions } from '../hooks/useFocusActions';
import { useDataManagement } from '../hooks/useDataManagement';
import { StudyContext, type StudyContextType } from './StudyContext';

const StudyContextFacade: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const gamificationCtx = useGamification();
    const taskCtx = useTaskContext();
    const goalCtx = useGoalContext();
    const themeCtx = useThemeContext();
    const appCtx = useAppContext();
    const { user } = useAuth();

    // Hooks de domínio extraídos para Clean Code (SRP)
    useNotificationWatcher({ themes: themeCtx.themes, tasks: taskCtx.tasks, goals: goalCtx.goals });

    const {
        logTime,
        endFocus
    } = useFocusActions({ user, appCtx, taskCtx, goalCtx, themeCtx, gamificationCtx });

    const {
        resetAccount,
        restoreBackup
    } = useDataManagement({ user, taskCtx, goalCtx, themeCtx, gamificationCtx, appCtx });

    const value: StudyContextType = useMemo(() => ({
        settings: { username: 'Estudante', focusTime: 25 },
        ...appCtx,
        ...gamificationCtx,
        ...taskCtx,
        ...goalCtx,
        ...themeCtx,
        logTime,
        endFocus,
        resetAccount,
        restoreBackup,
        updateSubtheme: themeCtx.updateSubtheme,
        clearSyncQueue: () => {
            // Implementação futura ou remover se não usado
        },
    }), [
        appCtx,
        gamificationCtx,
        taskCtx,
        goalCtx,
        themeCtx,
        logTime,
        endFocus,
        resetAccount,
        restoreBackup
    ]);

    return (
        <StudyContext.Provider value={value}>
            {children}
        </StudyContext.Provider>
    );
};

import { ContextComposer } from '../components/utils/ContextComposer';

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ContextComposer providers={[
            <AppProvider children={null} />,
            <GamificationProvider children={null} />,
            <TaskProvider children={null} />,
            <GoalProvider children={null} />,
            <ThemeProvider children={null} />
        ]}>
            <StudyContextFacade>
                {children}
            </StudyContextFacade>
        </ContextComposer>
    );
};

