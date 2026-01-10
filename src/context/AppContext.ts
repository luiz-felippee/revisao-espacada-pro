import { createContext, useContext } from 'react';

export interface ActiveFocusSession {
    id: string;
    type: 'task' | 'goal' | 'subtheme';
    title: string;
    duration: number;
    startTime: number;
    reviewNumber?: number;
    reviewType?: 'review' | 'intro';
    parentId?: string;
}

export interface AppContextType {
    activeFocus: ActiveFocusSession | null;
    loading: boolean;
    syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
    startFocus: (id: string, type: 'task' | 'goal' | 'subtheme', title: string, duration: number, reviewNumber?: number, reviewType?: 'review' | 'intro', parentId?: string) => void;
    endFocus: (completed: boolean, checkId?: string) => void;
    zenMode: boolean;
    toggleZenMode: () => void;
    unlockedSubthemes: string[];
    activeStudySession: string | null;
    startStudySession: (subthemeId: string) => void;
    endStudySession: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useApp must be used within AppProvider');
    return context;
};

export const useAppContext = useApp;
