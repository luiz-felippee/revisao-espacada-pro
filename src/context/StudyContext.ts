import { createContext, useContext } from 'react';
import type { AppState, Theme, Task, Goal } from '../types';
import type { Achievement, GamificationState } from '../types/gamification';
import type { ActiveFocusSession } from './AppContext';

export interface StudyContextType extends AppState {
    activeFocus: ActiveFocusSession | null;
    loading: boolean;
    syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
    startFocus: (id: string, type: 'task' | 'goal' | 'subtheme', title: string, duration: number, reviewNumber?: number, reviewType?: 'review' | 'intro', parentId?: string) => void;
    endFocus: (completed: boolean, summary?: string) => void;

    zenMode: boolean;
    toggleZenMode: () => void;

    gamification: GamificationState;
    newlyUnlocked: Achievement | null;
    dismissAchievement: () => void;

    addTheme: (title: string, subthemes: { title: string; duration?: number }[], options?: { icon?: string, imageUrl?: string, color?: string, priority?: 'low' | 'medium' | 'high', startDate?: string, deadline?: string, category?: 'study' | 'project', subtitle?: string }) => void;
    addSubtheme: (themeId: string, title: string, duration?: number) => Promise<void>;
    deleteSubtheme: (themeId: string, subthemeId: string) => Promise<void>;
    deleteTheme: (themeId: string) => void;
    updateTheme: (id: string, updates: Partial<Theme>) => void;
    completeReview: (subthemeId: string, reviewNumber?: number, type?: 'review' | 'intro', difficulty?: 'easy' | 'medium' | 'hard', summary?: string) => Promise<void>;
    updateSubthemeContent: (subthemeId: string, content: string) => Promise<void>;
    updateSubtheme: (subthemeId: string, updates: Partial<import('../types').Subtheme>) => Promise<void>;

    // Study Session (Flashcards)
    activeStudySession: string | null;
    startStudySession: (subthemeId: string) => void;
    endStudySession: () => void;

    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    deleteTask: (taskId: string) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    toggleTask: (taskId: string, date?: string, summaryText?: string) => void;

    addGoal: (goal: Omit<Goal, 'id' | 'progress' | 'createdAt'>) => void;
    deleteGoal: (goalId: string) => void;
    updateGoal: (id: string, updates: Partial<Goal>) => void;
    toggleGoal: (goalId: string, date?: string, summaryText?: string) => void;
    toggleGoalItem: (goalId: string, itemId: string, date?: string, summaryText?: string) => void;

    logTime: (id: string, type: 'task' | 'goal' | 'subtheme', minutes: number) => void;
    resetAccount: () => Promise<void>;
    resetGamification: () => Promise<void>;
    clearSyncQueue: () => void;
    restoreBackup: (data: import('../utils/exportData').BackupData) => Promise<void>;
    unlockedSubthemes: string[];
}

export const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const useStudy = () => {
    const context = useContext(StudyContext);
    if (!context) throw new Error('useStudy must be used within StudyProvider');
    return context;
};
