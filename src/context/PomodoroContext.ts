import { createContext, useContext } from 'react';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
    mode: PomodoroMode;
    isActive: boolean;
    cycles: number;
    linkedItemId: string | null;
    isWidgetVisible: boolean;
    settings: {
        focusDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        strictMode: boolean;
    };
}

export interface PomodoroActions {
    toggleTimer: () => void;
    resetTimer: () => void;
    skipTimer: () => void;
    startFocusSession: (itemId: string, type: 'task' | 'goal' | 'subtheme', title: string, durationMinutes?: number, reviewNumber?: number, reviewType?: 'review' | 'intro', parentId?: string) => void;
    closeWidget: () => void;
    openWidget: () => void;
    updateSettings: (settings: {
        focusDuration: number;
        shortBreakDuration: number;
        longBreakDuration: number;
        strictMode: boolean;
    }) => void;
}

export type PomodoroContextType = PomodoroState & PomodoroActions & { timeLeft: number };

// Split Contexts
export const PomodoroStateContext = createContext<(PomodoroState & PomodoroActions) | undefined>(undefined);
export const PomodoroTimeContext = createContext<number | undefined>(undefined);

export const usePomodoroState = () => {
    const context = useContext(PomodoroStateContext);
    if (context === undefined) {
        throw new Error('usePomodoroState must be used within a PomodoroProvider');
    }
    return context;
};

export const usePomodoroTime = () => {
    const context = useContext(PomodoroTimeContext);
    if (context === undefined) {
        throw new Error('usePomodoroTime must be used within a PomodoroProvider');
    }
    return context;
};

// Legacy/Combined Hook (Careful: Re-renders on time tick!)
export const usePomodoroContext = () => {
    const state = usePomodoroState();
    const timeLeft = usePomodoroTime();
    return { ...state, timeLeft };
};

export const usePomodoro = usePomodoroContext; // Alias
