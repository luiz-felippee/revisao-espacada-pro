import { createContext, useContext } from 'react';
import type { Theme } from '../types';

export interface ThemeActions {
    themes: Theme[];
    setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
    addTheme: (theme: Omit<Theme, 'id' | 'createdAt'>) => Promise<void>;
    updateTheme: (id: string, updates: Partial<Theme>) => Promise<void>;
    deleteTheme: (id: string) => Promise<void>;
    addSubtheme: (themeId: string, subtheme: any) => Promise<void>;
    updateSubtheme: (themeId: string, subthemeId: string, updates: any) => Promise<void>;
    deleteSubtheme: (themeId: string, subthemeId: string) => Promise<void>;
    toggleSubthemeStatus: (themeId: string, subthemeId: string) => void;
    recordStudySession: (themeId: string, subthemeId: string, minutes: number) => Promise<void>;
    markReviewComplete: (themeId: string, subthemeId: string, reviewNumber: number) => Promise<void>;
}

export const ThemeContext = createContext<ThemeActions | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};
