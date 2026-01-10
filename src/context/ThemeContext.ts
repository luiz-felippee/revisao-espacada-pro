import { createContext, useContext } from 'react';
import type { Theme } from '../types';

export interface ThemeContextType {
    themes: Theme[];
    addTheme: (title: string, subthemes: { title: string; duration?: number }[], options?: { icon?: string, imageUrl?: string, color?: string, priority?: 'low' | 'medium' | 'high', startDate?: string, deadline?: string, category?: 'study' | 'project', subtitle?: string }) => void;
    addSubtheme: (themeId: string, title: string, duration?: number) => Promise<void>;
    deleteSubtheme: (themeId: string, subthemeId: string) => Promise<void>;
    deleteTheme: (themeId: string) => void;
    updateTheme: (id: string, updates: Partial<Theme>) => void;
    completeReview: (subthemeId: string, reviewNumber?: number, type?: 'review' | 'intro', difficulty?: 'easy' | 'medium' | 'hard', summary?: string) => Promise<void>;
    updateSubthemeContent: (subthemeId: string, content: string) => Promise<void>;
    updateSubtheme: (subthemeId: string, updates: Partial<import('../types').Subtheme>) => Promise<void>;
    setThemes: React.Dispatch<React.SetStateAction<Theme[]>>;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

export const useThemeContext = useTheme;
