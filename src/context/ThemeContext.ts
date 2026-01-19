import { createContext, useContext } from 'react';
import type { Theme } from '../types';

export interface ThemeActions {
    themes: Theme[];
    setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
    addTheme: (title: string, subthemesInit: { title: string; duration?: number; difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'module' }[], options?: { icon?: string, imageUrl?: string, color?: string, priority?: 'low' | 'medium' | 'high', startDate?: string, subtitle?: string, deadline?: string, category?: 'study' | 'project' }) => Promise<void>;
    updateTheme: (id: string, updates: Partial<Theme>) => Promise<void>;
    deleteTheme: (id: string) => Promise<void>;
    addSubtheme: (themeId: string, title: string, duration?: number) => Promise<void>;
    updateSubtheme: (subthemeId: string, updates: Partial<any>) => Promise<void>;
    deleteSubtheme: (themeId: string, subthemeId: string) => Promise<void>;
    completeReview: (subthemeId: string, reviewNumber?: number, type?: 'review' | 'intro', difficulty?: 'easy' | 'medium' | 'hard', summary?: string) => Promise<void>;
    updateSubthemeContent: (subthemeId: string, content: string) => Promise<void>;
}

export const ThemeContext = createContext<ThemeActions | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within ThemeProvider');
    }
    return context;
};
